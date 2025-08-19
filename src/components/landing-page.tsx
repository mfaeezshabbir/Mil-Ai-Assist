import LandingHeader from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import LandingFooter from "@/components/landing/Footer";
import UseCases from "@/components/landing/UseCases";
import Integrations from "@/components/landing/Integrations";
import CallToAction from "@/components/landing/CallToAction";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground bg-tactical-grid bg-[size:20px_20px]">
      <LandingHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <UseCases />
        <Integrations />
        <CallToAction />
      </main>
      <LandingFooter />
    </div>
  );
}
