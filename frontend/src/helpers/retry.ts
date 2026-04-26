import { mcLog } from '../version.js';

const MAX_RETRIES = 10;
const STEP_MS = 2000;
const CAP_MS = 15000;

export class RetryScheduler {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private count = 0;

  constructor(private readonly cardName: string, private readonly fire: () => void) {}

  schedule(): void {
    if (this.timer) return;
    this.count++;
    if (this.count > MAX_RETRIES) return;
    const delay = Math.min(STEP_MS * this.count, CAP_MS);
    mcLog('info', this.cardName, 'Retry %d dans %dms…', this.count, delay);
    this.timer = setTimeout(() => {
      this.timer = null;
      this.fire();
    }, delay);
  }

  reset(): void {
    this.count = 0;
    this.cancel();
  }

  cancel(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
