/* app.js — alles integriert:
   - Helles UI, dunkle Schrift
   - Raster + Auto-Gesamtstufe + Dropdown Override
   - Widersprüche pro Kriterium verhindern (ex-Gruppen)
   - Textgenerator: warm (2–4) / sachlich (5–6), arbeitszeugnisnah
   - Feinjustier-Wörter farbig im Editor, PDF schwarz
   - PDF: html2canvas + jsPDF lokal + Fallback Print
*/

const DEFAULT_PLACE = "Wädenswil";
const LEVELS = ["vv","g","ge","u"]; // sehr gut → nicht genügend
const LEVEL_LABEL = { vv:"++", g:"+", ge:"-", u:"--" };
const LEVEL_TEXT  = { vv:"sehr gut", g:"gut", ge:"genügend", u:"nicht genügend" };

// Punkt-Format: "string" ODER {t:"Text", ex:"gruppe"}
function pointText(p){ return (typeof p === "string") ? p : (p.t || ""); }
function pointEx(p){ return (typeof p === "string") ? null : (p.ex || null); }

// Raster (hier exemplarisch; ersetze später die Punkte 1:1 aus deinem Original)
const DATA = [
  {
    group: "Arbeits- und Lernverhalten",
    items: [
      {
        id: "puenktlich",
        title: "Erscheint pünktlich und ordnungsgemäss zum Unterricht",
        levels: {
          vv: { color: "blue",  points: [
            { t:"Sitzt bei Beginn der Stunde am Platz", ex:"start" },
            { t:"Ist ruhig bei Beginn der Stunde", ex:"start" },
            { t:"Erledigt Hausaufgaben zuverlässig und vollständig", ex:"homework" },
            { t:"Bringt Material immer vollständig", ex:"material" }
          ]},
          g:  { color: "green", points: [
            { t:"Sitzt bei Beginn der Stunde am Platz", ex:"start" },
            { t:"Erledigt Hausaufgaben meist vollständig", ex:"homework" },
            { t:"Bringt Material vollständig", ex:"material" }
          ]},
          ge: { color: "orange",points: [
            { t:"Ist bei Beginn der Stunde im Zimmer, aber noch nicht am Platz", ex:"start" },
            { t:"Vergisst Hausaufgaben manchmal oder macht sie nicht vollständig", ex:"homework" },
            { t:"Material ist teilweise unvollständig", ex:"material" }
          ]},
          u:  { color: "red",   points: [
            { t:"Kommt nach dem Läuten ins Zimmer", ex:"start" },
            { t:"Vergisst Hausaufgaben häufig oder erledigt sie nicht", ex:"homework" },
            { t:"Material fehlt häufig", ex:"material" }
          ]}
        }
      },
      {
        id: "aktiv",
        title: "Beteiligt sich aktiv am Unterricht",
        levels: {
          vv: { color: "blue", points: ["Stellt Fragen","Sucht Lösungen","Zeigt grosse Eigeninitiative"]},
          g:  { color: "green",points: ["Stellt Fragen","Zeigt Eigeninitiative"]},
          ge: { color: "orange",points: ["Stellt selten Fragen","Zeigt wenig Eigeninitiative"]},
          u:  { color: "red", points: ["Stellt keine Fragen","Zeigt keine Eigeninitiative"]}
        }
      },
      {
        id: "konzentriert",
        title: "Arbeitet konzentriert und ausdauernd",
        levels: {
          vv: { color: "blue", points: ["Arbeitet konzentriert","Arbeitet ausdauernd","Beendet Aufgaben eigenständig"]},
          g:  { color: "green",points: ["Arbeitet meistens konzentriert","Arbeitet meistens ausdauernd","Beendet Aufgaben"]},
          ge: { color: "orange",points: ["Arbeitet teilweise konzentriert","Lässt sich ablenken","Beendet Aufgaben teilweise"]},
          u:  { color: "red", points: ["Lässt sich bei der Arbeit ablenken","Beendet Aufgaben selten"]}
        }
      },
      {
        id: "sorgfalt",
        title: "Gestaltet Arbeiten sorgfältig und zuverlässig",
        levels: {
          vv: { color: "blue", points: ["Arbeitet mündlich und schriftlich sorgfältig, zuverlässig und selbständig","Geht mit dem Material korrekt um"]},
          g:  { color: "green",points: ["Arbeitet oft sorgfältig, zuverlässig und selbständig","Geht mit dem Material korrekt um"]},
          ge: { color: "orange",points: ["Arbeitet teilweise unsorgfältig oder unzuverlässig","Geht mit dem Material teilweise korrekt um"]},
          u:  { color: "red", points: ["Arbeitet häufig unsorgfältig oder unzuverlässig","Geht mit dem Material nicht korrekt um"]}
        }
      },
      {
        id: "zusammenarbeit",
        title: "Kann mit anderen zusammenarbeiten",
        levels: {
          vv: { color: "blue", points: ["Arbeitet mit allen zusammen","Hilft anderen","Übernimmt Verantwortung"]},
          g:  { color: "green",points: ["Arbeitet mit anderen zusammen","Hilft anderen"]},
          ge: { color: "orange",points: ["Hat Schwierigkeiten, mit anderen zusammenzuarbeiten","Hilft anderen nach Aufforderung"]},
          u:  { color: "red", points: ["Stört die Zusammenarbeit in der Gruppe","Hilft anderen nur wenn es sein muss"]}
        }
      },
      {
        id: "selbsteinschaetzung",
        title: "Schätzt die eigene Leistungsfähigkeit realistisch ein",
        levels: {
          vv: { color: "blue", points: ["Kennt Stärken sehr gut","Kennt Schwächen sehr gut","Setzt sich herausfordernde und erreichbare Ziele"]},
          g:  { color: "green",points: ["Kennt Stärken","Kennt Schwächen","Setzt sich realistische Ziele"]},
          ge: { color: "orange",points: ["Kennt Stärken teilweise","Kennt Schwächen teilweise","Braucht Hilfe, um realistische Ziele zu setzen"]},
          u:  { color: "red", points: ["Kennt Stärken noch kaum","Kennt Schwächen noch kaum","Kann sich kaum realistische Ziele setzen"]}
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
          vv: { color: "blue", points: ["Hält Regeln ein","Führt Ämtli selbständig aus"]},
          g:  { color: "green",points: ["Hält Regeln ein","Führt Ämtli aus"]},
          ge: { color: "orange",points: ["Hält Regeln nach Aufforderung ein","Führt Ämtli bei Aufforderung aus"]},
          u:  { color: "red", points: ["Hält Regeln nicht zuverlässig ein","Führt Ämtli mit Unterstützung aus"]}
        }
      },
      {
        id: "respekt",
        title: "Begegnet Lehrpersonen und Mitschülern respektvoll",
        levels: {
          vv: { color: "blue", points: ["Begegnet Erwachsenen respektvoll","Begegnet Mitschülerinnen und Mitschülern respektvoll"]},
          g:  { color: "green",points: ["Begegnet Erwachsenen grundsätzlich respektvoll","Begegnet Mitschülerinnen und Mitschülern grundsätzlich respektvoll"]},
          ge: { color: "orange",points: ["Begegnet Erwachsenen teilweise respektvoll","Begegnet Mitschülerinnen und Mitschülern teilweise respektvoll"]},
          u:  { color: "red", points: ["Begegnet Erwachsenen selten respektvoll","Begegnet Mitschülerinnen und Mitschülern selten respektvoll"]}
        }
      }
    ]
  }
];

