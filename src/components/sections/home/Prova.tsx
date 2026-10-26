import { home } from "@/content/home";

/** Faixa de credibilidade logo abaixo do hero: empresas cujas equipes a Reset já treinou (validado). */
export function Prova() {
  const p = home.prova;
  return (
    <section data-tom="escuro" className="gutter border-line text-fg border-y bg-(--bg) py-6">
      <p className="container-site text-fg-2 text-center text-[14px] leading-[1.7]">
        {p.antes}{" "}
        {p.empresas.map((e, i) => (
          <span key={e}>
            <strong className="text-fg font-semibold">{e}</strong>
            {i < p.empresas.length - 2 ? ", " : i === p.empresas.length - 2 ? " e " : ""}
          </span>
        ))}
        , {p.depois}
      </p>
    </section>
  );
}
