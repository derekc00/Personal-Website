import { PageLayout, PageHeader, Section } from "@/components/ui/page-layout";

export default function About() {
  return (
    <PageLayout variant="narrow">
      <PageHeader 
        title="About Me" 
        description="Software developer, cooking enthusiast, and lifelong learner"
      />
      
      <Section>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-lg leading-relaxed">
            Hi, I&apos;m Derek. My profession is developing software @ Veeva.
            Outside of working hours, I keep myself busy with home cooking,
            recreational sports, watching movies, and much much more.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">
            What&apos;s the point of this website?
          </h2>
          <p className="leading-relaxed">
            For now, it will be a place for me to share my thoughts and ideas. I
            am not going to put much effort into this version since I am cooking
            up a more interactive version. So, I will vibe code this and work on
            the new version.
          </p>
        </div>
      </Section>
    </PageLayout>
  );
}
