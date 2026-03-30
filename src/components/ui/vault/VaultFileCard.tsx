import { useState } from "react";
import { FileIcon, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VaultFileCardProps {
	title: string;
	subtitle?: string;
	gradient?: string;
	iconColor?: string;
	sizeBytes?: number;
	mimeType?: string;
	imageUrl?: string;
	author?: string;
	authorInitials?: string;
	date?: string;
	statusBadge?: React.ReactNode;
	version?: number | string;
	contextMenu?: React.ReactNode;
	badges?: React.ReactNode;
	tags?: string[];
	retentionCategory?: string;
	retentionColor?: string;
	onClick?: () => void;
	onPreview?: () => void;
	files?: { url?: string; filename?: string; mimeType?: string; sizeBytes?: number }[];
	/** Multi-sélection : indique si la carte est sélectionnée */
	isSelected?: boolean;
}

export function VaultFileCard({
	title,
	subtitle,
	gradient = "bg-gradient-to-br from-stone-400 to-neutral-600",
	iconColor = "text-stone-600",
	sizeBytes = 0,
	mimeType = "",
	imageUrl,
	author,
	authorInitials,
	date,
	statusBadge,
	version,
	contextMenu,
	badges,
	tags = [],
	retentionCategory,
	retentionColor,
	onClick,
	onPreview,
	files = [],
	isSelected = false,
}: VaultFileCardProps) {
	const currentMimeType = mimeType;
	const currentImageUrl = imageUrl;

	// Filtrer le tag "Brouillon" des tags affichés
	const displayTags = tags.filter(
		(t) => t.toLowerCase() !== "brouillon"
	);

	return (
		<Card
			className={cn(
				"group hover:shadow-lg transition-all duration-300 overflow-hidden border-border/50 cursor-pointer h-full flex flex-col bg-card",
				isSelected && "ring-2 ring-violet-500 border-violet-500/50 bg-violet-500/5"
			)}
			onClick={onClick}
		>
			{/* ── Zone A4 miniature ─────────────────────────── */}
			<div className="relative aspect-[1/1.414] bg-white/[0.03] flex flex-col overflow-hidden">

				{/* Barre supérieure : Tags (gauche) · Catégorie rétention (centre) */}
				<div className="relative flex items-center px-2.5 pt-2 z-10 min-h-[20px]">
					{/* Tags à gauche */}
					<div className="flex items-center gap-1 shrink min-w-0">
						{badges}
					</div>
					{/* Catégorie de rétention centrée (absolute pour vrai centrage) */}
					<div className="absolute inset-x-0 flex justify-center pointer-events-none">
						{retentionCategory ? (
							<span className={cn(
								"text-[10px] font-medium px-1.5 py-0.5 rounded inline-flex items-center gap-1 leading-tight pointer-events-auto",
								retentionColor || "bg-cyan-500/10 text-cyan-400"
							)}>
								{retentionCategory}
							</span>
						) : (
							<span className="text-[10px] text-muted-foreground/30 italic pointer-events-auto">Non classé</span>
						)}
					</div>
				</div>

				{/* Aperçu document central */}
				<div className="flex-1 flex items-center justify-center px-3 py-2">
					{currentMimeType.startsWith("image/") && currentImageUrl ? (
						<img
							src={currentImageUrl}
							alt={title}
							className="max-w-full max-h-full object-contain rounded opacity-90 group-hover:opacity-100 transition-opacity"
						/>
					) : (
						<div className="relative w-14 h-[72px] bg-white shadow-sm flex flex-col items-center justify-center rounded-[2px] border border-neutral-200">
							<div className="absolute top-0 left-0 w-full h-4 bg-neutral-50 border-b border-neutral-100" />
							<FileIcon className={cn("h-7 w-7 opacity-50", iconColor)} />
							<div className="absolute bottom-2 left-2 right-2 space-y-0.5">
								<div className="h-[2px] bg-neutral-100 rounded-full w-full" />
								<div className="h-[2px] bg-neutral-100 rounded-full w-3/4" />
								<div className="h-[2px] bg-neutral-100 rounded-full w-5/6" />
							</div>
						</div>
					)}
				</div>

				{/* Titre du document */}
				<div className="px-2.5 pb-1">
					<h3
						className="font-semibold text-[11px] leading-tight truncate text-foreground/90 group-hover:text-primary transition-colors"
						title={title}
					>
						{title}
					</h3>
				</div>

				{/* Barre inférieure : statut + version + date */}
				<div className="flex items-center justify-between px-2.5 pb-2 mt-auto">
					<div className="flex items-center gap-1">
						{statusBadge}
					</div>
					<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
						{version !== undefined && (
							<span className="font-mono bg-white/[0.04] px-1 rounded">v{version}</span>
						)}
						{date && (
							<span className="flex items-center gap-0.5 whitespace-nowrap">
								<Clock className="h-2 w-2" />
								{date}
							</span>
						)}
					</div>
				</div>

				{/* Menu contextuel (visible au hover) */}
				<div
					className="absolute top-1.5 right-1.5 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto"
					onClick={(e) => e.stopPropagation()}
				>
					{contextMenu}
				</div>
			</div>
		</Card>
	);
}
