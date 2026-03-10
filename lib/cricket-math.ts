/**
 * ── BSCCA Cricket Math Library ──
 * All cricket stat calculations in one place.
 * Pure functions, no side effects.
 */

// ─── Overs Helpers ───

/** Convert cricket overs format to decimal. 18.2 → 18.333 */
export function oversToDecimal(overs: string | number): number {
    const val = parseFloat(overs.toString()) || 0;
    const completed = Math.floor(val);
    const balls = Math.round((val - completed) * 10);
    return completed + balls / 6;
}

/** Convert decimal overs back to cricket format. 18.333 → "18.2" */
export function decimalToOvers(dec: number): string {
    const completed = Math.floor(dec);
    const balls = Math.round((dec - completed) * 6);
    return balls >= 6 ? `${completed + 1}.0` : `${completed}.${balls}`;
}

/** Increment overs by 1 ball. "4.5" → "5.0", "3.3" → "3.4" */
export function incrementOvers(overs: string): string {
    let [ov, balls] = (overs || "0.0").split('.').map(Number);
    balls = (balls || 0) + 1;
    if (balls >= 6) { ov += 1; balls = 0; }
    return `${ov}.${balls}`;
}

/** Total balls from overs string. "4.3" → 27 */
export function oversToBalls(overs: string | number): number {
    const val = parseFloat(overs.toString()) || 0;
    const completed = Math.floor(val);
    const balls = Math.round((val - completed) * 10);
    return completed * 6 + balls;
}

/** Balls to overs string. 27 → "4.3" */
export function ballsToOvers(balls: number): string {
    const ov = Math.floor(balls / 6);
    const rem = balls % 6;
    return `${ov}.${rem}`;
}

// ─── Batting Stats ───

/** Strike Rate = (Runs / Balls) × 100 */
export function strikeRate(runs: number, balls: number): string {
    if (balls <= 0) return "0.00";
    return ((runs / balls) * 100).toFixed(2);
}

/** Batting Average = Runs / (Innings - Not Outs) */
export function battingAverage(runs: number, innings: number, notOuts: number = 0): string {
    const dismissals = innings - notOuts;
    if (dismissals <= 0) return runs > 0 ? "∞" : "0.00";
    return (runs / dismissals).toFixed(2);
}

// ─── Bowling Stats ───

/** Economy Rate = Runs Conceded / Overs Bowled */
export function economy(runsConceded: number, oversBowled: string | number): string {
    const dec = oversToDecimal(oversBowled);
    if (dec <= 0) return "0.00";
    return (runsConceded / dec).toFixed(2);
}

/** Bowling Average = Runs Conceded / Wickets */
export function bowlingAverage(runsConceded: number, wickets: number): string {
    if (wickets <= 0) return "—";
    return (runsConceded / wickets).toFixed(2);
}

/** Bowling Strike Rate = Balls Bowled / Wickets */
export function bowlingStrikeRate(oversBowled: string | number, wickets: number): string {
    if (wickets <= 0) return "—";
    const balls = oversToBalls(typeof oversBowled === 'number' ? oversBowled.toString() : oversBowled);
    return (balls / wickets).toFixed(1);
}

// ─── Match Stats ───

/** Current Run Rate = Runs / Overs */
export function runRate(runs: number, overs: string | number): string {
    const dec = oversToDecimal(overs);
    if (dec <= 0) return "0.00";
    return (runs / dec).toFixed(2);
}

/** Required Run Rate = (Target - Current) / Overs Remaining */
export function requiredRunRate(target: number, currentScore: number, oversRemaining: string | number): string {
    const dec = oversToDecimal(oversRemaining);
    if (dec <= 0) return "∞";
    const needed = target - currentScore;
    if (needed <= 0) return "0.00";
    return (needed / dec).toFixed(2);
}

/**
 * Net Run Rate (cumulative)
 * NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
 */
export function calculateNRR(
    runsScored: number,
    oversFaced: string | number,
    runsConceded: number,
    oversBowled: string | number
): string {
    const faced = oversToDecimal(oversFaced);
    const bowled = oversToDecimal(oversBowled);
    if (faced <= 0 || bowled <= 0) return "0.000";
    const nrr = (runsScored / faced) - (runsConceded / bowled);
    return (nrr > 0 ? "+" : "") + nrr.toFixed(3);
}

// ─── Score Parsing ───

/** Parse "145/4" → { runs: 145, wickets: 4 } */
export function parseScore(score: string): { runs: number; wickets: number } {
    const [r, w] = (score || "0/0").split('/').map(Number);
    return { runs: r || 0, wickets: w || 0 };
}

/** Build score string from runs and wickets */
export function buildScore(runs: number, wickets: number): string {
    return `${runs}/${wickets}`;
}

// ─── Projection Helpers ───

/** Projected score at end of innings based on current run rate */
export function projectedScore(currentRuns: number, currentOvers: string | number, totalOvers: number): number {
    const dec = oversToDecimal(currentOvers);
    if (dec <= 0) return 0;
    const rr = currentRuns / dec;
    return Math.round(rr * totalOvers);
}

/** Win probability (simplified — based on RRR vs CRR ratio) */
export function winProbability(currentRR: number, requiredRR: number): number {
    if (requiredRR <= 0) return 100;
    if (currentRR <= 0) return 0;
    const ratio = currentRR / requiredRR;
    return Math.min(100, Math.max(0, Math.round(ratio * 50)));
}
