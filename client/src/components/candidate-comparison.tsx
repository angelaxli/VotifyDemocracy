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
    if (election.name.toLowerCase().includes('san jose') || election.name.toLowerCase().includes('council district 3')) {
      return { 
        candidates: localCandidates || [], 
        title: election.name,
        isAuthentic: true
      };
    }
    // For other CA state elections, use national candidates as fallback
    else if (election.jurisdiction.includes('state:ca') && election.name.toLowerCase().includes('senate')) {
      return { candidates: nationalCandidates, title: election.name };
    } 
    // Default case
    else {
      return { candidates: [], title: `${election.name} - Candidate information not available` };
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
            {candidates.map((candidate) => (
              <div key={candidate.id} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                {/* Candidate photo placeholder */}
                <div className={`w-32 h-32 bg-gradient-to-br ${getPartyColor(candidate.party)} rounded-full flex items-center justify-center mx-auto mb-6`}>
                  <User className="text-white text-4xl" />
                </div>
                
                <div className="text-center mb-6">
                  <h5 className="text-xl font-bold mb-2">{candidate.name}</h5>
                  <p className="text-gray-600">{candidate.background}</p>
                  <p className="text-sm text-gray-500">{candidate.party} • Age {candidate.age}</p>
                </div>

                {/* Contact Info */}
                <div className="mb-6 space-y-2">
                  <a 
                    href={`mailto:${candidate.email}`} 
                    className="flex items-center text-sm text-civic-blue hover:text-blue-800"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    {candidate.email}
                  </a>
                  <a 
                    href={`tel:${candidate.phone}`} 
                    className="flex items-center text-sm text-civic-blue hover:text-blue-800"
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    {candidate.phone}
                  </a>
                </div>

                {/* Issue Positions */}
                <div className="space-y-4">
                  <h6 className="font-semibold text-gray-800">Key Positions:</h6>
                  
                  {Object.entries(candidate.positions).map(([issue, position]) => (
                    <div key={issue}>
                      <h6 className="font-medium text-sm">{issue}</h6>
                      <p className="text-xs text-gray-600 mt-1">{position}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Actions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h6 className="font-semibold text-gray-800 mb-3">
                    Recent Actions:
                  </h6>
                  <div className="space-y-2">
                    {candidate.recentActions.map((action, index) => (
                      <div key={index} className={`border rounded p-2 ${getActionBadgeColor(action.type)}`}>
                        <p className="text-xs font-medium">{action.title} - {action.type}</p>
                        <p className="text-xs">{action.description}</p>
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
