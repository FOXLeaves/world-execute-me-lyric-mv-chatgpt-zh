# 提示詞與製作文件 · Prompts and production documents

**[中文](#中文)** | **[English](#english)**

> **提示詞 · The prompts:** [v4/PROMPT_v4.md](v4/PROMPT_v4.md) · [v4/PROMPT_v4_fix.md](v4/PROMPT_v4_fix.md)
>
> 兩份都是簡體中文。 · Both are written in Simplified Chinese.

---

## 中文

這支影片的程式碼由 AI 撰寫。這個資料夾收的是製作過程裡人與 AI 之間來回的文件:製作者提出的要求、據此定下的規則、每一輪做完之後的紀錄。

### 提示詞:製作者給 AI 的要求

| 輪次 | 檔案 | 內容 |
| --- | --- | --- |
| 第四版(精修版) | [v4/PROMPT_v4.md](v4/PROMPT_v4.md) | 全片逐段的要求,約 2.3 萬字:三種畫面、三色剪影的用法、每一段的設計方向、閃光安全、自查清單、交付順序。分三次對話執行完。 |
| 第四版的修復輪 | [v4/PROMPT_v4_fix.md](v4/PROMPT_v4_fix.md) | 看過 1080p 預覽之後的三項修改:導歌二的踩點改跟人聲、最後副歌的人物鏡頭重做、最後一段的光更強。 |

- 這兩份是「交接說明」:把製作者每一輪看片之後的意見與決定整理成文(起草時有 AI 協助),再交給一個新的對話去執行。
- **它們不是一鍵復現的配方。** `PROMPT_v4.md` 開頭就寫明第三版已經通過,並且引用 `v3/` 的規則與 `v4/maps/` 的分析;
  單獨把它交給一個空白的對話,做不出這支影片。把它當作製作過程的紀錄來讀。
- 第一版到第三版的要求當時直接貼在對話裡,沒有存成檔案,所以不在這裡。

### 規則:由要求整理出來、寫程式時遵守的約定

| 檔案 | 內容 |
| --- | --- |
| [v4/PLAN.md](v4/PLAN.md) | 敘事、三種畫面、顏色語義、質感標準、剪影的用法、分段、文案歸屬、閃光安全(英文) |
| [v4/KIT.md](v4/KIT.md) | 如何寫一個段落:鏡頭定義、可用元件、驗收標準、檢查方法(英文) |
| [v3/PLAN.md](v3/PLAN.md)、[v3/KIT.md](v3/KIT.md) | 第三版的同名文件;第四版的要求以它們為起點,與之不一致的地方以第四版為準 |

### 紀錄:每一輪實際做了什麼

| 檔案 | 內容 |
| --- | --- |
| [v4/PROGRESS.md](v4/PROGRESS.md) | 第四版的進度與交付:做完了什麼、量到的數字、每一處沒有照要求做的地方及原因(簡體中文,約 4 萬字) |
| [v4/maps/](v4/maps/) | 動手做第四版之前,對第三版逐段所做的分析:鏡頭清單、關鍵詞與重鼓點的實測時間、剪影的逐張測量、引擎的能力與缺口 |
| [v4/WANTED_ART.md](v4/WANTED_ART.md)、[v3/WANTED_ART.md](v3/WANTED_ART.md) | 做完之後列出的「還想要的圖」:因為沒有那張圖而只能繞過去的地方 |
| [../STORYBOARD.md](../STORYBOARD.md) | 逐鏡頭分鏡表,由 `npm run storyboard` 從程式裡的鏡頭清單自動生成 |

### 片中的文案

| 檔案 | 內容 |
| --- | --- |
| [v4/chat_script.json](v4/chat_script.json) | 聊天內容:使用者的訊息與操作、設定項、資料、時間戳(本片原創) |
| [v4/errors.json](v4/errors.json) | 錯誤文案、愛的迴圈、數數、最後一聲的紀錄(本片原創) |
| `v3/` 裡的同名檔 | 第三版當時的文案 |

### 讀這些文件時要知道的事

- **文件不引用歌詞。** 歌詞一律以行號指代(`text(i)`,從 0 起算;分鏡表的行號從 1 起算)。`v4/maps/` 與 `v3/PLAN.md` 裡原本零星引用的幾處,
  在公開前改成了 `[lyric]`。倉庫裡沒有歌詞文本,行號對應的是你用自己的歌詞檔生成的 `data/lyrics.json`(見上層 README)。
- 文件裡提到的 `out/`(導出檔、縮圖表、量測輸出)、`backup/`(舊版備份)、`圖片/`(剪影原檔)以及音頻與 LRC,都只在製作者的本機,不在倉庫內。
- `v4/maps/` 裡的 `<scratchpad>` 是當時那次對話的暫存資料夾;放在那裡的檢查圖沒有保留。
- 各文件的語言不一致是製作過程留下的原貌:給 AI 的要求與進度紀錄是簡體中文,規則是英文,對外的說明(README、CREDITS、分鏡表)是繁體中文。

---

## English

The code of this film was written by AI. This folder holds the documents that went back and forth between the maker and the
AI while it was made: what the maker asked for, the rules drawn from that, and the record of what each round built.

### The prompts: what the maker asked the AI for

| Round | File | What it contains |
| --- | --- | --- |
| Version 4 (the refinement) | [v4/PROMPT_v4.md](v4/PROMPT_v4.md) | The requirements for the whole film, section by section, about 23,000 Chinese characters. It was carried out over three conversations. |
| Fix round of version 4 | [v4/PROMPT_v4_fix.md](v4/PROMPT_v4_fix.md) | Three changes asked for after watching the 1080p preview. |

What is inside, by heading (the files themselves are in Simplified Chinese):

- **`PROMPT_v4.md`**: 1 what to read first and which document wins; 2 the general rules (three kinds of pictures, the standard
  for figurative graphics, what each colour means, who the character is, type and lyrics); 3 the material: the three-ink
  silhouettes; 4 shared engine work to do first; 5 every section of the song in turn (the warning page before the song,
  0:00–0:59, chorus 1, verse 2, pre-chorus 2, chorus 2 to the empty thread, the error section, EXECUTION and the counting,
  the last chorus and the four LOVE lines, the ending); 6 flash safety; 7 a self-check list; 8 constraints that do not change;
  9 order of work and what to deliver.
- **`PROMPT_v4_fix.md`**: what to read first; the way of working (only what is necessary); 1 two cues of pre-chorus 2 follow
  the voice instead of the beat; 2 the figure shots of the last chorus are rebuilt; 3 stronger light through the last
  stretch; 4 checks and delivery.

Three things to know about them:

- They are handover briefs: the maker's notes and decisions after watching each round, written up (drafted with AI help) and
  given to a fresh conversation to carry out.
- **They are not a one-shot recipe.** `PROMPT_v4.md` says at its start that version 3 had been approved, and it relies on the
  rules in `v3/` and the analysis in `v4/maps/`. Given alone to an empty conversation, it will not produce this film.
  Read it as a record of how the film was made.
- The requirements of versions 1 to 3 were pasted straight into the conversations of the time and never saved as files,
  so they are not here.

### The rules: drawn from the requirements, followed while writing the code

| File | What it contains |
| --- | --- |
| [v4/PLAN.md](v4/PLAN.md) | Story, the three kinds of pictures, colour semantics, texture standards, how the silhouettes are used, sections, flash safety (in English) |
| [v4/KIT.md](v4/KIT.md) | How to write a section: shot definitions, components, acceptance criteria, how to check (in English) |
| [v3/PLAN.md](v3/PLAN.md), [v3/KIT.md](v3/KIT.md) | The same documents of version 3; version 4 starts from them and overrides them where they differ |

### The record: what each round actually built

| File | What it contains |
| --- | --- |
| [v4/PROGRESS.md](v4/PROGRESS.md) | Progress and delivery of version 4: what was built, the measured numbers, every place that departs from the prompt and why (Simplified Chinese, about 40,000 characters) |
| [v4/maps/](v4/maps/) | The analysis of version 3 made before version 4 was started: shot lists, measured times of keywords and drum hits, measurements of every silhouette, what the engine could and could not do (in English) |
| [v4/WANTED_ART.md](v4/WANTED_ART.md), [v3/WANTED_ART.md](v3/WANTED_ART.md) | Pictures the film would still have liked to have: places that had to be worked around for lack of one |
| [../STORYBOARD.md](../STORYBOARD.md) | The shot-by-shot storyboard, generated from the shot list in the code by `npm run storyboard` |

### The words on screen

| File | What it contains |
| --- | --- |
| [v4/chat_script.json](v4/chat_script.json) | The chat: the user's messages and actions, settings, data, timestamps (written for this film) |
| [v4/errors.json](v4/errors.json) | Error messages, the love loop, the counting, the record of the last shout (written for this film) |

### Reading notes

- **The documents do not quote the lyrics.** Lines are referred to by number (`text(i)`, from 0; the storyboard counts from 1).
  The few quotations there were in `v4/maps/` and `v3/PLAN.md` were replaced by `[lyric]` before publication. The repository has
  no lyric text: the numbers refer to the `data/lyrics.json` you generate from your own lyric file (see the README one level up).
- `out/` (exports, contact sheets, measurements), `backup/` (older versions), `圖片/` (the source files of the silhouettes),
  the audio and the LRC that the documents mention exist only on the maker's machine, not in the repository.
- `<scratchpad>` in `v4/maps/` was the temporary folder of the conversation of that time; the check images kept there were not preserved.
- The mix of languages is how the documents were made: requirements and progress log in Simplified Chinese, rules in English,
  outward-facing pages (README, CREDITS, storyboard) in Traditional Chinese.
