/* @ds-bundle: {"format":3,"namespace":"MaklerContentDesignSystem_a211b6","components":[{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"Badge","sourcePath":"components/content/Badge.jsx"},{"name":"Card","sourcePath":"components/content/Card.jsx"},{"name":"Divider","sourcePath":"components/content/Divider.jsx"},{"name":"Eyebrow","sourcePath":"components/content/Eyebrow.jsx"},{"name":"MediaFrame","sourcePath":"components/content/MediaFrame.jsx"},{"name":"StatBlock","sourcePath":"components/content/StatBlock.jsx"},{"name":"Tag","sourcePath":"components/content/Tag.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Textarea","sourcePath":"components/forms/Textarea.jsx"}],"sourceHashes":{"components/brand/Logo.jsx":"36aca16cc677","components/buttons/Button.jsx":"b1eb9c489489","components/content/Badge.jsx":"2b47045c870f","components/content/Card.jsx":"49398d01fbf4","components/content/Divider.jsx":"bc04ef62cb91","components/content/Eyebrow.jsx":"623605ba0c33","components/content/MediaFrame.jsx":"1120aa5b1718","components/content/StatBlock.jsx":"cc26b6db331c","components/content/Tag.jsx":"bb0f5a5e1d84","components/forms/Input.jsx":"b9c155cab780","components/forms/Textarea.jsx":"52c3b9d7b8b5","ui_kits/onepager/Branding.jsx":"0e84c54d662f","ui_kits/onepager/FaqContact.jsx":"f3748853e4e2","ui_kits/onepager/Flow.jsx":"cdef131403a3","ui_kits/onepager/NavHero.jsx":"228a3b6c0598","ui_kits/onepager/Value.jsx":"1a46e358281b","ui_kits/onepager/ui.jsx":"71897e6f48dd","ui_kits/website/Contact.jsx":"5bac067d5563","ui_kits/website/Footer.jsx":"028f2ae070b1","ui_kits/website/Header.jsx":"c1bf64104369","ui_kits/website/Hero.jsx":"755e730372e3","ui_kits/website/Portfolio.jsx":"e322d94e2357","ui_kits/website/Process.jsx":"6c4e96e5c710","ui_kits/website/Services.jsx":"bd351e3f23c9","ui_kits/website/ui.jsx":"3f251eeff9ef"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.MaklerContentDesignSystem_a211b6 = window.MaklerContentDesignSystem_a211b6 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Logo — Makler-Content wordmark + "M" mark.
 * PLACEHOLDER identity built from brand tokens (no final logo exists yet).
 * `onDark` for sage/photo grounds; `markOnly` for favicons/avatars.
 */
function Logo({
  size = 'md',
  onDark = false,
  markOnly = false,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      mark: 28,
      font: 16,
      radius: 'var(--radius-sm)'
    },
    md: {
      mark: 40,
      font: 22,
      radius: 'var(--radius-md)'
    },
    lg: {
      mark: 56,
      font: 30,
      radius: 'var(--radius-lg)'
    }
  };
  const s = sizes[size] || sizes.md;
  const markBg = onDark ? 'var(--color-accent)' : 'var(--color-primary)';
  const markFg = onDark ? 'var(--color-on-accent)' : 'var(--color-on-primary)';
  const wordColor = onDark ? 'var(--color-on-primary)' : 'var(--text-strong)';
  const mark = /*#__PURE__*/React.createElement("span", {
    style: {
      width: s.mark,
      height: s.mark,
      flex: 'none',
      borderRadius: s.radius,
      background: markBg,
      color: markFg,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: s.font,
      lineHeight: 1
    }
  }, "M");
  if (markOnly) {
    return /*#__PURE__*/React.createElement("span", _extends({
      style: {
        display: 'inline-flex',
        ...style
      }
    }, rest), mark);
  }
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      ...style
    }
  }, rest), mark, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: s.font,
      letterSpacing: 'var(--ls-heading)',
      color: wordColor,
      whiteSpace: 'nowrap'
    }
  }, "Makler", /*#__PURE__*/React.createElement("span", {
    style: {
      color: onDark ? 'var(--color-secondary)' : 'var(--color-accent)'
    }
  }, "\xB7"), "Content"));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Button — Makler-Content primary action.
 * Variants: primary (terracotta), secondary (sage), ghost (terracotta outline), link.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      fontSize: '13px',
      padding: '9px 16px',
      gap: '7px'
    },
    md: {
      fontSize: '15px',
      padding: '13px 24px',
      gap: '9px'
    },
    lg: {
      fontSize: '16px',
      padding: '16px 32px',
      gap: '10px'
    }
  };
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-body-bold)',
    lineHeight: 1,
    letterSpacing: '0.005em',
    borderRadius: 'var(--radius-sm)',
    border: '1.5px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.45 : 1,
    transition: 'background var(--dur-fast) var(--ease-soft), color var(--dur-fast) var(--ease-soft), border-color var(--dur-fast) var(--ease-soft), transform var(--dur-fast) var(--ease-soft)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: 'var(--action-primary)',
      color: 'var(--color-on-accent)'
    },
    secondary: {
      background: 'var(--action-secondary)',
      color: 'var(--color-on-primary)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-accent)',
      borderColor: 'var(--color-accent)'
    },
    link: {
      background: 'transparent',
      color: 'var(--color-accent)',
      padding: '4px 2px',
      borderRadius: '4px'
    }
  };
  const [hover, setHover] = React.useState(false);
  const hovers = {
    primary: {
      background: 'var(--action-primary-hover)'
    },
    secondary: {
      background: 'var(--action-secondary-hover)'
    },
    ghost: {
      background: 'var(--color-accent-tint)'
    },
    link: {
      color: 'var(--color-accent-deep)'
    }
  };
  const composed = {
    ...base,
    ...variants[variant],
    ...(hover && !disabled ? hovers[variant] : {}),
    ...style
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: composed
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/content/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Badge — small status/category pill. Earthy tones. */
function Badge({
  children,
  tone = 'neutral',
  style = {},
  ...rest
}) {
  const tones = {
    neutral: {
      background: 'var(--surface-sunk)',
      color: 'var(--text-muted)'
    },
    sage: {
      background: 'var(--color-primary-tint)',
      color: 'var(--color-primary-deep)'
    },
    accent: {
      background: 'var(--color-accent-tint)',
      color: 'var(--color-accent-deep)'
    },
    success: {
      background: '#E2E7DA',
      color: 'var(--status-success)'
    },
    solid: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)'
    }
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '12px',
      lineHeight: 1,
      letterSpacing: '0.02em',
      padding: '6px 11px',
      borderRadius: 'var(--radius-pill)',
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Badge.jsx", error: String((e && e.message) || e) }); }

// components/content/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — surface container with hairline border and warm soft shadow.
 * `interactive` adds a hover lift. `tone` switches the fill.
 */
function Card({
  children,
  tone = 'surface',
  interactive = false,
  padding = 'lg',
  style = {},
  onClick,
  ...rest
}) {
  const tones = {
    surface: {
      background: 'var(--surface-card)',
      color: 'var(--text-body)'
    },
    taupe: {
      background: 'var(--surface-raised)',
      color: 'var(--text-body)'
    },
    sage: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)'
    }
  };
  const pads = {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px'
  };
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-hair)',
      boxShadow: hover && interactive ? 'var(--shadow-lg)' : 'var(--shadow-md)',
      padding: pads[padding],
      transition: 'transform var(--dur-base) var(--ease-standard), box-shadow var(--dur-base) var(--ease-standard)',
      transform: hover && interactive ? 'translateY(-3px)' : 'none',
      cursor: interactive ? 'pointer' : 'default',
      ...tones[tone],
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Card.jsx", error: String((e && e.message) || e) }); }

