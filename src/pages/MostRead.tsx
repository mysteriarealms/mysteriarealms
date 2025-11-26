import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Eye, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: string;
  title_en: string;
  title_sq: string;
  slug: string;
  excerpt_en: string;
  excerpt_sq: string;
  featured_image_url: string;
  reading_time_minutes: number;
  view_count: number;
  published_at: string;
}

interface MostReadProps {
  language: string;
}

const MostRead = ({ language }: MostReadProps) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMostReadArticles();
  }, []);

  const loadMostReadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("view_count", { ascending: false })
        .limit(20);

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error("Error loading most read articles:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center">
          {language === "en" ? "Most Read Stories" : "Historitë Më të Lexuara"}
        </h1>

        {articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {language === "en"
                ? "No articles published yet"
                : "Nuk ka ende artikuj të publikuar"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <Link key={article.id} to={`/article/${article.slug}`}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1 overflow-hidden group relative">
                  {index < 3 && (
                    <div className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                  )}
                  {article.featured_image_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={article.featured_image_url}
                        alt={language === "en" ? article.title_en : article.title_sq}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {language === "en" ? article.title_en : article.title_sq}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {language === "en" ? article.excerpt_en : article.excerpt_sq}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(article.published_at), "MMM d, yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {article.reading_time_minutes} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.view_count}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MostRead;
