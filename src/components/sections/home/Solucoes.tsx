import { GradeSolucoes } from "@/components/sections/shared/CardSolucao";
import { FaixaDiagnostico } from "@/components/sections/shared/FaixaDiagnostico";
import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { solucoes } from "@/content/solucoes";

/** Portfólio: as cinco soluções em cards e, logo depois, o convite para o diagnóstico gratuito. */
export function Solucoes() {
  const s = home.solucoes;
  return (
    <Section tom="contraste" id="solucoes">
      <div className="container-site">
        <CabecalhoSecao kicker={s.kicker} titulo={s.titulo} lead={s.lead} />
        <GradeSolucoes itens={solucoes.lista} />
        <div className="mt-[14px]">
          <FaixaDiagnostico texto={s.depois} apoio={solucoes.detalhe.diagnostico.texto} origem="solucoes" />
        </div>
      </div>
    </Section>
  );
}