// components/content/Divider.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Divider — hairline rule. Optional centered ornament dot in terracotta. */
function Divider({
  ornament = false,
  style = {},
  ...rest
}) {
  if (ornament) {
    return /*#__PURE__*/React.createElement("div", _extends({
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        ...style
      }
    }, rest), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: '1px',
        background: 'var(--border-hair)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        width: '5px',
        height: '5px',
        borderRadius: '50%',
        background: 'var(--color-accent)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: '1px',
        background: 'var(--border-hair)'
      }
    }));
  }
  return /*#__PURE__*/React.createElement("hr", _extends({
    style: {
      border: 'none',
      height: '1px',
      background: 'var(--border-hair)',
      margin: 0,
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Divider.jsx", error: String((e && e.message) || e) }); }

// components/content/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Eyebrow — small uppercase kicker above headlines. The only uppercase in the system. */
function Eyebrow({
  children,
  color = 'accent',
  style = {},
  ...rest
}) {
  const colors = {
    accent: 'var(--color-accent)',
    muted: 'var(--text-muted)',
    onDark: 'var(--color-on-primary)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: 'var(--fs-caption)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: colors[color] || colors.accent,
      display: 'inline-block',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/content/MediaFrame.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * MediaFrame — rounded image frame, the brand's hero device for photography.
 * Warm taupe placeholder when no `src`. Optional scrim + caption overlay.
 */
function MediaFrame({
  src = null,
  alt = '',
  ratio = '4 / 3',
  radius = 'xl',
  caption = null,
  eyebrow = null,
  scrim = false,
  placeholderLabel = 'Immobilien-Foto',
  style = {},
  ...rest
}) {
  const radii = {
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)'
  };
  const hasOverlay = scrim || caption || eyebrow;
  return /*#__PURE__*/React.createElement("figure", _extends({
    style: {
      position: 'relative',
      margin: 0,
      aspectRatio: ratio,
      borderRadius: radii[radius] || radii.xl,
      overflow: 'hidden',
      background: 'var(--color-secondary)',
      boxShadow: 'var(--shadow-lg)',
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-primary)',
      opacity: 0.55,
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '12px',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase'
    }
  }, placeholderLabel), hasOverlay && /*#__PURE__*/React.createElement("figcaption", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      padding: '22px',
      background: scrim || caption || eyebrow ? 'linear-gradient(to top, var(--color-overlay), rgba(42,42,34,0) 58%)' : 'none'
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: 'var(--fs-caption)',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--color-secondary)',
      marginBottom: '6px'
    }
  }, eyebrow), caption && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '20px',
      lineHeight: 1.15,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--color-on-primary)'
    }
  }, caption)));
}
Object.assign(__ds_scope, { MediaFrame });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/MediaFrame.jsx", error: String((e && e.message) || e) }); }

// components/content/StatBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * StatBlock — a single Fraunces figure with a Mulish label. Used in proof bands.
 */
function StatBlock({
  value,
  label,
  tone = 'default',
  style = {},
  ...rest
}) {
  const color = tone === 'onDark' ? 'var(--color-on-primary)' : 'var(--text-strong)';
  const labelColor = tone === 'onDark' ? 'rgba(243,238,229,0.72)' : 'var(--text-muted)';
  const accent = tone === 'onDark' ? 'var(--color-secondary)' : 'var(--color-accent)';
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '40px',
      lineHeight: 1,
      letterSpacing: 'var(--ls-heading)',
      color
    }
  }, value), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '12px',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: labelColor
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: accent
    }
  }, "\xB7\xA0"), label));
}
Object.assign(__ds_scope, { StatBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/StatBlock.jsx", error: String((e && e.message) || e) }); }

// components/content/Tag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Tag — outlined chip for filters / categories, optionally selectable. */
function Tag({
  children,
  selected = false,
  onClick,
  style = {},
  ...rest
}) {
  const interactive = typeof onClick === 'function';
  return /*#__PURE__*/React.createElement("span", _extends({
    onClick: onClick,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '7px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '13px',
      lineHeight: 1,
      padding: '8px 15px',
      borderRadius: 'var(--radius-pill)',
      border: '1px solid',
      borderColor: selected ? 'var(--color-primary)' : 'var(--border-hair)',
      background: selected ? 'var(--color-primary)' : 'transparent',
      color: selected ? 'var(--color-on-primary)' : 'var(--text-muted)',
      cursor: interactive ? 'pointer' : 'default',
      transition: 'all var(--dur-fast) var(--ease-soft)',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Input — labelled text field on warm surface. */
function Input({
  label,
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  hint,
  error,
  disabled = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `in-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '13px',
      color: 'var(--text-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    type: type,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body)',
      fontSize: '15px',
      color: 'var(--text-body)',
      background: 'var(--surface-card)',
      border: '1px solid',
      borderColor: error ? 'var(--status-danger)' : focus ? 'var(--color-accent)' : 'var(--border-hair)',
      boxShadow: focus ? '0 0 0 3px var(--color-accent-tint)' : 'none',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 14px',
      outline: 'none',
      opacity: disabled ? 0.5 : 1,
      transition: 'border-color var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)'
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      color: error ? 'var(--status-danger)' : 'var(--text-muted)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Textarea — multi-line field matching Input styling. */
function Textarea({
  label,
  id,
  placeholder = '',
  value,
  onChange,
  rows = 4,
  hint,
  disabled = false,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `ta-${String(label).toLowerCase().replace(/\s+/g, '-')}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '13px',
      color: 'var(--text-strong)'
    }
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: inputId,
    placeholder: placeholder,
    value: value,
    onChange: onChange,
    rows: rows,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-body)',
      background: 'var(--surface-card)',
      border: '1px solid',
      borderColor: focus ? 'var(--color-accent)' : 'var(--border-hair)',
      boxShadow: focus ? '0 0 0 3px var(--color-accent-tint)' : 'none',
      borderRadius: 'var(--radius-sm)',
      padding: '12px 14px',
      outline: 'none',
      resize: 'vertical',
      opacity: disabled ? 0.5 : 1,
      transition: 'border-color var(--dur-fast) var(--ease-soft), box-shadow var(--dur-fast) var(--ease-soft)'
    }
  }, rest)), hint && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12px',
      color: 'var(--text-muted)'
    }
  }, hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Textarea.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onepager/Branding.jsx
