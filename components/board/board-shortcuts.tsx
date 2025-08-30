"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { type Edge, type Node, useOnSelectionChange, useReactFlow } from "@xyflow/react"

type Snapshot = { nodes: Node[]; edges: Edge[] }

function isEditingText(): boolean {
  if (typeof document === "undefined") return false
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === "input" || tag === "textarea") return true
  if (el.isContentEditable) return true
  return false
}

function cloneNodesWithOffset(nodes: Node[], offset = { x: 24, y: 24 }): Node[] {
  const now = Date.now()
  return nodes.map((n, i) => {
    const id = `node_${now}_${i}_${Math.random().toString(36).slice(2, 7)}`
    return {
      ...n,
      id,
      position: { x: (n.position?.x ?? 0) + offset.x, y: (n.position?.y ?? 0) + offset.y },
      selected: false,
      width: n.width,
      height: n.height,
      dragHandle: n.dragHandle,
      data: { ...n.data },
    }
  })
}

export default function BoardShortcuts() {
  const rf = useReactFlow()
  const [selected, setSelected] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] })
  const clipboardRef = useRef<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const pasteBumpRef = useRef(0)

  const historyPast = useRef<Snapshot[]>([])
  const historyFuture = useRef<Snapshot[]>([])

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelected({ nodes, edges })
    },
  })

  const takeSnapshot = (): Snapshot => ({
    nodes: rf.getNodes().map((n) => ({ ...n })),
    edges: rf.getEdges().map((e) => ({ ...e })),
  })

  const commit = () => {
    historyPast.current.push(takeSnapshot())
    historyFuture.current.length = 0
  }

  const canUndo = useMemo(() => historyPast.current.length > 0, [])
  const canRedo = useMemo(() => historyFuture.current.length > 0, [])

  const undo = () => {
    if (historyPast.current.length === 0) return
    const current = takeSnapshot()
    const prev = historyPast.current.pop()!
    historyFuture.current.push(current)
    rf.setNodes(prev.nodes)
    rf.setEdges(prev.edges)
  }

  const redo = () => {
    if (historyFuture.current.length === 0) return
    const current = takeSnapshot()
    const next = historyFuture.current.pop()!
    historyPast.current.push(current)
    rf.setNodes(next.nodes)
    rf.setEdges(next.edges)
  }

  const onCopy = () => {
    const selectedNodes = selected.nodes
    if (selectedNodes.length === 0) return
    const selectedIds = new Set(selectedNodes.map((n) => n.id))
    const selectedEdges = selected.edges.filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
    clipboardRef.current = {
      nodes: selectedNodes.map((n) => ({ ...n })),
      edges: selectedEdges.map((e) => ({ ...e })),
    }
    pasteBumpRef.current = 0
  }

  const onPaste = () => {
    if (!clipboardRef.current) return
    commit()
    pasteBumpRef.current += 1
    const bump = 24 * pasteBumpRef.current
    const oldNodes = clipboardRef.current.nodes
    const oldEdges = clipboardRef.current.edges
    const newNodes = cloneNodesWithOffset(oldNodes, { x: bump, y: bump })

    const idMap = new Map<string, string>()
    oldNodes.forEach((old, idx) => idMap.set(old.id, newNodes[idx].id))

    const now = Date.now()
    const newEdges: Edge[] = oldEdges
      .map((e, i) => {
        const newSource = idMap.get(e.source)
        const newTarget = idMap.get(e.target)
        if (!newSource || !newTarget) return null
        return {
          ...e,
          id: `edge_${now}_${i}_${Math.random().toString(36).slice(2, 6)}`,
          source: newSource,
          target: newTarget,
          selected: false,
        } as Edge
      })
      .filter(Boolean) as Edge[]

    rf.addNodes(newNodes)
    if (newEdges.length) rf.addEdges(newEdges)
  }

  const onDelete = () => {
    if (selected.nodes.length === 0 && selected.edges.length === 0) return
    commit()
    const selectedNodeIds = new Set(selected.nodes.map((n) => n.id))
    const selectedEdgeIds = new Set(selected.edges.map((e) => e.id))
    rf.setNodes(rf.getNodes().filter((n) => !selectedNodeIds.has(n.id)))
    rf.setEdges(
      rf
        .getEdges()
        .filter((e) => !selectedEdgeIds.has(e.id) && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)),
    )
  }

  const clearAll = () => {
    commit()
    rf.setNodes([])
    rf.setEdges([])
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = (e.key?.length === 1 ? e.key.toLowerCase() : e.key) as string
      const ctrlOrMeta = !!(e.ctrlKey || e.metaKey)
      const editing = isEditingText()
      if (editing) return

      // Undo / Redo
      if (ctrlOrMeta && key === "z") {
        e.preventDefault()
        if (e.shiftKey) {
          redo()
        } else {
          undo()
        }
        return
      }
      if (ctrlOrMeta && key === "y") {
        e.preventDefault()
        redo()
        return
      }

      // Copy / Paste
      if (ctrlOrMeta && key === "c") {
        e.preventDefault()
        onCopy()
        return
      }
      if (ctrlOrMeta && key === "v") {
        e.preventDefault()
        onPaste()
        return
      }

      // Delete
      if (key === "Delete" || key === "Backspace" || key === "backspace") {
        e.preventDefault()
        onDelete()
        return
      }
    }

    // Capture phase to avoid other handlers stopping propagation
    const opts: AddEventListenerOptions = { capture: true }
    window.addEventListener("keydown", handler, opts)
    document.addEventListener("keydown", handler, opts)
    return () => {
      window.removeEventListener("keydown", handler, opts)
      document.removeEventListener("keydown", handler, opts)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected])

  useEffect(() => {
    const onUndo: EventListener = () => undo()
    const onRedo: EventListener = () => redo()
    const onClear: EventListener = () => clearAll()

    window.addEventListener("board:undo", onUndo)
    window.addEventListener("board:redo", onRedo)
    window.addEventListener("board:clear", onClear)

    return () => {
      window.removeEventListener("board:undo", onUndo)
      window.removeEventListener("board:redo", onRedo)
      window.removeEventListener("board:clear", onClear)
    }
  }, [])
}
