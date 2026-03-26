"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useConvexOrgId } from "@/hooks/useConvexOrgId";
import { useAuth } from "@/hooks/useAuth";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Globe, Lock, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ShareDialogProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string | null;
    itemType: "folder" | "document" | null;
}

type VisibilityType = "private" | "team" | "shared";

export function ShareDialog({ isOpen, onClose, itemId, itemType }: ShareDialogProps) {
    const { convexOrgId } = useConvexOrgId();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [visibility, setVisibility] = useState<VisibilityType>("team");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);

    // Queries
    const orgMembers = useQuery(
        api.orgMembers.list,
        convexOrgId ? { organizationId: convexOrgId } : "skip"
    );

    // Get current item to pre-fill state
    const folders = useQuery(api.folders.listByOrgFlat, convexOrgId ? { organizationId: convexOrgId } : "skip");
    const documents = useQuery(api.documents.list, convexOrgId ? { organizationId: convexOrgId } : "skip");

    const currentItem = useMemo(() => {
        if (!itemId || !itemType) return null;
        if (itemType === "folder" && folders) {
            return folders.find((f) => f._id === itemId);
        }
        if (itemType === "document" && documents) {
            return documents.find((d) => d._id === itemId);
        }
        return null;
    }, [itemId, itemType, folders, documents]);

    // Mutations
    const shareFolderMut = useMutation(api.folders.shareFolder);
    const shareDocumentMut = useMutation(api.documents.shareDocument);
    const unshareDocumentMut = useMutation(api.documents.unshareDocument);

    // Reset state when opening/changing item
    useEffect(() => {
        if (isOpen && currentItem) {
            setSearch("");

            // Extract shared users
            const uids = new Set<string>();
            if (itemType === "folder") {
                const folder = currentItem as typeof folders extends (infer U)[] | undefined ? U : never;
                if (folder && "permissions" in folder) {
                    const perms = folder.permissions as { visibility?: string; sharedWith?: string[] } | undefined;
                    setVisibility((perms?.visibility as VisibilityType) || "team");
                    if (Array.isArray(perms?.sharedWith)) {
                        perms.sharedWith.forEach((id: string) => uids.add(id));
                    }
                }
            } else if (itemType === "document") {
                const doc = currentItem as typeof documents extends (infer U)[] | undefined ? U : never;
                if (doc && "sharedWith" in doc) {
                    const shared = doc.sharedWith as { userId: string; permission: string }[] | undefined;
                    setVisibility(shared?.length ? "shared" : "team");
                    if (Array.isArray(shared)) {
                        shared.forEach((sw) => uids.add(sw.userId));
                    }
                }
            }
            setSelectedUserIds(uids);
        }
    }, [isOpen, currentItem, itemType]);

    const filteredMembers = useMemo(() => {
        if (!orgMembers) return [];
        if (!search) return orgMembers;
        const q = search.toLowerCase();
        return orgMembers.filter((m) =>
            m.nom?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q)
        );
    }, [orgMembers, search]);

    const toggleUser = (uid: string) => {
        const next = new Set(selectedUserIds);
        if (next.has(uid)) {
            next.delete(uid);
        } else {
            next.add(uid);
        }
        setSelectedUserIds(next);
    };

    const handleSave = async () => {
        if (!itemId || !itemType || !user?.email) return;

        setIsSaving(true);
        try {
            if (itemType === "folder") {
                await shareFolderMut({
                    id: itemId as Id<"folders">,
                    sharedWith: Array.from(selectedUserIds),
                    visibility,
                });
            } else {
                // shareDocument works per-user; we need to add new users and remove old ones
                const docId = itemId as Id<"documents">;
                const currentShared = new Set<string>();
                const doc = currentItem as typeof documents extends (infer U)[] | undefined ? U : never;
                if (doc && "sharedWith" in doc && Array.isArray(doc.sharedWith)) {
                    (doc.sharedWith as { userId: string }[]).forEach((sw) => currentShared.add(sw.userId));
                }

                // Add newly selected users
                const toAdd = Array.from(selectedUserIds).filter((uid) => !currentShared.has(uid));
                for (const uid of toAdd) {
                    await shareDocumentMut({
                        id: docId,
                        userId: uid,
                        permission: "read",
                        sharedBy: user.email,
                    });
                }

                // Remove unselected users
                const toRemove = Array.from(currentShared).filter((uid) => !selectedUserIds.has(uid));
                for (const uid of toRemove) {
                    await unshareDocumentMut({
                        id: docId,
                        userId: uid,
                    });
                }
            }
            toast.success("Permissions de partage mises à jour");
            onClose();
        } catch (error) {
            console.error("Share error:", error);
            toast.error("Erreur lors de la mise à jour du partage");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] border-white/5 shadow-2xl bg-slate-900/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-400" />
                        Partager {itemType === "folder" ? "le dossier" : "le document"}
                    </DialogTitle>
                    <DialogDescription>
                        {currentItem ? ("name" in currentItem ? currentItem.name : "title" in currentItem ? currentItem.title : "...") : "..."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Visibility Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Accès général
                        </label>
                        <Select
                            value={visibility}
                            onValueChange={(val: string) => setVisibility(val as VisibilityType)}
                        >
                            <SelectTrigger className="bg-slate-800/50 border-white/5 h-12">
                                <SelectValue placeholder="Sélectionner la visibilité" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-white/5">
                                <SelectItem value="private">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center">
                                            <Lock className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Privé</p>
                                            <p className="text-xs text-muted-foreground">Moi uniquement</p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="team">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Équipe (Interne)</p>
                                            <p className="text-xs text-muted-foreground">Membres de l&apos;organisation</p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="shared">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <Globe className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium">Partagé avec (Restreint)</p>
                                            <p className="text-xs text-muted-foreground">Utilisateurs spécifiques</p>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Specific Users Selection */}
                    {visibility === "shared" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Partager avec
                            </label>
                            
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher par nom ou email..."
                                    className="pl-9 bg-slate-800/50 border-white/5"
                                />
                            </div>

                            <div className="h-[200px] overflow-y-auto rounded-md border border-white/5 bg-slate-800/20 p-2">
                                {filteredMembers?.length === 0 ? (
                                    <div className="text-center p-4 text-sm text-slate-400">
                                        Aucun membre trouvé
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {filteredMembers?.map((m) => {
                                            const isSelected = selectedUserIds.has(m.userId);
                                            return (
                                                <div
                                                    key={m._id}
                                                    onClick={() => toggleUser(m.userId)}
                                                    className={`
                                                        flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
                                                        ${isSelected ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-slate-800"}
                                                    `}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-200">
                                                            {m.nom || m.email || "Utilisateur"}
                                                        </span>
                                                        <span className="text-xs text-slate-500">{m.email}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-indigo-400" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !currentItem} className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enregistrer"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