try { (() => {
/* NEW — Personal Branding / Markenbildung (sage full-bleed) + USP. */

function Branding({
  onNav
}) {
  const {
    Button,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container
  } = window;
  const pillars = [{
    icon: 'layers',
    title: 'Konsistente Bildsprache',
    text: 'Eine durchgängige Handschrift über alle Objekte hinweg — Ihr Büro wird auf den ersten Blick wiedererkannt.'
  }, {
    icon: 'megaphone',
    title: 'Sie als Gesicht der Region',
    text: 'Makler-Reels, Porträt- und Experten-Content, der Vertrauen aufbaut, bevor das erste Gespräch beginnt.'
  }, {
    icon: 'badge-check',
    title: 'Strategie statt Einzelclips',
    text: 'Ein roter Faden für Portale, Social Media und Website — geplant, nicht zufällig.'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "sage"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '60ch'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "onDark"
  }, "Ausbaustufe \xB7 Markenbildung"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)',
      lineHeight: 1.14,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--color-on-primary)',
      margin: '14px 0 0',
      textWrap: 'balance'
    }
  }, "Nicht nur das Objekt \u2014 Ihr Maklerb\xFCro als Marke."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--color-secondary)',
      margin: '16px 0 0'
    }
  }, "Einzelne Objekte zu vermarkten ist der Anfang. Der eigentliche Hebel liegt darin, Sie und Ihr B\xFCro als feste Gr\xF6\xDFe in der Region sichtbar zu machen \u2014 ob etabliertes Maklerb\xFCro oder eigenst\xE4ndiger Makler.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '18px',
      marginTop: 'clamp(32px, 4vw, 46px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(248px, 1fr))'
    }
  }, pillars.map(p => /*#__PURE__*/React.createElement("div", {
    key: p.title,
    style: {
      background: 'rgba(243,238,229,0.07)',
      border: '1px solid rgba(243,238,229,0.16)',
      borderRadius: 'var(--radius-lg)',
      padding: '26px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '44px',
      height: '44px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-accent)',
      color: 'var(--color-on-accent)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: p.icon,
    size: 21
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '18px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--color-on-primary)',
      margin: '16px 0 8px'
    }
  }, p.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--color-secondary)',
      margin: 0
    }
  }, p.text)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      flexWrap: 'wrap',
      marginTop: 'clamp(28px, 4vw, 40px)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '15px',
      color: 'var(--color-on-primary)',
      margin: 0,
      maxWidth: '46ch',
      lineHeight: 1.55
    }
  }, "Wir starten beim einzelnen Objekt \u2014 und bauen daraus Schritt f\xFCr Schritt Ihre Marke."), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    }),
    onClick: () => onNav('anfrage')
  }, "Markenbildung besprechen"))));
}
function Usp() {
  const {
    Container,
    SectionHead
  } = window;
  const usps = [{
    n: '1',
    title: 'Alles aus einer Hand',
    text: 'Strategie, Konzept, Dreh, Schnitt und Feinschliff — alles aus einer Hand. Ein Ansprechpartner statt vieler Schnittstellen: keine Overhead-Kosten, keine Reibungsverluste.'
  }, {
    n: '2',
    title: 'Bewusst auf wenige Kunden begrenzt',
    text: 'Wir arbeiten gezielt mit wenigen Kunden gleichzeitig. So bleiben die Wege kurz und die Lieferung schnell — jedes Objekt bekommt die volle Aufmerksamkeit.'
  }, {
    n: '3',
    title: 'Konsistenter, hochwertiger Look',
    text: 'Eine durchgängige Bildsprache, die die Wertigkeit Ihres Maklerbüros unterstreicht — Objekt für Objekt wiedererkennbar.'
  }, {
    n: '4',
    title: 'Gedacht aus Sicht der Zielgruppe',
    text: 'Wir denken aus der Perspektive Ihrer Käufer und Mieter — und rücken genau das in den Fokus, was für diese Zielgruppe wirklich zählt. So spricht jedes Bild die richtigen Menschen an.'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Was uns von anderen Anbietern unterscheidet",
    title: 'Alles aus einer Hand — gedacht aus Sicht Ihrer Zielgruppe.'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(32px, 4vw, 46px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))'
    }
  }, usps.map(u => /*#__PURE__*/React.createElement("div", {
    key: u.n,
    style: {
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hair)',
      borderRadius: 'var(--radius-lg)',
      padding: '28px',
      boxShadow: 'var(--shadow-sm)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-accent-tint)',
      color: 'var(--color-accent-deep)',
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '18px'
    }
  }, u.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '19px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '16px 0 8px'
    }
  }, u.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, u.text)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '26px',
      background: 'var(--color-accent-tint)',
      border: '1px solid var(--color-accent)',
      borderRadius: 'var(--radius-md)',
      padding: '18px 22px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      lineHeight: 1.6,
      color: 'var(--text-body)',
      margin: 0
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--color-accent-deep)',
      fontWeight: 'var(--fw-body-bold)'
    }
  }, "Die Chance:"), ' ', "Nur rund 9 % der Makler produzieren objektspezifische Videos \u2014 regional noch weniger. Wer jetzt auf konzipiertes Bewegtbild setzt, hebt sich ab, solange es kaum jemand tut."))));
}
Object.assign(window, {
  Branding,
  Usp
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onepager/Branding.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onepager/FaqContact.jsx
try { (() => {
/* FAQ (accordion) + Contact form (success state) + Footer. */

function Faq() {
  const {
    Container,
    SectionHead,
    Icon
  } = window;
  const items = [{
    q: 'Lohnt sich das wirtschaftlich?',
    a: 'Die Zahlen sprechen dafür: Objekte mit Profi-Fotos verkaufen rund 32 % schneller, Inserate mit Video erhalten ein Vielfaches an Anfragen, und Ferienobjekte mit guten Fotos werden deutlich öfter gebucht. Schnellere Vermittlung und qualifiziertere Anfragen sparen Ihnen Zeit und Folgekosten — der Content amortisiert sich meist über ein einziges Objekt.'
  }, {
    q: 'Machen Sie auch Vermietung und Ferienwohnungen?',
    a: 'Ja. Neben Verkaufsobjekten produziere ich gezielt Content für Miet- und Ferienobjekte (z. B. Airbnb/Booking) — dort wirkt guter Content auf Buchungsrate und erzielbaren Preis besonders stark.'
  }, {
    q: 'Warum gratis — wo ist der Haken?',
    a: 'Keiner. Ich baue mein Portfolio auf und brauche dafür echte Objekte in Top-Qualität. Sie bekommen das fertige Ergebnis, ich bekomme eine Referenz. Fairer Tausch.'
  }, {
    q: 'Was kostet es danach?',
    a: 'Nichts, solange Sie nichts weiter beauftragen. Möchten Sie weitere Objekte, liegt eine Einzelproduktion bei 320–1.590 € je nach Umfang; für regelmäßigen Objektfluss gibt es planbare Monatspakete. Völlig unverbindlich.'
  }, {
    q: 'Wie viel Zeit kostet mich das?',
    a: '10 Minuten Briefing und Zugang zum Objekt. Den Rest mache ich.'
  }, {
    q: 'Wem gehören die Aufnahmen?',
    a: 'Sie erhalten die volle Nutzung für Vermarktung und Ihre Kanäle. Ich darf das Ergebnis als Arbeitsprobe zeigen.'
  }];
  const [open, setOpen] = React.useState(0);
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    align: "center",
    eyebrow: "H\xE4ufige Fragen",
    title: "Bevor Sie anfragen."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '820px',
      margin: 'clamp(28px, 4vw, 40px) auto 0',
      display: 'grid',
      gap: '12px'
    }
  }, items.map((it, i) => {
    const isOpen = open === i;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        background: 'var(--surface-card)',
        border: '1px solid',
        borderColor: isOpen ? 'var(--color-accent)' : 'var(--border-hair)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'border-color var(--dur-fast) var(--ease-soft)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: () => setOpen(isOpen ? -1 : i),
      style: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '18px 22px',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'var(--font-body)',
        fontWeight: 'var(--fw-body-bold)',
        fontSize: '16px',
        color: 'var(--text-strong)'
      }
    }, /*#__PURE__*/React.createElement("span", null, it.q), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 'none',
        color: 'var(--color-accent)',
        transform: isOpen ? 'rotate(45deg)' : 'none',
        transition: 'transform var(--dur-base) var(--ease-standard)'
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: "plus",
      size: 20,
      color: "var(--color-accent)"
    }))), isOpen && /*#__PURE__*/React.createElement("p", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: '14.5px',
        lineHeight: 'var(--lh-normal)',
        color: 'var(--text-muted)',
        margin: 0,
        padding: '0 22px 20px'
      }
    }, it.a));
  }))));
}
function ContactForm() {
  const {
    Input,
    Textarea,
    Button,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container
  } = window;
  const [sent, setSent] = React.useState(false);
  const selectStyle = {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-body)',
    fontSize: '15px',
    color: 'var(--text-body)',
    background: 'var(--surface-card)',
    border: '1px solid var(--border-hair)',
    borderRadius: 'var(--radius-sm)',
    padding: '12px 14px',
    outline: 'none',
    width: '100%',
    appearance: 'none',
    cursor: 'pointer'
  };
  return /*#__PURE__*/React.createElement(Section, {
    bg: "surface",
    id: "anfrage",
    divider: true
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: '60ch',
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Jetzt anfragen"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
      lineHeight: 1.16,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 0',
      textWrap: 'balance'
    }
  }, "Sichern Sie sich einen der 3 Pilotpl\xE4tze."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '14px auto 0'
    }
  }, "Kurz Ihre Eckdaten \u2014 ich melde mich innerhalb von 24 Stunden mit einem Terminvorschlag.")), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '580px',
      margin: 'clamp(28px, 4vw, 40px) auto 0',
      background: 'var(--bg-page)',
      border: '1px solid var(--border-hair)',
      borderRadius: 'var(--radius-lg)',
      padding: 'clamp(28px, 4vw, 38px)',
      boxShadow: 'var(--shadow-md)'
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: '14px',
      padding: '16px 0'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '54px',
      height: '54px',
      borderRadius: '50%',
      background: 'var(--color-primary-tint)',
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 28,
    color: "var(--color-primary)"
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '23px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: 0
    }
  }, "Danke \u2014 ich melde mich."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0,
      maxWidth: '44ch'
    }
  }, "Ihre Anfrage ist angekommen. Sie h\xF6ren innerhalb von 24 Stunden von mir \u2014 mit einem Terminvorschlag f\xFCr Ihr Pilot-Objekt."), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md",
    onClick: () => setSent(false)
  }, "Weitere Anfrage")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Ihr Name",
    placeholder: "Vor- und Nachname",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Maklerb\xFCro",
    placeholder: "Name Ihres B\xFCros",
    required: true
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px'
    }
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "mc-ziel",
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '13px',
      color: 'var(--text-strong)'
    }
  }, "Ziel"), /*#__PURE__*/React.createElement("select", {
    id: "mc-ziel",
    style: selectStyle
  }, /*#__PURE__*/React.createElement("option", null, "Verkauf"), /*#__PURE__*/React.createElement("option", null, "Vermietung"), /*#__PURE__*/React.createElement("option", null, "Ferienwohnung / Kurzzeit"), /*#__PURE__*/React.createElement("option", null, "Noch offen"))), /*#__PURE__*/React.createElement(Input, {
    label: "E-Mail oder Telefon",
    placeholder: "So erreiche ich Sie",
    required: true
  }), /*#__PURE__*/React.createElement(Textarea, {
    label: "Objekt / Nachricht (optional)",
    rows: 3,
    placeholder: "Kurz zum Objekt, das Sie im Kopf haben"
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    style: {
      width: '100%'
    }
  }, "Gratis-Pilot anfragen"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      textAlign: 'center',
      margin: '4px 0 0',
      lineHeight: 1.5
    }
  }, "Ihre Angaben werden ausschlie\xDFlich zur Kontaktaufnahme genutzt. [Platzhalter: Datenschutz-Hinweis]")))));
}
function SiteFooter({
  onNav
}) {
  const {
    Logo,
    Divider
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Container
  } = window;
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)'
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      padding: 'clamp(44px, 6vw, 64px) var(--container-pad) 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '24px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '42ch'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "md",
    onDark: true
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: '14.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--color-secondary)',
      margin: '16px 0 0'
    }
  }, "Fabian [Nachname] \xB7 Foto- & Videoproduktion f\xFCr Immobilien \xB7 Verkauf & Vermietung \xB7 Raum B\xFChl \xB7 Baden-Baden \xB7 Rastatt")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      color: 'var(--color-on-primary)',
      lineHeight: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: 0.86
    }
  }, "[Platzhalter: E-Mail]"), /*#__PURE__*/React.createElement("div", {
    style: {
      opacity: 0.86
    }
  }, "[Platzhalter: Telefon]"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '16px',
      marginTop: '4px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav('top');
    },
    style: {
      color: 'var(--color-secondary)',
      textDecoration: 'none'
    }
  }, "Impressum"), /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav('top');
    },
    style: {
      color: 'var(--color-secondary)',
      textDecoration: 'none'
    }
  }, "Datenschutz")))), /*#__PURE__*/React.createElement(Divider, {
    style: {
      background: 'rgba(243,238,229,0.16)',
      margin: '28px 0 0'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--color-secondary)',
      margin: '20px 0 0'
    }
  }, "\xA9 2026 \xB7 Markenname & Logo sind Platzhalter und werden sp\xE4ter ersetzt.")));
}
Object.assign(window, {
  Faq,
  ContactForm,
  SiteFooter
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onepager/FaqContact.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onepager/Flow.jsx
try { (() => {
/* Process (4 steps) + Portfolio (placeholders) + Offer (pilot) + About (Fabian). */

function Process() {
  const {
    Container,
    SectionHead
  } = window;
  const steps = [{
    n: '01',
    title: 'Kurzes Briefing',
    text: '10 Minuten am Telefon — Objekt, Ziel (Verkauf/Vermietung), Termin.'
  }, {
    n: '02',
    title: 'Ein Termin vor Ort',
    text: 'Fotos und Video in einem Durchgang. Sie müssen nicht dabei sein.'
  }, {
    n: '03',
    title: 'Konzipierter Schnitt',
    text: 'Geschnitten nach Konzept, nicht nach Schema — inklusive vertikalem Reel.'
  }, {
    n: '04',
    title: 'Lieferung in 48 h',
    text: 'Fotos + Objektvideo + Reel, sofort einsatzbereit für Portale und Kanäle.'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "surface",
    divider: true
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "So l\xE4uft's ab",
    title: "In vier Schritten zum fertigen Objekt-Content."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(32px, 4vw, 46px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
    }
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '34px',
      color: 'var(--color-accent)',
      lineHeight: 1,
      letterSpacing: 'var(--ls-heading)'
    }
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '18px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 8px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, s.text))))));
}
function Portfolio() {
  const {
    MediaFrame
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Container,
    SectionHead
  } = window;
  const slots = ['Referenzobjekt 1 · Verkauf', 'Referenzobjekt 2 · Vermietung', 'Referenzobjekt 3 · Video + Bildstrecke'];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page",
    id: "portfolio"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Arbeitsproben",
    title: "Die ersten Referenzobjekte entstehen gerade.",
    lead: "Ich baue mein regionales Portfolio auf. Wenn Sie ein passendes Objekt haben \u2014 zum Verkauf oder zur Vermietung \u2014 kann Ihr Objekt eines davon sein. Kostenlos. Wie das funktioniert, lesen Sie gleich."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '18px',
      marginTop: 'clamp(28px, 4vw, 40px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
    }
  }, slots.map(s => /*#__PURE__*/React.createElement(MediaFrame, {
    key: s,
    ratio: "16 / 10",
    radius: "lg",
    placeholderLabel: s
  })))));
}
function Offer({
  onNav
}) {
  const {
    Button
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container
  } = window;
  const list = [{
    b: 'Was Sie bekommen:',
    t: ' komplette Produktion — konzipiertes Objektvideo (60–90 s) + vertikales Reel + bearbeitete Objektfotos. Für Verkauf oder Vermietung.'
  }, {
    b: 'Was ich dafür möchte:',
    t: ' Ihr Einverständnis, das Ergebnis als Referenz zeigen zu dürfen — und ehrliches Feedback.'
  }, {
    b: 'Was nicht dahintersteckt:',
    t: ' kein Abo, keine versteckten Kosten, keine Verpflichtung. Gefällt es Ihnen, sprechen wir über die nächsten Objekte. Wenn nicht, behalten Sie den Content trotzdem.'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: '780px',
      margin: '0 auto',
      textAlign: 'center',
      background: 'var(--surface-card)',
      border: '1.5px solid var(--color-accent)',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(32px, 5vw, 56px)',
      boxShadow: 'var(--shadow-lg)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      marginBottom: '14px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '13px',
      letterSpacing: '0.04em',
      color: 'var(--color-accent-deep)',
      background: 'var(--color-accent-tint)',
      border: '1px solid var(--color-accent)',
      padding: '7px 16px',
      borderRadius: 'var(--radius-pill)'
    }
  }, "Nur 3 Pilotpl\xE4tze in der Region"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
      lineHeight: 1.16,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: 0,
      textWrap: 'balance'
    }
  }, "Eine ehrliche Sache: Ich suche 3 Objekte f\xFCr mein Portfolio."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '16px auto 0',
      maxWidth: '60ch'
    }
  }, "Ich bin neu am Markt im Raum B\xFChl / Baden-Baden und baue mein Referenz-Portfolio auf. Statt Versprechen zu machen, zeige ich Ihnen lieber das Ergebnis \u2014 an einem Ihrer Objekte."), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '24px 0',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      justifyContent: 'center',
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      color: 'var(--text-muted)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Regul\xE4rer Wert: ", /*#__PURE__*/React.createElement("span", {
    style: {
      textDecoration: 'line-through'
    }
  }, "840 \u20AC")), /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 16,
    color: "var(--text-muted)"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '26px',
      color: 'var(--status-success)'
    }
  }, "0 \u20AC"), /*#__PURE__*/React.createElement("span", null, "f\xFCr die ersten 3 Pilot-Objekte")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '12px',
      maxWidth: '600px',
      margin: '0 auto',
      textAlign: 'left'
    }
  }, list.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.b,
    style: {
      display: 'flex',
      gap: '12px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: '2px',
      flex: 'none',
      color: 'var(--status-success)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 18,
    color: "var(--status-success)"
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      lineHeight: 1.55,
      color: 'var(--text-body)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontWeight: 'var(--fw-body-bold)',
      color: 'var(--text-strong)'
    }
  }, l.b), l.t)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '28px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    onClick: () => onNav('anfrage')
  }, "Pilotplatz sichern (3 frei)")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--text-muted)',
      margin: '18px 0 0'
    }
  }, "Bewusst begrenzt \u2014 damit jedes Objekt die volle Aufmerksamkeit bekommt."))));
}
function About() {
  const {
    MediaFrame,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Container
  } = window;
  return /*#__PURE__*/React.createElement(Section, {
    bg: "surface",
    divider: true
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'clamp(28px, 5vw, 48px)',
      alignItems: 'center',
      gridTemplateColumns: 'minmax(0, 0.82fr) minmax(0, 1.18fr)'
    },
    className: "mc-about-grid"
  }, /*#__PURE__*/React.createElement(MediaFrame, {
    ratio: "1 / 1",
    radius: "lg",
    placeholderLabel: "Portr\xE4tfoto \xB7 Platzhalter"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Wer das macht"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.6rem, 3vw, 2.1rem)',
      lineHeight: 1.16,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 0',
      textWrap: 'balance'
    }
  }, "Fabian [Nachname] \u2014 Foto, Video & strategischer Blick in einer Person."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-body)',
      margin: '18px 0 0'
    }
  }, "Ich verbinde zwei Dinge, die selten zusammenkommen: jahrelange Leidenschaft f\xFCr Foto und Video \u2014 und einen Hintergrund in E-Commerce, Marketing und strategischer Content-Planung."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '14px 0 0'
    }
  }, "Hei\xDFt f\xFCr Sie: Content mit Plan \u2014 abgestimmt auf Ihr Ziel, ob Verkauf, Vermietung oder der Aufbau Ihrer Marke. Ans\xE4ssig im Raum B\xFChl / Baden-Baden, mit kurzen Wegen zu Ihren Objekten.")))));
}
Object.assign(window, {
  Process,
  Portfolio,
  Offer,
  About
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onepager/Flow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onepager/NavHero.jsx
try { (() => {
/* Nav + Hero + StatBar for the Makler-Content one-pager. */

/* ---------------- Nav ---------------- */
/* PLATZHALTER: Markenname & Logo — der Logo-Baustein des Design-Systems rendert
   „Makler·Content" als Platzhalter. Später durch das finale Logo ersetzen. */
function Nav({
  onNav
}) {
  const {
    Logo,
    Button
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon
  } = window;
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(243,238,229,0.82)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '13px var(--container-pad)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav('top');
    },
    style: {
      textDecoration: 'none',
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "sm"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    }),
    onClick: () => onNav('anfrage')
  }, "Gratis-Pilot anfragen")));
}

