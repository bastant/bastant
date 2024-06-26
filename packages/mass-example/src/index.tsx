import { render } from "solid-js/web";
import { createForm } from "@bastant/form";
import { createModal } from "@bastant/modal";

import { For, createSignal, lazy } from "solid-js";
import { A, Route, Router, Routes } from "@solidjs/router";
import { Fixed, I18nProvider, Trans } from "@bastant/i18n";
import { Reveal } from "@bastant/base";

import { margin } from "./styling/helpers.js";

import "./app.scss";

function App() {
  return (
    <Router>
      <Fixed keyPrefix="nav">
        <nav>
          <ul classList={margin({ m: "normal" })}>
            <li>
              <A href="/form" activeClass="active">
                <Trans key="form">Forms</Trans>
              </A>
            </li>
            <li>
              <A href="/list-state" activeClass="active">
                List State
              </A>
            </li>
            <li>
              <A href="/utils" activeClass="active">
                Util
              </A>
            </li>
            <li>
              <A href="/modals" activeClass="active">
                Modals
              </A>
            </li>
            <li>
              <A href="/list" activeClass="active">
                List
              </A>
            </li>
          </ul>
        </nav>
      </Fixed>

      <Reveal
        mode="parallel"
        appear={false}
        onEnter={(el) => {
          el.style.position = "relative";
        }}
        enter={(el) =>
          el.animate(
            [
              {
                opacity: 0,
                transform: "translateX(-100px)",
              },
              { opacity: 1, transform: "translateX(0)" },
            ],
            {
              duration: 300,
            }
          )
        }
        onBeforeEnter={(el) => {
          el.style.position = "absolute";
        }}
        onBeforeLeave={(el) => {
          el.style.position = "absolute";
        }}
        onLeave={(el) => {
          el.style.position = "relative";
        }}
        leave={(el) =>
          el.animate(
            [
              { opacity: 1, transform: "translateX(0)", position: "absolute" },
              { opacity: 0, transform: "translateX(-100px)" },
            ],
            { duration: 200 }
          )
        }
      >
        <main>
          <Routes>
            <Route
              path="/form"
              component={lazy(() => import("./formning/index.jsx"))}
            />
            <Route
              path="/list-state"
              component={lazy(() => import("./list-state.js"))}
            />
            <Route path="/utils" component={lazy(() => import("./utils.js"))} />
            <Route
              path="/modals"
              component={lazy(() => import("./modal.js"))}
            />
            <Route path="/list" component={lazy(() => import("./list.js"))} />
          </Routes>
        </main>
      </Reveal>
    </Router>
  );
}

render(() => {
  return (
    <I18nProvider
      options={{
        debug: true,
        lng: "da",

        resources: {
          da: {
            translation: {
              yes: "ja",
              no: "nej",
              "nav.form": "Former",
            },
            forms: {
              header: {
                field: "Felt",
                form: "Form",
              },
            },
            formning: {
              name: {
                label: "Navn",
              },
            },
          },
        },
      }}
    >
      <App />
    </I18nProvider>
  );
}, document.querySelector("#root")!);
