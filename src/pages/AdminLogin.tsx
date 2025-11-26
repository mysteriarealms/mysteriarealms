import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Lock, AlertTriangle } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const blockTimeoutRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    return () => {
      if (blockTimeoutRef.current) {
        clearTimeout(blockTimeoutRef.current);
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Check if blocked
    if (isBlocked) {
      setValidationError("Too many failed attempts. Please try again later.");
      return;
    }

    // Validate input
    try {
      loginSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setValidationError(error.errors[0].message);
        return;
      }
    }

    setLoading(true);

    try {
      // First, check if IP is whitelisted
      const { data: ipCheckData, error: ipCheckError } = await supabase.functions.invoke('check-admin-ip');
      
      if (ipCheckError || !ipCheckData?.allowed) {
        const clientIp = ipCheckData?.ip || 'unknown';
        
        // Increment failed attempts for IP restriction
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          blockTimeoutRef.current = setTimeout(() => {
            setIsBlocked(false);
            setLoginAttempts(0);
          }, BLOCK_DURATION);

          throw new Error(`Too many failed attempts. Access blocked for 15 minutes.`);
        }

        throw new Error(`Access denied. Your IP address (${clientIp}) is not authorized to access the admin panel.`);
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Use has_role function for secure admin verification
      const { data: isAdminData, error: roleError } = await supabase.rpc('has_role', {
        _user_id: data.user.id,
        _role: 'admin'
      });

      if (roleError || !isAdminData) {
        await supabase.auth.signOut();
        
        // Increment failed attempts
        const newAttempts = loginAttempts + 1;
        setLoginAttempts(newAttempts);

        if (newAttempts >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          blockTimeoutRef.current = setTimeout(() => {
            setIsBlocked(false);
            setLoginAttempts(0);
          }, BLOCK_DURATION);

          throw new Error(`Too many failed attempts. Access blocked for 15 minutes.`);
        }

        throw new Error("Invalid credentials. Access denied.");
      }

      // Reset attempts on successful login
      setLoginAttempts(0);

      // Activity logging can be enabled by creating an admin_activity_log table
      // Example schema:
      // CREATE TABLE admin_activity_log (
      //   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      //   user_id uuid REFERENCES auth.users(id),
      //   action text NOT NULL,
      //   ip_address text,
      //   timestamp timestamptz DEFAULT now()
      // );

      toast({
        title: "Login successful",
        description: "Welcome to the admin dashboard",
      });

      navigate("/admin");
    } catch (error: any) {
      // Generic error message for security
      const safeMessage = error.message.includes("blocked") || 
                         error.message.includes("Invalid credentials") ||
                         error.message.includes("Access denied") ||
                         error.message.includes("IP address")
        ? error.message
        : "Authentication failed. Please check your credentials.";
      
      toast({
        title: "Login failed",
        description: safeMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl">Admin Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {validationError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
          
          {isBlocked && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Too many failed login attempts. Please try again in 15 minutes.
              </AlertDescription>
            </Alert>
          )}

          {loginAttempts > 0 && loginAttempts < MAX_ATTEMPTS && !isBlocked && (
            <Alert className="mb-4 border-yellow-500">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-yellow-600">
                Warning: {MAX_ATTEMPTS - loginAttempts} attempt(s) remaining before temporary lockout.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@mysteriarealm.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || isBlocked}
                maxLength={255}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || isBlocked}
                minLength={8}
                maxLength={128}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || isBlocked}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
