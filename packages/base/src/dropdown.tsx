import { Accessor, createEffect, createSignal } from "solid-js";
import { untrack } from "solid-js/web";
import { resolve } from "./utils.js";

import { createViewportObserver } from "@solid-primitives/intersection-observer";

function getOffset<E extends HTMLElement>(el: E) {
  var _x = 0;
  var _y = 0;
  while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
    _x += el.offsetLeft - el.scrollLeft;
    _y += el.offsetTop - el.scrollTop;
    el = el.offsetParent as HTMLElement as E;
  }
  return { top: _y, left: _x };
}

export type Position = "top" | "bottom" | "left" | "right";

export interface SwayOptions {
  positon?: Position | Accessor<Position | undefined>;
}

function getRelativeRect(el: HTMLElement) {
  return {
    top: el.offsetTop,
    left: el.offsetLeft,
    height: el.offsetHeight,
    width: el.offsetWidth,
  };
}

function computePosition<T extends HTMLElement, E extends HTMLElement>(
  target: T,
  element: E,
  position: Position
) {
  const targetRect = getRelativeRect(target);
  const elRect = getRelativeRect(element);

  switch (position) {
    case "bottom":
      return {
        left: 0,
        top: targetRect.top + targetRect.height,
      };
    case "top": {
      return {
        left: 0,
        top: targetRect.top - elRect.height,
      };
    }
    case "left":
      return {
        left: targetRect.left - elRect.width,
        top: targetRect.top,
      };

    case "right":
      return {
        left: targetRect.left - targetRect.width,
        top: targetRect.top,
      };
  }
}

export function createSway<T extends HTMLElement, E extends HTMLElement>(
  target: Accessor<T>,
  element: Accessor<E>,
  options: SwayOptions = {}
) {
  const [enabled, setEnabled] = createSignal(false);

  createEffect(() => {
    if (enabled()) {
      untrack(() => {
        const el = element();
        const targetEl = target();

        const position = computePosition(
          targetEl,
          el,
          resolve(options.positon) ?? "bottom"
        );

        console.log("position", position);

        el.setAttribute(
          "style",
          `position:absolute; top:0; left: 0; transform: translate(${position.left}px,${position.top}px);`
        );
      });
    }
  });

  return {
    track() {
      setEnabled(true);
    },
    untrack() {
      setEnabled(false);
    },
  };
}