// ===== DOM & Helpers =====
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
function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function pronouns(g){
  return (g === "w")
    ? { subj:"sie", obj:"sie", poss:"ihr", dat:"ihr" }
    : { subj:"er", obj:"ihn", poss:"sein", dat:"ihm" };
}
function getCycle(className){
  const m = (className || "").match(/\d+/);
  if(!m) return "low";
  const k = parseInt(m[0], 10);
  return (k <= 4) ? "low" : "high";
}
function mod(w){ return `<span class="mod">${w}</span>`; }

function weich(level){
  if(level==="vv") return mod("durchwegs");
  if(level==="g")  return mod("meist");
  if(level==="ge") return mod("teilweise");
  return mod("selten");
}
function sicher(level){
  if(level==="vv") return mod("sehr sicher");
  if(level==="g")  return mod("sicher");
  if(level==="ge") return mod("noch nicht durchgehend sicher");
  return mod("mit Unterstützung");
}
function kritisch(level){
  if(level==="vv" || level==="g") return "";
  if(level==="ge") return ` ${mod("Dabei braucht")} ${mod("es noch")} gelegentlich eine Erinnerung oder Strukturierung.`;
  return ` ${mod("Hier braucht")} ${mod("es deutlich")} mehr Begleitung, damit Ziele zuverlässig erreicht werden.`;
}

