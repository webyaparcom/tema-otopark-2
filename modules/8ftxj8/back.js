/* ekip-vardiya-cizelgesi — Ekip Vardiya Çizelgesi — saat ekseninde mesai çubukları ve «şu an» çizgisi (16 Kas 2026 · mcp:webmaker/20261116-181132-t332 · D17).
   Üstte saat ekseni, her satırda kişi (küçük portre, ad, unvan) ve yatay bir zaman izinde vardiya çubukları (bölünmüş vardiya ve gece devri dahil). Yerel saat eksen içindeyse tüm izleri kesen «şu an» çizgisi ve saat etiketi çıkar, o an vardiyada olanın yanında nabız noktası yanar. Veri ek alanı: `vardiya` ("08:00-16:00" ya da dizi).
   Üretici: scripts/modul-fabrika (aile team) — elle düzenleme yerine tanımı değiştirip yeniden üret.
   Veri: data: [{ ad, unvan?, metin?, img?, bolum?, eposta?, telefon?, url?, social?: [{ ad, url, ikon? }] }] — unvan/metin/bolum dil sözlüğü, ad düz metin ya da sözlük; adsız üye atlanır. */
const P = "modulex-ekip-vardiya-cizelgesi";
const IMG_KOK = `/img/${json.id}/`;
/* --- ortak ön ek (scripts/modul-fabrika/on-ek.js) — dil · güvenlik · sayı yardımcıları --- */
const pick = (v) => {
  if (v == null) return "";
  if (typeof v !== "object") return String(v);
  if (typeof wmPickLang === "function") { try { return wmPickLang(v, json.lang) || ""; } catch (e) { /* alt satır */ } }
  return String(v[json.lang] ?? Object.values(v)[0] ?? "");
};
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const medyaUrl = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|file):/i.test(s)) return "";
  if (/^data:/i.test(s)) return /^data:(image|video|audio)\//i.test(s) ? s : "";
  if (s.startsWith("/") || /^https?:\/\//i.test(s)) return s;
  return `${IMG_KOK}${s}`;
};
const href = (v) => {
  const s = String(v ?? "").trim();
  if (!s || /^\s*(javascript|vbscript|data):/i.test(s)) return "";
  if (/^(https?:)?\/\//i.test(s) || /^(mailto:|tel:|#)/i.test(s)) return s;
  return wxLangInternalHref(s);
};
const dogru = (v, d) => (v === undefined || v === null || v === "") ? d : !(v === false || v === "false" || v === 0 || v === "0");
const ikonAd = (v) => String(v ?? "").trim().replace(/[^a-z0-9_]/gi, "");
const satirlar = (s) => esc(s).replace(/\r?\n/g, "<br />");
/* ilk dolu alan: yeni ad önce, eski kuşak şablonun adı yedek (G6 yalnız path değiştirerek takas eder) */
const ilk = (o, ks) => {
  for (const k of ks) {
    const v = o == null ? undefined : o[k];
    if (v == null || v === "") continue;
    if (typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length) continue;
    return v;
  }
  return "";
};
const metinAl = (o, ks) => pick(ilk(o, ks)).trim();
const { desing: des = {} } = json;
const setting = webmakerdata?.setting ?? {};
const veri = Array.isArray(json.data) ? json.data : [];
const dil = String(json.lang || "");
const sayiBicim = (v, ondalik) => {
  try { return new Intl.NumberFormat(dil || undefined, { minimumFractionDigits: ondalik, maximumFractionDigits: ondalik }).format(v); } catch (e) { return String(v); }
};
const ikonH = (ad, sinif) => (ad ? `<span class="${sinif} material-symbols-outlined" aria-hidden="true">${ad}</span>` : "");
const no = (i) => String(i + 1).padStart(2, "0");
const ctaHtml = () => {
  const a1 = metinAl(des, ["cta_ad", "button"]); const u1 = href(ilk(des, ["cta_url", "buttonurl", "url"]));
  const a2 = metinAl(des, ["cta2_ad"]); const u2 = href(ilk(des, ["cta2_url"]));
  const d = (a, u, ek) => (a && u ? `<a class="${P}-dugme${ek}" href="${esc(u)}">${esc(a)}<span class="material-symbols-outlined mx-flip" aria-hidden="true">arrow_forward</span></a>` : "");
  const ic = d(a1, u1, "") + d(a2, u2, ` ${P}-dugme--ikincil`);
  return ic ? `<div class="${P}-cta">${ic}</div>` : "";
};
const basHtml = (B, ek) => {
  if (!B.ust && !B.baslik && !B.metin && !ek) return "";
  return `<header class="${P}-bas">`
    + (B.ust ? `<p class="${P}-ust">${esc(B.ust)}</p>` : "")
    + (B.baslik ? `<h2 class="${P}-baslik" id="${P}-{{id}}-b">${esc(B.baslik)}</h2>` : "")
    + (B.metin ? `<p class="${P}-metin">${satirlar(B.metin)}</p>` : "")
    + (ek || "")
    + "</header>";
};
/* --- aile: team --- */
/* team-2 bölüm adları: desing.departments [{ id, name }] */
const BOLUM = {};
(Array.isArray(des.departments) ? des.departments : []).forEach((d) => { if (d && d.id != null) BOLUM[String(d.id)] = pick(d.name).trim(); });
const sosyalAl = (o) => (Array.isArray(o.social) ? o.social : Array.isArray(o.sosyal) ? o.sosyal : [])
  .map((s) => ({ ad: metinAl(s, ["ad", "name"]), url: href(ilk(s, ["url", "link"])), ikon: ikonAd(ilk(s, ["ikon", "icon"])) || "link" }))
  .filter((s) => s.ad && s.url && /^(https?:|mailto:|tel:)/i.test(s.url));
const kayitlar = veri.map((o) => {
  o = o && typeof o === "object" ? o : {};
  const bk = ilk(o, ["bolum", "dept"]);
  const bId = typeof bk === "object" ? pick(bk).trim() : String(bk || "").trim();
  const ep = String(ilk(o, ["eposta", "email"]) || "").trim();
  const tel = String(ilk(o, ["telefon", "phone", "tel"]) || "").trim();
  return {
    ad: metinAl(o, ["ad", "name", "baslik"]), unvan: metinAl(o, ["unvan", "role", "rol"]), metin: metinAl(o, ["metin", "bio", "text", "description"]),
    img: medyaUrl(ilk(o, ["img", "image", "foto"])), bolumId: bId, bolum: BOLUM[bId] || bId,
    eposta: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ep) ? ep : "", tel: /\d{3,}/.test(tel) ? tel : "", url: href(ilk(o, ["url", "link", "profil"])), sosyal: sosyalAl(o),
  };
}).filter((k) => k.ad);
const basHarf = (ad) => ad.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => [...p][0] || "").join("").toLocaleUpperCase(dil || undefined);
const fH = (k, s, w, h) => (k.img ? `<img class="${P}-${s || "foto"}" src="${esc(k.img)}" alt="" width="${w || 600}" height="${h || 750}" loading="lazy" decoding="async" />` : `<span class="${P}-${s || "foto"} ${P}-harf" aria-hidden="true">${esc(basHarf(k.ad))}</span>`);
const adH = (k, t, s) => `<${t || "h3"} class="${P}-${s || "ad"}">${k.url ? `<a class="${P}-bag" href="${esc(k.url)}">${esc(k.ad)}</a>` : esc(k.ad)}</${t || "h3"}>`;
const unH = (k, s) => (k.unvan ? `<p class="${P}-${s || "unvan"}">${esc(k.unvan)}</p>` : "");
const mH = (k, s) => (k.metin ? `<p class="${P}-${s || "bio"}">${satirlar(k.metin)}</p>` : "");
const bolH = (k, s) => (k.bolum ? `<p class="${P}-${s || "bolum"}">${esc(k.bolum)}</p>` : "");
/* iletişim + sosyal: yazili=false → yalnız ikon (aria-label «kanal — ad»), true → ikon + yazı */
const sH = (k, s, yazili) => {
  const L = [];
  if (k.eposta) L.push({ ad: k.eposta, url: `mailto:${k.eposta}`, ikon: "mail" });
  if (k.tel) L.push({ ad: k.tel, url: `tel:${k.tel.replace(/[^\d+]/g, "")}`, ikon: "call" });
  k.sosyal.forEach((x) => L.push(x));
  if (!L.length) return "";
  return `<ul class="${P}-${s || "sosyal"}">${L.map((x) => `<li><a class="${P}-slink" href="${esc(x.url)}"${/^https?:/i.test(x.url) ? ' target="_blank" rel="noopener noreferrer"' : ""}${yazili ? "" : ` aria-label="${esc(x.ad)} — ${esc(k.ad)}" title="${esc(x.ad)}"`}><span class="material-symbols-outlined" aria-hidden="true">${esc(x.ikon)}</span>${yazili ? `<span class="${P}-syazi">${esc(x.ad)}</span>` : ""}</a></li>`).join("")}</ul>`;
};
/* bölüme göre gruplar (sıra korunur) */
const gruplar = (A) => { const G = []; A.forEach((k) => { let g = G.find((x) => x.id === k.bolumId); if (!g) G.push((g = { id: k.bolumId, ad: k.bolum, uyeler: [] })); g.uyeler.push(k); }); return G; };
/* --- modül: ekip-vardiya-cizelgesi --- */
const kart = (k, i, n, A) => {
    const kisi = veri.filter((x) => x && typeof x === "object" && metinAl(x, ["ad", "name", "baslik"]));
    const vd = (x) => {
      const v = ilk(x, ["vardiya", "vardiyalar", "shift", "shifts"]);
      return (Array.isArray(v) ? v : v ? [v] : []).map((t) => {
        const m = /^\s*(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})\s*$/.exec(pick(t));
        if (!m) return null;
        const a = +m[1] * 60 + +m[2];
        let b = +m[3] * 60 + +m[4];
        if (b <= a) b += 1440;
        if (a >= 1440 || b - a > 1440) return null;
        return { a, b, t: `${m[1].padStart(2, "0")}:${m[2]}–${m[3].padStart(2, "0")}:${m[4]}` };
      }).filter(Boolean);
    };
    const T = kisi.flatMap(vd);
    const j = A ? A.indexOf(k) : i;
    const V = vd(kisi[j] || {});
    const durum = `<span class="${P}-durum" data-vd-durum data-vd-etiket="${esc(metinAl(des, ["mesaideEtiket"]))}"></span>`;
    const kimlik = `<div class="${P}-kisi">${fH(k, "foto", 96, 96)}<div class="${P}-kimlik">${adH(k)}${unH(k)}${V.length ? `<p class="${P}-saatler">${V.map((x) => `<bdi dir="ltr">${x.t}</bdi>`).join(" · ")}</p>` : ""}</div>${durum}</div>`;
    if (!T.length) return `<li class="${P}-satir">${kimlik}<div class="${P}-iz"><span class="${P}-yok" aria-hidden="true"></span></div></li>`;
    const a0 = Math.floor(Math.min(...T.map((x) => x.a)) / 60) * 60;
    const ham = Math.max(Math.ceil(Math.max(...T.map((x) => x.b)) / 60) * 60 - a0, 360);
    const adim = [1, 2, 3, 4, 6].find((x) => ham / 60 / x <= 8) || 6;
    const b0 = a0 + Math.ceil(ham / 60 / adim) * adim * 60;
    const yuz = (x) => (((x - a0) / (b0 - a0)) * 100).toFixed(2);
    return `<li class="${P}-satir" data-vd="${V.map((x) => `${x.a},${x.b}`).join(";")}">${kimlik}<div class="${P}-iz">${V.length ? V.map((x) => `<span class="${P}-cubuk" style="inset-inline-start: ${yuz(x.a)}%; inline-size: ${(((x.b - x.a) / (b0 - a0)) * 100).toFixed(2)}%"><bdi dir="ltr" aria-hidden="true">${x.t}</bdi></span>`).join("") : `<span class="${P}-yok" aria-hidden="true"></span>`}</div></li>`;
  };
