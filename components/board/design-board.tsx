"use client"

import type React from "react"
import * as htmlToImage from "html-to-image"
import { useCallback, useMemo, useRef, useState, useEffect } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  type Node,
  type Edge,
  type Connection,
  type NodeTypes,
  type EdgeTypes,
  MarkerType,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"

import LeftToolbar from "./left-toolbar"
import BottomToolbar from "./bottom-toolbar"
import {
  HexagonNode,
  DiamondNode,
  TriangleNode,
  EllipseNode,
  RectangleNode,
  TextNode,
  IconNode,
  TagNode,
} from "./nodes"
import SmartEdge from "./edges/smart-edge"
import BoardShortcuts from "./board-shortcuts"

type Tool = "select" | "rect" | "ellipse" | "text" | "hand" | "tag"

export type ShapeData = {
  label?: string
  fill?: string
  fontColor?: string
  align?: "left" | "center" | "right"
  fontWeight?: number
  fontSize?: number
  borderColor?: string
  borderStyle?: "solid" | "dashed"
  borderWidth?: number
  iconSrc?: string
}

const initialNodes: Node<ShapeData>[] = [
  {
    id: "n-1",
    type: "rectangle",
    position: { x: 200, y: 180 },
    data: {
      label: "",
      fill: "#000000",
      fontColor: "#ffffff",
      fontSize: 8,
      fontWeight: 400,
      align: "center",
      borderColor: "#a3a3a3",
      borderStyle: "solid",
      borderWidth: 1,
    },
    style: { width: 140, height: 56 },
  },
]

const initialEdges: Edge[] = []

const nodeTypes: NodeTypes = {
  rectangle: RectangleNode,
  ellipse: EllipseNode,
  triangle: TriangleNode,
  diamond: DiamondNode,
  hexagon: HexagonNode,
  text: TextNode,
  icon: IconNode,
  tag: TagNode,
}

