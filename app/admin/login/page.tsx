import { AdminLoginPage } from "@/components/admin/AdminLoginPage";

type AdminLoginRouteProps = {
  searchParams: Promise<{
    denied?: string;
  }>;
};

export default async function AdminLoginRoute({ searchParams }: AdminLoginRouteProps) {
  const params = await searchParams;

  return <AdminLoginPage denied={params.denied === "1"} />;
}
