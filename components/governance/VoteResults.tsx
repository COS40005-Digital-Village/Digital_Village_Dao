import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Info } from "lucide-react"; // For icons

interface VoteResultsProps {
  approveVotes: number;
  rejectVotes: number;
  abstainVotes: number;
  totalVotingPower?: number;   // optional: total possible votes (e.g., total token supply eligible to vote)
  quorumThreshold?: number;    // optional: e.g., 0.2 for 20%
}

export default function VoteResults({ 
  approveVotes,
  rejectVotes,
  abstainVotes,
  totalVotingPower,
  quorumThreshold
}: VoteResultsProps) {

  const totalVotesCasted = approveVotes + rejectVotes + abstainVotes;

  const calculatePercentage = (votes: number, total: number): number => {
    if (total === 0) return 0;
    return parseFloat(((votes / total) * 100).toFixed(1)); // Keep one decimal place for percentages
  };

  if (totalVotesCasted === 0) {
    return (
      <div className="space-y-2 py-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-base">Vote Results</h3>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-2 flex-shrink-0" />
          No votes have been cast yet.
        </div>
      </div>
    );
  }

  const approvePercentage = calculatePercentage(approveVotes, totalVotesCasted);
  const rejectPercentage = calculatePercentage(rejectVotes, totalVotesCasted);
  const abstainPercentage = calculatePercentage(abstainVotes, totalVotesCasted);

  let turnoutPercentage: number | undefined = undefined;
  if (typeof totalVotingPower === 'number' && totalVotingPower > 0) {
    turnoutPercentage = calculatePercentage(totalVotesCasted, totalVotingPower);
  }

  const isQuorumMet = typeof turnoutPercentage === 'number' && typeof quorumThreshold === 'number' ? turnoutPercentage >= (quorumThreshold * 100) : undefined;

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-base">Vote Results</h3>
        <span className="text-sm text-muted-foreground">
          {totalVotesCasted} votes cast
        </span>
      </div>
      <div className="space-y-3">
        {/* Approve Votes */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Approve</span>
            <span>{approvePercentage}% ({approveVotes} votes)</span>
          </div>
          <Progress value={approvePercentage} className="h-2" aria-label={`Approve votes: ${approvePercentage}%`} />
        </div>
        {/* Reject Votes */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Reject</span>
            <span>{rejectPercentage}% ({rejectVotes} votes)</span>
          </div>
          <Progress value={rejectPercentage} className="h-2" aria-label={`Reject votes: ${rejectPercentage}%`} />
        </div>
        {/* Abstain Votes */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span>Abstain</span>
            <span>{abstainPercentage}% ({abstainVotes} votes)</span>
          </div>
          <Progress value={abstainPercentage} className="h-2"  aria-label={`Abstain votes: ${abstainPercentage}%`} />
        </div>
      </div>

      {/* Optional Turnout and Quorum Information */}
      {(typeof turnoutPercentage === 'number' || typeof quorumThreshold === 'number') && (
        <div className="pt-3 mt-3 border-t border-border/60 space-y-1.5">
          {typeof turnoutPercentage === 'number' && totalVotingPower && (
            <p className="text-xs text-muted-foreground">
              Turnout: {turnoutPercentage}% of total voting power ({totalVotesCasted} / {totalVotingPower} votes)
            </p>
          )}
          {typeof quorumThreshold === 'number' && (
            <p className="text-xs text-muted-foreground">
              Quorum Required: {quorumThreshold * 100}%
            </p>
          )}
          {isQuorumMet === false && (
            <div className="flex items-center text-xs text-amber-600 dark:text-amber-500 pt-1">
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              Quorum not met. Proposal may fail regardless of vote distribution.
            </div>
          )}
           {isQuorumMet === true && (
            <div className="flex items-center text-xs text-green-600 dark:text-green-500 pt-1">
              <Info className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
              Quorum has been met.
            </div>
          )}
        </div>
      )}
    </div>
  );
} 