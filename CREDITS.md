# CREDITS

**中文**(以下)| **[English summary](#english-summary)**(本頁末尾 · at the end of this page)

本項目是**非官方同人作品**。

- 與 Mili 及其所屬公司 / 發行方無關,未獲官方授權或背書。
- 與 Anthropic 無關,未獲其授權或背書。**Claude 是 Anthropic 的商標**;片中以擬人角色與聊天介面的形式出現,僅為同人創作的指涉。
- 片尾(斷電後的黑屏)有同樣內容的英文註記(三行;第三行說明角色剪影由製作者提供、介面以程式碼繪製)。
- 成片在歌曲之前有 5 秒無聲的閃光警告頁(原創文案,英文與繁體中文)。

## 授權一覽

| 內容 | 授權 |
| --- | --- |
| 程式碼(`src/`、`export/`、`tools/`、`index.html`、`config.json`),以及本項目自己撰寫的文件、聊天文案與錯誤文案(`docs/`) | MIT,見 [LICENSE](LICENSE) |
| 角色剪影(`assets/character/*.png`)與含有它們的畫面(例如 `docs/images/cover.jpg`) | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hant):署名、非商業、以相同方式分享。署名:Nyankomint |
| 歌曲的錄音、音樂與歌詞 | **不在本倉庫內**。權利屬於 Mili 及相關權利人,上面兩種授權都不涵蓋它們 |
| 字體 | 不在本倉庫內,安裝時由 npm 取得;各為 SIL OFL 1.1(見下方「字體」) |
| Claude 的名稱與標誌 | Anthropic 的商標;上面兩種授權都不涉及任何商標權利 |

## AI 使用說明

- 本項目的程式碼與文件由 AI(Claude,經 Claude Code)撰寫;方向、素材、逐輪的審片意見與取捨來自製作者。各輪的要求見 [docs/README.md](docs/README.md)。
- 角色剪影是製作者以 AI 圖像生成工具製作的 Claude 擬人二創圖。
- 成片因此含有 AI 生成的內容;分享影片或由本工程導出的畫面時,請一併標示。

## 原曲

- 曲名:world.execute(me);
- 演唱 / 樂團:Mili
- 作曲:Mili / Cassie Wei;作詞:Mili(取自製作者手上 LRC 文件的署名行)
- 收錄:專輯《Miracle Milk》(2016)
- 歌曲的音樂、歌詞及錄音版權歸 Mili 及相關權利人所有。

**本倉庫不含這首歌的音頻,也不含歌詞文本。** 預覽與導出時讀取的是你自己放在 `音頻&歌詞/` 的檔案(見 README「需要自備的兩個檔案」);
歌詞只用於畫面顯示。倉庫裡與歌曲有關的資料只有兩份:

- `data/lyric_timing.json`:片中每一行歌詞的起止時間、段落、是否關鍵詞、詞數與字母數,以及兩個截短的雜湊值
  (用來核對你的歌詞檔,並在分行不同時重新分行)。沒有任何歌詞文字。
- `data/audio_features.json`:由 `tools/analyze_audio.py` 從錄音算出的分析數值:節拍格、起音時間,以及每 1/60 秒一筆的響度、
  三個頻段的能量與 32 個頻帶的粗略頻譜(均已正規化)。它讓畫面跟著音樂動;不是錄音,也不能代替錄音。

`tools/check_no_lyrics.mjs`(`npm run check:lyrics`)在發布前核對:要發布的檔案裡沒有任何一行歌詞的連續四個詞以上。
程式與文件裡出現的只有個別關鍵詞與歌名。

