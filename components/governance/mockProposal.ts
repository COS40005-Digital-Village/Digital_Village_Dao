import { ProposalStatus } from "@/lib/governance/ProposalLifecycleUtils";

// This structure will be mirrored in the hook's ProposalDetailData interface
// For simplicity in this file, we'll use direct types.
interface MockProposalAction {
  targetAddress: string;
  functionSignature: string;
  arguments: string[];
}

interface MockComment {
  address: string;
  avatarFallback: string;
  content: string;
  timestamp: string;
  likes: number;
  isReply?: boolean;
}

export interface MockProposalDetailData {
  id: string; // Add ID to the data itself for easier access/verification
  metadata: {
    title: string;
    // id is also here, but having it at root of ProposalDetailData is useful
    status: ProposalStatus;
    creatorAddress: string;
    guild: string;
    votingDeadline: string;
    createdAt: string;
    executedAt?: string;
  };
  descriptionHtml: string;
  actions: MockProposalAction[];
  // Consolidating voting-related props as per PRD for the hook
  voting: {
    isVotingOpen: boolean;
    hasVoted: boolean; // Represents if the *mocked specific user* has voted
    userVoteChoice?: "approve" | "reject" | "abstain";
  };
  voteResults: {
    approveVotes: number;
    rejectVotes: number;
    abstainVotes: number;
    totalVotingPower?: number;
    quorumThreshold?: number;
  };
  comments: MockComment[];
  // Represents the connected wallet for this specific proposal data scenario
  // If undefined, UI should prompt to connect. If defined, UI assumes this user context.
  connectedWalletAddress?: string; 
}

