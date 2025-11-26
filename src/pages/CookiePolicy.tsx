import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CookiePolicyProps {
  language: string;
}

const CookiePolicy = ({ language }: CookiePolicyProps) => {
  const content = language === "sq" ? {
    title: "Politika e Cookies",
    lastUpdated: "Përditësuar më: 25/11/2025",
    intro: "Kjo politikë shpjegon përdorimin e cookies në mysteriarealms.vercel.app",
    sections: [
      {
        title: "1. Çfarë janë cookies?",
        content: "Skedarë të vegjël të ruajtur në pajisjen tuaj që ndihmojnë funksionimin dhe personalizimin e faqes."
      },
      {
        title: "2. Llojet që përdorim",
        content: "✅ Cookies funksionale\n✅ Cookies analitike\n✅ Cookies reklamimi (Google Ads)"
      },
      {
        title: "3. Si t'i menaxhoni",
        content: "Përmes shfletuesit tuaj ose pajisjes mobile."
      },
      {
        title: "4. Pëlqimi",
        content: "Duke përdorur faqen, ju pranoni përdorimin e cookies."
      },
      {
        title: "5. Kontakt",
        content: "📩 contact.mysteriarealms@gmail.com"
      }
    ]
  } : {
    title: "Cookie Policy",
    lastUpdated: "Last Updated: 25/11/2025",
    intro: "This Cookie Policy explains how cookies are used on mysteriarealms.vercel.app.",
    sections: [
      {
        title: "1. What Are Cookies?",
        content: "Cookies are small data files stored on your device to enhance browsing experience and website functionality."
      },
      {
        title: "2. Types of Cookies We Use",
        content: "✅ Functional Cookies\n✅ Analytical Cookies\n✅ Advertising Cookies (Google Ads)"
      },
      {
        title: "3. Managing Cookies",
        content: "Users may adjust cookie settings through:\n\n• Browser controls\n• Device preferences"
      },
      {
        title: "4. Consent",
        content: "By continuing to use the website, you consent to the use of cookies."
      },
      {
        title: "5. Contact",
        content: "📩 contact.mysteriarealms@gmail.com"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{content.title} - Mysteria Realms</title>
        <meta name="description" content={content.intro} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <main className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-3xl">{content.title}</CardTitle>
              <p className="text-muted-foreground">{content.lastUpdated}</p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-lg">{content.intro}</p>
              
              {content.sections.map((section, index) => (
                <div key={index} className="mt-8">
                  <h2>{section.title}</h2>
                  <p className="whitespace-pre-line">{section.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default CookiePolicy;