const sar = (ic) => {
    const kisi = veri.filter((x) => x && typeof x === "object" && metinAl(x, ["ad", "name", "baslik"]));
    const T = [];
    kisi.forEach((x) => {
      const v = ilk(x, ["vardiya", "vardiyalar", "shift", "shifts"]);
      (Array.isArray(v) ? v : v ? [v] : []).forEach((t) => {
        const m = /^\s*(\d{1,2})[:.](\d{2})\s*[-–—]\s*(\d{1,2})[:.](\d{2})\s*$/.exec(pick(t));
        if (!m) return;
        const a = +m[1] * 60 + +m[2];
        let b = +m[3] * 60 + +m[4];
        if (b <= a) b += 1440;
        if (a < 1440 && b - a <= 1440) T.push({ a, b });
      });
    });
    if (!T.length) return `<ul class="${P}-cizelge">${ic}</ul>`;
    const a0 = Math.floor(Math.min(...T.map((x) => x.a)) / 60) * 60;
    const ham = Math.max(Math.ceil(Math.max(...T.map((x) => x.b)) / 60) * 60 - a0, 360);
    const adim = [1, 2, 3, 4, 6].find((x) => ham / 60 / x <= 8) || 6;
    const saat = Math.ceil(ham / 60 / adim) * adim;
    const b0 = a0 + saat * 60;
    const tik = [];
    for (let h = 0; h <= saat; h += adim) tik.push(`<span class="${P}-tik" style="inset-inline-start: ${((h / saat) * 100).toFixed(2)}%"><bdi dir="ltr">${String((a0 / 60 + h) % 24).padStart(2, "0")}:00</bdi></span>`);
    const on = metinAl(des, ["simdiEtiket"]);
    return `<div class="${P}-eksen" aria-hidden="true"><span class="${P}-eksenbos"></span><div class="${P}-tikler"><strong class="${P}-simdietk" data-vd-simdi data-vd-onek="${esc(on)}"></strong>${tik.join("")}</div></div><ul class="${P}-cizelge" data-vd-pencere="${a0},${b0}" style="--saat: ${saat}">${ic}</ul>`;
  };
const B = { ust: metinAl(des, ["ust","badge","kicker"]), baslik: metinAl(des, ["baslik","title"]), metin: metinAl(des, ["metin","description"]) };
/* veri yoksa gövde hiç kurulmaz (sarmalayıcı boş listeye dokunmaz) */
const BOS = !kayitlar.length;
const govde = BOS ? "" : sar(kayitlar.map((k, i) => kart(k, i, kayitlar.length, kayitlar)).join(""), kayitlar, B);
const bas = basHtml(B, "");
const sinif = (bas || B.ust || B.baslik || B.metin ? "" : ` ${P}--bassiz`);
html = html
  .replaceAll("{{fbsinif}}", () => sinif)
  .replaceAll("{{fbetiket}}", () => (B.baslik ? `aria-labelledby="${P}-{{id}}-b"` : ""))
  .replaceAll("{{fbbas}}", () => bas)
  .replaceAll("{{fbgovde}}", () => govde);
if (BOS) html = "";
