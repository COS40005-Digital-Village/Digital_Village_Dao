export type ProposalStatus = "Pending" | "Active" | "Executed" | "Failed" | "Cancelled";

interface BadgeInfo {
  label: string;
  // className will hold the specific Tailwind utility class for the badge
  className: string; 
}

export function getProposalBadge(status: ProposalStatus): BadgeInfo {
  switch (status) {
    case "Pending":
      return { label: "Pending", className: "badge-proposal-pending" }; 
    case "Active":
      return { label: "Open for Voting", className: "badge-proposal-active" };
    case "Executed":
      return { label: "Executed", className: "badge-proposal-executed" }; 
    case "Cancelled":
      return { label: "Cancelled", className: "badge-proposal-cancelled" };
    case "Failed":
      return { label: "Rejected", className: "badge-proposal-failed" }; 
    default:
      const exhaustiveCheck: never = status;
      console.warn(`Unknown proposal status: ${exhaustiveCheck}`);
      return { label: "Unknown", className: "badge-proposal-pending" }; // Fallback to pending style
  }
}

export function getAvailableTransitions(currentStatus: ProposalStatus): ProposalStatus[] {
  switch (currentStatus) {
    case "Pending":
      return ["Active", "Cancelled"];
    case "Active":
      return ["Executed", "Failed", "Cancelled"];
    case "Executed":
    case "Failed":
    case "Cancelled":
      return []; // Terminal states
    default:
      // Should not happen with TypeScript, but good for robustness
      const exhaustiveCheck: never = currentStatus;
      console.warn(`Unknown proposal status for transitions: ${exhaustiveCheck}`);
      return [];
  }
}