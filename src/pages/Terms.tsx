import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TermsProps {
  language: string;
}

const Terms = ({ language }: TermsProps) => {
  const content = language === "sq" ? {
    title: "Kushtet e Përdorimit",
    lastUpdated: "Përditësuar më 25/11/2025",
    intro: "Mirë se vini në Mysteria Realms. Duke aksesuar ose përdorur faqen tonë në mysteriarealms.vercel.app, ju pranoni kushtet e përdorimit të përcaktuara më poshtë. Nëse nuk pajtoheni me këto kushte, ju lutemi mos përdorni këtë faqe.",
    sections: [
      {
        title: "1. Qëllimi i faqes",
        content: "Mysteria Realms është një platformë informuese dhe argëtuese që publikon përmbajtje mbi mistere, kuriozitete, teori, fenomene dhe tematika të ngjashme. Përmbajtja nuk përfaqëson këshillim profesionist, shkencor, mjekësor apo juridik."
      },
      {
        title: "2. Përdorimi i Faqes",
        content: "Përdoruesit angazhohen të mos:\n\n• Kopjojnë apo ripublikojnë përmbajtje pa autorizim\n• Keqpërdorin faqen për qëllime mashtruese ose të paligjshme\n• Dëmtojnë funksionimin teknik të faqes"
      },
      {
        title: "3. Reklamat dhe partnerët",
        content: "Faqja përdor:\n\n• Google Ads\n• Sisteme statistikore analitike\n\nKëto mund të përdorin cookies dhe tracking technologies."
      },
      {
        title: "4. Pronësia intelektuale",
        content: "E gjithë përmbajtja, grafikat, emri \"Mysteria Realms\" dhe materiali publik janë pronë e faqes, përveç rasteve kur citohet burimi."
      },
      {
        title: "5. Lidhjet me faqet e tjera",
        content: "Ne mund të përfshijmë lidhje të jashtme. Nuk mbajmë përgjegjësi për përmbajtjen apo politikat e tyre."
      },
      {
        title: "6. Përgjegjshmëria",
        content: "Ne nuk garantojmë saktësinë, plotësinë apo besueshmërinë absolute të informacionit. Përdorimi i faqes bëhet në riskun tuaj."
      },
      {
        title: "7. Ndryshimet në kushte",
        content: "Ne kemi të drejtë të përditësojmë këto kushte. Versioni më i fundit do të jetë gjithmonë i aksesueshëm në faqe."
      },
      {
        title: "8. Kontakt",
        content: "Për çdo pyetje:\n📩 contact.mysteriarealms@gmail.com"
      }
    ]
  } : {
    title: "Terms & Conditions",
    lastUpdated: "Last Updated: 25/11/2025",
    intro: "Welcome to Mysteria Realms. By accessing or using our website at mysteriarealms.vercel.app, you agree to the Terms and Conditions stated below. If you do not agree with these terms, please discontinue use of the website.",
    sections: [
      {
        title: "1. Purpose of the Website",
        content: "Mysteria Realms is an informational and entertainment platform that publishes content related to mysteries, unexplained phenomena, paranormal stories, urban legends, curiosities, and similar thematic material. The content does not constitute scientific, legal, medical, or professional advice."
      },
      {
        title: "2. Use of the Website",
        content: "Users agree NOT to:\n\n• Copy, redistribute, or republish content without permission\n• Misuse the platform for fraudulent or unlawful purposes\n• Interfere with or disrupt the technical functionality of the website"
      },
      {
        title: "3. Advertising and Third-Party Systems",
        content: "Our website makes use of:\n\n• Google Ads\n• Analytical statistics systems\n\nThese may involve the use of cookies and tracking technologies."
      },
      {
        title: "4. Intellectual Property",
        content: "All content, branding, graphics, and the name \"Mysteria Realms\" are the intellectual property of the platform unless otherwise credited."
      },
      {
        title: "5. External Links",
        content: "Our website may include outbound links to third-party sites. We are not responsible for:\n\n• Their content\n• Their security standards\n• Their privacy practices"
      },
      {
        title: "6. Liability Disclaimer",
        content: "We do not guarantee the accuracy, completeness, or reliability of published information. Use of the website is at your own discretion and risk."
      },
      {
        title: "7. Changes to Terms",
        content: "We reserve the right to update or revise these Terms at any time. The most recent version will always remain publicly accessible."
      },
      {
        title: "8. Contact Information",
        content: "For legal, technical, or general inquiries:\n📩 contact.mysteriarealms@gmail.com"
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

export default Terms;
