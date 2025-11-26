import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Eye, Clock, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface LatestArticlesProps {
  language: string;
}

const LatestArticles = ({ language }: LatestArticlesProps) => {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["latest-articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select(`
          id,
          slug,
          title_en,
          title_sq,
          excerpt_en,
          excerpt_sq,
          featured_image_url,
          view_count,
          reading_time_minutes,
          published_at,
          category_id,
          categories (
            name_en,
            name_sq,
            slug
          )
        `)
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const translations = {
    en: {
      title: "Latest Mysteries",
      subtitle: "Recently uncovered stories",
      views: "views",
      readTime: "min read",
      published: "Published",
    },
    sq: {
      title: "Misteret e Fundit",
      subtitle: "Histori të zbuluara së fundmi",
      views: "shikime",
      readTime: "min lexim",
      published: "Publikuar",
    },
  };

  const t = translations[language as keyof typeof translations];

  // Loading skeleton
  if (isLoading) {
    return (
      <section className="py-20 px-4 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4 bg-primary/10" />
            <Skeleton className="h-6 w-48 mx-auto bg-muted" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm animate-pulse">
                <Skeleton className="h-48 w-full bg-muted" />
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-4 w-20 bg-primary/20" />
                  <Skeleton className="h-6 w-full bg-muted" />
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-16 w-full bg-muted/50" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24 bg-muted" />
                    <Skeleton className="h-4 w-20 bg-muted" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no articles
  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 bg-muted/20 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-accent/5 to-background pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 80% 20%, hsl(var(--accent) / 0.1) 0%, transparent 50%)'
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
            {t.title}
          </h2>
          <p className="text-xl text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => {
            const title = language === "sq" ? article.title_sq : article.title_en;
            const excerpt = language === "sq" ? article.excerpt_sq : article.excerpt_en;
            const categoryName = article.categories
              ? language === "sq"
                ? article.categories.name_sq
                : article.categories.name_en
              : "";

            return (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-2xl hover:shadow-accent/20 hover:-translate-y-2 relative">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/0 via-accent/0 to-primary/0 group-hover:from-accent/10 group-hover:via-accent/5 group-hover:to-primary/10 transition-all duration-500" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/0 via-primary/0 to-accent/0 group-hover:from-accent/20 group-hover:via-primary/20 group-hover:to-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />

                  {/* Featured Image */}
                  {article.featured_image_url && (
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={article.featured_image_url}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                      
                      {/* Category Badge */}
                      {categoryName && (
                        <Badge 
                          className="absolute top-3 left-3 bg-accent/90 text-accent-foreground border-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/50 transition-all duration-300"
                        >
                          {categoryName}
                        </Badge>
                      )}
                    </div>
                  )}

                  <CardContent className="p-5 relative z-10">
                    {/* Title */}
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-accent transition-colors duration-300">
                      {title}
                    </h3>

                    {/* Excerpt */}
                    {excerpt && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3 group-hover:text-foreground transition-colors duration-300">
                        {excerpt}
                      </p>
                    )}

                    {/* Meta Information */}
                    <div className="space-y-2">
                      {article.published_at && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{format(new Date(article.published_at), "MMM d, yyyy")}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{article.view_count.toLocaleString()} {t.views}</span>
                        </div>
                        {article.reading_time_minutes && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{article.reading_time_minutes} {t.readTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LatestArticles;
