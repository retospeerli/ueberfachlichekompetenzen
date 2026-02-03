/* Überfachliche Kompetenzen – robust + professioneller Text
   - PDF Export fix: wartet auf Libraries, besseres Error-Logging, stabiler DOM-Klon
   - PDF Tabelle: sehr gut links → ... → nicht genügend rechts, gefüllte Punkte
   - Text: Arbeitszeugnis-Stil, Absätze, ohne Titelzitieren
*/

const DEFAULT_PLACE = "Wädenswil";

// UI-Order (farblogisch) und PDF-Order (gewünschte Reihenfolge)
const LEVEL_UI = ["vv","g","ge","u"];          // ++, +, -, --
const LEVEL_PDF = ["vv","g","ge","u"];         // sehr gut → ... → nicht genügend
const LEVEL_LABEL = { vv:"++", g:"+", ge:"-", u:"--" };
const LEVEL_TEXT  = { vv:"sehr gut", g:"gut", ge:"genügend", u:"nicht genügend" };

// ===== Rasterdaten (wie in deiner bisherigen Version) =====
const DATA = [
  {
    group: "Arbeits- und Lernverhalten",
    items: [
      {
        id: "puenktlich",
        title: "Erscheint pünktlich und ordnungsgemäss zum Unterricht",
        levels: {
          vv: { color: "blue",  points: [
            "Sitzt bei Beginn der Stunde am Platz",
            "Ist ruhig bei Beginn der Stunde",
            "Bringt Material und HA immer vollständig"
          ]},
          g:  { color: "green", points: [
            "Sitzt bei Beginn der Stunde am Platz",
            "Bringt Material und HA vollständig"
          ]},
          ge: { color: "orange",points: [
            "Ist bei Beginn der Stunde im Zimmer, aber noch nicht am Platz",
            "Bringt Material und HA teilweise vollständig"
          ]},
          u:  { color: "red",   points: [
            "Kommt nach dem Läuten ins Zimmer",
            "Bringt Material und HA regelmässig unvollständig"
          ]}
        }
      },
      {
        id: "aktiv",
        title: "Beteiligt sich aktiv am Unterricht",
        levels: {
          vv: { color: "blue", points: [
            "Stellt Fragen",
            "Sucht Lösungen",
            "Sucht Wege",
            "Zeigt grosse Eigeninitiative"
          ]},
          g:  { color: "green",points: [
            "Stellt Fragen",
            "Zeigt Eigeninitiative"
          ]},
          ge: { color: "orange",points: [
            "Stellt selten Fragen",
            "Zeigt wenig Eigeninitiative"
          ]},
          u:  { color: "red", points: [
            "Stellt keine Fragen",
            "Zeigt keine Eigeninitiative"
          ]}
        }
      },
      {
        id: "konzentriert",
        title: "Arbeitet konzentriert und ausdauernd",
        levels: {
          vv: { color: "blue", points: [
            "Arbeitet konzentriert",
            "Arbeitet ausdauernd",
            "Beendet eigenständig die Arbeit"
          ]},
          g:  { color: "green",points: [
            "Arbeitet meistens konzentriert",
            "Arbeitet meistens ausdauernd",
            "Beendet die Arbeit"
          ]},
          ge: { color: "orange",points: [
            "Arbeitet teilweise konzentriert",
            "Lässt sich ablenken",
            "Beendet die Arbeit teilweise"
          ]},
          u:  { color: "red", points: [
            "Lässt sich bei der Arbeit ablenken",
            "Beendet die Arbeit selten"
          ]}
        }
      },
      {
        id: "sorgfalt",
        title: "Gestaltet Arbeiten sorgfältig und zuverlässig",
        levels: {
          vv: { color: "blue", points: [
            "Arbeitet mündlich und schriftlich sorgfältig, zuverlässig und selbständig",
            "Geht mit dem Material immer korrekt um"
          ]},
          g:  { color: "green",points: [
            "Arbeitet mündlich und schriftlich oft sorgfältig, zuverlässig und selbständig",
            "Geht mit dem Material korrekt um"
          ]},
          ge: { color: "orange",points: [
            "Arbeitet mündlich und schriftlich teilweise unsorgfältig, unzuverlässig und selten selbständig",
            "Geht mit dem Material teilweise korrekt um"
          ]},
          u:  { color: "red", points: [
            "Arbeitet mündlich und schriftlich unsorgfältig, unzuverlässig und selten selbständig",
            "Geht mit dem Material nicht korrekt um"
          ]}
        }
      },
      {
        id: "zusammenarbeit",
        title: "Kann mit anderen zusammenarbeiten",
        levels: {
          vv: { color: "blue", points: [
            "Arbeitet mit allen zusammen",
            "Hilft anderen",
            "Übernimmt Verantwortung"
          ]},
          g:  { color: "green",points: [
            "Arbeitet mit anderen zusammen",
            "Hilft anderen"
          ]},
          ge: { color: "orange",points: [
            "Hat Schwierigkeiten, mit Andern zusammenzuarbeiten",
            "Hilft anderen nur mit Aufforderung der LP."
          ]},
          u:  { color: "red", points: [
            "Stört die Zusammenarbeit in der Gruppe",
            "Hilft anderen nur wenn es sein muss"
          ]}
        }
      },
      {
        id: "selbsteinschaetzung",
        title: "Schätzt die eigene Leistungsfähigkeit realistisch ein",
        levels: {
          vv: { color: "blue", points: [
            "Kennt seine Stärken sehr gut",
            "Kennt seine Schwächen sehr gut",
            "Setzt sich Ziele, die erfüllt werden können und herausfordern"
          ]},
          g:  { color: "green",points: [
            "Kennt seine Stärken",
            "Kennt seine Schwächen",
            "Setzt sich selbst realistische Ziele"
          ]},
          ge: { color: "orange",points: [
            "Kennt seine Stärken teilweise",
            "Kennt seine Schwächen teilweise",
            "Braucht Hilfe, um realistische Ziele zu setzen"
          ]},
          u:  { color: "red", points: [
            "Kennt seine Stärken nicht",
            "Kennt seine Schwächen nicht",
            "Kann sich kaum realistische Ziele setzen"
          ]}
        }
      }
    ]
  },
  {
    group: "Sozialverhalten",
    items: [
      {
        id: "regeln",
        title: "Akzeptiert die Regeln des schulischen Zusammenlebens",
        levels: {
          vv: { color: "blue", points: [
            "Hält Regeln ein",
            "Führt Ämtli selbständig aus"
          ]},
          g:  { color: "green",points: [
            "Hält Regeln ein",
            "Führt Ämtli aus"
          ]},
          ge: { color: "orange",points: [
            "Hält Regeln nach Aufforderung ein",
            "Führt sein Ämtli bei Aufforderung aus"
          ]},
          u:  { color: "red", points: [
            "Hält Regeln nicht ein",
            "Führt sein Ämtli mit Hilfe aus"
          ]}
        }
      },
      {
        id: "respekt",
        title: "Begegnet den Lehrpersonen und Mitschülern respektvoll",
        levels: {
          vv: { color: "blue", points: [
            "Begegnet seiner LP äusserst respektvoll",
            "Begegnet seinen Mitschülern respektvoll"
          ]},
          g:  { color: "green",points: [
            "Begegnet seiner LP grundsätzlich respektvoll",
            "Begegnet seinen Mitschülern grundsätzlich respektvoll"
          ]},
          ge: { color: "orange",points: [
            "Begegnet seiner LP teilweise respektvoll",
            "Begegnet seinen Mitschülern teilweise respektvoll"
          ]},
          u:  { color: "red", points: [
            "Begegnet seiner LP selten respektvoll",
            "Begegnet seinen Mitschülern selten respektvoll"
          ]}
        }
      }
    ]
  }
];

