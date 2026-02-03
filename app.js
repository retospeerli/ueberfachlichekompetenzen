/* Überfachliche Kompetenzen – ohne Speicherung, lokal im Browser */

const DEFAULT_PLACE = "Wädenswil";

// Raster gemäss Vorlage (Seite 1): 6 Kriterien Arbeits-/Lernverhalten, 2 Kriterien Sozialverhalten. :contentReference[oaicite:2]{index=2}
const DATA = [
  {
    group: "Arbeits- und Lernverhalten",
    badge: "6 Kriterien",
    items: [
      {
        id: "puenktlich",
        title: "Erscheint pünktlich und ordnungsgemäss zum Unterricht",
        levels: {
          vv: "Sitzt bei Beginn der Stunde am Platz; ist ruhig bei Beginn der Stunde; bringt Material und Hausaufgaben immer vollständig.",
          g:  "Sitzt bei Beginn der Stunde am Platz; bringt Material und Hausaufgaben vollständig.",
          ge: "Ist bei Beginn der Stunde im Zimmer, aber noch nicht am Platz; bringt Material und Hausaufgaben teilweise vollständig.",
          u:  "Kommt nach dem Läuten ins Zimmer; bringt Material und Hausaufgaben regelmässig unvollständig."
        }
      },
      {
        id: "aktiv",
        title: "Beteiligt sich aktiv am Unterricht",
        levels: {
          vv: "Stellt Fragen; sucht Lösungen; sucht Wege; zeigt grosse Eigeninitiative.",
          g:  "Stellt Fragen; zeigt Eigeninitiative.",
          ge: "Stellt selten Fragen; zeigt wenig Eigeninitiative.",
          u:  "Stellt keine Fragen; zeigt keine Eigeninitiative."
        }
      },
      {
        id: "konzentriert",
        title: "Arbeitet konzentriert und ausdauernd",
        levels: {
          vv: "Arbeitet konzentriert und ausdauernd; beendet die Arbeit eigenständig.",
          g:  "Arbeitet meistens konzentriert und meistens ausdauernd; beendet die Arbeit.",
          ge: "Arbeitet teilweise konzentriert, lässt sich ablenken; beendet die Arbeit teilweise.",
          u:  "Lässt sich bei der Arbeit ablenken; beendet die Arbeit selten."
        }
      },
      {
        id: "sorgfalt",
        title: "Gestaltet Arbeiten sorgfältig und zuverlässig",
        levels: {
          vv: "Arbeitet mündlich und schriftlich sorgfältig, zuverlässig und selbständig; geht mit dem Material immer korrekt um.",
          g:  "Arbeitet mündlich und schriftlich oft sorgfältig, zuverlässig und selbständig; geht mit dem Material korrekt um.",
          ge: "Arbeitet mündlich und schriftlich teilweise unsorgfältig, unzuverlässig und selten selbständig; geht mit dem Material teilweise korrekt um.",
          u:  "Arbeitet mündlich und schriftlich unsorgfältig, unzuverlässig und selten selbständig; geht mit dem Material nicht korrekt um."
        }
      },
      {
        id: "zusammenarbeit",
        title: "Kann mit anderen zusammenarbeiten",
        levels: {
          vv: "Arbeitet mit allen zusammen, hilft anderen und übernimmt Verantwortung.",
          g:  "Arbeitet mit anderen zusammen und hilft anderen.",
          ge: "Hat Schwierigkeiten, mit anderen zusammenzuarbeiten; hilft anderen nur mit Aufforderung der Lehrperson.",
          u:  "Stört die Zusammenarbeit in der Gruppe; hilft anderen nur, wenn es sein muss."
        }
      },
      {
        id: "selbsteinschaetzung",
        title: "Schätzt die eigene Leistungsfähigkeit realistisch ein",
        levels: {
          vv: "Kennt die eigenen Stärken sehr gut, kennt die eigenen Schwächen sehr gut und setzt sich Ziele, die erfüllbar sind und herausfordern.",
          g:  "Kennt die eigenen Stärken und Schwächen und setzt sich realistische Ziele.",
          ge: "Kennt die eigenen Stärken und Schwächen teilweise und braucht Hilfe, um realistische Ziele zu setzen.",
          u:  "Kennt die eigenen Stärken nicht, kennt die eigenen Schwächen nicht und kann sich kaum realistische Ziele setzen."
        }
      }
    ]
  },
  {
    group: "Sozialverhalten",
    badge: "2 Kriterien",
    items: [
      {
        id: "regeln",
        title: "Akzeptiert die Regeln des schulischen Zusammenlebens",
        levels: {
          vv: "Hält Regeln ein und führt Ämtli selbständig aus.",
          g:  "Hält Regeln ein und führt Ämtli aus.",
          ge: "Hält Regeln nach Aufforderung ein und führt das Ämtli bei Aufforderung aus.",
          u:  "Hält Regeln nicht ein und führt das Ämtli mit Hilfe aus."
        }
      },
      {
        id: "respekt",
        title: "Begegnet den Lehrpersonen und Mitschülern respektvoll",
        levels: {
          vv: "Begegnet der Lehrperson äusserst respektvoll und begegnet den Mitschülern respektvoll.",
          g:  "Begegnet der Lehrperson grundsätzlich respektvoll und begegnet den Mitschülern grundsätzlich respektvoll.",
          ge: "Begegnet der Lehrperson teilweise respektvoll und begegnet den Mitschülern teilweise respektvoll.",
          u:  "Begegnet der Lehrperson selten respektvoll und begegnet den Mitschülern selten respektvoll."
        }
      }
    ]
  }
];

