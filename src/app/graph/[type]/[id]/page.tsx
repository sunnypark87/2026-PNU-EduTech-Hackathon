import ButtonLink from "@/components/ButtonLink";
import Card from "@/components/Card";
import PageHeader from "@/components/PageHeader";
import PageShell from "@/components/PageShell";
import SiteHeader from "@/components/SiteHeader";
import graphData from "@/data/graph.json";
import { getCourseById, getJobById } from "@/lib/data";
import { buildSubgraph } from "@/lib/subgraph";
import { notFound } from "next/navigation";
import GraphPanel from "@/components/GraphPanel";

type GraphPageProps = {
  params: Promise<{
    type: "course" | "job";
    id: string;
  }>;
};

export default async function GraphPage({ params }: GraphPageProps) {
  const { type, id } = await params;
  if (type !== "course" && type !== "job") {
    notFound();
  }

  const centerId = `${type}:${id}`;
  const centerLabel =
    type === "course"
      ? getCourseById(id)?.title
      : getJobById(id)?.title;

  if (!centerLabel) {
    notFound();
  }

  const subgraph = buildSubgraph(
    graphData as { nodes: { id: string; type: "course" | "job"; refId: string; label: string }[]; edges: { source: string; target: string }[] },
    centerId,
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <PageShell>
      <PageHeader
        title="그래프 보기"
        subtitle={`${type === "course" ? "강의" : "직무"} 중심: ${centerLabel}`}
        actions={
          <div className="flex items-center gap-2">
            <ButtonLink
              href={type === "course" ? `/courses/${id}` : `/jobs/${id}`}
              variant="ghost"
            >
              상세 보기
            </ButtonLink>
            <ButtonLink
              href={`/graph/${type}/${id}`}
              variant="primary"
            >
              그래프 보기
            </ButtonLink>
          </div>
        }
      />

      <Card className="h-[70vh] overflow-hidden">
        <div className="flex flex-wrap items-center justify-end gap-3 border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#FF8A00]" />
            강의
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-[#0e4ecf]" />
            직무
          </div>
        </div>
        <div className="h-[calc(70vh-44px)]">
          <GraphPanel graphData={subgraph} centerNodeId={centerId} />
        </div>
      </Card>
      </PageShell>
    </div>
  );
}
