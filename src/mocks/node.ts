/**
 * MSW server for Node.js (testing environment).
 * This is used by Vitest to intercept network requests during tests.
 */
import { setupServer } from 'msw/node';

import { handlers } from './handlers';

export const server = setupServer(...handlers);
