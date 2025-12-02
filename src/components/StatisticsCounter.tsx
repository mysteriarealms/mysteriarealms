import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Eye, FolderOpen, Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface StatisticsCounterProps {
  language: string;
}

const StatisticsCounter = ({ language }: StatisticsCounterProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { data: stats } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      // Get total published articles
      const { count: articleCount } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("published", true);

      // Get total views
      const { data: viewData } = await supabase
        .from("articles")
        .select("view_count")
        .eq("published", true);

      const totalViews = viewData?.reduce((sum, article) => sum + article.view_count, 0) || 0;

      // Get total categories
      const { count: categoryCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });

      // Calculate total reading time
      const { data: readingData } = await supabase
        .from("articles")
        .select("reading_time_minutes")
        .eq("published", true);

      const totalReadingTime = readingData?.reduce(
        (sum, article) => sum + (article.reading_time_minutes || 0),
        0
      ) || 0;

      return {
        articles: articleCount || 0,
        views: totalViews,
        categories: categoryCount || 0,
        readingTime: totalReadingTime,
      };
    },
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const translations = {
    en: {
      title: "Our Journey in Numbers",
      subtitle: "Exploring mysteries together",
      articles: "Articles Published",
      views: "Total Views",
      categories: "Categories",
      readingTime: "Minutes of Content",
    },
    sq: {
      title: "Udhëtimi Ynë në Numra",
      subtitle: "Duke eksploruar misteret së bashku",
      articles: "Artikuj të Publikuar",
      views: "Shikime Totale",
      categories: "Kategori",
      readingTime: "Minuta Përmbajtje",
    },
  };

  const t = translations[language as keyof typeof translations];

  // Don't render if no data yet
  if (!stats) {
    return null;
  }

  const statistics = [
    {
      icon: BookOpen,
      value: stats.articles,
      label: t.articles,
      color: "from-primary to-purple-500",
      suffix: "",
    },
    {
      icon: Eye,
      value: stats.views,
      label: t.views,
      color: "from-accent to-pink-500",
      suffix: "",
    },
    {
      icon: FolderOpen,
      value: stats.categories,
      label: t.categories,
      color: "from-blue-500 to-cyan-500",
      suffix: "",
    },
    {
      icon: Clock,
      value: stats.readingTime,
      label: t.readingTime,
      color: "from-emerald-500 to-teal-500",
      suffix: "",
    },
  ];

  return (
    <section
      ref={sectionRef}
      className="py-20 px-4 relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-muted/30"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 30% 50%, hsl(var(--primary) / 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, hsl(var(--accent) / 0.1) 0%, transparent 50%)',
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statistics.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              color={stat.color}
              suffix={stat.suffix}
              delay={index * 100}
              isVisible={isVisible}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  suffix: string;
  delay: number;
  isVisible: boolean;
}

const StatCard = ({ icon: Icon, value, label, color, suffix, delay, isVisible }: StatCardProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-accent/10 transition-all duration-500" />
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/20 group-hover:via-accent/20 group-hover:to-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />

        <CardContent className="p-8 text-center relative z-10">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} p-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg group-hover:shadow-2xl`}
            >
              <Icon className="w-full h-full text-white" />
            </div>
          </div>

          {/* Counter */}
          <div className="mb-3">
            <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-accent transition-all duration-300">
              {count.toLocaleString()}
              {suffix}
            </span>
          </div>

          {/* Label */}
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 font-medium">
            {label}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCounter;
