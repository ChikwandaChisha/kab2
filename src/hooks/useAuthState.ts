
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { setupUserFromSession } from '@/utils/profileUtils';

/**
 * Hook to manage authentication state
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        
        if (event === 'SIGNED_IN' && currentSession) {
          console.log("User signed in, attempting to fetch profile");
          
          // Use setTimeout to prevent potential recursion issues
          setTimeout(async () => {
            try {
              const userProfile = await setupUserFromSession(currentSession);
              
              if (userProfile) {
                setUser(userProfile);
                setIsAuthenticated(true);
                console.log("Successfully set up user profile:", userProfile);
              } else {
                console.warn("Could not set up user profile");
                setIsAuthenticated(false);
                setUser(null);
              }
            } catch (error) {
              console.error('Error in auth state change handler:', error);
              setIsAuthenticated(false);
              setUser(null);
            } finally {
              setIsLoading(false);
            }
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log("User signed out");
          setUser(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    const checkExistingSession = async () => {
      console.log("Checking for existing session...");
      setIsLoading(true);
      
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        console.log("Found existing session:", currentSession.user.id);
        setSession(currentSession);
        
        setTimeout(async () => {
          try {
            const userProfile = await setupUserFromSession(currentSession);
            
            if (userProfile) {
              setUser(userProfile);
              setIsAuthenticated(true);
              console.log("Successfully restored user session:", userProfile);
            } else {
              console.warn("Could not restore user profile from session");
              setIsAuthenticated(false);
              setUser(null);
            }
          } catch (error) {
            console.error('Error fetching profile on init:', error);
            setIsAuthenticated(false);
            setUser(null);
          } finally {
            setIsLoading(false);
          }
        }, 0);
      } else {
        console.log("No existing session found");
        setIsLoading(false);
      }
    };
    
    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    isAdmin: user?.role === 'Admin',
    isModerator: user?.role === 'Moderator',
  };
};
