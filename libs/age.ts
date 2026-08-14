/**
 * 生年月日から満年齢を求める。
 *
 * 年齢をハードコードすると誕生日を跨いだ瞬間に嘘になるため、表示側では必ずこれを通す。
 * 比較は「年*10000 + 月*100 + 日」の数値に潰して行う。Date 同士の引き算で
 * ミリ秒からうるう年を按分するより、境界(誕生日当日)の扱いが素直になる。
 */
export function calcAge(birthday: string, now: Date = new Date()): number {
  const [y, m, d] = birthday.split('-').map(Number);
  if (!y || !m || !d) {
    throw new Error(`calcAge: 生年月日は YYYY-MM-DD で渡す (received: ${birthday})`);
  }
  const born = y * 10000 + m * 100 + d;
  const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return Math.floor((today - born) / 10000);
}
