/** Marca, nos textos da síntese, o lugar do nome da empresa (ou de "Sua empresa"): trocada só na hora de mostrar. */
export const QUEM = "{quem}";

export const comQuem = (texto: string, quem: string) => texto.replaceAll(QUEM, quem);
