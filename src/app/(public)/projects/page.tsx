import ProjectCard, { Project } from "@/components/ProjectCard";
import { PageLayout, PageHeader, Section } from "@/components/ui/page-layout";

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

export default function Projects() {
  return (
    <PageLayout>
      <PageHeader 
        title="Projects" 
        description="A collection of projects showcasing my development skills and interests"
      />
      
      <Section>
        <div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
          {sampleProjects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>
    </PageLayout>
  );
}
