import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { admin } from "@/content/admin";

const AVALIACOES: Array<Record<string, unknown> & { codigo: string }> = [
  {
    id: "3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
    criada_em: "2026-10-28T12:59:00Z",
    escopo: "empresa",
    papel: "ceo",
    porte: "50-199",
    segmento: "tecnologia",
    horizonte: "imediato",
    indice: 46,
    nivel: "desenvolvimento",
    parcial: false,
    codigo:
      "v=1&e=empresa&p=ceo&t=50-199&s=tecnologia&r=332221221121&a=vendas&av=4323&d=comecar&h=imediato&id=3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
    origem: { utm_source: "linkedin", entrada: "/ai-score/" },
    ambiente: "producao",
    leads: [
      {
        id: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
        avaliacao_id: "3f1c2b9e-8a7d-4c6b-9e5f-1a2b3c4d5e6f",
        criado_em: "2026-10-28T13:00:00Z",
        atualizado_em: "2026-10-28T13:00:00Z",
        nome: "Maria Teste",
        email: "maria@empresa.com.br",
        email_pessoal: false,
        empresa: "Empresa Teste",
        whatsapp: "5585999990000",
        pediu_contato: true,
        consentimento_marketing: false,
        status: "novo",
        notas: null,
        ambiente: "producao",
      },
    ],
  },
];
// Uma avaliação concluída sem lead (conta em "Sem lead").
AVALIACOES.push({
  ...AVALIACOES[0],
  id: "b0000000-0000-4000-8000-000000000000",
  criada_em: "2026-10-27T10:00:00Z",
  leads: [],
});

/** Simula GoTrue e PostgREST (o CI builda com uma URL fictícia do Supabase). */
async function simularSupabase(page: Page) {
  const patches: unknown[] = [];
  await page.route("**/auth/v1/token**", async (rota) => {
    const corpo = rota.request().postDataJSON() as { password?: string };
    if (corpo.password !== "senha-certa") return rota.fulfill({ status: 400, json: { error: "invalid_grant" } });
    await rota.fulfill({
      json: {
        access_token: "token",
        refresh_token: "refresh",
        expires_in: 3600,
        user: { email: "admin@resetia.com.br" },
      },
    });
  });
  await page.route("**/rest/v1/**", async (rota) => {
    const r = rota.request();
    expect(r.headers()["authorization"]).toBe("Bearer token");
    if (r.url().includes("/rpc/eh_admin")) return rota.fulfill({ json: true });
    if (r.method() === "PATCH") {
      patches.push(r.postDataJSON());
      return rota.fulfill({ status: 204 });
    }
    await rota.fulfill({ json: AVALIACOES });
  });
  return patches;
}

test("admin: login, lista, detalhe, status e notas, CSV e sair", async ({ page }) => {
  await page.goto("/ai-score/");
  const modo = await page.locator("main").getAttribute("data-ai-score-modo");
  await page.goto("/admin/");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
  await expect(page.locator("[data-barra-mobile]")).toHaveCount(0);
  if (modo !== "producao") {
    await expect(page.getByText(admin.login.desligado)).toBeVisible();
    return;
  }

  const patches = await simularSupabase(page);
  await page.getByLabel(admin.login.email).fill("admin@resetia.com.br");
  await page.getByLabel(admin.login.senha).fill("senha-errada");
  await page.getByRole("button", { name: admin.login.entrar }).click();
  await expect(page.getByText(admin.login.erro)).toBeVisible();
  await page.getByLabel(admin.login.senha).fill("senha-certa");
  await page.getByRole("button", { name: admin.login.entrar }).click();

  await expect(page.getByRole("heading", { level: 1, name: admin.titulo })).toBeVisible();
  const resumo = page.locator("dl").first();
  await expect(resumo.getByText(admin.resumo.avaliacoes).locator("..")).toContainText("2");
  await expect(resumo.getByText(admin.resumo.semLead).locator("..")).toContainText("1");
  await expect(page.getByRole("row")).toHaveCount(2);
  await expect(page.getByRole("row").nth(1)).toContainText("Maria Teste");
  await expect(page.getByRole("row").nth(1)).toContainText("100");
  await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze()
    .then((r) => expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]));

  await page.getByRole("button", { name: "Maria Teste" }).click();
  const detalhe = page.getByRole("region", { name: admin.detalhe.rotulo });
  await expect(detalhe.getByRole("heading", { name: "Maria Teste" })).toBeVisible();
  await expect(detalhe.getByText("Estratégia e Liderança")).toBeVisible();
  await expect(detalhe.getByText("linkedin")).toBeVisible();
  const wa = detalhe.getByRole("link", { name: /\+5585999990000/ });
  expect(new URL((await wa.getAttribute("href"))!).searchParams.get("text")).toContain("(46/100)");
  await expect(detalhe.getByRole("link", { name: admin.detalhe.verResultado })).toHaveAttribute(
    "href",
    `/ai-score/resultado/#${AVALIACOES[0].codigo}`,
  );

  await detalhe.getByLabel(admin.detalhe.statusRotulo).selectOption("qualificado");
  await detalhe.getByLabel(admin.detalhe.notas).fill("Ligar na quinta");
  await detalhe.getByRole("button", { name: admin.detalhe.salvar }).click();
  await expect(detalhe.getByText(admin.detalhe.salvo)).toBeVisible();
  expect(patches).toEqual([{ status: "qualificado", notas: "Ligar na quinta" }]);
  await expect(page.getByRole("row").nth(1)).toContainText(admin.status.qualificado);

  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: admin.exportar }).click();
  expect((await download).suggestedFilename()).toMatch(/^leads-ai-score-\d{4}-\d{2}-\d{2}\.csv$/);

  await page.getByRole("button", { name: admin.sair }).click();
  await expect(page.getByRole("button", { name: admin.login.entrar })).toBeVisible();
});
