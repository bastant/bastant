import {
  Accessor,
  JSX,
  Show,
  createComputed,
  createEffect,
  createSignal,
  splitProps,
} from "solid-js";
import { useVisibilityObserver } from "./observer.jsx";
import { Reveal } from "./reveal.jsx";

export function LazyImage(props: ImageProps) {
  const [loaded, setLoaded] = createSignal(false);

  let el: HTMLImageElement | undefined;
  const observer = useVisibilityObserver(() => el!);

  const [local, imageProps] = splitProps(props, ["src", "class"]);

  createEffect(() => {
    if (observer()) {
      setLoaded(true);
    }
  });

  return (
    <div ref={el} class={local.class}>
      <Show when={loaded()}>
        <Image {...imageProps} src={local.src} />
      </Show>
    </div>
  );
}

export type ImageProps = JSX.HTMLElementTags["img"] & {
  fallback?: string;
  onLoaded?: (size: { width: number; height: number }) => void;
};

export function Image(props: ImageProps) {
  const [src, setSrc] = createSignal<string>();

  const [local, imageProps] = splitProps(props, ["src", "fallback"]);

  createComputed(() => {
    if (!local.src) {
      return;
    }

    const image = new window.Image();
    image.onload = () => {
      props.onLoaded?.({ width: image.width, height: image.height });
      setSrc(local.src);
    };

    image.src = local.src;
  });

  return (
    <Reveal
      enter={(el) =>
        el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 })
      }
      leave={(el) => el.animate([{ opacity: 1 }, { opacity: 300 }])}
    >
      <Show when={src()}>
        <img {...imageProps} src={src() ? src() : local.fallback} />;
      </Show>
    </Reveal>
  );
}
