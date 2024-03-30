export type SectionType = string | symbol | number | undefined;

export const MetaKeys = {
  registration: Symbol.for("di:registration"),
  instanceActivator: Symbol.for("di:instance-activator"),
  dependencyResolver: Symbol.for("di:dependency-resolver"),
  paramTypes: "design:paramtypes", // This should match, what tsc is emitting
  properties: "design:properties", // This should match, what tsc is emitting
};

type MetaMap = Map<unknown, unknown>;

const METADATA = new WeakMap<
  object,
  Map<string | symbol | number | undefined, Map<unknown, unknown>>
>();

function getOrCreateMetaMap(
  target: object,
  section: SectionType,
  create: true
): MetaMap;
function getOrCreateMetaMap(
  target: object,
  section: SectionType,
  create: false
): MetaMap | undefined;
function getOrCreateMetaMap(
  target: object,
  section: SectionType,
  create: boolean
): MetaMap | undefined {
  let targetMetaMap = METADATA.get(target);
  if (!targetMetaMap) {
    if (!create) return void 0;
    targetMetaMap = new Map();
    METADATA.set(target, targetMetaMap);
  }

  let metadata = targetMetaMap.get(section);

  if (!metadata) {
    if (!create) return void 0;

    metadata = new Map();

    targetMetaMap.set(section, metadata);
  }

  return metadata;
}

export function defineMetadata(
  key: unknown,
  value: unknown,
  target: object,
  section?: SectionType
) {
  const metadata = getOrCreateMetaMap(target, section, true);
  metadata.set(key, value);
}

export function getMetadata(
  key: unknown,
  target: object,
  section: SectionType
) {
  const metadata = getOrCreateMetaMap(target, section, false);
  return metadata?.get(key);
}
