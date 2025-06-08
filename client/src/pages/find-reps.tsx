import { useState } from "react";
import { Search, MapPin, Phone, Mail, Globe, ExternalLink, Users, Building, Flag, Vote, Calendar, Clock, Info } from "lucide-react";
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
import LocationMap from "@/components/location-map";

interface RepresentativeWithStances extends Representative {
  socialLinks: Array<{ type: string; url: string }> | null;
  stances: Record<string, string> | null;
  recentBills: Array<{ title: string; position: string; description: string }> | null;
}

export default function FindReps() {
  const [address, setAddress] = useState("");
  const [searchResults, setSearchResults] = useState<{
    federal: RepresentativeWithStances[];
    state: RepresentativeWithStances[];
    local: RepresentativeWithStances[];
    formattedAddress: string;
    jurisdiction: string;
  } | null>(null);
  const [selectedRep, setSelectedRep] = useState<RepresentativeWithStances | null>(null);
  const [voterInfo, setVoterInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingVoterInfo, setIsLoadingVoterInfo] = useState(false);
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
      
      // Data now comes pre-structured with federal, state, and local categories
      setSearchResults(data);
      
      // Store user location in localStorage for elections page
      if (data.normalizedAddress) {
        const addressParts = data.normalizedAddress.split(',').map((part: string) => part.trim());
        if (addressParts.length >= 2) {
          const locationData = {
            state: addressParts[addressParts.length - 2] || '',
            city: addressParts[addressParts.length - 3] || ''
          };
          localStorage.setItem('lastSearchLocation', JSON.stringify(locationData));
        }
      }
      
      // Also fetch voter information for this address
      await fetchVoterInfo(address);
      
      const totalReps = data.federal.length + data.state.length + data.local.length;
      toast({
        title: "Representatives Found",
        description: `Found ${totalReps} representatives for ${data.formattedAddress}`,
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

  const fetchVoterInfo = async (searchAddress: string) => {
    setIsLoadingVoterInfo(true);
    try {
      const response = await apiRequest("POST", "/api/voterinfo", { address: searchAddress });
      const data = await response.json();
      setVoterInfo(data);
    } catch (error) {
      console.error("Voter info error:", error);
      // Don't show error toast for voter info as it's supplementary
    } finally {
      setIsLoadingVoterInfo(false);
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

  const federalReps = searchResults?.federal || [];
  const stateReps = searchResults?.state || [];
  const localReps = searchResults?.local || [];

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
              <h3 className="text-lg font-semibold text-black mb-3">Your Location</h3>
              <div className="rounded-lg h-64 overflow-hidden">
                <LocationMap 
                  address={searchResults?.formattedAddress || address} 
                  className="h-full w-full"
                />
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

          {/* Voter Information Section */}
          {searchResults && (
            <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
              <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
                <Vote className="h-6 w-6 text-civic-blue" />
                Voting Information for Your Address
              </h2>
              
              {isLoadingVoterInfo ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-civic-blue mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading voting information...</p>
                </div>
              ) : voterInfo ? (
                <div className="space-y-6">
                  {/* Message for when specific data isn't available */}
                  {voterInfo.message && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-800">{voterInfo.message}</p>
                      </div>
                    </div>
                  )}

                  {/* Election Information */}
                  {voterInfo.election && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-civic-blue" />
                          When is my election?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="font-semibold text-lg">{voterInfo.election.name}</p>
                          <p className="text-gray-600">
                            <strong>Date:</strong> {new Date(voterInfo.election.electionDay).toLocaleDateString('en-US', { 
                              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Polling Locations */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-civic-blue" />
                        Where do I vote?
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {voterInfo.pollingLocations && voterInfo.pollingLocations.length > 0 ? (
                        <div className="space-y-4">
                          {voterInfo.pollingLocations.map((location: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <h4 className="font-semibold">{location.address.locationName || 'Polling Location'}</h4>
                              <p className="text-gray-600">
                                {location.address.line1}, {location.address.city}, {location.address.state} {location.address.zip}
                              </p>
                              {location.pollingHours && (
                                <p className="text-sm text-gray-500 mt-1">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  Hours: {location.pollingHours}
                                </p>
                              )}
                              {location.notes && (
                                <p className="text-sm text-blue-600 mt-1">{location.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-600">
                          Polling location information is not available for this address. 
                          Contact your local election office for details.
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Early Voting Sites */}
                  {voterInfo.earlyVoteSites && voterInfo.earlyVoteSites.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-civic-blue" />
                          Early Voting Locations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {voterInfo.earlyVoteSites.map((site: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <h4 className="font-semibold">{site.address.locationName || 'Early Voting Site'}</h4>
                              <p className="text-gray-600">
                                {site.address.line1}, {site.address.city}, {site.address.state} {site.address.zip}
                              </p>
                              {site.pollingHours && (
                                <p className="text-sm text-gray-500 mt-1">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  Hours: {site.pollingHours}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Drop-off Locations */}
                  {voterInfo.dropOffLocations && voterInfo.dropOffLocations.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Mail className="h-5 w-5 text-civic-blue" />
                          Ballot Drop-off Locations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {voterInfo.dropOffLocations.map((location: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <h4 className="font-semibold">{location.address.locationName || 'Drop-off Location'}</h4>
                              <p className="text-gray-600">
                                {location.address.line1}, {location.address.city}, {location.address.state} {location.address.zip}
                              </p>
                              {location.pollingHours && (
                                <p className="text-sm text-gray-500 mt-1">
                                  <Clock className="h-4 w-4 inline mr-1" />
                                  Hours: {location.pollingHours}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Election Administration */}
                  {voterInfo.electionAdministration && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building className="h-5 w-5 text-civic-blue" />
                          Election Office & Resources
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-lg mb-2">{voterInfo.electionAdministration.name}</h4>
                            
                            {voterInfo.electionAdministration.correspondenceAddress && (
                              <div className="text-gray-600 mb-3">
                                <p className="font-medium">Contact Address:</p>
                                <p>
                                  {voterInfo.electionAdministration.correspondenceAddress.line1}<br />
                                  {voterInfo.electionAdministration.correspondenceAddress.city}, {' '}
                                  {voterInfo.electionAdministration.correspondenceAddress.state} {' '}
                                  {voterInfo.electionAdministration.correspondenceAddress.zip}
                                </p>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <h5 className="font-semibold mb-3">Official Resources</h5>
                            <div className="grid md:grid-cols-2 gap-3">
                              {voterInfo.electionAdministration.electionInfoUrl && (
                                <a 
                                  href={voterInfo.electionAdministration.electionInfoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-civic-blue hover:text-civic-blue-dark transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  General Election Information
                                </a>
                              )}
                              
                              {voterInfo.electionAdministration.electionRegistrationUrl && (
                                <a 
                                  href={voterInfo.electionAdministration.electionRegistrationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-civic-blue hover:text-civic-blue-dark transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Register to Vote
                                </a>
                              )}
                              
                              {voterInfo.electionAdministration.electionRegistrationConfirmationUrl && (
                                <a 
                                  href={voterInfo.electionAdministration.electionRegistrationConfirmationUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-civic-blue hover:text-civic-blue-dark transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Check Registration Status
                                </a>
                              )}
                              
                              {voterInfo.electionAdministration.votingLocationFinderUrl && (
                                <a 
                                  href={voterInfo.electionAdministration.votingLocationFinderUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-civic-blue hover:text-civic-blue-dark transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Find Your Polling Place
                                </a>
                              )}
                              
                              {voterInfo.electionAdministration.ballotInfoUrl && (
                                <a 
                                  href={voterInfo.electionAdministration.ballotInfoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-civic-blue hover:text-civic-blue-dark transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  View Sample Ballot
                                </a>
                              )}
                              
                              {voterInfo.electionAdministration.electionRulesUrl && (
                                <a 
                                  href={voterInfo.electionAdministration.electionRulesUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 text-civic-blue hover:text-civic-blue-dark transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Voting Rules & Procedures
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Contests/Ballot Information */}
                  {voterInfo.contests && voterInfo.contests.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Vote className="h-5 w-5 text-civic-blue" />
                          What's on my ballot?
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {voterInfo.contests.map((contest: any, index: number) => (
                            <div key={index} className="p-4 border rounded-lg">
                              <h4 className="font-semibold">{contest.office || contest.type}</h4>
                              {contest.district && (
                                <p className="text-sm text-gray-600">District: {contest.district.name}</p>
                              )}
                              {contest.candidates && contest.candidates.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium text-gray-700">Candidates:</p>
                                  <ul className="text-sm text-gray-600 mt-1">
                                    {contest.candidates.map((candidate: any, candidateIndex: number) => (
                                      <li key={candidateIndex}>
                                        {candidate.name} {candidate.party && `(${candidate.party})`}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Vote className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Voting Information Available</h3>
                  <p className="text-gray-600">
                    Voting information is not currently available for this address. 
                    Try searching with a more specific address or contact your local election office.
                  </p>
                </div>
              )}
            </div>
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