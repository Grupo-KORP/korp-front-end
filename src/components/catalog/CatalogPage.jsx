import { useEffect } from "react";
import NavbarVendedor from "../../layout/NavbarVendedor";
import "./CatalogPage.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10.8 5.2a5.6 5.6 0 1 1 0 11.2 5.6 5.6 0 0 1 0-11.2Zm0 1.8a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Zm4.15 7.25 4.18 4.18-1.27 1.27-4.18-4.18 1.27-1.27Z" />
    </svg>
  );
}

function RegisterIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h9.2L20 7.8V21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm8 1.9V9h4.1L14 4.9ZM6 5v14h12v-8h-6V5H6Zm2 8h8v1.7H8V13Zm0 3h6v1.7H8V16Z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 16.7 15.8 5.9l2.3 2.3L7.3 19H5v-2.3Zm14.4-9.8-2.3-2.3.7-.7a1.5 1.5 0 0 1 2.1 0l.2.2a1.5 1.5 0 0 1 0 2.1l-.7.7Z" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 3h6l.8 2H20v1.8H4V5h4.2L9 3Zm-2.7 5h11.4l-.8 12H7.1L6.3 8Zm2 1.8.55 8.4h6.3l.55-8.4H8.3Zm2.2 1.5h1.6v5.4h-1.6v-5.4Zm3.4 0h1.6v5.4h-1.6v-5.4Z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m7.2 9.4 4.8 4.8 4.8-4.8 1.2 1.2-6 6-6-6 1.2-1.2Z" />
    </svg>
  );
}

function SearchBox({ placeholder }) {
  return (
    <label className="catalog-search" aria-label={placeholder}>
      <SearchIcon />
      <input type="search" placeholder={placeholder} />
    </label>
  );
}

function TablePanel({ title, columns, rows, moreLabel }) {
  const gridTemplate = columns.map((column) => column.width || "1fr").join(" ");

  return (
    <section className="catalog-card catalog-table-card">
      <div className="catalog-section-title">
        <span />
        <h2>{title}</h2>
      </div>

      <div
        className="catalog-table-head"
        style={{ "--catalog-table-columns": `${gridTemplate} 96px` }}
      >
        {columns.map((column) => (
          <span key={column.label}>{column.label}</span>
        ))}
        <span>Ferramentas</span>
      </div>

      <div className="catalog-table-body">
        {rows.map((row) => (
          <article
            className="catalog-row"
            key={row.id}
            style={{ "--catalog-table-columns": `${gridTemplate} 96px` }}
          >
            <div className="catalog-identity">
              <span className="catalog-badge">{row.id}</span>
              <div>
                <strong>{row.title}</strong>
                {row.subtitle && <small>{row.subtitle}</small>}
              </div>
            </div>

            {row.cells.map((cell, index) => (
              <span className={cell.className || ""} key={`${row.id}-${index}`}>
                {cell.value}
              </span>
            ))}

            <div className="catalog-tools">
              <button type="button" aria-label={`Editar ${row.title}`}>
                <EditIcon />
              </button>
              <button type="button" aria-label={`Excluir ${row.title}`}>
                <DeleteIcon />
              </button>
            </div>
          </article>
        ))}
      </div>

      <button className="catalog-more" type="button">
        {moreLabel}
        <ChevronDownIcon />
      </button>
    </section>
  );
}

function FormField({ field, onChange }) {
  const isAuto      = field.readOnly;
  const hasError    = !!field.error;
  const className   = field.span === "full" ? "catalog-form-field is-full" : "catalog-form-field";

  return (
    <label className={`${className}${isAuto ? " is-auto" : ""}${hasError ? " has-error" : ""}`}>
      <span>
        {field.label}
        {field.loading && <span className="catalog-field-spinner" />}
      </span>

      {field.type === "select" ? (
        <select
          name={field.name}
          value={field.value || ""}
          disabled={field.readOnly}
          onChange={onChange}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          name={field.name}
          type={field.type || "text"}
          placeholder={field.placeholder}
          value={field.value || ""}
          readOnly={field.readOnly}
          onChange={onChange}
        />
      )}

      {hasError && <span className="catalog-field-error">{field.error}</span>}
    </label>
  );
} 

function FormPanel({ title, subtitle, fields, submitLabel, onFieldChange, onSubmit, submitDisabled }) {
  return (
    <aside className="catalog-card catalog-form-card">
      <div className="catalog-form-heading">
        <div><RegisterIcon /><h2>{title}</h2></div>
        <p>{subtitle}</p>
      </div>

      <form className="catalog-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="catalog-form-fields">
          {fields.map((field) => (
            <FormField
              field={field}
              onChange={onFieldChange}
              key={field.name}
            />
          ))}
        </div>

        <button type="submit" className="catalog-submit" disabled={submitDisabled}>
          {submitLabel}
        </button>
      </form>
    </aside>
  );
}

export default function CatalogPage({
  eyebrow,
  title,
  searchPlaceholder,
  tableTitle,
  tableColumns,
  rows,
  moreLabel,
  formTitle,
  formSubtitle = "Formul\u00e1rio de Cadastro",
  fields,
  submitLabel = "cadastrar",
  onFieldChange,
  onSubmit,
  submitDisabled = false,
}) {
  useEffect(() => {
    document.body.classList.add("catalog-body");
    return () => document.body.classList.remove("catalog-body");
  }, []);

  return (
    <div className="catalog-shell">
      <NavbarVendedor />

      <main className="catalog-page">
        <div className="catalog-title-block">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
        </div>

        <SearchBox placeholder={searchPlaceholder} />

        <FormPanel
          title={formTitle}
          subtitle={formSubtitle}
          fields={fields}       
          submitLabel={submitLabel}
          onFieldChange={onFieldChange}
          onSubmit={onSubmit}
          submitDisabled={submitDisabled}
        />

        <TablePanel
          title={tableTitle}
          columns={tableColumns}
          rows={rows}
          moreLabel={moreLabel}
        />
      </main>
    </div>
  );
}
