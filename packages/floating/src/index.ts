import {
  platform,
  computePosition as func,
  autoUpdate,
  type Placement,
  type Strategy,
  ComputePositionReturn,
  Middleware,
  AutoUpdateOptions,
} from "@floating-ui/dom";
import { type Accessor, createEffect, createSignal, onCleanup } from "solid-js";

export type {
  Placement,
  Strategy,
  Coords,
  ComputePositionReturn,
} from "@floating-ui/dom";

export {
  flip,
  autoPlacement,
  shift,
  inline,
  hide,
  size,
  offset,
  arrow,
} from "@floating-ui/dom";

export function computePosition(
  target: HTMLElement,
  floating: HTMLElement,
  options: Options
) {
  return func(target, floating, {
    ...options,
    platform,
  });
}

export interface Options {
  placement?: Placement;
  strategy?: Strategy;
  middleware?: Array<Middleware | null | undefined | false>;
}

export function createFloating(
  target: Accessor<HTMLElement | undefined>,
  floating: Accessor<HTMLElement | undefined>,
  options?: Accessor<Options | undefined>
): Accessor<ComputePositionReturn | undefined> {
  const [result, setResult] = createSignal<ComputePositionReturn>();

  createEffect(async () => {
    const tEl = target();
    const fEl = floating();

    const opts = options?.() ?? {};

    if (!tEl || !fEl) return;

    const result = await computePosition(tEl, fEl, opts);

    setResult(result);
  });

  return result;
}

export function createFloatingListener(
  target: Accessor<HTMLElement | undefined>,
  floating: Accessor<HTMLElement | undefined>,
  options?: Accessor<(Options & AutoUpdateOptions) | undefined>
): Accessor<ComputePositionReturn | undefined> {
  const [pos, setPos] = createSignal<ComputePositionReturn>();

  createEffect(() => {
    const tEl = target();
    const fEl = floating();

    const opts = options?.() ?? {};

    if (!tEl || !fEl) return;

    const cleanup = autoUpdate(
      tEl,
      fEl,
      async () => {
        setPos(await computePosition(tEl, fEl, opts));
      },
      opts
    );

    onCleanup(cleanup);
  });

  return pos;
}
