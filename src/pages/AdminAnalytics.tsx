import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Eye, FileText, TrendingUp, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Article {
  id: string;
  title_en: string;
  view_count: number;
  reading_time_minutes: number | null;
}

const AdminAnalytics = () => {
  const [totalViews, setTotalViews] = useState(0);
  const [totalArticles, setTotalArticles] = useState(0);
  const [averageReadTime, setAverageReadTime] = useState(0);
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--secondary))", "hsl(var(--muted))"];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Total views
      const { data: viewsData, error: viewsError } = await supabase
        .from("articles")
        .select("view_count")
        .eq("published", true);

      if (viewsError) throw viewsError;

      const totalViewsCount = viewsData?.reduce((sum, article) => sum + article.view_count, 0) || 0;
      setTotalViews(totalViewsCount);

      // Total articles
      const { count, error: countError } = await supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("published", true);

      if (countError) throw countError;
      setTotalArticles(count || 0);

      // Average reading time
      const { data: readTimeData, error: readTimeError } = await supabase
        .from("articles")
        .select("reading_time_minutes")
        .eq("published", true);

      if (readTimeError) throw readTimeError;

      const avgTime =
        readTimeData?.reduce((sum, article) => sum + (article.reading_time_minutes || 0), 0) /
          (readTimeData?.length || 1) || 0;
      setAverageReadTime(Math.round(avgTime));

      // Top articles
      const { data: topArticlesData, error: topArticlesError } = await supabase
        .from("articles")
        .select("id, title_en, view_count, reading_time_minutes")
        .eq("published", true)
        .order("view_count", { ascending: false })
        .limit(5);

      if (topArticlesError) throw topArticlesError;
      setTopArticles(topArticlesData || []);

      // Category stats
      const { data: categoryData, error: categoryError } = await supabase
        .from("articles")
        .select("category_id, categories(name_en)")
        .eq("published", true);

      if (categoryError) throw categoryError;

      const categoryMap = new Map<string, number>();
      categoryData?.forEach((article: any) => {
        const categoryName = article.categories?.name_en || "Uncategorized";
        categoryMap.set(categoryName, (categoryMap.get(categoryName) || 0) + 1);
      });

      const categoryStatsData = Array.from(categoryMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));

      setCategoryStats(categoryStatsData);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your content performance and insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Across all published articles
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalArticles}</div>
              <p className="text-xs text-muted-foreground">
                Published content pieces
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Reading Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageReadTime} min</div>
              <p className="text-xs text-muted-foreground">
                Per article average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Engagement</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Views per article
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Articles Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Articles</CardTitle>
              <CardDescription>Top 5 articles by view count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topArticles}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title_en" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="view_count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Articles by Category</CardTitle>
              <CardDescription>Distribution of published content</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Articles List */}
        <Card>
          <CardHeader>
            <CardTitle>Top Articles Detail</CardTitle>
            <CardDescription>Most viewed articles with statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{article.title_en}</p>
                      <p className="text-sm text-muted-foreground">
                        {article.reading_time_minutes || 0} min read
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">{article.view_count}</span>
                  </div>
                </div>
              ))}
              {topArticles.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No articles found. Publish some content to see analytics.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminAnalytics;
