
import { supabase } from '@/integrations/supabase/client';
import { logEvent } from '@/services/auditLogger';

export const signUp = async (email: string, password: string, username: string, role: 'User' | 'Moderator' = 'User') => {
  console.log('[Auth] Attempting signup for:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase(),
    password,
    options: {
      data: {
        username,
        role
      }
    }
  });

  if (error) {
    console.error('[Auth] Signup error:', error);
    throw error;
  }

  if (data.user) {
    console.log('[Auth] Signup successful, logging audit event');
    
    try {
      await logEvent('signup', {
        user_id: data.user.id,
        recipient_id: email.toLowerCase(),
        action: 'user_registered',
        username: username
      });
      console.log('[Auth] Signup audit event logged');
    } catch (auditError) {
      console.error('[Auth] Failed to log signup audit event:', auditError);
    }
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  console.log('[Auth] Attempting signin for:', email);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase(),
    password,
  });

  if (error) {
    console.error('[Auth] Signin error:', error);
    throw error;
  }

  if (data.user) {
    console.log('[Auth] Signin successful, logging audit event');
    
    try {
      await logEvent('login', {
        user_id: data.user.id,
        recipient_id: email.toLowerCase(),
        action: 'user_authenticated'
      });
      console.log('[Auth] Login audit event logged');
    } catch (auditError) {
      console.error('[Auth] Failed to log login audit event:', auditError);
    }
  }

  return { data, error };
};

export const signOut = async () => {
  console.log('[Auth] Attempting signout');
  
  // Get current user before signing out
  const { data: { user } } = await supabase.auth.getUser();
  
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('[Auth] Signout error:', error);
    throw error;
  }

  if (user) {
    console.log('[Auth] Signout successful, logging audit event');
    
    try {
      await logEvent('logout', {
        user_id: user.id,
        recipient_id: user.email,
        action: 'user_signed_out'
      });
      console.log('[Auth] Logout audit event logged');
    } catch (auditError) {
      console.error('[Auth] Failed to log logout audit event:', auditError);
    }
  }

  return { error };
};

// Wrapper function for loginUser (used by AuthContext)
export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await signIn(email, password);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
  }
};

// Wrapper function for logoutUser (used by AuthContext)
export const logoutUser = async () => {
  try {
    const { error } = await signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Logout failed' };
  }
};
