
import { supabase } from '@/integrations/supabase/client';
import { User, Role } from '@/types';
import { Session } from '@supabase/supabase-js';

/**
 * Fetches user profile from Supabase or creates one if it doesn't exist
 */
export const fetchUserProfile = async (userId: string): Promise<User | null> => {
  console.log("Attempting to fetch profile for user:", userId);
  
  try {
    // Call the RPC function to get user profile
    const { data: profileData, error: rpcError } = await supabase.rpc(
      'get_profile_by_id',
      { user_id: userId }
    );
    
    if (profileData && !rpcError && Array.isArray(profileData) && profileData.length > 0) {
      console.log("User profile fetched via RPC:", profileData);
      
      // The RPC function returns an array with a single object
      const profile = profileData[0];
      
      if (profile) {
        const userProfile: User = {
          id: profile.id,
          username: profile.username,
          role: profile.role as Role,
          isActive: profile.is_active,
          createdAt: profile.created_at,
          email: profile.email?.toLowerCase()
        };
        return userProfile;
      }
    } else {
      console.log("No profile found via RPC, this might be a new user that needs profile creation");
      
      // Try direct query as fallback (this should work with our new RLS policies)
      const { data: directProfile, error: directError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (directProfile) {
        console.log("Found profile via direct query:", directProfile);
        return {
          id: directProfile.id,
          username: directProfile.username,
          role: directProfile.role as Role,
          isActive: directProfile.is_active,
          createdAt: directProfile.created_at,
          email: directProfile.email?.toLowerCase()
        };
      }
      
      if (directError) {
        console.error("Direct profile query error:", directError);
      }
      
      console.log("No profile found, user likely needs to complete registration");
    }
    
    console.log("Profile not found, returning null");
    return null;
  } catch (profileError) {
    console.error("Error fetching profile:", profileError);
    return null;
  }
};

/**
 * Creates a user profile manually when one doesn't exist
 * This is now mainly a fallback since the trigger should handle most cases
 */
const createUserProfile = async (userId: string, session: Session): Promise<User | null> => {
  try {
    console.log("Attempting to create profile for user:", userId);
    
    const userEmail = session.user.email?.toLowerCase();
    const userData = session.user.user_metadata || {};
    const username = userData.username || userEmail?.split('@')[0] || 'user';
    
    // The new RLS policies should allow this insert since auth.uid() = userId
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: username,
        role: 'User',
        email: userEmail,
        is_active: true
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error creating user profile:", error);
      
      // If it's an RLS violation, the user might need to try logging in again
      if (error.code === '42501') {
        console.log("RLS policy violation - this might resolve after a fresh login");
      }
      
      return null;
    }
    
    if (data) {
      console.log("Successfully created user profile:", data);
      return {
        id: data.id,
        username: data.username,
        role: data.role as Role,
        isActive: data.is_active,
        createdAt: data.created_at,
        email: data.email?.toLowerCase()
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error in createUserProfile:", error);
    return null;
  }
};

/**
 * Handles user profile setup after authentication
 */
export const setupUserFromSession = async (session: Session | null): Promise<User | null> => {
  if (!session || !session.user) {
    console.log("No session provided to setupUserFromSession");
    return null;
  }
  
  try {
    console.log("Setting up user from session for:", session.user.id);
    
    // First try to fetch existing profile
    const existingProfile = await fetchUserProfile(session.user.id);
    
    if (existingProfile) {
      console.log("Found existing profile:", existingProfile);
      return existingProfile;
    }
    
    // If no profile exists, the trigger should have created one during signup
    // Let's wait a moment and try again
    console.log("No profile found, waiting and retrying once...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const retryProfile = await fetchUserProfile(session.user.id);
    if (retryProfile) {
      console.log("Found profile on retry:", retryProfile);
      return retryProfile;
    }
    
    // If we still don't have a profile, try to create one manually
    console.log("Still no profile, attempting manual creation");
    const createdProfile = await createUserProfile(session.user.id, session);
    
    if (createdProfile) {
      return createdProfile;
    }
    
    // If all else fails, return a basic profile structure
    console.log("Could not create profile, returning basic structure");
    return {
      id: session.user.id,
      username: session.user.email?.split('@')[0] || 'user',
      role: 'User' as Role,
      isActive: true,
      createdAt: new Date().toISOString(),
      email: session.user.email?.toLowerCase()
    };
  } catch (error) {
    console.error('Error setting up user from session:', error);
    return null;
  }
};
