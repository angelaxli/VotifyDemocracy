import { apiRequest } from "./queryClient";

export interface RepresentativeSearchResponse {
  jurisdiction: string;
  representatives: any[];
  formattedAddress: string;
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
