import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "./ui/button";

const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button when page is scrolled down 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 transition-all duration-500 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-16 pointer-events-none"
      }`}
    >
      <div className="relative group">
        {/* Glowing effect */}
        <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur-lg opacity-0 group-hover:opacity-75 transition-all duration-500 animate-pulse" />
        
        {/* Button */}
        <Button
          onClick={scrollToTop}
          size="icon"
          className="relative h-12 w-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110 group-hover:rotate-12"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5 group-hover:animate-bounce" />
        </Button>

        {/* Ripple effect on hover */}
        <div className="absolute inset-0 rounded-full border-2 border-primary opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700" />
      </div>
    </div>
  );
};

export default BackToTop;
