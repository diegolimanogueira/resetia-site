"use client";

import type { ComponentProps } from "react";
import { EtapaContato } from "@/components/sections/ai-score/EtapaContato";
import { FormularioLead } from "@/components/sections/ai-score/FormularioLead";

/**
 * Os dois formulários de contato do resultado num módulo só, carregado sob demanda (`contato-sob-demanda.ts`): a
 * página de exemplo e quem já liberou o relatório nunca os mostram, então o JavaScript deles não entra no pacote da
 * rota. Exporta funções de renderização, e não componentes, para o `Resultado` não criar componente durante a
 * renderização (regra react-hooks/static-components).
 */
export const etapaContato = (props: ComponentProps<typeof EtapaContato>) => <EtapaContato {...props} />;
export const formularioLead = (props: ComponentProps<typeof FormularioLead>) => <FormularioLead {...props} />;
