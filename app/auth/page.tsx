import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AuthLayout } from "@/components/auth/AuthLayout";

type SearchParams = Promise<{
  mode?: string;
  intent?: string;
}>;

type AuthPageProps = {
  searchParams: SearchParams;
};

const resolveMode = (value?: string) => (value === "register" ? "register" : "login");
const resolveIntent = (value?: string) => (value === "host" ? "host" : "guest");

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const params = await searchParams;
  const mode = resolveMode(params.mode);
  const intent = resolveIntent(params.intent);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <AuthLayout mode={mode} intent={intent} />
      </main>
      <Footer />
    </div>
  );
}
