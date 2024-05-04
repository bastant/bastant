import { type Accessor, createMemo, createSignal, untrack } from "solid-js";


export interface Animator {
  cancel(): void,
  animate(
    keyframe: Keyframe[] | PropertyIndexedKeyframes,
    options?: number | KeyframeAnimationOptions
  ): Promise<void>;
}

export function createAnimator<T extends HTMLElement>(element: Accessor<T>): Animator {

  const api = createMemo<Animator>((prev) => {
    const el = element();

    prev?.cancel();

    let currentAnimation: Animation | undefined;

    return {
      animate: async (
        keyframe: Keyframe[] | PropertyIndexedKeyframes,
        options?: number | KeyframeAnimationOptions
      ) => {
        if (!el.isConnected) return;

        currentAnimation?.cancel();
        const animation = el.animate(keyframe, options);
        currentAnimation = animation;

        const done = () => {
          currentAnimation = void 0;
        };

        await animation.finished.then(done, done);
      },
      cancel: () => {
        currentAnimation?.cancel();
        currentAnimation = void 0;
      },
    };
  });

  return {
    cancel() {
      untrack(api).cancel()
    },
    async animate(
      keyframe: Keyframe[] | PropertyIndexedKeyframes,
      options?: number | KeyframeAnimationOptions
    ) {
      await untrack(api).animate(keyframe, options)
    }
  }
}
