import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Upload } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface Category {
  id: string;
  name_en: string;
  name_sq: string;
}

const AdminArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title_en: "",
    title_sq: "",
    slug: "",
    content_en: "",
    content_sq: "",
    excerpt_en: "",
    excerpt_sq: "",
    meta_title_en: "",
    meta_title_sq: "",
    meta_description_en: "",
    meta_description_sq: "",
    category_id: "",
    featured_image_url: "",
    published: false,
    reading_time_minutes: 5,
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchArticle(id);
    }
  }, [id]);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*");
    setCategories(data || []);
  };

  const fetchArticle = async (articleId: string) => {
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData(data);
        if (data.featured_image_url) {
          setImagePreview(data.featured_image_url);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (value: string, lang: "en" | "sq") => {
    setFormData((prev) => {
      const newData = { ...prev, [`title_${lang}`]: value };
      if (lang === "en" && !id) {
        newData.slug = generateSlug(value);
      }
      return newData;
    });
  };

  const calculateReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const text = content.replace(/<[^>]*>/g, "");
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.featured_image_url;

    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from("article-images")
      .upload(filePath, imageFile);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from("article-images")
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imageUrl = await uploadImage();
      const readingTime = calculateReadingTime(formData.content_en);

      const articleData = {
        ...formData,
        featured_image_url: imageUrl,
        reading_time_minutes: readingTime,
        published_at: formData.published ? new Date().toISOString() : null,
      };

      let error;
      if (id) {
        ({ error } = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", id));
      } else {
        ({ error } = await supabase.from("articles").insert([articleData]));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Article ${id ? "updated" : "created"} successfully`,
      });

      navigate("/admin/articles");
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

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div className="min-h-screen pt-16 pb-12">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/articles")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Articles
        </Button>

        <h1 className="text-4xl font-bold mb-8">
          {id ? "Edit Article" : "Create New Article"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Article Details</CardTitle>
              <CardDescription>
                Fill in the article information in both languages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="en">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="sq">Albanian</TabsTrigger>
                </TabsList>

                <TabsContent value="en" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title_en">Title (English)</Label>
                    <Input
                      id="title_en"
                      value={formData.title_en}
                      onChange={(e) => handleTitleChange(e.target.value, "en")}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt_en">Excerpt (English)</Label>
                    <Textarea
                      id="excerpt_en"
                      value={formData.excerpt_en}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt_en: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content_en">Content (English)</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.content_en}
                      onChange={(value) =>
                        setFormData({ ...formData, content_en: value })
                      }
                      modules={quillModules}
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_title_en">Meta Title (English)</Label>
                    <Input
                      id="meta_title_en"
                      value={formData.meta_title_en}
                      onChange={(e) =>
                        setFormData({ ...formData, meta_title_en: e.target.value })
                      }
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description_en">
                      Meta Description (English)
                    </Label>
                    <Textarea
                      id="meta_description_en"
                      value={formData.meta_description_en}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meta_description_en: e.target.value,
                        })
                      }
                      maxLength={160}
                      rows={2}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sq" className="space-y-4 mt-4">
                  <div>
                    <Label htmlFor="title_sq">Title (Albanian)</Label>
                    <Input
                      id="title_sq"
                      value={formData.title_sq}
                      onChange={(e) => handleTitleChange(e.target.value, "sq")}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt_sq">Excerpt (Albanian)</Label>
                    <Textarea
                      id="excerpt_sq"
                      value={formData.excerpt_sq}
                      onChange={(e) =>
                        setFormData({ ...formData, excerpt_sq: e.target.value })
                      }
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content_sq">Content (Albanian)</Label>
                    <ReactQuill
                      theme="snow"
                      value={formData.content_sq}
                      onChange={(value) =>
                        setFormData({ ...formData, content_sq: value })
                      }
                      modules={quillModules}
                      className="bg-background"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_title_sq">Meta Title (Albanian)</Label>
                    <Input
                      id="meta_title_sq"
                      value={formData.meta_title_sq}
                      onChange={(e) =>
                        setFormData({ ...formData, meta_title_sq: e.target.value })
                      }
                      maxLength={60}
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description_sq">
                      Meta Description (Albanian)
                    </Label>
                    <Textarea
                      id="meta_description_sq"
                      value={formData.meta_description_sq}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          meta_description_sq: e.target.value,
                        })
                      }
                      maxLength={160}
                      rows={2}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">Featured Image</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Upload className="w-5 h-5 text-muted-foreground" />
                </div>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-4 rounded-lg max-h-48 object-cover"
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/articles")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : id ? "Update Article" : "Create Article"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminArticleEditor;
