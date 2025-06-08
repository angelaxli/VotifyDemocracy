import { apiRequest } from "./queryClient";
import type { Representative } from "@shared/schema";

export interface RepresentativeSearchResponse {
  federal: Representative[];
  state: Representative[];
  local: Representative[];
  formattedAddress: string;
  jurisdiction: string;
}

export const searchRepresentatives = async (address: string): Promise<RepresentativeSearchResponse> => {
  const response = await apiRequest("POST", "/api/representatives/search", { address });
  return await response.json();
};

export const getCandidates = async (raceType: "local" | "national") => {
  const response = await apiRequest("GET", `/api/candidates/${raceType}`);
  return await response.json();
};

export const getElections = async (jurisdiction: string) => {
  const response = await apiRequest("GET", `/api/elections/${encodeURIComponent(jurisdiction)}`);
  return await response.json();
};

export const getRecentSearches = async () => {
  const response = await apiRequest("GET", "/api/searches/recent");
  return await response.json();
};

export const getElections = async () => {
  const response = await apiRequest("GET", "/api/elections");
  return await response.json();
};

export const getVoterInfo = async (address: string, electionId?: string) => {
  const response = await apiRequest("POST", "/api/voterinfo", { address, electionId });
  return await response.json();
};
