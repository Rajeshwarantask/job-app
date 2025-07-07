import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login, loginWithGoogle } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.email || !formData.password) {
        toast({
          title: "Missing Information",
          description: "Please fill in all fields.",
          variant: "destructive"
        });
        return;
      }

      // Simulate login process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await login(formData.email, formData.password);
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in with Google.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Google Login Failed",
        description: "Unable to sign in with Google. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your JobTrail account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              id="remember"
              type="checkbox"
              className="rounded border-white/20 bg-white/10"
            />
            <Label htmlFor="remember" className="text-sm text-gray-300">
              Remember me
            </Label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
          disabled={isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>

        <div className="text-center">
          <span className="text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              Sign up
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Login;