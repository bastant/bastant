import type { JSXElement, Component } from "solid-js";
import { Portal } from "solid-js/web";
import {
  Show,
  createSignal,
  createComputed,
  createEffect,
  on,
  onMount,
  createMemo,
} from "solid-js";
import { DynamicShow, Reveal } from "@bastant/base";

export interface ModalProps {
  show?: boolean;
  children?: ((close: () => void) => JSXElement) | JSXElement;
}

export interface CreateModalApiOptions {
  mount?: Element;
}

export interface ModalControl {
  isShown: () => boolean;
  toggle(): void;
  show(): void;
  close(): void;
  Modal: Component<ModalProps>;
}

export function createModalApi(
  options: CreateModalApiOptions = {}
): ModalControl {
  const [show, shouldShow] = createSignal(false);

  const Modal = (props: ModalProps) => {
    createComputed(() => {
      shouldShow(!!props.show);
    });

    const children = createMemo(() => {
      return typeof props.children === "function"
        ? props.children(() => shouldShow(false))
        : props.children;
    });

    return (
      <Show when={show()}>
        <Portal mount={options.mount}>{children()}</Portal>
      </Show>
    );
  };

  return {
    Modal,
    show: () => shouldShow(true),
    close: () => shouldShow(false),
    toggle: () => shouldShow(!show()),
    isShown: show,
  };
}

export interface CreateModalOptions extends CreateModalApiOptions {
  /**
   * Overlay color
   * @default rgba(0,0,0,0.7)
   */
  overlayColor?: string;
  overlayAnimation?: {
    enter: Keyframe[];
    leave: Keyframe[];
    delay?: number;
    duration: number;
  };
  //
  dialogAnimation?: {
    enter: Keyframe[];
    leave: Keyframe[];
    delay?: number;
    duration: number;
  };
}

export function createModal(options: CreateModalOptions = {}): ModalControl {
  const { Modal: InnerModal, ...api } = createModalApi(options);

  const {
    overlayColor = "rgba(0,0,0,0.7)",
    overlayAnimation = {
      enter: [{ opacity: 1 }],
      leave: [{ opacity: 0 }],
      duration: 300,
    },
    dialogAnimation = {
      enter: [{ opacity: 1 }],
      leave: [{ opacity: 0 }],
      duration: 200,
    },
  } = options;

  const [show, shouldShow] = createSignal(false);

  const Modal = (props: ModalProps) => {
    const children = createMemo(() => {
      return typeof props.children === "function"
        ? props.children(() => shouldShow(false))
        : props.children;
    });

    return (
      <InnerModal {...props}>
        <div style="width:100vw;height:100vh;top:0;left:0;position:fixed;">
          <DynamicShow
            show={show()}
            enter={overlayAnimation.enter}
            leave={overlayAnimation.leave}
            duration={300}
            delay={show() ? 0 : 100}
            onLeave={() => {
              api.close();
            }}
            style={{
              inset: 0,
              position: "absolute",
              "background-color": overlayColor,
            }}
          />

          <div style="height:100%;width:100%;overflow:auto;position:relative;">
            <DynamicShow
              show={show()}
              enter={dialogAnimation.enter}
              leave={dialogAnimation.leave}
              duration={200}
              delay={show() ? 100 : 0}
            >
              {children()}
            </DynamicShow>
          </div>
        </div>
      </InnerModal>
    );
  };

  return {
    Modal,
    show: () => {
      api.show();
      shouldShow(true);
    },
    close: () => shouldShow(false),
    toggle: () => {
      if (show()) {
        shouldShow(false);
      } else {
        api.show();
        shouldShow(true);
      }
    },
    isShown: show,
  };
}