// ===== State =====
const state = { checks:{}, overall:{} }; // overall: "auto" | "vv" | "g" | "ge" | "u"

function ensureItemState(item){
  if(!state.checks[item.id]) state.checks[item.id] = {};
  for(const lk of LEVELS){
    if(!state.checks[item.id][lk]) state.checks[item.id][lk] = {};
  }
  if(!state.overall[item.id]) state.overall[item.id] = "auto";
}

// ===== Auto-Gesamtstufe =====
function computeOverallLevel(item){
  const forced = state.overall[item.id];
  if(forced && forced !== "auto") return forced;

  const counts = {};
  for(const lk of LEVELS){
    const m = state.checks[item.id][lk] || {};
    counts[lk] = Object.values(m).filter(Boolean).length;
  }
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  if(total === 0) return "g";

  const sorted = LEVELS.map(lk => ({lk, c: counts[lk]})).sort((a,b)=>b.c-a.c);
  const top = sorted[0];
  const tie = sorted.filter(x => x.c === top.c);
  if(tie.length > 1){
    const pref = ["g","vv","ge","u"];
    for(const p of pref){
      if(tie.some(t => t.lk === p)) return p;
    }
  }
  return top.lk;
}

function currentSelections(){
  const out = {};
  DATA.forEach(g => g.items.forEach(item => out[item.id] = computeOverallLevel(item)));
  return out;
}

