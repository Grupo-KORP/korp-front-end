const paths = {
  edit: "m16 4 4 4M4 20l4-1L20 7a2.83 2.83 0 0 0-4-4L4 15l-1 6Z",
  delete: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
  add: "M12 5v14M5 12h14",
  close: "m6 6 12 12M6 18 18 6",
  check: "m5 12 4 4L19 6",
  search: "m21 21-4.5-4.5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
};

export default function ActionIcon({ name }) {
  return (
    <svg className="app-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