// ===== Helpers =====
const el = (id) => document.getElementById(id);

function toISODate(d){
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function formatDateCH(iso){
  if(!iso) return "";
  const [y,m,d] = iso.split("-");
  return `${d}.${m}.${y}`;
}
function pronouns(g){
  return (g === "w")
    ? { subj:"sie", obj:"sie", poss:"ihr", dat:"ihr" }
    : { subj:"er", obj:"ihn", poss:"sein", dat:"ihm" };
}
function mod(w){ return `<span class="mod">${w}</span>`; }
function joined(arr){
  const a = arr.filter(Boolean);
  if(a.length === 0) return "";
  if(a.length === 1) return a[0];
  if(a.length === 2) return `${a[0]} und ${a[1]}`;
  return `${a.slice(0,-1).join(", ")} und ${a[a.length-1]}`;
}

function weich(level){
  if(level === "vv") return mod("durchwegs");
  if(level === "g")  return mod("meist");
  if(level === "ge") return mod("manchmal");
  return mod("selten");
}
function qual(level){
  if(level === "vv") return mod("sehr sicher");
  if(level === "g")  return mod("sicher");
  if(level === "ge") return mod("noch nicht durchgehend sicher");
  return mod("mit deutlicher Unterstützung");
}

// ===== State (nur RAM) =====
const state = {
  checks: {},   // checks[itemId][levelKey][idx] = true/false
  overall: {},  // overall[itemId] = "auto" | "vv" | "g" | "ge" | "u"
};
function ensureItemState(item){
  if(!state.checks[item.id]) state.checks[item.id] = {};
  for(const lk of LEVEL_UI){
    if(!state.checks[item.id][lk]) state.checks[item.id][lk] = {};
  }
  if(!state.overall[item.id]) state.overall[item.id] = "auto";
}

// ===== Raster UI =====
function buildRaster(){
  const root = el("rasterRoot");
  root.innerHTML = "";

  DATA.forEach(group => {
    const wrap = document.createElement("div");
    wrap.className = "group";

    const head = document.createElement("div");
    head.className = "group__title";
    head.innerHTML = `<div>${group.group}</div><div class="muted">${group.items.length} Kriterien</div>`;
    wrap.appendChild(head);

    group.items.forEach(item => {
      ensureItemState(item);

      const block = document.createElement("div");
      block.className = "detailItem";

      const top = document.createElement("div");
      top.className = "detailTop";
      top.innerHTML = `
        <div class="detailTitle">${item.title}</div>
        <div class="overall">
          <span class="overall__label">Gesamtstufe:</span>
          <select data-overall="${item.id}" class="overall__select">
            <option value="auto">Auto</option>
            <option value="vv">++</option>
            <option value="g">+</option>
            <option value="ge">-</option>
            <option value="u">--</option>
          </select>
        </div>
      `;
      block.appendChild(top);

      const grid = document.createElement("div");
      grid.className = "levelGrid";

      LEVEL_UI.forEach(lk => {
        const col = document.createElement("div");
        col.className = `levelCol levelCol--${item.levels[lk].color}`;

        const cap = document.createElement("div");
        cap.className = "levelCap";
        cap.innerHTML = `
          <div class="levelCap__short">${LEVEL_LABEL[lk]}</div>
          <div class="levelCap__long">${LEVEL_TEXT[lk]}</div>
        `;
        col.appendChild(cap);

        const list = document.createElement("div");
        list.className = "pointList";

        item.levels[lk].points.forEach((p, idx) => {
          const checked = !!state.checks[item.id][lk][idx];
          const lab = document.createElement("label");
          lab.className = "point";
          lab.innerHTML = `
            <input type="checkbox" ${checked ? "checked":""}
              data-item="${item.id}" data-level="${lk}" data-idx="${idx}">
            <span>${p}</span>
          `;
          list.appendChild(lab);
        });

        col.appendChild(list);
        grid.appendChild(col);
      });

      block.appendChild(grid);
      wrap.appendChild(block);
    });

    root.appendChild(wrap);
  });

  // Checkbox events
  root.querySelectorAll('input[type="checkbox"][data-item]').forEach(cb => {
    cb.addEventListener("change", (e) => {
      const itemId = e.target.dataset.item;
      const lk = e.target.dataset.level;
      const idx = Number(e.target.dataset.idx);
      if(!state.checks[itemId]) state.checks[itemId] = {};
      if(!state.checks[itemId][lk]) state.checks[itemId][lk] = {};
      state.checks[itemId][lk][idx] = e.target.checked;
      if(!editorTouched) generateText();
    });
  });

  // Overall override
  root.querySelectorAll('select[data-overall]').forEach(sel => {
    sel.value = state.overall[sel.dataset.overall] || "auto";
    sel.addEventListener("change", (e) => {
      state.overall[e.target.dataset.overall] = e.target.value;
      if(!editorTouched) generateText();
    });
  });
}

// ===== Auto-Gesamtstufe =====
function computeOverallLevel(item){
  const forced = state.overall[item.id];
  if(forced && forced !== "auto") return forced;

  const counts = {};
  for(const lk of LEVEL_UI){
    const m = state.checks[item.id][lk] || {};
    counts[lk] = Object.values(m).filter(Boolean).length;
  }

  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  if(total === 0) return "g";

  const sorted = LEVEL_UI
    .map(lk => ({lk, c: counts[lk]}))
    .sort((a,b) => b.c - a.c);

  const top = sorted[0];
  const tie = sorted.filter(x => x.c === top.c);
  if(tie.length > 1){
    const pref = ["g","vv","ge","u"]; // praxisnah
    for(const p of pref){
      if(tie.some(t => t.lk === p)) return p;
    }
  }
  return top.lk;
}

function currentSelections(){
  const out = {};
  DATA.forEach(g => g.items.forEach(item => {
    ensureItemState(item);
    out[item.id] = computeOverallLevel(item);
  }));
  return out;
}

function collectSelectedPoints(item){
  const selected = [];
  for(const lk of LEVEL_UI){
    const pts = item.levels[lk].points;
    const map = state.checks[item.id][lk] || {};
    pts.forEach((p, idx) => { if(map[idx]) selected.push(p); });
  }
  return selected;
}

// ===== Professioneller Text (Absätze, kein Titelzitieren) =====
function buildProfessionalText(ctx, levelsById){
  const { name, P } = ctx;

  // Helper: hole Item + Level
  const itemById = {};
  DATA.forEach(g => g.items.forEach(it => itemById[it.id] = it));

  // Kurzfunktionen
  const lvl = (id) => levelsById[id] || "g";
  const pts = (id) => collectSelectedPoints(itemById[id]);

  // Bausteine pro Dimension (ohne “im Bereich …”)
  function punctuality(){
    const L = lvl("puenktlich");
    const list = pts("puenktlich");
    const hasLate = list.some(x => x.toLowerCase().includes("nach dem läuten"));
    const hasHA = list.some(x => x.toLowerCase().includes("ha"));

    if(hasLate){
      return `${name} erscheint ${weich(L)} nicht immer pünktlich und ist zu Unterrichtsbeginn ${qual(L)} startbereit.`;
    }
    let s = `${name} ist zu Unterrichtsbeginn ${weich(L)} startbereit und erscheint ${qual(L)} im schulischen Alltag.`;
    if(hasHA) s += ` Material und Hausaufgaben sind ${weich(L)} vollständig vorhanden.`;
    return s;
  }

  function participation(){
    const L = lvl("aktiv");
    const list = pts("aktiv");
    const hasQ = list.some(x => x.toLowerCase().includes("fragen"));
    const hasInit = list.some(x => x.toLowerCase().includes("eigeninitiative"));
    let s = `${name} beteiligt sich ${weich(L)} aktiv am Unterricht.`;
    if(hasQ) s += ` ${P.subj.charAt(0).toUpperCase()+P.subj.slice(1)} stellt ${weich(L)} Fragen und bringt eigene Gedanken ein.`;
    if(hasInit) s += ` Eigeninitiative zeigt ${P.subj} ${weich(L)}.`;
    return s;
  }

  function focus(){
    const L = lvl("konzentriert");
    const list = pts("konzentriert");
    const hasDistract = list.some(x => x.toLowerCase().includes("ablenk"));
    let s = `${name} arbeitet ${weich(L)} konzentriert und bleibt ${qual(L)} an Aufgaben dran.`;
    if(hasDistract) s += ` In längeren Arbeitsphasen lässt sich ${P.subj} ${weich(L)} ablenken.`;
    s += ` Aufgaben werden ${weich(L)} abgeschlossen.`;
    return s;
  }

  function care(){
    const L = lvl("sorgfalt");
    const list = pts("sorgfalt");
    const matOk = list.some(x => x.toLowerCase().includes("material") && x.toLowerCase().includes("korrekt"));
    let s = `${name} erledigt Arbeiten ${weich(L)} sorgfältig und ${qual(L)} zuverlässig.`;
    if(matOk) s += ` Der Umgang mit Material gelingt ${P.subj} ${weich(L)} korrekt.`;
    return s;
  }

  function cooperation(){
    const L = lvl("zusammenarbeit");
    const list = pts("zusammenarbeit");
    const help = list.some(x => x.toLowerCase().includes("hilft"));
    const resp = list.some(x => x.toLowerCase().includes("verantwortung"));
    let s = `${name} kann ${weich(L)} konstruktiv mit anderen zusammenarbeiten.`;
    if(help) s += ` ${P.subj.charAt(0).toUpperCase()+P.subj.slice(1)} unterstützt Mitschülerinnen und Mitschüler ${weich(L)}.`;
    if(resp) s += ` Verantwortung übernimmt ${P.subj} ${weich(L)}.`;
    return s;
  }

  function selfReflection(){
    const L = lvl("selbsteinschaetzung");
    const list = pts("selbsteinschaetzung");
    const strengths = list.some(x => x.toLowerCase().includes("stärken"));
    const weaknesses = list.some(x => x.toLowerCase().includes("schwächen"));
    const goals = list.some(x => x.toLowerCase().includes("ziele"));
    let s = `${name} schätzt die eigene Leistungsfähigkeit ${weich(L)} realistisch ein.`;
    if(strengths || weaknesses){
      s += ` ${P.subj.charAt(0).toUpperCase()+P.subj.slice(1)} kann Stärken und Entwicklungspunkte ${weich(L)} benennen.`;
    }
    if(goals){
      s += ` Ziele setzt sich ${P.subj} ${weich(L)} passend und erreichbar.`;
    }
    return s;
  }

  function rules(){
    const L = lvl("regeln");
    const list = pts("regeln");
    const chores = list.some(x => x.toLowerCase().includes("ämt"));
    let s = `${name} hält Regeln des schulischen Zusammenlebens ${weich(L)} ein.`;
    if(chores) s += ` Aufgaben und Ämtli erledigt ${P.subj} ${weich(L)} zuverlässig.`;
    return s;
  }

  function respect(){
    const L = lvl("respekt");
    const list = pts("respekt");
    const lp = list.some(x => x.toLowerCase().includes("lp"));
    const ms = list.some(x => x.toLowerCase().includes("mitschüler"));
    let s = `${name} begegnet anderen ${weich(L)} respektvoll.`;
    if(lp) s += ` Gegenüber der Lehrperson zeigt ${P.subj} ${weich(L)} einen angemessenen Umgang.`;
    if(ms) s += ` Im Kontakt mit Mitschülerinnen und Mitschülern verhält sich ${P.subj} ${weich(L)} fair und kooperativ.`;
    return s;
  }

  // Absätze
  const p1 = `${punctuality()} ${participation()} ${focus()} ${care()}`;
  const p2 = `${cooperation()} ${rules()} ${respect()}`;
  const p3 = `${selfReflection()}`;

  // Intro nur kurz
  const intro = `${name} zeigt in den überfachlichen Kompetenzen insgesamt ein ${mod("stimmiges")} Bild.`;

  return `${intro}\n\n${p1}\n\n${p2}\n\n${p3}`;
}

// ===== Editor =====
let editorTouched = false;
function setEditorHTML(html){ el("reportEditor").innerHTML = html; }
function getEditorPlainText(){
  const tmp = document.createElement("div");
  tmp.innerHTML = el("reportEditor").innerHTML;
  return (tmp.innerText || "").trim();
}

function generateText(){
  const name = el("studentName").value.trim() || "Das Kind";
  const P = pronouns(el("gender").value);
  const levels = currentSelections();
  const text = buildProfessionalText({ name, P }, levels);

  // In HTML übernehmen, Zeilenumbrüche als <br>
  const html = text.split("\n").map(line => line === "" ? "<br>" : line).join("<br>");
  setEditorHTML(html);
}

// ===== Defaults / Buttons =====
function fillDefaults(){
  el("place").value = DEFAULT_PLACE;
  el("date").value = toISODate(new Date());
}
function resetStandard(){
  DATA.forEach(g => g.items.forEach(item => {
    ensureItemState(item);
    state.overall[item.id] = "auto";
    for(const lk of LEVEL_UI){
      state.checks[item.id][lk] = {};
    }
  }));
  editorTouched = false;
  buildRaster();
  generateText();
}
function regenerateOverwrite(){
  editorTouched = false;
  generateText();
}
async function copyPlain(){
  await navigator.clipboard.writeText(getEditorPlainText());
}

// ===== PDF Tabellen =====
function buildPrintTables(selections){
  // Header: sehr gut → gut → genügend → nicht genügend
  const headerRight = `
    <div class="zHeaderRight">
      <div class="rot">${LEVEL_TEXT["vv"]}</div>
      <div class="rot">${LEVEL_TEXT["g"]}</div>
      <div class="rot">${LEVEL_TEXT["ge"]}</div>
      <div class="rot">${LEVEL_TEXT["u"]}</div>
    </div>
  `;

  function rowHTML(item){
    const chosen = selections[item.id] || "g";
    const rightMarks = LEVEL_PDF.map(lk => {
      const on = (lk === chosen) ? "mark mark--on" : "mark";
      return `<div class="${on}"></div>`;
    }).join("");
    return `
      <div class="zRowLeft">${item.title}</div>
      <div class="zRowRight">${rightMarks}</div>
    `;
  }

  function makeTable(group){
    const top = `<div></div>${headerRight}`;
    const rows = group.items.map(rowHTML).join("");
    return top + rows;
  }

  el("printTableArbeits").innerHTML = makeTable(DATA[0]);
  el("printTableSozial").innerHTML  = makeTable(DATA[1]);
}

// ===== Print füllen =====
function buildPrint(){
  const studentName = el("studentName").value.trim() || "—";
  const className = el("className").value.trim() || "—";
  const teacherName = el("teacherName").value.trim() || "—";
  const place = el("place").value.trim() || "—";
  const dateCH = formatDateCH(el("date").value) || "—";

  el("printHead").textContent =
    `Name: ${studentName} · Klasse: ${className} · Ort/Datum: ${place}, ${dateCH} · Lehrperson: ${teacherName}`;

  el("sigTeacherCap").textContent =
    (teacherName && teacherName !== "—") ? `Lehrperson: ${teacherName}` : "Lehrperson";

  const selections = currentSelections();
  buildPrintTables(selections);

  // PDF: Plaintext (schwarz)
  el("printText").textContent = getEditorPlainText();

  const remarks = (el("teacherRemarks").value || "").trim();
  if(remarks){
    el("printTeacherRemarks").innerHTML = "";
    const p = document.createElement("div");
    p.style.whiteSpace = "pre-wrap";
    p.style.marginBottom = "3mm";
    p.textContent = remarks;
    el("printTeacherRemarks").appendChild(p);
    el("printTeacherRemarks").insertAdjacentHTML("beforeend", `<div class="line"></div><div class="line"></div>`);
  } else {
    el("printTeacherRemarks").innerHTML = `<div class="line"></div><div class="line"></div><div class="line"></div>`;
  }
}

// ===== PDF Export FIX (robust) =====
function getJsPDF(){
  // html2pdf.bundle kann jsPDF unter window.jspdf.jsPDF bereitstellen
  if(window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  if(window.jsPDF) return window.jsPDF;
  return null;
}

async function waitForLibs(timeoutMs = 2500){
  const start = performance.now();
  while(performance.now() - start < timeoutMs){
    if(window.html2canvas && getJsPDF()) return true;
    await new Promise(r => setTimeout(r, 50));
  }
  return false;
}

async function exportPDF(){
  buildPrint();

  // Libraries prüfen (häufige Ursache für deinen Screenshot-Fehler)
  const ok = await waitForLibs();
  if(!ok){
    alert("PDF-Fehler: html2canvas/jsPDF nicht geladen. Prüfe Internet/Adblocker/CSP.");
    return;
  }

  const sourcePage = document.querySelector("#printArea .printPage");
  if(!sourcePage){
    alert("PDF-Fehler: Druckbereich nicht gefunden.");
    return;
  }

  // Clone in sichtbaren DOM setzen (stabil)
  const clone = sourcePage.cloneNode(true);

  const staging = document.createElement("div");
  staging.id = "pdf-staging";
  staging.style.position = "fixed";
  staging.style.left = "0";
  staging.style.top = "0";
  staging.style.zIndex = "999999";
  staging.style.background = "#fff";
  staging.style.pointerEvents = "none";
  staging.style.opacity = "1";
  staging.style.visibility = "visible";

  // Breite in px (robuster als mm bei manchen Browsern)
  const rect = sourcePage.getBoundingClientRect();
  staging.style.width = `${Math.ceil(rect.width)}px`;

  staging.appendChild(clone);
  document.body.appendChild(staging);

  // Layout + Fonts abwarten
  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 120));
  if(document.fonts && document.fonts.ready){
    try{ await Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 800))]); } catch {}
  }

  try{
    const canvas = await window.html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false
    });

    const jsPDF = getJsPDF();
    if(!jsPDF) throw new Error("jsPDF nicht verfügbar (getJsPDF).");

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const pdf = new jsPDF("p", "mm", "a4");

    const pageW = 210, pageH = 297;
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let y = 0;
    let remaining = imgH;

    pdf.addImage(imgData, "JPEG", 0, 0, imgW, imgH);
    remaining -= pageH;
    y -= pageH;

    while(remaining > 0){
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, y, imgW, imgH);
      remaining -= pageH;
      y -= pageH;
    }

    const filename =
      `Ueberfachliche_Kompetenzen_${(el("studentName").value || "Kind").trim().replaceAll(" ", "_")}.pdf`;

    pdf.save(filename);

  } catch(err){
    console.error("PDF-Export-Fehler:", err);
    alert(`PDF-Fehler: ${err?.message ? err.message : String(err)}\n\nTipp: Konsole (F12) öffnen → Fehler unter 'Console' anschauen.`);
  } finally {
    const s = document.getElementById("pdf-staging");
    if(s) document.body.removeChild(s);
  }
}

