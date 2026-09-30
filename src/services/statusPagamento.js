export const formatarStatusPagamento = (status) =>
  String(status ?? "").trim().toLowerCase() === "pendente"
    ? "Pendente do distribuidor"
    : status;
