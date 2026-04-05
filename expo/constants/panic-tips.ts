export interface PanicTip {
  id: string;
  title: string;
  description: string;
  icon: "droplets" | "dumbbell" | "phone" | "footprints" | "snowflake" | "pencil" | "music" | "brain";
}

export const PANIC_TIPS: PanicTip[] = [
  {
    id: "cold_water",
    title: "冷水を浴びろ",
    description: "今すぐシャワーを浴びろ。冷たい水が衝動を消し飛ばす。30秒でいい。",
    icon: "snowflake",
  },
  {
    id: "pushups",
    title: "腕立て20回",
    description: "今すぐ床に手をつけ。体を動かせば脳が切り替わる。限界まで追い込め。",
    icon: "dumbbell",
  },
  {
    id: "go_outside",
    title: "外に出ろ",
    description: "スマホを置いて外に出ろ。5分歩くだけでいい。空気を吸え。",
    icon: "footprints",
  },
  {
    id: "call_someone",
    title: "誰かに電話しろ",
    description: "友達でも家族でもいい。話すことで衝動から意識が離れる。",
    icon: "phone",
  },
  {
    id: "write_feelings",
    title: "今の気持ちを書け",
    description: "紙でもメモでもいい。なぜ見たいのか、見た後どう感じるか、書き出せ。",
    icon: "pencil",
  },
  {
    id: "deep_breath",
    title: "深呼吸しろ",
    description: "4秒吸って、4秒止めて、6秒で吐く。5回繰り返せ。体が落ち着く。",
    icon: "droplets",
  },
  {
    id: "listen_music",
    title: "音楽を聴け",
    description: "お気に入りの曲を爆音で流せ。気分が変わる。歌え。",
    icon: "music",
  },
  {
    id: "remember_why",
    title: "なぜ始めたか思い出せ",
    description: "目を閉じて思い出せ。お前が目指す自分は、今ここで負ける奴じゃない。",
    icon: "brain",
  },
];

export const EMERGENCY_QUOTES = [
  "この衝動は波だ。乗り越えれば消える。",
  "5分後のお前は、耐えた自分を誇りに思う。",
  "一瞬の快楽か、一生の後悔か。選べ。",
  "お前はここまで来た。ここで終わるな。",
  "弱さを認めた時、お前はもう強い。",
  "画面の向こうに、お前の未来はない。",
  "今日を乗り越えれば、明日はもっと楽になる。",
  "衝動は嘘つきだ。従うな。",
];

export function getRandomEmergencyQuote(): string {
  return EMERGENCY_QUOTES[Math.floor(Math.random() * EMERGENCY_QUOTES.length)];
}
