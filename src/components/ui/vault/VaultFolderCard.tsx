import { useState } from "react";
import { motion } from "framer-motion";
import { DynamicFolderIcon } from "./DynamicFolderIcon";
import { Folder as FolderIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface VaultFolderCardProps {
	label: string;
	count: number;
	/** Nombre de sous-dossiers */
	subfolderCount?: number;
	onClick?: () => void;
	className?: string;
	contextMenu?: React.ReactNode;
	badges?: React.ReactNode;
	tags?: React.ReactNode;
    isDragOver?: boolean;
	/** Multi-sélection : indique si le dossier est sélectionné */
	isSelected?: boolean;
}

export function VaultFolderCard({
	label,
	count,
	subfolderCount = 0,
	onClick,
	className,
	contextMenu,
	badges,
	tags,
    isDragOver,
	isSelected = false,
}: VaultFolderCardProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<div
			className={cn(
				"group relative flex flex-col items-center justify-center p-2 rounded-2xl w-full h-full",
				isDragOver ? "bg-primary/10 ring-2 ring-primary/50" : "",
				isSelected && !isDragOver && "ring-2 ring-violet-500 bg-violet-500/10",
				className
			)}
		>
			{/* Clickable Area: Folder + Label + Info */}
			<motion.div
				role="button"
				tabIndex={0}
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.97 }}
				onClick={onClick}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className="relative flex flex-col items-center justify-center cursor-pointer outline-none rounded-xl p-3 hover:bg-muted/40 transition-colors w-[140px]"
			>
				{/* Top bar for badges tightly clamped */}
				<div className="absolute top-1 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none z-10 w-full text-center">
					<div className="flex flex-col gap-0.5 items-center justify-center pointer-events-auto scale-90 -mt-2">
						{badges}
					</div>
				</div>

				<div className="relative mt-1 w-full flex justify-center">
					<DynamicFolderIcon
						count={count + subfolderCount}
						size={96}
						hovered={isHovered}
						className="drop-shadow-lg"
					/>
					{/* Pastilles de comptage : dossiers (violet) + fichiers (bleu) */}
					<div className="absolute -top-1 right-1 flex flex-col gap-0.5 items-end z-10">
						{subfolderCount > 0 && (
							<motion.span
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="min-w-5 h-5 px-1 flex items-center justify-center gap-0.5 rounded-full bg-violet-500 text-white text-[9px] font-bold shadow-sm"
							>
								<FolderIcon className="h-2.5 w-2.5" />
								{subfolderCount}
							</motion.span>
						)}
						{count > 0 && (
							<motion.span
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								className="min-w-5 h-5 px-1 flex items-center justify-center gap-0.5 rounded-full bg-blue-500 text-white text-[9px] font-bold shadow-sm"
							>
								<FileText className="h-2.5 w-2.5" />
								{count}
							</motion.span>
						)}
					</div>
					
					{/* Context Menu Centered Between Folder and Text */}
					{contextMenu && (
						<div 
							className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all hover:scale-125 pointer-events-auto z-10"
							onClick={(e) => e.stopPropagation()}
						>
							{contextMenu}
						</div>
					)}
				</div>
				<div className="flex flex-col items-center mt-3 w-full">
					<span className="text-sm font-semibold text-foreground text-center leading-tight line-clamp-2 w-full px-1">
						{label}
					</span>
					{tags && (
						<div className="flex flex-wrap items-center justify-center gap-1 mt-1.5 w-full">
							{tags}
						</div>
					)}
				</div>
			</motion.div>
		</div>
	);
}
