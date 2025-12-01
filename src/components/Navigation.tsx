import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Globe, Menu, X, Search } from "lucide-react";
import { useState } from "react";
import SearchBar from "./SearchBar";

interface NavigationProps {
  language: string;
  setLanguage: (lang: string) => void;
}

const Navigation = ({ language, setLanguage }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const translations = {
    en: {
      paranormal: "Paranormal Stories",
      urban: "Urban Legends",
      personal: "Personal Experiences",
      curiosities: "Curiosities",
      mostRead: "Most Read",
      mystery: "Mystery Challenge",
      leaderboard: "Leaderboard",
      about: "About",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      cookies: "Cookie Policy",
    },
    sq: {
      paranormal: "Histori Paranormale",
      urban: "Legjenda Urbane",
      personal: "Përvoja Personale",
      curiosities: "Kuriozitete",
      mostRead: "Më të Lexuarat",
      mystery: "Sfida Misterioze",
      leaderboard: "Renditja",
      about: "Rreth Nesh",
      contact: "Kontakti",
      privacy: "Politika e Privatësisë",
      terms: "Kushtet e Përdorimit",
      cookies: "Politika e Cookies",
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mysteria Realm
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/paranormal" className="text-sm hover:text-primary transition-colors">
                {t.paranormal}
              </Link>
              <Link to="/urban-legends" className="text-sm hover:text-primary transition-colors">
                {t.urban}
              </Link>
              <Link to="/personal-experiences" className="text-sm hover:text-primary transition-colors">
                {t.personal}
              </Link>
              <Link to="/curiosities" className="text-sm hover:text-primary transition-colors">
                {t.curiosities}
              </Link>
              <Link to="/most-read" className="text-sm hover:text-primary transition-colors">
                {t.mostRead}
              </Link>
              <Link to="/mystery-challenge" className="text-sm hover:text-primary transition-colors">
                {t.mystery}
              </Link>
              <Link to="/leaderboard" className="text-sm hover:text-primary transition-colors">
                {t.leaderboard}
              </Link>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
                className="ml-2"
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "sq" : "en")}
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === "en" ? "SQ" : "EN"}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-2 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {searchOpen && (
            <div className="py-4 border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
              <SearchBar language={language} onClose={() => setSearchOpen(false)} />
            </div>
          )}

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <Link
                to="/paranormal"
                className="block text-sm hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.paranormal}
              </Link>
              <Link
                to="/urban-legends"
                className="block text-sm hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.urban}
              </Link>
              <Link
                to="/personal-experiences"
                className="block text-sm hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.personal}
              </Link>
              <Link
                to="/curiosities"
                className="block text-sm hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.curiosities}
              </Link>
              <Link
                to="/most-read"
                className="block text-sm hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.mostRead}
              </Link>
              <Link
                to="/mystery-challenge"
                className="block text-sm hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.mystery}
              </Link>
              <Link
                to="/leaderboard"
                className="block text-sm hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t.leaderboard}
              </Link>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === "en" ? "sq" : "en")}
                className="w-full justify-start"
              >
                <Globe className="h-4 w-4 mr-2" />
                {language === "en" ? "Shqip" : "English"}
              </Button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navigation;

