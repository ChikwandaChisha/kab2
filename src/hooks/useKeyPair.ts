import { useState } from 'react';
import { encryptionService } from '@/services/encryptionService';
import { supabase } from '@/integrations/supabase/client';

export const useKeyPair = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateKeyPair = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      // Get the current user's email
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        throw new Error('No authenticated user found');
      }

      // Generate and store the key pair
      const publicKey = await encryptionService.generateKeyPair(session.user.email);
      if (!publicKey) {
        throw new Error('Failed to generate key pair');
      }

      console.log('Successfully generated and stored key pair');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate key pair');
      console.error('Error generating key pair:', err);
      throw err; // Re-throw to handle in the registration process
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateKeyPair,
    isGenerating,
    error
  };
}; 