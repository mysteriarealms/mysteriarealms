import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Eye, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeaturedArticlesProps {
  language: string;
}

const FeaturedArticles = ({ language }: FeaturedArticlesProps) => {
  const { data: articles, isLoading } = useQuery({
    queryKey: ["featured-articles"],
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
        .order("view_count", { ascending: false })
        .limit(4);

      if (error) throw error;
      return data;
    },
  });

  const translations = {
    en: {
      title: "Featured Stories",
      subtitle: "Most captivating mysteries",
      views: "views",
      readTime: "min read",
    },
    sq: {
      title: "Histori të Zgjedhura",
      subtitle: "Misteret më tërheqëse",
      views: "shikime",
      readTime: "min lexim",
    },
  };

  const t = translations[language as keyof typeof translations];

  // Don't render anything if loading or no articles
  if (isLoading || !articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--accent) / 0.15) 0%, transparent 50%)'
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              {t.title}
            </h2>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground">{t.subtitle}</p>
        </div>

        {/* Featured Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <Card className="h-full overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-2">
                  {/* Featured Image */}
                  {article.featured_image_url && (
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img
                        src={article.featured_image_url}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent opacity-60" />
                      
                      {/* Category Badge */}
                      {categoryName && (
                        <Badge 
                          className="absolute top-3 left-3 bg-primary/90 text-primary-foreground border-0"
                        >
                          {categoryName}
                        </Badge>
                      )}
                    </div>
                  )}

                  <CardContent className="p-5">
                    {/* Title */}
                    <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>

                    {/* Excerpt */}
                    {excerpt && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {excerpt}
                      </p>
                    )}

                    {/* Meta Information */}
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

export default FeaturedArticles;
