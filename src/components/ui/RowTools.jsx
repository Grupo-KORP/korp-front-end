import "./RowTools.css";
import IconActionButton from "./IconActionButton";

export default function RowTools({ name, onEdit, onDelete }) {
  return (
    <div className="row-tools" onClick={(event) => event.stopPropagation()}>
      <IconActionButton icon="edit" onClick={onEdit} title={`Editar ${name}`} />
      <IconActionButton icon="delete" onClick={onDelete} title={`Excluir ${name}`} />
    </div>
  );
}
