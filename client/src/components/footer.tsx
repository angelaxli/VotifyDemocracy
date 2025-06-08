export default function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="about" className="bg-civic-gray text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Votify</h3>
            <p className="text-gray-300 text-sm mb-4">
              Because Democracy Isn't a Guessing Game
            </p>
            <p className="text-gray-400 text-xs">
              Providing non-partisan information to empower informed civic engagement.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <button 
                  onClick={() => scrollToSection('find-reps')}
                  className="hover:text-white transition-colors text-left"
                >
                  Find Representatives
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('elections')}
                  className="hover:text-white transition-colors text-left"
                >
                  Election Information
                </button>
              </li>
              <li>
                <button 
                  onClick={() => scrollToSection('compare')}
                  className="hover:text-white transition-colors text-left"
                >
                  Compare Candidates
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Voter Registration</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Election Calendar</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Officials</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">About</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">Our Mission</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Votify. All rights reserved. | Data provided by Google Civic Information API
          </p>
        </div>
      </div>
    </footer>
  );
}
