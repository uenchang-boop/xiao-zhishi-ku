# 小知識庫 部署說明

> ✅ **2026-05-22 已完成部署（當前 v2）**
> - 手機網頁：https://uenchang-boop.github.io/xiao-zhishi-ku/
> - GitHub Repo：https://github.com/uenchang-boop/xiao-zhishi-ku
> - Sheets：https://docs.google.com/spreadsheets/d/1bhMqeIPKphRGQ8k7S-vs0_Kd2LCy76Iu6Aw6KNoqh-o/
> - Apps Script URL：已串接，不公開貼於此
>
> **v2 變更**：網址改為非必填，「網址 / 標題 / 備註 至少填一個」即可送出
> **舊 v1 部署**：URL 結尾 `...Q/exec`，未封存（不影響運作，建議去 Apps Script「管理部署作業」封存）
>
> **底下部署步驟保留作為日後重建 / 改架構參考。**
> **改網頁/改 Apps Script 的維護備忘看本檔最末。**

整體架構：
```
手機網頁 (GitHub Pages)  →  Apps Script Web App  →  Google Sheets  →  NotebookLM
```

---

## Step 0：你需要先做的事

**建立一份新的 Google Sheets**：
1. 開 https://sheets.new
2. 把預設的 `工作表1` 改名成 `新知`
3. 在底下 ➕ 再加 2 個 sheet：`待處理`、`待執行`
4. **3 個 sheet 都加上同一列標題**（A1~F1）：
   ```
   日期 | 類別 | 標題 | 網址 | 備註 | 內文
   ```
5. （可選）匯入舊資料：在 `新知` sheet 點「檔案 → 匯入 → 上傳」，選 `output\新知.csv`，匯入位置選「附加到目前的工作表」，分隔符選逗號

---

## Step 1：部署 Apps Script（後端）

1. 在剛建好的 Sheets 點上方 **擴充功能 → Apps Script**
2. 把預設的 `Code.gs` 內容**全選刪掉**，貼上 `webapp/Code.gs` 的整段 code
3. **⚠️ 重要**：找到這行：
   ```js
   const SHARED_TOKEN = "PLEASE_CHANGE_THIS_TO_YOUR_OWN_TOKEN";
   ```
   把字串換成你自選的隨機英數密碼（至少 16 字元，例如 `myKb_2026_aB3xZ9q!`）。
   **記住這個 token**，等下手機網頁第一次開要輸入。
4. 左上「未命名專案」改名成 `小知識庫 API`，按 💾 存檔
4. 右上點 **部署 → 新增部署作業**
   - 齒輪 → 選擇類型：**網頁應用程式**
   - 說明：`v1`
   - 執行身分：**我**（你自己的 Gmail）
   - 誰可以存取：**任何人**（不需登入就能 POST）
5. 點「部署」→ 第一次會要求授權 → 選你的 Google 帳號 → 「進階」→「前往（不安全）」→ 允許
6. **複製拿到的「網頁應用程式 URL」**，看起來像：
   ```
   https://script.google.com/macros/s/AKfycb.........../exec
   ```
7. 測試：把這 URL 直接貼瀏覽器打開，應該顯示「小知識庫 Web App 運作中」

---

## Step 2：部署手機網頁（前端）

### 2-1 先把 API URL 填進前端

打開 `webapp/index.html`，找到這行：
```js
const API_URL = "REPLACE_WITH_YOUR_APPS_SCRIPT_URL";
```
把字串換成你 Step 1 拿到的 Web App URL，存檔。

### 2-2 推上 GitHub

PowerShell 在 `webapp/` 資料夾跑：
```powershell
cd C:\Users\User\Downloads\小知識庫\webapp
git init
git add .
git commit -m "init 小知識庫 web app"
gh repo create xiao-zhishi-ku --public --source=. --remote=origin --push
```

（你已經登入 `uenchang-boop`，會建立 `https://github.com/uenchang-boop/xiao-zhishi-ku`）

### 2-3 開啟 GitHub Pages

```powershell
gh repo edit --enable-issues=false
gh api -X POST repos/uenchang-boop/xiao-zhishi-ku/pages -f source[branch]=main -f source[path]=/
```

或網頁操作：repo → Settings → Pages → Branch 選 `main` / `(root)` → Save

等 1~2 分鐘後網址會是：
```
https://uenchang-boop.github.io/xiao-zhishi-ku/
```

### 2-4 加到手機主畫面

iPhone Safari / Android Chrome 打開上面網址 → 分享 → **加入主畫面**，桌面就會有一個 📚 圖示，點開像 App 一樣。

### 2-5 首次使用輸入 TOKEN

第一次打開網頁按「新增到 Sheets」時會跳出 prompt 視窗，輸入你在 Step 1 設定的 `SHARED_TOKEN` 字串。
- 會自動存在瀏覽器 localStorage，之後不用再輸入
- 如果輸錯了，會跳「未授權」提示並自動清掉，下次按送出會再 prompt

