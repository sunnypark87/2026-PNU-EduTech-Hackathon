type GraphNode = {
  id: string;
  type: "course" | "job";
  refId: string;
  label: string;
};

type GraphEdge = {
  source: string;
  target: string;
};

export type GraphData = {
  nodes: GraphNode[];
  links: GraphEdge[];
};

type FullGraph = {
  nodes: GraphNode[];
  edges: GraphEdge[];
};

const getNodeType = (node: GraphNode | undefined, id: string) => {
  if (node?.type) {
    return node.type;
  }
  return id.startsWith("course:") ? "course" : "job";
};

export const buildSubgraph = (
  fullGraph: FullGraph,
  centerId: string,
  maxNodes = 80,
): GraphData => {
  const nodeById = new Map(fullGraph.nodes.map((node) => [node.id, node]));
  const adjacency = new Map<string, Set<string>>();

  const addNeighbor = (from: string, to: string) => {
    if (!adjacency.has(from)) {
      adjacency.set(from, new Set());
    }
    adjacency.get(from)?.add(to);
  };

  for (const edge of fullGraph.edges) {
    addNeighbor(edge.source, edge.target);
    addNeighbor(edge.target, edge.source);
  }

  const centerNode = nodeById.get(centerId);
  if (!centerNode) {
    return { nodes: [], links: [] };
  }

  const centerType = getNodeType(centerNode, centerId);
  const depth1Type = centerType === "course" ? "job" : "course";
  const depth2Type = centerType === "course" ? "course" : "job";

  const depth1 = Array.from(adjacency.get(centerId) ?? []).filter(
    (id) => getNodeType(nodeById.get(id), id) === depth1Type,
  );

  const depth2Set = new Set<string>();
  for (const id of depth1) {
    for (const neighbor of adjacency.get(id) ?? []) {
      if (neighbor === centerId) {
        continue;
      }
      if (getNodeType(nodeById.get(neighbor), neighbor) === depth2Type) {
        depth2Set.add(neighbor);
      }
    }
  }

  const maxDepth2 = Math.max(maxNodes - (1 + depth1.length), 0);
  const depth2 = Array.from(depth2Set).slice(0, maxDepth2);

  const included = new Set([centerId, ...depth1, ...depth2]);
  const nodes = Array.from(included)
    .map((id) => nodeById.get(id))
    .filter((node): node is GraphNode => Boolean(node));

  const links = fullGraph.edges
    .filter((edge) => included.has(edge.source) && included.has(edge.target))
    .map((edge) => ({ source: edge.source, target: edge.target }));

  return { nodes, links };
};
