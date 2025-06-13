import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { shortenAddress } from "@/lib/utils"; // Import from shared location

interface ProposalAction {
  targetAddress: string;
  functionSignature: string;
  arguments: string[]; // Changed back to 'arguments' as per PRD
}

interface ProposalActionsProps {
  actions: ProposalAction[];
}

export default function ProposalActions({ actions }: ProposalActionsProps) {
  if (!actions || actions.length === 0) {
    return (
      <div className="space-y-2 py-4">
        <h3 className="font-medium text-base">Proposed Actions</h3>
        <p className="text-sm text-muted-foreground">This proposal does not contain executable actions.</p>
      </div>
    );
  }

  // Simple copy to clipboard (consider a toast notification for user feedback in a real app)
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Optional: Add user feedback like a toast
      // console.log("Copied to clipboard:", text);
    }).catch(err => {
      console.error("Failed to copy address:", err);
    });
  };

  return (
    <div className="space-y-4 py-4">
      <h3 className="font-medium text-base">Proposed Actions</h3>
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Card key={index} className="bg-muted/30 dark:bg-muted/20 hover:bg-muted/50 dark:hover:bg-muted/40 transition-colors duration-150">
            <CardHeader className="pb-2 pt-3 px-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-mono break-all">
                  Target: {shortenAddress(action.targetAddress)}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(action.targetAddress)} title="Copy address" aria-label="Copy target address">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-3 space-y-1">
              <p className="text-xs font-mono break-all">Function: {action.functionSignature}</p>
              {action.arguments && action.arguments.length > 0 && (
                <div className="pt-1">
                  <p className="text-xs font-mono">Arguments:</p>
                  <ul className="list-disc list-inside pl-2 space-y-0.5">
                    {action.arguments.map((arg, argIndex) => (
                      <li key={argIndex} className="text-xs font-mono break-all relative">
                        <span className="absolute left-0 top-0">- </span>
                        <span className="pl-3">{arg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 