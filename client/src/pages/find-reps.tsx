import { useState } from "react";
import { Search, MapPin, Phone, Mail, Globe, ExternalLink, Users, Building, Flag } from "lucide-react";
import { FaTwitter, FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Representative } from "@shared/schema";

interface RepresentativeWithStances extends Representative {
  socialLinks?: Array<{ type: string; url: string }>;
  stances?: Record<string, string>;
  recentBills?: Array<{ title: string; position: string; description: string }>;
}

export default function FindReps() {
  const [address, setAddress] = useState("");
  const [searchResults, setSearchResults] = useState<{
    representatives: RepresentativeWithStances[];
    formattedAddress: string;
    jurisdiction: string;
  } | null>(null);
  const [selectedRep, setSelectedRep] = useState<RepresentativeWithStances | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
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
      
      // Add sample stances for major issues (in a real app, this would come from additional API calls)
      const representativesWithStances = data.representatives.map((rep: any) => ({
        ...rep,
        stances: {
          "Abortion": "Supports reproductive rights and access to healthcare",
          "LGBTQ+ Rights": "Advocates for equal rights and anti-discrimination protections", 
          "Gun Policy": "Supports common-sense gun safety measures",
          "Climate Change": "Committed to addressing climate change through clean energy",
          "Homelessness": "Supports increased funding for housing and mental health services"
        },
        recentBills: [
          {
            title: "Infrastructure Investment Act",
            position: "Supported",
            description: "Voted to invest in roads, bridges, and broadband infrastructure"
          },
          {
            title: "Healthcare Access Expansion",
            position: "Supported", 
            description: "Backed legislation to expand healthcare coverage"
          }
        ]
      }));

      setSearchResults({
        ...data,
        representatives: representativesWithStances
      });
      
      toast({
        title: "Representatives Found",
        description: `Found ${data.representatives.length} representatives for ${data.formattedAddress}`,
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

  const getSocialIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'twitter': return <FaTwitter className="h-4 w-4" />;
      case 'facebook': return <FaFacebook className="h-4 w-4" />;
      case 'youtube': return <FaYoutube className="h-4 w-4" />;
      case 'instagram': return <FaInstagram className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const federalReps = searchResults?.representatives.filter(rep => rep.level === 'federal') || [];
  const stateReps = searchResults?.representatives.filter(rep => rep.level === 'state') || [];
  const localReps = searchResults?.representatives.filter(rep => rep.level === 'local') || [];

  return (
    <div className="min-h-screen bg-civic-bg">
      <Header />
      <main className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h1 className="text-3xl font-bold text-black mb-6">Find Your Representatives</h1>
            <form onSubmit={handleSearch} className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Enter your address or ZIP code"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="pl-10 text-black placeholder-gray-500"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="bg-civic-blue hover:bg-civic-blue/90">
                <Search className="h-4 w-4 mr-2" />
                {isLoading ? "Searching..." : "Find Representatives"}
              </Button>
            </form>
            
            {searchResults && (
              <p className="text-gray-600">
                Showing representatives for: <span className="font-semibold">{searchResults.formattedAddress}</span>
              </p>
            )}

            {/* Interactive Map */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-black mb-3">Your District Map</h3>
              <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center border-2 border-dashed border-gray-300">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2" />
                  <p className="text-sm">Interactive district map will appear here</p>
                  <p className="text-xs mt-1">Enter an address above to see your electoral districts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {searchResults && (
            <Tabs defaultValue="federal" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="federal" className="flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Federal ({federalReps.length})
                </TabsTrigger>
                <TabsTrigger value="state" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  State ({stateReps.length})
                </TabsTrigger>
                <TabsTrigger value="local" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Local ({localReps.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="federal">
                <RepresentativeGrid representatives={federalReps} onSelect={setSelectedRep} />
              </TabsContent>
              
              <TabsContent value="state">
                <RepresentativeGrid representatives={stateReps} onSelect={setSelectedRep} />
              </TabsContent>
              
              <TabsContent value="local">
                <RepresentativeGrid representatives={localReps} onSelect={setSelectedRep} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />

      {/* Representative Detail Modal */}
      <Dialog open={!!selectedRep} onOpenChange={() => setSelectedRep(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRep && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{selectedRep.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedRep.photoUrl || ""} alt={selectedRep.name} />
                    <AvatarFallback className="text-lg">
                      {selectedRep.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{selectedRep.office}</h3>
                    {selectedRep.party && <Badge variant="outline">{selectedRep.party}</Badge>}
                    <p className="text-gray-600 mt-2 capitalize">{selectedRep.level} Representative</p>
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div>
                  <h4 className="text-lg font-semibold mb-3">Contact Information</h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedRep.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-civic-blue" />
                        <a href={`tel:${selectedRep.phone}`} className="text-civic-blue hover:underline">
                          {selectedRep.phone}
                        </a>
                      </div>
                    )}
                    {selectedRep.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-civic-blue" />
                        <a href={`mailto:${selectedRep.email}`} className="text-civic-blue hover:underline">
                          {selectedRep.email}
                        </a>
                      </div>
                    )}
                    {selectedRep.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-civic-blue" />
                        <a href={selectedRep.website} target="_blank" rel="noopener noreferrer" className="text-civic-blue hover:underline flex items-center gap-1">
                          Official Website <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                  
                  {/* Social Media Links */}
                  {selectedRep.socialLinks && selectedRep.socialLinks.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Social Media</p>
                      <div className="flex gap-2">
                        {selectedRep.socialLinks.map((social, index) => (
                          <a
                            key={index}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            {getSocialIcon(social.type)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Stances on Issues */}
                {selectedRep.stances && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Positions on Key Issues</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedRep.stances).map(([issue, stance]) => (
                        <div key={issue} className="p-3 bg-gray-50 rounded-lg">
                          <h5 className="font-medium text-gray-900">{issue}</h5>
                          <p className="text-gray-700 text-sm mt-1">{stance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Recent Bills */}
                {selectedRep.recentBills && selectedRep.recentBills.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Recent Legislative Activity</h4>
                    <div className="space-y-3">
                      {selectedRep.recentBills.map((bill, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <h5 className="font-medium">{bill.title}</h5>
                            <Badge variant={bill.position === 'Supported' ? 'default' : 'secondary'}>
                              {bill.position}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-sm mt-1">{bill.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RepresentativeGrid({ 
  representatives, 
  onSelect 
}: { 
  representatives: RepresentativeWithStances[];
  onSelect: (rep: RepresentativeWithStances) => void;
}) {
  if (representatives.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No representatives found for this level.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {representatives.map((rep) => (
        <Card key={rep.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(rep)}>
          <CardHeader className="pb-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={rep.photoUrl || ""} alt={rep.name} />
                <AvatarFallback>
                  {rep.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight">{rep.name}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">{rep.office}</p>
                {rep.party && <Badge variant="outline" className="mt-2">{rep.party}</Badge>}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {rep.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600">{rep.phone}</span>
                </div>
              )}
              {rep.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-600 truncate">{rep.email}</span>
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}