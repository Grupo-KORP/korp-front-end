import ActionIcon from "./ActionIcon.jsx";
import { formatarStatusPagamento } from "../../services/statusPagamento.js";
import "./StatusComissaoCell.css";

const normalizarStatus = (status) => String(status ?? "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");

export default function StatusComissaoCell({ status, identificador, disabled = false, onEdit }) {
  const rotulo = formatarStatusPagamento(status) || "Não informado";

  return (
    <div className="comissoes-status-cell">
      <span className={`comissoes-status status-${normalizarStatus(status)}`}>{rotulo}</span>
      <button
        type="button"
        className="comissoes-status-edit-button"
        aria-label={`Alterar status da comissão ${identificador}`}
        title={disabled ? "Identificador da comissão indisponível" : "Editar status"}
        disabled={disabled}
        onClick={onEdit}
      >
        <ActionIcon name="edit" />
      </button>
    </div>
  );
}