import { GradeSolucoes } from "@/components/sections/shared/CardSolucao";
import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { solucoes } from "@/content/solucoes";

/** Portfólio (reset360 #solucoes): as sete soluções em cards. */
export function Solucoes() {
  const s = home.solucoes;
  return (
    <Section tom="contraste" id="solucoes">
      <div className="container-site">
        <CabecalhoSecao kicker={s.kicker} titulo={s.titulo} lead={s.lead} />
        <GradeSolucoes itens={solucoes.lista} />
      </div>
    </Section>
  );
}
