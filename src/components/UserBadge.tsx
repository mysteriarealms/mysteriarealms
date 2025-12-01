import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Award, Sparkles, Flame, Crown } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UserBadgeProps {
  badgeLevel: string;
  reputationScore: number;
  totalComments: number;
  language?: string;
}

const badgeConfig = {
  legend: {
    icon: Crown,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10 border-yellow-400/50",
    label: { en: "Legend", sq: "Legjendë" },
    description: { 
      en: "150+ reputation points - A true mystery enthusiast!", 
      sq: "150+ pikë reputacioni - Një entuziast i vërtetë i mistereve!" 
    },
  },
  detective: {
    icon: Award,
    color: "text-indigo-400",
    bgColor: "bg-indigo-400/10 border-indigo-400/50",
    label: { en: "Detective", sq: "Detektiv" },
    description: { 
      en: "100+ reputation points - Mystery Challenge Winner!", 
      sq: "100+ pikë reputacioni - Fitues i Sfidës Misterioze!" 
    },
  },
  expert: {
    icon: Trophy,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10 border-purple-400/50",
    label: { en: "Expert", sq: "Ekspert" },
    description: { 
      en: "50+ reputation points - Highly experienced contributor", 
      sq: "50+ pikë reputacioni - Kontribues shumë i përvojshëm" 
    },
  },
  veteran: {
    icon: Award,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10 border-blue-400/50",
    label: { en: "Veteran", sq: "Veteran" },
    description: { 
      en: "25+ reputation points - Regular contributor", 
      sq: "25+ pikë reputacioni - Kontribues i rregullt" 
    },
  },
  contributor: {
    icon: Star,
    color: "text-green-400",
    bgColor: "bg-green-400/10 border-green-400/50",
    label: { en: "Contributor", sq: "Kontribues" },
    description: { 
      en: "10+ reputation points - Active participant", 
      sq: "10+ pikë reputacioni - Pjesëmarrës aktiv" 
    },
  },
  regular: {
    icon: Sparkles,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/10 border-cyan-400/50",
    label: { en: "Regular", sq: "I rregullt" },
    description: { 
      en: "5+ reputation points - Established member", 
      sq: "5+ pikë reputacioni - Anëtar i përhershëm" 
    },
  },
  newcomer: {
    icon: Flame,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10 border-orange-400/50",
    label: { en: "Newcomer", sq: "I ri" },
    description: { 
      en: "New to the community - Welcome!", 
      sq: "I ri në komunitet - Mirë se vini!" 
    },
  },
};

const UserBadge = ({ 
  badgeLevel, 
  reputationScore, 
  totalComments,
  language = "en" 
}: UserBadgeProps) => {
  const config = badgeConfig[badgeLevel as keyof typeof badgeConfig] || badgeConfig.newcomer;
  const Icon = config.icon;
  const lang = language as "en" | "sq";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="outline" 
            className={`gap-1.5 ${config.bgColor} ${config.color} border transition-all hover:scale-105 cursor-help`}
          >
            <Icon className="h-3 w-3" />
            {config.label[lang]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold flex items-center gap-2">
              <Icon className={`h-4 w-4 ${config.color}`} />
              {config.label[lang]}
            </p>
            <p className="text-xs text-muted-foreground">
              {config.description[lang]}
            </p>
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <div>{reputationScore} {language === "sq" ? "pikë reputacioni" : "reputation points"}</div>
              <div>{totalComments} {language === "sq" ? "komente" : "comments"}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default UserBadge;