import { AppNavbar } from "@/components/AppNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AppNavbar />
      {children}
    </>
  );
}
