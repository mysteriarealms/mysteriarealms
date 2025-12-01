import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, LogOut, FolderOpen, BarChart3, MessageSquare, Trophy } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </Link>

            <nav className="hidden md:flex items-center space-x-2">
              <Link to="/admin">
                <Button
                  variant={isActive("/admin") ? "default" : "ghost"}
                  size="sm"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link to="/admin/articles">
                <Button
                  variant={location.pathname.startsWith("/admin/articles") ? "default" : "ghost"}
                  size="sm"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Articles
                </Button>
              </Link>
              <Link to="/admin/categories">
                <Button
                  variant={isActive("/admin/categories") ? "default" : "ghost"}
                  size="sm"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Categories
                </Button>
              </Link>
              <Link to="/admin/analytics">
                <Button
                  variant={isActive("/admin/analytics") ? "default" : "ghost"}
                  size="sm"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link to="/admin/comments">
                <Button
                  variant={isActive("/admin/comments") ? "default" : "ghost"}
                  size="sm"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Comments
                </Button>
              </Link>
              <Link to="/admin/mysteries">
                <Button
                  variant={isActive("/admin/mysteries") ? "default" : "ghost"}
                  size="sm"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  Mysteries
                </Button>
              </Link>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </nav>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around py-3 px-2">
          <Link to="/admin">
            <Button
              variant={isActive("/admin") ? "default" : "ghost"}
              size="sm"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/admin/articles">
            <Button
              variant={location.pathname.startsWith("/admin/articles") ? "default" : "ghost"}
              size="sm"
            >
              <FileText className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/admin/categories">
            <Button
              variant={isActive("/admin/categories") ? "default" : "ghost"}
              size="sm"
            >
              <FolderOpen className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/admin/analytics">
            <Button
              variant={isActive("/admin/analytics") ? "default" : "ghost"}
              size="sm"
            >
              <BarChart3 className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/admin/comments">
            <Button
              variant={isActive("/admin/comments") ? "default" : "ghost"}
              size="sm"
            >
              <MessageSquare className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/admin/mysteries">
            <Button
              variant={isActive("/admin/mysteries") ? "default" : "ghost"}
              size="sm"
            >
              <Trophy className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="pt-16 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
