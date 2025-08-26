export interface SessionMetrics {
  accuracy: {
    stance: number;
    blocks: number;
    combos: number;
  };
  reactionMs: number;
  punches: number;
  ts: number;
  duration?: number;
}

export class Progress {
  private readonly STORAGE_KEY = 'guardai_progress';

  log(sessionMetrics: SessionMetrics): void {
    const sessions = this.getSessions();
    sessions.push(sessionMetrics);
    
    // Keep only last 100 sessions
    if (sessions.length > 100) {
      sessions.splice(0, sessions.length - 100);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
  }

  getSessions(): SessionMetrics[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  getStats(): {
    accuracy: {
      stance: number;
      blocks: number;
      combos: number;
    };
    totalPunches: number;
    avgReaction: number;
    totalTrainingTime: number;
  } {
    const sessions = this.getSessions();
    
    if (sessions.length === 0) {
      return {
        accuracy: { stance: 0, blocks: 0, combos: 0 },
        totalPunches: 0,
        avgReaction: 0,
        totalTrainingTime: 0
      };
    }
    
    const totals = sessions.reduce((acc, session) => {
      acc.stance += session.accuracy.stance;
      acc.blocks += session.accuracy.blocks;
      acc.combos += session.accuracy.combos;
      acc.punches += session.punches;
      acc.reaction += session.reactionMs;
      acc.duration += session.duration || 0;
      return acc;
    }, {
      stance: 0,
      blocks: 0,
      combos: 0,
