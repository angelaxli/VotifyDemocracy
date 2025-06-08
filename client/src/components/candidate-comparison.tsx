import { useState } from "react";
import { Phone, Mail, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";


export default function CandidateComparison() {
  const [selectedElection, setSelectedElection] = useState<string>("");

  // Fetch upcoming elections from Google Civic Information API
  const { data: elections, isLoading: electionsLoading } = useQuery({
    queryKey: ["/api/elections"],
    queryFn: () => fetch("/api/elections").then(res => res.json())
  });

  // Fetch local candidates from backend API
  const { data: localCandidates, isLoading: candidatesLoading } = useQuery({
    queryKey: ["/api/candidates/local"],
    queryFn: () => fetch("/api/candidates/local").then(res => res.json()),
    enabled: true
  });

  // Sample local candidates data (fallback for non-San Jose elections)
  const fallbackLocalCandidates = [
    {
      id: 1,
      name: "Sarah Chen",
      office: "Mayor",
      party: "Democrat",
      age: 45,
      background: "Current City Supervisor",
      phone: "(415) 555-0123",
      email: "sarah@chenformayor.com",
      positions: {
        "Housing & Homelessness": "Proposes building 15,000 affordable housing units and expanding mental health services",
        "Climate Action": "Supports carbon neutrality by 2030 and increased public transit funding",
        "Public Safety": "Advocates for community policing reforms and violence prevention programs"
      },
      recentActions: [
        {
          title: "Affordable Housing Bond",
          type: "Supported",
          description: "Voted yes on $600M bond for affordable housing development"
        },
        {
          title: "Public Transit Expansion",
          type: "Supported", 
          description: "Co-authored measure to expand bus rapid transit"
        }
      ]
    },
    {
      id: 2,
      name: "Michael Rodriguez", 
      office: "Mayor",
      party: "Republican",
      age: 52,
      background: "Former Police Chief",
      phone: "(415) 555-0456",
      email: "mike@rodriguezformayor.com",
      positions: {
        "Housing & Homelessness": "Focuses on law enforcement approach to homeless encampments and streamlined permitting",
        "Climate Action": "Supports market-based solutions and nuclear energy as part of climate strategy",
        "Public Safety": "Proposes increased police funding and stricter enforcement of quality-of-life crimes"
      },
      recentActions: [
        {
          title: "Police Overtime Budget",
          type: "Supported",
          description: "Advocated for increased police overtime funding"
        },
        {
          title: "Homeless Services Reform",
          type: "Mixed",
          description: "Supported some services but opposed supervised injection sites"
        }
      ]
    }
  ];

  const nationalCandidates = [
    {
      id: 3,
      name: "Rep. Katie Porter",
      office: "U.S. Senate",
      party: "Democrat", 
      age: 50,
      background: "U.S. Representative",
      phone: "(202) 225-5611",
      email: "info@katieporter.com",
      positions: {
        "Healthcare": "Supports Medicare for All and prescription drug price negotiations",
        "Climate Change": "Advocates for Green New Deal and clean energy investment",
        "Economic Policy": "Focuses on consumer protection and corporate accountability"
      },
      recentActions: [
        {
          title: "Consumer Protection Act",
          type: "Authored",
          description: "Introduced legislation to strengthen consumer financial protections"
        }
      ]
    },
    {
      id: 4,
      name: "Steve Garvey",
      office: "U.S. Senate",
      party: "Republican",
      age: 75,
      background: "Former MLB Player",
      phone: "(619) 555-0789", 
      email: "info@garveyforsenate.com",
      positions: {
        "Healthcare": "Supports market-based healthcare solutions and price transparency",
        "Climate Change": "Emphasizes technology innovation and nuclear energy development",
        "Economic Policy": "Advocates for reduced regulations and business-friendly policies"
      },
      recentActions: [
        {
          title: "Small Business Support",
          type: "Platform",
          description: "Proposes tax incentives for small business growth"
        }
      ]
    }
  ];

  // Get candidates based on selected election
  const getSelectedElectionData = () => {
    if (!selectedElection || !elections) {
      return { candidates: [], title: "Select an election to view candidates" };
    }
    
    const election = elections.find((e: any) => e.id.toString() === selectedElection);
    if (!election) {
      return { candidates: [], title: "Election not found" };
    }

    // For San Jose elections, use authentic candidate data from backend
    if (election.name?.toLowerCase().includes('san jose') || election.name?.toLowerCase().includes('council district 3')) {
      return { 
        candidates: localCandidates || [], 
        title: election.name || 'San Jose Election',
        isAuthentic: true
      };
    }
    // For other CA state elections, use national candidates as fallback
    else if (election.jurisdiction?.includes('state:ca') && election.name?.toLowerCase().includes('senate')) {
      return { candidates: nationalCandidates, title: election.name || 'Senate Election' };
    } 
    // Default case
    else {
      return { candidates: [], title: `${election.name || 'Unknown Election'} - Candidate information not available` };
    }
  };

  const { candidates, title: raceTitle } = getSelectedElectionData();

  const getPartyColor = (party: string) => {
    switch (party?.toLowerCase()) {
      case 'democrat':
        return 'from-civic-dem to-blue-400';
      case 'republican':
        return 'from-civic-red to-red-400';
      default:
        return 'from-gray-600 to-gray-400';
    }
  };

  const getActionBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'supported':
      case 'authored':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'opposed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'mixed':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <section id="compare" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-civic-gray mb-4">Compare Candidates</h3>
          <p className="text-lg text-gray-600">See how candidates stack up on the issues that matter to you</p>
        </div>

        {/* Election Selection */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md">
            <Select value={selectedElection} onValueChange={setSelectedElection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select an upcoming election" />
              </SelectTrigger>
              <SelectContent>
                {electionsLoading ? (
                  <SelectItem value="loading" disabled>Loading elections...</SelectItem>
                ) : elections && elections.length > 0 ? (
                  elections.map((election: any) => (
                    <SelectItem key={election.id} value={election.id.toString()}>
                      {election.name} - {new Date(election.date).toLocaleDateString()}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>No elections available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Race Comparison */}
        <div className="mb-12">
          <h4 className="text-2xl font-semibold text-center mb-8">{raceTitle}</h4>
          
          <div className="grid md:grid-cols-2 gap-8">
            {candidates.map((candidate: any) => (
              <div key={candidate.id} className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                {/* Candidate header with colorful gradient */}
                <div className={`bg-gradient-to-r ${getPartyColor(candidate.party)} rounded-lg p-4 mb-6 text-white`}>
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-4">
                      {candidate.photoUrl ? (
                        <img 
                          src={candidate.photoUrl} 
                          alt={`${candidate.name} profile photo`}
                          className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                          <User className="text-white text-3xl" />
                        </div>
                      )}
                    </div>
                    <h5 className="text-xl font-bold mb-2">{candidate.name}</h5>
                    <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {candidate.party} • Age {candidate.age}
                    </Badge>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
                    <h6 className="font-semibold text-blue-900 mb-2">Background</h6>
                    <p className="text-blue-800 text-sm">{candidate.background}</p>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mb-6">
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                    <h6 className="font-semibold text-green-900 mb-3">Contact Information</h6>
                    <div className="space-y-2">
                      {candidate.email && (
                        <a 
                          href={`mailto:${candidate.email}`} 
                          className="flex items-center text-sm text-green-700 hover:text-green-900 transition-colors"
                        >
                          <Mail className="mr-2 h-4 w-4" />
                          {candidate.email}
                        </a>
                      )}
                      {candidate.phone && (
                        <a 
                          href={`tel:${candidate.phone}`} 
                          className="flex items-center text-sm text-green-700 hover:text-green-900 transition-colors"
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          {candidate.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Policy Positions */}
                {candidate.positions && Object.keys(candidate.positions).length > 0 && (
                  <div className="mb-6">
                    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                      <h6 className="font-semibold text-purple-900 mb-4">Policy Positions</h6>
                      <div className="space-y-3">
                        {Object.entries(candidate.positions).map(([issue, position]) => (
                          <div key={issue} className="bg-white/60 rounded-lg p-3 border border-purple-200">
                            <h6 className="font-medium text-purple-900 text-sm mb-2">{issue}</h6>
                            <p className="text-xs text-purple-800 leading-relaxed">{position as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stances */}
                {candidate.stances && Object.keys(candidate.stances).length > 0 && (
                  <div className="mb-6">
                    <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 rounded-r-lg">
                      <h6 className="font-semibold text-indigo-900 mb-4">Stances</h6>
                      <div className="space-y-3">
                        {Object.entries(candidate.stances).map(([issue, stance]) => (
                          <div key={issue} className="bg-white/60 rounded-lg p-3 border border-indigo-200">
                            <h6 className="font-medium text-indigo-900 text-sm mb-2">{issue}</h6>
                            <p className="text-xs text-indigo-800 leading-relaxed">{stance as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Actions */}
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <h6 className="font-semibold text-orange-900 mb-3">Recent Actions</h6>
                  <div className="space-y-3">
                    {(candidate.recentActions || []).map((action: any, index: number) => (
                      <div key={index} className="bg-white/60 rounded-lg p-3 border border-orange-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="text-sm font-medium text-orange-900">{action.title}</p>
                          <Badge className={`text-xs ${getActionBadgeColor(action.position || action.type)}`}>
                            {action.position || action.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-orange-800 leading-relaxed">{action.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
