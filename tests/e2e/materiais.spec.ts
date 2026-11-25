import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { admin } from "@/content/admin";
import { materiais } from "@/content/materiais";
import { site } from "@/content/site";
import { ctaPadrao } from "@/content/solucoes";

const t = admin.materiais;
const PDF = Buffer.from("%PDF-1.4\n%%EOF\n");

const semViolacoes = (page: Page) =>
  new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze()
    .then((r) => expect(r.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]));

/** O build de staging sai sem Supabase (modo demonstração); o de produção e o do CI, com. */
async function comSupabase(page: Page) {
  await page.goto("/ai-score/");
  return (await page.locator("main").getAttribute("data-ai-score-modo")) === "producao";
}

const PUBLICADO = {
  palavra: "brabo",
  titulo: "Guia Brabo de Prompts",
  descricao: "Os dez prompts que mais uso no dia a dia.",
  arquivo: "dddddddd-dddd-4ddd-8ddd-dddddddddddd/brabo.pdf",
  tamanho: 2_411_725,
};

/** PostgREST e Storage da página pública: só "brabo" está publicado. */
async function simularPublico(page: Page) {
  const eventos: Array<Record<string, unknown>> = [];
  const buscas: string[] = [];
  await page.context().route("**/rest/v1/rpc/registrar_material", async (rota) => {
    eventos.push(rota.request().postDataJSON() as Record<string, unknown>);
    await rota.fulfill({ json: true });
  });
  await page.context().route(/\/rest\/v1\/materiais\?/, async (rota) => {
    const url = new URL(rota.request().url());
    const palavra = (url.searchParams.get("palavra") ?? "").replace(/^eq\./, "");
    buscas.push(palavra);
    // A página lê só as colunas públicas: nada de contadores.
    expect(url.searchParams.get("select")).toBe("palavra,titulo,descricao,arquivo,tamanho");
    if (palavra === "fora-do-ar") return rota.fulfill({ status: 500, json: {} });
    await rota.fulfill({ json: palavra === PUBLICADO.palavra ? [PUBLICADO] : [] });
  });
  await page.context().route("**/storage/v1/object/public/materiais/**", (rota) =>
    // HTML no lugar do PDF: o que se testa é o clique e o contador, não o leitor de PDF de cada navegador.
    rota.fulfill({ contentType: "text/html", body: "<p>PDF</p>" }),
  );
  return { eventos, buscas };
}

test("material: título, descrição, botão do PDF, contadores e o convite do fim", async ({ page }) => {
  const ativo = await comSupabase(page);
  const { eventos } = await simularPublico(page);
  await page.goto("/materiais/?brabo&utm_source=instagram");
  await expect(page.locator("meta[name='robots']")).toHaveAttribute("content", /noindex/);
  await expect(page).toHaveTitle(materiais.seo.title);
  if (!ativo) {
    await expect(page.getByRole("heading", { level: 1, name: materiais.ausente.titulo })).toBeVisible();
    return;
  }

  await expect(page.getByRole("heading", { level: 1, name: PUBLICADO.titulo })).toBeVisible();
  await expect(page.getByText(PUBLICADO.descricao)).toBeVisible();
  await expect(page.getByText(materiais.formato("2,3 MB"))).toBeVisible();
  const baixar = page.getByRole("link", { name: materiais.baixar });
  await expect(baixar).toHaveAttribute("href", /\/storage\/v1\/object\/public\/materiais\/d{8}-.+\/brabo\.pdf$/);
  await expect(baixar).toHaveAttribute("target", "_blank");
  await expect(baixar).toHaveAttribute("rel", "noopener");
  await expect.poll(() => eventos).toEqual([{ p_palavra: "brabo", p_evento: "acesso" }]);

  // O fecho é o convite padrão do site: AI Score e especialista.
  await expect(page.getByText(ctaPadrao.apoio!)).toBeVisible();
  await expect(page.locator("[data-cta='ai-score-materiais']")).toHaveAttribute("href", "/ai-score/");
  await expect(page.locator("[data-cta='diagnostico-materiais']")).toHaveAttribute(
    "href",
    new RegExp(`^https://wa\\.me/${site.whatsapp}\\?text=`),
  );
  await semViolacoes(page);

  const aba = page.waitForEvent("popup");
  await baixar.click();
  await (await aba).close();
  await expect.poll(() => eventos.at(-1)).toEqual({ p_palavra: "brabo", p_evento: "download" });
  expect(eventos).toHaveLength(2);
});

