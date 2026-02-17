/**
 * Minimal layout for the shared investigation page.
 * No auth required, no header/footer.
 */
export default function SharedInvestigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
