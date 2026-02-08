/**
 * MSW handlers for Supabase PostgREST API.
 *
 * Minimal handlers for testing. Extend as needed.
 * @see https://postgrest.org/en/stable/references/api.html
 */

import { http, HttpResponse } from 'msw';

import { MOCK_SUPABASE_URL, MOCK_USER } from '../constants';
import { createProfile, mockProfiles } from '../fixtures/profiles';
import { addMockPrompt, createCloudPrompt, mockPrompts, removeMockPrompt } from '../fixtures/prompts';

import type { CloudPromptInsert } from '@/types/database';

export const supabaseHandlers = [
  // GET /rest/v1/profiles
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/profiles`, ({ request }) => {
    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const isSingle = request.headers.get('Accept')?.includes('vnd.pgrst.object');

    let profiles = [...mockProfiles];

    // Filter by ID if specified (eq.user_123 format)
    if (idFilter?.startsWith('eq.')) {
      const id = idFilter.replace('eq.', '');
      profiles = profiles.filter((p) => p.id === id);
    }

    // Simulate RLS: only return current user's data
    profiles = profiles.filter((p) => p.id === MOCK_USER.id);

    if (isSingle) {
      return profiles.length > 0
        ? HttpResponse.json(profiles[0])
        : HttpResponse.json({ message: 'No rows found', code: 'PGRST116' }, { status: 406 });
    }

    return HttpResponse.json(profiles);
  }),

  // POST /rest/v1/profiles
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/profiles`, async ({ request }) => {
    const body = await request.json();
    const profile = createProfile(body as Record<string, unknown>);

    return request.headers.get('Prefer')?.includes('return=representation')
      ? HttpResponse.json(profile, { status: 201 })
      : new HttpResponse(null, { status: 201 });
  }),

  // PATCH /rest/v1/profiles
  http.patch(`${MOCK_SUPABASE_URL}/rest/v1/profiles`, async ({ request }) => {
    const body = await request.json();
    const profile = { ...mockProfiles[0], ...(body as Record<string, unknown>), updated_at: new Date().toISOString() };

    return request.headers.get('Prefer')?.includes('return=representation')
      ? HttpResponse.json(profile)
      : new HttpResponse(null, { status: 204 });
  }),

  // DELETE /rest/v1/profiles
  http.delete(`${MOCK_SUPABASE_URL}/rest/v1/profiles`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // =========================================================================
  // PROMPTS HANDLERS
  // =========================================================================

  // GET /rest/v1/prompts
  http.get(`${MOCK_SUPABASE_URL}/rest/v1/prompts`, ({ request }) => {
    const url = new URL(request.url);
    const userIdFilter = url.searchParams.get('user_id');
    const isSingle = request.headers.get('Accept')?.includes('vnd.pgrst.object');

    let prompts = [...mockPrompts];

    // Filter by user_id if specified
    if (userIdFilter?.startsWith('eq.')) {
      const userId = userIdFilter.replace('eq.', '');
      prompts = prompts.filter((p) => p.user_id === userId);
    }

    // Simulate RLS: only return current user's data
    prompts = prompts.filter((p) => p.user_id === MOCK_USER.id);

    if (isSingle) {
      return prompts.length > 0
        ? HttpResponse.json(prompts[0])
        : HttpResponse.json({ message: 'No rows found', code: 'PGRST116' }, { status: 406 });
    }

    return HttpResponse.json(prompts);
  }),

  // POST /rest/v1/prompts (upsert)
  http.post(`${MOCK_SUPABASE_URL}/rest/v1/prompts`, async ({ request }) => {
    const body = await request.json();
    const isArray = Array.isArray(body);
    const prompts = isArray ? body : [body];

    const created = prompts.map((p: CloudPromptInsert) => {
      const prompt = createCloudPrompt({
        ...p,
        user_id: MOCK_USER.id,
      });
      addMockPrompt(prompt);
      return prompt;
    });

    const returnData = request.headers.get('Prefer')?.includes('return=representation');
    if (returnData) {
      return isArray ? HttpResponse.json(created, { status: 201 }) : HttpResponse.json(created[0], { status: 201 });
    }
    return new HttpResponse(null, { status: 201 });
  }),

  // PATCH /rest/v1/prompts
  http.patch(`${MOCK_SUPABASE_URL}/rest/v1/prompts`, async ({ request }) => {
    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');
    const body = (await request.json()) as Partial<CloudPromptInsert>;

    if (!idFilter?.startsWith('eq.')) {
      return HttpResponse.json({ message: 'Missing id filter' }, { status: 400 });
    }

    const promptId = idFilter.replace('eq.', '');
    const existing = mockPrompts.find((p) => p.id === promptId && p.user_id === MOCK_USER.id);

    if (!existing) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 });
    }

    const updated = { ...existing, ...body, updated_at: new Date().toISOString() };
    addMockPrompt(updated);

    return request.headers.get('Prefer')?.includes('return=representation')
      ? HttpResponse.json(updated)
      : new HttpResponse(null, { status: 204 });
  }),

  // DELETE /rest/v1/prompts
  http.delete(`${MOCK_SUPABASE_URL}/rest/v1/prompts`, ({ request }) => {
    const url = new URL(request.url);
    const idFilter = url.searchParams.get('id');

    if (idFilter?.startsWith('eq.')) {
      const promptId = idFilter.replace('eq.', '');
      removeMockPrompt(MOCK_USER.id, promptId);
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
