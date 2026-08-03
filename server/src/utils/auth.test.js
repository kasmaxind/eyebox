import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, hashToken, signAccessToken, verifyAccessToken } from './auth.js';

describe('auth utils', () => {
  it('hashes and verifies passwords', async () => {
    const hash = await hashPassword('SecretPass123!');
    assert.ok(hash.startsWith('$2'));
    assert.equal(await verifyPassword('SecretPass123!', hash), true);
    assert.equal(await verifyPassword('wrong', hash), false);
  });

  it('hashes tokens deterministically', () => {
    assert.equal(hashToken('abc'), hashToken('abc'));
    assert.notEqual(hashToken('abc'), hashToken('abd'));
  });

  it('signs and verifies JWT access tokens', () => {
    const token = signAccessToken({ sub: 'usr_1', role: 'user', username: 'demo' });
    const payload = verifyAccessToken(token);
    assert.equal(payload.sub, 'usr_1');
    assert.equal(payload.username, 'demo');
  });
});
