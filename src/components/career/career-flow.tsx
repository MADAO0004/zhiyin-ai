"use client";

import { useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  type Node,
  type Edge,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";

interface PlanNode {
  id: string;
  label: string;
  type?: string;
  desc?: string;
}

interface PlanEdge {
  source: string;
  target: string;
}

interface CareerFlowProps {
  nodes: PlanNode[];
  edges: PlanEdge[];
}

function toFlowNodes(planNodes: PlanNode[]): Node[] {
  let x = 100;
  const step = 250;
  return planNodes.map((n, i) => {
    const node: Node = {
      id: n.id,
      type: "default",
      position: { x: x + i * step, y: 150 },
      data: { label: `${n.label}${n.desc ? `\n${n.desc}` : ""}` },
    };
    return node;
  });
}

function toFlowEdges(planEdges: PlanEdge[]): Edge[] {
  return planEdges.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    target: e.target,
  }));
}

export function CareerFlow({ nodes: planNodes, edges: planEdges }: CareerFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    toFlowNodes(planNodes)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    toFlowEdges(planEdges)
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