// ===== Raster UI =====
let editorTouched = false;

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

      const autoLine = document.createElement("div");
      autoLine.className = "muted small";
      autoLine.style.marginTop = "6px";
      autoLine.innerHTML = `Auto-Berechnung: <strong data-autolabel="${item.id}"></strong>`;
      block.appendChild(autoLine);

      const grid = document.createElement("div");
      grid.className = "levelGrid";

      LEVELS.forEach(lk => {
        const col = document.createElement("div");
        col.className = `levelCol levelCol--${item.levels[lk].color}`;

        const capBox = document.createElement("div");
        capBox.className = "levelCap";
        capBox.innerHTML = `
          <div class="levelCap__short">${LEVEL_LABEL[lk]}</div>
          <div class="levelCap__long">${LEVEL_TEXT[lk]}</div>
        `;
        col.appendChild(capBox);

        const list = document.createElement("div");
        list.className = "pointList";

        item.levels[lk].points.forEach((p, idx) => {
          const checked = !!state.checks[item.id][lk][idx];
          const ex = pointEx(p);
          const text = pointText(p);

          const lab = document.createElement("label");
          lab.className = "point";
          lab.innerHTML = `
            <input type="checkbox" ${checked ? "checked":""}
              data-item="${item.id}" data-level="${lk}" data-idx="${idx}"
              ${ex ? `data-ex="${ex}"` : ""}>
            <span>${text}</span>
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

  // Checkbox Events + Widerspruchslogik
  root.querySelectorAll('input[type="checkbox"][data-item]').forEach(cb => {
    cb.addEventListener("change", (e) => {
      const target = e.target;
      const itemId = target.dataset.item;
      const lk = target.dataset.level;
      const idx = Number(target.dataset.idx);
      const ex = target.dataset.ex || null;

      state.checks[itemId][lk][idx] = target.checked;

      // Exklusivgruppen: widersprüchliche Aussagen innerhalb desselben Kriteriums verhindern
      if(target.checked && ex){
        // Finde genau dieses Item im DATA
        const item = DATA.flatMap(g => g.items).find(it => it.id === itemId);
        if(item){
          LEVELS.forEach(otherLk => {
            const pts = item.levels[otherLk].points || [];
            pts.forEach((p, otherIdx) => {
              const otherEx = pointEx(p);
              if(otherEx === ex && !(otherLk === lk && otherIdx === idx)){
                state.checks[itemId][otherLk][otherIdx] = false;
                const sel = `input[type="checkbox"][data-item="${itemId}"][data-level="${otherLk}"][data-idx="${otherIdx}"]`;
                const box = root.querySelector(sel);
                if(box) box.checked = false;
              }
            });
          });
        }
      }

      refreshAutoLabels();
      if(!editorTouched) generateText();
    });
  });

  // Override Events
  root.querySelectorAll('select[data-overall]').forEach(sel => {
    sel.value = state.overall[sel.dataset.overall] || "auto";
    sel.addEventListener("change", (e) => {
      state.overall[e.target.dataset.overall] = e.target.value;
      refreshAutoLabels();
      if(!editorTouched) generateText();
    });
  });

  refreshAutoLabels();
}

function refreshAutoLabels(){
  const flat = DATA.flatMap(g => g.items);
  flat.forEach(item => {
    // Auto-Wert berechnen (temporär override auf auto)
    const backup = state.overall[item.id];
    state.overall[item.id] = "auto";
    const auto = computeOverallLevel(item);
    state.overall[item.id] = backup;

    const node = document.querySelector(`[data-autolabel="${item.id}"]`);
    if(node) node.textContent = `${LEVEL_LABEL[auto]} (${LEVEL_TEXT[auto]})`;
  });
}

// ===== Textgenerator =====
function buildProfessionalText(ctx, levels){
  const { name, P, cycle } = ctx;
  const L = (id) => levels[id] || "g";

  const introLow =
`${name} zeigt in den überfachlichen Kompetenzen insgesamt ein ${mod("stimmiges")} Bild. Die folgenden Beobachtungen beschreiben, wie ${P.subj} den Schulalltag erlebt und bewältigt.`;

  const introHigh =
`${name} zeigt in den überfachlichen Kompetenzen insgesamt ein ${mod("differenziertes")} Profil. Die folgenden Ausführungen geben Auskunft über das Arbeits-, Lern- und Sozialverhalten im Schulalltag.`;

  const bodyLow = `
${cap(P.subj)} erscheint zu Unterrichtsbeginn ${weich(L("puenktlich"))} startbereit und organisiert. Material und Hausaufgaben sind ${weich(L("puenktlich"))} vollständig vorhanden.${kritisch(L("puenktlich"))}

Im Unterricht beteiligt sich ${name} ${weich(L("aktiv"))} aktiv. ${cap(P.subj)} zeigt Interesse am Lernstoff und bringt sich mit eigenen Ideen ein.${kritisch(L("aktiv"))}

Bei der Bearbeitung von Aufgaben arbeitet ${name} ${weich(L("konzentriert"))} konzentriert und bleibt ${sicher(L("konzentriert"))} bei der Sache. In längeren Arbeitsphasen hilft ${P.subj} ${weich(L("konzentriert"))} eine kurze Erinnerung, um den Fokus zu halten.${kritisch(L("konzentriert"))}

Arbeiten führt ${name} ${weich(L("sorgfalt"))} sorgfältig aus. Die Ergebnisse zeigen, dass ${P.subj} ${sicher(L("sorgfalt"))} und zuverlässig arbeitet.${kritisch(L("sorgfalt"))}

${name} arbeitet ${weich(L("zusammenarbeit"))} kooperativ mit anderen zusammen und kann sich in Gruppen einbringen. ${cap(P.subj)} ist ${weich(L("zusammenarbeit"))} bereit, Verantwortung zu übernehmen.${kritisch(L("zusammenarbeit"))}

Regeln des schulischen Zusammenlebens hält ${name} ${weich(L("regeln"))} ein. Aufgaben und Ämtli erledigt ${P.subj} ${sicher(L("regeln"))}.${kritisch(L("regeln"))}

Im Umgang mit anderen begegnet ${name} seinen Mitmenschen ${weich(L("respekt"))} respektvoll. ${cap(P.subj)} zeigt dabei ein wertschätzendes Verhalten gegenüber Erwachsenen und Gleichaltrigen.${kritisch(L("respekt"))}

${name} schätzt die eigene Leistungsfähigkeit ${weich(L("selbsteinschaetzung"))} realistisch ein. ${cap(P.subj)} kann eigene Stärken erkennen und ist bereit, an Entwicklungspunkten zu arbeiten. Ziele setzt sich ${P.subj} ${sicher(L("selbsteinschaetzung"))} und arbeitet daran, diese zu erreichen.${kritisch(L("selbsteinschaetzung"))}
`.trim();

  const bodyHigh = `
${name} erscheint zu Unterrichtsbeginn ${weich(L("puenktlich"))} startbereit und organisiert. Material und Hausaufgaben sind ${weich(L("puenktlich"))} vollständig vorhanden.${kritisch(L("puenktlich"))}

${cap(P.subj)} beteiligt sich ${weich(L("aktiv"))} am Unterricht und bringt eigene Beiträge ein. Selbständigkeit und Initiative zeigt ${P.subj} ${sicher(L("aktiv"))}.${kritisch(L("aktiv"))}

Bei der Bearbeitung von Aufgaben arbeitet ${name} ${weich(L("konzentriert"))} konzentriert und bleibt ${sicher(L("konzentriert"))} bei der Sache. In längeren Arbeitsphasen zeigt ${P.subj} ${weich(L("konzentriert"))} einen erhöhten Bedarf an Strukturierung und Priorisierung.${kritisch(L("konzentriert"))}

Arbeiten werden von ${name} ${weich(L("sorgfalt"))} sorgfältig und zuverlässig ausgeführt. Die Ergebnisse entsprechen ${sicher(L("sorgfalt"))} den Anforderungen.${kritisch(L("sorgfalt"))}

In Gruppen arbeitet ${name} ${weich(L("zusammenarbeit"))} kooperativ mit anderen zusammen und trägt zu einem funktionierenden Arbeitsprozess bei.${kritisch(L("zusammenarbeit"))}

Regeln des schulischen Zusammenlebens hält ${name} ${weich(L("regeln"))} ein. Aufgaben und vereinbarte Verantwortlichkeiten werden ${sicher(L("regeln"))} wahrgenommen.${kritisch(L("regeln"))}

Im Umgang mit anderen begegnet ${name} seinen Mitmenschen ${weich(L("respekt"))} respektvoll. Das Verhalten gegenüber Erwachsenen und Gleichaltrigen ist ${sicher(L("respekt"))}.${kritisch(L("respekt"))}

${name} schätzt die eigene Leistungsfähigkeit ${weich(L("selbsteinschaetzung"))} realistisch ein und kann Stärken sowie Entwicklungsfelder benennen. Ziele werden ${sicher(L("selbsteinschaetzung"))} gesetzt und verfolgt.${kritisch(L("selbsteinschaetzung"))}
`.trim();

  return `${cycle==="low" ? introLow : introHigh}\n\n${cycle==="low" ? bodyLow : bodyHigh}`;
}

function setEditorHTML(html){ el("reportEditor").innerHTML = html; }
function getEditorPlainText(){
  const tmp = document.createElement("div");
  tmp.innerHTML = el("reportEditor").innerHTML;
  return (tmp.innerText || "").trim();
}
function generateText(){
  const name = el("studentName").value.trim() || "Das Kind";
  const P = pronouns(el("gender").value);
  const cycle = getCycle(el("className").value);
  const levels = currentSelections();

  const text = buildProfessionalText({ name, P, cycle }, levels);
  const html = text.split("\n").map(l => l === "" ? "<br>" : l).join("<br>");
  setEditorHTML(html);
}

// ===== Print/PDF =====
function buildPrintTables(selections){
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
    const marks = LEVELS.map(lk => {
      const on = (lk === chosen) ? "mark mark--on" : "mark";
      return `<div class="${on}"></div>`;
    }).join("");
    return `<div class="zRowLeft">${item.title}</div><div class="zRowRight">${marks}</div>`;
  }

  function table(group){
    const top = `<div></div>${headerRight}`;
    const rows = group.items.map(rowHTML).join("");
    return top + rows;
  }

  el("printTableArbeits").innerHTML = table(DATA[0]);
  el("printTableSozial").innerHTML  = table(DATA[1]);
}

function buildPrint(){
  const studentName = el("studentName").value.trim() || "—";
  const className   = el("className").value.trim()   || "—";
  const teacherName = el("teacherName").value.trim() || "—";
  const place       = el("place").value.trim()       || "—";
  const dateCH      = formatDateCH(el("date").value) || "—";

  el("printHead").textContent =
    `Name: ${studentName} · Klasse: ${className} · Ort/Datum: ${place}, ${dateCH} · Lehrperson: ${teacherName}`;

  el("sigTeacherCap").textContent =
    (teacherName && teacherName !== "—") ? `Lehrperson: ${teacherName}` : "Lehrperson";

  buildPrintTables(currentSelections());
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

function getJsPDF(){
  if(window.jspdf && window.jspdf.jsPDF) return window.jspdf.jsPDF;
  if(window.jsPDF) return window.jsPDF;
  return null;
}
function canUseRealPdf(){
  return !!(window.html2canvas && getJsPDF());
}

async function exportRealPDF(){
  buildPrint();
  const sourcePage = document.querySelector("#printArea .printPage");
  if(!sourcePage) throw new Error("Druckbereich nicht gefunden.");

  const clone = sourcePage.cloneNode(true);

  const staging = document.createElement("div");
  staging.style.position = "fixed";
  staging.style.left = "0";
  staging.style.top = "0";
  staging.style.zIndex = "999999";
  staging.style.background = "#fff";
  staging.style.pointerEvents = "none";
  staging.appendChild(clone);
  document.body.appendChild(staging);

  await new Promise(r => requestAnimationFrame(r));
  await new Promise(r => setTimeout(r, 140));

  try{
    const canvas = await window.html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false
    });

    const jsPDF = getJsPDF();
    if(!jsPDF) throw new Error("jsPDF nicht verfügbar.");

    const pdf = new jsPDF("p", "mm", "a4");

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
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
  } finally {
    document.body.removeChild(staging);
  }
}

function openPrintView(){
  buildPrint();
  const printHTML = document.querySelector("#printArea").innerHTML;

  const base = location.href.replace(/[^/]+$/, "");
  const cssHref = base + "styles.css";

  const w = window.open("", "_blank");
  w.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Überfachliche Kompetenzen</title>
        <link rel="stylesheet" href="${cssHref}">
        <style>
          body{ margin:0; background:#fff; }
          .printArea--offscreen{ position:static !important; left:auto !important; top:auto !important; }
        </style>
      </head>
      <body onload="window.print()">
        ${printHTML}
      </body>
    </html>
  `);
  w.document.close();
}

async function handlePdfClick(){
  if(canUseRealPdf()){
    try{ await exportRealPDF(); return; }
    catch(err){ console.error("PDF-Export fehlgeschlagen → Print-Fallback", err); }
  }
  openPrintView();
}

// ===== Diktat =====
function makeDictationEditable(buttonEl, targetEl){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ buttonEl.disabled = true; return; }

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

  buttonEl.addEventListener("click", () => {
    if(running){ running = false; buttonEl.textContent = "🎤 Diktat"; rec.stop(); }
    else { running = true; buttonEl.textContent = "⏹️ Stopp"; rec.start(); }
  });
}

function makeDictationTextarea(buttonEl, textarea){
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR){ buttonEl.disabled = true; return; }

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

  buttonEl.addEventListener("click", () => {
    if(running){ running = false; buttonEl.textContent = "🎤 Diktat"; rec.stop(); }
    else { running = true; buttonEl.textContent = "⏹️ Stopp"; rec.start(); }
  });
}

// ===== Defaults / Reset / Copy =====
function fillDefaults(){
  el("place").value = DEFAULT_PLACE;
  el("date").value = toISODate(new Date());
}

function resetStandard(){
  DATA.forEach(g => g.items.forEach(item => {
    ensureItemState(item);
    state.overall[item.id] = "auto";
    for(const lk of LEVELS) state.checks[item.id][lk] = {};
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

// ===== Init =====
DATA.forEach(g => g.items.forEach(ensureItemState));
buildRaster();
fillDefaults();
generateText();

el("reportEditor").addEventListener("input", () => { editorTouched = true; });

["studentName","className","gender"].forEach(id => {
  el(id).addEventListener("input", () => { if(!editorTouched) generateText(); });
});
el("gender").addEventListener("change", () => { if(!editorTouched) generateText(); });

el("btnReset").addEventListener("click", resetStandard);
el("btnRegen").addEventListener("click", regenerateOverwrite);
el("btnPdf").addEventListener("click", handlePdfClick);
el("btnCopy").addEventListener("click", copyPlain);

makeDictationEditable(el("btnDictateText"), el("reportEditor"));
makeDictationTextarea(el("btnDictateRemarks"), el("teacherRemarks"));
