import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAddressSearchSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Search for representatives by address/zip
  app.post("/api/representatives/search", async (req, res) => {
    try {
      const { address } = req.body;
      
      if (!address) {
        return res.status(400).json({ error: "Address is required" });
      }

      // Store the search
      await storage.createAddressSearch({
        address,
        normalizedAddress: address.toLowerCase().trim(),
        jurisdiction: "san francisco, ca", // Default for demo
      });

      // For demo purposes, we'll use a simple jurisdiction mapping
      const jurisdiction = address.toLowerCase().includes("san francisco") || address.includes("94") 
        ? "san francisco, ca" 
        : "san francisco, ca"; // Default to SF for demo

      const representatives = await storage.getRepresentativesByJurisdiction(jurisdiction);
      
      // If no local data, we would call Google Civic Information API here
      // const civicApiKey = process.env.GOOGLE_CIVIC_API_KEY;
      // if (civicApiKey && representatives.length === 0) {
      //   // Call Google Civic Information API
      // }

      res.json({
        jurisdiction,
        representatives,
        formattedAddress: address
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

  // Get elections by jurisdiction
  app.get("/api/elections/:jurisdiction", async (req, res) => {
    try {
      const { jurisdiction } = req.params;
      const elections = await storage.getElectionsByJurisdiction(decodeURIComponent(jurisdiction));
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
