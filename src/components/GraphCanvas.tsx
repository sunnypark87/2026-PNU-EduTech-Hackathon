"use client";

import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods } from "react-force-graph-2d";
import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import * as d3 from "d3-force";

type GraphNode = {
  id: string;
  label?: string;
  type?: "course" | "job";
  refId?: string;
  fx?: number;
  fy?: number;
};

type GraphLink = {
  source: string;
  target: string;
};

type GraphData = {
  nodes: GraphNode[];
  links: GraphLink[];
};

type GraphCanvasProps = {
  graphData: GraphData;
  centerNodeId: string;
};

export default function GraphCanvas({
  graphData,
  centerNodeId,
}: GraphCanvasProps) {
  const router = useRouter();
  const fgRef = useRef<ForceGraphMethods>();
  const data = useMemo(() => graphData, [graphData]);

  useEffect(() => {
    const centerNode = data.nodes.find((node) => node.id === centerNodeId);
    if (centerNode) {
      centerNode.fx = 0;
      centerNode.fy = 0;
    }
    if (fgRef.current) {
      fgRef.current.centerAt(250, 170, 400);
      fgRef.current.zoom(1.0, 400);
    }
  }, [data, centerNodeId]);

  useEffect(() => {
    if (!fgRef.current) {
      return;
    }
    const forceGraph = fgRef.current;
    forceGraph.d3Force("charge")?.strength?.(-140);
    forceGraph.d3Force("link")?.distance?.(110);
    forceGraph.d3Force(
      "collide",
      d3.forceCollide((node: GraphNode) =>
        node.id.startsWith("job:") ? 18 : 14,
      ),
    );
  }, []);

  return (
    <ForceGraph2D
      ref={fgRef}
      graphData={data}
      nodeRelSize={5}
      linkColor={() => "rgba(14, 78, 207, 0.35)"}
      linkWidth={1}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const typedNode = node as GraphNode;
        const label = typedNode.label ?? typedNode.id;
        const isJob = typedNode.id.startsWith("job:");
        const fontSize = 11 / globalScale;
        const radius = isJob ? 8 : 6;
        const x = typedNode.x ?? 0;
        const y = typedNode.y ?? 0;
        ctx.font = `${fontSize}px sans-serif`;
        if (isJob) {
          ctx.fillStyle = "#0e4ecf";
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            ctx.roundRect(x - radius, y - radius, radius * 2, radius * 2, 4);
          } else {
            ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
          }
          ctx.fill();
        } else {
          ctx.fillStyle = "#FF8A00";
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
          ctx.fill();
        }
        ctx.fillStyle = "#0f172a";
        ctx.fillText(label, x + radius + 6, y + 4);
      }}
      onNodeHover={(node) => {
        if (typeof document !== "undefined") {
          document.body.style.cursor = node ? "pointer" : "default";
        }
      }}
      onNodeClick={(node) => {
        const typedNode = node as GraphNode;
        const id = typedNode.refId ?? typedNode.id.split(":")[1];
        if (typedNode.id.startsWith("course:")) {
          router.push(`/courses/${id}`);
        } else if (typedNode.id.startsWith("job:")) {
          router.push(`/jobs/${id}`);
        }
      }}
    />
  );
}
