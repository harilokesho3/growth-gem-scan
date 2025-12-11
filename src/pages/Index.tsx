import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import DiagnosticAreas from "@/components/DiagnosticAreas";
import IdeaValidation from "@/components/IdeaValidation";
import HowItWorks from "@/components/HowItWorks";
import Consulting from "@/components/Consulting";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <DiagnosticAreas />
        <IdeaValidation />
        <HowItWorks />
        <Consulting />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
