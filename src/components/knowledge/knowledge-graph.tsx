"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, Network } from "lucide-react";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface KnowledgeGraphProps {
  conversationId?: string | null;
  refreshKey?: number;
}

interface GraphNode {
  id: string;
  name: string;
}

interface GraphLink {
  id: string;
  source: string;
  target: string;
}

export function KnowledgeGraph({ conversationId, refreshKey }: KnowledgeGraphProps) {
  const [data, setData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGraph = useCallback(async () => {
    try {
      setLoading(true);
      const url = conversationId
        ? `/api/knowledge-graph?conversation_id=${encodeURIComponent(conversationId)}`
        : "/api/knowledge-graph";
      const res = await fetch(url);
      if (!res.ok) throw new Error("获取失败");
      const json = await res.json();
      setData({
        nodes: json.nodes ?? [],
        links: json.links ?? [],
      });
    } catch {
      setData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchGraph();
  }, [fetchGraph, refreshKey]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isEmpty = !data || (data.nodes.length === 0 && data.links.length === 0);

  if (isEmpty) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <Network className="size-16 text-muted-foreground/50" />
        <div>
          <p className="text-sm font-medium text-foreground">暂无知识节点</p>
          <p className="mt-1 text-xs text-muted-foreground">
            在对话中讨论技术话题（如 React、TypeScript）后，系统会自动提取关键词并生成图谱
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full min-h-[400px] w-full flex-col">
      <div className="relative min-h-[400px] flex-1">
      <ForceGraph2D
        graphData={data}
        nodeId="id"
        nodeLabel={(n) => (n as GraphNode).name}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const n = node as GraphNode;
          const label = n.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px sans-serif`;
          const w = ctx.measureText(label).width + 8;
          const h = fontSize + 8;
          ctx.fillStyle = "rgba(20, 184, 166, 0.9)";
          ctx.beginPath();
          ctx.roundRect((node.x ?? 0) - w / 2, (node.y ?? 0) - h / 2, w, h, 4);
          ctx.fill();
          ctx.fillStyle = "#0c0c0d";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, node.x ?? 0, node.y ?? 0);
        }}
        linkColor={() => "rgba(113, 113, 122, 0.5)"}
        backgroundColor="transparent"
        minZoom={0.1}
        maxZoom={4}
      />
      </div>
    </div>
  );
}
