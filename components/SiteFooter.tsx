export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border bg-card py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center items-center text-sm text-muted-foreground">
        <p>© {currentYear} All rights reserved. Developed by daemon</p>
      </div>
    </footer>
  )
}
