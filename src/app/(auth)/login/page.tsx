import { AuthCard } from "@/features/auth/components/auth-card";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background p-4">
      <AuthCard message={params.message} />
    </main>
  );
}
