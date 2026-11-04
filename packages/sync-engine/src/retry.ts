export interface BackoffOptions {
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
}

export function calculateBackoffDelay(retryCount: number, options: BackoffOptions = {}): number {
  const { initialDelayMs = 1000, maxDelayMs = 30000, factor = 2, jitter = true } = options;
  
  const exponentialDelay = initialDelayMs * Math.pow(factor, retryCount);
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);

  if (!jitter) return cappedDelay;

  // Add full jitter: random value between 0 and calculated delay
  const randomJitter = Math.random() * (cappedDelay * 0.3);
  return Math.floor(cappedDelay + randomJitter);
}

