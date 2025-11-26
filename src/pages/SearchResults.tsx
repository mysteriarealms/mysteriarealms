import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Clock, ArrowRight, Filter, X, ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: string;
  title_en: string;
  title_sq: string;
  excerpt_en: string | null;
  excerpt_sq: string | null;
  slug: string;
  published_at: string | null;
  reading_time_minutes: number | null;
  view_count: number;
  featured_image_url: string | null;
  category_id: string | null;
  categories?: {
    name_en: string;
    name_sq: string;
    slug: string;
  };
}

interface Category {
  id: string;
  name_en: string;
  name_sq: string;
  slug: string;
}

interface SearchResultsProps {
  language: string;
}

type SortOption = "relevance" | "date" | "views" | "reading_time";

const SearchResults = ({ language }: SearchResultsProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";
  const sortBy = (searchParams.get("sort") as SortOption) || "relevance";
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      searchArticles();
    } else {
      setArticles([]);
      setFilteredArticles([]);
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    filterArticles();
  }, [articles, categoryFilter]);

  useEffect(() => {
    sortArticles();
  }, [filteredArticles, sortBy]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name_en");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const filterArticles = () => {
    if (!categoryFilter) {
      setFilteredArticles(articles);
      setTotalResults(articles.length);
    } else {
      const filtered = articles.filter(
        article => article.categories?.slug === categoryFilter
      );
      setFilteredArticles(filtered);
      setTotalResults(filtered.length);
    }
  };

  const handleCategoryFilter = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams);
    if (categorySlug) {
      params.set("category", categorySlug);
    } else {
      params.delete("category");
    }
    setSearchParams(params);
  };

  const handleSortChange = (value: SortOption) => {
    const params = new URLSearchParams(searchParams);
    if (value === "relevance") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    setSearchParams(params);
  };

  const sortArticles = () => {
    const sorted = [...filteredArticles];
    
    switch (sortBy) {
      case "date":
        sorted.sort((a, b) => {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateB - dateA;
        });
        break;
      case "views":
        sorted.sort((a, b) => b.view_count - a.view_count);
        break;
      case "reading_time":
        sorted.sort((a, b) => {
          const timeA = a.reading_time_minutes || 0;
          const timeB = b.reading_time_minutes || 0;
          return timeA - timeB;
        });
        break;
      case "relevance":
      default:
        // Already sorted by relevance from the query
        break;
    }

    setFilteredArticles(sorted);
  };

  const searchArticles = async () => {
    setLoading(true);
    try {
      // Search in both language fields for title and content, include categories
      const { data, error } = await supabase
        .from("articles")
        .select(`
          *,
          categories (
            name_en,
            name_sq,
            slug
          )
        `)
        .eq("published", true)
        .or(
          `title_en.ilike.%${searchQuery}%,title_sq.ilike.%${searchQuery}%,content_en.ilike.%${searchQuery}%,content_sq.ilike.%${searchQuery}%`
        )
        .order("published_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setArticles(data || []);
    } catch (error) {
      console.error("Error searching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    en: {
      title: "Search Results",
      resultsFor: "Results for",
      results: "result(s)",
      noResults: "No articles found",
      noResultsDesc: "Try different keywords or check your spelling",
      minutes: "min read",
      views: "views",
      readMore: "Read More",
      filterBy: "Filter by Category",
      allCategories: "All Categories",
      clearFilters: "Clear Filters",
      sortBy: "Sort by",
      relevance: "Relevance",
      date: "Latest First",
      viewsSort: "Most Viewed",
      readingTime: "Reading Time",
    },
    sq: {
      title: "Rezultatet e Kërkimit",
      resultsFor: "Rezultate për",
      results: "rezultat(e)",
      noResults: "Nuk u gjetën artikuj",
      noResultsDesc: "Provoni fjalë kyçe të ndryshme ose kontrolloni drejtshkrimin",
      minutes: "min lexim",
      views: "shikime",
      readMore: "Lexo Më Shumë",
      filterBy: "Filtro sipas Kategorisë",
      allCategories: "Të Gjitha Kategoritë",
      clearFilters: "Pastro Filtrat",
      sortBy: "Rendit sipas",
      relevance: "Relevancës",
      date: "Më të Rejat",
      viewsSort: "Më të Shikuarat",
      readingTime: "Kohës së Leximit",
    },
  };

  const t = translations[language as keyof typeof translations];

  if (loading) {
    return (
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16 px-4 min-h-screen">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Search className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t.title}
            </h1>
          </div>
          {searchQuery && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{t.resultsFor}</span>
              <span className="font-semibold text-foreground">"{searchQuery}"</span>
              <span>·</span>
              <span className="text-primary font-semibold">
                {totalResults} {t.results}
              </span>
            </div>
          )}
        </div>

        {/* Filters and Sorting */}
        {articles.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-4">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">{t.filterBy}</h2>
              </div>
              
              {/* Sort Dropdown */}
              <div className="flex items-center gap-3">
                <ArrowUpDown className="w-5 h-5 text-primary" />
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[200px] bg-card border-border/50 hover:border-primary transition-colors">
                    <SelectValue placeholder={t.sortBy} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50 z-50">
                    <SelectItem value="relevance" className="cursor-pointer hover:bg-accent">
                      {t.relevance}
                    </SelectItem>
                    <SelectItem value="date" className="cursor-pointer hover:bg-accent">
                      {t.date}
                    </SelectItem>
                    <SelectItem value="views" className="cursor-pointer hover:bg-accent">
                      {t.viewsSort}
                    </SelectItem>
                    <SelectItem value="reading_time" className="cursor-pointer hover:bg-accent">
                      {t.readingTime}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={!categoryFilter ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryFilter("")}
                className="transition-all hover:scale-105"
              >
                {t.allCategories}
              </Button>
              {categories.map((category) => {
                const articleCount = articles.filter(
                  a => a.categories?.slug === category.slug
                ).length;
                
                if (articleCount === 0) return null;

                return (
                  <Button
                    key={category.id}
                    variant={categoryFilter === category.slug ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleCategoryFilter(category.slug)}
                    className="transition-all hover:scale-105 group"
                  >
                    {language === "en" ? category.name_en : category.name_sq}
                    <Badge 
                      variant="secondary" 
                      className="ml-2 group-hover:bg-primary/20"
                    >
                      {articleCount}
                    </Badge>
                  </Button>
                );
              })}
            </div>
            {categoryFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCategoryFilter("")}
                className="mt-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                {t.clearFilters}
              </Button>
            )}
          </div>
        )}

        {/* Results */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block p-6 rounded-full bg-muted/50 mb-6">
              <Search className="w-16 h-16 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-3">{t.noResults}</h2>
            <p className="text-muted-foreground">{t.noResultsDesc}</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredArticles.map((article, index) => (
              <Link
                key={article.id}
                to={`/article/${article.slug}`}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Card className="transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/10 group-hover:via-accent/5 group-hover:to-primary/10 transition-all duration-500" />
                  
                  <CardContent className="p-0 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Image */}
                      {article.featured_image_url && (
                        <div className="md:w-72 h-48 md:h-auto overflow-hidden">
                          <img
                            src={article.featured_image_url}
                            alt={language === "en" ? article.title_en : article.title_sq}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <h2 className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2 flex-1">
                            {language === "en" ? article.title_en : article.title_sq}
                          </h2>
                          {article.categories && (
                            <Badge variant="secondary" className="shrink-0">
                              {language === "en" ? article.categories.name_en : article.categories.name_sq}
                            </Badge>
                          )}
                        </div>
                        
                        {(article.excerpt_en || article.excerpt_sq) && (
                          <p className="text-muted-foreground mb-4 line-clamp-2">
                            {language === "en" ? article.excerpt_en : article.excerpt_sq}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          {article.published_at && (
                            <span className="flex items-center gap-1.5">
                              {format(new Date(article.published_at), "MMM dd, yyyy")}
                            </span>
                          )}
                          {article.reading_time_minutes && (
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              {article.reading_time_minutes} {t.minutes}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-4 h-4" />
                            {article.view_count} {t.views}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-primary font-semibold group-hover:gap-4 transition-all">
                          <span>{t.readMore}</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
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

export default SearchResults;
