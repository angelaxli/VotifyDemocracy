import Header from "@/components/header";
import ElectionsSection from "@/components/elections-section";
import Footer from "@/components/footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function Elections() {
  const [jurisdiction, setJurisdiction] = useState<string>("");
  const [location] = useLocation();

  useEffect(() => {
    // Get jurisdiction from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const jurisdictionParam = urlParams.get('jurisdiction');
    
    if (jurisdictionParam) {
      setJurisdiction(jurisdictionParam);
    } else {
      // Default to San Francisco for demo
      setJurisdiction("san francisco, ca");
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-civic-bg">
      <Header />
      <div className="pt-8">
        <ElectionsSection jurisdiction={jurisdiction} />
      </div>
      <Footer />
    </div>
  );
}