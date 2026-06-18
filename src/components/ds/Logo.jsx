import logoBlack from '../../assets/logo/quadratblick-logo-schwarz.png';
import logoWhite from '../../assets/logo/quadratblick-logo-weiss.png';

/**
 * Logo — Quadratblick brand mark.
 * Renders the real logo image; `onDark` picks the white variant for sage/dark grounds,
 * otherwise the black variant is used (e.g. on the light header background).
 */
export function Logo({
  size = 'md',
  onDark = false,
  style = {},
  ...rest
}) {
  const heights = {
    sm: 30,
    md: 36,
    lg: 42,
  };
  const height = heights[size] || heights.md;
  const src = onDark ? logoWhite : logoBlack;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} {...rest}>
      <img src={src} alt="Quadratblick" style={{ height, width: 'auto', display: 'block' }} />
    </span>
  );
}
