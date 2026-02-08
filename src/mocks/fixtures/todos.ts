/**
 * Mock data and factory functions for todos.
 */

export interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

/**
 * Sample todos for testing.
 */
export const mockTodos: Todo[] = [
  { userId: 1, id: 1, title: 'Setup MSW for testing', completed: true },
  { userId: 1, id: 2, title: 'Write integration tests', completed: false },
  { userId: 1, id: 3, title: 'Add error handling', completed: false },
  { userId: 2, id: 4, title: 'Review PR', completed: false },
  { userId: 2, id: 5, title: 'Deploy to staging', completed: false },
];

/**
 * Factory function to create a single todo with optional overrides.
 */
export function createTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    userId: 1,
    id: Date.now(),
    title: 'New Todo',
    completed: false,
    ...overrides,
  };
}

/**
 * Factory function to create multiple todos.
 */
export function createTodos(count: number, overrides: Partial<Todo> = {}): Todo[] {
  return Array.from({ length: count }, (_, i) => createTodo({ id: i + 1, title: `Todo ${i + 1}`, ...overrides }));
}
