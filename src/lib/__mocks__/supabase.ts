// Mock implementation of supabase module
export const getCurrentUser = jest.fn();
export const getCurrentUserProfile = jest.fn();
export const signIn = jest.fn();
export const signOut = jest.fn();

// Mock the Supabase client
export const supabase = {
  auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};