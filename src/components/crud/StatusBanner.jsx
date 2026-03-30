export function StatusBanner({ type, message }) {
  if (!message) {
    return null
  }

  return <div className={`status-banner ${type}`}>{message}</div>
}
