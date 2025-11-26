import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FolderOpen, BarChart3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminSecurityInfo from "@/components/AdminSecurityInfo";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your content and monitor your site
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Articles
              </CardTitle>
              <CardDescription>Manage your content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to="/admin/articles">
                  <Button variant="outline" className="w-full justify-start">
                    View All Articles
                  </Button>
                </Link>
                <Link to="/admin/articles/new">
                  <Button className="w-full justify-start">
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Article
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Categories
              </CardTitle>
              <CardDescription>Organize your content</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/categories">
                <Button variant="outline" className="w-full justify-start">
                  Manage Categories
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Analytics
              </CardTitle>
              <CardDescription>Track your performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/analytics">
                <Button variant="outline" className="w-full justify-start">
                  View Analytics
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Security Information */}
        <div className="mb-8">
          <AdminSecurityInfo />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
