import { GradeSolucoes } from "@/components/sections/shared/CardSolucao";
import { FaixaAiScore } from "@/components/sections/shared/FaixaAiScore";
import { CabecalhoSecao } from "@/components/ui/cabecalho-secao";
import { Section } from "@/components/ui/section";
import { home } from "@/content/home";
import { solucoes } from "@/content/solucoes";

/**
 * O que é a RESET 360: as cinco soluções em cards, cada um dizendo o que a empresa recebe, e, logo depois,
 * o convite para o RESET AI Score.
 */
export function Solucoes() {
  const s = home.solucoes;
  return (
    <Section tom="contraste" id="solucoes">
      <div className="container-site">
        <CabecalhoSecao kicker={s.kicker} titulo={s.titulo} lead={s.lead} />
        <GradeSolucoes itens={solucoes.lista} explicativo />
        <div className="mt-[14px]">
          <FaixaAiScore texto={s.depois} apoio={solucoes.detalhe.diagnostico.texto} origem="solucoes" />
        </div>
      </div>
    </Section>
  );
}
