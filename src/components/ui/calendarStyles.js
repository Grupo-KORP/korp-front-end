export function calendarStyles(dark) {
  return {
    trigger: dark
      ? "border-gray-600 bg-gray-800 text-gray-300 hover:text-blue-300 focus-visible:ring-blue-300"
      : "border-gray-200 bg-white text-gray-700 hover:text-brand-blue-btn focus-visible:ring-brand-blue-btn",
    hover: dark
      ? "enabled:hover:text-blue-300"
      : "enabled:hover:text-brand-blue-btn",
    text: dark ? "text-gray-300" : "text-gray-700",
    selected: "bg-brand-blue-btn text-white font-medium",
    today: dark ? "border border-blue-300 text-blue-300" : "border border-brand-blue-btn text-brand-blue-btn",
    confirm: "bg-brand-blue-btn text-white enabled:hover:bg-brand-blue transition-colors",
  };
}
