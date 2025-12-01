import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import UserBadge from "@/components/UserBadge";
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Mail, 
  User, 
  MessageSquare,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  is_approved: boolean;
  is_email_verified: boolean;
  created_at: string;
  articles: {
    title_en: string;
    title_sq: string;
    slug: string;
  };
}

interface UserReputation {
  email: string;
  badge_level: string;
  reputation_score: number;
  total_comments: number;
}

const AdminComments = () => {
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-comments", filter],
    queryFn: async () => {
      let query = supabase
        .from("comments")
        .select("*, articles(title_en, title_sq, slug)")
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("is_approved", false);
      } else if (filter === "approved") {
        query = query.eq("is_approved", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Comment[];
    },
  });

  // Fetch user reputations for all commenters
  const { data: reputations = [] } = useQuery({
    queryKey: ["admin-reputations", comments.map(c => c.email)],
    queryFn: async () => {
      if (comments.length === 0) return [];
      
      const emails = [...new Set(comments.map(c => c.email))];
      const { data, error } = await supabase
        .from("user_reputation")
        .select("*")
        .in("email", emails);

      if (error) throw error;
      return data as UserReputation[];
    },
    enabled: comments.length > 0,
  });

  const getReputation = (email: string) => {
    return reputations.find(r => r.email === email);
  };

  const approveMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .update({ is_approved: true })
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comment approved successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: () => {
      toast.error("Failed to approve comment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Comment deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: () => {
      toast.error("Failed to delete comment");
    },
  });

  const pendingCount = comments.filter(c => !c.is_approved).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Comments Management</h1>
            <p className="text-muted-foreground mt-2">
              Monitor user comments and reputation. Comments are auto-approved after email verification.
            </p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="destructive" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              {pendingCount} Unverified
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            All Comments
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
          >
            Unverified
          </Button>
          <Button
            variant={filter === "approved" ? "default" : "outline"}
            onClick={() => setFilter("approved")}
          >
            Verified & Live
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : comments.length === 0 ? (
          <Card className="p-12 text-center">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg text-muted-foreground">
              No comments to display
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{comment.name}</span>
                        </div>
                        {getReputation(comment.email) && (
                          <UserBadge
                            badgeLevel={getReputation(comment.email)!.badge_level}
                            reputationScore={getReputation(comment.email)!.reputation_score}
                            totalComments={getReputation(comment.email)!.total_comments}
                            language="en"
                          />
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {comment.email}
                        </div>
                        {comment.is_email_verified ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                        {comment.is_approved ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        On article:{" "}
                        <a
                          href={`/article/${comment.articles.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {comment.articles.title_en}
                        </a>
                      </div>

                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!comment.is_approved && comment.is_email_verified && (
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(comment.id)}
                          disabled={approveMutation.isPending}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this comment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(comment.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  <Card className="p-4 bg-muted/50">
                    <p className="whitespace-pre-wrap">{comment.content}</p>
                  </Card>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminComments;