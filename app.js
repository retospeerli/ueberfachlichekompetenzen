/* Überfachliche Kompetenzen – komplett neu, ohne Datenspeicherung */

const DEFAULT_PLACE = "Wädenswil";

const LEVELS = [
  { key: "vv", label: "sehr gut ++" },
  { key: "g",  label: "Gut + (Standard)" },
  { key: "ge", label: "Genügend -" },
  { key: "u",  label: "Ungenügend --" }
];

// Struktur wie Raster: 6 + 2 Kriterien
const DATA = [
  {
    group: "Arbeits- und Lernverhalten",
    badge: "6 Kriterien",
    items: [
      { id: "puenktlich", title: "Erscheint pünktlich und ordnungsgemäss zum Unterricht" },
      { id: "aktiv", title: "Beteiligt sich aktiv am Unterricht" },
      { id: "konzentriert", title: "Arbeitet konzentriert und ausdauernd" },
      { id: "sorgfalt", title: "Gestaltet Arbeiten sorgfältig und zuverlässig" },
      { id: "zusammenarbeit", title: "Kann mit anderen zusammenarbeiten" },
      { id: "selbsteinschaetzung", title: "Schätzt die eigene Leistungsfähigkeit realistisch ein" }
    ]
  },
  {
    group: "Sozialverhalten",
    badge: "2 Kriterien",
    items: [
      { id: "regeln", title: "Akzeptiert die Regeln des schulischen Zusammenlebens" },
      { id: "respekt", title: "Begegnet den Lehrpersonen und Mitschülern respektvoll" }
    ]
  }
];

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
  if(g === "w"){
    return { subj: "sie", obj: "sie", poss: "ihr", dat: "ihr" };
  }
  return { subj: "er", obj: "ihn", poss: "sein", dat: "ihm" };
}

// markierbare „Feinjustier-Wörter“
function mod(w){ return `<span class="mod">${w}</span>`; }

// Wordsets pro Stufe (damit der Text nicht immer gleich klingt)
function wordset(level){
  switch(level){
    case "vv":
      return {
        freq: mod("durchwegs"),
        often: mod("sehr häufig"),
        can: mod("problemlos"),
        needs: mod("kaum"),
        tone: mod("sehr sicher"),
        improvement: mod("stets zuverlässig")
      };
    case "g":
      return {
        freq: mod("meist"),
        often: mod("oft"),
        can: mod("gut"),
        needs: mod("selten"),
        tone: mod("sicher"),
        improvement: mod("in der Regel zuverlässig")
      };
    case "ge":
      return {
        freq: mod("manchmal"),
        often: mod("gelegentlich"),
        can: mod("noch nicht durchgehend"),
        needs: mod("immer wieder"),
        tone: mod("noch nicht stabil"),
        improvement: mod("mit Unterstützung zunehmend")
      };
    default:
      return {
        freq: mod("selten"),
        often: mod("nur vereinzelt"),
        can: mod("noch nicht so gut"),
        needs: mod("häufig"),
        tone: mod("hat noch Mühe"),
        improvement: mod("braucht deutlich Unterstützung")
      };
  }
}

/*
  Zeugnis-ähnliche Satzbausteine pro Kriterium:
  - präzise
  - aussagekräftig
  - mit markierten Feinjustier-Wörtern
*/
function sentence(itemId, level, ctx){
  const { name, P } = ctx;
  const W = wordset(level);

  switch(itemId){

    case "puenktlich":
      if(level === "vv") return `${name} ist bei Unterrichtsbeginn ${W.freq} startbereit und bringt Material sowie Hausaufgaben ${mod("immer")} vollständig mit.`;
      if(level === "g")  return `${name} ist bei Unterrichtsbeginn ${W.freq} startbereit; Material und Hausaufgaben sind ${mod("in der Regel")} vollständig.`;
      if(level === "ge") return `${name} ist bei Unterrichtsbeginn ${W.freq} startbereit und benötigt ${mod("gelegentlich")} noch Zeit für die Vorbereitung; Material oder Hausaufgaben fehlen ${W.often}.`;
      return `${name} kommt ${W.freq} nach dem Läuten und ist bei Unterrichtsbeginn ${W.tone}; Material oder Hausaufgaben fehlen ${W.needs}.`;

    case "aktiv":
      if(level === "vv") return `${name} beteiligt sich ${W.freq} aktiv, stellt Fragen und bringt ${mod("eigene Ideen")} ein; ${P.subj} sucht ${mod("selbstständig")} nach Lösungswegen.`;
      if(level === "g")  return `${name} beteiligt sich ${W.freq} aktiv, stellt Fragen und bringt ${W.often} eigene Gedanken ein.`;
      if(level === "ge") return `${name} beteiligt sich ${W.freq}; Fragen oder eigene Ideen kommen ${W.often} erst nach Impulsen, und ${P.subj} zeigt Initiative ${W.can}.`;
      return `${name} beteiligt sich ${W.freq}; ${P.subj} stellt ${W.often} kaum Fragen und zeigt Initiative ${W.can}.`;

    case "konzentriert":
      if(level === "vv") return `${name} arbeitet ${W.freq} konzentriert und ausdauernd und beendet Aufgaben ${mod("eigenständig")} bis zum Ende.`;
      if(level === "g")  return `${name} arbeitet ${W.freq} konzentriert und bleibt ${W.often} dran; Aufgaben werden ${mod("meist vollständig")} abgeschlossen.`;
      if(level === "ge") return `${name} arbeitet ${W.freq} konzentriert, lässt sich jedoch ${W.needs} ablenken; bei längeren Aufgaben fällt das Dranbleiben ${W.can} leicht.`;
      return `${name} lässt sich ${W.needs} ablenken und ${P.subj} ${W.tone}, um bei Aufgaben dranzubleiben; Arbeiten bleiben ${W.often} unvollständig.`;

    case "sorgfalt":
      if(level === "vv") return `${name} arbeitet mündlich und schriftlich ${W.freq} sorgfältig und ${mod("präzise")}; ${P.subj} geht mit Material ${mod("stets")} korrekt um.`;
      if(level === "g")  return `${name} arbeitet ${W.freq} sorgfältig und zuverlässig; im Umgang mit Material handelt ${P.subj} ${mod("grundsätzlich")} korrekt.`;
      if(level === "ge") return `${name} arbeitet ${W.freq} sorgfältig; bei Genauigkeit und Verlässlichkeit zeigt ${P.subj} ${W.needs} Schwankungen und braucht ${W.often} Erinnerungen im Materialumgang.`;
      return `${name} arbeitet ${W.freq} sorgfältig und ${P.subj} ${W.tone}; Genauigkeit, Verlässlichkeit und korrekter Materialumgang gelingen ${W.often} nur mit Unterstützung.`;

    case "zusammenarbeit":
      if(level === "vv") return `${name} arbeitet ${W.freq} kooperativ mit anderen zusammen, unterstützt Mitschülerinnen und Mitschüler ${W.often} und übernimmt ${mod("verantwortungsvoll")} Aufgaben in der Gruppe.`;
      if(level === "g")  return `${name} kann ${W.freq} gut mit anderen zusammenarbeiten und unterstützt andere ${mod("bei Bedarf")}.`;
      if(level === "ge") return `${name} kann ${W.freq} mit anderen zusammenarbeiten; in Gruppenprozessen braucht ${P.subj} ${W.often} Anleitung und übernimmt Verantwortung ${W.can}.`;
      return `${name} hat in der Zusammenarbeit ${W.tone}; Gruppenprozesse werden ${W.needs} gestört und Unterstützung für andere erfolgt ${W.often} nicht freiwillig.`;

    case "selbsteinschaetzung":
      if(level === "vv") return `${name} schätzt die eigene Leistungsfähigkeit ${W.freq} realistisch ein, kennt Stärken und Entwicklungspunkte gut und setzt sich ${mod("passende")} Ziele.`;
      if(level === "g")  return `${name} schätzt die eigene Leistungsfähigkeit ${W.freq} realistisch ein und setzt sich ${mod("realistische")} Ziele.`;
      if(level === "ge") return `${name} schätzt die eigene Leistungsfähigkeit ${W.freq} realistisch ein; beim Formulieren realistischer Ziele braucht ${P.subj} ${W.often} Unterstützung.`;
      return `${name} kann die eigene Leistungsfähigkeit ${W.freq} einschätzen und ${P.subj} ${W.tone}; passende Ziele gelingen ${W.often} nur mit Hilfe.`;

    case "regeln":
      if(level === "vv") return `${name} hält sich ${W.freq} an Regeln des schulischen Zusammenlebens und erledigt Ämtli ${mod("selbstständig")} sowie ${W.improvement}.`;
      if(level === "g")  return `${name} hält sich ${W.freq} an Regeln und erledigt Ämtli ${W.often} zuverlässig.`;
      if(level === "ge") return `${name} hält sich ${W.freq} an Regeln; Ämtli werden ${W.often} erst nach Erinnerung ausgeführt.`;
      return `${name} hält Regeln ${W.freq} ein und ${P.subj} ${W.tone}; Ämtli werden ${W.often} nur mit Unterstützung erledigt.`;

    case "respekt":
      if(level === "vv") return `${name} begegnet Lehrpersonen und Mitschülerinnen sowie Mitschülern ${W.freq} respektvoll und kommuniziert ${mod("wertschätzend")}.`;
      if(level === "g")  return `${name} begegnet anderen ${W.freq} respektvoll und achtet ${W.often} auf einen angemessenen Umgangston.`;
      if(level === "ge") return `${name} begegnet anderen ${W.freq} respektvoll; im Umgangston braucht ${P.subj} ${W.often} Erinnerung.`;
      return `${name} begegnet anderen ${W.freq} respektvoll und ${P.subj} ${W.tone}; der Umgangston ist ${W.needs} nicht angemessen.`;

    default:
      return `${name} zeigt ${W.freq} eine ${W.tone} Entwicklung.`;
  }
}

/* Raster UI */
function buildRaster(){
  const root = el("rasterRoot");
  root.innerHTML = "";

  DATA.forEach(group => {
    const wrap = document.createElement("div");
    wrap.className = "group";

    const title = document.createElement("div");
    title.className = "group__title";
    title.innerHTML = `<div>${group.group}</div><div class="badge">${group.badge}</div>`;
    wrap.appendChild(title);

    group.items.forEach(item => {
      const row = document.createElement("div");
      row.className = "item";

      const head = document.createElement("div");
      head.className = "item__head";

      const name = document.createElement("div");
      name.className = "item__name";
      name.textContent = item.title;

      const opts = document.createElement("div");
      opts.className = "item__opts";

      LEVELS.forEach(L => {
        const label = document.createElement("label");
        label.className = "opt";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = item.id;
        input.value = L.key;
        if(L.key === "g") input.checked = true;

        input.addEventListener("change", () => {
          if(!editorTouched) generateText();
        });

        const box = document.createElement("div");
        box.innerHTML = `<div class="opt__t">${L.label}</div>`;

        label.appendChild(input);
        label.appendChild(box);
        opts.appendChild(label);
      });

      head.appendChild(name);
      head.appendChild(opts);
      row.appendChild(head);
      wrap.appendChild(row);
    });

    root.appendChild(wrap);
  });
}

function currentSelections(){
  const out = {};
  DATA.forEach(g => g.items.forEach(item => {
    const checked = document.querySelector(`input[name="${item.id}"]:checked`);
    out[item.id] = checked ? checked.value : "g";
  }));
  return out;
}

/* Editor handling */
let editorTouched = false;

function setEditorHTML(html){
  el("reportEditor").innerHTML = html;
}
function getEditorPlainText(){
  const tmp = document.createElement("div");
  tmp.innerHTML = el("reportEditor").innerHTML;
  return (tmp.innerText || "").trim();
}

/* Text generation */
function generateText(){
  const name = el("studentName").value.trim() || "Das Kind";
  const P = pronouns(el("gender").value);
  const sel = currentSelections();

  const intro =
    `${name} wird im Bereich der überfachlichen Kompetenzen wie folgt eingeschätzt:`;

  const a = [];
  const s = [];

  DATA.forEach(group => {
    group.items.forEach(item => {
      const lvl = sel[item.id];
      const sent = sentence(item.id, lvl, { name, P });
      if(group.group === "Arbeits- und Lernverhalten") a.push(sent);
      else s.push(sent);
    });
  });

  // bewusst 2 Absätze (wie Zeugnis), aber kompakt
  const html =
    `${intro}<br><br>` +
    `<strong>Arbeits- und Lernverhalten:</strong> ${a.join(" ")}<br><br>` +
    `<strong>Sozialverhalten:</strong> ${s.join(" ")}`;

  setEditorHTML(html);
}

/* Defaults */
function fillDefaults(){
  el("place").value = DEFAULT_PLACE;
  el("date").value = toISODate(new Date());
}

/* Reset / Regenerate */
function resetStandard(){
  DATA.forEach(g => g.items.forEach(item => {
    const r = document.querySelector(`input[name="${item.id}"][value="g"]`);
    if(r) r.checked = true;
  }));
  editorTouched = false;
  generateText();
}
function regenerateOverwrite(){
  editorTouched = false;
  generateText();
}

/* Copy plain */
async function copyPlain(){
  await navigator.clipboard.writeText(getEditorPlainText());
}

/* Print building */
function buildPrint(){
  const studentName = el("studentName").value.trim() || "—";
  const className = el("className").value.trim() || "—";
  const teacherName = el("teacherName").value.trim() || "—";
  const place = el("place").value.trim() || "—";
  const dateCH = formatDateCH(el("date").value) || "—";

  // Formularkopf: alle relevanten Angaben
  el("printHead").textContent =
    `Name: ${studentName} · Klasse: ${className} · Ort/Datum: ${place}, ${dateCH} · Lehrperson: ${teacherName}`;

  // PDF Text: immer schwarz (Plaintext)
  el("printText").textContent = getEditorPlainText();

  // Lehrperson: Name steht bereits dort
  el("sigTeacherCap").textContent = (teacherName && teacherName !== "—")
    ? `Lehrperson: ${teacherName}`
    : "Lehrperson";

  // Bemerkungen Lehrperson: Text (falls vorhanden) + Linien
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

/*
  PDF Export Fix:
  - PrintArea liegt sonst offscreen -> html2canvas kann weiss rendern.
  - Wir holen es temporär in den Viewport (opacity 0), exportieren, setzen zurück.
*/
async function exportPDF(){
  buildPrint();

  const area = el("printArea");

  const prev = {
    className: area.className,
    position: area.style.position,
    left: area.style.left,
    top: area.style.top,
    opacity: area.style.opacity,
    width: area.style.width,
    aria: area.getAttribute("aria-hidden")
  };

  // In den Viewport holen, aber unsichtbar
  area.className = "printArea";
  area.style.position = "fixed";
  area.style.left = "0";
  area.style.top = "0";
  area.style.opacity = "0";
  area.style.width = "210mm";
  area.setAttribute("aria-hidden", "false");

  await new Promise(r => requestAnimationFrame(r));

  const filename =
    `Ueberfachliche_Kompetenzen_${(el("studentName").value || "Kind").trim().replaceAll(" ", "_")}.pdf`;

  const opt = {
    margin: [0,0,0,0],
    filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: "#ffffff", useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
  };

  try{
    await html2pdf().set(opt).from(area).save();
  } finally {
    // Zurücksetzen
    area.className = prev.className;
    area.style.position = prev.position;
    area.style.left = prev.left;
    area.style.top = prev.top;
    area.style.opacity = prev.opacity;
    area.style.width = prev.width;
    area.setAttribute("aria-hidden", prev.aria ?? "true");
  }
}

/* Diktat: contenteditable */
function makeDictationEditable(buttonEl, targetEl){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    buttonEl.disabled = true;
    buttonEl.title = "Diktierfunktion wird von diesem Browser nicht unterstützt.";
    return;
  }

  const rec = new SpeechRecognition();
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
    let finalText = "";
    for(let i = event.resultIndex; i < event.results.length; i++){
      if(event.results[i].isFinal){
        finalText += event.results[i][0].transcript;
      }
    }
    if(finalText && finalText.trim()){
      insertText(finalText.trim() + " ");
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

/* Diktat: textarea */
function makeDictationTextarea(buttonEl, textarea){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    buttonEl.disabled = true;
    buttonEl.title = "Diktierfunktion wird von diesem Browser nicht unterstützt.";
    return;
  }

  const rec = new SpeechRecognition();
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
    let finalText = "";
    for(let i = event.resultIndex; i < event.results.length; i++){
      if(event.results[i].isFinal){
        finalText += event.results[i][0].transcript;
      }
    }
    if(finalText && finalText.trim()){
      insertAtCursor(finalText.trim() + " ");
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

/* Init */
buildRaster();
fillDefaults();
generateText();

el("btnReset").addEventListener("click", resetStandard);
el("btnRegen").addEventListener("click", regenerateOverwrite);
el("btnPdf").addEventListener("click", exportPDF);
el("btnCopy").addEventListener("click", copyPlain);

// Sobald Lehrperson tippt: nicht mehr automatisch überschreiben
el("reportEditor").addEventListener("input", () => { editorTouched = true; });

// Bei Änderungen im Kopf: neu erzeugen (aber nur, wenn noch nicht manuell editiert)
["studentName","gender"].forEach(id => {
  el(id).addEventListener("input", () => { if(!editorTouched) generateText(); });
});
el("gender").addEventListener("change", () => { if(!editorTouched) generateText(); });

// Diktat aktivieren
makeDictationEditable(el("btnDictateText"), el("reportEditor"));
makeDictationTextarea(el("btnDictateRemarks"), el("teacherRemarks"));
