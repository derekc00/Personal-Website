import { notFound } from "next/navigation";
import { Project } from "@/components/ProjectCard";
import { FaGithub } from "react-icons/fa";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

// This should be replaced with a real data source in the future
const sampleProjects: Project[] = [
  {
    slug: "portfolio-website",
    title: "Personal Portfolio Website",
    description:
      "A modern, responsive portfolio site built with Next.js and Tailwind CSS.",
    technologies: ["Next.js", "React", "Tailwind CSS", "Vercel"],
    image: "https://picsum.photos/seed/portfolio/600/300",
    githubLink: "https://github.com/yourusername/portfolio-website",
    role: "Full Stack Developer",
  },
  {
    slug: "ai-productivity-tool",
    title: "AI Productivity Tool",
    description:
      "A web app that leverages AI to automate daily productivity tasks.",
    technologies: ["TypeScript", "OpenAI API", "Node.js"],
    image: "https://picsum.photos/seed/ai/600/300",
    githubLink: "https://github.com/yourusername/ai-productivity-tool",
    role: "Lead Developer",
  },
  {
    slug: "scuba-diving-logbook",
    title: "Scuba Diving Logbook",
    description:
      "A mobile-friendly app for logging and sharing scuba diving experiences.",
    technologies: ["React", "Firebase", "PWA"],
    image: "https://picsum.photos/seed/scuba/600/300",
    githubLink: "https://github.com/yourusername/scuba-diving-logbook",
    role: "Frontend Developer",
  },
];

export default function ProjectDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const project = sampleProjects.find((p) => p.slug === params.slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="max-w-3xl w-full">
        <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
        {project.image && (
          <ImageWithSkeleton
            src={project.image}
            alt={project.title}
            width={1200}
            height={600}
            className="rounded-xl mb-6 w-full h-64 object-cover"
          />
        )}
        <p className="mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech) => (
            <span
              key={tech}
              className="bg-gray-200 dark:bg-gray-700 rounded px-2 py-1 text-sm"
            >
              {tech}
            </span>
          ))}
        </div>
        {project.role && (
          <p className="mb-2 font-semibold">Role: {project.role}</p>
        )}
        {project.githubLink && (
          <a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary underline"
            aria-label="View on GitHub"
          >
            <FaGithub className="w-5 h-5" />
            GitHub
          </a>
        )}
      </div>
    </main>
  );
}
