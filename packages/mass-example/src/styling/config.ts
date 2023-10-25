export const COLORS = { background: "#fff" } as const;
export function colors(variable: keyof typeof COLORS): string | undefined {
  const found = COLORS[variable];
  return found ? "var(--color-" + variable + "," + found + ")" : void 0;
}
export const SPACINGS = {
  mini: "0.5rem",
  small: "0.75rem",
  normal: "1.5rem",
  large: "3rem",
} as const;
export function spacings(variable: keyof typeof SPACINGS): string | undefined {
  const found = SPACINGS[variable];
  return found ? "var(--spacing-" + variable + "," + found + ")" : void 0;
}
export const BREAKPOINTS = {
  mobile: "min-width: 0",
  tablet: "min-width: 800px",
  desktop: "min-width: 1200px",
  largeDesktop: "min-width: 1800px",
} as const;
export function breakpoints(
  variable: keyof typeof BREAKPOINTS
): string | undefined {
  const found = BREAKPOINTS[variable];
  return found ? "var(--breakpoint-" + variable + "," + found + ")" : void 0;
}
export const FONT_WEIGHTS = { thin: 200, light: 300, bold: 600 } as const;
export function fontWeights(
  variable: keyof typeof FONT_WEIGHTS
): string | undefined {
  const found = FONT_WEIGHTS[variable];
  return found ? "var(--font-weight-" + variable + "," + found + ")" : void 0;
}
export const FONT_SIZES = {
  pageHeader: "4rem",
  h1: "3rem",
  h2: "2.625rem",
  h3: "2.25rem",
  p: "1rem",
  small: "0.75rem",
} as const;
export function fontSizes(
  variable: keyof typeof FONT_SIZES
): string | undefined {
  const found = FONT_SIZES[variable];
  return found ? "var(--font-size-" + variable + "," + found + ")" : void 0;
}
export const LINE_HEIGHTS = { normal: 1.2 } as const;
export function lineHeights(
  variable: keyof typeof LINE_HEIGHTS
): string | undefined {
  const found = LINE_HEIGHTS[variable];
  return found ? "var(--line-height-" + variable + "," + found + ")" : void 0;
}
export const SIZES = {
  containerWidth: "82.5rem",
  headerHeight: "5rem",
  headerHeightMobile: "3.75rem",
} as const;
export function sizes(variable: keyof typeof SIZES): string | undefined {
  const found = SIZES[variable];
  return found ? "var(--size-" + variable + "," + found + ")" : void 0;
}
export const RADII = {
  small: "0.25rem",
  normal: "0.5rem",
  large: "0.75rem",
} as const;
export function radii(variable: keyof typeof RADII): string | undefined {
  const found = RADII[variable];
  return found ? "var(--radii-" + variable + "," + found + ")" : void 0;
}
export const Z_INDICES = { navBar: 1000 } as const;
export function zIndices(variable: keyof typeof Z_INDICES): string | undefined {
  const found = Z_INDICES[variable];
  return found ? "var(--z-index-" + variable + "," + found + ")" : void 0;
}
export const SHADOWS = { "1": "3px 3px 3px 2px rgba(0, 0, 0, 0.5)" } as const;
export function shadows(variable: keyof typeof SHADOWS): string | undefined {
  const found = SHADOWS[variable];
  return found ? "var(--shadow-" + variable + "," + found + ")" : void 0;
}
