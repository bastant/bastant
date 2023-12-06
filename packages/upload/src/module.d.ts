declare module "*.css" {
  type CSS = Record<string, string>;
  const css: CSS;
  export default css;
}

declare module "*.scss" {
  type CSS = Record<string, string>;
  const css: CSS;
  export default css;
}