---

## Step 3：NotebookLM 連動

1. 開 https://notebooklm.google.com → 新增筆記本
2. 加入來源 → **Google Drive** → 選你剛剛建的那份 Sheets
3. 之後你透過手機網頁新增資料，**回到 NotebookLM 點「同步來源」**就會更新

> ⚠️ NotebookLM 不會即時同步，需要手動點「同步來源」。如果常忘記，也可以建好後過幾天再同步一次。

---

## 之後新增舊文章內容（第 8 篇黏合問題）

我這次匯入的 `新知.csv` 第 8 列是 34000 字、裡面其實有 4 篇文章黏在一起（▍Harness Engineering / #ChatGPT Images / #nano banana pro / ▋ 趨勢三篇）。建議匯入後在 Sheets 用：

1. 切出該列，複製內文欄到記事本
2. 用 Ctrl+H 把 `▍`、`#0`、`▋ 趨勢` 等明顯的篇名標記前插入分行
3. 一篇切成一列回貼，順手把標題欄補一下

或者最簡單：**先放著不動**，反正之後新增都會走網頁，舊資料不影響。

---

## 疑難排解

| 症狀 | 原因 | 修法 |
|---|---|---|
| 網頁按新增跳「連線失敗」 | API_URL 沒換或部署沒授權 | 重新檢查 Step 1 |
| 寫進 Sheets 但欄位錯亂 | 沒按順序加 sheet 標題列 | 確認 A1~F1 順序 |
| 手機加到主畫面後白屏 | manifest 路徑問題 | GitHub Pages URL 結尾要有 `/` |
| Apps Script 改 code 後沒生效 | Apps Script 部署是版本化的 | **部署 → 管理部署作業 → 編輯 → 版本選「新版本」→ 部署** |

---

## 📋 維護備忘（重要）

### 🔧 改前端（HTML/CSS/JS）
```powershell
cd C:\Users\User\Downloads\小知識庫\webapp
# 改完 index.html / manifest.json 後
git add .
git commit -m "你改了什麼"
git push
# 約 30 秒 GitHub Pages 自動重建上線
```
**確認重建完成**：
```powershell
gh api repos/uenchang-boop/xiao-zhishi-ku/pages/builds/latest --jq .status
# 看到 "built" 就 OK
```

### 🔧 改後端（Apps Script Code.gs）
1. 開你的 Apps Script 編輯器（不是從 Sheets 進，是直接 https://script.google.com/home 找「小知識庫 API」）
2. 改 code → 按 💾 存檔
3. **重要**：右上「**部署 → 管理部署作業**」
4. 右側鉛筆圖示編輯現有部署
5. 「版本」下拉 → 選「**新版本**」（不選會跑舊版！）
6. 描述填 `v2` 或日期 → 部署
7. URL 不變，前端不用改

### 🆕 新增分類（例如多加一個「已讀」）
要同步改三處，缺一不可：
1. **Sheets**：新增 `已讀` 工作表 + A1~F1 標題列
2. **Code.gs** `SHEET_MAP`：加 `"已讀": "已讀"`
3. **index.html**：加一顆 `<button class="cat-btn" data-cat="已讀">已讀</button>` + 在 CSS 加配色（可選）

### 🔑 忘記 TOKEN 怎麼辦
- 開 Apps Script 編輯器看 `SHARED_TOKEN = "..."` 那行
- 手機輸錯會自動清掉 localStorage，重按送出會再 prompt

### 🔄 換 TOKEN
1. Code.gs 改 SHARED_TOKEN
2. **重新部署**（同上「改後端」流程）
3. 手機 Safari 設定 → 進階 → 網站資料 → 找 `uenchang-boop.github.io` 刪掉，再開網頁會重新 prompt

### 🚫 千萬別做
- ❌ **不要**把 SHARED_TOKEN 改成真值後 `git push`（會洩漏到 public repo）
- ❌ **不要**把 Sheets 設成「任何擁有連結的使用者可編輯」
- ❌ **不要**刪掉 `ai新知.docx` 裡的「下一篇/再一篇/另一篇」分隔詞，之後想重跑 `split_articles.py` 會出錯
- ❌ **不要**從 Sheets「擴充功能 → Apps Script」進入修改（會遇多帳號錯誤），永遠走 https://script.google.com/home

### 📦 重新拆 docx
如果以後 `ai新知.docx` 補了更多文章想重跑：
```powershell
cd C:\Users\User\Downloads\小知識庫
python split_articles.py    # 拆 docx → articles.json
python export_csv.py        # → output\新知.csv
# 然後手動匯入 Sheets「新知」分頁（附加到目前的工作表）
```
