import { supabaseHandlers } from './supabase';
import { todosHandlers } from './todos';

/**
 * All MSW request handlers.
 * Add new feature handlers here as the application grows.
 */
export const handlers = [...todosHandlers, ...supabaseHandlers];
