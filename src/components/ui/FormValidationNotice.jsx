export default function FormValidationNotice({ visible }) {
  return (
    <div className="registration-notice" aria-live="polite" aria-atomic="true">
      {visible ? "* Preencha os campos obrigatórios." : ""}
    </div>
  );
}