// ===== Diktat =====
function makeDictationEditable(buttonEl, targetEl){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){
    buttonEl.disabled = true;
    buttonEl.title = "Diktierfunktion wird von diesem Browser nicht unterstützt.";
    return;
  }
  const rec = new SR();
  rec.lang = "de-CH";
  rec.interimResults = false;
  rec.continuous = true;

  let running = false;

  function insertText(text){
    targetEl.focus();
    const sel = window.getSelection();
    if(!sel || sel.rangeCount === 0){
      targetEl.insertAdjacentText("beforeend", text);
      return;
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  rec.onresult = (event) => {
    let out = "";
    for(let i = event.resultIndex; i < event.results.length; i++){
      if(event.results[i].isFinal) out += event.results[i][0].transcript;
    }
    if(out && out.trim()){
      insertText(out.trim() + " ");
      editorTouched = true;
    }
  };

  function start(){
    if(running) return;
    running = true;
    buttonEl.textContent = "⏹️ Stopp";
    rec.start();
  }
  function stop(){
    if(!running) return;
    running = false;
    buttonEl.textContent = "🎤 Diktat";
    rec.stop();
  }

  buttonEl.addEventListener("click", () => running ? stop() : start());
}

function makeDictationTextarea(buttonEl, textarea){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){
    buttonEl.disabled = true;
    buttonEl.title = "Diktierfunktion wird von diesem Browser nicht unterstützt.";
    return;
  }
  const rec = new SR();
  rec.lang = "de-CH";
  rec.interimResults = false;
  rec.continuous = true;

  let running = false;

  function insertAtCursor(text){
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    textarea.value = textarea.value.slice(0,start) + text + textarea.value.slice(end);
    const pos = start + text.length;
    textarea.setSelectionRange(pos,pos);
    textarea.focus();
  }

  rec.onresult = (event) => {
    let out = "";
    for(let i = event.resultIndex; i < event.results.length; i++){
      if(event.results[i].isFinal) out += event.results[i][0].transcript;
    }
    if(out && out.trim()) insertAtCursor(out.trim() + " ");
  };

  function start(){
    if(running) return;
    running = true;
    buttonEl.textContent = "⏹️ Stopp";
    rec.start();
  }
  function stop(){
    if(!running) return;
    running = false;
    buttonEl.textContent = "🎤 Diktat";
    rec.stop();
  }

  buttonEl.addEventListener("click", () => running ? stop() : start());
}

// ===== Init =====
buildRaster();
fillDefaults();
generateText();

el("btnReset").addEventListener("click", resetStandard);
el("btnRegen").addEventListener("click", regenerateOverwrite);
el("btnPdf").addEventListener("click", exportPDF);
el("btnCopy").addEventListener("click", copyPlain);

el("reportEditor").addEventListener("input", () => { editorTouched = true; });

// Auto-Text: Name/Geschlecht beeinflusst Formulierungen
["studentName","gender"].forEach(id => {
  el(id).addEventListener("input", () => { if(!editorTouched) generateText(); });
});
el("gender").addEventListener("change", () => { if(!editorTouched) generateText(); });

makeDictationEditable(el("btnDictateText"), el("reportEditor"));
makeDictationTextarea(el("btnDictateRemarks"), el("teacherRemarks"));
