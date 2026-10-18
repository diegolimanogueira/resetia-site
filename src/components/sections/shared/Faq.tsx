import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FaqItem } from "@/content/types";

/** FAQ em accordion: um item aberto por vez, "+" gira 45°, conteúdo expande em altura. */
export function Faq({ itens }: { itens: FaqItem[] }) {
  return (
    <Accordion multiple={false}>
      {itens.map((f, i) => (
        <AccordionItem key={f.pergunta} value={i}>
          <AccordionTrigger>{f.pergunta}</AccordionTrigger>
          <AccordionContent>
            <p className="text-fg-2 max-w-[60ch] text-[17px] leading-[1.6]">{f.resposta}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
