import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content");

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory);

  return fileNames.map((fileName) => {
    const slug = fileName.replace(".md", "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    return { slug, metadata: data };
  });
}

export default function Blog() {
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="max-w-3xl"></div>
      <ul className="list-disc pl-5">
        {getAllPosts()
          .sort((a, b) => (a.metadata.date > b.metadata.date ? -1 : 1))
          .map(({ slug, metadata }) => (
            <li key={slug} className="text-lg mb-3">
              <a
                href={`/blog/${slug}`}
                className="text-blue-600 hover:underline"
              >
                {metadata.title}
              </a>
              <p className="text-sm text-gray-500">{metadata.date}</p>
            </li>
          ))}
      </ul>
    </main>
  );
}
