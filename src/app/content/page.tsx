import { getAllContent, getCategories } from "@/lib/content";
import ContentPageClient from "./ContentPageClient";

export default async function ContentPage() {
  const [content, categories] = await Promise.all([
    getAllContent(),
    getCategories(),
  ]);

  return <ContentPageClient initialContent={content} categories={categories} />;
}
