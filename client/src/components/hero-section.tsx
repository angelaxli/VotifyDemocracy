import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface HeroSectionProps {
  onAddressUpdate: (address: string, jurisdiction: string) => void;
}

export default function HeroSection({ onAddressUpdate }: HeroSectionProps) {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your address or ZIP code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/representatives/search", { address });
      const data = await response.json();
      
      onAddressUpdate(data.formattedAddress, data.jurisdiction);
      
      // Scroll to representatives section
      const element = document.getElementById('find-reps');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      
      toast({
        title: "Representatives Found",
        description: `Found representatives for ${data.formattedAddress}`,
      });
    } catch (error) {
      console.error("Error searching representatives:", error);
      toast({
        title: "Search Failed",
        description: "Unable to find representatives. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-civic-blue to-civic-light text-white py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6">Know Your Representatives</h2>
        <p className="text-xl md:text-2xl mb-8 opacity-90">Because Democracy Isn't a Guessing Game</p>
        <p className="text-lg mb-12 opacity-80 max-w-2xl mx-auto">
          Find your elected officials, track upcoming elections, and compare candidates with trusted, 
          non-partisan information at your fingertips.
        </p>
        
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md mx-auto">
          <h3 className="text-civic-gray text-xl font-semibold mb-4">Find Your Representatives</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="address" className="block text-sm font-medium text-civic-gray mb-2">
                Enter Your Address or ZIP Code
              </Label>
              <Input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="1600 Pennsylvania Ave, Washington, DC 20500"
                className="w-full"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-civic-blue hover:bg-blue-800 text-white font-semibold"
              disabled={isLoading}
            >
              <Search className="mr-2 h-4 w-4" />
              {isLoading ? "Searching..." : "Find My Reps"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
