# Implementation Plan: Folder Actions in Context Menu

## Goal
Ensure all 7 actions in the `[FolderDocumentContextMenu](file:///Users/okatech/okatech-projects/digitalium.io/src/components/modules/idocument/FolderDocumentContextMenu.tsx#149-628)` are fully implemented end-to-end, according to the NEOCORTEX OMEGA backend standards and NEXUS-ESPACE-v4 UI/UX principles.

## Audit of Current State
1. **Renommer le dossier**: ✅ Implemented (UI in [FolderDocumentContextMenu](file:///Users/okatech/okatech-projects/digitalium.io/src/components/modules/idocument/FolderDocumentContextMenu.tsx#149-628), backend via `folders.update`).
2. **Créer sous-dossier**: ⚠️ UI/UX bug. Clicking it changes the current view (`currentFolderId`) immediately before the modal opens, which is disruptive if the user cancels.
3. **Partager**: ✅ Implemented ([ShareDialog](file:///Users/okatech/okatech-projects/digitalium.io/src/components/modules/idocument/ShareDialog.tsx#32-297)). Calls `shareFolder` on backend.
4. **Gérer accès**: ❌ Not implemented. Currently just shows a toast: "Ouvrir l'onglet Classement dans l'admin pour gérer les accès."
5. **Politique d'archivage**: ✅ Implemented (UI in context menu, backend via `folderArchiveMetadata.setMetadata`).
6. **Catégorie de rétention (quick select)**: ✅ Implemented.
7. **Supprimer**: ✅ Implemented (moves to `trashed`).

## Proposed Changes

### 1. Fix "Créer sous-dossier" UX
#### [MODIFY] [src/components/modules/idocument/DocumentListPage.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/modules/idocument/DocumentListPage.tsx)
- Add a new state `subfolderParentId` instead of reusing `currentFolderId`.
- Update `handleCreateSubfolder` to set `subfolderParentId` and open the dialog without navigating.
- Update `handleCreateFolder` to use `subfolderParentId` if set, otherwise fallback to `currentFolderId`.
- Clear `subfolderParentId` when the "Nouveau dossier" dialog is closed.

### 2. Implement "Gérer accès"
#### [NEW] `src/components/modules/idocument/ManageAccessDialog.tsx`
- Create `ManageAccessDialog.tsx` based on [ShareDialog.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/modules/idocument/ShareDialog.tsx) UI but tailored for admins. It will handle folder-level permissions (`visibility`, `sharedWith`) by reusing the `api.folders.shareFolder` mutation but presenting it as an administrative interface (e.g. title "Gérer les accès du dossier").

#### [MODIFY] [src/components/modules/idocument/DocumentListPage.tsx](file:///Users/okatech/okatech-projects/digitalium.io/src/components/modules/idocument/DocumentListPage.tsx)
- Update `handleManageAccess` callback to set the `manageAccessTarget` state and open `ManageAccessDialog`.
- Import and render `ManageAccessDialog`.

## Verification Plan
### Automated Tests
- Type checking: `npm run tsc --noEmit` (Run this command in the project root to verify there are no TypeScript errors).

### Manual Verification
- Render the [DocumentListPage](file:///Users/okatech/okatech-projects/digitalium.io/src/components/modules/idocument/DocumentListPage.tsx#325-2889).
- Open the floating menu for a Folder.
- Click "Créer sous-dossier". Verify the view does not change, fill the name, submit, and verify the subfolder appears inside the parent folder.
- Click "Gérer accès" (as admin). Verify the dialog opens, modify the access level (e.g. to "Privé"), save, and verify the toast appears.
