import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft } from 'lucide-react';

export const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive"
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsSubmitted(true);
      toast({
        title: "Reset Link Sent",
        description: "Check your email for password reset instructions.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Unable to send reset email. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent password reset instructions to your email"
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-green-400" />
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-300">
              We've sent a password reset link to:
            </p>
            <p className="text-white font-medium">{email}</p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <Button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              variant="outline"
              className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20"
            >
              Try Again
            </Button>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password"
      subtitle="Enter your email to receive reset instructions"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;