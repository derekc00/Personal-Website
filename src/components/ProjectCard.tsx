"use client";

import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageWithSkeleton from "./ImageWithSkeleton";

export type Project = {
  slug: string;
  title: string;
  description: string;
  technologies: string[];
  image?: string;
  githubLink?: string;
  role?: string;
}

export default function ProjectCard({ project }: { project: Project }) {
  const handleGithubClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (project.githubLink) {
      window.open(project.githubLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="block group"
      tabIndex={-1}
    >
      <Card className="mb-6 transition-all duration-300 shadow-md group-hover:shadow-2xl group-hover:-translate-y-1 group-hover:scale-[1.03] group-active:scale-[0.98] cursor-pointer">
        {project.image && (
          <ImageWithSkeleton
            src={project.image}
            alt={project.title}
            width={600}
            height={300}
            className="rounded-t-xl object-cover w-full h-48"
          />
        )}
        <CardHeader>
          <CardTitle>{project.title}</CardTitle>
          {project.role && <CardDescription>{project.role}</CardDescription>}
        </CardHeader>
        <CardContent>
          <p className="mb-2">{project.description}</p>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
        {project.githubLink && (
          <CardFooter>
            <button
              onClick={handleGithubClick}
              className="flex items-center gap-2 text-primary underline"
              tabIndex={0}
              aria-label="View on GitHub"
            >
              <FaGithub className="w-5 h-5" />
              GitHub
            </button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}
