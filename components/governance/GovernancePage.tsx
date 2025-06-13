import * as React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockProposalDatabase, MockProposalDetailData } from './mockProposal'; // Import from mockProposal.ts
import { ProposalStatus, getProposalBadge } from "@/lib/governance/ProposalLifecycleUtils";
import { Plus } from 'lucide-react'; // Added Plus icon
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"; // Added Dialog components
import { Input } from "@/components/ui/input"; // Added Input
import { Textarea } from "@/components/ui/textarea"; // Added Textarea

const ALL_PROPOSAL_STATUSES: ProposalStatus[] = ["Pending", "Active", "Executed", "Failed", "Cancelled"];

// Order for sorting status groups
const STATUS_SORT_ORDER: ProposalStatus[] = ["Active", "Pending", "Executed", "Failed", "Cancelled"];

const MOCK_ADMIN_ADDRESS = "0xAdminMockAddress0000000000000000000"; // Mock admin for prototyping

interface GovernancePageProps {
  onViewProposal: (proposalId: string) => void;
}

// Helper function to get a comparable date for sorting
function getDateForSorting(metadata: MockProposalDetailData['metadata']): Date {
  if (metadata.status === "Executed" && metadata.executedAt) {
    return new Date(metadata.executedAt);
  }
  // Use votingDeadline for all other statuses or as a fallback
  return new Date(metadata.votingDeadline);
}

// Function to sort proposals based on PRD logic
function sortProposals(proposals: MockProposalDetailData[]): MockProposalDetailData[] {
  return [...proposals].sort((a, b) => {
    const statusAIndex = STATUS_SORT_ORDER.indexOf(a.metadata.status);
    const statusBIndex = STATUS_SORT_ORDER.indexOf(b.metadata.status);

    // Sort by status group first
    if (statusAIndex !== statusBIndex) {
      return statusAIndex - statusBIndex;
    }

    // If statuses are the same, sort by date
    const dateA = getDateForSorting(a.metadata);
    const dateB = getDateForSorting(b.metadata);

    // Sorting direction depends on status
    if (a.metadata.status === "Active" || a.metadata.status === "Pending") {
      return dateA.getTime() - dateB.getTime(); // Ascending for Active/Pending deadlines (earliest first)
    } else {
      return dateB.getTime() - dateA.getTime(); // Descending for Executed/Failed/Cancelled dates (most recent first)
    }
  });
}

