import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, MessageSquare, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ContactProps {
  language: string;
}

const Contact = ({ language }: ContactProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const content = language === "sq" ? {
    title: "Kontakti",
    subtitle: "Na dërgoni një mesazh",
    intro: "Për sugjerime, bashkëpunime, vërejtje ose pyetje, na kontaktoni në: contact.mysteriarealms@gmail.com",
    email: "📩 contact.mysteriarealms@gmail.com",
    form: {
      name: "Emri",
      namePlaceholder: "Emri juaj",
      email: "Email",
      emailPlaceholder: "emaili@juaj.com",
      message: "Mesazhi",
      messagePlaceholder: "Shkruani mesazhin tuaj këtu...",
      submit: "Dërgo Mesazhin",
      success: "Mesazhi u dërgua me sukses!",
      error: "Ju lutemi plotësoni të gjitha fushat."
    }
  } : {
    title: "Contact",
    subtitle: "Send us a message",
    intro: "For inquiries related to submissions, collaboration, corrections, or general communication, contact us at: contact.mysteriarealms@gmail.com",
    email: "📩 contact.mysteriarealms@gmail.com",
    form: {
      name: "Name",
      namePlaceholder: "Your name",
      email: "Email",
      emailPlaceholder: "your@email.com",
      message: "Message",
      messagePlaceholder: "Write your message here...",
      submit: "Send Message",
      success: "Message sent successfully!",
      error: "Please fill in all fields."
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: content.form.error,
        variant: "destructive"
      });
      return;
    }

    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData);
    
    toast({
      title: content.form.success,
    });

    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <>
      <Helmet>
        <title>{content.title} - Misteri</title>
        <meta name="description" content={content.intro} />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <main className="min-h-screen bg-background py-12 px-4">
        <div className="container max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-2">{content.title}</CardTitle>
              <p className="text-muted-foreground">{content.subtitle}</p>
            </CardHeader>
            <CardContent>
              <p className="text-center mb-4 text-muted-foreground">{content.intro}</p>
              <p className="text-center mb-8 text-lg font-semibold text-primary">{content.email}</p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {content.form.name}
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={content.form.namePlaceholder}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {content.form.email}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={content.form.emailPlaceholder}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {content.form.message}
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={content.form.messagePlaceholder}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-background border-border min-h-[150px]"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {content.form.submit}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
};

export default Contact;