依 [Mili 官方的著作權指引](https://projectmili.com/copyright-guidelines)(2026 年 10 月查閱):非營利的個人二次創作可以自由進行;
全部或部分以 AI 製作的同人作品須明確標示為 AI 生成。本片與本倉庫為個人、非商業用途,AI 的使用情況見上方「AI 使用說明」。
由本工程導出的影片含有原曲,分享時請遵守同一份指引。

## 角色圖

- **第四版使用的八張三色剪影**(`assets/character/` 內的 f_bust / f_profile / f_reach / f_eye / boy_bust / man_bust / cat_bust / cat_paws)
  **由本片製作者提供**,是以 AI 圖像生成工具製作的 Claude 擬人二創圖(複製進工程時改為英文檔名;f_bust 裁去最後一行像素)。
  製作者手上的原檔與未採用的其餘幾張不在本倉庫內。授權:CC BY-NC-SA 4.0(見上方「授權一覽」)。
- 本工程對剪影只做:按墨色分成橙、米白、黑三個版並各自套上調色盤的顏色、錯版(位移)、逐版顯影、裁切、遮罩、鏡像(f_eye 一律水平鏡像)、
  以分版後的輪廓描成路徑以供放大、以及取樣成網點或字符。不重繪、不扭曲五官、不讓嘴部動作,也不以程式繪製角色的臉。
- 第三版使用的六張插畫(library / tea / rain / gaze / plea / parted,同樣由製作者提供)**已從第四版全片撤下**,檔案也已從 `assets/character/` 移除
  (只保留在製作者本機的第三版備份裡,不在本倉庫內)。原本以它們模糊後充當的房間背景,已全部改為程式繪製的暖色底;
  程式裡 `tea` / `rain` / `library` 這幾個名字現在只是房間的名字(決定牆面光斑的位置),背後沒有任何圖片。
- 角色髮飾的放射狀花形與片中的火花圖示是同一個圖形母題,由程式依剪影中的花飾自行繪製(`src/components/motif.js`)。
- 茄子與番茄的「程式符號畫」、版畫中的閃電、圓盤、視窗盒子、心形曲線與其光條等圖形全部由程式繪製。
- 主歌二裡的分子(纖維素與肽鏈的片段、葡萄糖、番茄紅素、維生素 C、維生素 E)是依公知的化學結構、以程式繪製的簡化骨架式,僅作畫面內容。
- 導歌一「時間旅行」裡的歷史剪影帶(高樓、尖塔、柱廊、階梯神廟、金字塔)是程式繪製的通用造型,不取自任何特定圖像或建築照片。
- 最後一張版畫裡她伸出的手,是從剪影本身的米白墨版取出的一塊(以掌心為起點的連通區域),不是手繪的遮罩。

## 介面與其餘畫面

- 聊天介面(側欄、標題列、對話串、輸入框、設定抽屜、提示與錯誤視窗、游標)、圖示、圖表、轉場與著色器
  全部由本項目以程式碼從零繪製;**未使用任何軟體的截圖**,未複製其他影片的具體鏡頭。
- 片中的聊天內容、設定項目、資料、錯誤訊息與畫面上的程式碼均為本片原創撰寫(`docs/v4/chat_script.json`、`docs/v4/errors.json`、`src/scenes/loop.js`)。
- 主歌二版畫裡的數值(每 100 克的成分、呼嚕聲的頻率)與分子式為一般性的常識,僅作畫面內容,不作為資料來源引用。
- 心形使用公知的代數曲線 (x² + y² − 1)³ − x²y³ = 0:沿每條射線以二分法求出曲線上的點(240 個),片中逐點描出的就是這些點。

## 字體(全部為 SIL Open Font License 1.1)

| 字體 | 在片中的角色 | 作者 / 上游 | 取得方式 |
| --- | --- | --- | --- |
| Source Serif 4 (400/600/700/900, italic 400/600) | 襯線體 = AI 說的話(歌詞、關鍵詞大字) | Adobe (Frank Grießhammer) · github.com/adobe-fonts/source-serif | npm `@fontsource/source-serif-4` |
| Inter (400–800) | 無襯線體 = 介面與使用者 | Rasmus Andersson · github.com/rsms/inter | npm `@fontsource/inter` |
| JetBrains Mono (300/400/700/800) | 等寬體 = 系統與程式碼 | JetBrains · github.com/JetBrains/JetBrainsMono | npm `@fontsource/jetbrains-mono` |
| Noto Serif KR (700) / Noto Sans KR (500) | 數數卡的韓文(數詞 / 語言名) | Google · Adobe(Noto CJK) | npm `@fontsource/noto-serif-kr`、`@fontsource/noto-sans-kr` |
| Noto Serif TC (700) / Noto Sans TC (500) | 數數卡的中文(數詞 / 語言名);Noto Sans TC 另用於片頭警告頁的中文一行 | Google · Adobe(Noto CJK) | npm `@fontsource/noto-serif-tc`、`@fontsource/noto-sans-tc` |

第二版使用的 Anton 已移除。

## 第三方軟體

| 名稱 | 用途 | 協議 |
| --- | --- | --- |
| librosa | 音頻分析(節拍、onset、頻譜) | ISC |
| NumPy | 數值計算 | BSD-3-Clause |
| SciPy | librosa 依賴 | BSD-3-Clause |
| numba | librosa 依賴 | BSD-2-Clause |
| soundfile(libsndfile) | 讀取 wav | BSD-3-Clause(libsndfile:LGPL-2.1) |
| playwright-core | 驅動無頭 Chrome 逐幀渲染 | Apache-2.0 |
| ffmpeg-static | 提供 FFmpeg 可執行文件 | GPL-3.0-or-later |
| FFmpeg(gyan.dev essentials build) | 影片編碼 / 混流,作為獨立外部程式調用 | GPL-3.0-or-later |
| @fontsource/* | 字體文件打包(見上表) | OFL-1.1 |
| Google Chrome / Microsoft Edge | 渲染環境(使用本機已安裝版本) | 各自的使用條款 |

上述工具僅在製作過程中使用;導出的影片不包含這些軟體的代碼。

---

## English summary

This project is an **unofficial fan work**.

- It is not affiliated with Mili, their label or their publishers, and has not been authorised or endorsed by them.
- It is not affiliated with Anthropic and has not been authorised or endorsed by it. **Claude is a trademark of Anthropic**;
  it appears in the film as a personified character and as a chat interface, as a fan work's reference only.
- The film ends with the same notice in English, and opens with a silent 5-second photosensitivity warning page.

### What is under which licence

| Content | Licence |
| --- | --- |
| The code (`src/`, `export/`, `tools/`, `index.html`, `config.json`) and the documents, chat text and error text written for this project (`docs/`) | MIT, see [LICENSE](LICENSE) |
| The character silhouettes (`assets/character/*.png`) and pictures that contain them (for example `docs/images/cover.jpg`) | [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/): attribution, non-commercial, share alike. Credit: Nyankomint |
| The recording, the music and the lyrics of the song | **Not in this repository.** They belong to Mili and the respective rights holders; neither licence above covers them |
| The fonts | Not in this repository; fetched by npm at install time; each under SIL OFL 1.1 |
| The name and marks of Claude | Trademarks of Anthropic; neither licence above grants any trademark right |

### Use of AI

- The code and the documents of this project were written by AI (Claude, through Claude Code). The direction, the material,
  and the review notes and decisions of every round came from the maker; the requirements of each round are listed in
  [docs/README.md](docs/README.md).
- The character silhouettes are fan art of a personified Claude, made by the maker with an AI image generator.
- The finished film therefore contains AI-generated content. Say so when you share the video or pictures exported from this project.

### The original song

- Title: world.execute(me);
- Performed by: Mili
- Music: Mili / Cassie Wei; lyrics: Mili (as credited in the maker's lyric file)
- From the album "Miracle Milk" (2016)
- The music, the lyrics and the recording are the property of Mili and the respective rights holders.

**This repository contains neither the audio of the song nor the text of its lyrics.** The preview and the exporter read the
files you put into `音頻&歌詞/` yourself; the lyrics are used for display only. Two files in the repository are derived from the song:

- `data/lyric_timing.json`: for every lyric line of the film, its start and end time, section, whether it is a keyword line,
  how many words and letters it has, and two truncated hashes (to check your lyric file and to re-divide it where its rows
  are divided differently). It holds no lyric text.
- `data/audio_features.json`: values computed from the recording by `tools/analyze_audio.py`: the beat grid, onset times, and,
  60 times a second, loudness, the energy of three frequency bands and a coarse 32-band spectrum (all normalised). It lets the
  picture move with the music; it is not the recording and cannot stand in for it.

`tools/check_no_lyrics.mjs` (`npm run check:lyrics`) checks before publication that no file to be published carries four or
more consecutive words of any lyric line. Only single keywords and the title of the song appear in the code and the documents.

Under [Mili's copyright guidelines](https://projectmili.com/copyright-guidelines) (read in October 2026), non-profit personal
derivative works may be made freely, and fan works made wholly or partly with AI must be clearly marked as AI-generated.
This film and this repository are personal and non-commercial. A video exported from this project contains the original song:
share it only as those guidelines allow.

### Character art

- The eight three-ink silhouettes used by version 4 (`assets/character/`) were **provided by the maker**, who made them with an
  AI image generator. Licence: CC BY-NC-SA 4.0. The maker's source files and the pictures that were not used are not in this repository.
- The project only separates each silhouette into its three inks (orange, cream, black), recolours, shifts, reveals, crops,
  masks and mirrors the plates, traces their outlines for close-ups, and samples them into dots or glyphs. It does not redraw
  them, distort the features, animate the mouth, or draw a face in code.
- The six illustrations used by version 3 were removed from the film and are not in this repository.
- Every other graphic (the radial flower motif, the objects made of code glyphs, molecules, the strip of historical silhouettes,
  the heart curve, the lightning, the discs and windows) is drawn by the code of this project.

### Interface and everything else

- The chat interface, icons, charts, transitions and shaders are all drawn from scratch in code. **No screenshot of any
  software is used**, and no specific shot of another video is copied.
- The chat text, settings, data, error messages and the code shown on screen were written for this film.

### Fonts (all SIL Open Font License 1.1, fetched through `@fontsource`)

| Font | Role in the film | Upstream |
| --- | --- | --- |
| Source Serif 4 | Serif = what the AI says (lyrics, large keywords) | Adobe · github.com/adobe-fonts/source-serif |
| Inter | Sans = the interface and the user | Rasmus Andersson · github.com/rsms/inter |
| JetBrains Mono | Mono = the system and code | JetBrains · github.com/JetBrains/JetBrainsMono |
| Noto Serif KR / Noto Sans KR, Noto Serif TC / Noto Sans TC | Korean and Chinese on the counting cards; the Chinese line of the warning page | Google · Adobe (Noto CJK) |

### Third-party software

Used while making the film; none of it is redistributed in this repository, and an exported video contains none of its code:
librosa (ISC), NumPy, SciPy and numba (BSD), soundfile / libsndfile (BSD-3-Clause / LGPL-2.1), playwright-core (Apache-2.0),
ffmpeg-static and FFmpeg (GPL-3.0-or-later, called as a separate external program), @fontsource packages (OFL-1.1), and the
locally installed Google Chrome or Microsoft Edge as the rendering environment.
