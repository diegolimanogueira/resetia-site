import { Line } from "@/components/motion/Line";
import { depois } from "@/content/home";

/** Governança de IA e Fábrica de Agentes, lado a lado, separados por linha vertical. Agnóstico ao tom. */
export function DepoisBlocos({ titulo }: { titulo: string }) {
  return (
    <div className="container-site">
      <h2 className="display-h2 mb-16">{titulo}</h2>
      <div className="grid gap-14 md:grid-cols-[1fr_1px_1fr]">
        {depois.blocos.map((b, i) => (
          <div key={b.titulo} className="contents">
            {i > 0 ? <Line eixo="y" className="hidden md:block" /> : null}
            <div>
              <h3 className="mb-4 text-[28px] leading-[1.1] font-semibold tracking-[-0.02em]">{b.titulo}</h3>
              <p className="text-fg-2 text-[18px] leading-[1.6]">{b.texto}</p>
            </div>
          </div>
        ))}
      </div>
      <Line className="mt-16 mb-6" />
      <p className="text-fg-2 text-[16px]">{depois.nota}</p>
    </div>
  );
}
