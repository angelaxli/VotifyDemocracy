import { X, Phone, Mail, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Representative } from "@shared/schema";

interface RepresentativeDetailProps {
  representative: Representative;
  onClose: () => void;
}

export default function RepresentativeDetail({ representative, onClose }: RepresentativeDetailProps) {
  const getPositionBadgeColor = (position: string) => {
    if (position.toLowerCase().includes('support')) return 'bg-green-100 text-green-800';
    if (position.toLowerCase().includes('oppos')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-civic-gray">Representative Details</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Profile Info */}
            <div className="md:col-span-1">
              <div className="bg-gradient-to-br from-civic-blue to-civic-light h-64 rounded-xl flex items-center justify-center mb-6">
                <div className="text-white text-8xl">
                  <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              </div>
              
              <h4 className="text-2xl font-bold mb-2">{representative.name}</h4>
              <p className="text-gray-600 mb-1">{representative.office}</p>
              <p className="text-gray-500 text-sm mb-4">{representative.party}</p>
              
              <div className="space-y-3">
                {representative.phone && (
                  <a 
                    href={`tel:${representative.phone}`} 
                    className="flex items-center text-civic-blue hover:text-blue-800 transition-colors"
                  >
                    <Phone className="mr-3 h-4 w-4" />
                    {representative.phone}
                  </a>
                )}
                {representative.email && (
                  <a 
                    href={`mailto:${representative.email}`} 
                    className="flex items-center text-civic-blue hover:text-blue-800 transition-colors"
                  >
                    <Mail className="mr-3 h-4 w-4" />
                    Send Email
                  </a>
                )}
                {representative.website && (
                  <a 
                    href={representative.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-civic-blue hover:text-blue-800 transition-colors"
                  >
                    <ExternalLink className="mr-3 h-4 w-4" />
                    Official Website
                  </a>
                )}
              </div>
            </div>

            {/* Detailed Info */}
            <div className="md:col-span-2">
              {/* Issue Positions */}
              {representative.stances && Object.keys(representative.stances).length > 0 && (
                <div className="mb-8">
                  <h5 className="text-xl font-semibold mb-4">Positions on Key Issues</h5>
                  <div className="space-y-4">
                    {Object.entries(representative.stances).map(([issue, stance]) => (
                      <div key={issue} className="border border-gray-200 rounded-lg p-4">
                        <h6 className="font-medium mb-2">{issue}</h6>
                        <p className="text-sm text-gray-600">{stance}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Bills */}
              {representative.recentBills && representative.recentBills.length > 0 && (
                <div>
                  <h5 className="text-xl font-semibold mb-4">Recent Legislative Activity</h5>
                  <div className="space-y-4">
                    {representative.recentBills.map((bill, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-medium">{bill.title}</h6>
                          <Badge className={getPositionBadgeColor(bill.position)}>
                            {bill.position}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{bill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!representative.stances || Object.keys(representative.stances).length === 0) && 
               (!representative.recentBills || representative.recentBills.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Detailed position information is not available for this representative.</p>
                  <p className="text-sm text-gray-400 mt-2">Contact them directly for more information about their positions and recent activities.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
