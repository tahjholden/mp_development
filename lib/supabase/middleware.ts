import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Creates a Supabase client for use in the Next.js middleware
 * Handles cookie management for Supabase auth sessions
 * 
 * @param request The incoming request
 * @returns The Supabase client and a modified response with updated cookies
 */
export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create the Supabase client with cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL_CORE!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_CORE!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
}

/**
 * Refreshes the Supabase session in middleware if needed
 * This should be called in the middleware to ensure the Supabase session
 * is always valid before proceeding with the request
 * 
 * @param request The incoming request
 * @returns A response with updated cookies if the session was refreshed, or null if no refresh was needed
 */
export const refreshSession = async (request: NextRequest) => {
  const { supabase, response } = createClient(request)
  
  // Get the session from Supabase
  const { data: { session } } = await supabase.auth.getSession()
  
  // If no session or session doesn't need refresh, return null
  if (!session) {
    return null
  }
  
  return response
}

export default {
  createClient,
  refreshSession
}
