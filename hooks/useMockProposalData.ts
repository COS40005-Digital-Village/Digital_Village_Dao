import * as React from 'react';
// Import the centralized database and type
import { mockProposalDatabase, MockProposalDetailData } from '@/components/governance/mockProposal';

interface UseMockProposalDataReturn {
  loading: boolean;
  error: string | null;
  data: MockProposalDetailData | null;
  refreshData: () => void; // Kept refreshData for potential future use, though not implemented now
}

export function useMockProposalData(proposalId: string | null): UseMockProposalDataReturn {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [data, setData] = React.useState<MockProposalDetailData | null>(null);

  const fetchData = React.useCallback(() => {
    setLoading(true);
    setError(null);
    setData(null);

    if (!proposalId) {
      setError("No proposal ID provided.");
      setLoading(false);
      return;
    }

    // Simulate async data fetching
    setTimeout(() => {
      try {
        const proposal = mockProposalDatabase[proposalId];
        if (proposal) {
          setData(proposal);
        } else {
          setError(`Proposal with ID "${proposalId}" not found in mock database.`);
        }
      } catch (e: any) {
        console.error("Error fetching mock proposal data:", e);
        setError(e.message || "An unexpected error occurred while fetching proposal data.");
      }
      setLoading(false);
    }, 500); // Simulate network delay
  }, [proposalId]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // The refreshData function re-runs fetchData.
  // This is useful if the underlying mockProposalDatabase can be changed by other parts of the app
  // and this hook needs to reflect those changes without a full component unmount/remount.
  const refreshData = React.useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { loading, error, data, refreshData };
}