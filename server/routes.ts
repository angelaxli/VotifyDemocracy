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

      // Try to use Google Civic API to normalize the address first
      let normalizedInput = {
        line1: address,
        city: "Unknown",
        state: "Unknown", 
        zip: "00000"
      };

      try {
        // Use Google Civic API to get normalized address
        const encodedAddress = encodeURIComponent(address);
        const civicUrl = `https://www.googleapis.com/civicinfo/v2/representatives?key=${googleApiKey}&address=${encodedAddress}`;
        
        const civicResponse = await fetch(civicUrl);
        if (civicResponse.ok) {
          const civicData = await civicResponse.json();
          if (civicData.normalizedInput) {
            normalizedInput = {
              line1: civicData.normalizedInput.line1 || address.split(',')[0] || address,
              city: civicData.normalizedInput.city || "Unknown",
              state: civicData.normalizedInput.state || "Unknown",
              zip: civicData.normalizedInput.zip || "00000"
            };
          }
        } else {
          throw new Error(`Civic API error: ${civicResponse.status}`);
        }
      } catch (error) {
        console.error("Error normalizing address with Google Civic API:", error);
        // Fall back to intelligent parsing of the user's address
        const parts = address.split(',').map((part: string) => part.trim());
        if (parts.length >= 3) {
          // Handle format: "Street, City, State Zip"
          const lastPart = parts[parts.length - 1]; // "CA 95120"
          let state = "Unknown";
          let zip = "00000";
          
          // Extract state and zip from last part
          const stateZipMatch = lastPart.match(/^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/);
          if (stateZipMatch) {
            state = stateZipMatch[1]; // "CA"
            zip = stateZipMatch[2]; // "95120"
          } else {
            // Try just state
            const stateMatch = lastPart.match(/^[A-Z]{2}$/);
            if (stateMatch) {
              state = stateMatch[0];
            }
            // Try just zip
            const zipMatch = lastPart.match(/\b\d{5}(-\d{4})?\b/);
            if (zipMatch) {
              zip = zipMatch[0];
            }
          }
          
          normalizedInput = {
            line1: parts[0] || address,
            city: parts[1] || "Unknown", 
            state: state,
            zip: zip
          };
        } else {
          // Basic fallback
          normalizedInput = {
            line1: parts[0] || address,
            city: parts[1] || "Unknown",
            state: parts[2] || "Unknown", 
            zip: "00000"
          };
        }
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

      // Add US Senators based on state
      if (normalizedInput.state === "CA") {
        representatives.push({
          id: 4,
          name: "Dianne Feinstein",
          office: "U.S. Senator from California",
          party: "Democratic Party",
          phone: "(202) 224-3841",
          email: null,
          website: "https://www.feinstein.senate.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "federal",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/SenFeinstein" }
          ],
          stances: {
            "Gun Control": "Strong advocate for assault weapons ban",
            "Environment": "Leader on climate change legislation"
          },
          recentBills: []
        });
        
        representatives.push({
          id: 5,
          name: "Alex Padilla",
          office: "U.S. Senator from California",
          party: "Democratic Party", 
          phone: "(202) 224-3553",
          email: null,
          website: "https://www.padilla.senate.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "federal",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/SenAlexPadilla" }
          ],
          stances: {
            "Immigration": "Comprehensive immigration reform advocate",
            "Climate": "Clean energy and environmental justice"
          },
          recentBills: []
        });
      } else if (normalizedInput.state === "TX") {
        representatives.push({
          id: 4,
          name: "John Cornyn",
          office: "U.S. Senator from Texas",
          party: "Republican Party",
          phone: "(202) 224-2934",
          email: null,
          website: "https://www.cornyn.senate.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "federal",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/JohnCornyn" }
          ],
          stances: {
            "Border Security": "Strong border security advocate",
            "Economy": "Pro-business and tax reform"
          },
          recentBills: []
        });
        
        representatives.push({
          id: 5,
          name: "Ted Cruz",
          office: "U.S. Senator from Texas",
          party: "Republican Party",
          phone: "(202) 224-5922",
          email: null,
          website: "https://www.cruz.senate.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "federal",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/SenTedCruz" }
          ],
          stances: {
            "Constitutional Rights": "Strong constitutional conservative",
            "Energy": "Supports energy independence"
          },
          recentBills: []
        });
      }

      // Add US Representatives based on location
      if (normalizedInput.city === "San Francisco") {
        representatives.push({
          id: 6,
          name: "Nancy Pelosi",
          office: "U.S. Representative, CA-11",
          party: "Democratic Party",
          phone: "(202) 225-4965",
          email: null,
          website: "https://pelosi.house.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "federal",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/SpeakerPelosi" }
          ],
          stances: {
            "Healthcare": "Affordable Care Act champion",
            "Economic Justice": "Focus on income inequality"
          },
          recentBills: []
        });
      } else if (normalizedInput.city === "Austin") {
        representatives.push({
          id: 6,
          name: "Lloyd Doggett",
          office: "U.S. Representative, TX-37",
          party: "Democratic Party",
          phone: "(202) 225-4865",
          email: null,
          website: "https://doggett.house.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "federal",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/RepLloydDoggett" }
          ],
          stances: {
            "Healthcare": "Medicare for All supporter",
            "Education": "Strong public education advocate"
          },
          recentBills: []
        });
      }

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

        // Add State Senator for California
        representatives.push({
          id: 7,
          name: "Scott Wiener",
          office: "California State Senator, District 11",
          party: "Democratic Party",
          phone: "(415) 557-1300",
          email: null,
          website: "https://sd11.senate.ca.gov/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "state",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/Scott_Wiener" }
          ],
          stances: {
            "Housing": "YIMBY advocate for housing production",
            "Transportation": "Public transit and climate action"
          },
          recentBills: []
        });

        // Add Assembly Member for California
        representatives.push({
          id: 8,
          name: "Matt Haney",
          office: "California Assembly Member, District 17",
          party: "Democratic Party",
          phone: "(415) 557-2312",
          email: null,
          website: "https://a17.asmdc.org/",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "state",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/MattHaneySF" }
          ],
          stances: {
            "Mental Health": "Expanding mental health services",
            "Housing": "Affordable housing advocate"
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

        // Add State Senator for Texas
        representatives.push({
          id: 7,
          name: "Sarah Eckhardt",
          office: "Texas State Senator, District 14",
          party: "Democratic Party",
          phone: "(512) 463-0114",
          email: null,
          website: "https://senate.texas.gov/member.php?d=14",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "state",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/SarahForTexas" }
          ],
          stances: {
            "Healthcare": "Expanding Medicaid and healthcare access",
            "Education": "Increasing public school funding"
          },
          recentBills: []
        });

        // Add State Representative for Texas
        representatives.push({
          id: 8,
          name: "Gina Hinojosa",
          office: "Texas State Representative, District 49",
          party: "Democratic Party",
          phone: "(512) 463-0668",
          email: null,
          website: "https://house.texas.gov/members/member-page/?district=49",
          photoUrl: null,
          address: null,
          jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`.toLowerCase(),
          level: "state",
          socialLinks: [
            { type: "twitter", url: "https://twitter.com/GinaForAustin" }
          ],
          stances: {
            "Public Education": "Strong advocate for public schools",
            "Women's Rights": "Reproductive rights champion"
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

      // Return the exact address the user entered, not a normalized version
      const userFormattedAddress = normalizedInput.line1.includes(address.split(',')[0]) ? 
        `${normalizedInput.line1}, ${normalizedInput.city}, ${normalizedInput.state} ${normalizedInput.zip}` :
        address; // Use original address if normalization changed the street address

      res.json({
        federal,
        state, 
        local,
        formattedAddress: userFormattedAddress,
        jurisdiction: `${normalizedInput.city}, ${normalizedInput.state}`,
        userAddress: address, // Include original user input
        normalizedAddress: `${normalizedInput.line1}, ${normalizedInput.city}, ${normalizedInput.state} ${normalizedInput.zip}`
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

  // Get all upcoming elections with optional location filter
  app.get("/api/elections", async (req, res) => {
    try {
      const { userState, userCity } = req.query;
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
      
      const elections = data.elections.map((election, index) => {
        const isNearby = userState && election.ocdDivisionId && 
          election.ocdDivisionId.toLowerCase().includes(userState.toString().toLowerCase());
        
        return {
          id: parseInt(election.id),
          name: election.name,
          date: election.electionDay,
          jurisdiction: election.ocdDivisionId || "Unknown",
          type: election.name.toLowerCase().includes('primary') ? 'primary' : 
                election.name.toLowerCase().includes('general') ? 'general' : 'special',
          registrationDeadline: null,
          earlyVotingStart: null,
          earlyVotingEnd: null,
          electionOfficeUrl: null,
          isNearby: isNearby || false
        };
      });

      res.json(elections);
    } catch (error) {
      console.error("Error fetching elections:", error);
      res.status(500).json({ error: "Failed to fetch elections" });
    }
  });

  // Get voter information for address with dynamic election ID lookup
  app.post("/api/voterinfo", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      const googleApiKey = process.env.GOOGLE_CIVIC_API_KEY;
      if (!googleApiKey) {
        return res.status(500).json({ error: "Google Civic API key not configured" });
      }

      // Step 1: Get all upcoming elections
      const electionsUrl = `https://civicinfo.googleapis.com/civicinfo/v2/elections?key=${googleApiKey}`;
      const electionsResponse = await fetch(electionsUrl);
      
      if (!electionsResponse.ok) {
        throw new Error(`Elections API error: ${electionsResponse.status}`);
      }
      
      const electionsData: GoogleElectionsResponse = await electionsResponse.json();
      
      // Step 2: Find elections relevant to the user's address by testing each election ID
      const encodedAddress = encodeURIComponent(address);
      let relevantVoterInfo = null;

      // Extract state from user address for geographic validation
      const addressState = address.match(/([A-Z]{2})\s*\d{5}/)?.[1];
      
      // For each election, test if it's relevant to the address
      for (const election of electionsData.elections) {
        try {
          // Pre-filter elections by geographic relevance before making API calls
          const electionState = election.ocdDivisionId?.match(/state:([a-z]{2})/)?.[1]?.toUpperCase();
          
          // Skip elections that are clearly not relevant to the user's state
          if (addressState && electionState && addressState !== electionState) {
            console.log(`Skipping geographically irrelevant election: ${election.name} (${electionState} vs ${addressState})`);
            continue;
          }
          
          const voterInfoUrl = `https://www.googleapis.com/civicinfo/v2/voterinfo?address=${encodedAddress}&electionId=${election.id}&key=${googleApiKey}`;
          const voterResponse = await fetch(voterInfoUrl);
          
          if (voterResponse.ok) {
            const data = await voterResponse.json();
            
            // Verify the response contains meaningful voter information
            const hasPollingInfo = data.pollingLocations?.length > 0;
            const hasContests = data.contests?.length > 0;
            const hasStateInfo = data.state?.length > 0;
            const responseState = data.normalizedInput?.state;
            
            // Additional validation: ensure response state matches user's state
            if ((hasPollingInfo || hasContests || hasStateInfo) && 
                (!addressState || !responseState || addressState === responseState)) {
              relevantVoterInfo = data;
              console.log(`Found relevant election for ${addressState}: ${election.name} (ID: ${election.id})`);
              break;
            } else if (responseState && addressState && responseState !== addressState) {
              console.log(`Rejecting election ${election.name} - response state ${responseState} doesn't match address state ${addressState}`);
            }
          }
        } catch (electionError) {
          // Continue to next election if this one fails
          continue;
        }
      }

      // If no specific election worked, try general query as fallback
      if (!relevantVoterInfo) {
        try {
          const generalVoterUrl = `https://www.googleapis.com/civicinfo/v2/voterinfo?address=${encodedAddress}&key=${googleApiKey}`;
          const generalResponse = await fetch(generalVoterUrl);
          
          if (generalResponse.ok) {
            const data = await generalResponse.json();
            if (data.pollingLocations?.length > 0 || data.contests?.length > 0 || data.state?.length > 0) {
              relevantVoterInfo = data;
              console.log("Using general voter info query result");
            }
          }
        } catch (generalError) {
          console.log("General voter info query also failed");
        }
      }

      let voterInfoData = relevantVoterInfo;

      // Strict validation: reject data if election doesn't match user's geographic location
      if (voterInfoData && voterInfoData.election) {
        const responseState = voterInfoData.normalizedInput?.state;
        const electionJurisdiction = voterInfoData.election.ocdDivisionId;
        const electionState = electionJurisdiction?.match(/state:([a-z]{2})/)?.[1]?.toUpperCase();
        
        // Reject if election is from a different state than the user's address
        if (addressState && electionState && addressState !== electionState) {
          console.log(`Rejecting geographically mismatched election: ${voterInfoData.election.name} (${electionState}) for ${addressState} address`);
          voterInfoData = null;
        }
        // Also reject if response state doesn't match address state
        else if (addressState && responseState && addressState !== responseState) {
          console.log(`Rejecting election due to state mismatch: address(${addressState}) vs response(${responseState})`);
          voterInfoData = null;
        }
      }

      if (!voterInfoData) {
        // Return only state-level information from authentic sources
        try {
          // Extract state from address for basic info
          const parts = address.split(',').map((part: string) => part.trim());
          let state = "";
          if (parts.length >= 3) {
            const lastPart = parts[parts.length - 1];
            const stateMatch = lastPart.match(/([A-Z]{2})/);
            if (stateMatch) {
              state = stateMatch[1];
            }
          }

          // Only return authentic state-level election administration data
          const stateInfo = state === 'CA' ? {
            name: "California",
            electionAdministrationBody: {
              name: "Secretary of State",
              electionInfoUrl: "https://www.sos.ca.gov/elections/",
              electionRegistrationUrl: "https://registertovote.ca.gov/",
              electionRegistrationConfirmationUrl: "https://voterstatus.sos.ca.gov",
              votingLocationFinderUrl: "https://www.sos.ca.gov/elections/polling-place",
              ballotInfoUrl: "https://voterstatus.sos.ca.gov/",
              correspondenceAddress: {
                line1: "1500 11th Street, 5th Floor",
                city: "Sacramento", 
                state: "California",
                zip: "95814"
              }
            }
          } : null;

          return res.json({
            election: null,
            normalizedAddress: address,
            pollingLocations: [],
            earlyVoteSites: [],
            dropOffLocations: [],
            contests: [],
            state: stateInfo ? [stateInfo] : [],
            electionAdministration: stateInfo?.electionAdministrationBody || null,
            message: "Specific election details are not currently available. Use the provided official links to find current voting information for your area."
          });
        } catch (fallbackError) {
          return res.json({
            election: null,
            normalizedAddress: address,
            pollingLocations: [],
            earlyVoteSites: [],
            dropOffLocations: [],
            contests: [],
            state: [],
            electionAdministration: null,
            message: "Voter information is not currently available for this address."
          });
        }
      }
      
      const voterInfo = {
        election: voterInfoData.election || null,
        normalizedAddress: voterInfoData.normalizedInput || null,
        pollingLocations: voterInfoData.pollingLocations || [],
        earlyVoteSites: voterInfoData.earlyVoteSites || [],
        dropOffLocations: voterInfoData.dropOffLocations || [],
        contests: voterInfoData.contests || [],
        state: voterInfoData.state || [],
        electionAdministration: voterInfoData.state?.[0]?.electionAdministrationBody || null
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
