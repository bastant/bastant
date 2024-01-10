import {SPACINGS, FONT_WEIGHTS, COLORS, FONT_SIZES} from "./config.js";
import css from "./helpers.module.scss";
export type Color = keyof typeof COLORS
export function color(opts: Color) {
  switch (opts) {
    case "background": return css["color-background"];
case "primary": return css["color-primary"];
    default: return void 0
  }
}
export type BackgroundColor = keyof typeof COLORS
export function backgroundColor(opts: BackgroundColor) {
  switch (opts) {
    case "background": return css["background-color-background"];
case "primary": return css["background-color-primary"];
    default: return void 0
  }
}
export type Padding = keyof typeof SPACINGS;
export interface PaddingOption {
  pt?: Padding;
pb?: Padding;
pl?: Padding;
pr?: Padding;
p?: Padding
}
export function padding(opts: PaddingOption) {
  return {
      [css['padding-mini']]: opts.p == "mini",
[css['padding-mini-top']]: opts.pt == "mini",
[css['padding-mini-bottom']]: opts.pb == "mini",
[css['padding-mini-left']]: opts.pl == "mini",
[css['padding-mini-right']]: opts.pr == "mini",
[css['padding-small']]: opts.p == "small",
[css['padding-small-top']]: opts.pt == "small",
[css['padding-small-bottom']]: opts.pb == "small",
[css['padding-small-left']]: opts.pl == "small",
[css['padding-small-right']]: opts.pr == "small",
[css['padding-normal']]: opts.p == "normal",
[css['padding-normal-top']]: opts.pt == "normal",
[css['padding-normal-bottom']]: opts.pb == "normal",
[css['padding-normal-left']]: opts.pl == "normal",
[css['padding-normal-right']]: opts.pr == "normal",
[css['padding-large']]: opts.p == "large",
[css['padding-large-top']]: opts.pt == "large",
[css['padding-large-bottom']]: opts.pb == "large",
[css['padding-large-left']]: opts.pl == "large",
[css['padding-large-right']]: opts.pr == "large",
      [css["padding"]]: true
  }
}
export type Margin = keyof typeof SPACINGS;
export interface MarginOption {
  mt?: Margin;
mb?: Margin;
ml?: Margin;
mr?: Margin;
m?: Margin
}
export function margin(opts: MarginOption) {
  return {
      [css['margin-mini']]: opts.m == "mini",
[css['margin-mini-top']]: opts.mt == "mini",
[css['margin-mini-bottom']]: opts.mb == "mini",
[css['margin-mini-left']]: opts.ml == "mini",
[css['margin-mini-right']]: opts.mr == "mini",
[css['margin-small']]: opts.m == "small",
[css['margin-small-top']]: opts.mt == "small",
[css['margin-small-bottom']]: opts.mb == "small",
[css['margin-small-left']]: opts.ml == "small",
[css['margin-small-right']]: opts.mr == "small",
[css['margin-normal']]: opts.m == "normal",
[css['margin-normal-top']]: opts.mt == "normal",
[css['margin-normal-bottom']]: opts.mb == "normal",
[css['margin-normal-left']]: opts.ml == "normal",
[css['margin-normal-right']]: opts.mr == "normal",
[css['margin-large']]: opts.m == "large",
[css['margin-large-top']]: opts.mt == "large",
[css['margin-large-bottom']]: opts.mb == "large",
[css['margin-large-left']]: opts.ml == "large",
[css['margin-large-right']]: opts.mr == "large",
      [css["margin"]]: true
  }
}
export type FontWeight = keyof typeof FONT_WEIGHTS
export function fontWeight(opts: FontWeight) {
  switch (opts) {
    case "thin": return css["font-weight-thin"];
case "light": return css["font-weight-light"];
case "bold": return css["font-weight-bold"];
    default: return void 0
  }
}
export type FontSize = keyof typeof FONT_SIZES
export function fontSize(opts: FontSize) {
  switch (opts) {
    case "pageHeader": return css["font-size-pageHeader"];
case "h1": return css["font-size-h1"];
case "h2": return css["font-size-h2"];
case "h3": return css["font-size-h3"];
case "p": return css["font-size-p"];
case "small": return css["font-size-small"];
    default: return void 0
  }
}