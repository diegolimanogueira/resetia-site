"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { EtapaContato } from "@/components/sections/ai-score/EtapaContato";
import { FormularioLead } from "@/components/sections/ai-score/FormularioLead";
import { Barra, BarrasDimensoes, Nota, Regua } from "@/components/sections/ai-score/Placar";
import { Relatorio } from "@/components/sections/ai-score/Relatorio";
import { ResumoExecutivo } from "@/components/sections/ai-score/ResumoExecutivo";
import { Botao, BotaoAcao } from "@/components/ui/botao";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Linhas } from "@/components/ui/linhas";
import { Section } from "@/components/ui/section";
import { SinalDePronto } from "@/components/ui/sinal-de-pronto";
import {
  dimensoes,
  exemplo as textosExemplo,
  modulosArea,
  niveis,
  relatorio as impresso,
  resultadoTextos as t,
} from "@/content/ai-score-questionario";
import { acompanharEmail, retomarFila } from "@/lib/ai-score/captura";
import { calcular, formatarNota } from "@/lib/ai-score/calcular";
import { completas, lerLink } from "@/lib/ai-score/codificar";
import type { Devolutiva, OrigemDoLink } from "@/lib/ai-score/devolutiva";
import { metodoDe } from "@/lib/ai-score/metodo";
import { tentarCarregarMotor, useMotor } from "@/lib/ai-score/motor";
import {
  assinarArmazenamento,
  assinarHash,
  lerHash,
  lerLiberacao,
  marcaAdminValida,
  relatorio,
  verComoAdmin,
} from "@/lib/ai-score/navegador";
import type { RespostasCompletas } from "@/lib/ai-score/tipos";
import { consultarLiberacao, reenviarPendentes, supabase } from "@/lib/supabase";
import { waUrl } from "@/lib/whatsapp";

const AVALIACAO = "/ai-score/avaliacao/";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * O link do e-mail traz `&k=<token>` (e-mails novos) ou `&lead=<id>` (antigos) no hash: libera o relatório, mas não
 * vai junto quando a pessoa compartilha, e sai da barra de endereço assim que é lido.
 */
