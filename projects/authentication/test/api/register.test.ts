import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import request from 'supertest';
import app from '../../server';
import { clearDb } from './utils/query-utils';
import pool from '../../src/utils/db-pool';

let server: any;

beforeAll(() => {
  server = app.listen(3001);
});

afterAll(async () => {
  server.close();
  await clearDb(pool);
});

describe('auth register api tests', () => {
  it('can register user', async () => {
    await request(server)
      .post('/api/register')
      .send({ username: 'testuser', password: 'testpassword123' })
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        expect(response.body).toEqual({ message: 'registered' });
      });
  });

  it('should reject invalid email or password combination', async () => {
    await request(server)
      .post('/api/register')
      .send({ username: 'testuser', password: '' })
      .set('Accept', 'application/json')
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({ message: 'missing username and password' });
      });

    await request(server)
      .post('/api/register')
      .send({ username: '', password: 'password' })
      .set('Accept', 'application/json')
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({ message: 'missing username and password' });
      });

    await request(server)
      .post('/api/register')
      .send({ username: '', password: '' })
      .set('Accept', 'application/json')
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({ message: 'missing username and password' });
      });

    await request(server)
      .post('/api/register')
      .send({ username: undefined, password: undefined })
      .set('Accept', 'application/json')
      .expect(400)
      .then((response) => {
        expect(response.body).toEqual({ message: 'missing username and password' });
      });
  });

  it('registered users can login', async () => {
    await request(server)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpassword123' })
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        // @ts-expect-error -- they typed the headers wrong, cookies is a string array
        const cookies = response.headers['set-cookie'] as string[];
        expect(cookies.join('')).toInclude('auth_token');
        expect(cookies.join('')).toInclude('refresh_token');
        expect(cookies).toHaveLength(2);
        expect(response.body).toEqual({ message: 'authorized' });
      });

    const client = await pool.connect();
    const rSet = await client.query('SELECT * FROM refresh_tokens WHERE ');
  });

  it('authed user can regresh token', async () => {
    await request(server)
      .post('/api/login')
      .send({ username: 'testuser', password: 'testpassword123' })
      .set('Accept', 'application/json')
      .expect(200)
      .then((response) => {
        // @ts-expect-error -- they typed the headers wrong, cookies is a string array
        const cookies = response.headers['set-cookie'] as string[];
        expect(cookies.join('')).toInclude('auth_token');
        expect(cookies.join('')).toInclude('refresh_token');
        expect(cookies).toHaveLength(2);
        expect(response.body).toEqual({ message: 'authorized' });
      });
  });
});
