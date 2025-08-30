"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import {
  MousePointer2,
  Square,
  Circle,
  Type,
  Hand,
  ZoomIn,
  ZoomOut,
  Download,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Props = {
  active: "select" | "rect" | "ellipse" | "text" | "hand"
  onChangeTool: (t: Props["active"]) => void
  onQuickAdd?: (t: "rect" | "ellipse" | "text") => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onOpenExport?: () => void // add export trigger
}

function ToolBtn({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean
  onClick?: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-200",
        "hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-teal-500",
        active && "border-teal-500 text-white",
      )}
    >
      {children}
    </button>
  )
}

export default function LeftToolbar({ active, onChangeTool, onQuickAdd, onZoomIn, onZoomOut, onOpenExport }: Props) {
  return (
    <div className="pointer-events-auto absolute left-4 top-1/2 z-20 -translate-y-1/2">
      <div className="flex w-12 flex-col items-center gap-2">
        {/* 1. Selection */}
        <ToolBtn active={active === "select"} onClick={() => onChangeTool("select")} label="Select">
          <MousePointer2 className="h-5 w-5" />
        </ToolBtn>

        {/* 2. Square */}
        <ToolBtn
          active={active === "rect"}
          onClick={() => (onQuickAdd ? onQuickAdd("rect") : onChangeTool("rect"))}
          label="Rectangle"
        >
          <Square className="h-5 w-5" />
        </ToolBtn>

        {/* 3. Ellipse */}
        <ToolBtn
          active={active === "ellipse"}
          onClick={() => (onQuickAdd ? onQuickAdd("ellipse") : onChangeTool("ellipse"))}
          label="Ellipse"
        >
          <Circle className="h-5 w-5" />
        </ToolBtn>

        {/* spacer */}
        <div className="h-2" aria-hidden />

        {/* 7. Text */}
        <ToolBtn
          active={active === "text"}
          onClick={() => (onQuickAdd ? onQuickAdd("text") : onChangeTool("text"))}
          label="Text"
        >
          <Type className="h-5 w-5" />
        </ToolBtn>

        {/* spacer */}
        <div className="h-2" aria-hidden />

        {/* Hand (pan) */}
        <ToolBtn active={active === "hand"} onClick={() => onChangeTool("hand")} label="Hand">
          <Hand className="h-5 w-5" />
        </ToolBtn>

        {/* Zoom controls */}
        <ToolBtn onClick={onZoomIn} label="Zoom in">
          <ZoomIn className="h-5 w-5" />
        </ToolBtn>
        <ToolBtn onClick={onZoomOut} label="Zoom out">
          <ZoomOut className="h-5 w-5" />
        </ToolBtn>

        {/* Undo / Redo / Clear buttons */}
        <ToolBtn
          onClick={() => {
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("board:undo"))
          }}
          label="Undo"
        >
          <Undo2 className="h-5 w-5" />
        </ToolBtn>
        <ToolBtn
          onClick={() => {
            if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("board:redo"))
          }}
          label="Redo"
        >
          <Redo2 className="h-5 w-5" />
        </ToolBtn>

        {/* Clear confirmation dialog */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <ToolBtn label="Clear">
              <Trash2 className="h-5 w-5" />
            </ToolBtn>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Clear board?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove all nodes and connections from the board. You can still undo this action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("board:clear"))
                }}
              >
                Clear
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Export */}
        <ToolBtn onClick={onOpenExport} label="Export">
          <Download className="h-5 w-5" />
        </ToolBtn>
      </div>
    </div>
  )
}
