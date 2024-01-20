import type { ParentProps } from "solid-js";
import { resolveElements } from "@solid-primitives/refs";
import {
  ExitMethod,
  createListTransition,
} from "@solid-primitives/transition-group";

export interface TransistorListProps {
  enter: (el: HTMLElement) => Animation;
  onEnter?: (el: HTMLElement) => void;
  onBeforeEnter?: (el: HTMLElement) => void;
  leave: (el: HTMLElement) => Animation;
  onLeave?: (el: HTMLElement) => void;
  onBeforeLeave?: (el: HTMLElement) => void;

  exit?: ExitMethod;
}

export function TransistorList(props: ParentProps<TransistorListProps>) {
  const els = resolveElements(() => props.children);

  const animationMap = new Map<Element, Animation>();

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

  const animateOut = async (el: HTMLElement) => {
    if (!el.isConnected) return;
    const left1 = el.getBoundingClientRect().left;
    animationMap.get(el)?.cancel();
    const left2 = el.getBoundingClientRect().left;
    props.onBeforeLeave?.(el);
    try {
      await props.leave(el).finished.then(() => {
        requestAnimationFrame(() => {
          props.onLeave?.(el);
        });
      });
    } catch {}
  };

  const rendered = createListTransition(els.toArray, {
    exitMethod: props.exit,
    onChange({ removed, added, finishRemoved }) {
      queueMicrotask(async () => {
        const leave = Promise.all(removed.map(animateOut as any));

        for (const el of added) {
          animateIn(el as HTMLElement, () => {});
        }

        await leave;

        finishRemoved(removed);
      });
    },
  });

  return <>{rendered()}</>;
}
