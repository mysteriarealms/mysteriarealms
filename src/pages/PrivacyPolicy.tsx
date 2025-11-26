import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrivacyPolicyProps {
  language: string;
}

const PrivacyPolicy = ({ language }: PrivacyPolicyProps) => {
  const content = language === "sq" ? {
    title: "Politika e Privatësisë",
    lastUpdated: "Përditësuar më: 25/11/2025",
    intro: "Kjo Politikë Privatësie shpjegon mënyrën se si Mysteria Realms mbledh, ruan dhe përdor të dhëna të përdoruesve.",
    sections: [
      {
        title: "1. Çfarë informacioni mbledhim",
        content: "Ne mbledhim:\n\n• Të dhëna teknike (IP anonimizuar)\n• Llojin e pajisjes dhe shfletuesit\n• Të dhëna të analitikës statistikore\n• Të dhëna nga cookies reklamimi (Google Ads)\n\nNe nuk mbledhim:\n❌ Të dhëna personale identifikuese\n❌ Adresa, dokumente, identitet, të dhëna financiare"
      },
      {
        title: "2. Si përdorim informacionin",
        content: "Informacionin tuaj e përdorim për:\n\n• Statistika trafiku\n• Optimizim përmbajtjeje\n• Shfaqje reklamash të targetuara"
      },
      {
        title: "3. Palë të treta",
        content: "Ne përdorim:\n✅ Google Ads\n✅ Google Analytics (ose sisteme të ngjashme)"
      },
      {
        title: "4. Cookies dhe zgjedhjet tuaja",
        content: "Përdoruesi mund:\n\n• T'i pranojë\n• T'i refuzojë\n• T'i menaxhojë nëpërmjet shfletuesit"
      },
      {
        title: "5. Siguria e të dhënave",
        content: "Ne zbatojmë protokolle sigurie dhe nuk shpërndajmë të dhënat te të tretë jashtë sistemit reklamues/analitik."
      },
      {
        title: "6. Të drejtat e përdoruesit",
        content: "Keni të drejtë të:\n✅ Kërkoni çfarë të dhënash ruhen\n✅ Kërkoni fshirjen e tyre"
      },
      {
        title: "7. Kontakt",
        content: "📩 contact.mysteriarealms@gmail.com"
      }
    ]
  } : {
    title: "Privacy Policy",
    lastUpdated: "Last Updated: 25/11/2025",
    intro: "This Privacy Policy explains how Mysteria Realms collects, stores, and processes user data.",
    sections: [
      {
        title: "1. Information We Collect",
        content: "We may collect:\n\n• Anonymized IP information\n• Browser and device data\n• Usage statistics and traffic analytics\n• Advertising cookies through Google Ads\n\nWe do not collect:\n❌ Personal identifiable information\n❌ Financial data\n❌ Identity documents\n❌ Account registration details (since no sign-up exists)"
      },
      {
        title: "2. How We Use the Information",
        content: "Information is used for:\n✅ Website traffic analytics\n✅ Content improvement\n✅ Advertising personalization"
      },
      {
        title: "3. Third-Party Data Usage",
        content: "We work with:\n\n• Google Ads\n• Analytics services (or equivalent systems)"
      },
      {
        title: "4. Cookies and User Choice",
        content: "Users may:\n✅ Accept cookies\n✅ Decline cookies\n✅ Manage them via browser settings"
      },
      {
        title: "5. Data Security",
        content: "We implement security measures and do not sell or distribute data outside third-party advertising or analytics needs."
      },
      {
        title: "6. User Rights",
        content: "Users may request:\n✅ Details on what data is logged\n✅ Removal of logged data"
      },
      {
        title: "7. Contact",
        content: "📩 contact.mysteriarealms@gmail.com"
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>{content.title} - Misteri</title>
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

export default PrivacyPolicy;
