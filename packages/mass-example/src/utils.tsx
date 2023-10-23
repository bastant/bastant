import { createSway } from "@bastant/base";
import { Reveal, StackView } from "@bastant/base";
import {
  Match,
  Show,
  Switch,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

export default function UtilsPage() {
  const [show, setShow] = createSignal(false);
  const [tab, setTab] = createSignal(1);

  return (
    <div>
      <Dropdown />
      <button onClick={() => setShow(!show())}>
        {show() ? "hide" : "show"}
      </button>
      <button onClick={() => setTab(0)}>Set Tab1</button>
      <button onClick={() => setTab(1)}>Set Tab2</button>
      <Reveal
        enter={(el) =>
          el.animate(
            [
              { opacity: 0, height: 0 },
              { opacity: 1, height: el.clientHeight + "px" },
            ],
            {
              duration: 200,
            }
          )
        }
        leave={(el) =>
          el.animate(
            [
              { opacity: 1, height: el.clientHeight + "px" },
              { opacity: 0, height: 0 },
            ],
            { duration: 200 }
          )
        }
      >
        <Show when={show()}>
          <Hello />
        </Show>
      </Reveal>
      <Reveal
        appear={true}
        mode={"out-in"}
        enter={(el) =>
          el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 })
        }
        leave={(el) =>
          el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 100 })
        }
      >
        <StackView idx={tab()}>
          <Tab1 />
          <div>Tab 2</div>
        </StackView>
      </Reveal>
    </div>
  );
}

function Tab1() {
  onMount(() => console.log("TAB mount"));
  onCleanup(() => {
    console.log("tab cleanup");
  });
  return <div>Tab 1</div>;
}

function Hello() {
  onMount(() => console.log("Hello mount"));
  onCleanup(() => {
    console.log("Hello cleanup");
  });
  return <div>Hello, World!</div>;
}

function Dropdown() {
  const [targetRef, setTargetRef] = createSignal<Element>();
  const [el, setEl] = createSignal<Element>();
  const [show, setShow] = createSignal(false);

  const api = createSway(targetRef as any, el, {
    positon: "top",
  });

  createEffect(() => {
    if (show()) {
      api.track();
    } else {
      api.untrack();
    }
  });

  return (
    <div style="position: relative; width: 500px; height: 500px;overflow:auto">
      <div style="height:1000px;">
        <button
          style="position: absolute; top: 200px; left:20px;"
          onClick={() => {
            setShow(!show());
          }}
          ref={setTargetRef}
        >
          Test
        </button>
        <Show when={show()}>
          <div ref={setEl}>
            <h1>Hello, World!</h1>
          </div>
        </Show>
      </div>
    </div>
  );
}
