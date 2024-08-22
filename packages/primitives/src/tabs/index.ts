import {
	Box,
	type Breakpoint,
	FlexBox,
	Select,
	Text,
	createMediaQuery,
} from "@bastant/willow";
import { BREAKPOINTS, type ColorVariant } from "@bastant/willow-style";
import {
	children as Children,
	type Component,
	type For,
	type JSX,
	type ParentProps,
	Show,
	createEffect,
	createSelector,
	createSignal,
	onMount,
	untrack,
	Switch,
	Match,
	children,
	createMemo,
	type Accessor,
} from "solid-js";

export interface TabbingProps {
	onChange?: (prop: TabProps, idx: number) => unknown;
	tabs: Accessor<TabProps[]>;
}

/*
export function Tabbing(props: ParentProps<TabbingProps>) {
	const [index, setIdx] = createSignal(props.index ?? 0);
	const children = Children(() => props.children);
	const resolved = () => children.toArray() as unknown as TabProps[];

	let tabBarRef: HTMLUListElement | undefined;
	let indicatorRef: HTMLDivElement | undefined;

	const setIndex = (idx: number) => {
		if (idx === untrack(index)) {
			return;
		}

		setIdx(idx);

		props.onChange?.(resolved()[idx], idx);

		const child = tabBarRef?.children?.item(idx) as HTMLElement | undefined;

		if (child) {
			if (child === indicatorRef) return;

			const left = child?.offsetLeft;
			const width = child?.clientWidth;

			indicatorRef?.style.setProperty("left", `${left}px`);
			indicatorRef?.style.setProperty("width", `${width}px`);
		}
	};

	onMount(() => {
		setIndex(index());
	});

	createEffect(() => {
		if (props.index !== undefined) {
			setIndex(props.index);
		}
	});

	const selected = createSelector(index);

	const currentChild = createMemo(() => {
		return resolved()?.[index()].children;
	});

	return (
		<Box
			rounded={{ default: "2", mobile: void 0 }}
			bg="background"
			bs={{ default: "1", mobile: null }}
			bw="1"
			bc="border"
			style="height:100%"
		>
			<Breakpoint bp="mobile">
				<Box
					pb={"4"}
					position="sticky"
					style="top:16px;"
					zIndex={"1"}
					bg="background"
				>
					<TabSelect
						items={resolved()}
						selected={index()}
						onChange={setIndex}
					/>
				</Box>
			</Breakpoint>
			<FlexBox class={props.class} style={props.style} direction="column">
				<Breakpoint bp={["tablet", "desktop"]}>
					<FlexBox
						ref={tabBarRef}
						class={css["tabs__tabbar"]}
						as="ul"
						gap="6"
						p="4"
					>
						<For each={resolved()}>
							{(child, index) => (
								<li>
									<Show when={child.icon}>
										<Dynamic
											component={child.icon}
											size={16}
											color={selected(index()) ? "primary" : "text"}
										/>
									</Show>
									<Text
										weight="bold"
										ml={child.icon ? "2" : "0"}
										color={selected(index()) ? "primary" : "text"}
										onClick={() => setIndex(index())}
									>
										{child.title}
									</Text>
								</li>
							)}
						</For>
						<Box
							ref={indicatorRef}
							bg="primary"
							class={css["tabs__tabbar__indicator"]}
						/>
					</FlexBox>
				</Breakpoint>
				<Box
					rounded={{ default: null, mobile: "2" }}
					bs={default: false, mobile: "1" }
					bw="1"
					bc="border"
					style={{ flex: "1" }}
				>
					{currentChild()}
				</Box>
			</FlexBox>
		</Box>
	);
}*/

export interface TabProps {
	title: JSX.Element;
	children: JSX.Element;
	icon?: Component<{ size?: number; color?: ColorVariant }>;
}

export function Tab(props: TabProps) {
	return props as unknown as JSX.Element;
}
/*
interface TabSelect {
	selected: number;
	items: TabProps[];
	onChange: (index: number) => void;
}

function TabSelect(props: TabSelect) {
	let ref: HTMLSelectElement | undefined;

	createEffect(() => {
		ref!.value = `${props.selected}`;
	});

	return (
		<Select
			ref={ref}
			onChange={(e) => {
				const number = Number.parseInt(e.target.value);
				props.onChange(number);
			}}
		>
			<For each={props.items}>
				{(child, index) => (
					<option value={index()}>
						<Show when={child.icon}>
							<Dynamic component={child.icon} size={16} />
						</Show>
						<Text weight="bold" ml={child.icon ? "2" : "0"}>
							{child.title}
						</Text>
					</option>
				)}
			</For>
		</Select>
	);
}*/

export function createTabs(opts: TabbingProps) {
	const [index, setIdx] = createSignal(0);

	const setIndex = (idx: number) => {
		if (index() === idx) {
			return;
		}

		if (idx > opts.tabs().length) {
			return;
		}

		setIdx(idx);

		opts.onChange?.(opts.tabs()[index()], index());
	};

	return createMemo(() => {
		const tabs = opts
			.tabs()
			.map((m, idx) => ({ ...m, selected: () => index() === idx }));

		return {
			tabs: tabs,
			selected: () => tabs[index()],
			select: (idx: number) => untrack(() => setIndex(idx)),
		};
	});
}
