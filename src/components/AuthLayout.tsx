import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="min-h-screen bg-black/20 backdrop-blur-sm w-full flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <img
                  src="/favicon.ico"
                  alt="JobTrail Logo"
                  className="h-10 w-10 rounded-full"
                />
                <span className="text-2xl font-bold text-white">JobTrail</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
              <p className="text-gray-300 text-sm">{subtitle}</p>
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};