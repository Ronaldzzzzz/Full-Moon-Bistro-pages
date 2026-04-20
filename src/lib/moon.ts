/**
 * 計算當前的月相 (0 to 1)
 * 0 & 1 = 新月 (New Moon)
 * 0.5 = 滿月 (Full Moon)
 */
export function getMoonPhase(): number {
  const lp = 2551443; // 朔望月 (Synodic Month) 的秒數 約 29.53 天
  const now = new Date();
  const newMoon = new Date(1970, 0, 7, 20, 35, 0); // 基準新月時間
  
  const phase = ((now.getTime() - newMoon.getTime()) / 1000) % lp;
  return phase / lp;
}

/**
 * 獲取月相名稱 (中文)
 */
export function getMoonPhaseName(phase: number): string {
  if (phase < 0.03 || phase > 0.97) return '朔月';
  if (phase < 0.22) return '眉月';
  if (phase < 0.28) return '上弦月';
  if (phase < 0.47) return '盈凸月';
  if (phase < 0.53) return '望月 (滿月)';
  if (phase < 0.72) return '虧凸月';
  if (phase < 0.78) return '下弦月';
  return '殘月';
}
