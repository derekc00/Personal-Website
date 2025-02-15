import { getAllPosts } from "../../lib/posts";
import Card from "@/app/components/card";
import Container from "@/app/components/container";

export default function Blog() {
  const posts = getAllPosts();

  return (
    <Container>
      <main className="flex min-h-screen flex-col items-center p-24">
        <h1 className="text-4xl font-bold mb-8 self-start">Blog</h1>
        <hr className="w-full border-t-2 border-gray-300 my-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full">
          {posts
            .sort(
              (a, b) =>
                new Date(b.metadata.date).getTime() -
                new Date(a.metadata.date).getTime()
            )
            .map(({ slug, metadata }) => (
              <Card
                key={slug}
                slug={slug}
                title={metadata.title}
                date={metadata.date}
                image={metadata.image}
                tags={metadata.tags}
              />
            ))}
        </div>
      </main>
    </Container>
  );
}