export default function GovernancePage({ onViewProposal }: GovernancePageProps) {
  // State to hold the proposals, initialized from our single source of truth
  const [proposals, setProposals] = React.useState<MockProposalDetailData[]>(() => Object.values(mockProposalDatabase));
  const [selectedStatuses, setSelectedStatuses] = React.useState<ProposalStatus[]>(ALL_PROPOSAL_STATUSES); // Initially all selected

  // State for New Proposal Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [newProposalTitle, setNewProposalTitle] = React.useState("");
  const [newProposalDescription, setNewProposalDescription] = React.useState("");
  const [newProposalGuild, setNewProposalGuild] = React.useState("");
  const [newProposalDeadline, setNewProposalDeadline] = React.useState("");

  // Effect to update proposals if the underlying mockProposalDatabase changes.
  // This is a bit of a trick for reactivity with a mutable global object.
  // In a real app with a state manager or server data, this would be handled differently.
  React.useEffect(() => {
    // Re-fetch from the potentially mutated mockProposalDatabase when component mounts or updates that might need refresh.
    // For simplicity, we can make this dependent on something that changes when we expect a refresh,
    // or rely on the fact that navigating back will re-mount and re-initialize state.
    // For now, just initializing once is fine if direct mutation of mockProposalDatabase is reflected on next render cycle of this component.
    // To ensure it picks up changes when navigating back, we can re-set it.
    setProposals(Object.values(mockProposalDatabase));
  }, []); // Empty dependency array means this runs on mount. If navigating back re-mounts, it will get fresh data.

  const handleStatusChange = (status: ProposalStatus, checked: boolean | string) => {
    setSelectedStatuses(prev => 
      checked ? [...prev, status] : prev.filter(s => s !== status)
    );
  };

  const handleAddProposal = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newProposalTitle.trim() || !newProposalDeadline) {
      alert("Please fill in at least the title and voting deadline.");
      return;
    }

    const newProposalId = `PROP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const newProposalData: MockProposalDetailData = {
      id: newProposalId,
      metadata: {
        title: newProposalTitle.trim(),
        creatorAddress: MOCK_ADMIN_ADDRESS,
        guild: newProposalGuild.trim() || "General",
        status: "Pending",
        votingDeadline: new Date(newProposalDeadline).toISOString(),
        createdAt: new Date().toISOString(),
      },
      descriptionHtml: newProposalDescription.trim(), // Ideally, sanitize this if it's truly HTML
      actions: [], // Initialize actions as empty array
      voting: { // Initialize voting object
        isVotingOpen: false, // New pending proposals are not open for voting yet
        hasVoted: false,
        userVoteChoice: undefined,
      },
      voteResults: { // Initialize voteResults object
        approveVotes: 0,
        rejectVotes: 0,
        abstainVotes: 0,
        // totalVotingPower and quorumThreshold can be omitted or set to defaults if needed
      },
      comments: [], // Initialize comments as empty array
      connectedWalletAddress: undefined, // Default for new proposals
    };

    mockProposalDatabase[newProposalId] = newProposalData; // Add to our mock DB
    setProposals(Object.values(mockProposalDatabase)); // Update local state to reflect the addition

    // Reset form and close modal
    setNewProposalTitle("");
    setNewProposalDescription("");
    setNewProposalGuild("");
    setNewProposalDeadline("");
    setIsCreateModalOpen(false);
  };

  // Filter proposals first based on selected statuses
  const filteredProposals = proposals.filter(proposal => 
    selectedStatuses.includes(proposal.metadata.status)
  );

  // Then sort the filtered proposals
  const sortedAndFilteredProposals = sortProposals(filteredProposals);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Governance Proposals</h1>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add New Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new governance proposal.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProposal} className="space-y-4 py-4">
              <div>
                <Label htmlFor="new-proposal-title">Title</Label>
                <Input
                  id="new-proposal-title"
                  value={newProposalTitle}
                  onChange={(e) => setNewProposalTitle(e.target.value)}
                  placeholder="Proposal Title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new-proposal-description">Description (can include HTML)</Label>
                <Textarea
                  id="new-proposal-description"
                  value={newProposalDescription}
                  onChange={(e) => setNewProposalDescription(e.target.value)}
                  placeholder="Detailed description of the proposal..."
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new-proposal-guild">Guild / Category</Label>
                  <Input
                    id="new-proposal-guild"
                    value={newProposalGuild}
                    onChange={(e) => setNewProposalGuild(e.target.value)}
                    placeholder="e.g., Treasury, Grants, Protocol"
                  />
                </div>
                <div>
                  <Label htmlFor="new-proposal-deadline">Voting Deadline</Label>
                  <Input
                    id="new-proposal-deadline"
                    type="date"
                    value={newProposalDeadline}
                    onChange={(e) => setNewProposalDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">
                  <Plus className="mr-2 h-4 w-4" /> Create Proposal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {ALL_PROPOSAL_STATUSES.map(status => {
            const badgeInfo = getProposalBadge(status);
            return (
              <div key={status} className="flex items-center space-x-2">
                <Checkbox 
                  id={`filter-${status}`}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={(checked) => handleStatusChange(status, checked)}
                />
                <Label htmlFor={`filter-${status}`} className={`p-2 rounded-md ${badgeInfo.className}`}>
                  {/* Display the label from getProposalBadge for consistency if it differs from raw status */}
                  {badgeInfo.label} 
                </Label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAndFilteredProposals.length > 0 ? (
          sortedAndFilteredProposals.map(proposal => {
            const badgeInfo = getProposalBadge(proposal.metadata.status);
            return (
              <Card key={proposal.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg mb-1">{proposal.metadata.title}</CardTitle>
                    <Badge className={`${badgeInfo.className} whitespace-nowrap`}>{badgeInfo.label}</Badge>
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    ID: {proposal.id} <br />
                    By: {proposal.metadata.creatorAddress.substring(0,10)}... <br />
                    Guild: {proposal.metadata.guild} <br />
                    {/* Display relevant date for context based on status */}
                    {proposal.metadata.status === "Executed" && proposal.metadata.executedAt ? `Executed: ${new Date(proposal.metadata.executedAt).toLocaleDateString()}` :
                     `Deadline: ${new Date(proposal.metadata.votingDeadline).toLocaleDateString()}`}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {/* Basic description snippet, could be improved */}
                  <p className="text-sm text-muted-foreground line-clamp-3" dangerouslySetInnerHTML={{ __html: proposal.descriptionHtml }} />
                </CardContent>
                <div className="p-4 pt-0">
                    <Button onClick={() => onViewProposal(proposal.id)} className="w-full">View Details</Button>
                </div>
              </Card>
            );
          })
        ) : (
          <p className="col-span-full text-center text-muted-foreground">No proposals match the selected filters.</p>
        )}
      </div>
    </div>
  );
} 