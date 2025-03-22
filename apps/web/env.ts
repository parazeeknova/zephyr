import { createEnv } from '@t3-oss/env-nextjs';
import { keys as core } from '@zephyr/next/keys';
import { keys as observability } from '@zephyr/observability/keys';
import { keys as base } from './keys';

export const env = createEnv({
  extends: [core, base, observability()],
  server: {},
  client: {},
  runtimeEnv: {},
});
