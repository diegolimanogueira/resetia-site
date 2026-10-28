import { Botao } from "@/components/ui/botao";
import { Linhas } from "@/components/ui/linhas";
import { home } from "@/content/home";
import { asset } from "@/lib/asset";
import { cn } from "@/lib/utils";

/** Posição das pílulas em volta do núcleo (reset360 .pill-a/b/c). */
const posicoes = [
  "top-[5%] left-0 sm:top-[22%]",
  "top-[35%] right-0 sm:top-[40%] md:-right-[5%]",
  "bottom-0 left-[4%] sm:bottom-[10%] md:bottom-[21%]",
];

/** Órbitas do reset360 em CSS puro: três anéis, núcleo com o ícone Reset IA e as três áreas. */
function Orbitas() {
  const h = home.hero;
  return (
    <div
      aria-hidden="true"
      data-decorativo
      className="relative order-first mt-[30px] grid h-[260px] place-items-center sm:h-[350px] md:order-none md:mt-0 md:h-[580px]"
    >
      {[
        "size-[140px] sm:size-[190px] md:size-[270px]",
        "size-[210px] sm:size-[290px] md:size-[410px]",
        "size-[275px] sm:size-[380px] md:size-[550px] border-verde/15",
      ].map((tamanho) => (
        <span key={tamanho} className={cn("border-verde/30 absolute rounded-full border", tamanho)} />
      ))}
      <span className="border-verde/50 bg-carvao grid size-[100px] place-items-center rounded-[35%] border shadow-[0_0_100px_rgba(0,230,118,0.18)] sm:size-[130px] md:size-[175px]">
        <img
          src={asset("/brand/icone-dark.webp")}
          alt=""
          width={180}
          height={180}
          className="size-[52px] sm:size-[68px] md:size-[92px]"
        />
      </span>
      {h.pilulas.map((p, i) => (
        <span
          key={p}
          className={cn(
            "bg-carvao/85 border-verde/40 text-fg absolute border px-[7px] py-[7px] text-[8px] font-bold tracking-[.08em] uppercase sm:px-[17px] sm:py-[13px] sm:text-[11px]",
            posicoes[i],
          )}
        >
          {p} <b className="text-verde">↗</b>
        </span>
      ))}
      <span className="text-fg-2 absolute bottom-[30px] hidden text-[9px] tracking-[.2em] uppercase md:block">
        {h.legenda}
      </span>
    </div>
  );
}

/** Hero da home: texto e os dois caminhos (RESET AI Score e soluções) à esquerda, órbitas à direita. */
export function Hero() {
  const h = home.hero;
  return (
    <section
      data-tom="carvao"
      className="gutter text-fg relative overflow-hidden bg-(--bg) bg-[radial-gradient(circle_at_73%_41%,rgba(0,230,118,0.16)_0%,rgba(0,230,118,0)_38%)] md:min-h-[740px]"
    >
      <div aria-hidden="true" className="grade pointer-events-none absolute inset-0" />
      <div className="container-site relative grid items-center md:min-h-[680px] md:grid-cols-2">
        <div className="relative z-[2] pt-5 pb-[70px] md:py-[70px]">
          <p className="eyebrow text-verde mb-6 flex items-center gap-[9px]">
            <span className="bg-verde inline-block size-[7px] rounded-full shadow-[0_0_12px_#00e676]" />
            {h.eyebrow}
          </p>
          <h1 className="mb-[30px] text-[clamp(38px,4.4vw,64px)] leading-[1.04] font-bold tracking-[-0.035em]">
            <Linhas itens={h.titulo} />
          </h1>
          <p className="text-fg-2 max-w-[550px] text-[18px] leading-[1.75]">{h.lead}</p>
          <div className="mt-[35px] flex flex-wrap gap-3">
            <Botao href="/ai-score/" origem="ai-score-hero">
              {h.ctaPrimario}
            </Botao>
            <Botao href={h.ctaSecundario.href} variante="secundario" seta="↓">
              {h.ctaSecundario.label}
            </Botao>
          </div>
        </div>
        <Orbitas />
      </div>
      <div className="container-site text-fg-2 border-neutro/15 relative flex justify-between border-t py-5 text-[8px] tracking-[.2em] uppercase sm:text-[10px]">
        {h.rodape.map((item, i) => (
          <span key={item} className={i === 1 ? "hidden sm:inline" : undefined}>
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
