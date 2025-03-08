
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
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

  // Create admin user if it doesn't exist
  useEffect(() => {
    const createAdminUser = async () => {
      try {
        // Try to sign up the admin user directly
        const { data: authData, error: signupError } = await supabase.auth.signUp({
          email: 'admin@hotel.ma',
          password: 'admin',
        });
        
        if (signupError) {
          // If the error is because the user already exists, that's fine
          if (signupError.message.includes('already registered')) {
            console.log('Admin user already exists');
            return;
          }
          console.error('Error creating admin user:', signupError.message);
          return;
        }
        
        if (authData.user) {
          // Add user to admins table
          const { error: adminError } = await supabase
            .from('admins')
            .insert({ user_id: authData.user.id });
          
          if (adminError) {
            // If the error is a duplicate key violation, the user is already an admin
            if (adminError.code === '23505') {
              console.log('User is already an admin');
              return;
            }
            console.error('Error adding user to admins table:', adminError.message);
            return;
          }
          
          console.log('Admin user created successfully');
        }
      } catch (error: any) {
        console.error('Error in createAdminUser:', error.message);
      }
    };
    
    createAdminUser();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success('Logged in successfully');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        toast.success('Signup successful! Please check your email for confirmation.');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginAsAdmin = () => {
    setEmail('admin@hotel.ma');
    setPassword('admin');
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
              
              <div className="text-center mt-4">
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
              
              <div className="text-center mt-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={handleLoginAsAdmin}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Login as admin
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
