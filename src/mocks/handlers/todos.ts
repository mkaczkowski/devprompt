/**
 * MSW handlers for todos API.
 */
import { delay, http, HttpResponse } from 'msw';

import type { Todo } from '../fixtures/todos';
import { mockTodos } from '../fixtures/todos';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

export const todosHandlers = [
  // GET /todos - List todos with optional limit
  http.get(`${BASE_URL}/todos`, async ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('_limit');

    // Small delay to simulate network latency
    await delay(50);

    const todos = limit ? mockTodos.slice(0, parseInt(limit, 10)) : mockTodos;

    return HttpResponse.json(todos);
  }),

  // GET /todos/:id - Get single todo
  http.get(`${BASE_URL}/todos/:id`, async ({ params }) => {
    const { id } = params;
    const todo = mockTodos.find((t) => t.id === Number(id));

    await delay(50);

    if (!todo) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(todo);
  }),

  // POST /todos - Create todo
  http.post(`${BASE_URL}/todos`, async ({ request }) => {
    const body = (await request.json()) as Partial<Todo>;

    await delay(50);

    return HttpResponse.json(
      {
        id: mockTodos.length + 1,
        userId: 1,
        title: '',
        completed: false,
        ...body,
      },
      { status: 201 },
    );
  }),
];
