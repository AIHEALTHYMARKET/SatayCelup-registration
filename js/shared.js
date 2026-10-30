// 共用模組：所有頁面都從這裡取用
import {
  collection, getDocs
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

export const ADMIN_EMAIL = "diabolo.weien@gmail.com";

export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxc1v7q7D1LH6y2OpGus2tjZFe7UtmaxF9n3VV3-B0wmVmoyGUG-CYiD562UdY97Za9/exec";

export const PLATINUM_UIDS = {
  "Sense&Lavenier": "2rNB2dEMwYeDxMPHxJGMq9F7vHU2",
  "Amos": "ZzWLiS9wR7dOy4lwpW9E3PxmNiE2",
  "Sunny": "TZHOLfx55dRfomerJJL1ZaxdfMm1",
  "Robin&Zoey": "NV6OKbVKe7QSX06nKUUEGhoBae32",
  "RyanLio": "cqW7ZHpWsmdjsc1zJiAL9MhRlIA2",
  "Wyane&Momo": "Zn6rj5cQ84P6wiPr6QpvFhACXkV2",
  "Jess": "6iYJHVztThdgj4jpN3pdewzUDbE2",
  "Keong&Ngah": "Zgil7YpCJsdD4qT5oAmfI0vLBl53",
  "JayChew": "UALJAeujRXazWubxSTRsFo5OxwI3",
  "Lynn": "x7Kp4XNKcBV4MzHIG7DBdwnSYWV2",
  "SzeChew": "hY1QzYljziQsprfbFFowNteqmuH2"
};

// 自訂欄位的代碼不可以和這些系統欄位重複
export const RESERVED_KEYS = [
  "id", "uid", "email", "googleName", "eventId", "eventTitle",
  "platinum", "platinumUid", "createdAt", "status",
  "receiptName", "receiptType", "receiptSize",
  "receiptFileId", "receiptFileName", "receiptDriveUrl"
];

export const FIELD_TYPES = {
  text: "單行文字",
  textarea: "多行文字",
  tel: "電話",
  email: "Email",
  number: "數字",
  date: "日期",
  select: "下拉選單",
  radio: "單選按鈕"
};

// 常用欄位（代碼與舊資料相同，舊資料可直接相容）
export const PRESET_FIELDS = [
  { key: "chineseName", label: "中文姓名 / 匿名", type: "text", required: true },
  { key: "phone", label: "電話", type: "tel", required: true },
  { key: "englishName", label: "IC English Name", type: "text", required: true },
  { key: "icNumber", label: "IC Number", type: "text", required: true },
  { key: "shirtSize", label: "衣服尺寸", type: "select", required: true,
    options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] },
  { key: "shirtText", label: "衣服背面文字", type: "text", required: true },
  { key: "partnerGroup", label: "球伴組別", type: "select", required: true,
    options: ["指定搭檔", "自由組隊"] },
  { key: "partner", label: "球伴", type: "text", required: false }
];

export const LEGACY_EVENT = {
  id: "__legacy",
  title: "未分類舊資料",
  fields: PRESET_FIELDS,
  platinumEnabled: true
};

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function tsText(ts) {
  if (!ts) return "";
  try {
    if (typeof ts.toDate === "function") return ts.toDate().toLocaleString("zh-TW");
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString("zh-TW");
    return String(ts);
  } catch { return ""; }
}

export function newKey() {
  return "f_" + Math.random().toString(36).slice(2, 7);
}

export function normalizeEvent(id, d) {
  return {
    id,
    title: "", subtitle: "", intro: "", heroImage: "", video: "",
    photos: [], infoItems: [], fee: "", paymentText: "", paymentImage: "",
    receiptRequired: false, platinumEnabled: false, successMessage: "",
    status: "draft", order: 0, fields: [],
    ...d
  };
}

export async function loadEvents(db) {
  const snap = await getDocs(collection(db, "events"));
  const list = snap.docs.map(x => normalizeEvent(x.id, x.data()));
  list.sort((a, b) => (b.order || 0) - (a.order || 0));
  return list;
}

/* ---------- 欄位輸入元件 ---------- */

export function controlHtml(f, value = "", mode = "form") {
  const n = "k_" + f.key;
  const v = value ?? "";
  const req = mode === "form" && f.required ? "required" : "";
  const ph = esc(f.placeholder || "");
  const opts = f.options || [];

  if (f.type === "textarea") {
    return `<textarea name="${n}" ${req} placeholder="${ph}" rows="3">${esc(v)}</textarea>`;
  }
  if (f.type === "select" || (f.type === "radio" && mode === "cell")) {
    return `<select name="${n}" ${req}><option value="">${mode === "form" ? "請選擇" : "未填寫"}</option>` +
      opts.map(o => `<option value="${esc(o)}" ${String(v) === o ? "selected" : ""}>${esc(o)}</option>`).join("") +
      `</select>`;
  }
  if (f.type === "radio") {
    return `<div class="radio-group">` + opts.map((o, i) =>
      `<div class="radio-option"><input type="radio" name="${n}" id="${n}_${i}" value="${esc(o)}" ${String(v) === o ? "checked" : ""} ${i === 0 ? req : ""}><label for="${n}_${i}">${esc(o)}</label></div>`
    ).join("") + `</div>`;
  }
  const t = ["text", "tel", "email", "number", "date"].includes(f.type) ? f.type : "text";
  return `<input type="${t}" name="${n}" value="${esc(v)}" ${req} placeholder="${ph}">`;
}

