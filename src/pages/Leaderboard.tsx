import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";
import UserBadge from "@/components/UserBadge";
import { Helmet } from "react-helmet-async";

interface LeaderboardProps {
  language: string;
}

interface UserReputation {
  email: string;
  name: string;
  reputation_score: number;
  badge_level: string;
  total_comments: number;
  approved_comments: number;
  total_replies: number;
  first_comment_at: string;
  last_comment_at: string;
}

const Leaderboard = ({ language }: LeaderboardProps) => {
  const [activeTab, setActiveTab] = useState("all-time");

  const translations = {
    en: {
      title: "Community Leaderboard",
      subtitle: "Top contributors in the Mysteria Realm community",
      allTime: "All Time",
      monthly: "This Month",
      rank: "Rank",
      contributor: "Contributor",
      reputation: "Reputation",
      comments: "Comments",
      replies: "Replies",
      memberSince: "Member Since",
      noData: "No leaderboard data available yet.",
      metaTitle: "Community Leaderboard - Top Contributors | Mysteria Realm",
      metaDescription: "Discover the most active contributors in our paranormal community. View reputation rankings, badges, and contribution statistics.",
    },
    sq: {
      title: "Renditja e Komunitetit",
      subtitle: "Kontribuesit më të mirë në komunitetin Mysteria Realm",
      allTime: "Të Gjitha Kohërat",
      monthly: "Këtë Muaj",
      rank: "Pozicioni",
      contributor: "Kontribuesi",
      reputation: "Reputacioni",
      comments: "Komente",
      replies: "Përgjigje",
      memberSince: "Anëtar Që Nga",
      noData: "Ende nuk ka të dhëna për renditjen.",
      metaTitle: "Renditja e Komunitetit - Kontribuesit Më të Mirë | Mysteria Realm",
      metaDescription: "Zbuloni kontribuesit më aktivë në komunitetin tonë paranormal. Shikoni renditjen e reputacionit, shenjat dhe statistikat e kontributit.",
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  // Fetch all-time leaderboard
  const { data: allTimeData = [], isLoading: allTimeLoading } = useQuery({
    queryKey: ["leaderboard", "all-time"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_reputation")
        .select("*")
        .order("reputation_score", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as UserReputation[];
    },
  });

  // Fetch monthly leaderboard
  const { data: monthlyData = [], isLoading: monthlyLoading } = useQuery({
    queryKey: ["leaderboard", "monthly"],
    queryFn: async () => {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("user_reputation")
        .select("*")
        .gte("last_comment_at", startOfMonth.toISOString())
        .order("reputation_score", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as UserReputation[];
    },
  });

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-semibold">#{rank}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === "sq" ? "sq-AL" : "en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const renderLeaderboard = (data: UserReputation[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading leaderboard...</p>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <Card className="p-12 text-center bg-card/30 border-border/50">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">{t.noData}</p>
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {data.map((user, index) => {
          const rank = index + 1;
          const isTopThree = rank <= 3;

          return (
            <Card
              key={user.email}
              className={`p-4 transition-all hover:scale-[1.02] ${
                isTopThree
                  ? "bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30"
                  : "bg-card/50 border-border/50"
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-background/50">
                  {getRankIcon(rank)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-foreground truncate">{user.name}</h3>
                    <UserBadge
                      badgeLevel={user.badge_level}
                      reputationScore={user.reputation_score}
                      totalComments={user.total_comments}
                      language={language}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t.memberSince} {formatDate(user.first_comment_at)}
                  </p>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-primary">{user.reputation_score}</p>
                    <p className="text-xs text-muted-foreground">{t.reputation}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{user.total_comments}</p>
                    <p className="text-xs text-muted-foreground">{t.comments}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{user.total_replies}</p>
                    <p className="text-xs text-muted-foreground">{t.replies}</p>
                  </div>
                </div>

                {/* Mobile Stats */}
                <div className="flex md:hidden flex-col items-end gap-1 text-xs">
                  <span className="font-bold text-primary">{user.reputation_score} pts</span>
                  <span className="text-muted-foreground">{user.total_comments} comments</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>{t.metaTitle}</title>
        <meta name="description" content={t.metaDescription} />
        <meta property="og:title" content={t.metaTitle} />
        <meta property="og:description" content={t.metaDescription} />
      </Helmet>

      <div className="min-h-screen pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.title}
            </h1>
            <p className="text-muted-foreground text-lg">{t.subtitle}</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
              <TabsTrigger value="all-time">{t.allTime}</TabsTrigger>
              <TabsTrigger value="monthly">{t.monthly}</TabsTrigger>
            </TabsList>

            <TabsContent value="all-time">
              {renderLeaderboard(allTimeData, allTimeLoading)}
            </TabsContent>

            <TabsContent value="monthly">
              {renderLeaderboard(monthlyData, monthlyLoading)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default Leaderboard;
