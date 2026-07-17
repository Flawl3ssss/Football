export type PauseReason = 'orientation' | 'visibility' | 'blur' | 'platform' | 'manual';
export type GamePhase = 'booting' | 'ready' | 'playing' | 'paused' | 'error';

export class GameState {
  private phase: GamePhase = 'booting';
  private readonly pauseReasons = new Set<PauseReason>();
  private errorMessage = '';

  getPhase(): GamePhase {
    return this.phase;
  }

  getPauseReasons(): readonly PauseReason[] {
    return [...this.pauseReasons];
  }

  getErrorMessage(): string {
    return this.errorMessage;
  }

  markReady(): void {
    if (this.phase !== 'error') this.phase = 'ready';
  }

  start(): void {
    if (this.phase !== 'error' && this.pauseReasons.size === 0) this.phase = 'playing';
  }

  pause(reason: PauseReason): void {
    if (this.phase === 'error') return;
    this.pauseReasons.add(reason);
    this.phase = 'paused';
  }

  resume(reason: PauseReason): void {
    if (this.phase === 'error') return;
    this.pauseReasons.delete(reason);
    this.phase = this.pauseReasons.size === 0 ? 'playing' : 'paused';
  }

  fail(message: string): void {
    this.errorMessage = message;
    this.phase = 'error';
    this.pauseReasons.clear();
  }
}
