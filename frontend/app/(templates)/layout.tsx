/**
 * Template Showcase Layout
 * Isolated from main application
 * For design system & template preview only
 */

export default function TemplateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-neutral-950">
      {children}
    </div>
  );
}
