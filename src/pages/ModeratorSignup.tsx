
import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { encryptionService } from '@/services/encryptionService';
import { auditHelpers } from '@/services/auditLogger';
import { useToast } from '@/hooks/use-toast';

const ModeratorSignup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Don't try to redirect while authentication is still loading
  if (authLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/messages" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error", 
        description: "Password must be at least 6 characters long",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate encryption keys for the new moderator
      const keyGenResult = await encryptionService.generateKeyPair(formData.email);
      
      if (!keyGenResult.success) {
        throw new Error('Failed to generate encryption keys');
      }

      // Sign up the moderator
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            role: 'Moderator'
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          toast({
            title: "Account Exists",
            description: "An account with this email already exists. Please sign in instead.",
            variant: "destructive"
          });
          return;
        }
        throw authError;
      }

      if (authData.user) {
        // Update the user's role to Moderator in the profiles table
        // This is necessary because the trigger sets all new users to 'User'
        const { error: roleError } = await supabase
          .from('profiles')
          .update({ role: 'Moderator' })
          .eq('id', authData.user.id);

        if (roleError) {
          console.error('Error updating user role:', roleError);
          toast({
            title: "Warning",
            description: "Account created but role assignment failed. Please contact support.",
            variant: "destructive"
          });
        }

        // Store the public key in the database
        if (keyGenResult.publicKey) {
          const { error: keyError } = await supabase.rpc('store_user_public_key', {
            p_user_id: authData.user.id,
            p_email: formData.email.toLowerCase(),
            p_public_key: keyGenResult.publicKey
          });

          if (keyError) {
            console.error('Error storing public key:', keyError);
            toast({
              title: "Warning",
              description: "Account created but encryption setup incomplete. Please contact support.",
              variant: "destructive"
            });
          }
        }

        // Log successful moderator signup
        await auditHelpers.logSignup(formData.email.toLowerCase(), authData.user.id);

        toast({
          title: "Success!",
          description: "Moderator account created successfully. You can now sign in.",
        });

        // Redirect to login
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Moderator signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create moderator account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-white">
            <path d="M15 11h.01"></path>
            <path d="M11 15h.01"></path>
            <path d="M16 16h.01"></path>
            <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"></path>
            <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"></path>
          </svg>
        </div>
        <span className="text-xl font-bold">WhisperChain+</span>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-blue-600">
              <path d="M9 12l2 2 4-4"></path>
              <path d="M21 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path>
              <path d="M3 12c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path>
              <path d="M12 21c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path>
              <path d="M12 3c.552 0 1-.448 1-1s-.448-1-1-1-1 .448-1 1 .448 1 1 1"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Moderator Registration</h1>
          <p className="text-gray-600">Create your moderator account for WhisperChain+</p>
        </div>

        <div className="w-full max-w-md bg-white rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                className="w-full"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="username" className="block text-gray-700 mb-2">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                className="w-full"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                className="w-full"
                placeholder="Choose a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="confirmPassword" className="block text-gray-700 mb-2">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className="w-full"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mb-4"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Moderator Account...' : 'Create Moderator Account'}
            </Button>
          </form>
          
          <div className="text-center">
            <Link
              to="/"
              className="text-primary hover:underline text-sm"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 text-gray-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 mr-2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          Moderator access with enhanced privileges
        </div>
      </div>
    </div>
  );
};

export default ModeratorSignup;
