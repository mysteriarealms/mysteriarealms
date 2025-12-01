import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trophy, Calendar } from "lucide-react";
import { format } from "date-fns";

interface MysteryChallenge {
  id: string;
  title_en: string;
  title_sq: string;
  description_en: string;
  description_sq: string;
  clues_en: string | null;
  clues_sq: string | null;
  deadline: string;
  is_active: boolean;
  created_at: string;
}

interface Theory {
  id: string;
  user_name: string;
  user_email: string;
  theory_content: string;
  upvotes: number;
  is_winner: boolean;
}

export default function AdminMysteries() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_en: "",
    title_sq: "",
    description_en: "",
    description_sq: "",
    clues_en: "",
    clues_sq: "",
    deadline: "",
  });

  const { data: challenges, isLoading } = useQuery({
    queryKey: ["admin-mysteries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mystery_challenges")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as MysteryChallenge[];
    },
  });

  const { data: theories } = useQuery({
    queryKey: ["challenge-theories", selectedChallenge],
    queryFn: async () => {
      if (!selectedChallenge) return [];
      const { data, error } = await supabase
        .from("challenge_theories")
        .select("*")
        .eq("challenge_id", selectedChallenge)
        .order("upvotes", { ascending: false });
      if (error) throw error;
      return data as Theory[];
    },
    enabled: !!selectedChallenge,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("mystery_challenges").insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mystery challenge created!");
      queryClient.invalidateQueries({ queryKey: ["admin-mysteries"] });
      setIsCreating(false);
      setFormData({
        title_en: "",
        title_sq: "",
        description_en: "",
        description_sq: "",
        clues_en: "",
        clues_sq: "",
        deadline: "",
      });
    },
    onError: () => toast.error("Failed to create challenge"),
  });

  const selectWinnerMutation = useMutation({
    mutationFn: async ({ theoryId, challengeId }: { theoryId: string; challengeId: string }) => {
      // Mark theory as winner
      const { error: theoryError } = await supabase
        .from("challenge_theories")
        .update({ is_winner: true })
        .eq("id", theoryId);
      if (theoryError) throw theoryError;

      // Update challenge
      const { error: challengeError } = await supabase
        .from("mystery_challenges")
        .update({ winner_id: theoryId, is_active: false })
        .eq("id", challengeId);
      if (challengeError) throw challengeError;

      // Get theory details for email
      const { data: theory } = await supabase
        .from("challenge_theories")
        .select("user_name, user_email")
        .eq("id", theoryId)
        .single();

      // Send winner notification email
      if (theory) {
        await supabase.functions.invoke("send-mystery-winner-email", {
          body: {
            email: theory.user_email,
            name: theory.user_name,
          },
        });
      }
    },
    onSuccess: () => {
      toast.success("Winner selected and notified!");
      queryClient.invalidateQueries({ queryKey: ["admin-mysteries"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-theories"] });
    },
    onError: () => toast.error("Failed to select winner"),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Mystery Challenges</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Mystery Challenge</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title (English)</label>
                <Input
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Title (Albanian)</label>
                <Input
                  value={formData.title_sq}
                  onChange={(e) => setFormData({ ...formData, title_sq: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Description (English)</label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (Albanian)</label>
                <Textarea
                  value={formData.description_sq}
                  onChange={(e) => setFormData({ ...formData, description_sq: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Clues (English)</label>
                <Textarea
                  value={formData.clues_en}
                  onChange={(e) => setFormData({ ...formData, clues_en: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Clues (Albanian)</label>
                <Textarea
                  value={formData.clues_sq}
                  onChange={(e) => setFormData({ ...formData, clues_sq: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Deadline</label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>

            <Button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Challenge
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {challenges?.map((challenge) => (
          <Card key={challenge.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{challenge.title_en}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Deadline: {format(new Date(challenge.deadline), "PPP p")}
                  </p>
                </div>
                <div className="flex gap-2">
                  {challenge.is_active && (
                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">
                      Active
                    </span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setSelectedChallenge(selectedChallenge === challenge.id ? null : challenge.id)
                    }
                  >
                    View Theories
                  </Button>
                </div>
              </div>
            </CardHeader>
            {selectedChallenge === challenge.id && (
              <CardContent>
                <h3 className="font-semibold mb-4">Submitted Theories ({theories?.length || 0})</h3>
                <div className="space-y-3">
                  {theories?.map((theory) => (
                    <div key={theory.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium">{theory.user_name}</p>
                          <p className="text-sm text-muted-foreground">{theory.theory_content}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            👍 {theory.upvotes} upvotes
                          </p>
                        </div>
                        {!theory.is_winner && challenge.is_active && (
                          <Button
                            size="sm"
                            onClick={() =>
                              selectWinnerMutation.mutate({
                                theoryId: theory.id,
                                challengeId: challenge.id,
                              })
                            }
                          >
                            <Trophy className="h-4 w-4 mr-1" />
                            Select Winner
                          </Button>
                        )}
                        {theory.is_winner && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-sm">
                            🏆 Winner
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
