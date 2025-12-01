import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";
import CookieConsent from "./components/CookieConsent";
import AdminLayout from "./components/AdminLayout";
import Home from "./pages/Home";
import CategoryPage from "./pages/CategoryPage";
import MostRead from "./pages/MostRead";
import MysteryChallenge from "./pages/MysteryChallenge";
import Leaderboard from "./pages/Leaderboard";
import SearchResults from "./pages/SearchResults";
import ArticleDetail from "./pages/ArticleDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CookiePolicy from "./pages/CookiePolicy";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticles from "./pages/AdminArticles";
import AdminArticleEditor from "./pages/AdminArticleEditor";
import AdminCategories from "./pages/AdminCategories";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminComments from "./pages/AdminComments";
import AdminMysteries from "./pages/AdminMysteries";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
  const [language, setLanguage] = useState("en");
  const location = useLocation();
  
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdminLogin = location.pathname === '/admin/login';

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && (
        <>
          <Navigation language={language} setLanguage={setLanguage} />
          <CookieConsent language={language} />
          <BackToTop />
        </>
      )}
      
      <div className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home language={language} />} />
          <Route path="/category/:category" element={<CategoryPage language={language} />} />
          <Route path="/paranormal" element={<CategoryPage language={language} />} />
          <Route path="/urban-legends" element={<CategoryPage language={language} />} />
          <Route path="/personal-experiences" element={<CategoryPage language={language} />} />
          <Route path="/curiosities" element={<CategoryPage language={language} />} />
          <Route path="/most-read" element={<MostRead language={language} />} />
          <Route path="/mystery-challenge" element={<MysteryChallenge language={language} />} />
          <Route path="/leaderboard" element={<Leaderboard language={language} />} />
          <Route path="/search" element={<SearchResults language={language} />} />
          <Route path="/article/:slug" element={<ArticleDetail language={language} />} />
          
          {/* Legal Pages */}
          <Route path="/privacy-policy" element={<PrivacyPolicy language={language} />} />
          <Route path="/terms" element={<Terms language={language} />} />
          <Route path="/cookie-policy" element={<CookiePolicy language={language} />} />
          <Route path="/about" element={<About language={language} />} />
          <Route path="/contact" element={<Contact language={language} />} />
          
          {/* Admin Login - No Layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Routes - With Admin Layout */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminArticles />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/new"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminArticleEditor />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles/edit/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminArticleEditor />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminCategories />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/comments"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminComments />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mysteries"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminMysteries />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      
      {!isAdminRoute && <Footer language={language} />}
    </div>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
