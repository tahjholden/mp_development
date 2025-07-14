import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { type SupabaseClient } from '@supabase/supabase-js';
import { signIn, signUp } from '@/app/(login)/actions';

// Initialize the Supabase client for browser usage
let supabaseClient: SupabaseClient | null = null;

/**
 * Creates and returns a Supabase client for browser-side usage
 */
export const createClient = () => {
  if (supabaseClient) return supabaseClient;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided');
  }

  supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
};

/**
 * Sign in with email and password
 * This handles both Supabase authentication and our custom session management
 */
export const signInWithEmail = async (email: string, password: string) => {
  const supabase = createClient();

  // First authenticate with Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Then create our custom session
  const formData = new FormData();
  formData.append('email', email);

  // Use our server action to create a session
  return signIn({}, formData);
};

/**
 * Sign up with email and password
 * This handles both Supabase user creation and our custom session management
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName?: string,
  inviteId?: string
) => {
  const supabase = createClient();

  // First create a user in Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
      data: {
        display_name: displayName || email,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Then create our custom session
    const formData = new FormData();
    formData.append('email', email);
    formData.append('authUid', data.user.id);

    if (displayName) {
      formData.append('displayName', displayName);
    }

    if (inviteId) {
      formData.append('inviteId', inviteId);
    }

    // Use our server action to create a session
    return signUp({}, formData);
  }

  return { error: 'Failed to create user' };
};

/**
 * Sign out from both Supabase and our custom session
 */
export const signOutUser = async () => {
  const supabase = createClient();

  // Sign out from Supabase
  await supabase.auth.signOut();

  // Our server action will handle clearing the custom session cookie
  // and redirecting to the sign-in page
  window.location.href = '/sign-in';
};

/**
 * Get the current Supabase session
 */
export const getSupabaseSession = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Error getting Supabase session:', error);
    return null;
  }

  return data.session;
};

/**
 * Get the current Supabase user
 */
export const getSupabaseUser = async () => {
  const session = await getSupabaseSession();
  return session?.user || null;
};

/**
 * Reset password
 */
export const resetPassword = async (email: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
};

export default {
  createClient,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getSupabaseSession,
  getSupabaseUser,
  resetPassword,
  updatePassword,
};
