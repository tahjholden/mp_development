import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { z } from 'zod';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Shared user validation schemas
export const UserSchema = z.object({
  id: z.string(),
  displayName: z.string().optional(),
  name: z.string().optional(),
  email: z.string(),
  role: z.string().optional(),
  isSuperadmin: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  personType: z.string().nullable().optional(),
  groupId: z.string().nullable().optional(),
  groupName: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  organizationId: z.string().optional(),
  organizationName: z.string().optional(),
  active: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  authUid: z.string().optional(),
});

// The API returns user data directly, not wrapped in a user property
export const UserResponseSchema = UserSchema;

export type User = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
