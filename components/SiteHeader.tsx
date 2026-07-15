export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex flex-col items-center justify-center py-10 max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
          Sync<span className="text-primary">Term</span>
        </h1>
        <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          The smartest way to plan your semester. Zero loading screens, instant overlap detection, and local storage to keep your schedule exactly where you left it.
        </p>
      </div>
    </header>
  )
}
