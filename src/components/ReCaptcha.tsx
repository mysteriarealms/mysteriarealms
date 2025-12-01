import ReCAPTCHA from "react-google-recaptcha";
import { useRef } from "react";

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
}

export default function ReCaptcha({ onVerify }: ReCaptchaProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

  if (!siteKey) {
    console.error("RECAPTCHA_SITE_KEY is not configured");
    return null;
  }

  return (
    <ReCAPTCHA
      ref={recaptchaRef}
      sitekey={siteKey}
      onChange={onVerify}
      theme="dark"
    />
  );
}
