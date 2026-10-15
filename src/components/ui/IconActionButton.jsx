import ActionIcon from "./ActionIcon";
import "./IconActionButton.css";

export default function IconActionButton({ icon, title, className = "", contrast = false, ...props }) {
  return (
    <button type="button" title={title} aria-label={title}
      className={`icon-action icon-action-${icon} ${contrast ? "icon-action-contrast" : ""} ${className}`} {...props}>
      <ActionIcon name={icon} />
    </button>
  );
}
