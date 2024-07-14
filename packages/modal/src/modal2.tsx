import * as dialog from "@zag-js/dialog";
import { Portal } from "solid-js/web";
import { useMachine, normalizeProps } from "@zag-js/solid";
import {
	createComputed,
	createMemo,
	createUniqueId,
	type ParentProps,
	Show,
	untrack,
} from "solid-js";

export interface ModalProps {
	show?: boolean;
}

export function createModal2() {
	const [state, send] = useMachine(
		dialog.machine({ id: createUniqueId(), closeOnInteractOutside: false }),
	);

	const api = createMemo(() => dialog.connect(state, send, normalizeProps));

	const Modal = (props: ParentProps<ModalProps>) => {
		createComputed(() => {
			api().setOpen(!!props.show);
		});

		return (
			<Show when={api().open}>
				<Portal>
					<div {...api().getBackdropProps()} />
					<div {...api().getPositionerProps()}>
						<div {...api().getContentProps()}>{props.children}</div>
					</div>
				</Portal>
			</Show>
		);
	};

	return {
		Modal,
		triggerProps: () => api().getTriggerProps(),
		titleProps: () => api().getTitleProps(),
		descriptionProps: () => api().getDescriptionProps(),
		toggle() {
			untrack(api).setOpen(untrack(api).open);
		},
		open() {
			untrack(api).setOpen(true);
		},
		close() {
			untrack(api).setOpen(false);
		},
		isShown: () => api().open,
	};
}