/* ---------------- Hero ---------------- */
function Hero({
  onNav
}) {
  const {
    Button,
    MediaFrame,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container
  } = window;
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      background: 'var(--bg-page)'
    }
  }, /*#__PURE__*/React.createElement(Container, {
    style: {
      padding: 'clamp(44px, 6vw, 80px) var(--container-pad) clamp(40px, 5vw, 64px)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: 'clamp(32px, 5vw, 56px)',
      alignItems: 'center',
      gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)'
    },
    className: "mc-hero-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Foto & Video f\xFCr Makler \xB7 Raum B\xFChl \xB7 Baden-Baden \xB7 Rastatt"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(2.3rem, 4.8vw, 3.5rem)',
      lineHeight: 1.06,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '18px 0 0',
      textWrap: 'balance'
    }
  }, "Content, der Ihre Objekte heraushebt \u2014 und Ihr", ' ', /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--color-accent)'
    }
  }, "Maklerb\xFCro"), "."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '22px 0 0',
      maxWidth: '52ch'
    }
  }, "Professionelle Fotos und konzipierte Videos f\xFCr Maklerb\xFCros. Hochwertiger Content, der Ihre Objekte schneller vermittelt, qualifiziertere Anfragen bringt und Ihr B\xFCro als Marke sichtbar macht \u2014 Konzept, Dreh und Schnitt aus einer Hand."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      margin: '30px 0 0'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    onClick: () => onNav('anfrage')
  }, "Gratis-Pilot anfragen"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    onClick: () => onNav('portfolio')
  }, "Arbeitsproben ansehen")), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14px',
      color: 'var(--text-muted)',
      margin: '20px 0 0',
      lineHeight: 1.6
    }
  }, "F\xFCr ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-strong)',
      fontWeight: 'var(--fw-body-bold)'
    }
  }, "Verkauf & Vermietung"), ' ', "\xB7 ein Termin, fertige Foto- und Video-Assets \xB7 Lieferung in", ' ', /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--text-strong)',
      fontWeight: 'var(--fw-body-bold)'
    }
  }, "48 Stunden"))), /*#__PURE__*/React.createElement(MediaFrame, {
    ratio: "4 / 5",
    eyebrow: "Platzhalter \xB7 Showreel",
    caption: "Hier l\xE4uft bald Ihr Objektvideo.",
    placeholderLabel: "Hero \xB7 Objektvideo"
  }))));
}

