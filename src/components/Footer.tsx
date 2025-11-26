import { Link } from "react-router-dom";
import { Instagram, Mail } from "lucide-react";

interface FooterProps {
  language: string;
}

const Footer = ({ language }: FooterProps) => {
  const translations = {
    en: {
      about: "About",
      contact: "Contact",
      privacy: "Privacy Policy",
      terms: "Terms & Conditions",
      cookies: "Cookie Policy",
      followUs: "Follow Us",
    },
    sq: {
      about: "Rreth Nesh",
      contact: "Kontakti",
      privacy: "Politika e Privatësisë",
      terms: "Kushtet e Përdorimit",
      cookies: "Politika e Cookies",
      followUs: "Na Ndiqni",
    },
  };

  const t = translations[language as keyof typeof translations];

  // TikTok icon as SVG since Lucide doesn't have it
  const TikTokIcon = () => (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  );

  return (
    <footer className="bg-card border-t border-border mt-auto relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col gap-8">
          {/* Main footer content */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted-foreground">
              © 2024 Mysteria Realm. All rights reserved.
            </div>
            
            {/* Legal Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/about" className="hover:text-primary transition-colors duration-300">
                {t.about}
              </Link>
              <Link to="/contact" className="hover:text-primary transition-colors duration-300">
                {t.contact}
              </Link>
              <Link to="/privacy-policy" className="hover:text-primary transition-colors duration-300">
                {t.privacy}
              </Link>
              <Link to="/terms" className="hover:text-primary transition-colors duration-300">
                {t.terms}
              </Link>
              <Link to="/cookie-policy" className="hover:text-primary transition-colors duration-300">
                {t.cookies}
              </Link>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="border-t border-border/50 pt-6">
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground font-medium">{t.followUs}</p>
              <div className="flex items-center gap-6">
                {/* TikTok */}
                <div className="group cursor-not-allowed relative">
                  <div className="p-3 rounded-full bg-muted/50 border border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30">
                    <TikTokIcon />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:via-primary/30 group-hover:to-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Coming Soon
                  </span>
                </div>

                {/* Instagram */}
                <div className="group cursor-not-allowed relative">
                  <div className="p-3 rounded-full bg-muted/50 border border-border/50 transition-all duration-300 group-hover:border-accent/50 group-hover:bg-accent/10 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-accent/30">
                    <Instagram className="w-5 h-5" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/0 via-accent/0 to-accent/0 group-hover:from-accent/20 group-hover:via-accent/30 group-hover:to-accent/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Coming Soon
                  </span>
                </div>

                {/* Email */}
                <Link 
                  to="/contact" 
                  className="group relative"
                >
                  <div className="p-3 rounded-full bg-muted/50 border border-border/50 transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/10 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/30">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/20 group-hover:via-primary/30 group-hover:to-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10" />
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Contact Us
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
