import { createModal } from "@mass/modal";
import { directives } from "@mass/base";
import { onCleanup, onMount } from "solid-js";
const clickOutside = directives.clickOutside;
const keypressOutside = directives.keypressOutside;

export default function ModalPage() {
  const { Modal, ...api } = createModal({
    dialogAnimation: {
      enter: [{ opacity: 1, transform: "translateY(0)" }],
      leave: [{ opacity: 0, transform: "translateY(200px)" }],
      duration: 300,
    },
  });

  return (
    <div>
      <button
        onClick={() => {
          api.toggle();
        }}
      >
        Open
      </button>
      <Modal>
        {(close) => {
          return (
            <div
              style="height:4400px;width:400px;background:white;margin:10px auto;"
              use:clickOutside={() => {
                console.log("click");
                api.close();
              }}
              use:keypressOutside={(e) => {
                if (e.key == "Escape") {
                  api.close();
                }
              }}
            >
              <h1
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                Hello, World!
              </h1>
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
          );
        }}
      </Modal>
    </div>
  );
}
