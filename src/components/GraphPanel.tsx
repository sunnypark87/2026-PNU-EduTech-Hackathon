"use client";

import dynamic from "next/dynamic";
import type { GraphData } from "@/lib/subgraph";

const GraphCanvas = dynamic(() => import("@/components/GraphCanvas"), {
  ssr: false,
});

type GraphPanelProps = {
  graphData: GraphData;
  centerNodeId: string;
};

export default function GraphPanel({ graphData, centerNodeId }: GraphPanelProps) {
  return <GraphCanvas graphData={graphData} centerNodeId={centerNodeId} />;
}
