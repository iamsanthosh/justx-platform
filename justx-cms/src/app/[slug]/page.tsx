import PageRenderer, { buildPageMetadata } from "@/components/PageRenderer";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return buildPageMetadata(slug);
}

export default async function DynamicPage({ params }: Props) {
  const { slug } = await params;
  return <PageRenderer slug={slug} />;
}
