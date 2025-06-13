import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import * as React from 'react'; // For useState

interface Comment {
  address: string;
  avatarFallback: string; // Added from mock data observation
  content: string;
  timestamp: string;
  likes: number;
  isReply?: boolean; // Added from mock data observation
}

interface DiscussionThreadProps {
  comments: Comment[];
  onCommentSubmit: (comment: string) => void;
}

export default function DiscussionThread({ comments, onCommentSubmit }: DiscussionThreadProps) {
  const [newComment, setNewComment] = React.useState("");

  const handleCommentSubmission = () => {
    if (newComment.trim()) {
      onCommentSubmit(newComment.trim());
      setNewComment(""); // Clear input after submission
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discussion ({comments.length} comments)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={index} className={`flex gap-4 ${comment.isReply ? 'ml-12' : ''}`}>
              <Avatar>
                {/* In a real app, AvatarImage src would come from a user profile service */}
                <AvatarImage src={`/placeholder.svg?user=${comment.address}`} alt={comment.address} />
                <AvatarFallback>{comment.avatarFallback || comment.address.substring(2,4).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.address}</span>
                  <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                </div>
                <p className="text-sm">{comment.content}</p>
                <div className="flex items-center gap-4 text-sm">
                  <Button variant="ghost" size="sm" className="h-auto p-0">
                    Reply
                  </Button>
                  <Button variant="ghost" size="sm" className="h-auto p-0">
                    Like ({comment.likes})
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 pt-4 border-t">
          <Avatar>
            {/* Placeholder for current user - this would be dynamic in a real app */}
            <AvatarImage src="/placeholder.svg?user=currentUser" alt="Current User" /> 
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Input 
              placeholder="Add a comment..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <div className="flex justify-end">
              <Button size="sm" onClick={handleCommentSubmission} disabled={!newComment.trim()}>
                Post
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 