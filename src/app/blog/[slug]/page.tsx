import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";

const postsDirectory = path.join(process.cwd(), "content");

interface PostProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    slug: fileName.replace(".md", ""),
  }));
}

async function getPost(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { content, data } = matter(fileContents);
  return { content, metadata: data };
}

// This is your new page component
export default async function Post({ params }: PostProps) {
  const { content, metadata } = await getPost(params.slug);

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">{metadata.title}</h1>
      <div className="max-w-3xl">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </main>
  );
}
