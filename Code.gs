/**
 * 小知識庫 - Google Apps Script Web App 後端（獨立專案版）
 * 從 https://script.google.com/home 新建專案使用
 * 用 openById 連到指定的 Sheets，不依賴「擴充功能 → Apps Script」
 */

// 你的 Sheets ID（URL 中 /d/ 後面那串）
const SHEET_ID = "1bhMqeIPKphRGQ8k7S-vs0_Kd2LCy76Iu6Aw6KNoqh-o";

// 「類別」對應到 Sheet 名稱
const SHEET_MAP = {
  "新知": "新知",
  "待處理": "待處理",
  "待執行": "待執行"
};

// 共享密鑰：前端必須帶這個 token 才允許寫入
// ⚠️ 部署前請改成你自選的隨機字串（至少 16 字元，英數即可）
const SHARED_TOKEN = "PLEASE_CHANGE_THIS_TO_YOUR_OWN_TOKEN";

// 簡易 URL 格式檢查
function isValidUrl(u) {
  return /^https?:\/\/[^\s]+$/i.test(u);
}

// 防 Sheets Formula Injection：開頭是 = + - @ 的字串會被 Sheets 當公式
function sanitize(s) {
  if (s && /^[=+\-@]/.test(s)) return "'" + s;
  return s;
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const token = String(data.token || "");
    const category = String(data.category || "").trim();
    const url = String(data.url || "").trim();
    const title = String(data.title || "").trim().slice(0, 500);
    const note = String(data.note || "").trim().slice(0, 2000);

    if (token !== SHARED_TOKEN) {
      return _json({ ok: false, error: "未授權" });
    }
    if (!SHEET_MAP[category]) {
      return _json({ ok: false, error: "未知類別: " + category });
    }
    // 網址改為非必填：有填才驗證格式
    if (url && !isValidUrl(url)) {
      return _json({ ok: false, error: "網址格式不正確（需 http:// 或 https:// 開頭）" });
    }
    if (url.length > 2000) {
      return _json({ ok: false, error: "網址過長" });
    }
    if (!url && !title && !note) {
      return _json({ ok: false, error: "網址 / 標題 / 備註 至少填一個" });
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_MAP[category]);
    if (!sheet) {
      return _json({ ok: false, error: "找不到 sheet: " + category });
    }

    const today = Utilities.formatDate(
      new Date(), "Asia/Taipei", "yyyy-MM-dd"
    );
    // 欄位順序與 CSV 一致：日期 | 類別 | 標題 | 網址 | 備註 | 內文
    sheet.appendRow([
      today,
      category,
      sanitize(title),
      sanitize(url),
      sanitize(note),
      ""
    ]);

    return _json({ ok: true, category: category, url: url });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

// 給瀏覽器直接打 URL 測試用
function doGet() {
  return ContentService
    .createTextOutput("小知識庫 Web App 運作中")
    .setMimeType(ContentService.MimeType.TEXT);
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
