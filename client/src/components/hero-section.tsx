import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-civic-blue to-civic-light py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 text-black">Know Your Representatives</h2>
        <p className="text-xl md:text-2xl mb-8 text-black">Because Democracy Isn't a Guessing Game</p>
        <p className="text-lg mb-12 max-w-2xl mx-auto text-black">
          Find your elected officials, track upcoming elections, and compare candidates with trusted, 
          non-partisan information at your fingertips.
        </p>
        
        <div className="flex justify-center">
          <Link href="/find-reps">
            <Button className="bg-civic-blue hover:bg-blue-800 text-white font-semibold py-3 px-8 text-lg">
              Find My Representatives
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
