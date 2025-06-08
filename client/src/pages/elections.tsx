import Header from "@/components/header";
import Footer from "@/components/footer";
import { useQuery } from "@tanstack/react-query";
import { getElections } from "@/lib/api";
import { Calendar, MapPin, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Elections() {
  // Get user's location from localStorage if available
  const getUserLocation = () => {
    if (typeof window !== 'undefined') {
      const lastSearch = localStorage.getItem('lastSearchLocation');
      if (lastSearch) {
        const parsed = JSON.parse(lastSearch);
        return { state: parsed.state, city: parsed.city };
      }
    }
    return { state: null, city: null };
  };

  const userLocation = getUserLocation();
  const searchResults = true; // Show voting information section by default
  
  const { data: elections, isLoading, error } = useQuery({
    queryKey: ["/api/elections", userLocation.state, userLocation.city],
    queryFn: () => {
      const params = new URLSearchParams();
      if (userLocation.state) params.append('userState', userLocation.state);
      if (userLocation.city) params.append('userCity', userLocation.city);
      
      const url = `/api/elections${params.toString() ? `?${params.toString()}` : ''}`;
      return fetch(url).then(res => res.json());
    }
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getElectionTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'primary': return 'bg-blue-100 text-blue-800';
      case 'general': return 'bg-green-100 text-green-800';
      case 'special': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatJurisdiction = (jurisdiction: string) => {
    if (jurisdiction.startsWith('ocd-division/country:us/state:')) {
      const state = jurisdiction.replace('ocd-division/country:us/state:', '').toUpperCase();
      return state;
    }
    return jurisdiction;
  };

  return (
    <div className="min-h-screen bg-civic-bg">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upcoming Elections</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-4">
            Stay informed about upcoming elections in your area. Find election dates, types, and jurisdictions 
            to make sure you're prepared to vote.
          </p>
          <a 
            href="https://www.vote.org/polling-place-locator/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-civic-blue hover:text-civic-blue-dark font-medium"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Find polling location
          </a>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-civic-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading election information...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Failed to load election data. Please try again later.</p>
          </div>
        )}

        {/* Voting Information Section - moved to top */}
        {searchResults && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Voting Information for Your Area</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-civic-blue" />
                  Where do I vote?
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Joyce Ellington Branch Library
                </p>
                <p className="text-sm text-gray-600">
                  Address: 491 E Empire St, San Jose, CA 95112
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Register to Vote</h3>
                <p className="text-sm text-gray-600">
                  Make sure you're registered to vote in your state. Registration deadlines vary by location.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Early Voting</h3>
                <p className="text-sm text-gray-600">
                  Many jurisdictions offer early voting options. Check if early voting is available in your area.
                </p>
              </div>
            </div>
          </div>
        )}

        {elections && elections.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {elections.map((election: any) => (
              <Card key={election.id} className={`hover:shadow-lg transition-shadow ${election.isNearby ? 'border-blue-500 border-2' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {election.name}
                        </CardTitle>
                        {election.isNearby && (
                          <Badge className="bg-blue-500 text-white">
                            Near You
                          </Badge>
                        )}
                      </div>
                      <Badge className={getElectionTypeColor(election.type)}>
                        {election.type.charAt(0).toUpperCase() + election.type.slice(1)} Election
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">{formatDate(election.date)}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{formatJurisdiction(election.jurisdiction)}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm text-gray-500">
                      Make sure you're registered to vote and know your polling location.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {elections && elections.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Elections</h3>
            <p className="text-gray-600">There are no elections currently scheduled in the system.</p>
          </div>
        )}

        
      </div>
      
      <Footer />
    </div>
  );
}