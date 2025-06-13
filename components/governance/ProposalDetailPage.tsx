import ProposalMetadata from "./ProposalMetadata";
import ProposalDescription from "./ProposalDescription";
import ProposalActions from "./ProposalActions";
import VotingInterface from "./VotingInterface";
import VoteResults from "./VoteResults";
import DiscussionThread from "./DiscussionThread";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import * as React from 'react';
import { Badge } from "@/components/ui/badge";
import { useMockProposalData } from "@/hooks/useMockProposalData";
import { AlertCircle, Loader2, Edit3 } from "lucide-react";
import { shortenAddress } from "@/lib/utils";
import { ProposalStatus, getProposalBadge, getAvailableTransitions } from "@/lib/governance/ProposalLifecycleUtils";
import { mockProposalDatabase } from './mockProposal';

interface ProposalDetailPageProps {
  proposalId: string;
  onBackToProposals: () => void;
}

// Define mock comment submit handler here
const handleCommentSubmitMock = (comment: string) => {
  console.log("Comment submitted (mock):", comment);
  alert(`Mock comment submitted: "${comment}".`);
};

export default function ProposalDetailPage({ proposalId, onBackToProposals }: ProposalDetailPageProps) {
  const { loading, error, data: initialProposalData } = useMockProposalData(proposalId);

  // Local state to manage proposal data that can be modified by admin actions
  const [proposalData, setProposalData] = React.useState(initialProposalData);
  const [selectedNextStatus, setSelectedNextStatus] = React.useState<ProposalStatus | undefined>(undefined);

  React.useEffect(() => {
    setProposalData(initialProposalData); // Sync local state when initial data changes
  }, [initialProposalData]);

  // --- State for voting interaction ---
  // This remains here as it represents the user's session state for the *loaded* proposal data
  const [currentVoteChoice, setCurrentVoteChoice] = React.useState<"approve" | "reject" | "abstain" | undefined>(undefined);
  const [hasVotedOnCurrent, setHasVotedOnCurrent] = React.useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = React.useState(false);

  // Effect to initialize/reset interaction state when proposal data changes (or becomes available)
  React.useEffect(() => {
    if (proposalData) {
      // Initialize from the data fetched by the hook
      setCurrentVoteChoice(proposalData.voting.userVoteChoice);
      setHasVotedOnCurrent(proposalData.voting.hasVoted);
      setSelectedNextStatus(undefined); // Reset status change dropdown
    } else {
      // Reset if data is null (e.g., loading, error, or ID change)
      setCurrentVoteChoice(undefined);
      setHasVotedOnCurrent(false);
    }
    setIsSubmittingVote(false); // Always reset submission state
  }, [proposalData]); // Re-run when proposalData (local copy) changes

  // Wallet connection simulation remains here for now, as it might be global state later
  const [connectedWalletAddress, setConnectedWalletAddress] = React.useState<string | undefined>(undefined);
  const toggleWallet = () => {
      setConnectedWalletAddress(prev => prev ? undefined : "0xMockUserWallet123...");
  };

  const handleVoteSubmit = (choice: "approve" | "reject" | "abstain") => {
    if (!connectedWalletAddress) {
      alert("Please connect your wallet to vote.");
      return;
    }
    if (!proposalData) return; // Should not happen if button is visible, but safety check

    console.log(`Vote by ${connectedWalletAddress} for ${proposalData.id}: ${choice}`);
    setIsSubmittingVote(true);
    setTimeout(() => {
      setCurrentVoteChoice(choice);
      setHasVotedOnCurrent(true); 
      setIsSubmittingVote(false);
      alert(`Vote (${choice}) submitted successfully by ${shortenAddress(connectedWalletAddress)} for ${proposalData.metadata.title}!`);
      // Note: This only updates local session state. The underlying `proposalData` from the hook
      // does not change unless the hook re-fetches data reflecting the vote.
    }, 1200);
  };

  const handleAdminStatusChange = () => {
    if (!proposalData || !selectedNextStatus) {
      alert("Please select a valid next status.");
      return;
    }

    const originalStatus = proposalData.metadata.status;

    if (window.confirm(`Are you sure you want to change the proposal status from "${originalStatus}" to "${selectedNextStatus}"?`)) {
      // Directly modify the mockProposalDatabase for this mock implementation
      // This is a temporary workaround for the mock scenario.
      // In a real app, this would be an API call and the hook would re-fetch or update via a proper state management solution.
      if (mockProposalDatabase[proposalData.id]) {
        mockProposalDatabase[proposalData.id].metadata.status = selectedNextStatus;
        
        // Update local state to reflect the change immediately
        setProposalData(prevData => {
          if (!prevData) return null;
          return {
            ...prevData,
            metadata: {
              ...prevData.metadata,
              status: selectedNextStatus,
            },
          };
        });

        // If useMockProposalData had a refresh function, call it here:
        // if (refreshData) refreshData();

        alert(`Proposal status successfully changed from "${originalStatus}" to "${selectedNextStatus}".`);
        setSelectedNextStatus(undefined); // Reset dropdown
      } else {
        alert("Error: Could not find proposal in mock database to update.");
      }
    }
  };

  // --- Render Logic ---

  if (loading && !proposalData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2">Loading proposal data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
        <div className="flex items-center text-destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <h2 className="font-semibold">Error Loading Proposal</h2>
        </div>
        <p className="text-sm text-destructive/90">{error}</p>
        <Button variant="outline" size="sm" onClick={onBackToProposals}>Back to Proposals</Button>
      </div>
    );
  }

  if (!proposalData) {
    // This case might occur if the hook resolves without data and no error
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4">
        <p>Proposal data could not be loaded or proposal ID is invalid.</p>
        <Button variant="outline" size="sm" onClick={onBackToProposals}>Back to Proposals</Button>
      </div>
    );
  }

  // --- Data is loaded, proceed with rendering ---
  const { id, metadata, descriptionHtml, actions, voting, voteResults, comments } = proposalData;
  const { status } = metadata;
  const isVotingOpenForInterface = status === "Active";
  const availableTransitions = getAvailableTransitions(status);

  // Use the wallet address from the hook's data for display/gating, but keep toggle local for now
  // const displayWalletAddress = proposalData.connectedWalletAddress; // Use if hook provides wallet
  const displayWalletAddress = connectedWalletAddress; // Keep using local toggle for now

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Proposal Detail</h1>
          <Badge 
            variant={displayWalletAddress ? "secondary" : "outline"} 
            className={`mt-1 font-mono text-xs ${displayWalletAddress ? 'wallet-status-connected' : 'wallet-status-disconnected'}`}>
             {displayWalletAddress ? `Wallet: ${shortenAddress(displayWalletAddress)}` : "Wallet Not Connected"}
          </Badge>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={toggleWallet}
            className={displayWalletAddress ? 'btn-disconnect-wallet' : 'btn-connect-wallet'}>
            {displayWalletAddress ? "Disconnect Wallet" : "Connect Wallet (Mock)"}
          </Button>
          <div>
            <Button variant="outline" size="sm" onClick={onBackToProposals} className="btn-back-to-proposals">
              Back to Proposals
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <ProposalMetadata {...metadata} id={id} />
        <CardContent className="space-y-6 pt-6">
          <Separator />
          <ProposalDescription descriptionHtml={descriptionHtml} />
          
          {["Active", "Executed", "Failed"].includes(status) && actions && actions.length > 0 && (
            <>
              <Separator />
              <ProposalActions actions={actions} />
            </>
          )}

          {/* VotingInterface uses combination of hook data and local interaction state */}
          {status === "Active" && (
            <>
              <Separator />
              <VotingInterface 
                walletAddress={displayWalletAddress} // Use displayed wallet address
                userVoteChoice={currentVoteChoice} // From local interaction state
                hasVoted={hasVotedOnCurrent} // From local interaction state
                isVotingOpen={isVotingOpenForInterface} // Derived from proposal status
                isSubmitting={isSubmittingVote} // From local interaction state
                onVoteSubmit={handleVoteSubmit} 
              />
            </>
          )}
          
          {status !== "Pending" && (
            <>
              <Separator />
              <VoteResults {...voteResults} />
            </>
          )}
        </CardContent>
        {/* Admin Status Change Section */}
        {availableTransitions.length > 0 && (
          <>
            <Separator />
            <CardFooter className="flex-col items-start gap-4 pt-6">
                <h3 className="text-lg font-semibold flex items-center"><Edit3 className="w-5 h-5 mr-2 text-primary" />Admin: Change Proposal Status</h3>
                <div className="flex items-center gap-3 w-full">
                    <Select value={selectedNextStatus} onValueChange={(value) => setSelectedNextStatus(value as ProposalStatus)}>
                        <SelectTrigger className="w-[220px]">
                            <SelectValue placeholder="Select next status" />
                        </SelectTrigger>
                        <SelectContent>
                            {availableTransitions.map(nextStatus => (
                                <SelectItem key={nextStatus} value={nextStatus}>
                                    {getProposalBadge(nextStatus).label} ({nextStatus})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleAdminStatusChange} disabled={!selectedNextStatus}>
                        Confirm Change
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Current status: <Badge variant="outline" className={getProposalBadge(status).className + " text-xs"}>{getProposalBadge(status).label}</Badge>
                </p>
            </CardFooter>
          </>
        )}
      </Card>

      <DiscussionThread 
        comments={comments} 
        onCommentSubmit={handleCommentSubmitMock} // Use the local mock handler
      />
    </div>
  );
} 