test("material: sem palavra, palavra desconhecida e falha de rede", async ({ page }) => {
  const ativo = await comSupabase(page);
  const { eventos, buscas } = await simularPublico(page);

  // Sem palavra não há o que buscar.
  await page.goto("/materiais/");
  await expect(page.getByRole("heading", { level: 1, name: materiais.ausente.titulo })).toBeVisible();
  await expect(page.getByRole("link", { name: materiais.ausente.link })).toHaveAttribute("href", "/");
  expect(buscas).toEqual([]);
  await semViolacoes(page);
  if (!ativo) return;

  // Rascunho, material excluído ou palavra errada: o banco não devolve nada e nenhum acesso é contado.
  await page.goto("/materiais/?Outra-Palavra");
  await expect(page.getByRole("heading", { level: 1, name: materiais.ausente.titulo })).toBeVisible();
  expect(buscas).toEqual(["outra-palavra"]);

  // Falha de rede: avisa e deixa tentar de novo.
  await page.goto("/materiais/?fora-do-ar");
  await expect(page.getByRole("heading", { level: 1, name: materiais.erro.titulo })).toBeVisible();
  await page.getByRole("button", { name: materiais.erro.botao }).click();
  await expect.poll(() => buscas.filter((b) => b === "fora-do-ar").length).toBe(2);
  expect(eventos).toEqual([]);
});

/** GoTrue, PostgREST e Storage do admin, com um material já publicado. */
async function simularAdmin(page: Page) {
  const linhas: Array<Record<string, unknown>> = [
    {
      id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      criado_em: "2026-11-20T12:00:00Z",
      atualizado_em: "2026-11-20T12:00:00Z",
      ...PUBLICADO,
      publicado: true,
      acessos: 41,
      downloads: 17,
    },
  ];
  const envios: string[] = [];
  const apagados: string[] = [];
  const gravacoes: Array<{ metodo: string; corpo: unknown }> = [];
  await page.route("**/auth/v1/token**", (rota) =>
    rota.fulfill({
      json: {
        access_token: "token",
        refresh_token: "refresh",
        expires_in: 3600,
        user: { email: "admin@resetia.com.br" },
      },
    }),
  );
  await page.route("**/storage/v1/object/materiais/**", async (rota) => {
    const r = rota.request();
    expect(r.headers()["authorization"]).toBe("Bearer token");
    const caminho = new URL(r.url()).pathname.split("/object/materiais/")[1];
    if (r.method() === "DELETE") {
      apagados.push(caminho);
      return rota.fulfill({ json: { message: "Successfully deleted" } });
    }
    expect(r.headers()["content-type"]).toBe("application/pdf");
    envios.push(caminho);
    await rota.fulfill({ json: { Key: `materiais/${caminho}` } });
  });
  await page.route("**/rest/v1/**", async (rota) => {
    const r = rota.request();
    const url = new URL(r.url());
    expect(r.headers()["authorization"]).toBe("Bearer token");
    if (url.pathname.endsWith("/rpc/eh_admin")) return rota.fulfill({ json: true });
    if (!url.pathname.endsWith("/materiais")) return rota.fulfill({ json: [] });
    const id = (url.searchParams.get("id") ?? "").replace(/^eq\./, "");
    if (r.method() === "GET") return rota.fulfill({ json: linhas });
    const corpo = r.method() === "DELETE" ? null : (r.postDataJSON() as Record<string, unknown>);
    gravacoes.push({ metodo: r.method(), corpo });
    if (r.method() === "POST") {
      if (linhas.some((l) => l.palavra === corpo!.palavra))
        return rota.fulfill({ status: 409, json: { code: "23505", message: "duplicate key" } });
      const nova = {
        id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
        criado_em: "2026-11-25T12:00:00Z",
        atualizado_em: "2026-11-25T12:00:00Z",
        acessos: 0,
        downloads: 0,
        ...corpo,
      };
      linhas.unshift(nova);
      return rota.fulfill({ status: 201, json: [nova] });
    }
    const i = linhas.findIndex((l) => l.id === id);
    if (r.method() === "PATCH") Object.assign(linhas[i], corpo);
    if (r.method() === "DELETE") linhas.splice(i, 1);
    await rota.fulfill({ status: 204 });
  });
  return { linhas, envios, apagados, gravacoes };
}

