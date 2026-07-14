import PageRenderer, { buildPageMetadata } from "@/components/PageRenderer";

export async function generateMetadata() {
  return buildPageMetadata("");
}

export default function HomePage() {
  return <PageRenderer slug="" />;
}
