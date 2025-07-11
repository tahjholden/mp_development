import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { type SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

/**
 * Creates a Supabase client for server-side operations
 * This is cached to avoid creating multiple clients during a request
 */
export const createClient = cache(() => {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_CORE!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_CORE!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_CORE;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key must be provided');
  }

  // Use the service role key if available for admin operations
  // Otherwise use the anon key
  const supabaseKey = supabaseServiceKey || supabaseAnonKey;

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false, // We don't want to persist the session on server
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        // We don't set cookies from server components
        // This is handled by our custom session management
      },
      remove(name: string, options: any) {
        // We don't remove cookies from server components
        // This is handled by our custom session management
      },
    },
  });
});

/**
 * Gets a Supabase admin client with the service role key
 * This should only be used in trusted server contexts like API routes
 * and never exposed to the client
 */
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL_CORE!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY_CORE;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase URL and Service Role Key must be provided');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
};

/**
 * Verify a Supabase auth token and get the user
 * This can be used to verify auth tokens from client requests
 */
export const verifyAuthToken = async (token: string) => {
  const supabase = createClient();
  
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error) {
    return { error: error.message };
  }
  
  return { user: data.user };
};

/**
 * Create a new user in Supabase Auth
 * This should only be used in trusted server contexts
 */
export const createAuthUser = async (email: string, password: string, metadata?: Record<string, any>) => {
  const adminClient = createAdminClient();
  
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm the email
    user_metadata: metadata || {},
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { user: data.user };
};

/**
 * Delete a user from Supabase Auth
 * This should only be used in trusted server contexts
 */
export const deleteAuthUser = async (userId: string) => {
  const adminClient = createAdminClient();
  
  const { data, error } = await adminClient.auth.admin.deleteUser(userId);
  
  if (error) {
    return { error: error.message };
  }
  
  return { success: true };
};

/**
 * Get a user from Supabase Auth by email
 * This should only be used in trusted server contexts
 */
export const getUserByEmail = async (email: string) => {
  const adminClient = createAdminClient();
  
  const { data, error } = await adminClient.auth.admin.listUsers({
    filter: {
      email: email,
    },
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { user: data.users[0] || null };
};

/**
 * Update a user's metadata in Supabase Auth
 * This should only be used in trusted server contexts
 */
export const updateUserMetadata = async (userId: string, metadata: Record<string, any>) => {
  const adminClient = createAdminClient();
  
  const { data, error } = await adminClient.auth.admin.updateUserById(userId, {
    user_metadata: metadata,
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { user: data.user };
};

export default {
  createClient,
  createAdminClient,
  verifyAuthToken,
  createAuthUser,
  deleteAuthUser,
  getUserByEmail,
  updateUserMetadata,
};
