import { cn } from "@/lib/utils";

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "narrow" | "wide";
}

export function PageLayout({ children, className, variant = "default" }: PageLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen pt-16",
        variant === "narrow" && "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
        variant === "default" && "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
        variant === "wide" && "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      {children}
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("py-8 sm:py-12", className)}>
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <section className={cn("py-8 sm:py-12", className)}>
      {children}
    </section>
  );
}