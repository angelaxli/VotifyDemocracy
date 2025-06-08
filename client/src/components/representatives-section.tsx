import { useState, useEffect } from "react";
import { MapPin, Phone, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Representative } from "@shared/schema";

interface RepresentativesSectionProps {
  currentAddress: string;
  currentJurisdiction: string;
  onRepresentativeSelect: (rep: Representative) => void;
  onAddressUpdate: (address: string, jurisdiction: string) => void;
}

export default function RepresentativesSection({ 
  currentAddress, 
  currentJurisdiction, 
  onRepresentativeSelect,
  onAddressUpdate 
}: RepresentativesSectionProps) {
  const [showSection, setShowSection] = useState(false);

  useEffect(() => {
    if (currentJurisdiction) {
      setShowSection(true);
    }
  }, [currentJurisdiction]);

  const { data: representativesData, isLoading } = useQuery({
    queryKey: ['/api/representatives/search'],
    enabled: false, // We'll manually trigger this
  });

  const handleChangeAddress = () => {
    const newAddress = prompt("Enter your new address or ZIP code:", currentAddress);
    if (newAddress && newAddress.trim()) {
      // Trigger a new search
      onAddressUpdate(newAddress.trim(), ""); // Reset jurisdiction to trigger new search
    }
  };

  const getPartyColor = (party: string) => {
    switch (party?.toLowerCase()) {
      case 'democrat':
        return 'bg-civic-dem text-white';
      case 'republican':
        return 'bg-civic-red text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  // Sample representatives data for demonstration
  const representatives: Representative[] = [
    {
      id: 1,
      name: "Sen. Dianne Feinstein",
      office: "U.S. Senate",
      party: "Democrat",
      phone: "(202) 224-3841",
      email: "senator@feinstein.senate.gov",
      website: "https://feinstein.senate.gov",
      photoUrl: null,
      address: "331 Hart Senate Office Building, Washington, DC 20510",
      jurisdiction: "san francisco, ca",
      level: "federal",
      stances: {
        "Climate Change": "Supports comprehensive climate action including renewable energy initiatives and emissions reduction targets.",
        "Gun Policies": "Strong advocate for gun safety measures including universal background checks and assault weapons ban.",
        "Healthcare": "Supports strengthening the Affordable Care Act and reducing prescription drug costs."
      },
      recentBills: [
        {
          title: "Infrastructure Investment Act",
          position: "Supported",
          description: "Voted in favor of the $1.2 trillion infrastructure package for roads, bridges, and clean energy."
        }
      ]
    },
    {
      id: 2,
      name: "Rep. Nancy Pelosi",
      office: "U.S. House",
      party: "Democrat",
      phone: "(202) 225-4965",
      email: "sf.nancy@mail.house.gov",
      website: "https://pelosi.house.gov",
      photoUrl: null,
      address: "1236 Longworth House Office Building, Washington, DC 20515",
      jurisdiction: "san francisco, ca",
      level: "federal",
      stances: {},
      recentBills: []
    },
    {
      id: 3,
      name: "London Breed",
      office: "Mayor",
      party: "Nonpartisan",
      phone: "(415) 554-6141",
      email: "mayorlondonbreed@sfgov.org",
      website: "https://sfmayor.org",
      photoUrl: null,
      address: "1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102",
      jurisdiction: "san francisco, ca",
      level: "local",
      stances: {},
      recentBills: []
    },
    {
      id: 4,
      name: "John Smith",
      office: "City Council Member",
      party: "Independent",
      phone: "(415) 555-0123",
      email: "jsmith@citycouncil.gov",
      website: "https://citycouncil.gov/smith",
      photoUrl: null,
      address: "City Hall, 1 Dr Carlton B Goodlett Pl, San Francisco, CA 94102",
      jurisdiction: "san francisco, ca",
      level: "local",
      stances: {
        "Public Transportation": "Advocates for expanded public transit options and reduced traffic congestion.",
        "Housing": "Supports affordable housing initiatives and zoning reform."
      },
      recentBills: [
        {
          title: "Transit Improvement Initiative",
          position: "Sponsored",
          description: "Led efforts to improve local bus routes and bike lane infrastructure."
        }
      ]
    },
    {
      id: 5,
      name: "Maria Rodriguez",
      office: "City Council Member",
      party: "Democratic",
      phone: "(408) 555-0156",
      email: "mrodriguez@sanjoseca.gov",
      website: "https://sanjoseca.gov/council",
      photoUrl: null,
      address: "City Hall, 200 E Santa Clara St, San Jose, CA 95113",
      jurisdiction: "san jose, ca",
      level: "local",
      stances: {
        "Economic Development": "Supports small business growth and job creation in San Jose.",
        "Public Safety": "Advocates for community policing and crime prevention programs."
      },
      recentBills: [
        {
          title: "Small Business Support Act",
          position: "Sponsored",
          description: "Introduced legislation to provide tax incentives for local small businesses."
        }
      ]
    },
    {
      id: 6,
      name: "Robert Chen",
      office: "Mayor",
      party: "Nonpartisan",
      phone: "(555) 123-4567",
      email: "mayor@localcity.gov",
      website: "https://localcity.gov/mayor",
      photoUrl: null,
      address: "City Hall, Main Street, Your City",
      jurisdiction: "generic local",
      level: "local",
      stances: {
        "Infrastructure": "Focuses on improving roads, parks, and public facilities.",
        "Community Development": "Supports programs that enhance quality of life for residents."
      },
      recentBills: [
        {
          title: "Parks Improvement Initiative",
          position: "Supported",
          description: "Approved funding for renovating local parks and recreational facilities."
        }
      ]
    }
  ];

  if (!showSection && !currentJurisdiction) {
    return null;
  }

  return (
    <section id="find-reps" className="py-16 bg-civic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold text-civic-gray">Your Representatives</h3>
          <Button 
            variant="outline"
            onClick={handleChangeAddress}
            className="bg-white border border-gray-300 hover:bg-gray-50"
          >
            <MapPin className="mr-2 h-4 w-4" />
            Change Address
          </Button>
        </div>

        {currentAddress && (
          <div className="bg-white rounded-lg p-4 mb-8 border border-gray-200">
            <p className="text-sm text-gray-600">Showing representatives for:</p>
            <p className="font-semibold">{currentAddress}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {representatives.map((rep) => (
              <div key={rep.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gradient-to-br from-civic-blue to-civic-light flex items-center justify-center">
                  <User className="text-white text-6xl" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPartyColor(rep.party || '')}`}>
                      {rep.party}
                    </span>
                    <span className="text-sm text-gray-500">{rep.office}</span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{rep.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">
                    {rep.level === 'federal' ? `Serving ${rep.jurisdiction}` : rep.office}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    {rep.phone && (
                      <a 
                        href={`tel:${rep.phone}`} 
                        className="flex items-center text-sm text-gray-600 hover:text-civic-blue transition-colors"
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        {rep.phone}
                      </a>
                    )}
                    {rep.email && (
                      <a 
                        href={`mailto:${rep.email}`} 
                        className="flex items-center text-sm text-gray-600 hover:text-civic-blue transition-colors"
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Contact via Email
                      </a>
                    )}
                  </div>
                  
                  <Button 
                    className="w-full bg-civic-blue text-white hover:bg-blue-800"
                    onClick={() => onRepresentativeSelect(rep)}
                  >
                    Find More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && representatives.length === 0 && currentJurisdiction && (
          <div className="text-center py-12">
            <p className="text-gray-600">No representatives found for this area.</p>
            <Button 
              variant="outline" 
              onClick={handleChangeAddress}
              className="mt-4"
            >
              Try Different Address
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
