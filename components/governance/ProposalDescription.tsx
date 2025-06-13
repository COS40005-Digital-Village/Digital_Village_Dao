interface ProposalDescriptionProps {
  descriptionHtml: string;
}

export default function ProposalDescription({ descriptionHtml }: ProposalDescriptionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Description</h3>
      <div 
        className="prose max-w-none text-sm"
        dangerouslySetInnerHTML={{ __html: descriptionHtml }}
      />
    </div>
  );
} 