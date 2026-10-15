import { useEffect, useId, useRef } from "react";
import { createRoot } from "react-dom/client";
import ActionIcon from "../ui/ActionIcon";
import "./DeleteConfirmation.css";

export default function DeleteConfirmation({ name, entityLabel = "registro", busy = false, onCancel, onConfirm, description }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const id = useId();
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    dialog.showModal();
    cancelRef.current?.focus();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return <dialog ref={dialogRef} className="delete-confirmation" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}
    onKeyDown={(event) => { if (event.key === "Escape") event.stopPropagation(); }}
    onCancel={(event) => { event.preventDefault(); if (!busy) onCancel(); }}
    onClick={(event) => { if (event.target === event.currentTarget && !busy) onCancel(); }}>
    <div className="delete-confirmation-card">
      <div className="delete-confirmation-heading">
        <div className="delete-confirmation-icon" aria-hidden="true"><ActionIcon name="delete" /></div>
        <h2 id={`${id}-title`}>Excluir {entityLabel}?</h2>
      </div>
      <p id={`${id}-description`}>Deseja realmente excluir <strong>{name || entityLabel}</strong>? {description || "Esta ação não pode ser desfeita."}</p>
      <div className="delete-confirmation-actions">
        <button type="button" disabled={busy} onClick={onConfirm} className="delete-confirmation-primary">{busy ? "Excluindo..." : "Excluir"}</button>
        <button ref={cancelRef} type="button" disabled={busy} onClick={onCancel} className="delete-confirmation-secondary">Cancelar</button>
      </div>
    </div>
  </dialog>;
}

let confirmationOpen = false;
export function confirmDelete(options) {
  if (confirmationOpen) return Promise.resolve(false);
  confirmationOpen = true;
  return new Promise((resolve) => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const root = createRoot(host);
    const finish = (confirmed) => {
      root.unmount();
      host.remove();
      confirmationOpen = false;
      resolve(confirmed);
    };
    root.render(<DeleteConfirmation {...options} onCancel={() => finish(false)} onConfirm={() => finish(true)} />);
  });
}
