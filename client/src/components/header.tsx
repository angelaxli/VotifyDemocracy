import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-civic-blue">Votify</h1>
            <span className="ml-3 text-sm text-gray-600 hidden sm:block">
              Because Democracy Isn't a Guessing Game
            </span>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <button 
              onClick={() => scrollToSection('find-reps')}
              className="text-gray-700 hover:text-civic-blue transition-colors"
            >
              Find Reps
            </button>
            <button 
              onClick={() => scrollToSection('elections')}
              className="text-gray-700 hover:text-civic-blue transition-colors"
            >
              Elections
            </button>
            <button 
              onClick={() => scrollToSection('compare')}
              className="text-gray-700 hover:text-civic-blue transition-colors"
            >
              Compare
            </button>
            <button 
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-civic-blue transition-colors"
            >
              About
            </button>
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
              <button 
                onClick={() => scrollToSection('find-reps')}
                className="text-gray-700 hover:text-civic-blue transition-colors text-left"
              >
                Find Reps
              </button>
              <button 
                onClick={() => scrollToSection('elections')}
                className="text-gray-700 hover:text-civic-blue transition-colors text-left"
              >
                Elections
              </button>
              <button 
                onClick={() => scrollToSection('compare')}
                className="text-gray-700 hover:text-civic-blue transition-colors text-left"
              >
                Compare
              </button>
              <button 
                onClick={() => scrollToSection('about')}
                className="text-gray-700 hover:text-civic-blue transition-colors text-left"
              >
                About
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
