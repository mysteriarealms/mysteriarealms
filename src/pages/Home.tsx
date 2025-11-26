import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Ghost, Sparkles, MapPin, Brain } from "lucide-react";
import FeaturedArticles from "@/components/FeaturedArticles";
import LatestArticles from "@/components/LatestArticles";
import StatisticsCounter from "@/components/StatisticsCounter";
import FloatingParticles from "@/components/FloatingParticles";
import MysteriousFog from "@/components/MysteriousFog";
import { useState, useEffect } from "react";

interface HomeProps {
  language: string;
}

const Home = ({ language }: HomeProps) => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const translations = {
    en: {
      hero: "Stories Beyond the Ordinary",
      subtitle: "Explore the unexplained, the mysterious, and the supernatural",
      paranormal: "Paranormal Stories",
      paranormalDesc: "Real historical paranormal cases from verified sources",
      urban: "Urban Legends",
      urbanDesc: "Global and regional legends that captivate minds",
      personal: "Personal Experiences",
      personalDesc: "Real stories from individuals who've encountered the unknown",
      curiosities: "Curiosities & Unexplained",
      curiositiesDesc: "Mysteries that sometimes defy scientific explanation",
      mostRead: "Most Read Stories",
    },
    sq: {
      hero: "Histori Përtej të Zakonshmes",
      subtitle: "Eksploroni të pashpjegueshmen, misteriozen dhe mbinaturoren",
      paranormal: "Histori Paranormale",
      paranormalDesc: "Raste reale historike paranormale nga burime të verifikuara",
      urban: "Legjenda Urbane",
      urbanDesc: "Legjenda globale dhe rajonale që magjepsin mendjet",
      personal: "Përvoja Personale",
      personalDesc: "Histori reale nga individë që kanë hasur të panjohurën",
      curiosities: "Kuriozitete & Të Pashpjegueshme",
      curiositiesDesc: "Mistere që ndonjëherë sfidojnë shpjegimin shkencor",
      mostRead: "Historitë Më të Lexuara",
    },
  };

  const t = translations[language as keyof typeof translations];

  const categories = [
    {
      title: t.paranormal,
      description: t.paranormalDesc,
      icon: Ghost,
      link: "/paranormal",
      gradient: "from-purple-600/20 to-pink-600/20",
    },
    {
      title: t.urban,
      description: t.urbanDesc,
      icon: MapPin,
      link: "/urban-legends",
      gradient: "from-blue-600/20 to-cyan-600/20",
    },
    {
      title: t.personal,
      description: t.personalDesc,
      icon: Sparkles,
      link: "/personal-experiences",
      gradient: "from-emerald-600/20 to-teal-600/20",
    },
    {
      title: t.curiosities,
      description: t.curiositiesDesc,
      icon: Brain,
      link: "/curiosities",
      gradient: "from-orange-600/20 to-red-600/20",
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section with Enhanced Effects */}
      <section className="relative py-20 px-4 overflow-hidden min-h-[600px] flex items-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />
        <div 
          className="absolute inset-0 transition-transform duration-700 ease-out"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.15) 0%, transparent 50%)',
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
        
        {/* Mysterious fog effect */}
        <MysteriousFog />
        
        {/* Floating particles */}
        <FloatingParticles />

        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Content with parallax */}
        <div 
          className="container mx-auto text-center relative z-10 transition-transform duration-500"
          style={{
            transform: `translateY(${scrollY * -0.15}px)`,
          }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            Mysteria Realm
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200 drop-shadow-lg">
            {t.hero}
          </p>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            {t.subtitle}
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Link
                key={category.link}
                to={category.link}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-2 border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden">
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-accent/10 transition-all duration-500" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/20 group-hover:via-accent/20 group-hover:to-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                  
                  <CardContent className="p-8 relative z-10">
                    <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${category.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-primary/50`}>
                      <category.icon className="w-8 h-8 text-foreground group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                      {category.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <FeaturedArticles language={language} />

      {/* Latest Articles Section */}
      <LatestArticles language={language} />

      {/* Statistics Counter Section */}
      <StatisticsCounter language={language} />

      {/* Most Read Section */}
      <section className="py-16 px-4 bg-muted/30 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-background to-accent/5" />
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <Link to="/most-read" className="group block">
            <Card className="transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 border-border/50 bg-card/50 backdrop-blur-sm relative overflow-hidden hover:-translate-y-1">
              {/* Animated glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/20 group-hover:via-accent/10 group-hover:to-primary/20 transition-all duration-700" />
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/30 group-hover:via-accent/30 group-hover:to-primary/30 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-700 -z-10" />
              
              <CardContent className="p-8 flex items-center justify-between relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <Eye className="w-8 h-8 text-primary group-hover:scale-110 group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] transition-all duration-300" />
                    <h3 className="text-3xl font-bold group-hover:text-primary transition-colors duration-300">
                      {t.mostRead}
                    </h3>
                  </div>
                  <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    {language === "en" 
                      ? "Discover the articles captivating our readers the most" 
                      : "Zbuloni artikujt që po magjepsin më shumë lexuesit tanë"}
                  </p>
                </div>
                <div className="text-4xl group-hover:translate-x-3 group-hover:text-primary transition-all duration-300">
                  →
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
