// Lyrics timeline. Lines carry start/end; typing progress is derived from t only.
import { clamp } from './util.js';

export class Lyrics {
  constructor(data, cfg, features, translations = null) {
    if (translations && (!Array.isArray(translations.lines) || translations.lines.length !== data.lines.length ||
      translations.lines.some((s) => typeof s !== 'string' || !s.trim()))) {
      throw new Error('中文字幕与英文 LRC 行数不一致，或存在空行');
    }
    // Preserve all source times, emphasis and sections. The lyric renderer consumes only the
    // translated text; the original LRC and data/lyrics.json remain untouched for synchronization.
    this.lines = translations ? data.lines.map((ln, i) => ({ ...ln, text: translations.lines[i], sourceText: ln.text, words: undefined })) : data.lines;
    this.sections = data.sections;
    this.typing = cfg.typing;
    this.offset = cfg.timing.lyricOffset || 0;
    // Keyword (ALL-CAPS) lines are the hits of the song: if the LRC time is within
    // keywordSnap seconds of a beat, use the beat so text, flash and geometry land together.
    const tol = cfg.timing.keywordSnap || 0;
    this.starts = this.lines.map((l) => (l.emphasis && tol > 0 && features ? features.snapToBeat(l.start, tol) : l.start));
  }

  /** Line start/end with snapping and lyricOffset applied. */
  start(i) { return this.starts[i] + this.offset; }
  end(i) { return this.lines[i].end + this.offset; }

  /** Index of the last line whose start <= t (or -1 before the first line). */
  indexAt(t) {
    let lo = 0, hi = this.lines.length - 1, r = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (this.start(m) <= t) { r = m; lo = m + 1; } else hi = m - 1; }
    return r;
  }

  /** How many characters of line i are typed at time t. Uses word timestamps when the LRC has them. */
  typed(i, t) {
    const ln = this.lines[i], len = ln.text.length;
    if (ln.words) {                               // enhanced LRC: reveal word by word
      let n = 0;
      for (const w of ln.words) { if (w.t + this.offset <= t) n += w.text.length; }
      return { n: Math.min(n, len), done: n >= len };
    }
    const dur = Math.min((ln.sourceText?.length ?? len) / this.typing.charsPerSec, (this.end(i) - this.start(i)) * this.typing.maxFraction);
    const k = clamp((t - this.start(i)) / Math.max(dur, 1e-3));
    return { n: Math.floor(k * len + 1e-6), done: k >= 1 };
  }

  /** Current-line summary used by the HUD and the preview page. */
  state(t) {
    const index = this.indexAt(t);
    if (index < 0) return { index, line: null, active: false };
    const line = this.lines[index];
    return { index, line, active: t < this.end(index), section: line.section, ...this.typed(index, t) };
  }
}