test("admin: publicar, editar, despublicar e excluir um material", async ({ page }) => {
  if (!(await comSupabase(page))) return;
  const { envios, apagados, gravacoes } = await simularAdmin(page);
  await page.goto("/admin/");
  await page.getByLabel(admin.login.email).fill("admin@resetia.com.br");
  await page.getByLabel(admin.login.senha).fill("senha-certa");
  await page.getByRole("button", { name: admin.login.entrar }).click();

  // Os leads continuam sendo a primeira área; os materiais ficam a um clique.
  await expect(page.getByRole("heading", { level: 1, name: admin.titulo })).toBeVisible();
  const areas = page.getByRole("navigation", { name: admin.areas.rotulo });
  await areas.getByRole("button", { name: admin.areas.materiais }).click();
  await expect(page.getByRole("heading", { level: 1, name: t.titulo })).toBeVisible();

  // O material que já existe: link, acessos e downloads.
  const brabo = page.locator("[data-material='brabo']");
  await expect(brabo).toContainText(PUBLICADO.titulo);
  await expect(brabo).toContainText("resetia.com.br/materiais/?brabo");
  await expect(brabo).toContainText("41");
  await expect(brabo).toContainText("17");
  await expect(brabo).toContainText(t.publicado);
  await expect(brabo.getByRole("link", { name: t.de(t.abrir, "brabo") })).toHaveAttribute(
    "href",
    /\/materiais\/\?brabo$/,
  );
  await semViolacoes(page);

  // Formulário vazio, arquivo que não é PDF e palavra repetida não saem do navegador (ou voltam com aviso).
  await page.getByRole("button", { name: t.form.salvar }).click();
  await expect(page.getByText(t.erros.palavra)).toBeVisible();
  await expect(page.getByText(t.erros.titulo)).toBeVisible();
  await expect(page.getByText(t.erros.arquivoFalta)).toBeVisible();
  await page.getByLabel(t.form.palavra).fill("Brabo");
  await page.getByLabel(t.form.titulo).fill("Outro guia");
  await page.getByLabel(t.form.arquivo).setInputFiles({ name: "guia.png", mimeType: "image/png", buffer: PDF });
  await page.getByRole("button", { name: t.form.salvar }).click();
  await expect(page.getByText(t.erros.arquivoTipo)).toBeVisible();
  expect(envios).toEqual([]);
  await page.getByLabel(t.form.arquivo).setInputFiles({ name: "guia.pdf", mimeType: "application/pdf", buffer: PDF });
  await page.getByRole("button", { name: t.form.salvar }).click();
  await expect(page.getByText(t.erros.palavraRepetida)).toBeVisible();
  // O PDF enviado para a palavra repetida não fica sobrando no bucket.
  await expect.poll(() => apagados).toEqual(envios);

  // Novo material: a palavra digitada vira a do link, o PDF sobe e a linha aparece com o link pronto.
  await page.getByLabel(t.form.palavra).fill("Checklist IA 2026");
  await page.getByLabel(t.form.titulo).focus();
  await expect(page.getByLabel(t.form.palavra)).toHaveValue("checklist-ia-2026");
  await expect(page.getByText(t.form.palavraApoio("resetia.com.br/materiais/?checklist-ia-2026"))).toBeVisible();
  await page.getByLabel(t.form.titulo).fill("Checklist de IA para vendas");
  await page.getByLabel(t.form.descricao).fill("Vinte pontos para revisar antes de começar.");
  await page.getByRole("button", { name: t.form.salvar }).click();
  await expect(page.getByRole("status")).toHaveText(t.avisos.criado);
  const novo = page.locator("[data-material='checklist-ia-2026']");
  await expect(novo).toContainText("Checklist de IA para vendas");
  await expect(novo).toContainText("resetia.com.br/materiais/?checklist-ia-2026");
  expect(envios.at(-1)).toMatch(/^[0-9a-f-]{36}\/checklist-ia-2026\.pdf$/);
  expect(gravacoes.at(-1)).toEqual({
    metodo: "POST",
    corpo: {
      palavra: "checklist-ia-2026",
      titulo: "Checklist de IA para vendas",
      descricao: "Vinte pontos para revisar antes de começar.",
      publicado: true,
      arquivo: envios.at(-1),
      tamanho: PDF.length,
    },
  });
  // O formulário volta limpo para o próximo.
  await expect(page.getByLabel(t.form.palavra)).toHaveValue("");

  // Editar: muda o título e troca o PDF; o arquivo antigo sai do bucket.
  const antigo = envios.at(-1)!;
  await novo.getByRole("button", { name: t.de(t.editar, "checklist-ia-2026") }).click();
  await expect(page.getByRole("heading", { level: 2, name: t.form.editar("checklist-ia-2026") })).toBeVisible();
  await expect(page.getByLabel(t.form.titulo)).toHaveValue("Checklist de IA para vendas");
  await page.getByLabel(t.form.titulo).fill("Checklist de IA para o time de vendas");
  await page.getByLabel(t.form.arquivo).setInputFiles({ name: "v2.pdf", mimeType: "application/pdf", buffer: PDF });
  await page.getByRole("button", { name: t.form.salvarEdicao }).click();
  await expect(page.getByRole("status")).toHaveText(t.avisos.atualizado);
  await expect(novo).toContainText("Checklist de IA para o time de vendas");
  expect(gravacoes.at(-1)).toMatchObject({
    metodo: "PATCH",
    corpo: { titulo: "Checklist de IA para o time de vendas", arquivo: envios.at(-1) },
  });
  expect(envios.at(-1)).not.toBe(antigo);
  await expect.poll(() => apagados.at(-1)).toBe(antigo);

  // Despublicar: vira rascunho e o atalho para a página some (o link público deixa de funcionar).
  await novo.getByRole("button", { name: t.de(t.despublicar, "checklist-ia-2026") }).click();
  await expect(novo).toContainText(t.rascunho);
  expect(gravacoes.at(-1)).toEqual({ metodo: "PATCH", corpo: { publicado: false } });
  await expect(novo.getByRole("link", { name: t.de(t.abrir, "checklist-ia-2026") })).toHaveCount(0);

  // Excluir pede a confirmação no próprio botão e leva o PDF junto.
  const atual = envios.at(-1)!;
  await novo.getByRole("button", { name: t.de(t.excluir, "checklist-ia-2026") }).click();
  expect(gravacoes.at(-1)!.metodo).toBe("PATCH");
  await novo.getByRole("button", { name: t.de(t.confirmarExclusao, "checklist-ia-2026") }).click();
  await expect(novo).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText(t.avisos.excluido);
  expect(gravacoes.at(-1)).toEqual({ metodo: "DELETE", corpo: null });
  await expect.poll(() => apagados.at(-1)).toBe(atual);
  await expect(brabo).toBeVisible();

  // Sair vale para as duas áreas.
  await page.getByRole("button", { name: admin.sair }).click();
  await expect(page.getByRole("button", { name: admin.login.entrar })).toBeVisible();
});
