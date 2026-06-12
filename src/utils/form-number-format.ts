const integerFormatter = new Intl.NumberFormat("pt-BR");

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatIntegerInput(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "";
  return integerFormatter.format(value);
}

export function parseIntegerInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;
  return Number(digits);
}

export function formatCurrencyInput(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return "";
  return currencyFormatter.format(value);
}

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;
  return Number(digits) / 100;
}
