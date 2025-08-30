"use client"

import { type EdgeProps, getSmoothStepPath, Position, useReactFlow } from "@xyflow/react"

function pickSide(dx: number, dy: number): { source: Position; target: Position } {
  const horizontal = Math.abs(dx) >= Math.abs(dy)
  if (horizontal) {
    return { source: dx > 0 ? Position.Right : Position.Left, target: dx > 0 ? Position.Left : Position.Right }
  }
  return { source: dy > 0 ? Position.Bottom : Position.Top, target: dy > 0 ? Position.Top : Position.Bottom }
}

export default function FloatingStepEdge(props: EdgeProps) {
  const { id, source, target, style, markerEnd } = props
  const rf = useReactFlow()
  const s = rf.getNode(source)
  const t = rf.getNode(target)
  if (!s || !t) return null

  const sx = (s.positionAbsolute?.x ?? s.position.x) + (s.measured?.width ?? s.width ?? 0) / 2
  const sy = (s.positionAbsolute?.y ?? s.position.y) + (s.measured?.height ?? s.height ?? 0) / 2
  const tx = (t.positionAbsolute?.x ?? t.position.x) + (t.measured?.width ?? t.width ?? 0) / 2
  const ty = (t.positionAbsolute?.y ?? t.position.y) + (t.measured?.height ?? t.height ?? 0) / 2

  const { source: sPos, target: tPos } = pickSide(tx - sx, ty - sy)

  const pad = 8
  const [edgePath] = getSmoothStepPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sPos,
    sourceWidth: (s.measured?.width ?? s.width ?? 0) + pad,
    sourceHeight: (s.measured?.height ?? s.height ?? 0) + pad,
    targetX: tx,
    targetY: ty,
    targetPosition: tPos,
    targetWidth: (t.measured?.width ?? t.width ?? 0) + pad,
    targetHeight: (t.measured?.height ?? t.height ?? 0) + pad,
    borderRadius: 8,
    centerX: (sx + tx) / 2,
    centerY: (sy + ty) / 2,
  })

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={style?.stroke ?? "#e5e7eb"}
        strokeWidth={1}
        style={style}
        markerEnd={markerEnd}
      />
    </g>
  )
}
