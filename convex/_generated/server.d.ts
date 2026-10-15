/* eslint-disable */
/**
 * Generated Convex server stubs for local type-checking before deployment.
 */
import { FunctionReference, GenericMutationCtx, GenericQueryCtx } from "convex/server";

export type MutationCtx = GenericMutationCtx<any>;
export type QueryCtx = GenericQueryCtx<any>;

export declare function mutation<Args extends Record<string, any>, Output>(
  config: { args: any; handler: (ctx: MutationCtx, args: Args) => Promise<Output> }
): FunctionReference<"mutation">;

export declare function query<Args extends Record<string, any>, Output>(
  config: { args: any; handler: (ctx: QueryCtx, args: Args) => Promise<Output> }
): FunctionReference<"query">;
