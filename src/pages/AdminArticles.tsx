import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Eye, Edit, Trash2, CheckSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Article {
  id: string;
  title_en: string;
  title_sq: string;
  published: boolean;
  view_count: number;
  created_at: string;
  category_id: string | null;
  categories: { name_en: string } | null;
}

const AdminArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticles, setSelectedArticles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*, categories(name_en)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Article deleted successfully",
      });

      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleArticleSelection = (id: string) => {
    const newSelected = new Set(selectedArticles);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedArticles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map(a => a.id)));
    }
  };

  const handleBulkPublish = async () => {
    if (selectedArticles.size === 0) return;

    try {
      const { error } = await supabase
        .from("articles")
        .update({ published: true })
        .in("id", Array.from(selectedArticles));

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedArticles.size} article(s) published`,
      });

      setSelectedArticles(new Set());
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkUnpublish = async () => {
    if (selectedArticles.size === 0) return;

    try {
      const { error } = await supabase
        .from("articles")
        .update({ published: false })
        .in("id", Array.from(selectedArticles));

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedArticles.size} article(s) unpublished`,
      });

      setSelectedArticles(new Set());
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedArticles.size === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedArticles.size} article(s)?`)) return;

    try {
      const { error } = await supabase
        .from("articles")
        .delete()
        .in("id", Array.from(selectedArticles));

      if (error) throw error;

      toast({
        title: "Success",
        description: `${selectedArticles.size} article(s) deleted`,
      });

      setSelectedArticles(new Set());
      fetchArticles();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Manage Articles</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your content
            </p>
          </div>
          <Link to="/admin/articles/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </Link>
        </div>

        {articles.length > 0 && (
          <div className="mb-4 flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
            <Checkbox
              checked={selectedArticles.size === articles.length}
              onCheckedChange={toggleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              {selectedArticles.size > 0 
                ? `${selectedArticles.size} selected` 
                : "Select all"}
            </span>
            {selectedArticles.size > 0 && (
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={handleBulkPublish}>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Publish
                </Button>
                <Button variant="outline" size="sm" onClick={handleBulkUnpublish}>
                  Unpublish
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {articles.map((article) => (
            <Card key={article.id}>
              <CardHeader>
                <div className="flex gap-4 items-start">
                  <Checkbox
                    checked={selectedArticles.has(article.id)}
                    onCheckedChange={() => toggleArticleSelection(article.id)}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                    <CardTitle className="mb-2">{article.title_en}</CardTitle>
                    <CardDescription>{article.title_sq}</CardDescription>
                    <div className="flex gap-2 mt-3">
                      {article.published ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                      {article.categories && (
                        <Badge variant="outline">{article.categories.name_en}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/admin/articles/edit/${article.id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {article.view_count} views
                  </span>
                  <span>
                    Created: {format(new Date(article.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {articles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No articles yet</p>
                <Link to="/admin/articles/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first article
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminArticles;
