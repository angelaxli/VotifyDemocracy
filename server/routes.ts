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

      const googleApiKey = process.env.GOOGLE_API_KEY;
      if (!googleApiKey) {
        return res.status(500).json({ error: "Google API key not configured" });
      }

      // Call Google Civic Information API - correct endpoint
      const googleApiUrl = `https://www.googleapis.com/civicinfo/v2/representatives?key=${googleApiKey}&address=${encodeURIComponent(address)}`;
      
      const response = await fetch(googleApiUrl);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Google Civic API error:", response.status, response.statusText, errorText);
        return res.status(500).json({ error: "Failed to fetch representative data" });
      }

      const data: GoogleCivicResponse = await response.json();
      
      // Transform Google API data to our format
      const representatives = [];
      
      for (let i = 0; i < data.offices.length; i++) {
        const office = data.offices[i];
        
        for (const officialIndex of office.officialIndices) {
          const official = data.officials[officialIndex];
          
          if (official) {
            // Determine level (federal, state, local)
            let level = "local";
            if (office.levels?.includes("country")) {
              level = "federal";
            } else if (office.levels?.includes("administrativeArea1")) {
              level = "state";
            }

            // Build social media links from channels
            const socialLinks = official.channels?.map(channel => ({
              type: channel.type.toLowerCase(),
              url: channel.type.toLowerCase() === 'twitter' 
                ? `https://twitter.com/${channel.id}`
                : channel.type.toLowerCase() === 'facebook'
                ? `https://facebook.com/${channel.id}`
                : `https://${channel.type.toLowerCase()}.com/${channel.id}`
            })) || [];

            representatives.push({
              id: representatives.length + 1,
              name: official.name,
              office: office.name,
              party: official.party || null,
              phone: official.phones?.[0] || null,
              email: official.emails?.[0] || null,
              website: official.urls?.[0] || null,
              photoUrl: official.photoUrl || null,
              address: null,
              jurisdiction: `${data.normalizedInput.city}, ${data.normalizedInput.state}`.toLowerCase(),
              level,
              socialLinks,
              stances: {}, // We'll populate this with additional data or keep empty for Google API data
              recentBills: []
            });
          }
        }
      }

      // Store the search
      await storage.createAddressSearch({
        address,
        normalizedAddress: `${data.normalizedInput.line1}, ${data.normalizedInput.city}, ${data.normalizedInput.state} ${data.normalizedInput.zip}`,
        jurisdiction: `${data.normalizedInput.city}, ${data.normalizedInput.state}`.toLowerCase(),
      });

      res.json({
        jurisdiction: `${data.normalizedInput.city}, ${data.normalizedInput.state}`,
        representatives,
        formattedAddress: `${data.normalizedInput.line1}, ${data.normalizedInput.city}, ${data.normalizedInput.state} ${data.normalizedInput.zip}`
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
      
      const googleApiKey = process.env.GOOGLE_API_KEY;
      if (!googleApiKey) {
        return res.status(500).json({ error: "Google API key not configured" });
      }

      // Call Google Elections API
      const googleElectionsUrl = `https://www.googleapis.com/civicinfo/v2/elections?key=${googleApiKey}`;
      
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
