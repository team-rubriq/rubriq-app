import TemplateStatisticsDetail from '@/components/templates-page/TemplateStatisticsDetail';

export default function TemplateStatisticsDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <TemplateStatisticsDetail templateId={params.id} />;
}
