import { performance } from 'node:perf_hooks';

/** Bật: `DEBUG_PERF=1` hoặc `DEBUG_PERF=true` trong `.env` */
export function isPerfDebugEnabled(): boolean {
  const v = process.env.DEBUG_PERF;
  return v === '1' || v === 'true' || v === 'yes';
}

/**
 * Log từng bước: delta kể từ lần gọi trước + total kể từ scope start.
 * Ví dụ: `const perf = createPerfLogger('findBySlugFe:ac-quy'); perf('after findOne');`
 */
export function createPerfLogger(scope: string) {
  const started = performance.now();
  let last = started;
  return (step: string) => {
    if (!isPerfDebugEnabled()) return;
    const now = performance.now();
    const stepMs = now - last;
    const totalMs = now - started;
    last = now;
    console.log(
      `[PERF] ${scope} | ${step} | +${stepMs.toFixed(1)}ms | total ${totalMs.toFixed(1)}ms`,
    );
  };
}
