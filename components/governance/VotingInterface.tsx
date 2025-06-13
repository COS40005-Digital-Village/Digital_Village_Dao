"use client"; // Add this directive for Next.js App Router

import React, { useState, useEffect } from 'react';
// Ethers is loaded from a CDN, so we don't import it directly.
// This prevents the "Could not resolve 'ethers'" build error.

// --- UI Components ---
// Assuming these are correctly imported from your project's UI library.
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Lock, CheckCircle } from "lucide-react";


// --- Type Definitions ---
// This tells TypeScript about the `ethereum` object from MetaMask
// and the `ethers` object from the CDN script.
declare global {
  interface Window {
    ethereum?: any; // Using `any` to avoid complex EIP-1193 type issues for this example
    ethers?: any;   // The ethers library will be attached to the window object
  }
}

// --- The Main Page Component ---
// This single component now manages state and renders the UI.
export default function ProposalDetailPage() {
  // --- State Management ---
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const [signer, setSigner] = useState<any | undefined>(undefined); // Using any for simplicity
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVoteChoice, setUserVoteChoice] = useState<"approve" | "reject" | "abstain" | undefined>(undefined);
  const [selectedChoice, setSelectedChoice] = useState<"approve" | "reject" | "abstain" | undefined>(undefined);
  
  // This would come from your proposal data. Hardcoded for the example.
  const isVotingOpen = true; 

  // --- Wallet Connection Logic ---
  const connectWallet = async () => {
    // Check if MetaMask and ethers are available on the window object
    if (typeof window.ethereum !== 'undefined' && typeof window.ethers !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new window.ethers.BrowserProvider(window.ethereum);
        const currentSigner = await provider.getSigner();
        const currentAddress = await currentSigner.getAddress();

        setSigner(currentSigner);
        setWalletAddress(currentAddress);

        // TODO: Query your contract to see if this user has already voted.
        // const hasUserVoted = await yourGovernanceContract.hasVoted(proposalId, currentAddress);
        // setHasVoted(hasUserVoted);

      } catch (error) {
        console.error("Error connecting wallet:", error);
        alert("Failed to connect wallet. See console for details.");
      }
    } else {
      alert("Please install MetaMask and ensure you have an internet connection.");
    }
  };

  // --- Vote Submission Logic ---
  const handleVoteSubmit = async () => {
    if (!signer || !selectedChoice) {
      alert("Please connect your wallet and select a choice.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // --- SMART CONTRACT INTERACTION ---
      // const governanceContract = new window.ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      // const tx = await governanceContract.castVote(proposalId, voteChoiceEnumValue);
      // await tx.wait();

      console.log(`Simulating vote submission for: ${selectedChoice}`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHasVoted(true);
      setUserVoteChoice(selectedChoice);
      console.log("Vote submitted successfully!");

    } catch (error) {
      console.error("Error submitting vote:", error);
      alert("There was an error submitting your vote.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- UI Rendering Logic ---
  const renderVotingPanel = () => {
    if (!isVotingOpen) {
      return <div className="text-center text-muted-foreground p-4">Voting has ended.</div>; 
    }
  
    if (!walletAddress) {
      return (
        <div className="text-center p-4">
          <Button onClick={connectWallet} className="w-full">
              Connect Wallet to Vote
          </Button>
        </div>
      );
    }
  
    if (hasVoted) {
      return (
        <div className="space-y-2 py-4">
          <h3 className="font-medium text-base">Your Vote</h3>
          <div className="flex items-center text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 rounded-md p-3">
            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="font-medium">You voted: <span className="font-semibold capitalize">{userVoteChoice || "N/A"}</span></span>
          </div>
        </div>
      );
    }
  
    // Default case: User is connected and hasn't voted
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Cast your vote on this proposal</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Connected as: <span className="font-mono text-xs bg-muted p-1 rounded">{walletAddress}</span>
        </p>
        <RadioGroup 
          value={selectedChoice}
          onValueChange={(value: any) => setSelectedChoice(value)}
          disabled={isSubmitting} 
          aria-label="Select your vote choice"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="approve" id="approve"/>
            <Label htmlFor="approve">Approve</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="reject" id="reject"/>
            <Label htmlFor="reject">Reject</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="abstain" id="abstain"/>
            <Label htmlFor="abstain">Abstain</Label>
          </div>
        </RadioGroup>
        <Button 
          onClick={handleVoteSubmit} 
          disabled={!selectedChoice || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            "Submit Vote"
          )}
        </Button>
      </div>
    );
  };
  
  return (
    <div className="p-8 max-w-2xl mx-auto font-sans">
      <h1 className="text-3xl font-bold mb-4">Proposal #123: Fund Community Event</h1>
      <p className="text-muted-foreground mb-8">
        This proposal outlines a plan to allocate 5 ETH from the treasury to fund a community hackathon event next quarter. The funds will be used for prizes, venue rental, and refreshments.
      </p>

      <div className="border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Voting Panel</h2>
        {renderVotingPanel()}
      </div>
    </div>
  );
}
