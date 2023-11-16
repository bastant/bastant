import {
  Show as SolidShow,
  type JSX,
  type ParentProps,
  splitProps,
} from "solid-js";
import { resolveFirst } from "@solid-primitives/refs";
import {
  createSwitchTransition,
  TransitionMode,
} from "@solid-primitives/transition-group";
import { Dynamic } from "solid-js/web";

export interface RevealProps {
  mode?: TransitionMode;
  appear?: boolean;
  enter: (el: HTMLElement) => Animation;
  onEnter?: (el: HTMLElement) => void;
  onBeforeEnter?: (el: HTMLElement) => void;
  leave: (el: HTMLElement) => Animation;
  onLeave?: (el: HTMLElement) => void;
  onBeforeLeave?: (el: HTMLElement) => void;
}

export function Reveal(props: ParentProps<RevealProps>): JSX.Element {
  const animationMap = new Map<Element, Animation>();

  const el = resolveFirst(
    () => props.children,
    (item): item is HTMLElement => item instanceof HTMLElement
  );

  const animateIn = (el: HTMLElement, done: VoidFunction) => {
    if (!el.isConnected) return done();
    props.onBeforeEnter?.(el);
    const a = props.enter(el);
    animationMap.set(el, a);
    const complete = () => {
      done();
      animationMap.delete(el);
      requestAnimationFrame(() => props.onEnter?.(el));
    };
    a.finished.then(complete).catch(complete);
  };

  const animateOut = (el: HTMLElement, done: VoidFunction) => {
    if (!el.isConnected) return done();
    const left1 = el.getBoundingClientRect().left;
    animationMap.get(el)?.cancel();
    const left2 = el.getBoundingClientRect().left;
    props.onBeforeLeave?.(el);
    props
      .leave(el)
      .finished.then(() => {
        requestAnimationFrame(() => {
          props.onLeave?.(el);
        });
        done();
      })
      .catch(done);
  };

  let element: HTMLElement | undefined;

  const transition = createSwitchTransition(el, {
    onEnter(el, done) {
      element = el;
      queueMicrotask(() => animateIn(el, done));
    },
    onExit(el, done) {
      element = el;
      animateOut(el, done);
    },
    mode: props.mode,
    appear: props.appear,
  });

  return <>{transition()}</>;
}

export type DynamicShowProps<A extends keyof JSX.HTMLElementTags> =
  JSX.HTMLElementTags[A] & {
    as?: A;
    enter: Keyframe[];
    leave: Keyframe[];
    duration?: number;
    delay?: number;
    easing?: string;
    show?: boolean;
    onLeave?: () => void;
    onEnter?: () => void;
  };

export function DynamicShow<A extends keyof JSX.HTMLElementTags = "div">(
  props: DynamicShowProps<A>
) {
  const [local, rest] = splitProps(props, [
    "as",
    "enter",
    "leave",
    "duration",
    "show",
    "delay",
    "onLeave",
    "onEnter",
    "easing",
  ]);

  return (
    <Reveal
      enter={(el) =>
        el.animate([...local.leave, ...local.enter], {
          fill: "both",
          duration: local.duration,
          delay: local.delay,
        })
      }
      leave={(el) =>
        el.animate([...local.enter, ...local.leave], {
          duration: local.duration,
          delay: local.delay,
        })
      }
      onLeave={local.onLeave ? () => local.onLeave?.() : void 0}
      onEnter={local.onEnter ? () => local.onEnter?.() : void 0}
    >
      <SolidShow when={local.show}>
        <Dynamic component={local.as ?? "div"} {...(rest as any)} />
      </SolidShow>
    </Reveal>
  );
}

function animations(enter: Keyframe[], leave: Keyframe[]) {
  return function <A extends keyof JSX.HTMLElementTags = "div">(
    props: Omit<DynamicShowProps<A>, "enter" | "leave">
  ) {
    return (
      <DynamicShow
        duration={300}
        {...(props as any)}
        enter={enter}
        leave={leave}
      />
    );
  };
}

export const Fade = animations([{ opacity: 1 }], [{ opacity: 0 }]);
