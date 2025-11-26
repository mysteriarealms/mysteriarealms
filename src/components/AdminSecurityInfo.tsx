import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Clock, AlertTriangle, Eye, Key } from "lucide-react";

const AdminSecurityInfo = () => {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Security Features Active</CardTitle>
        </div>
        <CardDescription>
          Your admin panel is protected by multiple security layers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Server-Side Verification</p>
            <p className="text-sm text-muted-foreground">
              Admin access verified using secure database functions
            </p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Session Timeout</p>
            <p className="text-sm text-muted-foreground">
              Automatic logout after 30 minutes of inactivity
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Rate Limiting</p>
            <p className="text-sm text-muted-foreground">
              5 login attempts max before 15-minute lockout
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Eye className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Hidden Access</p>
            <p className="text-sm text-muted-foreground">
              No public links or hints to admin panel
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Key className="w-5 h-5 text-green-500 mt-0.5" />
          <div>
            <p className="font-semibold text-sm">Input Validation</p>
            <p className="text-sm text-muted-foreground">
              All inputs validated to prevent injection attacks
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSecurityInfo;