export const mockProposalDatabase: Record<string, MockProposalDetailData> = {
  "PROP-001": {
    "id": "PROP-001",
    "metadata": {
      "title": "Community Grant Program Restructure",
      "status": "Pending" as ProposalStatus,
      "creatorAddress": "0xAlicePendingCreator...",
      "guild": "Grants Committee",
      "votingDeadline": "Sep 1, 2024, 12:00 UTC",
      "createdAt": "2024-08-01T10:00:00Z"
    },
    "descriptionHtml": "<p>Proposal to restructure the community grant program for enhanced transparency and efficiency. This is an initial draft for community feedback before formal voting commences.</p>",
    "actions": [],
    "voting": {
      "isVotingOpen": false,
      "hasVoted": false,
      "userVoteChoice": undefined // Changed from null
    },
    "voteResults": {
      "approveVotes": 0,
      "rejectVotes": 0,
      "abstainVotes": 0,
      "totalVotingPower": 2500000,
      "quorumThreshold": 0.05
    },
    "comments": [
      {
        "address": "0xCommenterOne...",
        "avatarFallback": "C1",
        "content": "Looking forward to this, the current system needs an overhaul.",
        "timestamp": "1 day ago",
        "likes": 5
      }
    ],
    "connectedWalletAddress": undefined // changed from null
  },
  "PROP-002": {
    "id": "PROP-002",
    "metadata": {
      "title": "Implement Advanced Staking Tiers",
      "status": "Active" as ProposalStatus,
      "creatorAddress": "0xBobActiveCreator...",
      "guild": "Economics Guild",
      "votingDeadline": "Aug 25, 2024, 17:00 UTC",
      "createdAt": "2024-08-10T11:00:00Z"
    },
    "descriptionHtml": "<p>This proposal outlines a new tiered staking rewards system designed to incentivize long-term token holders and increase network security. Details of tiers, APY, and lock-up periods are attached.</p>",
    "actions": [
      {
        "targetAddress": "0xStakingContractV2...",
        "functionSignature": "setTiers(Tier[])",
        "arguments": ["TierDetailsObjectOrArray"]
      }
    ],
    "voting": {
      "isVotingOpen": true,
      "hasVoted": false,
      "userVoteChoice": undefined // Changed from null
    },
    "voteResults": {
      "approveVotes": 150,
      "rejectVotes": 25,
      "abstainVotes": 10,
      "totalVotingPower": 1800000,
      "quorumThreshold": 0.10
    },
    "comments": [],
    "connectedWalletAddress": "0xUserCanVote..."
  },
  "PROP-003": {
    "id": "PROP-003",
    "metadata": {
      "title": "Marketing Campaign Fund Allocation",
      "status": "Active" as ProposalStatus,
      "creatorAddress": "0xCarolMarketingLead...",
      "guild": "Marketing Guild",
      "votingDeadline": "Aug 28, 2024, 17:00 UTC",
      "createdAt": "2024-07-01T12:00:00Z"
    },
    "descriptionHtml": "<p>Requesting 75,000 DAI from the treasury to fund a targeted 3-month marketing campaign to expand user base in new geographical regions.</p>",
    "actions": [
      {
        "targetAddress": "0xTreasuryDAOContract...",
        "functionSignature": "transferTokens(address,uint256,address)",
        "arguments": ["0xMarketingMultiSig...", "75000000000000000000000", "0xDAITokenAddress..."]
      }
    ],
    "voting": {
      "isVotingOpen": true,
      "hasVoted": true,
      "userVoteChoice": "approve"
    },
    "voteResults": {
      "approveVotes": 300,
      "rejectVotes": 50,
      "abstainVotes": 15,
      "totalVotingPower": 2000000,
      "quorumThreshold": 0.15
    },
    "comments": [
       {
        "address": "0xSupportiveSam...",
        "avatarFallback": "SS",
        "content": "Great initiative! This will definitely help growth.",
        "timestamp": "6 hours ago",
        "likes": 12
      }
    ],
    "connectedWalletAddress": "0xUserHasVoted..."
  },
  "PROP-004": {
    "id": "PROP-004",
    "metadata": {
      "title": "Upgrade Protocol Core Logic Module X",
      "status": "Executed" as ProposalStatus,
      "creatorAddress": "0xDaveDevLead...",
      "guild": "Protocol Engineering",
      "votingDeadline": "Jul 15, 2024, 17:00 UTC",
      "createdAt": "2024-07-15T13:00:00Z",
      "executedAt": "Jul 16, 2024, 10:00 UTC"
    },
    "descriptionHtml": "<p>The proposal to upgrade Protocol Core Logic Module X for improved performance and security has been successfully executed.</p>",
    "actions": [
       {
        "targetAddress": "0xProtocolManager...",
        "functionSignature": "upgradeModule(bytes32,address)",
        "arguments": ["ModuleX_ID_Hash", "0xNewModuleXImplAddress..."]
      }
    ],
    "voting": {
      "isVotingOpen": false,
      "hasVoted": true,
      "userVoteChoice": "approve"
    },
    "voteResults": {
      "approveVotes": 600,
      "rejectVotes": 40,
      "abstainVotes": 20,
      "totalVotingPower": 1200000,
      "quorumThreshold": 0.20
    },
    "comments": [],
    "connectedWalletAddress": "0xGeneralUser..."
  },
  "PROP-005": {
    "id": "PROP-005",
    "metadata": {
      "title": "Partnership with ChainAnalytics Inc.",
      "status": "Failed" as ProposalStatus,
      "creatorAddress": "0xEveBizDev...",
      "guild": "Business Development",
      "votingDeadline": "Jul 10, 2024, 17:00 UTC",
      "createdAt": "2024-08-20T14:00:00Z"
    },
    "descriptionHtml": "<p>Proposal for a strategic partnership with ChainAnalytics Inc. to integrate their on-chain data tools. Failed to meet the required quorum.</p>",
    "actions": [
      {
        "targetAddress": "0xPartnershipRegistry...",
        "functionSignature": "registerPartnership(address,string)",
        "arguments": ["0xChainAnalyticsAddress...", "Data Integration Tier 2"]
      }
    ],
    "voting": {
      "isVotingOpen": false,
      "hasVoted": false,
      "userVoteChoice": undefined // Changed from null
    },
    "voteResults": {
      "approveVotes": 90,
      "rejectVotes": 30,
      "abstainVotes": 5,
      "totalVotingPower": 1500000,
      "quorumThreshold": 0.10 
    },
    "comments": [],
    "connectedWalletAddress": "0xGeneralUser..."
  },
  "PROP-006": {
    "id": "PROP-006",
    "metadata": {
      "title": "Adjust Treasury Fee Burn Mechanism",
      "status": "Cancelled" as ProposalStatus,
      "creatorAddress": "0xFrankFinance...",
      "guild": "Treasury Management",
      "votingDeadline": "Aug 5, 2024, 17:00 UTC",
      "createdAt": "2024-08-20T14:00:00Z"
    },
    "descriptionHtml": "<p>This proposal to adjust the treasury fee burn mechanism has been cancelled by the proposer due to discovery of a critical flaw in the proposed model. A revised proposal will be submitted later.</p>",
    "actions": [],
    "voting": {
      "isVotingOpen": false,
      "hasVoted": false,
      "userVoteChoice": undefined // changed from null
    },
    "voteResults": {
      "approveVotes": 0,
      "rejectVotes": 0,
      "abstainVotes": 0,
      "totalVotingPower": 0, 
      "quorumThreshold": 0.10
    },
    "comments": [],
    "connectedWalletAddress": undefined // changed from null
  },
  "PROP-007": {
    "id": "PROP-007",
    "metadata": {
      "title": "Research Grant for ZK-Rollup Integration Study",
      "status": "Active" as ProposalStatus,
      "creatorAddress": "0xGraceResearcher...",
      "guild": "Research & Development",
      "votingDeadline": "Sep 5, 2024, 12:00 UTC",
      "createdAt": "2024-08-01T10:00:00Z"
    },
    "descriptionHtml": "<p>Request for a research grant of 20,000 DAI to conduct a feasibility study on integrating ZK-Rollup technology for scalability improvements.</p>",
    "actions": [
       {
        "targetAddress": "0xTreasuryDAOContract...",
        "functionSignature": "approveGrant(address,uint256,string)",
        "arguments": ["0xGraceResearcher...", "20000000000000000000000", "ZK-Rollup Feasibility Study"]
      }
    ],
    "voting": {
      "isVotingOpen": true,
      "hasVoted": false,
      "userVoteChoice": undefined // changed from null
    },
    "voteResults": {
      "approveVotes": 50,
      "rejectVotes": 5,
      "abstainVotes": 2,
      "totalVotingPower": 1000000,
      "quorumThreshold": 0.05
    },
    "comments": [],
    "connectedWalletAddress": "0xUserCanVote..."
  },
  "PROP-008": {
    "id": "PROP-008",
    "metadata": {
      "title": "Update DAO Constitution - Section 3.B",
      "status": "Pending" as ProposalStatus,
      "creatorAddress": "0xHenryGovernance...",
      "guild": "Governance Council",
      "votingDeadline": "Sep 10, 2024, 12:00 UTC",
      "createdAt": "2024-08-01T10:00:00Z"
    },
    "descriptionHtml": "<p>Proposed amendment to Section 3.B of the DAO Constitution regarding conflict of interest declarations for council members. Seeking community review.</p>",
    "actions": [],
    "voting": {
      "isVotingOpen": false,
      "hasVoted": false,
      "userVoteChoice": undefined // changed from null
    },
    "voteResults": {
      "approveVotes": 0,
      "rejectVotes": 0,
      "abstainVotes": 0,
      "totalVotingPower": 3000000,
      "quorumThreshold": 0.10
    },
    "comments": [],
    "connectedWalletAddress": undefined // changed from null
  },
  "PROP-009": {
    "id": "PROP-009",
    "metadata": {
      "title": "Security Audit for New Lending Module",
      "status": "Executed" as ProposalStatus,
      "creatorAddress": "0xIvySecurity...",
      "guild": "Security Team",
      "votingDeadline": "Jun 20, 2024, 17:00 UTC",
      "executedAt": "Jun 25, 2024, 14:00 UTC",
      "createdAt": "2024-07-01T12:00:00Z"
    },
    "descriptionHtml": "<p>The proposal to engage TrailOfBits for a comprehensive security audit of the new lending module has been approved and the audit is complete. Report attached.</p>",
    "actions": [
      {
        "targetAddress": "0xTreasuryDAOContract...",
        "functionSignature": "payVendor(address,uint256,string)",
        "arguments": ["0xTrailOfBitsWallet...", "40000000000000000000000", "Security Audit Services"]
      }
    ],
    "voting": {
      "isVotingOpen": false,
      "hasVoted": true,
      "userVoteChoice": "approve"
    },
    "voteResults": {
      "approveVotes": 450,
      "rejectVotes": 10,
      "abstainVotes": 5,
      "totalVotingPower": 900000,
      "quorumThreshold": 0.15
    },
    "comments": [],
    "connectedWalletAddress": "0xGeneralUser..."
  },
  "PROP-010": {
    "id": "PROP-010",
    "metadata": {
      "title": "Launch Bug Bounty Program v2",
      "status": "Failed" as ProposalStatus,
      "creatorAddress": "0xJackBountyHunter...",
      "guild": "Community Security",
      "votingDeadline": "Jul 1, 2024, 17:00 UTC",
      "createdAt": "2024-08-20T14:00:00Z"
    },
    "descriptionHtml": "<p>Proposal to launch an enhanced Bug Bounty Program (v2) with increased rewards. This proposal failed due to concerns about the sustainability of the proposed reward pool.</p>",
    "actions": [],
    "voting": {
      "isVotingOpen": false,
      "hasVoted": false,
      "userVoteChoice": undefined // changed from null
    },
    "voteResults": {
      "approveVotes": 100,
      "rejectVotes": 120,
      "abstainVotes": 30,
      "totalVotingPower": 1100000,
      "quorumThreshold": 0.10
    },
    "comments": [],
    "connectedWalletAddress": "0xGeneralUser..."
  }
};
// Note: The old baseActions and baseComments are removed as the data above is now self-contained.
// Ensure MockProposalAction and MockComment types are still defined if needed elsewhere, or remove if not.
// For this consolidation, they were part of the old structure that is being replaced by the direct JSON-like data.
// Keeping the interfaces for MockProposalDetailData as it defines the structure of values in mockProposalDatabase. 