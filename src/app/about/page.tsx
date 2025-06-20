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
            For now, it will be a place for me to share my thoughts and ideas. I
            am not going to put much effort into this version since I am cooking
            up a more interactive version. So, I will vibe code this and work on
            the new version.
          </p>
        </div>
      </main>
    </div>
  );
}
