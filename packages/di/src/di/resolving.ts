import { IContainer, IResolver } from "./types";

export abstract class Resolver implements IResolver {
  abstract get(container: IContainer): unknown;
}
