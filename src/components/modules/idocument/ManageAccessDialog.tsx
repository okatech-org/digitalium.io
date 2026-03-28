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
import { Search, Users, Globe, Lock, Check, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ManageAccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string | null;
}

type VisibilityType = "private" | "team" | "shared";

export function ManageAccessDialog({ isOpen, onClose, itemId }: ManageAccessDialogProps) {
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

    const currentItem = useMemo(() => {
        if (!itemId || !folders) return null;
        return folders.find((f) => f._id === itemId);
    }, [itemId, folders]);

    // Mutations
    const shareFolderMut = useMutation(api.folders.shareFolder);

    // Reset state when opening/changing item
    useEffect(() => {
        if (isOpen && currentItem) {
            setSearch("");

            // Extract shared users
            const uids = new Set<string>();
            const folder = currentItem as typeof folders extends (infer U)[] | undefined ? U : never;
            if (folder && "permissions" in folder) {
                const perms = folder.permissions as { visibility?: string; sharedWith?: string[] } | undefined;
                setVisibility((perms?.visibility as VisibilityType) || "team");
                if (Array.isArray(perms?.sharedWith)) {
                    perms.sharedWith.forEach((id: string) => uids.add(id));
                }
            }
            setSelectedUserIds(uids);
        }
    }, [isOpen, currentItem]);

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
        if (!itemId || !user?.email) return;

        setIsSaving(true);
        try {
            await shareFolderMut({
                id: itemId as Id<"folders">,
                sharedWith: Array.from(selectedUserIds),
                visibility,
            });
            toast.success("Accès et permissions mis à jour (Admin)");
            onClose();
        } catch (error) {
            console.error("Manage access error:", error);
            toast.error("Erreur lors de la mise à jour des accès");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] border-amber-500/20 shadow-2xl bg-zinc-900/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-500">
                        <KeyRound className="w-5 h-5" />
                        Gérer les accès du dossier (Admin)
                    </DialogTitle>
                    <DialogDescription>
                        {currentItem ? ("name" in currentItem ? currentItem.name : "...") : "..."}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Visibility Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                            Niveau d&apos;accès global
                        </label>
                        <Select
                            value={visibility}
                            onValueChange={(val: string) => setVisibility(val as VisibilityType)}
                        >
                            <SelectTrigger className="bg-white/5 border-white/10 h-12">
                                <SelectValue placeholder="Sélectionner la visibilité" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-800 border-white/10">
                                <SelectItem value="private">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-700/50 flex items-center justify-center">
                                            <Lock className="w-4 h-4 text-zinc-300" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Privé Restreint</p>
                                            <p className="text-xs text-muted-foreground">Accès verrouillé (propriétaire uniquement)</p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="team">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-indigo-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Équipe (Interminal)</p>
                                            <p className="text-xs text-muted-foreground">Tous les membres de l&apos;organisation</p>
                                        </div>
                                    </div>
                                </SelectItem>
                                <SelectItem value="shared">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                            <Globe className="w-4 h-4 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">Accès Spécifique</p>
                                            <p className="text-xs text-muted-foreground">Seulement les utilisateurs sélectionnés</p>
                                        </div>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Specific Users Selection */}
                    {visibility === "shared" && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                Utilisateurs autorisés
                            </label>
                            
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Rechercher par nom ou email..."
                                    className="pl-9 bg-white/5 border-white/10"
                                />
                            </div>

                            <div className="h-[200px] overflow-y-auto rounded-md border border-white/5 bg-black/20 p-2">
                                {filteredMembers?.length === 0 ? (
                                    <div className="text-center p-4 text-sm text-zinc-500">
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
                                                        ${isSelected ? "bg-amber-500/10 border border-amber-500/20" : "hover:bg-white/5"}
                                                    `}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">
                                                            {m.nom || m.email || "Utilisateur"}
                                                        </span>
                                                        <span className="text-xs text-zinc-500">{m.email}</span>
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-amber-500" />
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

                <DialogFooter className="gap-2 sm:gap-0 mt-4 border-t border-white/5 pt-4">
                    <Button variant="outline" onClick={onClose} disabled={isSaving} className="border-white/10">
                        Annuler
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !currentItem} className="bg-amber-600 hover:bg-amber-700 text-white min-w-[120px] border-0">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Appliquer les accès"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

