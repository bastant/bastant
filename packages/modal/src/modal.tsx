import type { JSXElement, Component, JSX } from "solid-js";
import { Portal } from "solid-js/web";
import { Show, createSignal, createComputed } from "solid-js";
import { DynamicShow, type AnimateFunc } from "@bastant/animate";

export interface ModalProps {
	show?: boolean;
	children?: JSXElement; // ((close: () => void) => JSXElement) | JSXElement;
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
	options: CreateModalApiOptions = {},
): ModalControl {
	const [show, shouldShow] = createSignal(false);

	const Modal = (props: ModalProps) => {
		createComputed(() => {
			shouldShow(!!props.show);
		});

		return (
			<Show when={show()}>
				<Portal mount={options.mount}>{props.children}</Portal>
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
	overlayStyle?: JSX.CSSProperties;
	overlayClass?: string;
	overlayAnimation?: {
		enter: Keyframe[] | AnimateFunc<HTMLDivElement>;
		leave: Keyframe[] | AnimateFunc<HTMLDivElement>;
		delay?: number;
		duration: number;
		easing?: string;
	};
	//
	dialogAnimation?: {
		enter: Keyframe[] | AnimateFunc<HTMLDivElement>;
		leave: Keyframe[] | AnimateFunc<HTMLDivElement>;
		delay?: number;
		duration: number;
		easing?: string;
	};
}

export function createModal(options: CreateModalOptions = {}): ModalControl {
	const { Modal: InnerModal, ...api } = createModalApi(options);

	const {
		overlayStyle = {
			"background-color": "rgba(0,0,0,0.7)",
		},
		overlayAnimation = {
			enter: [{ opacity: 0 }, { opacity: 1 }],
			leave: [{ opacity: 1 }, { opacity: 0 }],
			duration: 300,
		},
		dialogAnimation = {
			enter: [{ opacity: 0 }, { opacity: 1 }],
			leave: [{ opacity: 1 }, { opacity: 0 }],
			duration: 200,
		},
	} = options;

	const [show, shouldShow] = createSignal(false);

	const Modal = (props: ModalProps) => {
		return (
			<InnerModal {...props}>
				<div style="width:100vw;height:100vh;height:100dvh;top:0;left:0;position:fixed;z-index:1">
					<DynamicShow
						show={show()}
						enter={overlayAnimation.enter}
						leave={overlayAnimation.leave}
						duration={overlayAnimation.duration ?? 300}
						delay={show() ? 0 : 100}
						easing={overlayAnimation.easing}
						onLeave={() => {
							api.close();
						}}
						style={{
							...overlayStyle,
							inset: 0,
							position: "absolute",
						}}
					/>

					<div style="height:100%;width:100%;overflow:auto;position:relative;">
						<DynamicShow
							show={show()}
							enter={dialogAnimation.enter}
							leave={dialogAnimation.leave}
							easing={dialogAnimation.easing}
							duration={dialogAnimation.duration ?? 200}
							delay={show() ? 100 : 0}
						>
							{props.children}
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
