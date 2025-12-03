import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Comments from "@/components/Comments";
import { 
  Calendar, 
  Clock, 
  Eye, 
  ArrowLeft, 
  Share2,
  Facebook,
  Twitter,
  MessageCircle,
  Instagram
} from "lucide-react";
import { format } from "date-fns";

interface Article {
  id: string;
  title_en: string;
  title_sq: string;
  content_en: string;
  content_sq: string;
  excerpt_en: string;
  excerpt_sq: string;
  meta_title_en: string;
  meta_title_sq: string;
  meta_description_en: string;
  meta_description_sq: string;
  slug: string;
  featured_image_url: string | null;
  published_at: string;
  reading_time_minutes: number;
  view_count: number;
  category_id: string;
  categories: {
    name_en: string;
    name_sq: string;
    slug: string;
  };
}

interface ArticleDetailProps {
  language: string;
}

const ArticleDetail = ({ language }: ArticleDetailProps) => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*, categories(name_en, name_sq, slug)")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;

      setArticle(data);
      
      // Track view
      await trackView(data.id);
      
      // Fetch related articles
      if (data.category_id) {
        fetchRelatedArticles(data.category_id, data.id);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Article not found",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const trackView = async (articleId: string) => {
    try {
      // Generate browser fingerprint
      const fingerprint = await generateFingerprint();
      
      const { error } = await supabase
        .from("article_views")
        .insert({
          article_id: articleId,
          fingerprint: fingerprint,
          ip_address: null, // IP tracking would need server-side implementation
        });

      if (!error) {
        // Increment view count
        await supabase.rpc("increment_view_count", { article_id: articleId });
      }
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const generateFingerprint = async (): Promise<string> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Browser Fingerprint", 2, 15);
    }
    
    const fingerprint = canvas.toDataURL();
    const hash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(
        fingerprint +
        navigator.userAgent +
        navigator.language +
        screen.colorDepth +
        screen.width +
        screen.height
      )
    );
    
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };

  const fetchRelatedArticles = async (categoryId: string, currentArticleId: string) => {
    const { data } = await supabase
      .from("articles")
      .select("*, categories(name_en, name_sq, slug)")
      .eq("category_id", categoryId)
      .eq("published", true)
      .neq("id", currentArticleId)
      .limit(3);

    if (data) {
      setRelatedArticles(data);
    }
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  };

  const shareOnTwitter = () => {
    const url = window.location.href;
    const text = article ? (language === "sq" ? article.title_sq : article.title_en) : "";
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareOnWhatsApp = () => {
    const url = window.location.href;
    const text = article ? (language === "sq" ? article.title_sq : article.title_en) : "";
    window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank");
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: language === "sq" ? "Lidhja u kopjua" : "Link copied",
      description: language === "sq" ? "Lidhja u kopjua në clipboard" : "Link copied to clipboard",
    });
  };

  const shareOnInstagram = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: language === "sq" ? "Lidhja u kopjua" : "Link copied",
      description: language === "sq" ? "Ngjit në Instagram Stories" : "Paste in Instagram Stories",
    });
  };

  const shareOnTikTok = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: language === "sq" ? "Lidhja u kopjua" : "Link copied",
      description: language === "sq" ? "Ngjit në TikTok" : "Paste in TikTok",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            {language === "sq" ? "Artikulli nuk u gjet" : "Article not found"}
          </h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {language === "sq" ? "Kthehu në faqen kryesore" : "Back to home"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const title = language === "sq" ? article.title_sq : article.title_en;
  const content = language === "sq" ? article.content_sq : article.content_en;
  const metaTitle = language === "sq" ? (article.meta_title_sq || article.title_sq) : (article.meta_title_en || article.title_en);
  const metaDescription = language === "sq" ? (article.meta_description_sq || article.excerpt_sq) : (article.meta_description_en || article.excerpt_en);
  const categoryName = language === "sq" ? article.categories.name_sq : article.categories.name_en;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": metaDescription,
    "image": article.featured_image_url,
    "datePublished": article.published_at,
    "author": {
      "@type": "Organization",
      "name": "Mysteria Realm"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Mysteria Realm",
      "logo": {
        "@type": "ImageObject",
        "url": `${window.location.origin}/favicon.ico`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  return (
    <>
      <Helmet>
        <title>{metaTitle} | Mysteria Realm</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={window.location.href} />
        {article.featured_image_url && (
          <meta property="og:image" content={article.featured_image_url} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        {article.featured_image_url && (
          <meta name="twitter:image" content={article.featured_image_url} />
        )}
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <article className="min-h-screen pt-16 overflow-x-hidden">
        <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl overflow-hidden">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6 md:mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2 flex-shrink-0" />
            {language === "sq" ? "Kthehu pas" : "Back"}
          </Link>

          {article.featured_image_url && (
            <img
              src={article.featured_image_url}
              alt={title}
              className="w-full h-[200px] sm:h-[300px] md:h-[400px] object-cover rounded-lg mb-6 md:mb-8"
            />
          )}

          <div className="mb-4 md:mb-6">
            <Link to={`/category/${article.categories.slug}`}>
              <Badge variant="outline" className="mb-3 md:mb-4">
                {categoryName}
              </Badge>
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 break-words">{title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs sm:text-sm text-muted-foreground mb-6 md:mb-8">
            <span className="flex items-center gap-1 md:gap-2">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{language === "sq" ? "Publikuar nga Admin" : "Posted by Admin"}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 md:gap-2">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{format(new Date(article.published_at), "MMM d, yyyy")}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 md:gap-2">
              <Clock className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{article.reading_time_minutes} {language === "sq" ? "min" : "min"}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1 md:gap-2">
              <Eye className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{article.view_count} {language === "sq" ? "shikime" : "views"}</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
            <Button onClick={shareOnFacebook} variant="outline" size="sm" className="text-xs sm:text-sm">
              <Facebook className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">Facebook</span>
            </Button>
            <Button onClick={shareOnTwitter} variant="outline" size="sm" className="text-xs sm:text-sm">
              <Twitter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">Twitter</span>
            </Button>
            <Button onClick={shareOnWhatsApp} variant="outline" size="sm" className="text-xs sm:text-sm">
              <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">WhatsApp</span>
            </Button>
            <Button onClick={shareOnInstagram} variant="outline" size="sm" className="text-xs sm:text-sm">
              <Instagram className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">Instagram</span>
            </Button>
            <Button onClick={shareOnTikTok} variant="outline" size="sm" className="text-xs sm:text-sm">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
              <span className="hidden xs:inline">TikTok</span>
            </Button>
            <Button onClick={copyLink} variant="outline" size="sm" className="text-xs sm:text-sm">
              <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">{language === "sq" ? "Kopjo" : "Copy"}</span>
            </Button>
          </div>

          <Separator className="mb-6 md:mb-8" />

          <div 
            className="prose prose-invert max-w-none prose-sm sm:prose-base overflow-hidden break-words [&_img]:max-w-full [&_pre]:overflow-x-auto [&_table]:overflow-x-auto [&_table]:block"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {relatedArticles.length > 0 && (
            <>
              <Separator className="my-12" />
              <div>
                <h2 className="text-3xl font-bold mb-6">
                  {language === "sq" ? "Artikuj të ngjashëm" : "Related Articles"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedArticles.map((related) => (
                    <Link
                      key={related.id}
                      to={`/article/${related.slug}`}
                      className="group"
                    >
                      <div className="bg-card rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        {related.featured_image_url && (
                          <img
                            src={related.featured_image_url}
                            alt={language === "sq" ? related.title_sq : related.title_en}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-bold mb-2 line-clamp-2">
                            {language === "sq" ? related.title_sq : related.title_en}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Eye className="w-3 h-3" />
                            {related.view_count}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          <Separator className="my-12" />
          
          <Comments articleId={article.id} language={language} />
        </div>
      </article>
    </>
  );
};

export default ArticleDetail;
