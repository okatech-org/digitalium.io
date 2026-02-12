"use client";

// ═══════════════════════════════════════════════
// DIGITALIUM.IO — iDocument: Editor Toolbar
// Rich-text formatting toolbar for Tiptap editor
// ═══════════════════════════════════════════════

import React, { useCallback } from "react";
import type { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Bold, Italic, Underline, Strikethrough,
    Heading1, Heading2, Heading3,
    List, ListOrdered, ListChecks,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Image, Table, Link2, Minus, Code2,
    Highlighter, Palette,
    Undo2, Redo2,
} from "lucide-react";

// ─── Types ──────────────────────────────────────

interface ToolbarProps {
    editor: Editor | null;
}

interface ToolBtn {
    icon: React.ElementType;
    label: string;
    action: (e: Editor) => void;
    isActive?: (e: Editor) => boolean;
}

// ─── Button groups ──────────────────────────────

const TEXT_FORMAT: ToolBtn[] = [
    {
        icon: Bold,
        label: "Gras",
        action: (e) => e.chain().focus().toggleBold().run(),
        isActive: (e) => e.isActive("bold"),
    },
    {
        icon: Italic,
        label: "Italique",
        action: (e) => e.chain().focus().toggleItalic().run(),
        isActive: (e) => e.isActive("italic"),
    },
    {
        icon: Underline,
        label: "Souligné",
        action: (e) => e.chain().focus().toggleUnderline().run(),
        isActive: (e) => e.isActive("underline"),
    },
    {
        icon: Strikethrough,
        label: "Barré",
        action: (e) => e.chain().focus().toggleStrike().run(),
        isActive: (e) => e.isActive("strike"),
    },
];

const HEADINGS: ToolBtn[] = [
    {
        icon: Heading1,
        label: "Titre 1",
        action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: (e) => e.isActive("heading", { level: 1 }),
    },
    {
        icon: Heading2,
        label: "Titre 2",
        action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: (e) => e.isActive("heading", { level: 2 }),
    },
    {
        icon: Heading3,
        label: "Titre 3",
        action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: (e) => e.isActive("heading", { level: 3 }),
    },
];

const LISTS: ToolBtn[] = [
    {
        icon: List,
        label: "Liste à puces",
        action: (e) => e.chain().focus().toggleBulletList().run(),
        isActive: (e) => e.isActive("bulletList"),
    },
    {
        icon: ListOrdered,
        label: "Liste numérotée",
        action: (e) => e.chain().focus().toggleOrderedList().run(),
        isActive: (e) => e.isActive("orderedList"),
    },
    {
        icon: ListChecks,
        label: "Liste de tâches",
        action: (e) => e.chain().focus().toggleTaskList().run(),
        isActive: (e) => e.isActive("taskList"),
    },
];

const ALIGNMENT: ToolBtn[] = [
    {
        icon: AlignLeft,
        label: "Aligner à gauche",
        action: (e) => e.chain().focus().setTextAlign("left").run(),
        isActive: (e) => e.isActive({ textAlign: "left" }),
    },
    {
        icon: AlignCenter,
        label: "Centrer",
        action: (e) => e.chain().focus().setTextAlign("center").run(),
        isActive: (e) => e.isActive({ textAlign: "center" }),
    },
    {
        icon: AlignRight,
        label: "Aligner à droite",
        action: (e) => e.chain().focus().setTextAlign("right").run(),
        isActive: (e) => e.isActive({ textAlign: "right" }),
    },
    {
        icon: AlignJustify,
        label: "Justifier",
        action: (e) => e.chain().focus().setTextAlign("justify").run(),
        isActive: (e) => e.isActive({ textAlign: "justify" }),
    },
];

const INSERT: ToolBtn[] = [
    {
        icon: Image,
        label: "Image",
        action: (e) => {
            const url = prompt("URL de l'image :");
            if (url) e.chain().focus().setImage({ src: url }).run();
        },
    },
    {
        icon: Table,
        label: "Tableau",
        action: (e) =>
            e.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
        icon: Link2,
        label: "Lien",
        action: (e) => {
            const url = prompt("URL du lien :");
            if (url) e.chain().focus().setLink({ href: url }).run();
        },
        isActive: (e) => e.isActive("link"),
    },
    {
        icon: Minus,
        label: "Séparateur",
        action: (e) => e.chain().focus().setHorizontalRule().run(),
    },
    {
        icon: Code2,
        label: "Bloc de code",
        action: (e) => e.chain().focus().toggleCodeBlock().run(),
        isActive: (e) => e.isActive("codeBlock"),
    },
];

// ─── Component ──────────────────────────────────

export default function EditorToolbar({ editor }: ToolbarProps) {
    if (!editor) return null;

    return (
        <div className="flex items-center gap-0.5 flex-wrap px-3 py-2 bg-zinc-900/80 border border-white/5 rounded-xl backdrop-blur-sm">
            {/* Text formatting */}
            <ToolGroup editor={editor} items={TEXT_FORMAT} />
            <Sep />

            {/* Headings */}
            <ToolGroup editor={editor} items={HEADINGS} />
            <Sep />

            {/* Lists */}
            <ToolGroup editor={editor} items={LISTS} />
            <Sep />

            {/* Alignment */}
            <ToolGroup editor={editor} items={ALIGNMENT} />
            <Sep />

            {/* Insert */}
            <ToolGroup editor={editor} items={INSERT} />
            <Sep />

            {/* Color tools */}
            <ColorBtn editor={editor} type="color" />
            <ColorBtn editor={editor} type="highlight" />
            <Sep />

            {/* Undo / Redo */}
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Annuler"
            >
                <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Refaire"
            >
                <Redo2 className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}

// ─── Helpers ────────────────────────────────────

function ToolGroup({ editor, items }: { editor: Editor; items: ToolBtn[] }) {
    return (
        <>
            {items.map(({ icon: Icon, label, action, isActive }) => {
                const active = isActive?.(editor) ?? false;
                return (
                    <Button
                        key={label}
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 transition-colors ${active
                            ? "bg-violet-500/20 text-violet-300"
                            : "text-zinc-400 hover:text-white hover:bg-white/10"
                            }`}
                        onClick={() => action(editor)}
                        title={label}
                    >
                        <Icon className="h-3.5 w-3.5" />
                    </Button>
                );
            })}
        </>
    );
}

function Sep() {
    return <Separator orientation="vertical" className="h-5 mx-1 bg-white/10" />;
}

function ColorBtn({ editor, type }: { editor: Editor; type: "color" | "highlight" }) {
    const isHighlight = type === "highlight";
    const Icon = isHighlight ? Highlighter : Palette;
    const label = isHighlight ? "Surligner" : "Couleur du texte";

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (isHighlight) {
                editor.chain().focus().toggleHighlight({ color: val }).run();
            } else {
                editor.chain().focus().setColor(val).run();
            }
        },
        [editor, isHighlight]
    );

    return (
        <div className="relative" title={label}>
            <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-400 hover:text-white hover:bg-white/10"
                asChild
            >
                <label className="cursor-pointer">
                    <Icon className="h-3.5 w-3.5" />
                    <input
                        type="color"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={handleChange}
                        defaultValue={isHighlight ? "#fef08a" : "#ffffff"}
                    />
                </label>
            </Button>
        </div>
    );
}
