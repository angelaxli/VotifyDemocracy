import Header from "@/components/header";
import RepresentativesSection from "@/components/representatives-section";
import RepresentativeDetail from "@/components/representative-detail";
import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import type { Representative } from "@shared/schema";

export default function FindReps() {
  const [selectedRepresentative, setSelectedRepresentative] = useState<Representative | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [currentJurisdiction, setCurrentJurisdiction] = useState<string>("");
  const [location] = useLocation();

  useEffect(() => {
    // Get address and jurisdiction from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');
    const jurisdiction = urlParams.get('jurisdiction');
    
    if (address) {
      setCurrentAddress(address);
    }
    if (jurisdiction) {
      setCurrentJurisdiction(jurisdiction);
    }
  }, [location]);

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
      <Footer />
    </div>
  );
}