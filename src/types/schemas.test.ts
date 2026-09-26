import { describe, expect, it } from 'vitest';
import {
  agentListSchema,
  auth2faSetupSchema,
  authAccountSchema,
  authLoginRequestSchema,
  authLoginResultSchema,
  authRegisterRequestSchema,
  authSessionListSchema,
  chatRequestSchema,
  feedbackPayloadSchema,
  healthStatusSchema,
  msgSchema,
  planStatusRequestSchema,
  settingsSchema,
  usageSummarySchema,
} from './index';

describe('skema chat', () => {
  it('menerima pesan user dan assistant', () => {
    expect(msgSchema.safeParse({ role: 'user', content: 'halo' }).success).toBe(true);
    expect(msgSchema.safeParse({ role: 'assistant', content: 'hai' }).success).toBe(true);
  });

  it('menolak role di luar enum', () => {
    expect(msgSchema.safeParse({ role: 'system', content: 'x' }).success).toBe(false);
  });

  it('content wajib berupa string', () => {
    expect(msgSchema.safeParse({ role: 'user' }).success).toBe(false);
    expect(msgSchema.safeParse({ role: 'user', content: 42 }).success).toBe(false);
  });

  it('chatRequest tanpa session_id', () => {
    expect(chatRequestSchema.safeParse({ message: 'halo' }).success).toBe(true);
  });

  it('chatRequest dengan session_id null', () => {
    expect(chatRequestSchema.safeParse({ message: 'halo', session_id: null }).success).toBe(true);
  });

  it('chatRequest menolak message non-string', () => {
    expect(chatRequestSchema.safeParse({ message: 123 }).success).toBe(false);
  });
});

