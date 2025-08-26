import { MilAssistLayout } from "@/components/mil-assist-layout";
import AuthGuard from "@/components/AuthGuard";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

export default function PlannerPage() {
  return (
    <AuthGuard>
      <MilAssistLayout />
    </AuthGuard>
  );
}
