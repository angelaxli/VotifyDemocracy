import { 
  users, 
  representatives, 
  candidates, 
  elections, 
  addressSearches,
  type User, 
  type InsertUser,
  type Representative,
  type InsertRepresentative,
  type Candidate,
  type InsertCandidate,
  type Election,
  type InsertElection,
  type AddressSearch,
  type InsertAddressSearch,
} from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getRepresentativesByJurisdiction(jurisdiction: string): Promise<Representative[]>;
  createRepresentative(representative: InsertRepresentative): Promise<Representative>;
  
  getCandidatesByRaceType(raceType: string): Promise<Candidate[]>;
  createCandidate(candidate: InsertCandidate): Promise<Candidate>;
  
  getElectionsByJurisdiction(jurisdiction: string): Promise<Election[]>;
  createElection(election: InsertElection): Promise<Election>;
  
  createAddressSearch(search: InsertAddressSearch): Promise<AddressSearch>;
  getRecentAddressSearches(): Promise<AddressSearch[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private representatives: Map<number, Representative>;
  private candidates: Map<number, Candidate>;
  private elections: Map<number, Election>;
  private addressSearches: Map<number, AddressSearch>;
  private currentUserId: number;
  private currentRepId: number;
  private currentCandidateId: number;
  private currentElectionId: number;
  private currentSearchId: number;

  constructor() {
    this.users = new Map();
    this.representatives = new Map();
    this.candidates = new Map();
    this.elections = new Map();
    this.addressSearches = new Map();
    this.currentUserId = 1;
    this.currentRepId = 1;
    this.currentCandidateId = 1;
    this.currentElectionId = 1;
    this.currentSearchId = 1;
    
    this.seedData();
  }

  private seedData() {
    // Seed some initial data for demonstration
    const sampleReps: InsertRepresentative[] = [
      {
        name: "Sen. Dianne Feinstein",
        office: "U.S. Senate",
        party: "Democrat",
        phone: "(202) 224-3841",
        email: "senator@feinstein.senate.gov",
        website: "https://feinstein.senate.gov",
        photoUrl: null,
        address: "331 Hart Senate Office Building, Washington, DC 20510",
        jurisdiction: "san francisco, ca",
        level: "federal",
        stances: {
          "Climate Change": "Supports comprehensive climate action including renewable energy initiatives and emissions reduction targets.",
          "Gun Policies": "Strong advocate for gun safety measures including universal background checks and assault weapons ban.",
          "Healthcare": "Supports strengthening the Affordable Care Act and reducing prescription drug costs."
        },
        recentBills: [
          {
            title: "Infrastructure Investment Act",
            position: "Supported",
            description: "Voted in favor of the $1.2 trillion infrastructure package for roads, bridges, and clean energy."
          },
          {
            title: "Voting Rights Advancement Act",
            position: "Supported", 
            description: "Co-sponsored legislation to restore and strengthen voting rights protections."
          }
        ]
      }
    ];

    sampleReps.forEach(rep => {
      const id = this.currentRepId++;
      this.representatives.set(id, { ...rep, id });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getRepresentativesByJurisdiction(jurisdiction: string): Promise<Representative[]> {
    return Array.from(this.representatives.values()).filter(
      rep => rep.jurisdiction.toLowerCase() === jurisdiction.toLowerCase()
    );
  }

  async createRepresentative(insertRep: InsertRepresentative): Promise<Representative> {
    const id = this.currentRepId++;
    const representative: Representative = { ...insertRep, id };
    this.representatives.set(id, representative);
    return representative;
  }

  async getCandidatesByRaceType(raceType: string): Promise<Candidate[]> {
    return Array.from(this.candidates.values()).filter(
      candidate => candidate.raceType === raceType
    );
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const id = this.currentCandidateId++;
    const candidate: Candidate = { ...insertCandidate, id };
    this.candidates.set(id, candidate);
    return candidate;
  }

  async getElectionsByJurisdiction(jurisdiction: string): Promise<Election[]> {
    return Array.from(this.elections.values()).filter(
      election => election.jurisdiction.toLowerCase() === jurisdiction.toLowerCase()
    );
  }

  async createElection(insertElection: InsertElection): Promise<Election> {
    const id = this.currentElectionId++;
    const election: Election = { ...insertElection, id };
    this.elections.set(id, election);
    return election;
  }

  async createAddressSearch(insertSearch: InsertAddressSearch): Promise<AddressSearch> {
    const id = this.currentSearchId++;
    const search: AddressSearch = { 
      ...insertSearch, 
      id,
      createdAt: new Date()
    };
    this.addressSearches.set(id, search);
    return search;
  }

  async getRecentAddressSearches(): Promise<AddressSearch[]> {
    return Array.from(this.addressSearches.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, 10);
  }
}

export const storage = new MemStorage();