describe('skema health', () => {
  const valid = {
    request_id: 'r1',
    postgres: { status: 'up', latency_ms: 2 },
    redis: { status: 'down', latency_ms: 5 },
  };

  it('payload sehat valid', () => {
    expect(healthStatusSchema.safeParse(valid).success).toBe(true);
  });

  it('field tambahan dipertahankan (loose)', () => {
    const parsed = healthStatusSchema.safeParse({ ...valid, extra_field: 'x' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toHaveProperty('extra_field', 'x');
  });

  it('status aneh ditolak', () => {
    expect(
      healthStatusSchema.safeParse({
        ...valid,
        postgres: { status: 'maybe', latency_ms: 1 },
      }).success,
    ).toBe(false);
  });
});

describe('skema feedback (request ketat)', () => {
  it('payload valid lolos parse', () => {
    expect(
      feedbackPayloadSchema.safeParse({
        session_id: 's1',
        agent_type: 'planner',
        rating: 5,
        comment: 'bagus',
      }).success,
    ).toBe(true);
  });

  it('rating di luar 1..5 ditolak', () => {
    expect(
      feedbackPayloadSchema.safeParse({ session_id: 's1', agent_type: 'a', rating: 0 }).success,
    ).toBe(false);
    expect(
      feedbackPayloadSchema.safeParse({ session_id: 's1', agent_type: 'a', rating: 6 }).success,
    ).toBe(false);
  });

  it('rating pecahan ditolak', () => {
    expect(
      feedbackPayloadSchema.safeParse({ session_id: 's1', agent_type: 'a', rating: 4.5 }).success,
    ).toBe(false);
  });

  it('session_id kosong ditolak', () => {
    expect(
      feedbackPayloadSchema.safeParse({ session_id: '', agent_type: 'a', rating: 3 }).success,
    ).toBe(false);
  });
});

describe('skema usage', () => {
  const valid = {
    hours: 24,
    total_requests: 10,
    total_tokens: 100,
    total_cost_usd: 0.5,
    by_agent: { planner: { requests: 1, tokens: 10, cost_usd: 0.1 } },
    by_model: { 'gpt-4o': { requests: 2, cost_usd: 0.2 } },
  };

  it('ringkasan valid dan field tambahan dipertahankan', () => {
    const parsed = usageSummarySchema.safeParse({ ...valid, extra_field: 'x' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toHaveProperty('extra_field', 'x');
  });

  it('tipe salah ditolak', () => {
    expect(usageSummarySchema.safeParse({ ...valid, hours: '24' }).success).toBe(false);
  });
});

describe('skema agents & plans', () => {
  it('daftar agen valid', () => {
    expect(
      agentListSchema.safeParse({
        agents: [
          {
            name: 'planner',
            role: 'Perencana',
            description: 'membuat rencana',
            when_to_use: 'tugas kompleks',
            tools: ['web'],
          },
        ],
        request_id: 'x',
      }).success,
    ).toBe(true);
  });

  it('daftar agen dengan tipe salah ditolak', () => {
    expect(agentListSchema.safeParse({ agents: 'bukan-array' }).success).toBe(false);
  });

  it('status plan harus enum', () => {
    expect(planStatusRequestSchema.safeParse({ status: 'aktif' }).success).toBe(true);
    expect(planStatusRequestSchema.safeParse({ status: 'gagal' }).success).toBe(false);
  });
});

describe('skema settings', () => {
  it('settings valid', () => {
    expect(settingsSchema.safeParse({ baseUrl: 'http://x', apiKey: 'k' }).success).toBe(true);
  });

  it('apiKey wajib', () => {
    expect(settingsSchema.safeParse({ baseUrl: 'http://x' }).success).toBe(false);
  });

  it('baseUrl wajib string', () => {
    expect(settingsSchema.safeParse({ baseUrl: 123, apiKey: 'k' }).success).toBe(false);
  });
});

describe('skema auth (kontrak 2.2)', () => {
  const akun = {
    id: 'u1',
    name: 'Ayesh',
    email: 'a@b.c',
    username: null,
    email_verified: true,
    role: 'owner',
    auth_provider: 'password',
    connected_providers: ['google'],
    totp_enabled: false,
    has_password: true,
  };

  it('login menerima identifier ATAU email (W9a)', () => {
    expect(authLoginRequestSchema.safeParse({ identifier: 'budi', password: 'x' }).success).toBe(
      true,
    );
    expect(authLoginRequestSchema.safeParse({ email: 'a@b.c', password: 'x' }).success).toBe(true);
    expect(authLoginRequestSchema.safeParse({ password: '' }).success).toBe(false);
  });

  it('login result union: ok + 2fa_required', () => {
    expect(authLoginResultSchema.safeParse({ status: 'ok', account: akun }).success).toBe(true);
    expect(
      authLoginResultSchema.safeParse({ status: '2fa_required', challenge: 'c1' }).success,
    ).toBe(true);
    expect(authLoginResultSchema.safeParse({ status: 'misterius' }).success).toBe(false);
  });

  it('register wajib email+password, username opsional', () => {
    expect(authRegisterRequestSchema.safeParse({ email: 'a@b.c', password: 'x' }).success).toBe(
      true,
    );
    expect(
      authRegisterRequestSchema.safeParse({ email: 'a@b.c', password: 'x', username: 'budi' })
        .success,
    ).toBe(true);
    expect(authRegisterRequestSchema.safeParse({ email: 'a@b.c' }).success).toBe(false);
  });

  it('account field tambahan dipertahankan (loose)', () => {
    const parsed = authAccountSchema.safeParse({ ...akun, request_id: 'r1' });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toHaveProperty('request_id', 'r1');
  });

  it('account totp_enabled wajib boolean', () => {
    expect(authAccountSchema.safeParse({ ...akun, totp_enabled: 'ya' }).success).toBe(false);
  });

  it('daftar sesi valid + current boolean', () => {
    expect(
      authSessionListSchema.safeParse({
        sessions: [
          {
            id: 's1',
            ip: '127.0.0.1',
            user_agent: 'curl',
            created_at: '2026-01-01T00:00:00Z',
            last_active_at: null,
            expires_at: '2026-02-01T00:00:00Z',
            current: true,
          },
        ],
        count: 1,
      }).success,
    ).toBe(true);
  });

  it('setup 2fa mengembalikan secret + uri', () => {
    expect(
      auth2faSetupSchema.safeParse({ secret: 'JBSWY3DPEHPK3PXP', uri: 'otpauth://totp/...' })
        .success,
    ).toBe(true);
    expect(auth2faSetupSchema.safeParse({ secret: 'x' }).success).toBe(false);
  });
});
