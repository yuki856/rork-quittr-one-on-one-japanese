export const MOTIVATIONAL_QUOTES: string[] = [
  "画面の中の女に支配される人間になるな",
  "この衝動は一時的だ。お前の意志は永遠だ",
  "誘惑に勝てない奴は、人生の何にも勝てない",
  "今ここで耐えろ。未来のお前が感謝する",
  "弱い自分を殺せ。強い自分を生かせ",
  "お前は欲望の奴隷か、それとも自分の主人か",
  "楽な道を選ぶな。楽な道の先には何もない",
  "この瞬間を乗り越えた数だけ、お前は強くなる",
];

export function getRandomQuote(): string {
  const index = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
  return MOTIVATIONAL_QUOTES[index];
}
