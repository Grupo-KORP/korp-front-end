export const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

export function maskCNPJ(value) {
  return onlyDigits(value).slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

export function maskCEP(value) {
  return onlyDigits(value).slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

export function maskPhone(value) {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  const split = digits.length > 10 ? 7 : 6;
  const number = digits.length > split ? `${digits.slice(2, split)}-${digits.slice(split)}` : digits.slice(2);
  return `(${digits.slice(0, 2)}) ${number}`;
}

export function formatMoneyInput(value) {
  if (value === "" || value == null) return "";
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "";
}

// Inputs use cents while application state keeps an unformatted decimal value.
export function parseMoneyInput(value) {
  const digits = onlyDigits(value).slice(0, 14);
  return digits ? (Number(digits) / 100).toFixed(2) : "";
}
