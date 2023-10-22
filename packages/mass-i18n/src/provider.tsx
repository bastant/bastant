import {
  Accessor,
  ParentProps,
  createContext,
  createMemo,
  createResource,
  createSignal,
  onMount,
  useContext,
} from "solid-js";
import type {
  i18n,
  InitOptions,
  TFunction,
  Module,
  Newable,
  NewableModule,
} from "i18next";
import i18next from "i18next";

interface Context {
  instance: Accessor<{ i18n: i18n; loaded: boolean }>;
  t: Accessor<TFunction>;
  changeLanguage: (lngs: string) => Promise<void>;
}

const CONTEXT = createContext<Context>();

function useI18nContext(): Context {
  const ctx = useContext(CONTEXT);
  if (!ctx) {
    throw new Error("no i18n instance");
  }

  return ctx;
}

export function useI18n(): Accessor<i18n> {
  const ctx = useI18nContext();
  return () => ctx.instance().i18n;
}

export function useChangeLanguge(): (lng: string) => void {
  const ctx = useI18nContext();
  return (lng) => {
    ctx.changeLanguage(lng);
  };
}

function loadI18n(
  instance: i18n,
  options?: InitOptions
): Promise<[i18n, TFunction]> {
  return new Promise((res, rej) => {
    instance.init(options ?? {}, (_, t) => {
      res([instance, t]);
    });
  });
}

export interface I18nProviderProps {
  i18n?: i18n;
  options?: InitOptions;
  plugins?: (Module | NewableModule<Module> | Newable<Module>)[];
  init?: (instance: i18n) => void;
}

export function I18nProvider(props: ParentProps<I18nProviderProps>) {
  return <Inner {...props} />;

  function Inner(props: ParentProps<I18nProviderProps>) {
    const [instance, setInstance] = createSignal({
      i18n: props.i18n ?? i18next,
      loaded: false,
    });

    onMount(() => {
      (props.plugins ?? []).forEach((item) => instance().i18n.use(item));

      props.init?.(instance().i18n);

      loadI18n(instance().i18n, props.options).then(([i]) => {
        setInstance({
          i18n: i,
          loaded: true,
        });
      });
    });

    const tfunc = createMemo(() =>
      instance().loaded
        ? instance().i18n.t
        : (((key: string, defaultValue?: string) =>
            defaultValue || key) as TFunction)
    );

    const value = {
      instance,
      t: tfunc,
      changeLanguage: async (lng: string) => {
        await instance().i18n.changeLanguage(lng);
        setInstance((old) => ({ ...old }));
      },
    };

    return <CONTEXT.Provider value={value}>{props.children}</CONTEXT.Provider>;
  }
}

const TFUNC_CONTEXT = createContext<Accessor<TFunction>>();

export function useTFunc(): TFunction {
  const ctx = useContext(TFUNC_CONTEXT);
  const t = ctx ?? useI18nContext().t;
  return ((...args: any[]) => {
    return (t() as any).apply(void 0, args);
  }) as unknown as TFunction;
}
export function useFixedTFunc<NS extends string, PREFIX extends string>(
  lng: null,
  ns?: Accessor<NS | undefined>,
  keyPrefix?: Accessor<PREFIX | undefined>
): TFunction<NS, PREFIX>;
export function useFixedTFunc(
  lng: Accessor<string | readonly string[] | null> | null,
  ns?: undefined,
  keyPrefix?: undefined
): TFunction<"translation", undefined>;
export function useFixedTFunc<NS extends string, PREFIX extends string>(
  lng: Accessor<string | readonly string[] | null> | null,
  ns?: Accessor<NS | undefined>,
  keyPrefix?: Accessor<PREFIX | undefined>
): TFunction<NS, PREFIX> {
  const t = useFixedTFuncInner(lng, ns, keyPrefix);

  return ((lng: any, ns: any, keyPrefix: any) => {
    return t()(lng, ns, keyPrefix);
  }) as TFunction<NS, PREFIX>;
}

function useFixedTFuncInner<NS extends string, PREFIX extends string>(
  lng: Accessor<string | readonly string[] | null> | null,
  ns?: Accessor<NS | undefined>,
  keyPrefix?: Accessor<PREFIX | undefined>
): Accessor<TFunction<NS, PREFIX>> {
  const ctx = useI18nContext();

  const opts = createMemo(() => ({
    lng: lng ? lng() : null,
    ns: ns?.(),
    keyPrefix: keyPrefix?.(),
    instance: ctx.instance(),
  }));

  const [res] = createResource(
    opts,
    async ({ lng, ns, keyPrefix, instance }) => {
      if (!instance.loaded) {
        return ((key: string, defaultValue?: string) =>
          defaultValue || key) as TFunction<NS, PREFIX>;
      }

      let i18n = ctx.instance().i18n;

      const promises = [];

      if (lng) {
        promises.push(i18n.loadLanguages(lng));
      }

      if (ns && !i18n.hasLoadedNamespace(ns)) {
        promises.push(i18n.loadNamespaces(ns));
      }

      await Promise.all(promises);

      return (i18n.getFixedT as any)(lng, ns, keyPrefix) as TFunction<
        NS,
        PREFIX
      >;
    }
  );

  return createMemo(
    () =>
      res() ??
      (((key: string, defaultValue?: string) =>
        defaultValue || key) as TFunction)
  );
}

export function Fixed(props: ParentProps<{ ns?: string; keyPrefix?: string }>) {
  const tfunc = useFixedTFuncInner(
    null,
    () => props.ns,
    () => props.keyPrefix
  );

  return (
    <TFUNC_CONTEXT.Provider value={tfunc}>
      {props.children}
    </TFUNC_CONTEXT.Provider>
  );
}
