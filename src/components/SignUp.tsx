
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { encryptionService } from '@/services/encryptionService';
import { auditHelpers } from '@/services/auditLogger';
import { useToast } from '@/hooks/use-toast';

interface SignUpProps {
  onToggleView: () => void;
}

export const SignUp = ({ onToggleView }: SignUpProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    role: 'User'
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
      // Generate encryption keys for the new user
      const keyGenResult = await encryptionService.generateKeyPair(formData.email);
      
      if (!keyGenResult.success) {
        throw new Error('Failed to generate encryption keys');
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase(),
        password: formData.password,
        options: {
          data: {
            username: formData.username,
            role: formData.role
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

      if (authData.user && keyGenResult.publicKey) {
        // Store the public key in the database
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

        // Log successful signup
        await auditHelpers.logSignup(formData.email.toLowerCase(), authData.user.id);

        toast({
          title: "Success!",
          description: "Account created successfully. You can now sign in.",
        });

        // Switch to login view
        onToggleView();
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
          <Label htmlFor="role" className="block text-gray-700 mb-2">
            Role
          </Label>
          <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="User">User</SelectItem>
              <SelectItem value="Moderator">Moderator</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
            </SelectContent>
          </Select>
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
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      
      <div className="text-center">
        <button
          onClick={onToggleView}
          className="text-primary hover:underline text-sm"
          type="button"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};
