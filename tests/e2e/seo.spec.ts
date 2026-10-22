import { expect, test } from "@playwright/test";
import { nav, seo, site } from "@/content/site";
import { solucoes } from "@/content/solucoes";
import { rotas } from "./rotas";

const local = (url: string, base: string) => url.replace(site.dominio, base.replace(/\/$/, ""));

for (const rota of rotas) {
  test(`metadados de ${rota.caminho}`, async ({ page, baseURL }) => {
    await page.goto(rota.caminho);
    await expect(page).toHaveTitle(rota.titulo);
    const descricao = await page.locator("meta[name='description']").getAttribute("content");
    expect(descricao?.length ?? 0).toBeGreaterThan(50);
    await expect(page.locator("link[rel='canonical']")).toHaveAttribute("href", `${site.dominio}${rota.caminho}`);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.locator("h1")).toHaveCount(1);

    const og = (await page.locator("meta[property='og:image']").getAttribute("content"))!;
    expect(og).toMatch(/opengraph-image.*\.png/);
    const resposta = await page.request.get(local(og, baseURL!));
    expect(resposta.status()).toBe(200);
    expect(resposta.headers()["content-type"]).toContain("image/png");
    await expect(page.locator("meta[property='og:image:alt']")).toHaveAttribute("content", /Reset IA/);
  });
}

test("JSON-LD Organization com nome, URL, logo, fundadores e ferramentas", async ({ page }) => {
  await page.goto("/");
  const json = await page.locator("script[type='application/ld+json']").first().textContent();
  const dados = JSON.parse(json!);
  expect(dados["@type"]).toBe("Organization");
  expect(dados.name).toBe(site.nome);
  expect(dados.url).toBe(`${site.dominio}/`);
  expect(dados.logo).toMatch(/^https:\/\/.*logo/);
  expect(dados.sameAs).toEqual(expect.arrayContaining([site.ferramentas.spotlite, site.ferramentas.fluxa]));
  expect(dados.founder.map((f: { name: string }) => f.name)).toEqual([
    site.fundadores.elida.nome,
    site.fundadores.diego.nome,
  ]);
});

test("sitemap, robots e manifest", async ({ request, baseURL }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const rota of rotas) expect(xml).toContain(`<loc>${site.dominio}${rota.caminho}</loc>`);
  for (const s of solucoes.lista) expect(xml).toContain(`<loc>${site.dominio}/solucoes/${s.slug}/</loc>`);
  // home + navegação + sete soluções + privacidade; rotas antigas (/produtos, /spotlite) ficam fora.
  expect(xml.match(/<url>/g)).toHaveLength(2 + nav.length + solucoes.lista.length);
  expect(xml).not.toContain("/produtos/");

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain(`Sitemap: ${site.dominio}/sitemap.xml`);

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.status()).toBe(200);
  const m = await manifest.json();
  expect(m.name).toBe(site.nome);
  expect(m.icons.length).toBeGreaterThanOrEqual(3);
  for (const icone of m.icons) expect((await request.get(`${baseURL}${icone.src}`)).status()).toBe(200);
  expect(seo.home.title).toBe(rotas[0].titulo);
});
