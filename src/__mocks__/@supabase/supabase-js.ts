export const createClient = jest.fn(() => ({
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
}));

export type User = {
  id: string;
  email?: string;
  aud: string;
  created_at: string;
};

export type Session = {
  user: User;
  access_token: string;
  refresh_token: string;
};