import { Accessor, createMemo, createSignal } from "solid-js";

export function createAnimator<T extends HTMLElement>(element: Accessor<T>) {
  const [currentAnimation, setCurrentAnimation] = createSignal<Animation>();

  const api = createMemo(() => {
    const el = element();

    return {
      animate: async (
        keyframe: Keyframe[] | PropertyIndexedKeyframes,
        options?: number | KeyframeAnimationOptions
      ) => {
        if (!el.isConnected) return;

        currentAnimation()?.cancel();
        const animation = el.animate(keyframe, options);
        setCurrentAnimation(animation);

        const done = () => {
          setCurrentAnimation(void 0);
        };

        animation.finished.then(done, done);
      },
      cancel: () => {
        currentAnimation()?.cancel();
        setCurrentAnimation(void 0);
      },
    };
  });

  return api;
}