/* ---------------- StatBar ---------------- */
function StatBar() {
  const {
    Container
  } = window;
  const stats = [{
    big: '+403 %',
    lbl: 'mehr Anfragen mit Video'
  }, {
    big: '~32 %',
    lbl: 'schnellere Vermittlung mit Profi-Fotos'
  }, {
    big: '73 %',
    lbl: 'der Verkäufer bevorzugen Makler, die Video nutzen'
  }, {
    big: 'nur 9 %',
    lbl: 'der Makler machen objektspezifische Videos'
  }];
  return /*#__PURE__*/React.createElement("section", {
    style: {
      background: 'var(--surface-card)',
      borderTop: '1px solid var(--border-hair)',
      borderBottom: '1px solid var(--border-hair)',
      padding: 'clamp(36px, 5vw, 52px) 0'
    }
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '24px',
      textAlign: 'center'
    },
    className: "mc-stats"
  }, stats.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.lbl
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.8rem, 3.6vw, 2.6rem)',
      lineHeight: 1,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--color-accent)'
    }
  }, s.big), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '13.5px',
      lineHeight: 1.45,
      color: 'var(--text-muted)',
      margin: '10px auto 0',
      maxWidth: '22ch'
    }
  }, s.lbl)))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      opacity: 0.85,
      textAlign: 'center',
      margin: '26px auto 0',
      maxWidth: '78ch',
      lineHeight: 1.55
    }
  }, "Quellen: NAR, Redfin/VHT, Branchenstudien (\xFCberwiegend international) \u2014 die Gr\xF6\xDFenordnung ist auf den deutschen Markt \xFCbertragbar, in dem Video noch kaum genutzt wird.")));
}
Object.assign(window, {
  Nav,
  Hero,
  StatBar
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onepager/NavHero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onepager/Value.jsx
try { (() => {
/* Benefits (6 reasons) + Segments (sell / rent). */

function Benefits() {
  const {
    Card
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container,
    SectionHead
  } = window;
  const items = [{
    icon: 'trending-up',
    title: 'Objekte heben sich ab',
    text: 'Im Portal entscheidet das erste Bild. Profi-Fotos bringen spürbar mehr Aufmerksamkeit.',
    kpi: '+61 % mehr Aufrufe'
  }, {
    icon: 'eye',
    title: 'Bleiben im Kopf',
    text: 'Video vermittelt Raumgefühl, Licht und Laufwege. Interessenten erinnern sich an Ihr Objekt — nicht an das nächste in der Liste.'
  }, {
    icon: 'timer',
    title: 'Schneller vermittelt',
    text: 'Bessere Darstellung verkürzt die Zeit am Markt — bei Fotos wie bei Video.',
    kpi: 'bis zu ~32 % schneller'
  }, {
    icon: 'target',
    title: 'Qualifiziertere Anfragen',
    text: 'Wer das Objekt im Video gesehen hat, meldet sich gezielter. Weniger Besichtigungstourismus, weniger vergeudete Termine.'
  }, {
    icon: 'building-2',
    title: 'Repräsentiert Ihr Büro',
    text: 'Konsistenter, hochwertiger Content zeigt Ihren Qualitätsanspruch — bei Eigentümern wie bei Käufern.'
  }, {
    icon: 'sparkles',
    title: 'Baut Ihre Marke',
    text: 'Reels und Maklerpräsenz arbeiten auch für Sie, nicht nur fürs Objekt.',
    kpi: '71 % wählen Makler mit starker Online-Präsenz'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "page"
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Warum hochwertiger Content",
    title: "Sechs Gr\xFCnde, warum sich der Invest in guten Content rechnet.",
    lead: "Hochwertige Fotos und Videos sind kein Schmuck f\xFCrs Inserat \u2014 sie sind ein messbarer Hebel auf Anfragen, Vermittlungsdauer und das Bild, das Ihr B\xFCro abgibt."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(32px, 4vw, 46px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
    }
  }, items.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.title,
    interactive: true,
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '46px',
      height: '46px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-primary-tint)',
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 22
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '19px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '18px 0 8px'
    }
  }, it.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, it.text), it.kpi && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      marginTop: '12px',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-bold)',
      fontSize: '13px',
      color: 'var(--color-accent-deep)'
    }
  }, it.kpi))))));
}
function Segments() {
  const {
    Card,
    Badge,
    MediaFrame
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    Container,
    SectionHead
  } = window;
  const segs = [{
    tag: 'Verkaufen',
    tagTone: 'accent',
    accent: 'var(--color-accent)',
    title: 'Wohnungen · Häuser · Anwesen',
    text: 'Content, der den Wert eines Kaufobjekts vermittelt und den richtigen Käufer schneller anzieht.',
    points: ['Schnellere Vermittlung, höhere Wahrnehmung des Objekts', 'Vorqualifizierte Käufer durch realistisches Raumgefühl', 'Stärkere Position im Akquisegespräch mit Eigentümern'],
    ph: 'Beispiel · Verkaufsobjekt'
  }, {
    tag: 'Vermieten & Ferienwohnung',
    tagTone: 'sage',
    accent: 'var(--color-primary)',
    title: 'Miet- & Kurzzeit-/Ferienobjekte',
    text: 'Content, der Buchungen und Mietanfragen steigert — bis hin zu Ferienwohnung und Airbnb.',
    points: ['Bis zu +40 % mehr Buchungen mit Profi-Fotos', '~26 % höhere erzielbare Preise, weniger Leerstand', 'Wiederverwendbarer Content für Portale & Social Media'],
    ph: 'Beispiel · Ferienwohnung'
  }];
  return /*#__PURE__*/React.createElement(Section, {
    bg: "surface",
    divider: true
  }, /*#__PURE__*/React.createElement(Container, null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "F\xFCr welches Ziel?",
    title: "Ob Verkauf oder Vermietung \u2014 der richtige Content f\xFCr Ihr Objekt."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(28px, 4vw, 40px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
    }
  }, segs.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.tag,
    padding: "lg",
    style: {
      borderColor: 'var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: s.tagTone
  }, s.tag), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '21px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 8px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, s.text), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: '16px 0 0',
      padding: 0,
      display: 'grid',
      gap: '11px'
    }
  }, s.points.map(p => /*#__PURE__*/React.createElement("li", {
    key: p,
    style: {
      display: 'flex',
      gap: '10px',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: '2px',
      flex: 'none',
      color: s.accent
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-right",
    size: 16,
    color: s.accent
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '14.5px',
      color: 'var(--text-body)',
      lineHeight: 1.5
    }
  }, p)))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '18px'
    }
  }, /*#__PURE__*/React.createElement(MediaFrame, {
    ratio: "16 / 9",
    radius: "md",
    placeholderLabel: s.ph,
    style: {
      boxShadow: 'var(--shadow-sm)'
    }
  }))))), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12.5px',
      color: 'var(--text-muted)',
      opacity: 0.85,
      margin: '22px 0 0',
      lineHeight: 1.55
    }
  }, "Vermietungs-/Ferienwohnungs-Zahlen: Airbnb- und Branchen-Zusammenstellungen. Richtwerte, keine Garantie.")));
}
Object.assign(window, {
  Benefits,
  Segments
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onepager/Value.jsx", error: String((e && e.message) || e) }); }

// ui_kits/onepager/ui.jsx
try { (() => {
/* Shared helpers for the Makler-Content one-pager.
   Exposes: Icon, Container, Section, SectionHead. */

function Icon({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.75,
  style = {}
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = `<i data-lucide="${name}"></i>`;
    if (window.lucide) {
      window.lucide.createIcons();
      const svg = host.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.style.strokeWidth = strokeWidth;
      }
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-flex',
      color,
      ...style
    }
  });
}
function Container({
  children,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)',
      ...style
    }
  }, children);
}
function Section({
  id,
  bg = 'page',
  divider = false,
  children,
  style = {}
}) {
  const bgs = {
    page: 'var(--bg-page)',
    surface: 'var(--surface-card)',
    sage: 'var(--color-primary)'
  };
  return /*#__PURE__*/React.createElement("section", {
    id: id,
    style: {
      background: bgs[bg],
      padding: 'clamp(56px, 8vw, 96px) 0',
      borderTop: divider ? '1px solid var(--border-hair)' : 'none',
      borderBottom: divider ? '1px solid var(--border-hair)' : 'none',
      ...style
    }
  }, children);
}
function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  onDark = false,
  maxWidth = '54ch'
}) {
  const {
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const titleColor = onDark ? 'var(--color-on-primary)' : 'var(--text-strong)';
  const leadColor = onDark ? 'var(--color-secondary)' : 'var(--text-muted)';
  const centered = align === 'center';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: align,
      maxWidth: centered ? maxWidth : 'none',
      margin: centered ? '0 auto' : '0'
    }
  }, eyebrow && /*#__PURE__*/React.createElement(Eyebrow, {
    color: onDark ? 'onDark' : 'accent'
  }, eyebrow), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.7rem, 3.2vw, 2.3rem)',
      lineHeight: 1.14,
      letterSpacing: 'var(--ls-heading)',
      color: titleColor,
      margin: '14px 0 0',
      maxWidth,
      textWrap: 'balance',
      marginLeft: centered ? 'auto' : 0,
      marginRight: centered ? 'auto' : 0
    }
  }, title), lead && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: leadColor,
      margin: '16px 0 0',
      maxWidth,
      marginLeft: centered ? 'auto' : 0,
      marginRight: centered ? 'auto' : 0
    }
  }, lead));
}
Object.assign(window, {
  Icon,
  Container,
  Section,
  SectionHead
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/onepager/ui.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Contact.jsx
try { (() => {
/* Contact / CTA — enquiry form with success state. */
function Contact() {
  const {
    Card,
    Input,
    Textarea,
    Button,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    SectionHead
  } = window;
  const [sent, setSent] = React.useState(false);
  const contactRows = [{
    icon: 'mail',
    label: 'hallo@makler-content.de'
  }, {
    icon: 'phone',
    label: '+49 7221 00 00 00'
  }, {
    icon: 'map-pin',
    label: 'Raum Baden-Baden · DACH'
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "contact",
    style: {
      background: 'var(--surface-card)',
      padding: 'clamp(56px, 8vw, 96px) 0',
      borderTop: '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)',
      display: 'grid',
      gap: 'clamp(32px, 5vw, 56px)',
      alignItems: 'start',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.05fr)'
    },
    className: "mc-contact-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Kontakt",
    title: "Erz\xE4hlen Sie uns von Ihrem Objekt.",
    lead: "Ein kurzer Anruf oder ein paar Zeilen gen\xFCgen \u2014 wir melden uns mit einem Vorschlag f\xFCr Paket und Termin."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px',
      marginTop: '28px'
    }
  }, contactRows.map(r => /*#__PURE__*/React.createElement("div", {
    key: r.label,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '38px',
      height: '38px',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--color-accent-tint)',
      color: 'var(--color-accent-deep)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: r.icon,
    size: 18
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '15px',
      color: 'var(--text-body)'
    }
  }, r.label))))), /*#__PURE__*/React.createElement(Card, {
    padding: "lg",
    tone: "surface",
    style: {
      border: '1px solid var(--border-hair)'
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '14px',
      padding: '18px 6px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '52px',
      height: '52px',
      borderRadius: '50%',
      background: 'var(--color-primary-tint)',
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "check",
    size: 26
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '23px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: 0
    }
  }, "Danke \u2014 wir melden uns."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, "Ihre Anfrage ist angekommen. In der Regel h\xF6ren Sie innerhalb eines Werktags von uns."), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "md",
    onClick: () => setSent(false)
  }, "Weitere Anfrage")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, null, "Anfrage"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '14px'
    },
    className: "mc-form-row"
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Name",
    placeholder: "Ihr Name",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "E-Mail",
    type: "email",
    placeholder: "name@beispiel.de",
    required: true
  })), /*#__PURE__*/React.createElement(Textarea, {
    label: "Ihr Objekt",
    rows: 4,
    placeholder: "Lage, Gr\xF6\xDFe, gew\xFCnschter Termin \u2026",
    hint: "Je mehr Sie erz\xE4hlen, desto konkreter unser Vorschlag."
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    style: {
      width: '100%'
    }
  }, "Anfrage senden")))));
}
Object.assign(window, {
  Contact
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Contact.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Footer.jsx
try { (() => {
/* Footer — sage ground, logo, link columns, fine print. */
function Footer({
  onNav
}) {
  const {
    Logo,
    Divider
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon
  } = window;
  const cols = [{
    head: 'Leistungen',
    links: ['Fotografie', 'Film', 'Drohne', '360° Touren']
  }, {
    head: 'Studio',
    links: ['Über uns', 'Referenzen', 'Ablauf', 'Kontakt']
  }, {
    head: 'Rechtliches',
    links: ['Impressum', 'Datenschutz', 'AGB']
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--color-primary)',
      color: 'var(--color-on-primary)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'clamp(48px, 6vw, 72px) var(--container-pad) 36px',
      display: 'grid',
      gap: 'clamp(32px, 5vw, 64px)',
      gridTemplateColumns: 'minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))'
    },
    className: "mc-footer-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    size: "md",
    onDark: true
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: '15px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--color-secondary)',
      margin: '18px 0 0',
      maxWidth: '34ch'
    }
  }, "Immobilien-Foto & -Film f\xFCr Objekte, die sich nach Zuhause anf\xFChlen."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      marginTop: '20px',
      flexWrap: 'wrap'
    }
  }, ['Instagram', 'LinkedIn', 'YouTube'].map(s => /*#__PURE__*/React.createElement("a", {
    key: s,
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav('top');
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '7px',
      padding: '8px 14px',
      borderRadius: 'var(--radius-pill)',
      background: 'rgba(243,238,229,0.10)',
      color: 'var(--color-on-primary)',
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '13px',
      textDecoration: 'none'
    }
  }, s, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-up-right",
    size: 14,
    color: "var(--color-secondary)"
  }))))), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.head
  }, /*#__PURE__*/React.createElement("h4", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '12px',
      letterSpacing: 'var(--ls-label)',
      textTransform: 'uppercase',
      color: 'var(--color-secondary)',
      margin: '0 0 14px'
    }
  }, c.head), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '10px'
    }
  }, c.links.map(l => /*#__PURE__*/React.createElement("li", {
    key: l
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav('top');
    },
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body)',
      fontSize: '14px',
      color: 'var(--color-on-primary)',
      textDecoration: 'none',
      opacity: 0.86
    }
  }, l))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement(Divider, {
    style: {
      background: 'rgba(243,238,229,0.16)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      padding: '20px 0 8px',
      fontFamily: 'var(--font-body)',
      fontSize: '13px',
      color: 'var(--color-secondary)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 2026 Makler-Content"), /*#__PURE__*/React.createElement("span", null, "Raum Baden-Baden \xB7 DACH"))));
}
Object.assign(window, {
  Footer
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Footer.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Header.jsx
try { (() => {
/* Header — sticky translucent nav with logo, links, CTA, mobile toggle. */
function Header({
  onNav
}) {
  const {
    Logo,
    Button
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon
  } = window;
  const [open, setOpen] = React.useState(false);
  const links = [['Leistungen', 'services'], ['Referenzen', 'portfolio'], ['Ablauf', 'process'], ['Über uns', 'about']];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(243,238,229,0.82)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      borderBottom: '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '14px var(--container-pad)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav('top');
    },
    style: {
      textDecoration: 'none'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    size: "sm"
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
    className: "mc-nav-desktop"
  }, links.map(([label, id]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: `#${id}`,
    onClick: e => {
      e.preventDefault();
      onNav(id);
    },
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '14px',
      color: 'var(--text-body)',
      textDecoration: 'none',
      padding: '8px 13px',
      borderRadius: 'var(--radius-sm)',
      transition: 'background var(--dur-fast)'
    },
    onMouseEnter: e => e.currentTarget.style.background = 'var(--surface-card)',
    onMouseLeave: e => e.currentTarget.style.background = 'transparent'
  }, label))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "mc-nav-desktop"
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 16
    }),
    onClick: () => onNav('contact')
  }, "Termin anfragen")), /*#__PURE__*/React.createElement("button", {
    className: "mc-nav-mobile",
    onClick: () => setOpen(o => !o),
    "aria-label": "Men\xFC",
    style: {
      display: 'none',
      background: 'var(--surface-card)',
      border: '1px solid var(--border-hair)',
      borderRadius: 'var(--radius-sm)',
      padding: '9px',
      cursor: 'pointer',
      color: 'var(--text-strong)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: open ? 'x' : 'menu',
    size: 20
  })))), open && /*#__PURE__*/React.createElement("div", {
    className: "mc-nav-mobile",
    style: {
      display: 'none',
      flexDirection: 'column',
      padding: '8px var(--container-pad) 18px',
      borderTop: '1px solid var(--border-hair)',
      gap: '2px'
    }
  }, links.map(([label, id]) => /*#__PURE__*/React.createElement("a", {
    key: id,
    href: `#${id}`,
    onClick: e => {
      e.preventDefault();
      onNav(id);
      setOpen(false);
    },
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '15px',
      color: 'var(--text-body)',
      textDecoration: 'none',
      padding: '12px 4px',
      borderBottom: '1px solid var(--border-hair)'
    }
  }, label)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: '12px'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "md",
    style: {
      width: '100%'
    },
    onClick: () => {
      onNav('contact');
      setOpen(false);
    }
  }, "Termin anfragen"))));
}
Object.assign(window, {
  Header
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Header.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
/* Hero — eyebrow, display headline, lead, CTAs, hero media, stat band. */
function Hero({
  onNav
}) {
  const {
    Button,
    MediaFrame,
    StatBlock,
    Eyebrow,
    Divider
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon
  } = window;
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      background: 'var(--bg-page)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: 'clamp(48px, 7vw, 88px) var(--container-pad) 0',
      display: 'grid',
      gap: 'clamp(32px, 5vw, 64px)',
      alignItems: 'center',
      gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)'
    },
    className: "mc-hero-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Wohnen mit Charakter"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(2.6rem, 5.4vw, 3.9rem)',
      lineHeight: 1.05,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '18px 0 0',
      textWrap: 'balance'
    }
  }, "Wo Menschen ankommen \u2014 eingefangen in echtem Licht."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '22px 0 0',
      maxWidth: '46ch'
    }
  }, "Foto & Film f\xFCr Objekte, die sich nach Zuhause anf\xFChlen. Warm, ehrlich, einladend \u2014 und planbar geliefert f\xFCr Makler, Bautr\xE4ger und Eigent\xFCmer im DACH-Raum."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      margin: '30px 0 0'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "lg",
    iconRight: /*#__PURE__*/React.createElement(Icon, {
      name: "arrow-right",
      size: 18
    }),
    onClick: () => onNav('contact')
  }, "Termin anfragen"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    iconLeft: /*#__PURE__*/React.createElement(Icon, {
      name: "play",
      size: 16
    }),
    onClick: () => onNav('portfolio')
  }, "Portfolio ansehen"))), /*#__PURE__*/React.createElement(MediaFrame, {
    ratio: "4 / 5",
    eyebrow: "Referenz \xB7 Baden-Baden",
    caption: "Landhaus am Waldrand",
    placeholderLabel: "Hero \xB7 Immobilien-Foto"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement(Divider, {
    style: {
      margin: 'clamp(40px, 6vw, 72px) 0 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '40px 64px',
      padding: 'clamp(28px, 4vw, 40px) 0'
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "250+",
    label: "Objekte im Jahr"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "48 h",
    label: "Lieferzeit"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "12",
    label: "Jahre Erfahrung"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "100%",
    label: "Termintreue"
  }))));
}
Object.assign(window, {
  Hero
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Portfolio.jsx
try { (() => {
/* Portfolio / Referenzen — filterable media grid. */
function Portfolio() {
  const {
    Tag,
    MediaFrame
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    SectionHead
  } = window;
  const [filter, setFilter] = React.useState('Alle');
  const filters = ['Alle', 'Innen', 'Außen', 'Luft'];
  const work = [{
    cat: 'Außen',
    eyebrow: 'Villa · Stuttgart',
    caption: 'Klare Linien im Abendlicht',
    ratio: '4 / 3'
  }, {
    cat: 'Innen',
    eyebrow: 'Altbau · Freiburg',
    caption: 'Morgenlicht in der Küche',
    ratio: '4 / 3'
  }, {
    cat: 'Luft',
    eyebrow: 'Neubau · Karlsruhe',
    caption: 'Lage aus der Vogelperspektive',
    ratio: '4 / 3'
  }, {
    cat: 'Innen',
    eyebrow: 'Loft · Mannheim',
    caption: 'Material und Textur',
    ratio: '4 / 3'
  }, {
    cat: 'Außen',
    eyebrow: 'Landhaus · Baden',
    caption: 'Garten und Übergang',
    ratio: '4 / 3'
  }, {
    cat: 'Luft',
    eyebrow: 'Areal · Offenburg',
    caption: 'Grundstück im Kontext',
    ratio: '4 / 3'
  }];
  const shown = filter === 'Alle' ? work : work.filter(w => w.cat === filter);
  return /*#__PURE__*/React.createElement("section", {
    id: "portfolio",
    style: {
      background: 'var(--surface-card)',
      padding: 'clamp(56px, 8vw, 96px) 0',
      borderTop: '1px solid var(--border-hair)',
      borderBottom: '1px solid var(--border-hair)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      gap: '24px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Referenzen",
    title: "Objekte, die wir zum Sprechen gebracht haben."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    }
  }, filters.map(f => /*#__PURE__*/React.createElement(Tag, {
    key: f,
    selected: filter === f,
    onClick: () => setFilter(f)
  }, f)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(28px, 4vw, 40px)',
      gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))'
    }
  }, shown.map(w => /*#__PURE__*/React.createElement(MediaFrame, {
    key: w.eyebrow,
    ratio: w.ratio,
    radius: "lg",
    eyebrow: w.eyebrow,
    caption: w.caption,
    placeholderLabel: w.cat
  })))));
}
Object.assign(window, {
  Portfolio
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Portfolio.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Process.jsx
try { (() => {
/* Process / Ablauf — numbered steps + sage testimonial band. */
function Process() {
  const {
    Eyebrow,
    StatBlock
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    SectionHead
  } = window;
  const steps = [{
    n: '01',
    title: 'Anfrage & Termin',
    text: 'Sie schildern Objekt und Ziel — wir schlagen Paket und Drehtag vor.'
  }, {
    n: '02',
    title: 'Produktion vor Ort',
    text: 'Wir kommen, lesen das Licht und fangen die Atmosphäre ein. Ruhig und effizient.'
  }, {
    n: '03',
    title: 'Auswahl & Schnitt',
    text: 'Bearbeitung in der Makler-Content-Bildsprache — warm, ehrlich, konsistent.'
  }, {
    n: '04',
    title: 'Lieferung in 48 h',
    text: 'Fertige Foto- und Filmpakete, sauber benannt, optimiert für jede Plattform.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "process",
    style: {
      background: 'var(--bg-page)',
      padding: 'clamp(56px, 8vw, 96px) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Ablauf",
    title: "Planbar von der Anfrage bis zur Lieferung.",
    align: "center"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(32px, 4vw, 48px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))'
    }
  }, steps.map(s => /*#__PURE__*/React.createElement("div", {
    key: s.n,
    style: {
      position: 'relative',
      paddingTop: '14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '34px',
      color: 'var(--color-accent)',
      lineHeight: 1,
      letterSpacing: 'var(--ls-heading)'
    }
  }, s.n), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '19px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 8px'
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body)',
      fontSize: '14px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    }
  }, s.text))))), /*#__PURE__*/React.createElement("div", {
    id: "about",
    style: {
      maxWidth: 'var(--container-max)',
      margin: 'clamp(48px, 6vw, 80px) auto 0',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--color-primary)',
      borderRadius: 'var(--radius-xl)',
      padding: 'clamp(36px, 5vw, 64px)',
      display: 'grid',
      gap: 'clamp(28px, 4vw, 56px)',
      alignItems: 'center',
      gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)'
    },
    className: "mc-quote-grid"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "onDark"
  }, "\xDCber uns"), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading-reg)',
      fontSize: 'clamp(1.4rem, 2.6vw, 1.9rem)',
      lineHeight: 1.32,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--color-on-primary)',
      margin: '16px 0 0',
      textWrap: 'balance'
    }
  }, "\u201EDie Bilder von Makler-Content verkaufen, bevor das erste Wort f\xE4llt. Termintreu, konsistent \u2014 und immer mit Gef\xFChl f\xFCr das Objekt.\""), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-medium)',
      fontSize: '14px',
      color: 'var(--color-secondary)',
      margin: '20px 0 0',
      letterSpacing: '0.02em'
    }
  }, "Katharina Lenz \xB7 Gesch\xE4ftsf\xFChrerin, Lenz Immobilien")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '40px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(StatBlock, {
    value: "4,9",
    label: "\xD8 Bewertung",
    tone: "onDark"
  }), /*#__PURE__*/React.createElement(StatBlock, {
    value: "98%",
    label: "Wiederbuchung",
    tone: "onDark"
  })))));
}
Object.assign(window, {
  Process
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Process.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Services.jsx
try { (() => {
/* Services / Leistungen — icon cards. */
function Services() {
  const {
    Card,
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  const {
    Icon,
    SectionHead
  } = window;
  const items = [{
    icon: 'camera',
    title: 'Immobilienfotografie',
    text: 'Innen, außen und Detail — in warmem, natürlichem Licht, das Atmosphäre statt Quadratmeter zeigt.'
  }, {
    icon: 'video',
    title: 'Immobilienfilm',
    text: 'Bewegtbild, das im Feed funktioniert: ruhige Kamera, echte Räume, das Gefühl vom Ankommen.'
  }, {
    icon: 'send',
    title: 'Drohnenaufnahmen',
    text: 'Lage, Grundstück und Umgebung aus der Luft — der Kontext, der ein Objekt einordnet.'
  }, {
    icon: 'scan',
    title: '360° &amp; Virtuelle Touren',
    text: 'Begehbare Rundgänge für die Online-Vermarktung — Interessenten sind schon drin, bevor sie kommen.'
  }];
  return /*#__PURE__*/React.createElement("section", {
    id: "services",
    style: {
      background: 'var(--bg-page)',
      padding: 'clamp(56px, 8vw, 96px) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-max)',
      margin: '0 auto',
      padding: '0 var(--container-pad)'
    }
  }, /*#__PURE__*/React.createElement(SectionHead, {
    eyebrow: "Leistungen",
    title: "Eine Bildsprache, die Ihr Objekt heraushebt.",
    lead: "Vom Einfamilienhaus bis zum Neubauprojekt \u2014 konsistent, planbar, premium."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gap: '20px',
      marginTop: 'clamp(32px, 4vw, 48px)',
      gridTemplateColumns: 'repeat(auto-fit, minmax(238px, 1fr))'
    }
  }, items.map(it => /*#__PURE__*/React.createElement(Card, {
    key: it.title,
    interactive: true,
    padding: "lg"
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '46px',
      height: '46px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-primary-tint)',
      color: 'var(--color-primary)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: it.icon,
    size: 22
  })), /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: '20px',
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '18px 0 8px'
    },
    dangerouslySetInnerHTML: {
      __html: it.title
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body)',
      fontSize: '14.5px',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: 0
    },
    dangerouslySetInnerHTML: {
      __html: it.text
    }
  }))))));
}
Object.assign(window, {
  Services
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Services.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/ui.jsx
try { (() => {
/* Shared UI helpers for the Makler-Content website kit.
   Exposes: Icon, SectionHead. Pulls primitives from the DS bundle. */

function Icon({
  name,
  size = 20,
  color = 'currentColor',
  strokeWidth = 1.75,
  style = {}
}) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = `<i data-lucide="${name}"></i>`;
    if (window.lucide) {
      window.lucide.createIcons();
      const svg = host.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.style.strokeWidth = strokeWidth;
      }
    }
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    ref: ref,
    style: {
      display: 'inline-flex',
      color,
      ...style
    }
  });
}
function SectionHead({
  eyebrow,
  title,
  lead,
  align = 'left',
  maxWidth = '52ch'
}) {
  const {
    Eyebrow
  } = window.MaklerContentDesignSystem_a211b6;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: align,
      maxWidth: align === 'center' ? maxWidth : 'none',
      margin: align === 'center' ? '0 auto' : '0'
    }
  }, eyebrow && /*#__PURE__*/React.createElement(Eyebrow, null, eyebrow), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 'var(--fw-heading)',
      fontSize: 'clamp(1.9rem, 3.2vw, 2.5rem)',
      lineHeight: 1.12,
      letterSpacing: 'var(--ls-heading)',
      color: 'var(--text-strong)',
      margin: '14px 0 0',
      maxWidth,
      textWrap: 'balance'
    }
  }, title), lead && /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--fw-body-light)',
      fontSize: 'var(--fs-lead)',
      lineHeight: 'var(--lh-normal)',
      color: 'var(--text-muted)',
      margin: '16px 0 0',
      maxWidth,
      marginLeft: align === 'center' ? 'auto' : 0,
      marginRight: align === 'center' ? 'auto' : 0
    }
  }, lead));
}
Object.assign(window, {
  Icon,
  SectionHead
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/ui.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.MediaFrame = __ds_scope.MediaFrame;

__ds_ns.StatBlock = __ds_scope.StatBlock;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Textarea = __ds_scope.Textarea;

})();
