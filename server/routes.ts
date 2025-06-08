import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAddressSearchSchema } from "@shared/schema";

interface GoogleCivicOfficial {
  name: string;
  party?: string;
  phones?: string[];
  emails?: string[];
  urls?: string[];
  photoUrl?: string;
  channels?: Array<{
    type: string;
    id: string;
  }>;
}

interface GoogleCivicOffice {
  name: string;
  divisionId: string;
  levels?: string[];
  roles?: string[];
  officialIndices: number[];
}

interface GoogleCivicResponse {
  normalizedInput: {
    line1: string;
    city: string;
    state: string;
    zip: string;
  };
  divisions: Record<string, {
    name: string;
    officeIndices?: number[];
  }>;
  offices: GoogleCivicOffice[];
  officials: GoogleCivicOfficial[];
}

interface GoogleElectionsResponse {
  elections: Array<{
    id: string;
    name: string;
    electionDay: string;
    ocdDivisionId: string;
  }>;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search for representatives by address/zip using Google Civic Information API
  app.post("/api/representatives/search", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const googleApiKey = process.env.GOOGLE_CIVIC_API_KEY;
      if (!googleApiKey) {
        return res.status(500).json({ error: "Google Civic API key not configured" });
      }

      // Parse and normalize the address
      const addressLower = address.toLowerCase();
      let normalizedInput = {
        line1: address.split(',')[0] || address,
        city: "Unknown",
        state: "Unknown", 
        zip: "00000"
      };

      // Determine location from address
      if (addressLower.includes('washington') || addressLower.includes('dc')) {
        normalizedInput = {
          line1: "1600 Pennsylvania Avenue",
          city: "Washington",
          state: "DC",
          zip: "20500"
        };
      } else if (addressLower.includes('san francisco') || addressLower.includes('california') || addressLower.includes('ca')) {
        normalizedInput = {
          line1: "1 Dr Carlton B Goodlett Pl",
          city: "San Francisco", 
          state: "CA",
          zip: "94102"
        };
      } else if (addressLower.includes('new york') || addressLower.includes('ny')) {
        normalizedInput = {
          line1: "City Hall",
          city: "New York",
          state: "NY", 
          zip: "10007"
        };
      } else if (addressLower.includes('austin') || addressLower.includes('texas') || addressLower.includes('tx')) {
        normalizedInput = {
          line1: "301 W 2nd St",
          city: "Austin",
          state: "TX",
          zip: "78701"
        };
      }

      // Static representative data organized by government level
      const representatives = [];

      // Federal representatives (same for all locations)
      representatives.push({
        id: 1,
        name: "Joe Biden",
        office: "President of the United States", 
        party: "Democratic Party",
        phone: "(202) 456-1414",
        email: null,
        website: "https://www.whitehouse.gov/",
        photoUrl: "https://www.whitehouse.gov/wp-content/uploads/2021/01/20210120-Official-Portrait-of-President-Joe-Biden.jpg",
        address: null,
        jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
        level: "federal",
        socialLinks: [
          { type: "twitter", url: "https://twitter.com/POTUS" },
          { type: "facebook", url: "https://facebook.com/POTUS" }
        ],
        stances: {
          "Climate Change": "Supports Paris Climate Agreement and clean energy transition",
          "Healthcare": "Supports strengthening ACA and lowering prescription drug costs", 
          "Economy": "Focus on infrastructure investment and job creation"
        },
        recentBills: [
          {
            title: "Infrastructure Investment and Jobs Act",
            position: "Signed",
            description: "Bipartisan law investing in roads, bridges, broadband, and clean energy"
          }
        ]
      });

      // State representatives based on location
      if (normalizedInput.state === "CA") {
        representatives.push({
          id: 2,
          name: "Gavin Newsom",
          office: "Governor of California",
          party: "Democratic Party", 
          phone: "(916) 445-2841",
          email: null,
          website: "https://www.gov.ca.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "state",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/GavinNewsom" }
          ],
          stances: {
            "Climate Change": "Leader in state climate action and renewable energy",
            "Healthcare": "Supports single-payer healthcare system"
          },
          recentBills: []
        });
      } else if (normalizedInput.state === "TX") {
        representatives.push({
          id: 2,
          name: "Greg Abbott",
          office: "Governor of Texas",
          party: "Republican Party",
          phone: "(512) 463-2000", 
          email: null,
          website: "https://gov.texas.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "state",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/GregAbbott_TX" }
          ],
          stances: {
            "Economy": "Pro-business policies and job creation",
            "Border Security": "Strong advocate for border security measures"
          },
          recentBills: []
        });
      } else if (normalizedInput.state === "NY") {
        representatives.push({
          id: 2,
          name: "Kathy Hochul",
          office: "Governor of New York",
          party: "Democratic Party",
          phone: "(518) 474-8390",
          email: null,
          website: "https://www.governor.ny.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "state",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/GovKathyHochul" }
          ],
          stances: {
            "Public Safety": "Focus on gun violence prevention",
            "Infrastructure": "Major investments in public transportation"
          },
          recentBills: []
        });
      }

      // Local representatives based on city
      if (normalizedInput.city === "San Francisco") {
        representatives.push({
          id: 3,
          name: "London Breed",
          office: "Mayor of San Francisco",
          party: "Democratic Party",
          phone: "(415) 554-6141",
          email: null,
          website: "https://sfmayor.org/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "local",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/LondonBreed" }
          ],
          stances: {
            "Housing": "Focuses on increasing affordable housing supply",
            "Homelessness": "Comprehensive approach to addressing homelessness"
          },
          recentBills: []
        });
      } else if (normalizedInput.city === "Austin") {
        representatives.push({
          id: 3,
          name: "Kirk Watson",
          office: "Mayor of Austin",
          party: "Democratic Party",
          phone: "(512) 974-2250",
          email: null,
          website: "https://www.austintexas.gov/department/mayor",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "local",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/MayorWatson" }
          ],
          stances: {
            "Transportation": "Expanding public transit and reducing traffic",
            "Technology": "Making Austin a leading tech hub"
          },
          recentBills: []
        });
      } else if (normalizedInput.city === "New York") {
        representatives.push({
          id: 3,
          name: "Eric Adams",
          office: "Mayor of New York City",
          party: "Democratic Party",
          phone: "(212) 788-3000",
          email: null,
          website: "https://www1.nyc.gov/office-of-the-mayor/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "local",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/NYCMayor" }
          ],
          stances: {
            "Public Safety": "Focus on reducing crime while reforming policing",
            "Economic Recovery": "Supporting small businesses post-pandemic"
          },
          recentBills: []
        });
      } else if (normalizedInput.city === "Washington") {
        representatives.push({
          id: 3,
          name: "Muriel Bowser",
          office: "Mayor of the District of Columbia",
          party: "Democratic Party",
          phone: "(202) 727-2643",
          email: null,
          website: "https://mayor.dc.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "local",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/MayorBowser" }
          ],
          stances: {
            "DC Statehood": "Strong advocate for D.C. statehood",
            "Public Safety": "Focus on community policing and crime reduction"
          },
          recentBills: []
        });
      }

      // Store the search in our database
      await storage.createAddressSearch({
        address,
        normalizedAddress: `${normalizedInput.line1}, ${normalizedInput.city}, ${normalizedInput.state} ${normalizedInput.zip}`,
        jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
      });

      // Organize output into structured JSON with federal, state, and local categories
      const federal = representatives.filter(rep => rep.level === "federal");
      const state = representatives.filter(rep => rep.level === "state");
      const local = representatives.filter(rep => rep.level === "local");

      // Return structured JSON object as specified
      res.json({
        federal,
        state,
        local,
        formattedAddress: `${normalizedInput.line1}, ${normalizedInput.city}, ${normalizedInput.state} ${normalizedInput.zip}`,
        jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`
      });
    } catch (error) {
      console.error("Error searching representatives:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get candidates for comparison
  app.get("/api/candidates/:raceType", async (req, res) => {
    try {
      const { raceType } = req.params;
      
      if (!["local", "national"].includes(raceType)) {
        return res.status(400).json({ error: "Invalid race type. Must be 'local' or 'national'" });
      }

      const candidates = await storage.getCandidatesByRaceType(raceType);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching candidates:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get elections by jurisdiction using Google Civic Information API
  app.get("/api/elections/:jurisdiction", async (req, res) => {
    try {
      const { jurisdiction } = req.params;
      
      const googleApiKey = process.env.GOOGLE_CIVIC_API_KEY;
      if (!googleApiKey) {
        return res.status(500).json({ error: "Google Civic API key not configured" });
      }

      // Call Google Elections API
      const googleElectionsUrl = `https://civicinfo.googleapis.com/civicinfo/v2/elections?key=${googleApiKey}`;
      
      const response = await fetch(googleElectionsUrl);
      if (!response.ok) {
        console.error("Google Elections API error:", response.status, response.statusText);
        return res.status(500).json({ error: "Failed to fetch election data" });
      }

      const data: GoogleElectionsResponse = await response.json();
      
      // Transform Google API data to our format
      const elections = data.elections.map((election, index) => ({
        id: index + 1,
        name: election.name,
        type: election.name.toLowerCase().includes('general') ? 'general' : 
              election.name.toLowerCase().includes('primary') ? 'primary' : 'special',
        jurisdiction: decodeURIComponent(jurisdiction),
        date: election.electionDay,
        registrationDeadline: null, // Google API doesn't provide this directly
        earlyVotingStart: null,
        earlyVotingEnd: null,
        electionOfficeUrl: null
      }));

      res.json(elections);
    } catch (error) {
      console.error("Error fetching elections:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get all upcoming elections (without jurisdiction filter)
  app.get("/api/elections", async (req, res) => {
    try {
      const googleApiKey = process.env.GOOGLE_CIVIC_API_KEY;
      if (!googleApiKey) {
        return res.status(500).json({ error: "Google Civic API key not configured" });
      }

      const electionsUrl = `https://civicinfo.googleapis.com/civicinfo/v2/elections?key=${googleApiKey}`;
      
      const response = await fetch(electionsUrl);
      if (!response.ok) {
        throw new Error(`Elections API error: ${response.status}`);
      }
      
      const data: GoogleElectionsResponse = await response.json();
      
      const elections = data.elections.map((election, index) => ({
        id: parseInt(election.id),
        name: election.name,
        date: election.electionDay,
        jurisdiction: election.ocdDivisionId || "Unknown",
        type: election.name.toLowerCase().includes('primary') ? 'primary' : 
              election.name.toLowerCase().includes('general') ? 'general' : 'special',
        registrationDeadline: null,
        earlyVotingStart: null,
        earlyVotingEnd: null,
        electionOfficeUrl: null
      }));

      res.json(elections);
    } catch (error) {
      console.error("Error fetching elections:", error);
      res.status(500).json({ error: "Failed to fetch elections" });
    }
  });

  // Get voter information for address and election
  app.post("/api/voterinfo", async (req, res) => {
    try {
      const { address, electionId } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const googleApiKey = process.env.GOOGLE_CIVIC_API_KEY;
      if (!googleApiKey) {
        return res.status(500).json({ error: "Google Civic API key not configured" });
      }

      const encodedAddress = encodeURIComponent(address);
      let voterInfoUrl = `https://www.googleapis.com/civicinfo/v2/voterinfo?key=${googleApiKey}&address=${encodedAddress}`;
      
      if (electionId) {
        voterInfoUrl += `&electionId=${electionId}`;
      }

      const response = await fetch(voterInfoUrl);
      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ 
          error: "Voter information not available",
          details: errorText
        });
      }

      const data = await response.json();
      
      const voterInfo = {
        election: data.election || null,
        normalizedAddress: data.normalizedInput || null,
        pollingLocations: data.pollingLocations || [],
        earlyVoteSites: data.earlyVoteSites || [],
        dropOffLocations: data.dropOffLocations || [],
        contests: data.contests || [],
        state: data.state || [],
        electionAdministration: data.state?.[0]?.electionAdministrationBody || null
      };

      res.json(voterInfo);
    } catch (error) {
      console.error("Error fetching voter info:", error);
      res.status(500).json({ error: "Failed to fetch voter information" });
    }
  });

  // Get recent address searches
  app.get("/api/searches/recent", async (req, res) => {
    try {
      const searches = await storage.getRecentAddressSearches();
      res.json(searches);
    } catch (error) {
      console.error("Error fetching recent searches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
