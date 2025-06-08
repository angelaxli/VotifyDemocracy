import Header from "@/components/header";
import CandidateComparison from "@/components/candidate-comparison";
import Footer from "@/components/footer";

export default function Compare() {
  return (
    <div className="min-h-screen bg-civic-bg">
      <Header />
      <div className="pt-8">
        <CandidateComparison />
      </div>
      <Footer />
    </div>
  );
}