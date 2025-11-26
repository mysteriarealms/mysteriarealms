import { Search, X, Clock, TrendingUp, FileText } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "./ui/skeleton";

interface SearchBarProps {
  language: string;
  onClose?: () => void;
}

const SEARCH_HISTORY_KEY = "mysteria_search_history";
const MAX_HISTORY_ITEMS = 5;

interface AutocompleteSuggestion {
  id: string;
  title: string;
  slug: string;
}

const SearchBar = ({ language, onClose }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    inputRef.current?.focus();
    loadSearchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Debounce autocomplete search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setLoadingSuggestions(true);
      debounceTimerRef.current = setTimeout(() => {
        fetchAutocompleteSuggestions();
      }, 300);
    } else {
      setAutocompleteSuggestions([]);
      setLoadingSuggestions(false);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, language]);

  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (history) {
        setSearchHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  };

  const saveToHistory = (query: string) => {
    try {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) return;

      let history = [...searchHistory];
      
      // Remove if already exists
      history = history.filter(item => item.toLowerCase() !== trimmedQuery.toLowerCase());
      
      // Add to beginning
      history.unshift(trimmedQuery);
      
      // Keep only MAX_HISTORY_ITEMS
      history = history.slice(0, MAX_HISTORY_ITEMS);
      
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
      setSearchHistory(history);
    } catch (error) {
      console.error("Error saving search history:", error);
    }
  };

  const clearHistory = () => {
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
      setSearchHistory([]);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  };

  const fetchAutocompleteSuggestions = async () => {
    try {
      const titleField = language === "en" ? "title_en" : "title_sq";
      
      const { data, error } = await supabase
        .from("articles")
        .select(`id, title_en, title_sq, slug`)
        .eq("published", true)
        .or(`title_en.ilike.%${searchQuery}%,title_sq.ilike.%${searchQuery}%`)
        .order("view_count", { ascending: false })
        .limit(5);

      if (error) throw error;

      const suggestions = (data || []).map(article => ({
        id: article.id,
        title: language === "en" ? article.title_en : article.title_sq,
        slug: article.slug,
      }));

      setAutocompleteSuggestions(suggestions);
    } catch (error) {
      console.error("Error fetching autocomplete suggestions:", error);
      setAutocompleteSuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSearch = (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      saveToHistory(searchTerm);
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      onClose?.();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
    handleSearch(fakeEvent, suggestion);
  };

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const translations = {
    en: {
      placeholder: "Search articles...",
      search: "Search",
      recentSearches: "Recent Searches",
      clearHistory: "Clear History",
      noHistory: "No recent searches",
      suggestions: "Suggestions",
      loading: "Loading...",
    },
    sq: {
      placeholder: "Kërko artikuj...",
      search: "Kërko",
      recentSearches: "Kërkimet e Fundit",
      clearHistory: "Pastro Historikun",
      noHistory: "Nuk ka kërkime të fundit",
      suggestions: "Sugjerime",
      loading: "Duke ngarkuar...",
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={(e) => handleSearch(e)} className="relative">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={t.placeholder}
            className="pl-10 pr-20 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-12 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!searchQuery.trim()}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
          >
            {t.search}
          </Button>
        </div>
      </form>

      {/* Autocomplete & Search Suggestions */}
      {showSuggestions && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-2 bg-card backdrop-blur-md border-border/50 shadow-xl shadow-primary/10 animate-in fade-in slide-in-from-top-2 duration-200 z-50">
          {/* Autocomplete Suggestions */}
          {searchQuery.trim().length >= 2 && (
            <>
              <div className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-muted-foreground">
                <FileText className="w-4 h-4" />
                {t.suggestions}
              </div>
              <div className="py-1 mb-2">
                {loadingSuggestions ? (
                  <div className="px-3 py-2">
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : autocompleteSuggestions.length > 0 ? (
                  autocompleteSuggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => navigate(`/article/${suggestion.slug}`)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/50 rounded-md transition-colors group animate-in fade-in slide-in-from-top-1 duration-200"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <span className="flex-1 text-sm group-hover:text-primary transition-colors line-clamp-1">
                        {suggestion.title}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-muted-foreground">
                    {t.loading}
                  </div>
                )}
              </div>
              {searchHistory.length > 0 && (
                <div className="border-t border-border/50 my-2" />
              )}
            </>
          )}

          {/* Recent Searches */}
          {searchHistory.length > 0 && (
            <>
              <div className="flex items-center justify-between px-3 py-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {t.recentSearches}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t.clearHistory}
                </Button>
              </div>
              <div className="py-1">
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent/50 rounded-md transition-colors group animate-in fade-in slide-in-from-top-1 duration-200"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TrendingUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="flex-1 text-sm group-hover:text-primary transition-colors">
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};

export default SearchBar;
