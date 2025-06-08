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

    // San Jose California Special Runoff Election Candidates
    const sampleCandidates: InsertCandidate[] = [
      {
        name: "Anthony Tordillos",
        office: "San Jose City Council District 3",
        raceType: "local",
        party: "Democratic",
        phone: null,
        email: "info@anthonyforsanjose.com",
        website: "https://anthonyforsanjose.com",
        photoUrl: null,
        age: null,
        background: "Planning Commission Chair with extensive experience in urban planning and community development",
        positions: {
          "Affordable Housing & Homelessness": "Support housing at all income levels, cut bureaucracy, expand cost-effective shelters, strengthen tenant protections, invest in prevention programs",
          "Public Safety & Neighborhoods": "Fully staff police department, expand alternative response programs, invest in youth services, use technology for road safety, empower neighborhoods",
          "Downtown & Economic Vitality": "Streamline downtown housing, support new businesses, improve walkability, enforce codes against blight, support arts organizations",
          "Sustainability & Transit": "Support improved public transit and BART delivery, promote transit-oriented development, expand bike lanes, require sustainable building practices",
          "Transparent & Accountable City Hall": "Advocate for publicly financed elections, end revolving door with lobbyists, reform community outreach, restore remote participation",
          "Abortion": "In favor",
          "LGBTQ+": "In favor", 
          "Climate Change": "Advocates sustainable urban development, promotes housing density near transit, supports bike infrastructure and walkable neighborhoods",
          "Immigration": "In favor"
        },
        recentActions: [
          { title: "Sustainable Development Initiative", position: "Supported", description: "Promoted higher housing density near transit hubs to reduce car dependency" },
          { title: "Community Safety Programs", position: "Supported", description: "Advocated for alternative response programs and youth services investment" },
          { title: "Tenant Protection Measures", position: "Supported", description: "Pushed for stronger protections against illegal evictions and rent hikes" }
        ]
      },
      {
        name: "Gabby Chavez Lopez",
        office: "San Jose City Council District 3", 
        raceType: "local",
        party: "Democratic",
        phone: null,
        email: "gabby@gabbychavezlopez.com",
        website: "https://gabbychavezlopez.com",
        photoUrl: null,
        age: null,
        background: "Executive Director of the Latina Coalition of Silicon Valley with extensive community organizing and advocacy experience",
        positions: {
          "Public Safety and Beautify Neighborhoods": "Expand community policing and foot patrols, utilize technology for law enforcement, maintain safe public spaces, enhance cleanliness programs",
          "Address Homelessness": "Invest in transitional housing with mental health support, promote balanced housing mix, streamline permitting, protect residents from displacement",
          "Support Small Businesses": "Simplify permitting and reduce fees, offer tax incentives and grants, partner with institutions for workforce training",
          "Community Spaces and Cultural Engagement": "Develop parks and cultural centers, encourage arts and festivals, promote balanced development for revenue generation",
          "Sustainable and Innovative Transportation": "Improve bus and light rail reliability, expand bike lanes and EV charging, explore smart transportation solutions",
          "Abortion": "In favor",
          "LGBTQ+": "In favor",
          "Climate Change": "Supports small business growth, streamlined housing development, and sustainable infrastructure investment",
          "Homelessness": "Opposes punitive measures, advocates compassionate prevention-based solutions, prioritizes permanent supportive housing over temporary shelters",
          "Immigration": "In favor"
        },
        recentActions: [
          { title: "Community Investment Program", position: "Supported", description: "Developed partnerships to provide workforce training and business support" },
          { title: "Sustainable Transportation Initiative", position: "Supported", description: "Advocated for improved public transit reliability and green transportation options" },
          { title: "Anti-Displacement Measures", position: "Supported", description: "Promoted smart development and adaptive reuse to protect long-term residents" }
        ]
      }
    ];

    sampleCandidates.forEach(candidate => {
      const id = this.currentCandidateId++;
      this.candidates.set(id, { ...candidate, id });
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