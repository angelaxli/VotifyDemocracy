import { UserCheck, Scale, Calendar } from "lucide-react";
import { Link } from "wouter";

export default function PreviewCards() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-civic-gray mb-4">Everything You Need to Stay Informed</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Access comprehensive information about your representatives, upcoming elections, and candidate comparisons
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Link href="/find-reps" className="block">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-civic-blue text-4xl mb-4">
                <UserCheck className="h-12 w-12" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Representative Profiles</h4>
              <p className="text-gray-600 mb-4">
                Discover your current elected officials with detailed profiles, contact information, 
                and their positions on key issues.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Contact information
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Voting record
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Issue positions
                </li>
              </ul>
            </div>
          </Link>

          <Link href="/compare" className="block">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-civic-blue text-4xl mb-4">
                <Scale className="h-12 w-12" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Candidate Comparison</h4>
              <p className="text-gray-600 mb-4">
                Compare candidates side-by-side with detailed information about their backgrounds, 
                positions, and policy proposals.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Side-by-side analysis
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Policy positions
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Background info
                </li>
              </ul>
            </div>
          </Link>

          <Link href="/elections" className="block">
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-civic-blue text-4xl mb-4">
                <Calendar className="h-12 w-12" />
              </div>
              <h4 className="text-xl font-semibold mb-3">Election Information</h4>
              <p className="text-gray-600 mb-4">
                Stay informed about upcoming elections, registration deadlines, and early voting 
                dates in your area.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Election calendar
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Registration info
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Voting locations
                </li>
              </ul>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
