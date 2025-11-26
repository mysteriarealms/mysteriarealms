import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie } from "lucide-react";

interface CookieConsentProps {
  language: string;
}

const CookieConsent = ({ language }: CookieConsentProps) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setShowBanner(false);
    // Initialize Google AdSense or other tracking here
    console.log("Cookie consent accepted - Initialize tracking");
  };

  const handleReject = () => {
    localStorage.setItem("cookie-consent", "rejected");
    setShowBanner(false);
    console.log("Cookie consent rejected");
  };

  const content = language === "sq" ? {
    title: "Cookies dhe Privatësia",
    message: "Ne përdorim cookies dhe teknologji të ngjashme për të përmirësuar përvojën tuaj, për të analizuar trafikun dhe për të shfaqur reklama të personalizuara përmes Google AdSense. Duke pranuar, ju pajtoheni me përdorimin e cookies.",
    accept: "Prano të gjitha",
    reject: "Refuzo",
    learnMore: "Mëso më shumë"
  } : {
    title: "Cookies and Privacy",
    message: "We use cookies and similar technologies to improve your experience, analyze traffic, and display personalized ads through Google AdSense. By accepting, you agree to the use of cookies.",
    accept: "Accept All",
    reject: "Reject",
    learnMore: "Learn More"
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
      <Card className="max-w-4xl mx-auto bg-card border-border shadow-2xl">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <Cookie className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{content.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {content.message}
              </p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleAccept} size="sm">
                  {content.accept}
                </Button>
                <Button onClick={handleReject} variant="outline" size="sm">
                  {content.reject}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.location.href = "/privacy-policy"}
                >
                  {content.learnMore}
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReject}
              className="flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CookieConsent;
