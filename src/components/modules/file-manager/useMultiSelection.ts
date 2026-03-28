// ═══════════════════════════════════════════════
// DIGITALIUM.IO — File Manager: useMultiSelection
// Hook pour la sélection multiple style macOS Finder
// Cmd/Ctrl+Click = toggle individuel
// Shift+Click = sélection en plage
// Click simple = sélection unique
// ═══════════════════════════════════════════════

"use client";

import { useState, useCallback, useMemo } from "react";
import type { SelectedItem } from "./types";

export interface UseMultiSelectionOptions {
    /** Liste ordonnée de tous les IDs affichés (pour Shift+Click en plage) */
    orderedIds: string[];
    /** Map id → type pour les résolutions */
    itemTypeMap: Map<string, "file" | "folder">;
    /** Map id → name pour les résolutions */
    itemNameMap: Map<string, string>;
}

export interface UseMultiSelectionReturn {
    /** Set des IDs sélectionnés */
    selectedIds: Set<string>;
    /** Tableau structuré des items sélectionnés */
    selectedItems: SelectedItem[];
    /** Nombre d'items sélectionnés */
    selectionCount: number;
    /** Vérifie si un item est sélectionné */
    isSelected: (id: string) => boolean;
    /** Handler de clic — gère Cmd, Shift, clic simple */
    handleClick: (id: string, event: React.MouseEvent | { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => void;
    /** Sélectionner tout */
    selectAll: () => void;
    /** Désélectionner tout */
    clearSelection: () => void;
    /** Toggle un item */
    toggleItem: (id: string) => void;
    /** Sélection directe (remplace tout) */
    setSelection: (ids: string[]) => void;
    /** Vérifie si au moins un élément est sélectionné */
    hasSelection: boolean;
}

export function useMultiSelection({
    orderedIds,
    itemTypeMap,
    itemNameMap,
}: UseMultiSelectionOptions): UseMultiSelectionReturn {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastClickedId, setLastClickedId] = useState<string | null>(null);

    const handleClick = useCallback(
        (id: string, event: React.MouseEvent | { metaKey?: boolean; ctrlKey?: boolean; shiftKey?: boolean }) => {
            const isMetaOrCtrl = event.metaKey || event.ctrlKey;
            const isShift = event.shiftKey;

            setSelectedIds((prev) => {
                const next = new Set(prev);

                if (isMetaOrCtrl) {
                    // Cmd/Ctrl+Click : toggle cet item
                    if (next.has(id)) {
                        next.delete(id);
                    } else {
                        next.add(id);
                    }
                } else if (isShift && lastClickedId) {
                    // Shift+Click : sélection en plage
                    const startIdx = orderedIds.indexOf(lastClickedId);
                    const endIdx = orderedIds.indexOf(id);
                    if (startIdx !== -1 && endIdx !== -1) {
                        const [from, to] = startIdx < endIdx
                            ? [startIdx, endIdx]
                            : [endIdx, startIdx];
                        for (let i = from; i <= to; i++) {
                            next.add(orderedIds[i]);
                        }
                    } else {
                        // Fallback : sélection simple
                        next.clear();
                        next.add(id);
                    }
                } else {
                    // Clic simple : sélection unique
                    next.clear();
                    next.add(id);
                }

                return next;
            });

            setLastClickedId(id);
        },
        [lastClickedId, orderedIds]
    );

    const selectAll = useCallback(() => {
        setSelectedIds(new Set(orderedIds));
    }, [orderedIds]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        setLastClickedId(null);
    }, []);

    const toggleItem = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const setSelection = useCallback((ids: string[]) => {
        setSelectedIds(new Set(ids));
    }, []);

    const isSelected = useCallback((id: string) => selectedIds.has(id), [selectedIds]);

    const selectedItems: SelectedItem[] = useMemo(() => {
        return Array.from(selectedIds).map((id) => ({
            id,
            type: itemTypeMap.get(id) ?? "file",
            name: itemNameMap.get(id) ?? id,
        }));
    }, [selectedIds, itemTypeMap, itemNameMap]);

    const hasSelection = selectedIds.size > 0;
    const selectionCount = selectedIds.size;

    return {
        selectedIds,
        selectedItems,
        selectionCount,
        isSelected,
        handleClick,
        selectAll,
        clearSelection,
        toggleItem,
        setSelection,
        hasSelection,
    };
}
