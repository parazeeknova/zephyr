'use client';

import type { LoginValues } from '@zephyr/auth/validation';
import { loginAction } from './server-actions';

export async function login(values: LoginValues) {
  return loginAction(values);
}
