export default function About() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col items-start pt-32 p-24">
        <h1 className="text-4xl font-bold mb-8">About Me</h1>
        <div className="max-w-8xl">
          <p>
            Hi, I&apos;m Derek. My profession is developing software @ Veeva.
            Outside of working hours, I keep myself busy with home cooking,
            recreational sports, watching movies, and much much more.
          </p>
          <br />
          <h2 className="text-2xl font-bold mb-4">
            What&apos;s that point of this website?
          </h2>
          <p>
            I&apos;m not too sure at the moment. My best guess is that it will
            be a place for old friends, new friends, recruiters, and complete
            strangers to know more about me and what I&apos;m up. Kind of like
            social media but without the common side effects I notice I get when
            I post there.
          </p>
        </div>
      </main>
    </div>
  );
}
