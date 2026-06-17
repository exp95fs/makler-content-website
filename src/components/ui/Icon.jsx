import * as icons from 'lucide-react';

function toPascalCase(name) {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/** Icon — thin wrapper around lucide-react, keyed by kebab-case name (as used across the brand kit). */
export function Icon({ name, size = 20, color = 'currentColor', strokeWidth = 1.75, style = {} }) {
  const LucideIcon = icons[toPascalCase(name)];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} style={{ display: 'inline-flex', ...style }} />;
}