export function readValues(root, fields) {
  const out = {};
  for (const f of fields) {
    const els = root.querySelectorAll(`[name="k_${f.key}"]`);
    if (!els.length) continue;
    if (f.type === "radio" && els[0].type === "radio") {
      const c = root.querySelector(`[name="k_${f.key}"]:checked`);
      out[f.key] = c ? c.value : "";
    } else {
      out[f.key] = String(els[0].value || "").trim();
    }
  }
  return out;
}

/* ---------- 統計：每個選單欄位的各選項人數 ---------- */

export function statsHtml(fields, records) {
  return fields
    .filter(f => f.type === "select" || f.type === "radio")
    .map(f => {
      const counts = {};
      (f.options || []).forEach(o => counts[o] = 0);
      records.forEach(r => {
        const v = r[f.key];
        if (v) counts[v] = (counts[v] || 0) + 1;
      });
      return `<div class="stat-group"><div class="stat-group-title">${esc(f.label)}</div>` +
        Object.entries(counts).map(([k, c]) =>
          `<span class="chip">${esc(k)}：<b>${c}</b></span>`).join("") +
        `</div>`;
    }).join("");
}

/* ---------- 影片嵌入（YouTube / Instagram / Facebook） ---------- */

export function videoHtml(url) {
  url = String(url || "").trim();
  if (!url) return "";
  const ig = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (ig) {
    return `<div class="vwrap tall"><iframe src="https://www.instagram.com/reel/${ig[1]}/embed" scrolling="no" allowfullscreen></iframe></div>
      <p class="vlink"><a href="${esc(url)}" target="_blank" rel="noopener">▶️ 無法播放？點此在 Instagram 觀看</a></p>`;
  }
  if (/facebook\.com|fb\.watch/i.test(url)) {
    const src = "https://www.facebook.com/plugins/video.php?height=640&href=" +
      encodeURIComponent(url) + "&show_text=false&width=360&t=0";
    return `<div class="vwrap tall fb"><iframe src="${src}" scrolling="no" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe></div>
      <p class="vlink"><a href="${esc(url)}" target="_blank" rel="noopener">▶️ 無法播放？點此在 Facebook 觀看</a></p>`;
  }
  let yt = "";
  try {
    const u = new URL(url);
    if (u.pathname.startsWith("/shorts/")) yt = u.pathname.split("/shorts/")[1].split("/")[0];
    else if (u.hostname.includes("youtube.com")) yt = u.searchParams.get("v") || "";
    else if (u.hostname.includes("youtu.be")) yt = u.pathname.replace("/", "").split("?")[0];
  } catch {}
  if (yt) {
    return `<div class="vwrap"><iframe src="https://www.youtube.com/embed/${esc(yt)}" allowfullscreen></iframe></div>`;
  }
  return `<p class="vlink"><a href="${esc(url)}" target="_blank" rel="noopener">▶️ 點此觀看影片</a></p>`;
}

/* ---------- 收據上傳（Google Apps Script → Google Drive） ---------- */

export function safeFileName(name) {
  return String(name).replace(/[\\/:*?"<>|#%{}]/g, "_").replace(/\s+/g, "_").slice(0, 80);
}

export async function uploadReceipt(file, nameHint) {
  if (!file) throw new Error("請選擇收據照片");
  if (file.size > 5 * 1024 * 1024) throw new Error("收據照片不能超過 5MB");
  if (file.type !== "image/jpeg" && file.type !== "image/jpg" && !/\.jpe?g$/i.test(file.name)) {
    throw new Error("只允許 JPG / JPEG 格式");
  }

  const base64 = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result;
      if (typeof s !== "string" || !s.includes(",")) return reject(new Error("無法解析收據圖片。"));
      resolve(s.substring(s.indexOf(",") + 1));
    };
    r.onerror = () => reject(new Error("無法讀取收據照片。"));
    r.readAsDataURL(file);
  });

  const token = "upload_" + Date.now() + "_" + Math.random().toString(36).slice(2);
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.name = "receipt_upload_" + token;
  document.body.appendChild(iframe);

  const form = document.createElement("form");
  form.method = "POST";
  form.action = APPS_SCRIPT_URL;
  form.target = iframe.name;
  form.style.display = "none";
  const add = (n, v) => {
    const i = document.createElement("input");
    i.type = "hidden"; i.name = n; i.value = String(v ?? "");
    form.appendChild(i);
  };
  add("type", "registration");
  add("fileName", safeFileName(nameHint + "_" + Date.now() + ".jpg"));
  add("mimeType", "image/jpeg");
  add("base64", base64);
  add("token", token);
  document.body.appendChild(form);

  return await new Promise((resolve, reject) => {
    let done = false, timer = null;
    const cleanup = () => {
      window.removeEventListener("message", handler);
      if (timer) clearTimeout(timer);
      try { form.remove(); } catch {}
      try { iframe.remove(); } catch {}
    };
    const finish = (fn, v) => { if (done) return; done = true; cleanup(); fn(v); };

    function handler(event) {
      let data = event.data;
      if (typeof data === "string") { try { data = JSON.parse(data); } catch { return; } }
      if (!data || data.source !== "sataycelup-receipt-upload") return;
      const result = data.result || data;
      if (result.token && result.token !== token) return;
      if (result.success === false) return finish(reject, new Error(result.error || "Google Drive 上傳失敗。"));
      if (result.fileId || result.fileName || result.driveUrl) finish(resolve, { ...result, success: true });
    }

    window.addEventListener("message", handler);
    try { form.submit(); } catch (e) { return finish(reject, e); }
    timer = setTimeout(() => finish(reject, new Error("Google Drive 上傳逾時（90 秒），請稍後再試。")), 90000);
  });
}
