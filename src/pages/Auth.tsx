
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { AlertCircle } from 'lucide-react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState(false);
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/admin');
      }
    };
    
    checkSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          navigate('/admin');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fillDemoCredentials = () => {
    setEmail('demo@example.com');
    setPassword('password123');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailConfirmationRequired(false);
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setEmailConfirmationRequired(true);
            toast.error('Email not confirmed. Please check your inbox or disable email confirmation in Supabase dashboard.');
          } else {
            toast.error(error.message || 'Failed to login');
          }
          throw error;
        }
        toast.success('Logged in successfully');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast.success('Signup successful! Please check your email for confirmation if required.');
        setEmailConfirmationRequired(true);
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout hideHeader>
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              {mode === 'login' ? 'Admin Login' : 'Admin Signup'}
            </CardTitle>
            <CardDescription>
              {mode === 'login' 
                ? 'Enter your credentials to access the admin panel' 
                : 'Create a new admin account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {emailConfirmationRequired && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex gap-2 items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Email confirmation required</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Please check your email for a confirmation link or disable email confirmation in your Supabase dashboard.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Sign Up'}
              </Button>
              
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Demo Credentials
                </button>
                
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-primary hover:underline text-sm"
                >
                  {mode === 'login' 
                    ? 'Need an account? Sign up' 
                    : 'Already have an account? Log in'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
