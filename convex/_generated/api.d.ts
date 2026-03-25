/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiSmartImport from "../aiSmartImport.js";
import type * as archiveBridge from "../archiveBridge.js";
import type * as archiveConfig from "../archiveConfig.js";
import type * as archives from "../archives.js";
import type * as auditLogs from "../auditLogs.js";
import type * as automationEngine from "../automationEngine.js";
import type * as businessRoles from "../businessRoles.js";
import type * as cellAccessOverrides from "../cellAccessOverrides.js";
import type * as cellAccessRules from "../cellAccessRules.js";
import type * as clients from "../clients.js";
import type * as configPropagation from "../configPropagation.js";
import type * as crons from "../crons.js";
import type * as dataRooms from "../dataRooms.js";
import type * as demoAccounts from "../demoAccounts.js";
import type * as documentMetadataFields from "../documentMetadataFields.js";
import type * as documentTypes from "../documentTypes.js";
import type * as documents from "../documents.js";
import type * as filingCells from "../filingCells.js";
import type * as filingStructures from "../filingStructures.js";
import type * as fixArchiveData from "../fixArchiveData.js";
import type * as fixLifecycleData from "../fixLifecycleData.js";
import type * as folderArchiveMetadata from "../folderArchiveMetadata.js";
import type * as folders from "../folders.js";
import type * as generateDemoAccounts from "../generateDemoAccounts.js";
import type * as leads from "../leads.js";
import type * as lib_certificateNumber from "../lib/certificateNumber.js";
import type * as lifecycleScheduler from "../lifecycleScheduler.js";
import type * as notifications from "../notifications.js";
import type * as orgMembers from "../orgMembers.js";
import type * as orgSites from "../orgSites.js";
import type * as orgUnits from "../orgUnits.js";
import type * as org_lifecycle from "../org_lifecycle.js";
import type * as organizations from "../organizations.js";
import type * as payments from "../payments.js";
import type * as permissionGroups from "../permissionGroups.js";
import type * as retentionAlerts from "../retentionAlerts.js";
import type * as seed from "../seed.js";
import type * as seedLeads from "../seedLeads.js";
import type * as signatureWorkflows from "../signatureWorkflows.js";
import type * as signatures from "../signatures.js";
import type * as subscriptions from "../subscriptions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiSmartImport: typeof aiSmartImport;
  archiveBridge: typeof archiveBridge;
  archiveConfig: typeof archiveConfig;
  archives: typeof archives;
  auditLogs: typeof auditLogs;
  automationEngine: typeof automationEngine;
  businessRoles: typeof businessRoles;
  cellAccessOverrides: typeof cellAccessOverrides;
  cellAccessRules: typeof cellAccessRules;
  clients: typeof clients;
  configPropagation: typeof configPropagation;
  crons: typeof crons;
  dataRooms: typeof dataRooms;
  demoAccounts: typeof demoAccounts;
  documentMetadataFields: typeof documentMetadataFields;
  documentTypes: typeof documentTypes;
  documents: typeof documents;
  filingCells: typeof filingCells;
  filingStructures: typeof filingStructures;
  fixArchiveData: typeof fixArchiveData;
  fixLifecycleData: typeof fixLifecycleData;
  folderArchiveMetadata: typeof folderArchiveMetadata;
  folders: typeof folders;
  generateDemoAccounts: typeof generateDemoAccounts;
  leads: typeof leads;
  "lib/certificateNumber": typeof lib_certificateNumber;
  lifecycleScheduler: typeof lifecycleScheduler;
  notifications: typeof notifications;
  orgMembers: typeof orgMembers;
  orgSites: typeof orgSites;
  orgUnits: typeof orgUnits;
  org_lifecycle: typeof org_lifecycle;
  organizations: typeof organizations;
  payments: typeof payments;
  permissionGroups: typeof permissionGroups;
  retentionAlerts: typeof retentionAlerts;
  seed: typeof seed;
  seedLeads: typeof seedLeads;
  signatureWorkflows: typeof signatureWorkflows;
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
