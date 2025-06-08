import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import PreviewCards from "@/components/preview-cards";
import RepresentativesSection from "@/components/representatives-section";
import RepresentativeDetail from "@/components/representative-detail";
import ElectionsSection from "@/components/elections-section";
import CandidateComparison from "@/components/candidate-comparison";
import Footer from "@/components/footer";
import { useState } from "react";
import type { Representative } from "@shared/schema";

export default function Home() {
  const [selectedRepresentative, setSelectedRepresentative] = useState<Representative | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [currentJurisdiction, setCurrentJurisdiction] = useState<string>("");

  const handleRepresentativeSelect = (rep: Representative) => {
    setSelectedRepresentative(rep);
  };

  const handleAddressUpdate = (address: string, jurisdiction: string) => {
    setCurrentAddress(address);
    setCurrentJurisdiction(jurisdiction);
  };

  return (
    <div className="min-h-screen bg-civic-bg">
      <Header />
      <HeroSection onAddressUpdate={handleAddressUpdate} />
      <PreviewCards />
      <RepresentativesSection 
        currentAddress={currentAddress}
        currentJurisdiction={currentJurisdiction}
        onRepresentativeSelect={handleRepresentativeSelect}
        onAddressUpdate={handleAddressUpdate}
      />
      {selectedRepresentative && (
        <RepresentativeDetail 
          representative={selectedRepresentative}
          onClose={() => setSelectedRepresentative(null)}
        />
      )}
      <ElectionsSection jurisdiction={currentJurisdiction} />
      <CandidateComparison />
      <Footer />
    </div>
  );
}
