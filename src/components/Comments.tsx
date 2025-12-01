import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageSquare, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import UserBadge from "@/components/UserBadge";

interface Comment {
  id: string;
  name: string;
  email: string;
  content: string;
  created_at: string;
  parent_comment_id: string | null;
}

interface UserReputation {
  badge_level: string;
  reputation_score: number;
  total_comments: number;
}

interface CommentsProps {
  articleId: string;
  language: string;
}

const Comments = ({ articleId, language }: CommentsProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const queryClient = useQueryClient();

  const translations = {
    en: {
      title: "Comments",
      subtitle: "Share your thoughts and paranormal experiences",
      namePlaceholder: "Your name",
      emailPlaceholder: "Your email (will be verified)",
      commentPlaceholder: "Share your thoughts or paranormal experience...",
      replyPlaceholder: "Write your reply...",
      submit: "Submit Comment",
      reply: "Reply",
      cancel: "Cancel",
      noComments: "No comments yet. Be the first to share your experience!",
      submitting: "Submitting...",
      emailInfo: "Your email will be verified before your comment is published. We never share your email publicly. Once verified, your comment will go live immediately!",
    },
    sq: {
      title: "Komentet",
      subtitle: "Ndani mendimet dhe përvojat tuaja paranormale",
      namePlaceholder: "Emri juaj",
      emailPlaceholder: "Email-i juaj (do të verifikohet)",
      commentPlaceholder: "Ndani mendimet ose përvojën tuaj paranormale...",
      replyPlaceholder: "Shkruani përgjigjen tuaj...",
      submit: "Dërgo Komentin",
      reply: "Përgjigju",
      cancel: "Anulo",
      noComments: "Ende nuk ka komente. Jini i pari që ndani përvojën tuaj!",
      submitting: "Duke dërguar...",
      emailInfo: "Email-i juaj do të verifikohet para se komenti juaj të publikohet. Ne nuk e ndajmë kurrë email-in tuaj publikisht. Pasi të verifikohet, komenti juaj do të jetë menjëherë i disponueshëm!",
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Fetch comments
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("article_id", articleId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Comment[];
    },
  });

  // Fetch user reputations for all commenters
  const { data: reputations = [] } = useQuery({
    queryKey: ["reputations", comments.map(c => c.email)],
    queryFn: async () => {
      if (comments.length === 0) return [];
      
      const emails = [...new Set(comments.map(c => c.email))];
      const { data, error } = await supabase
        .from("user_reputation")
        .select("email, badge_level, reputation_score, total_comments")
        .in("email", emails);

      if (error) throw error;
      return data as (UserReputation & { email: string })[];
    },
    enabled: comments.length > 0,
  });

  const getReputation = (email: string) => {
    return reputations.find(r => r.email === email);
  };

  // Submit comment mutation
  const submitComment = async ({
    name,
    email,
    content,
    parentCommentId,
  }: {
    name: string;
    email: string;
    content: string;
    parentCommentId?: string | null;
  }) => {
    const { data, error } = await supabase.functions.invoke("submit-comment", {
      body: {
        articleId,
        email: email.trim(),
        name: name.trim(),
        content: content.trim(),
        parentCommentId,
      },
    });

    if (error) throw error;
    return data;
  };

  const mutation = useMutation({
    mutationFn: submitComment,
    onSuccess: (data) => {
      toast.success(data.message || "Comment submitted! Check your email to verify.", {
        duration: 6000,
      });
      setName("");
      setEmail("");
      setContent("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["comments", articleId] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit comment. Please try again.");
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    mutation.mutate({
      name,
      email,
      content,
      parentCommentId: replyTo,
    });
  };

  const topLevelComments = comments.filter((c) => !c.parent_comment_id);
  const getReplies = (commentId: string) =>
    comments.filter((c) => c.parent_comment_id === commentId);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12 space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2 text-foreground">
          <MessageSquare className="h-8 w-8 text-primary" />
          {t.title}
        </h2>
        <p className="text-muted-foreground">{t.subtitle}</p>
      </div>

      {/* Comment Form */}
      <Card className="p-6 bg-card/50 backdrop-blur border-border/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder={t.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
              className="bg-background/50"
            />
            <Input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              required
              className="bg-background/50"
            />
          </div>
          <Textarea
            placeholder={replyTo ? t.replyPlaceholder : t.commentPlaceholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={2000}
            rows={4}
            required
            className="bg-background/50 resize-none"
          />
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              {t.emailInfo}
            </p>
            <div className="flex gap-2">
              {replyTo && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReplyTo(null)}
                >
                  {t.cancel}
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                <Send className="h-4 w-4" />
                {isSubmitting ? t.submitting : t.submit}
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">Loading comments...</div>
        ) : topLevelComments.length === 0 ? (
          <Card className="p-8 text-center bg-card/30 border-border/50">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">{t.noComments}</p>
          </Card>
        ) : (
          topLevelComments.map((comment) => (
            <div key={comment.id} className="space-y-3">
              <Card className={`p-4 backdrop-blur border-border/50 transition-all ${
                getReputation(comment.email)?.badge_level === 'legend' || 
                getReputation(comment.email)?.badge_level === 'expert'
                  ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 shadow-lg'
                  : 'bg-card/50'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-foreground">{comment.name}</p>
                      {getReputation(comment.email) && (
                        <UserBadge
                          badgeLevel={getReputation(comment.email)!.badge_level}
                          reputationScore={getReputation(comment.email)!.reputation_score}
                          totalComments={getReputation(comment.email)!.total_comments}
                          language={language}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyTo(comment.id)}
                    className="text-primary hover:text-primary/80"
                  >
                    {t.reply}
                  </Button>
                </div>
                <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
              </Card>

              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <Card
                  key={reply.id}
                  className="ml-8 p-4 bg-card/30 backdrop-blur border-border/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-foreground">{reply.name}</p>
                        {getReputation(reply.email) && (
                          <UserBadge
                            badgeLevel={getReputation(reply.email)!.badge_level}
                            reputationScore={getReputation(reply.email)!.reputation_score}
                            totalComments={getReputation(reply.email)!.total_comments}
                            language={language}
                          />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(reply.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <p className="text-foreground/90 whitespace-pre-wrap">{reply.content}</p>
                </Card>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;