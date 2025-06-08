import { useState } from "react";
import { ExternalLink, Calendar, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ElectionsSectionProps {
  jurisdiction: string;
}

export default function ElectionsSection({ jurisdiction }: ElectionsSectionProps) {
  const [electionFilter, setElectionFilter] = useState("all");

  // Sample elections data
  const elections = [
    {
      id: 1,
      name: "2024 General Election",
      date: "November 5, 2024",
      type: "national",
      registrationDeadline: "October 21, 2024",
      earlyVotingStart: "October 7, 2024",
      earlyVotingEnd: "October 30, 2024",
      electionOfficeUrl: "https://sfelections.sfgov.org",
      jurisdiction: "san francisco, ca"
    },
    {
      id: 2,
      name: "Municipal Election",
      date: "November 7, 2023",
      type: "local",
      registrationDeadline: "October 23, 2023",
      earlyVotingStart: "October 9, 2023",
      earlyVotingEnd: "October 30, 2023",
      electionOfficeUrl: "https://sfelections.sfgov.org/polling-locations",
      jurisdiction: "san francisco, ca"
    }
  ];

  const filteredElections = elections.filter(election => {
    if (electionFilter === "all") return true;
    return election.type === electionFilter;
  });

  const getElectionBadgeColor = (type: string) => {
    return type === "national" ? "bg-civic-blue text-white" : "bg-green-600 text-white";
  };

  const isDeadlineApproaching = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays > 0;
  };

  return (
    <section id="elections" className="py-16 bg-civic-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-3xl font-bold text-civic-gray">
            Upcoming Elections{jurisdiction && ` in ${jurisdiction}`}
          </h3>
          <Select value={electionFilter} onValueChange={setElectionFilter}>
            <SelectTrigger className="w-48 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Elections</SelectItem>
              <SelectItem value="local">Local Elections</SelectItem>
              <SelectItem value="national">National Elections</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {filteredElections.map((election) => (
            <div key={election.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-semibold">{election.name}</h4>
                <Badge className={getElectionBadgeColor(election.type)}>
                  {election.type === "national" ? "National" : "Local"}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Election Date:</span>
                  <span className="font-medium flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    {election.date}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration Deadline:</span>
                  <span className={`font-medium flex items-center ${
                    isDeadlineApproaching(election.registrationDeadline || '') ? 'text-civic-red' : ''
                  }`}>
                    {isDeadlineApproaching(election.registrationDeadline || '') && (
                      <AlertCircle className="mr-1 h-4 w-4" />
                    )}
                    {election.registrationDeadline}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Early Voting:</span>
                  <span className="font-medium">
                    {election.earlyVotingStart} - {election.earlyVotingEnd}
                  </span>
                </div>
              </div>
              
              {election.electionOfficeUrl && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <a 
                    href={election.electionOfficeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-civic-blue hover:text-blue-800 text-sm font-medium flex items-center"
                  >
                    <ExternalLink className="mr-1 h-4 w-4" />
                    {election.type === "national" ? "Election Office" : "Find Polling Location"}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredElections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No elections found for the selected filter.</p>
          </div>
        )}

        {/* Voter Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-civic-blue mb-3 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Important Voter Information
          </h4>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div>
              <h5 className="font-medium mb-2">Registration</h5>
              <p className="text-gray-600">Register online, by mail, or in person at your local election office.</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Voter ID</h5>
              <p className="text-gray-600">Check your state's voter ID requirements before heading to the polls.</p>
            </div>
            <div>
              <h5 className="font-medium mb-2">Absentee Voting</h5>
              <p className="text-gray-600">Request an absentee ballot if you cannot vote in person on election day.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
