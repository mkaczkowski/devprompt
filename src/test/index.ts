// Custom render with all providers
export { render } from './providers';

// Mock utilities
export { mockMatchMedia } from './mocks';

// Clerk mocks
export {
  setMockClerkSignedIn,
  setMockClerkLoaded,
  setMockClerkState,
  setMockClerkUser,
  resetClerkMocks,
  createUser,
} from './clerkMock';

// Supabase mocks
export {
  setMockSupabaseData,
  setMockSupabaseError,
  resetSupabaseMocks,
  createProfile,
  createProfiles,
  mockProfiles,
} from './supabaseMock';

// MSW server instance
export { server } from '@/mocks/node';
