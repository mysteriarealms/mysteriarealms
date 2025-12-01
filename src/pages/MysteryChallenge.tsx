import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, ThumbsUp, Trophy, Clock, Users } from "lucide-react";
import { format, isPast } from "date-fns";
import { Helmet } from "react-helmet-async";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import ReCaptcha from "@/components/ReCaptcha";

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
  winner_id: string | null;
}

interface Theory {
  id: string;
  user_name: string;
  theory_content: string;
  upvotes: number;
  is_winner: boolean;
  created_at: string;
}

interface MysteryProps {
  language: string;
}

export default function MysteryChallenge({ language }: MysteryProps) {
  const queryClient = useQueryClient();
  const [submittingTheory, setSubmittingTheory] = useState(false);
  const [fingerprint, setFingerprint] = useState<string>("");
  const [theoryRecaptchaToken, setTheoryRecaptchaToken] = useState<string | null>(null);
  const [voteRecaptchaToken, setVoteRecaptchaToken] = useState<string | null>(null);
  const [votingTheoryId, setVotingTheoryId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    theory: "",
  });

  // Initialize fingerprint on component mount
  useEffect(() => {
    const initFingerprint = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      setFingerprint(result.visitorId);
    };
    initFingerprint();
  }, []);

  const translations = {
    en: {
      title: "Weekly Mystery Challenge",
      description: "Can you solve this week's mystery?",
      deadline: "Submission Deadline",
      clues: "Clues",
      yourTheory: "Submit Your Theory",
      name: "Your Name",
      email: "Your Email",
      theory: "Your Theory",
      submit: "Submit Theory",
      theories: "Other Theories",
      upvote: "Upvote",
      winner: "Winner",
      ended: "Challenge Ended",
      noActive: "No active challenge right now. Check back soon!",
    },
    sq: {
      title: "Sfida Misterioze e Javës",
      description: "A mund ta zgjidhni misterin e kësaj jave?",
      deadline: "Afati i Dorëzimit",
      clues: "Indicia",
      yourTheory: "Dorëzo Teorinë Tënde",
      name: "Emri Juaj",
      email: "Email-i Juaj",
      theory: "Teoria Juaj",
      submit: "Dorëzo Teorinë",
      theories: "Teoritë e Tjera",
      upvote: "Voto",
      winner: "Fitues",
      ended: "Sfida Përfundoi",
      noActive: "Asnjë sfidë aktive për momentin. Kontrolloni së shpejti!",
    },
  };

  const t = translations[language as keyof typeof translations];

  const { data: challenge, isLoading } = useQuery({
    queryKey: ["active-mystery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mystery_challenges")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as MysteryChallenge | null;
    },
  });

  const { data: theories } = useQuery({
    queryKey: ["challenge-theories", challenge?.id],
    queryFn: async () => {
      if (!challenge) return [];
      const { data, error } = await supabase
        .from("challenge_theories")
        .select("*")
        .eq("challenge_id", challenge.id)
        .order("upvotes", { ascending: false });
      if (error) throw error;
      return data as Theory[];
    },
    enabled: !!challenge,
  });

  const submitTheoryMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!challenge) throw new Error("No active challenge");
      if (!theoryRecaptchaToken) throw new Error("Please complete the reCAPTCHA verification");
      
      const { data: result, error } = await supabase.functions.invoke("submit-theory", {
        body: {
          challenge_id: challenge.id,
          user_name: data.name,
          user_email: data.email,
          theory_content: data.theory,
          recaptcha_token: theoryRecaptchaToken,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
    },
    onSuccess: () => {
      toast.success("Theory submitted successfully!");
      queryClient.invalidateQueries({ queryKey: ["challenge-theories"] });
      setSubmittingTheory(false);
      setFormData({ name: "", email: "", theory: "" });
      setTheoryRecaptchaToken(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit theory");
      setTheoryRecaptchaToken(null);
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ theoryId, voterEmail }: { theoryId: string; voterEmail: string }) => {
      if (!fingerprint) {
        throw new Error("Browser fingerprint not ready. Please try again.");
      }
      if (!voteRecaptchaToken) {
        throw new Error("Please complete the reCAPTCHA verification");
      }

      const { data: result, error } = await supabase.functions.invoke("submit-vote", {
        body: {
          theory_id: theoryId,
          voter_email: voterEmail,
          fingerprint,
          recaptcha_token: voteRecaptchaToken,
        },
      });

      if (error) throw error;
      if (result?.error) throw new Error(result.error);
    },
    onSuccess: () => {
      toast.success("Vote counted!");
      queryClient.invalidateQueries({ queryKey: ["challenge-theories"] });
      setVotingTheoryId(null);
      setVoteRecaptchaToken(null);
    },
    onError: (error: any) => {
      const message = error.message || "Failed to vote";
      if (message.includes("already voted")) {
        toast.error("You already voted for this theory");
      } else if (message.includes("wait")) {
        toast.error("Please wait before voting again");
      } else {
        toast.error(message);
      }
      setVotingTheoryId(null);
      setVoteRecaptchaToken(null);
    },
  });

  const handleVote = (theoryId: string) => {
    setVotingTheoryId(theoryId);
  };

  const handleVoteSubmit = (email: string) => {
    if (!votingTheoryId) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (!voteRecaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }
    
    voteMutation.mutate({ theoryId: votingTheoryId, voterEmail: email });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Helmet>
          <title>{t.title} | Mysteria Realm</title>
          <meta name="description" content={t.description} />
        </Helmet>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">{t.noActive}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = isPast(new Date(challenge.deadline));
  const title = language === "sq" ? challenge.title_sq : challenge.title_en;
  const description = language === "sq" ? challenge.description_sq : challenge.description_en;
  const clues = language === "sq" ? challenge.clues_sq : challenge.clues_en;

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>
          {title} | {t.title}
        </title>
        <meta name="description" content={description} />
      </Helmet>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="border-2 border-primary/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold text-primary">{t.title}</span>
            </div>
            <CardTitle className="text-3xl">{title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {t.deadline}: {format(new Date(challenge.deadline), "PPP p")}
              </div>
              {isExpired && (
                <span className="px-2 py-1 bg-red-500/20 text-red-600 rounded-full text-xs">
                  {t.ended}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg leading-relaxed">{description}</p>
            {clues && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-semibold mb-2">{t.clues}</h3>
                <p className="text-sm whitespace-pre-line">{clues}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {!isExpired && (
          <Card>
            <CardHeader>
              <CardTitle>{t.yourTheory}</CardTitle>
            </CardHeader>
            <CardContent>
              {!submittingTheory ? (
                <Button onClick={() => setSubmittingTheory(true)} className="w-full">
                  {t.submit}
                </Button>
              ) : (
                <div className="space-y-4">
                  <Input
                    placeholder={t.name}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <Input
                    type="email"
                    placeholder={t.email}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  <Textarea
                    placeholder={t.theory}
                    value={formData.theory}
                    onChange={(e) => setFormData({ ...formData, theory: e.target.value })}
                    rows={6}
                  />
                  <div className="flex flex-col gap-4">
                    <ReCaptcha onVerify={setTheoryRecaptchaToken} />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => submitTheoryMutation.mutate(formData)}
                        disabled={submitTheoryMutation.isPending || !theoryRecaptchaToken}
                        className="flex-1"
                      >
                        {submitTheoryMutation.isPending && (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        )}
                        {t.submit}
                      </Button>
                      <Button variant="outline" onClick={() => {
                        setSubmittingTheory(false);
                        setTheoryRecaptchaToken(null);
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>
                {t.theories} ({theories?.length || 0})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {theories?.map((theory) => (
                <div
                  key={theory.id}
                  className={`p-4 border rounded-lg ${
                    theory.is_winner ? "border-yellow-500 bg-yellow-500/5" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{theory.user_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(theory.created_at), "PPP")}
                      </p>
                    </div>
                    {theory.is_winner && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-xs">
                        🏆 {t.winner}
                      </span>
                    )}
                  </div>
                  <p className="text-sm mb-3">{theory.theory_content}</p>
                  {votingTheoryId === theory.id && !isExpired ? (
                    <div className="space-y-3 mt-3">
                      <Input
                        type="email"
                        placeholder="Enter your email to vote"
                        id={`vote-email-${theory.id}`}
                      />
                      <ReCaptcha onVerify={setVoteRecaptchaToken} />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            const emailInput = document.getElementById(`vote-email-${theory.id}`) as HTMLInputElement;
                            handleVoteSubmit(emailInput.value);
                          }}
                          disabled={voteMutation.isPending || !voteRecaptchaToken}
                        >
                          {voteMutation.isPending && (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          )}
                          Submit Vote
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setVotingTheoryId(null);
                            setVoteRecaptchaToken(null);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleVote(theory.id)}
                        disabled={isExpired}
                      >
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        {theory.upvotes}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
