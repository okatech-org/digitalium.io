/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accessMatrix from "../accessMatrix.js";
import type * as archiveConfig from "../archiveConfig.js";
import type * as archives from "../archives.js";
import type * as auditLogs from "../auditLogs.js";
import type * as businessRoles from "../businessRoles.js";
import type * as cellAccess from "../cellAccess.js";
import type * as cellAccessOverrides from "../cellAccessOverrides.js";
import type * as cellAccessRules from "../cellAccessRules.js";
import type * as clients from "../clients.js";
import type * as crons from "../crons.js";
import type * as demoAccounts from "../demoAccounts.js";
import type * as documents from "../documents.js";
import type * as filingCells from "../filingCells.js";
import type * as filingStructures from "../filingStructures.js";
import type * as fixArchiveData from "../fixArchiveData.js";
import type * as fixLifecycleData from "../fixLifecycleData.js";
import type * as generateDemoAccounts from "../generateDemoAccounts.js";
import type * as habilitations from "../habilitations.js";
import type * as leads from "../leads.js";
import type * as lifecycleScheduler from "../lifecycleScheduler.js";
import type * as orgMembers from "../orgMembers.js";
import type * as orgSites from "../orgSites.js";
import type * as orgUnits from "../orgUnits.js";
import type * as org_lifecycle from "../org_lifecycle.js";
import type * as organizations from "../organizations.js";
import type * as retentionAlerts from "../retentionAlerts.js";
import type * as seed from "../seed.js";
import type * as seedLeads from "../seedLeads.js";
import type * as signatures from "../signatures.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accessMatrix: typeof accessMatrix;
  archiveConfig: typeof archiveConfig;
  archives: typeof archives;
  auditLogs: typeof auditLogs;
  businessRoles: typeof businessRoles;
  cellAccess: typeof cellAccess;
  cellAccessOverrides: typeof cellAccessOverrides;
  cellAccessRules: typeof cellAccessRules;
  clients: typeof clients;
  crons: typeof crons;
  demoAccounts: typeof demoAccounts;
  documents: typeof documents;
  filingCells: typeof filingCells;
  filingStructures: typeof filingStructures;
  fixArchiveData: typeof fixArchiveData;
  fixLifecycleData: typeof fixLifecycleData;
  generateDemoAccounts: typeof generateDemoAccounts;
  habilitations: typeof habilitations;
  leads: typeof leads;
  lifecycleScheduler: typeof lifecycleScheduler;
  orgMembers: typeof orgMembers;
  orgSites: typeof orgSites;
  orgUnits: typeof orgUnits;
  org_lifecycle: typeof org_lifecycle;
  organizations: typeof organizations;
  retentionAlerts: typeof retentionAlerts;
  seed: typeof seed;
  seedLeads: typeof seedLeads;
  signatures: typeof signatures;
  subscriptions: typeof subscriptions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
