import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getProposalBadge, ProposalStatus } from "@/lib/governance/ProposalLifecycleUtils";

interface ProposalMetadataProps {
  title: string;
  id: string;
  status: ProposalStatus;
  creatorAddress: string;
  guild: string;
  votingDeadline: string;
  executedAt?: string;
}

export default function ProposalMetadata({ 
  title,
  id,
  status,
  creatorAddress,
  guild,
  votingDeadline, 
  executedAt
}: ProposalMetadataProps) {
  const badgeInfo = getProposalBadge(status);

  let dateToDisplay = votingDeadline;
  if (status === "Executed" && executedAt) {
    dateToDisplay = `Executed: ${executedAt}`;
  } else if (status === "Active") {
    dateToDisplay = `Voting ends: ${votingDeadline}`;
  } else if (status === "Pending") {
    dateToDisplay = `Voting starts: ${votingDeadline}`;
  } else if (status === "Failed" || status === "Cancelled"){
    dateToDisplay = `Ended: ${votingDeadline}`;
  }

  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={badgeInfo.className}>{badgeInfo.label}</Badge>
            <span className="text-sm text-muted-foreground">ID: {id}</span>
          </div>
        </div>
      </div>
      {/* Metadata grid */}
      <div className="grid grid-cols-3 gap-4 text-sm pt-4">
        <div>
          <p className="text-muted-foreground">Creator</p>
          <div className="flex items-center gap-2 mt-1">
            <Avatar className="h-6 w-6">
              <AvatarImage src="/placeholder.svg" alt={creatorAddress} /> 
              <AvatarFallback>{creatorAddress.substring(2,4).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span>{creatorAddress}</span>
          </div>
        </div>
        <div>
          <p className="text-muted-foreground">Guild</p>
          <p className="font-medium mt-1">{guild}</p>
        </div>
        <div>
          <p className="text-muted-foreground">{status === "Executed" ? "Execution Date" : "Deadline/Status"}</p>
          <p className="font-medium mt-1">{dateToDisplay}</p>
        </div>
      </div>
    </CardHeader>
  );
} 