function BoardInner() {
  const [tool, setTool] = useState<Tool>("select")
  const [nodes, setNodes, onNodesChange] = useNodesState<ShapeData>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null)

  const rf = useReactFlow()
  const connectStartIdRef = useRef<string | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const [exportOpen, setExportOpen] = useState(false)
  const [exportTitle, setExportTitle] = useState("diagram")
  const [exportType, setExportType] = useState<"png" | "svg" | "json">("png")

  const getBoardScreenCenter = useCallback(() => {
    const el = boardRef.current
    if (el) {
      const r = el.getBoundingClientRect()
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
    }
    return {
      x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
      y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
    }
  }, [])

  const quickAdd = useCallback(
    (t: "rect" | "ellipse" | "text" | "tag") => {
      const pos = rf.screenToFlowPosition(getBoardScreenCenter())
      const id = `n-${Date.now()}`
      const nodeType = t === "rect" ? "rectangle" : t === "ellipse" ? "ellipse" : t === "text" ? "text" : "tag"
      const data: ShapeData = {
        label: t === "text" ? "Text" : "", // was "", now "Text" for text nodes
        fill: t === "text" ? "transparent" : t === "tag" ? "#e5e7eb" : "#000000",
        fontColor: t === "tag" ? "#111111" : "#ffffff",
        fontSize: 8,
        fontWeight: t === "tag" ? 600 : 400,
        align: t === "text" ? "left" : "center",
        borderColor: "#a3a3a3",
        borderStyle: "solid",
        borderWidth: 1,
      }
      const style =
        t === "text" ? { width: 120, height: 28 } : t === "tag" ? { width: 96, height: 28 } : { width: 140, height: 56 }
      const newNode: Node<ShapeData> = { id, type: nodeType as any, position: pos, data, style }
      setNodes((nds) => nds.concat(newNode))
      setSelectedNodeId(id)
      setTool("select")
    },
    [rf, setNodes, getBoardScreenCenter],
  )

  const onConnect = useCallback(
    (connection: Connection) => {
      let src = connection.source!
      let tgt = connection.target!

      const started = connectStartIdRef.current
      if (started && started === tgt) {
        // If React Flow labeled the start handle as "target", flip so the arrow points from start -> end
        ;[src, tgt] = [tgt, src]
      }

      const srcNode = src ? rf.getNode(src) : null
      const srcZ = srcNode?.zIndex ?? 0

      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            source: src,
            target: tgt,
            type: "smart",
            style: { stroke: "#a3a3a3", strokeWidth: 1 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 6, color: "#a3a3a3" },
            animated: false,
            data: { style: "solid" as const },
            zIndex: srcZ,
          },
          eds,
        ),
      )
      connectStartIdRef.current = null
    },
    [setEdges, rf],
  )

  const onConnectStart = useCallback((_evt: any, params: { nodeId?: string | null }) => {
    connectStartIdRef.current = params?.nodeId ?? null
  }, [])

  const onConnectEnd = useCallback(() => {
    connectStartIdRef.current = null
  }, [])

  const handlePaneClick = useCallback(
    (evt: React.MouseEvent) => {
      const pos = rf.screenToFlowPosition({ x: evt.clientX, y: evt.clientY })

      if (tool === "rect" || tool === "ellipse" || tool === "text" || tool === "tag") {
        const id = `n-${Date.now()}`
        const base: Node<ShapeData> = {
          id,
          position: pos,
          data: {
            label: tool === "text" ? "Text" : "", // was always ""
            fill: tool === "text" ? "transparent" : tool === "tag" ? "#e5e7eb" : "#000000",
            fontColor: tool === "tag" ? "#111111" : "#ffffff",
            fontSize: 8,
            fontWeight: tool === "tag" ? 600 : 400,
            align: tool === "text" ? "left" : "center",
            borderColor: "#a3a3a3",
            borderStyle: "solid",
            borderWidth: 1,
          },
          style:
            tool === "text"
              ? { width: 120, height: 28 }
              : tool === "tag"
                ? { width: 96, height: 28 }
                : { width: 140, height: 56 },
          type: tool === "rect" ? "rectangle" : tool === "ellipse" ? "ellipse" : tool === "text" ? "text" : "tag",
        }
        setNodes((nds) => nds.concat(base))
        setSelectedNodeId(id)
        setTool("select")
        return
      }
      setSelectedNodeId(null)
      setSelectedEdgeId(null)
    },
    [rf, tool, setNodes],
  )

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      setSelectedNodeId(selectedNodes?.[0]?.id ?? null)
      setSelectedEdgeId(selectedEdges?.[0]?.id ?? null)
    },
    [],
  )

  const updateSelectedNode = useCallback(
    (patch: Partial<ShapeData>) => {
      if (!selectedNodeId) return
      setNodes((nds) => nds.map((n) => (n.id === selectedNodeId ? { ...n, data: { ...n.data, ...patch } } : n)))
    },
    [selectedNodeId, setNodes],
  )

  const changeSelectedNodeType = useCallback(
    (newType: keyof typeof nodeTypes) => {
      if (!selectedNodeId) return
      setNodes((nds) => nds.map((n) => (n.id === selectedNodeId ? { ...n, type: newType } : n)))
    },
    [selectedNodeId, setNodes],
  )

  const setSelectedEdge = useCallback(
    (patch: Partial<Edge>) => {
      if (!selectedEdgeId) return
      setEdges((eds) => eds.map((e) => (e.id === selectedEdgeId ? { ...e, ...patch } : e)))
    },
    [selectedEdgeId, setEdges],
  )

  const setSelectedEdgeStyle = useCallback(
    (stylePatch: React.CSSProperties) => {
      if (!selectedEdgeId) return
      setEdges((eds) =>
        eds.map((e) => (e.id === selectedEdgeId ? { ...e, style: { ...(e.style || {}), ...stylePatch } } : e)),
      )
    },
    [selectedEdgeId, setEdges],
  )

  const doExport = useCallback(async () => {
    try {
      if (exportType === "json") {
        const payload = {
          nodes,
          edges,
          viewport: rf.getViewport?.() ?? undefined,
        }
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${exportTitle || "diagram"}.json`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        setExportOpen(false)
        return
      }

      const el = boardRef.current
      if (!el) return

      if (exportType === "png") {
        const dataUrl = await htmlToImage.toPng(el, {
          pixelRatio: Math.min(2, window.devicePixelRatio || 1.5),
          backgroundColor: "transparent",
          cacheBust: true,
        })
        const a = document.createElement("a")
        a.href = dataUrl
        a.download = `${exportTitle || "diagram"}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        setExportOpen(false)
      } else if (exportType === "svg") {
        const dataUrl = await htmlToImage.toSvg(el, {
          backgroundColor: "transparent",
          cacheBust: true,
        })
        const res = await fetch(dataUrl)
        const svgText = await res.text()
        const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${exportTitle || "diagram"}.svg`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(url)
        setExportOpen(false)
      }
    } catch (err) {
      console.error("[v0] export failed", err)
    }
  }, [exportType, exportTitle, nodes, edges, rf])

  const proOptions = useMemo(() => ({ hideAttribution: true }), [])

  const edgeTypes: EdgeTypes = useMemo(
    () => ({
      smart: SmartEdge,
    }),
    [],
  )

  const zoomIn = useCallback(() => {
    ;(rf as any)?.zoomIn?.() ?? rf.setViewport({ ...rf.getViewport(), zoom: rf.getViewport().zoom * 1.1 })
  }, [rf])
  const zoomOut = useCallback(() => {
    ;(rf as any)?.zoomOut?.() ?? rf.setViewport({ ...rf.getViewport(), zoom: rf.getViewport().zoom / 1.1 })
  }, [rf])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      try {
        ;(rf as any)?.fitView?.({ duration: 0 })
      } catch (_err) {
        // ignore
      }
    })
    return () => cancelAnimationFrame(id)
  }, [rf])

  useEffect(() => {
    if (!nodes?.length) return
    const idToNode = new Map(nodes.map((n) => [n.id, n] as const))
    let changed = false
    const updated = nodes.map((n, idx) => {
      let depth = 0
      let cursor: any = n
      let guard = 0
      while (cursor?.parentNode && guard++ < 64) {
        depth += 1
        cursor = idToNode.get(cursor.parentNode)
        if (!cursor) break
      }
      const desired = depth * 100 + idx
      if (n.zIndex !== desired) {
        changed = true
        return { ...n, zIndex: desired }
      }
      return n
    })
    if (changed) setNodes(updated)
  }, [nodes, setNodes])

  useEffect(() => {
    if (!edges.length) return
    const idToZ = new Map(nodes.map((n) => [n.id, n.zIndex ?? 0] as const))

    let anyZChanged = false
    const withZ = edges.map((e) => {
      const srcZ = idToZ.get(e.source) ?? 0
      if (e.zIndex !== srcZ) {
        anyZChanged = true
        return { ...e, zIndex: srcZ }
      }
      return e
    })

    // sort by zIndex ascending so highest zIndex render last (on top)
    const sorted = [...withZ].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0))
    const orderChanged = sorted.length === edges.length && sorted.some((e, i) => e.id !== edges[i].id)

    if (anyZChanged || orderChanged) {
      setEdges(sorted)
    }
  }, [nodes, edges, setEdges])

  const isValidConnection = useCallback(
    (conn: Connection) => !!conn.source && !!conn.target && conn.source !== conn.target,
    [],
  )

  const onAddIcon = useCallback(
    ({ src, label }: { src: string; label: string }) => {
      const pos = rf.screenToFlowPosition(getBoardScreenCenter())
      const id = `n-${Date.now()}`
      const newNode: Node<ShapeData> = {
        id,
        type: "icon" as any,
        position: pos,
        data: {
          label: label || "",
          iconSrc: src,
          fill: "#ffffff",
          fontColor: "#000000",
          fontSize: 8,
          fontWeight: 700,
          align: "center",
          borderColor: "#a3a3a3",
          borderStyle: "solid",
          borderWidth: 1,
        },
        style: { width: 96, height: 96 },
      }
      setNodes((nds) => nds.concat(newNode))
      setSelectedNodeId(id)
      setTool("select")
    },
    [rf, setNodes, getBoardScreenCenter],
  )

  const onAddTag = useCallback(() => {
    const pos = rf.screenToFlowPosition(getBoardScreenCenter())
    const id = `n-${Date.now()}`
    const newNode: Node<ShapeData> = {
      id,
      type: "tag" as any,
      position: pos,
      data: {
        label: "tag",
        fill: "#e5e7eb",
        fontColor: "#111111",
        fontSize: 8,
        fontWeight: 600,
        align: "center",
        borderColor: "#a3a3a3",
        borderStyle: "solid",
        borderWidth: 1,
      },
      style: { width: 96, height: 28 },
    }
    setNodes((nds) => nds.concat(newNode))
    setSelectedNodeId(id)
    setTool("select")
  }, [rf, setNodes, getBoardScreenCenter])

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <LeftToolbar
        active={tool}
        onChangeTool={setTool}
        onQuickAdd={quickAdd}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onOpenExport={() => setExportOpen(true)}
        onAddIcon={onAddIcon}
        onAddTag={onAddTag}
      />

      <div
        ref={boardRef}
        className="absolute inset-0 overflow-hidden"
        style={{ contain: "layout paint size" as React.CSSProperties["contain"] }}
      >
        <ReactFlow
          className="h-full w-full"
          proOptions={proOptions}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={onConnectStart}
          onConnectEnd={onConnectEnd}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onPaneClick={handlePaneClick}
          onSelectionChange={onSelectionChange}
          onEdgesDelete={(deleted) => {
            if (deleted.some((e) => e.id === selectedEdgeId)) setSelectedEdgeId(null)
          }}
          onNodesDelete={(deleted) => {
            if (deleted.some((n) => n.id === selectedNodeId)) setSelectedNodeId(null)
          }}
          selectionOnDrag={tool === "select"}
          panOnDrag={tool === "hand"}
          defaultEdgeOptions={{
            type: "smart",
            style: { stroke: "#a3a3a3", strokeWidth: 1 },
            markerEnd: { type: MarkerType.ArrowClosed, width: 6, height: 6, color: "#a3a3a3" },
          }}
          elevateNodesOnSelect={false}
          connectionMode="loose"
          isValidConnection={isValidConnection}
          connectionRadius={24}
        >
          <Background color="#2a2a2a" variant="dots" gap={24} size={1} />
          <Controls position="bottom-right" className="!bg-zinc-900 !text-white" />
          <BoardShortcuts />
        </ReactFlow>
      </div>

      {exportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setExportOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-zinc-800 bg-zinc-900 p-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-sm font-semibold text-white">Export</h2>
            <div className="mb-3 space-y-2">
              <label className="block text-xs text-zinc-300" htmlFor="export-title">
                Title
              </label>
              <input
                id="export-title"
                value={exportTitle}
                onChange={(e) => setExportTitle(e.target.value)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="diagram"
              />
            </div>
            <div className="mb-4 space-y-2">
              <label className="block text-xs text-zinc-300" htmlFor="export-type">
                Type
              </label>
              <select
                id="export-type"
                value={exportType}
                onChange={(e) => setExportType(e.target.value as any)}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
                <option value="json">JSON</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setExportOpen(false)}
                className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200"
              >
                Cancel
              </button>
              <button
                onClick={doExport}
                className="rounded-md border border-teal-600 bg-teal-600 px-3 py-1.5 text-xs text-white"
              >
                Export
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomToolbar
        visible={!!selectedNodeId || !!selectedEdgeId}
        isNodeSelected={!!selectedNodeId}
        isEdgeSelected={!!selectedEdgeId}
        onChangeShape={changeSelectedNodeType}
        onChangeBG={(color) => updateSelectedNode({ fill: color })}
        onBorderStyle={(style) => updateSelectedNode({ borderStyle: style })}
        onBorderColor={(color) => updateSelectedNode({ borderColor: color })}
        onBorderWidth={(w) => updateSelectedNode({ borderWidth: w })}
        onChangeTextSize={(fontSize) => updateSelectedNode({ fontSize })}
        onChangeTextColor={(color) => updateSelectedNode({ fontColor: color })}
        onAlign={(align) => updateSelectedNode({ align })}
        onBold={(bold) => updateSelectedNode({ fontWeight: bold ? 700 : 400 })}
        onEdgeStyle={(style) => setSelectedEdgeStyle({ strokeDasharray: style === "dashed" ? "6 6" : "0" })}
        onEdgeColor={(color) => setSelectedEdgeStyle({ stroke: color })}
        onEdgeWidth={(w) => setSelectedEdgeStyle({ strokeWidth: w })}
        onEdgeAnimate={(animate) => setSelectedEdge({ animated: animate })}
      />
    </div>
  )
}

export default function DesignBoard() {
  return (
    <ReactFlowProvider>
      <BoardInner />
    </ReactFlowProvider>
  )
}
