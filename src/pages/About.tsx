import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ghost, Eye, BookOpen, Users } from "lucide-react";

interface AboutProps {
  language: string;
}

const About = ({ language }: AboutProps) => {
  const content = language === "sq" ? {
    title: "Rreth Nesh",
    subtitle: "Eksploroni botën e fshehtë të mistereve",
    intro: "Mysteria Realms është një platformë e dedikuar për botën intriguese të mistereve, fenomeneve të pashpjegueshme, historive të çuditshme dhe kurioziteteve që nxisin mendimin kritik dhe imagjinatën. Qëllimi ynë është të krijojmë një hapësirë informuese, argëtuese dhe eksploruese për përdoruesit në Shqipëri dhe më gjerë.",
    mission: {
      title: "Për Ne",
      text: "Ne besojmë në forcën e kuriozitetit dhe në rëndësinë e eksplorimit të panjohurës. Platforma jonë ofron përmbajtje cilësore që kombinon argëtimin me informacionin, duke krijuar një përvojë unike për lexuesit tanë."
    },
    features: [
      {
        icon: Ghost,
        title: "Histori Paranormale",
        description: "Eksplorojmë fenomenet paranormale nga e gjithë bota"
      },
      {
        icon: BookOpen,
        title: "Legjenda Urbane",
        description: "Zbulojmë të vërtetën pas legjendave më të njohura"
      },
      {
        icon: Eye,
        title: "Përvoja Personale",
        description: "Ndajmë përvoja reale nga lexuesit tanë"
      },
      {
        icon: Users,
        title: "Komunitet",
        description: "Krijojmë një komunitet entuziastësh të mistereve"
      }
    ]
  } : {
    title: "About Us",
    subtitle: "Explore the hidden world of mysteries",
    intro: "Mysteria Realms is a digital platform dedicated to the captivating world of mysteries, unexplained events, paranormal phenomena, curious stories, and thought-provoking content that inspires imagination and exploration. Our mission is to provide an engaging space for readers in Albania and internationally, offering articles that stimulate curiosity, encourage reflection, and explore the unknown.",
    mission: {
      title: "About Us",
      text: "We believe in the power of curiosity and the importance of exploring the unknown. Our platform offers quality content that combines entertainment with information, creating a unique experience for our readers."
    },
    features: [
      {
        icon: Ghost,
        title: "Paranormal Stories",
        description: "We explore paranormal phenomena from around the world"
      },
      {
        icon: BookOpen,
        title: "Urban Legends",
        description: "We uncover the truth behind the most famous legends"
      },
      {
        icon: Eye,
        title: "Personal Experiences",
        description: "We share real experiences from our readers"
      },
      {
        icon: Users,
        title: "Community",
        description: "We create a community of mystery enthusiasts"
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
          <Card className="bg-card border-border mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl mb-2">{content.title}</CardTitle>
              <p className="text-xl text-muted-foreground">{content.subtitle}</p>
            </CardHeader>
            <CardContent className="prose prose-invert max-w-none">
              <p className="text-lg leading-relaxed">{content.intro}</p>
              
              <div className="mt-8">
                <h2>{content.mission.title}</h2>
                <p>{content.mission.text}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {content.features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-card border-border hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-primary" />
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

export default About;