const acessoDoHash = (hash: string | null) => {
  const p = new URLSearchParams((hash ?? "").replace(/^#/, ""));
  const token = p.get("k");
  const lead = p.get("lead");
  return token && /^[A-Za-z0-9_-]{20,200}$/.test(token) ? { token } : lead && UUID.test(lead) ? { lead } : null;
};
const tirarAcessoDoEndereco = () => {
  const p = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  p.delete("k");
  p.delete("lead");
  window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${p}`);
};
const dimensao = (id: string) => dimensoes.find((d) => d.id === id)!;

const topo =
  "border-line overflow-hidden border-b bg-[radial-gradient(circle_at_85%_30%,rgba(0,230,118,0.12)_0%,rgba(0,230,118,0)_45%)] pt-[50px] pb-[60px] md:pt-[80px] md:pb-[90px]";

/**
 * Exemplo fixo (/ai-score/exemplo): mostra tudo, sem etapas de captura nem gravação. A devolutiva vem pronta do
 * servidor (calculada no build), então a página não baixa o motor.
 */
export interface Exemplo {
  codigo: string;
  nome: string;
  empresa: string;
  devolutiva: Devolutiva;
}

type Modo = { tipo: "publico" } | { tipo: "admin" } | ({ tipo: "exemplo" } & Exemplo);

type EstadoSemResultado = "carregando" | "vazio" | "invalido" | "versao" | "falha";

/** Estado sem resultado (servidor, link vazio, adulterado, de versão desconhecida ou leitura que não carregou). */
function SemResultado({ estado }: { estado: EstadoSemResultado }) {
  const texto = estado === "invalido" ? t.invalido : estado === "versao" ? t.versaoDesconhecida : t.vazio;
  return (
    <Section espaco="nenhum" className={topo}>
      <div className="container-site max-w-[760px]">
        <Eyebrow>{t.kicker}</Eyebrow>
        <h1 className="display-h2 mb-6">{t.titulo}</h1>
        {estado === "carregando" ? (
          <p className="text-fg-2 text-[18px]" aria-live="polite">
            {t.carregando}
          </p>
        ) : estado === "falha" ? (
          <>
            <p className="mb-2 text-[22px] font-bold">{t.falha.titulo}</p>
            <p className="text-fg-2 mb-8 text-[18px] leading-[1.6]">{t.falha.texto}</p>
            <BotaoAcao type="button" onClick={tentarCarregarMotor}>
              {t.falha.tentar}
            </BotaoAcao>
          </>
        ) : (
          <>
            <p className="mb-2 text-[22px] font-bold">{texto.titulo}</p>
            <p className="text-fg-2 mb-8 text-[18px] leading-[1.6]">{texto.texto}</p>
            <Botao href={AVALIACAO} origem="ai-score-resultado-vazio">
              {texto.cta}
            </Botao>
          </>
        )}
      </div>
    </Section>
  );
}

const ALERTAS_VISIVEIS = 3;

function CartaoDeAlerta({ alerta }: { alerta: Devolutiva["analise"]["alertas"][number] }) {
  return (
    <li className="border-line border-l-verde bg-painel break-inside-avoid border border-l-2 p-[22px]">
      <p className="mb-2 text-[17px] leading-[1.3] font-bold">{alerta.titulo}</p>
      <p className="text-fg-2 text-[14px] leading-[1.6]">{alerta.texto}</p>
    </li>
  );
}

/**
 * Quanta informação existe por trás da nota: nota estimada (com "Não sei") ou completa, sempre com a contagem de
 * respostas. Nunca vira margem de erro nem grau de confiança.
 */
function CoberturaDaNota({ cobertura }: { cobertura: Devolutiva["cobertura"] }) {
  const { situacao, validas, total } = cobertura;
  if (situacao === "estimativa")
    return (
      <div
        className="border-verde mt-6 max-w-[560px] border-l-2 pl-3 text-[14px] leading-[1.6]"
        data-cobertura={situacao}
      >
        <p className="font-semibold">{t.cobertura.estimativa.titulo}</p>
        <p className="text-fg-2">{t.cobertura.estimativa.texto(validas, total)}</p>
        {cobertura.umaResposta.length ? (
          <p className="text-fg-2 mt-1">
            {t.cobertura.estimativa.umaResposta(cobertura.umaResposta.map((id) => dimensao(id).nome).join(", "))}
          </p>
        ) : null}
      </div>
    );
  return (
    <p className="text-fg-2 mt-6 max-w-[560px] text-[14px]" data-cobertura={situacao}>
      {situacao === "parcial" ? t.cobertura.parcial(validas, total) : t.cobertura.completa(validas, total)}
    </p>
  );
}

/**
 * Resultado do RESET AI Score em duas etapas de captura: nome e e-mail abrem o resultado (camada 1); a empresa
 * libera o relatório completo (camada 2); a Análise Estratégica fecha a página (camada 3). As respostas vêm do
 * hash da URL. `cartoes`: os cinco cards de solução, renderizados no servidor. `exemplo`: o caso fixo da página
 * de exemplo, com tudo aberto (renderizado já no servidor).
 */
export function Resultado(props: { cartoes: Record<string, ReactNode>; exemplo?: Exemplo }) {
  return (
    <>
      <SinalDePronto />
      <ResultadoInterno {...props} />
    </>
  );
}

function ResultadoInterno({ cartoes, exemplo }: { cartoes: Record<string, ReactNode>; exemplo?: Exemplo }) {
  const hash = useSyncExternalStore(assinarHash, lerHash, () => null);
  const admin = useSyncExternalStore(
    assinarArmazenamento,
    () => marcaAdminValida(verComoAdmin.ler(), Date.now()),
    () => false,
  );
  const texto = exemplo ? exemplo.codigo : hash;
  const link = useMemo(() => (texto === null ? undefined : lerLink(texto)), [texto]);
  const acesso = useMemo(() => acessoDoHash(hash), [hash]);

  useEffect(() => {
    if (exemplo) return;
    void reenviarPendentes();
    void retomarFila();
  }, [exemplo]);

  if (link === undefined) return <SemResultado estado="carregando" />;
  if (link.tipo === "vazio") return <SemResultado estado="vazio" />;
  if (link.tipo === "invalido") return <SemResultado estado="invalido" />;
  if (link.tipo !== "ok") return <SemResultado estado="versao" />;
  if (!completas(link.respostas)) return <SemResultado estado="vazio" />;
  const modo: Modo = exemplo ? { tipo: "exemplo", ...exemplo } : admin ? { tipo: "admin" } : { tipo: "publico" };
  return (
    <Pronto
      respostas={link.respostas}
      link={link}
      codigo={texto!}
      cartoes={cartoes}
      modo={modo}
      acessoDoLink={acesso}
      previa={exemplo?.devolutiva}
    />
  );
}

function Pronto({
  respostas: r,
  link,
  codigo,
  cartoes,
  modo,
  acessoDoLink,
  previa,
}: {
  respostas: RespostasCompletas;
  link: OrigemDoLink;
  codigo: string;
  cartoes: Record<string, ReactNode>;
  modo: Modo;
  acessoDoLink: { lead: string } | { token: string } | null;
  /** Devolutiva já calculada no servidor (só a página de exemplo). */
  previa?: Devolutiva;
}) {
  // A nota é leve e sai na hora; o resto (leituras, alertas, recomendações, plano) vem do motor, carregado sob
  // demanda enquanto a pessoa preenche nome e e-mail.
  const { motor, falhou } = useMotor(!previa);
  const devolutiva = useMemo(
    () => previa ?? (motor ? motor.montarDevolutiva(r, link) : null),
    [previa, motor, r, link],
  );
  const resultadoBase = useMemo(() => calcular(r, metodoDe(link.metodo)), [r, link.metodo]);
  const chave = r.id ?? codigo;
  const liberadoTexto = useSyncExternalStore(
    assinarArmazenamento,
    () => relatorio.ler(chave),
    () => null,
  );
  const liberacao = useMemo(() => lerLiberacao(liberadoTexto), [liberadoTexto]);
  const [foco, setFoco] = useState<"" | "resultado" | "relatorio">("");
  // Link do e-mail em outro aparelho: confere o acesso (token ou par de ids) e libera o relatório completo.
  const conferirLink = modo.tipo === "publico" && acessoDoLink !== null && r.id !== undefined;
  const [conferindo, setConferindo] = useState(conferirLink);
  useEffect(() => {
    if (!conferirLink || !r.id) return;
    let vivo = true;
    void consultarLiberacao(acessoDoLink!, r.id).then((lead) => {
      if (!vivo) return;
      tirarAcessoDoEndereco();
      if (lead && !lerLiberacao(relatorio.ler(chave))?.completo)
        relatorio.liberar(chave, {
          ...("lead" in acessoDoLink! ? { leadId: acessoDoLink.lead } : {}),
          nome: lead.nome,
          empresa: lead.empresa,
          data: new Date().toLocaleDateString("pt-BR"),
          completo: true,
        });
      setConferindo(false);
    });
    return () => {
      vivo = false;
    };
  }, [conferirLink, acessoDoLink, r.id, chave]);
  // Voltou à página com o e-mail ainda "pendente" ou "nova tentativa": volta a perguntar ao servidor o estado real.
  const pendente = liberacao?.emailEstado === "pendente" || liberacao?.emailEstado === "nova-tentativa";
  const leadParaEmail = liberacao?.leadId;
  const chaveParaEmail = liberacao?.chave;
  useEffect(() => {
    if (modo.tipo === "publico" && pendente && leadParaEmail && chaveParaEmail)
      void acompanharEmail(chave, leadParaEmail, chaveParaEmail);
  }, [modo.tipo, pendente, leadParaEmail, chaveParaEmail, chave]);
  const [copiado, setCopiado] = useState(false);
  const h1 = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (foco !== "resultado") return;
    window.scrollTo({ top: 0 });
    h1.current?.focus({ preventScroll: true });
  }, [foco]);

  const tudoAberto = modo.tipo !== "publico";
  const viuResultado = tudoAberto || liberacao !== null;
  const viuRelatorio = tudoAberto || liberacao?.completo === true;
  const nome = modo.tipo === "exemplo" ? modo.nome : liberacao?.nome;
  const empresa = modo.tipo === "exemplo" ? modo.empresa : liberacao?.empresa;

  if (!viuResultado && conferindo) return <SemResultado estado="carregando" />;
  if (!viuResultado)
    return (
      <EtapaContato respostas={r} resultado={resultadoBase} codigo={codigo} aoLiberar={() => setFoco("resultado")} />
    );
  if (!devolutiva) return <SemResultado estado={falhou ? "falha" : "carregando"} />;

  const { resultado, analise, cobertura, versoes } = devolutiva;
  const nivel = niveis.find((n) => n.id === resultado.nivel);
  const moduloDaArea = modulosArea.find((m) => m.area === r.escopo)?.nome;
  const quem =
    r.escopo === "empresa"
      ? (empresa ?? impresso.resumo.suaEmpresa)
      : `${impresso.resumo.suaArea} (${moduloDaArea}${empresa ? `, ${empresa}` : ""})`;

  async function copiar() {
    try {
      // Sem o `lead` do link do e-mail: quem recebe o link compartilhado passa pelas etapas.
      await navigator.clipboard.writeText(window.location.href.replace(/&(lead|k)=[^&]*/g, ""));
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <>
      {modo.tipo === "exemplo" ? (
        <div data-nao-imprimir className="gutter border-line bg-painel border-b py-3">
          <div className="container-site flex flex-wrap items-center justify-between gap-3 text-[14px]">
            <span>{textosExemplo.aviso}</span>
            <Botao href={AVALIACAO} tamanho="sm" origem="ai-score-exemplo-topo">
              {textosExemplo.cta}
            </Botao>
          </div>
        </div>
      ) : null}

      {viuRelatorio && nome && empresa ? (
        <div className="gutter hidden pt-2 pb-6 print:block">
          <div className="container-site">
            <p className="eyebrow text-verde mb-1">{impresso.impresso.titulo}</p>
            <p className="text-[14px]">{impresso.impresso.para(nome, empresa, liberacao?.data)}</p>
          </div>
        </div>
      ) : null}

      <Section espaco="nenhum" className={topo}>
        <div className="container-site grid gap-12 md:grid-cols-2 md:gap-[80px]">
          <div>
            <Eyebrow>{t.escopo(r.escopo)}</Eyebrow>
            <h1
              ref={h1}
              tabIndex={-1}
              className="mb-2 text-[clamp(30px,3.6vw,48px)] leading-[1.08] font-bold tracking-[-0.03em] focus:outline-none"
            >
              {t.titulo}
            </h1>
            {nome ? <p className="text-fg-2 mb-8 text-[16px]">{t.ola(nome)}</p> : <div className="mb-8" />}
            {resultado.indice !== null && resultado.nivel ? (
              <>
                <Nota indice={resultado.indice} nivel={resultado.nivel} />
                <div className="mt-8 max-w-[520px]">
                  <Regua indice={resultado.indice} nivel={resultado.nivel} />
                </div>
              </>
            ) : (
              <p className="text-verde text-[clamp(40px,5vw,64px)] leading-none font-bold tracking-[-0.03em]">
                {t.parcial.nome}
              </p>
            )}
            <CoberturaDaNota cobertura={cobertura} />
            <h2 className="mt-9 text-[22px] leading-[1.3] font-bold">{nivel ? nivel.titulo : t.parcial.titulo}</h2>
            <p className="text-fg-2 mt-3 max-w-[560px] text-[17px] leading-[1.7]">
              {nivel ? nivel.texto : t.parcial.texto}
            </p>
            {versoes.analiseMaisNova ? (
              <p className="border-fg text-fg-2 mt-6 max-w-[560px] border-l-2 pl-3 text-[13px] leading-[1.6]">
                {t.versao.maisNova}
              </p>
            ) : versoes.anteriorAoVersionamento ? (
              <p className="border-line text-fg-2 mt-6 max-w-[560px] border-l-2 pl-3 text-[13px] leading-[1.6]">
                {t.versao.anterior(versoes.metodo, versoes.analiseAtual)}
              </p>
            ) : null}
          </div>
          <div className="border-line bg-painel self-start border p-[26px] md:p-[36px]">
            <h2 className="eyebrow text-fg-2 mb-6 text-[11px]">{t.dimensoes}</h2>
            <BarrasDimensoes notas={resultado.dimensoes} />
          </div>
        </div>
      </Section>

      {modo.tipo === "publico" && (liberacao?.contato === "pendente" || liberacao?.contato === "recusado") ? (
        <div data-nao-imprimir data-contato={liberacao.contato} className="gutter border-line bg-painel border-b py-4">
          <div className="container-site max-w-[900px] text-[14px] leading-[1.6]">
            <p className="font-semibold">{t.contatoAviso[liberacao.contato].titulo}</p>
            <p className="text-fg-2">{t.contatoAviso[liberacao.contato].texto}</p>
          </div>
        </div>
      ) : null}

      <Section tom="escuro">
        <div className="container-site">
          <ResumoExecutivo resumo={devolutiva.sintese.resumo} quem={quem} />
          <div
            data-nao-imprimir
            data-convite="resumo"
            className="border-line bg-painel mt-3 border p-[22px] md:p-[28px]"
          >
            <p className="text-[17px] leading-[1.55] font-semibold">
              {devolutiva.sintese.conversa.contexto} {devolutiva.sintese.conversa.utilidade}
            </p>
            <details className="text-fg-2 mt-4 text-[14px] leading-[1.6]">
              <summary className="text-verde cursor-pointer font-semibold">
                {devolutiva.sintese.conversa.previa.titulo}
              </summary>
              <p data-previa-whatsapp className="border-line bg-fundo mt-3 border p-3">
                {devolutiva.sintese.conversa.mensagem}
              </p>
              <p className="mt-2">{devolutiva.sintese.conversa.previa.aviso}</p>
            </details>
            <div className="mt-5">
              <Botao
                href={waUrl(devolutiva.sintese.conversa.mensagem)}
                origem="diagnostico-resultado-resumo"
                tamanho="sm"
              >
                {devolutiva.sintese.conversa.cta}
              </Botao>
            </div>
          </div>

          {analise.alertas.length ? (
            <div className="mt-14">
              <h2 className="mb-6 text-[24px] leading-[1.2] font-bold">{t.alertas.titulo}</h2>
              <ul className="grid gap-3 md:grid-cols-3">
                {analise.alertas.slice(0, ALERTAS_VISIVEIS).map((a) => (
                  <CartaoDeAlerta key={a.id} alerta={a} />
                ))}
              </ul>
              {analise.alertas.length > ALERTAS_VISIVEIS ? (
                <>
                  <details data-nao-imprimir className="mt-4">
                    <summary className="text-verde cursor-pointer text-[14px] font-semibold">
                      {t.alertas.outros(analise.alertas.length - ALERTAS_VISIVEIS)}
                    </summary>
                    <ul className="mt-4 grid gap-3 md:grid-cols-3">
                      {analise.alertas.slice(ALERTAS_VISIVEIS).map((a) => (
                        <CartaoDeAlerta key={a.id} alerta={a} />
                      ))}
                    </ul>
                  </details>
                  <ul className="mt-3 hidden gap-3 print:grid print:grid-cols-3">
                    {analise.alertas.slice(ALERTAS_VISIVEIS).map((a) => (
                      <CartaoDeAlerta key={a.id} alerta={a} />
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          ) : null}

          {r.areas.length ? (
            <div className="mt-14">
              <h2 className="mb-2 text-[24px] leading-[1.2] font-bold">{t.areas.titulo}</h2>
              <p className="text-fg-2 mb-6 max-w-[640px] text-[15px]">{t.areas.nota}</p>
              <ul className="grid gap-3 sm:grid-cols-3">
                {r.areas.map((a) => {
                  const v = resultado.areas[a] ?? null;
                  return (
                    <li key={a} className="border-line bg-painel break-inside-avoid border p-[24px]">
                      <span className="mb-3 flex items-baseline justify-between gap-3">
                        <span className="text-[17px] font-bold">{modulosArea.find((m) => m.area === a)!.nome}</span>
                        <span className="text-[22px] font-bold tabular-nums">
                          {v === null ? t.semResposta : formatarNota(v)}
                          {v === null ? null : <span className="text-fg-2 text-[13px] font-semibold">{t.de100}</span>}
                        </span>
                      </span>
                      <Barra valor={v} />
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="border-line mt-12 flex flex-col gap-5 border-t pt-6 md:flex-row md:items-center md:justify-between">
            <p className="text-fg-2 max-w-[620px] text-[13px] leading-[1.6]">{t.aviso}</p>
            {modo.tipo === "publico" ? (
              <div data-nao-imprimir className="flex flex-wrap items-center gap-x-5 gap-y-3">
                <BotaoAcao type="button" variante="secundario" tamanho="sm" onClick={copiar}>
                  {t.compartilhar}
                </BotaoAcao>
                <Botao href={AVALIACAO} variante="secundario" tamanho="sm" origem="ai-score-refazer">
                  {t.refazer}
                </Botao>
                <span aria-live="polite" className="text-verde text-[13px] font-semibold">
                  {copiado ? t.copiado : ""}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </Section>

      <Section id="relatorio" data-nao-imprimir={viuRelatorio ? undefined : ""}>
        {viuRelatorio ? (
          <Relatorio
            respostas={r}
            resultado={resultado}
            devolutiva={devolutiva}
            contexto={{
              nome: nome ?? null,
              empresa: empresa ?? null,
              data: liberacao?.data ?? new Date().toLocaleDateString("pt-BR"),
              exemplo: modo.tipo === "exemplo",
            }}
            cartoes={cartoes}
            focar={foco === "relatorio"}
            demo={modo.tipo === "publico" && !supabase.ativo}
            avaliacaoId={r.id}
            leadId={liberacao?.leadId}
            buscarDicas={modo.tipo === "publico" && supabase.ativo}
            chave={liberacao?.chave}
            email={
              liberacao?.email && (liberacao.emailEstado || liberacao.emailEnviado)
                ? { estado: liberacao.emailEstado ?? "aceito", endereco: liberacao.email }
                : undefined
            }
          />
        ) : (
          <FormularioLead
            avaliacaoId={chave}
            liberacao={liberacao!}
            resultado={resultado}
            aoLiberar={() => setFoco("relatorio")}
          />
        )}
      </Section>

      <Section tom="contraste" data-nao-imprimir="" className="border-line border-t">
        <div className="container-site grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end md:gap-[80px]">
          <div>
            <Eyebrow>{devolutiva.sintese.conversa.kicker}</Eyebrow>
            <h2 className="text-[clamp(32px,4vw,56px)] leading-[1.05] font-bold tracking-[-0.03em]">
              <Linhas itens={devolutiva.sintese.conversa.titulo} />
            </h2>
          </div>
          <div>
            <p className="text-fg-2 mb-7 text-[17px] leading-[1.7]">
              {devolutiva.sintese.conversa.contexto} {devolutiva.sintese.conversa.utilidade}
            </p>
            <Botao href={waUrl(devolutiva.sintese.conversa.mensagem)} origem="diagnostico-resultado">
              {devolutiva.sintese.conversa.cta}
            </Botao>
          </div>
        </div>
      </Section>

      <div className="gutter hidden pt-6 print:block">
        <p className="container-site text-[11px]">{impresso.impresso.rodape}</p>
      </div>
    </>
  );
}
