import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import PreviewCards from "@/components/preview-cards";
import Footer from "@/components/footer";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  const handleAddressUpdate = (address: string, jurisdiction: string) => {
    // Redirect to find-reps page with query parameters
    setLocation(`/find-reps?address=${encodeURIComponent(address)}&jurisdiction=${encodeURIComponent(jurisdiction)}`);
  };

  return (
    <div className="min-h-screen bg-civic-bg">
      <Header />
      <HeroSection onAddressUpdate={handleAddressUpdate} />
      <PreviewCards />
      <Footer />
    </div>
  );
}
