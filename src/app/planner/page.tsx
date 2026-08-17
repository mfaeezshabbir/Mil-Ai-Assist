import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { MilAssistLayout } from "@/components/mil-assist-layout";
import AuthGuard from "@/components/AuthGuard";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export default async function PlannerPage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <AuthGuard>
      <MilAssistLayout />
    </AuthGuard>
  );
}
