export function formatBRL(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Aceita "12,50", "12.50", "1.234,56", "1,234.56", "R$ 10,00" etc.
 * Retorna um Number ou NaN se não der pra converter.
 */
export function parseMoney(input) {
  if (input === null || input === undefined) return NaN;
  if (typeof input === "number") return input;

  let s = String(input).trim();
  if (!s) return NaN;

  // remove espaços e símbolos de moeda
  s = s.replace(/\s/g, "").replace(/R\$/gi, "");

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");

  if (hasComma && hasDot) {
    // Assume que o último separador é o decimal
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    const decimalSep = lastComma > lastDot ? "," : ".";
    const thousandsSep = decimalSep === "," ? "." : ",";

    s = s.split(thousandsSep).join(""); // remove milhares
    s = s.replace(decimalSep, ".");     // decimal vira ponto
  } else if (hasComma && !hasDot) {
    // pt-BR típico: 1.234 não existe aqui, então vírgula é decimal
    s = s.replace(/\./g, ""); // remove pontos (caso venham como milhar)
    s = s.replace(",", ".");
  } else {
    // só ponto ou nenhum: remove vírgulas como milhar (1,234.56)
    s = s.replace(/,/g, "");
  }

  return Number(s);
}