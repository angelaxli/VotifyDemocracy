import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import PreviewCards from "@/components/preview-cards";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-civic-bg">
      <Header />
      <HeroSection />
      <PreviewCards />
      <Footer />
    </div>
  );
}
