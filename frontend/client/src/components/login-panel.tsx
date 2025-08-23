import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { LogIn, Upload, FileUp, Chrome, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LoginPanelProps {
  onLoginSuccess: () => void;
  loginMutation: any;
  isLoginPending: boolean;
}

export default function LoginPanel({ onLoginSuccess, loginMutation, isLoginPending }: LoginPanelProps) {
  const [credentials, setCredentials] = useState({
    email: localStorage.getItem('linkedin-extractor-email') || '',
    password: '',
    rememberMe: !!localStorage.getItem('linkedin-extractor-email')
  });
  const [cookiesJson, setCookiesJson] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  const handleCredentialsLogin = async () => {
    if (!credentials.email || !credentials.password) {
      toast({
        title: "Login Failed",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      await loginMutation.mutateAsync({
        type: 'credentials',
        data: { email: credentials.email, password: credentials.password }
      });
      
      if (credentials.rememberMe) {
        localStorage.setItem('linkedin-extractor-email', credentials.email);
      }
      
      setIsLoggedIn(true);
      onLoginSuccess();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleCookiesLogin = async () => {
    if (!cookiesJson) {
      toast({
        title: "Login Failed",
        description: "Please provide cookies JSON data",
        variant: "destructive",
      });
      return;
    }

    try {
      JSON.parse(cookiesJson);
    } catch (e) {
      toast({
        title: "Login Failed",
        description: "Invalid JSON format in cookies",
        variant: "destructive",
      });
      return;
    }

    try {
      await loginMutation.mutateAsync({
        type: 'cookies',
        data: { cookies: cookiesJson }
      });
      
      setIsLoggedIn(true);
      onLoginSuccess();
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCookiesJson(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="flex items-center">
          <LogIn className="w-5 h-5 text-primary mr-2" />
          LinkedIn Login
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="credentials" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="credentials">Credentials</TabsTrigger>
            <TabsTrigger value="cookies">Cookies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials" className="space-y-4">
            <div>
              <Label htmlFor="email" className="flex items-center mb-2">
                <span className="text-gray-400 mr-2">✉</span>Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                disabled={isLoggedIn}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="flex items-center mb-2">
                <span className="text-gray-400 mr-2">🔒</span>Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                disabled={isLoggedIn}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={credentials.rememberMe}
                onCheckedChange={(checked) => 
                  setCredentials(prev => ({ ...prev, rememberMe: !!checked }))
                }
                disabled={isLoggedIn}
              />
              <Label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </Label>
            </div>
            
            <Button
              onClick={handleCredentialsLogin}
              disabled={isLoginPending || isLoggedIn}
              className="w-full btn-linkedin"
            >
              {isLoginPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isLoggedIn ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {isLoggedIn ? 'Logged In' : 'Login to LinkedIn'}
            </Button>
          </TabsContent>
          
          <TabsContent value="cookies" className="space-y-4">
            <div>
              <Label className="block mb-2">Import Cookies</Label>
              <div className="drag-drop-area">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-600 text-sm mb-2">Drop cookie file here or click to select</p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="cookie-file"
                  disabled={isLoggedIn}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('cookie-file')?.click()}
                  disabled={isLoggedIn}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="cookies-textarea" className="block mb-2">
                Or paste cookies JSON
              </Label>
              <Textarea
                id="cookies-textarea"
                placeholder='[{"name": "cookie_name", "value": "cookie_value", ...}]'
                value={cookiesJson}
                onChange={(e) => setCookiesJson(e.target.value)}
                className="h-32 font-mono text-sm"
                disabled={isLoggedIn}
              />
            </div>
            
            <Button
              onClick={handleCookiesLogin}
              disabled={isLoginPending || isLoggedIn}
              className="w-full btn-linkedin"
            >
              {isLoginPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isLoggedIn ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isLoggedIn ? 'Logged In' : 'Login with Cookies'}
            </Button>
          </TabsContent>
        </Tabs>
        
        {/* Chrome Profile Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600">
            <Chrome className="w-4 h-4 text-blue-500 mr-2" />
            <span>Chrome profile ready for automation</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