const LEVELS = [
  { key: "vv", label: "sehr gut ++" },
  { key: "g",  label: "Gut + (Standard)" },
  { key: "ge", label: "Genügend -" },
  { key: "u",  label: "Ungenügend --" }
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
  // g: "m" | "w"
  if(g === "w"){
    return {
      subj: "sie",
      obj: "sie",
      poss: "ihr",
      possN: "ihre",
      possAkk: "ihre",
      dat: "ihr"
    };
  }
  return {
    subj: "er",
    obj: "ihn",
    poss: "sein",
    possN: "seine",
    possAkk: "seine",
    dat: "ihm"
  };
}

function capFirst(s){
  if(!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildRaster(){
  const root = el("rasterRoot");
  root.innerHTML = "";

  DATA.forEach(group => {
    const wrap = document.createElement("div");
    wrap.className = "group";

    const h = document.createElement("div");
    h.className = "group__title";
    h.innerHTML = `<div>${group.group}</div><div class="badge">${group.badge}</div>`;
    wrap.appendChild(h);

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
        const opt = document.createElement("label");
        opt.className = "opt";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = item.id;
        input.value = L.key;

        // Default: Gut (Standard)
        if(L.key === "g") input.checked = true;

        input.addEventListener("change", () => {
          generateText();
        });

        const box = document.createElement("div");
        box.innerHTML = `<div class="opt__t">${L.label}</div>
                         <div class="opt__d">${item.levels[L.key]}</div>`;

        opt.appendChild(input);
        opt.appendChild(box);
        opts.appendChild(opt);
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

function sentenceFor(item, levelKey, ctx){
  const { studentName, P } = ctx;

  // Wir machen aus der Raster-Aussage einen vollständigen Satz:
  // "{Name} ... ."
  // Dabei bleiben die Formulierungen nah an der Vorlage (Seite 1). :contentReference[oaicite:3]{index=3}
  const core = item.levels[levelKey];

  // Stil: kind-/zeugnisnah, aber nicht künstlich lang.
  // Wir verbinden mit Doppelpunkten/Kommas zu einem Satz.
  return `${studentName} ${core.replaceAll(";", ",").replaceAll("  ", " ").trim()}.`;
}

function generateText(){
  const studentName = el("studentName").value.trim() || "Das Kind";
  const gender = el("gender").value;
  const P = pronouns(gender);
  const sel = currentSelections();

  const partsArbeits = [];
  const partsSozial = [];

  DATA.forEach(group => {
    group.items.forEach(item => {
      const s = sentenceFor(item, sel[item.id], { studentName, P });
      if(group.group === "Arbeits- und Lernverhalten") partsArbeits.push(s);
      else partsSozial.push(s);
    });
  });

  const intro = `${studentName} wird im Bereich der überfachlichen Kompetenzen wie folgt eingeschätzt:`;
  const aTitle = `Arbeits- und Lernverhalten:`;
  const sTitle = `Sozialverhalten:`;

  const text =
`${intro}

${aTitle} ${partsArbeits.join(" ")}

${sTitle} ${partsSozial.join(" ")}`;

  // Nur überschreiben, wenn das Feld leer ist ODER zuletzt automatisch generiert wurde.
  // Pragmatik: Wenn Lehrperson manuell editiert, soll das nicht dauernd überschrieben werden.
  const ta = el("reportText");
  if(!ta.dataset.touched || ta.value.trim() === "" || ta.dataset.autogen === "1"){
    ta.value = text;
    ta.dataset.autogen = "1";
  }
}

function markTouched(){
  const ta = el("reportText");
  ta.dataset.touched = "1";
  ta.dataset.autogen = "0";
}

function setStandardAll(){
  DATA.forEach(g => g.items.forEach(item => {
    const r = document.querySelector(`input[name="${item.id}"][value="g"]`);
    if(r){ r.checked = true; }
  }));
  generateText();
}

async function copyText(){
  const text = el("reportText").value;
  await navigator.clipboard.writeText(text);
}

function fillDefaults(){
  el("place").value = DEFAULT_PLACE;

  // Heute (Browser)
  const today = new Date();
  el("date").value = toISODate(today);
}

function buildPrint(){
  const studentName = el("studentName").value.trim() || "—";
  const className = el("className").value.trim() || "—";
  const teacherName = el("teacherName").value.trim() || "—";
  const place = el("place").value.trim() || "—";
  const dateISO = el("date").value;
  const dateCH = formatDateCH(dateISO) || "—";

  el("printMeta").textContent = `Name: ${studentName} · Klasse: ${className} · Ort/Datum: ${place}, ${dateCH} · Lehrperson: ${teacherName}`;

  // Text
  el("printText").textContent = el("reportText").value.trim() || "";

  // Bemerkungen Lehrperson: in Linien umsetzen (max. 6–7 Zeilen sinnvoll)
  const remarks = (el("teacherRemarks").value || "").trim();
  const linesWrap = document.createElement("div");
  linesWrap.className = "print__lines";

  if(remarks){
    // Text als Absatz + 2 Linien (für handschriftliche Ergänzung)
    const p = document.createElement("div");
    p.style.whiteSpace = "pre-wrap";
    p.style.marginBottom = "3mm";
    p.textContent = remarks;
    el("printTeacherRemarks").innerHTML = "";
    el("printTeacherRemarks").appendChild(p);

    const ln1 = document.createElement("div"); ln1.className="line";
    const ln2 = document.createElement("div"); ln2.className="line";
    el("printTeacherRemarks").appendChild(ln1);
    el("printTeacherRemarks").appendChild(ln2);
  }else{
    // 3 Linien wie Vorlage (Seite 2) :contentReference[oaicite:4]{index=4}
    el("printTeacherRemarks").innerHTML = `
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    `;
  }
}

async function exportPDF(){
  buildPrint();

  const area = el("printArea");
  const opt = {
    margin:       [0, 0, 0, 0],
    filename:     `Ueberfachliche_Kompetenzen_${(el("studentName").value || "Kind").replaceAll(" ", "_")}.pdf`,
    image:        { type: "jpeg", quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: "mm", format: "a4", orientation: "portrait" }
  };

  await html2pdf().set(opt).from(area).save();
}

/* Diktierfunktion (Web Speech API) */
function makeDictation(buttonEl, targetEl){
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SpeechRecognition){
    buttonEl.disabled = true;
    buttonEl.title = "Diktierfunktion wird von diesem Browser nicht unterstützt.";
    return { start(){}, stop(){} };
  }

  const rec = new SpeechRecognition();
  rec.lang = "de-CH";
  rec.interimResults = true;
  rec.continuous = true;

  let running = false;

  function insertAtCursor(textarea, text){
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? textarea.value.length;
    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);
    textarea.value = before + text + after;
    const pos = start + text.length;
    textarea.setSelectionRange(pos, pos);
    textarea.focus();
  }

  rec.onresult = (event) => {
    let finalText = "";
    let interimText = "";

    for(let i = event.resultIndex; i < event.results.length; i++){
      const t = event.results[i][0].transcript;
      if(event.results[i].isFinal) finalText += t;
      else interimText += t;
    }

    // Wir schreiben nur finalen Text ins Feld (sauberer, weniger Flackern).
    if(finalText){
      const add = finalText.trim().length ? (finalText.trim() + " ") : "";
      insertAtCursor(targetEl, add);
      if(targetEl.id === "reportText") markTouched();
    }
  };

  rec.onerror = () => { /* still */ };

  function start(){
    if(running) return;
    running = true;
    buttonEl.textContent = buttonEl.textContent.replace("🎤", "⏹️");
    rec.start();
  }
  function stop(){
    if(!running) return;
    running = false;
    buttonEl.textContent = buttonEl.textContent.replace("⏹️", "🎤");
    rec.stop();
  }

  buttonEl.addEventListener("click", () => running ? stop() : start());
  return { start, stop };
}

/* Init */
buildRaster();
fillDefaults();
generateText();

el("btnFillStandard").addEventListener("click", setStandardAll);
el("btnGenerate").addEventListener("click", generateText);
el("btnPdf").addEventListener("click", exportPDF);
el("btnCopy").addEventListener("click", copyText);

el("studentName").addEventListener("input", generateText);
el("gender").addEventListener("change", generateText);

// Wenn Lehrperson manuell editiert: nicht mehr automatisch überschreiben
el("reportText").addEventListener("input", markTouched);

// Diktat
makeDictation(el("btnDictateText"), el("reportText"));
makeDictation(el("btnDictateRemarks"), el("teacherRemarks"));
