import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <div className="flex items-center cursor-pointer">
              <h1 className="text-2xl font-bold text-civic-blue">Votify</h1>
              <span className="ml-3 text-sm text-gray-600 hidden sm:block">
                Because Democracy Isn't a Guessing Game
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link href="/find-reps">
              <button className={`text-gray-700 hover:text-civic-blue transition-colors ${location === '/find-reps' ? 'text-civic-blue font-medium' : ''}`}>
                Find Reps
              </button>
            </Link>
            <Link href="/elections">
              <button className={`text-gray-700 hover:text-civic-blue transition-colors ${location === '/elections' ? 'text-civic-blue font-medium' : ''}`}>
                Elections
              </button>
            </Link>
            <Link href="/compare">
              <button className={`text-gray-700 hover:text-civic-blue transition-colors ${location === '/compare' ? 'text-civic-blue font-medium' : ''}`}>
                Compare
              </button>
            </Link>
          </nav>
          
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>
        
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link href="/find-reps">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-gray-700 hover:text-civic-blue transition-colors text-left ${location === '/find-reps' ? 'text-civic-blue font-medium' : ''}`}
                >
                  Find Reps
                </button>
              </Link>
              <Link href="/elections">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-gray-700 hover:text-civic-blue transition-colors text-left ${location === '/elections' ? 'text-civic-blue font-medium' : ''}`}
                >
                  Elections
                </button>
              </Link>
              <Link href="/compare">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-gray-700 hover:text-civic-blue transition-colors text-left ${location === '/compare' ? 'text-civic-blue font-medium' : ''}`}
                >
                  Compare
                </button>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
