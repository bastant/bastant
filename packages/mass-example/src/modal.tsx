import { createModal2 } from "@bastant/modal";
import { directives } from "@bastant/base";
import { createEffect, onCleanup, onMount } from "solid-js";
import { get } from "@bastant/di";
import { Config } from "./config";
const clickOutside = directives.clickOutside;
const keypressOutside = directives.keypressOutside;

export default function ModalPage() {
	// const { Modal, ...api } = createModal({
	// 	dialogAnimation: {
	// 		enter: [{ opacity: 1, transform: "translateY(0)" }],
	// 		leave: [{ opacity: 0, transform: "translateY(200px)" }],
	// 		duration: 300,
	// 	},
	// });

	const { Modal, ...api } = createModal2();

	const config = get<Config>(Config);

	createEffect(() => {
		const timer = setInterval(() => {
			config().update();
		}, 1000);
		onCleanup(() => {
			clearInterval(timer);
		});
	});

	return (
		<div>
			<button {...api.triggerProps()}>Open</button>
			<Modal>
				<div
					style="height:4400px;width:400px;max-width:100%;background:white;margin:10px auto;"
					// use:clickOutside={() => {
					// 	console.log("click");
					// 	api.close();
					// }}
					// use:keypressOutside={(e) => {
					// 	if (e.key == "Escape") {
					// 		api.close();
					// 	}
					// }}
				>
					<h1
						onClick={(e) => {
							e.stopPropagation();
						}}
					>
						Hello, World!
					</h1>
					<p>UserId: {config().userId}</p>
					<button
						onClick={(e) => {
							e.preventDefault();
							e.stopImmediatePropagation();
							e.stopPropagation();
						}}
					>
						Hello
					</button>
				</div>
			</Modal>
		</div>
	);
}
