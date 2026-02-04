const DEFAULT_PLACE = "Wädenswil";
const LEVELS = ["vv","g","ge","u"]; // sehr gut → nicht genügend
const LEVEL_LABEL = { vv:"++", g:"+", ge:"-", u:"--" };
const LEVEL_TEXT  = { vv:"sehr gut", g:"gut", ge:"genügend", u:"nicht genügend" };

// Punkt-Format: {t:"Text", ex:"gruppe"}
function pointText(p){ return p.t || ""; }
function pointEx(p){ return p.ex || null; }

const DATA = [
  {
    group: "Arbeits- und Lernverhalten",
    items: [
      {
        id: "puenktlich",
        title: "Erscheint pünktlich und ordnungsgemäss zum Unterricht",
        levels: {
          vv: { color:"blue", points:[
            {t:"Sitzt bei Beginn der Stunde am Platz", ex:"startplatz"},
            {t:"Ist ruhig bei Beginn der Stunde", ex:"startruhe"},
            {t:"Bringt Material und HA immer vollständig", ex:"materialha"}
          ]},
          g: { color:"green", points:[
            {t:"Sitzt bei Beginn der Stunde am Platz", ex:"startplatz"},
            {t:"Bringt Material und HA vollständig", ex:"materialha"}
          ]},
          ge: { color:"orange", points:[
            {t:"Ist bei Beginn der Stunde im Zimmer, aber noch nicht am Platz", ex:"startplatz"},
            {t:"Bringt Material und HA teilweise vollständig", ex:"materialha"}
          ]},
          u: { color:"red", points:[
            {t:"Kommt nach dem Läuten ins Zimmer", ex:"startplatz"},
            {t:"Bringt Material und HA regelmässig unvollständig", ex:"materialha"}
          ]}
        }
      },
      {
        id: "aktiv",
        title: "Beteiligt sich aktiv am Unterricht",
        levels: {
          vv:{color:"blue",points:[
            {t:"Stellt Fragen", ex:"fragen"},
            {t:"Sucht Lösungen / sucht Wege", ex:"loesungen"},
            {t:"Zeigt grosse Eigeninitiative", ex:"initiative"}
          ]},
          g:{color:"green",points:[
            {t:"Stellt Fragen", ex:"fragen"},
            {t:"Zeigt Eigeninitiative", ex:"initiative"}
          ]},
          ge:{color:"orange",points:[
            {t:"Stellt selten Fragen", ex:"fragen"},
            {t:"Zeigt wenig Eigeninitiative", ex:"initiative"}
          ]},
          u:{color:"red",points:[
            {t:"Stellt keine Fragen", ex:"fragen"},
            {t:"Zeigt keine Eigeninitiative", ex:"initiative"}
          ]}
        }
      },
      {
        id:"konzentriert",
        title:"Arbeitet konzentriert und ausdauernd",
        levels:{
          vv:{color:"blue",points:[
            {t:"Arbeitet konzentriert", ex:"konz"},
            {t:"Arbeitet ausdauernd", ex:"ausd"},
            {t:"Beendet eigenständig die Arbeit", ex:"beendet"}
          ]},
          g:{color:"green",points:[
            {t:"Arbeitet meistens konzentriert", ex:"konz"},
            {t:"Arbeitet meistens ausdauernd", ex:"ausd"},
            {t:"Beendet die Arbeit", ex:"beendet"}
          ]},
          ge:{color:"orange",points:[
            {t:"Arbeitet teilweise konzentriert", ex:"konz"},
            {t:"Lässt sich ablenken", ex:"konz"},
            {t:"Beendet die Arbeit teilweise", ex:"beendet"}
          ]},
          u:{color:"red",points:[
            {t:"Lässt sich bei der Arbeit ablenken", ex:"konz"},
            {t:"Beendet die Arbeit selten", ex:"beendet"}
          ]}
        }
      },
      {
        id:"sorgfalt",
        title:"Gestaltet Arbeiten sorgfältig und zuverlässig",
        levels:{
          vv:{color:"blue",points:[
            {t:"Arbeitet mündlich und schriftlich sorgfältig, zuverlässig und selbständig", ex:"arbeitsqual"},
            {t:"Geht mit dem Material immer korrekt um", ex:"materialumgang"}
          ]},
          g:{color:"green",points:[
            {t:"Arbeitet mündlich und schriftlich oft sorgfältig, zuverlässig und selbständig", ex:"arbeitsqual"},
            {t:"Geht mit dem Material korrekt um", ex:"materialumgang"}
          ]},
          ge:{color:"orange",points:[
            {t:"Arbeitet mündlich und schriftlich teilweise unsorgfältig, unzuverlässig und selten selbständig", ex:"arbeitsqual"},
            {t:"Geht mit dem Material teilweise korrekt um", ex:"materialumgang"}
          ]},
          u:{color:"red",points:[
            {t:"Arbeitet mündlich und schriftlich unsorgfältig, unzuverlässig und selten selbständig", ex:"arbeitsqual"},
            {t:"Geht mit dem Material nicht korrekt um", ex:"materialumgang"}
          ]}
        }
      },
      {
        id:"zusammenarbeit",
        title:"Kann mit anderen zusammenarbeiten",
        levels:{
          vv:{color:"blue",points:[
            {t:"Arbeitet mit allen zusammen", ex:"kooperation"},
            {t:"Hilft anderen", ex:"hilft"},
            {t:"Übernimmt Verantwortung", ex:"verantw"}
          ]},
          g:{color:"green",points:[
            {t:"Arbeitet mit anderen zusammen", ex:"kooperation"},
            {t:"Hilft anderen", ex:"hilft"}
          ]},
          ge:{color:"orange",points:[
            {t:"Hat Schwierigkeiten, mit Andern zusammenzuarbeiten", ex:"kooperation"},
            {t:"Hilft anderen nur mit Aufforderung der LP.", ex:"hilft"}
          ]},
          u:{color:"red",points:[
            {t:"Stört die Zusammenarbeit in der Gruppe", ex:"kooperation"},
            {t:"Hilft anderen nur wenn es sein muss", ex:"hilft"}
          ]}
        }
      },
      {
        id:"selbsteinschaetzung",
        title:"Schätzt die eigene Leistungsfähigkeit realistisch ein",
        levels:{
          vv:{color:"blue",points:[
            {t:"Kennt seine Stärken sehr gut", ex:"staerken"},
            {t:"Kennt seine Schwächen sehr gut", ex:"schwaechen"},
            {t:"Setzt sich Ziele, die erfüllt werden können und herausfordern", ex:"ziele"}
          ]},
          g:{color:"green",points:[
            {t:"Kennt seine Stärken", ex:"staerken"},
            {t:"Kennt seine Schwächen", ex:"schwaechen"},
            {t:"Setzt sich selbst realistische Ziele", ex:"ziele"}
          ]},
          ge:{color:"orange",points:[
            {t:"Kennt seine Stärken teilweise", ex:"staerken"},
            {t:"Kennt seine Schwächen teilweise", ex:"schwaechen"},
            {t:"Braucht Hilfe, um realistische Ziele zu setzen", ex:"ziele"}
          ]},
          u:{color:"red",points:[
            {t:"Kennt seine Stärken nicht", ex:"staerken"},
            {t:"Kennt seine Schwächen nicht", ex:"schwaechen"},
            {t:"Kann sich kaum realistische Ziele setzen", ex:"ziele"}
          ]}
        }
      }
    ]
  },
  {
    group:"Sozialverhalten",
    items:[
      {
        id:"regeln",
        title:"Akzeptiert die Regeln des schulischen Zusammenlebens",
        levels:{
          vv:{color:"blue",points:[
            {t:"Hält Regeln ein", ex:"regeln"},
            {t:"Führt Ämtli selbständig aus", ex:"aemtli"}
          ]},
          g:{color:"green",points:[
            {t:"Hält Regeln ein", ex:"regeln"},
            {t:"Führt Ämtli aus", ex:"aemtli"}
          ]},
          ge:{color:"orange",points:[
            {t:"Hält Regeln nach Aufforderung ein", ex:"regeln"},
            {t:"Führt sein Ämtli bei Aufforderung aus", ex:"aemtli"}
          ]},
          u:{color:"red",points:[
            {t:"Hält Regeln nicht ein", ex:"regeln"},
            {t:"Führt sein Ämtli mit Hilfe aus", ex:"aemtli"}
          ]}
        }
      },
      {
        id:"respekt",
        title:"Begegnet den Lehrpersonen und Mitschülern respektvoll",
        levels:{
          vv:{color:"blue",points:[
            {t:"Begegnet seiner LP äusserst respektvoll", ex:"lp"},
            {t:"Begegnet seinen Mitschülern respektvoll", ex:"ms"}
          ]},
          g:{color:"green",points:[
            {t:"Begegnet seiner LP grundsätzlich respektvoll", ex:"lp"},
            {t:"Begegnet seinen Mitschülern grundsätzlich respektvoll", ex:"ms"}
          ]},
          ge:{color:"orange",points:[
            {t:"Begegnet seiner LP teilweise respektvoll", ex:"lp"},
            {t:"Begegnet seinen Mitschülern teilweise respektvoll", ex:"ms"}
          ]},
          u:{color:"red",points:[
            {t:"Begegnet seiner LP selten respektvoll", ex:"lp"},
            {t:"Begegnet seinen Mitschülern selten respektvoll", ex:"ms"}
          ]}
        }
      }
    ]
  }
];

const el = (id)=>document.getElementById(id);

function toISODate(d){
  const pad=(n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function formatDateCH(iso){
  if(!iso) return "";
  const [y,m,d]=iso.split("-");
  return `${d}.${m}.${y}`;
}
function cap(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
function pronouns(g){
  return (g==="w") ? {subj:"sie",obj:"sie",poss:"ihr",dat:"ihr"} : {subj:"er",obj:"ihn",poss:"sein",dat:"ihm"};
}
function getCycle(className){
  const m=(className||"").match(/\d+/);
  if(!m) return "low";
  const k=parseInt(m[0],10);
  return (k<=4) ? "low" : "high";
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

const state = { checks:{}, overall:{} };
let editorTouched=false;

function ensureItemState(item){
  if(!state.checks[item.id]) state.checks[item.id] = {};
  for(const lk of LEVELS){
    if(!state.checks[item.id][lk]) state.checks[item.id][lk] = {};
  }
  if(!state.overall[item.id]) state.overall[item.id] = "auto";
}

function computeOverallLevel(item){
  const forced = state.overall[item.id];
  if(forced && forced!=="auto") return forced;

  const counts = {};
  for(const lk of LEVELS){
    const m = state.checks[item.id][lk] || {};
    counts[lk] = Object.values(m).filter(Boolean).length;
  }
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  if(total===0) return "g";

  const sorted = LEVELS.map(lk=>({lk,c:counts[lk]})).sort((a,b)=>b.c-a.c);
  const top = sorted[0];
  const tie = sorted.filter(x=>x.c===top.c);
  if(tie.length>1){
    const pref=["g","vv","ge","u"];
    for(const p of pref) if(tie.some(t=>t.lk===p)) return p;
  }
  return top.lk;
}
function currentSelections(){
  const out={};
  DATA.forEach(g=>g.items.forEach(it=>out[it.id]=computeOverallLevel(it)));
  return out;
}

function buildRaster(){
  const root = el("rasterRoot");
  root.innerHTML = "";

  DATA.forEach(group=>{
    const wrap=document.createElement("div");
    wrap.className="group";

    const head=document.createElement("div");
    head.className="group__title";
    head.innerHTML=`<div>${group.group}</div><div class="muted">${group.items.length} Kriterien</div>`;
    wrap.appendChild(head);

    group.items.forEach(item=>{
      ensureItemState(item);

      const block=document.createElement("div");
      block.className="detailItem";

      const top=document.createElement("div");
      top.className="detailTop";
      top.innerHTML=`
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

      const autoLine=document.createElement("div");
      autoLine.className="muted small";
      autoLine.style.marginTop="6px";
      autoLine.innerHTML=`Auto-Berechnung: <strong data-autolabel="${item.id}"></strong>`;
      block.appendChild(autoLine);

      const grid=document.createElement("div");
      grid.className="levelGrid";

      LEVELS.forEach(lk=>{
        const col=document.createElement("div");
        col.className=`levelCol levelCol--${item.levels[lk].color}`;

        const capBox=document.createElement("div");
        capBox.className="levelCap";
        capBox.innerHTML=`
          <div class="levelCap__short">${LEVEL_LABEL[lk]}</div>
          <div class="levelCap__long">${LEVEL_TEXT[lk]}</div>
        `;
        col.appendChild(capBox);

        const list=document.createElement("div");
        list.className="pointList";

        item.levels[lk].points.forEach((p, idx)=>{
          const checked=!!state.checks[item.id][lk][idx];
          const lab=document.createElement("label");
          lab.className="point";
          lab.innerHTML=`
            <input type="checkbox" ${checked?"checked":""}
              data-item="${item.id}" data-level="${lk}" data-idx="${idx}"
              data-ex="${pointEx(p)}">
            <span>${pointText(p)}</span>
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

  // Exklusivlogik: gleicher ex im selben Item => nur ein Häkchen (über alle Levels)
  root.querySelectorAll('input[type="checkbox"][data-item]').forEach(cb=>{
    cb.addEventListener("change",(e)=>{
      const t=e.target;
      const itemId=t.dataset.item;
      const lk=t.dataset.level;
      const idx=Number(t.dataset.idx);
      const ex=t.dataset.ex || null;

      state.checks[itemId][lk][idx] = t.checked;

      if(t.checked && ex){
        const item = DATA.flatMap(g=>g.items).find(it=>it.id===itemId);
        if(item){
          LEVELS.forEach(otherLk=>{
            item.levels[otherLk].points.forEach((p, otherIdx)=>{
              if(pointEx(p)===ex && !(otherLk===lk && otherIdx===idx)){
                state.checks[itemId][otherLk][otherIdx]=false;
                const sel=`input[data-item="${itemId}"][data-level="${otherLk}"][data-idx="${otherIdx}"]`;
                const box=root.querySelector(sel);
                if(box) box.checked=false;
              }
            });
          });
        }
      }

      refreshAutoLabels();
      if(!editorTouched) generateText();
    });
  });

  root.querySelectorAll('select[data-overall]').forEach(sel=>{
    sel.value = state.overall[sel.dataset.overall] || "auto";
    sel.addEventListener("change",(e)=>{
      state.overall[e.target.dataset.overall]=e.target.value;
      refreshAutoLabels();
      if(!editorTouched) generateText();
    });
  });

  refreshAutoLabels();
}

function refreshAutoLabels(){
  DATA.flatMap(g=>g.items).forEach(item=>{
    const backup=state.overall[item.id];
    state.overall[item.id]="auto";
    const auto=computeOverallLevel(item);
    state.overall[item.id]=backup;

    const node=document.querySelector(`[data-autolabel="${item.id}"]`);
    if(node) node.textContent=`${LEVEL_LABEL[auto]} (${LEVEL_TEXT[auto]})`;
  });
}

function buildProfessionalText(ctx, levels){
  const { name, P, cycle } = ctx;
  const L=(id)=>levels[id] || "g";

  const intro = (cycle==="low")
    ? `${name} zeigt in den überfachlichen Kompetenzen insgesamt ein ${mod("stimmiges")} Bild. Die folgenden Beobachtungen beschreiben, wie ${P.subj} den Schulalltag bewältigt.`
    : `${name} zeigt in den überfachlichen Kompetenzen insgesamt ein ${mod("differenziertes")} Profil. Die folgenden Ausführungen geben Auskunft über das Arbeits-, Lern- und Sozialverhalten im Schulalltag.`;

  const text = `
${intro}

${cap(P.subj)} erscheint zu Unterrichtsbeginn ${weich(L("puenktlich"))} startbereit und organisiert. Material und Hausaufgaben sind ${weich(L("puenktlich"))} vollständig vorhanden.${kritisch(L("puenktlich"))}

Im Unterricht beteiligt sich ${name} ${weich(L("aktiv"))} aktiv. ${cap(P.subj)} zeigt Interesse, bringt Beiträge ein und übernimmt ${sicher(L("aktiv"))} Eigeninitiative.${kritisch(L("aktiv"))}

Bei der Bearbeitung von Aufgaben arbeitet ${name} ${weich(L("konzentriert"))} konzentriert und bleibt ${sicher(L("konzentriert"))} bei der Sache.${kritisch(L("konzentriert"))}

Arbeiten führt ${name} ${weich(L("sorgfalt"))} sorgfältig aus. Die Ergebnisse zeigen, dass ${P.subj} ${sicher(L("sorgfalt"))} und zuverlässig arbeitet.${kritisch(L("sorgfalt"))}

In Gruppen arbeitet ${name} ${weich(L("zusammenarbeit"))} kooperativ mit anderen zusammen und kann Verantwortung übernehmen.${kritisch(L("zusammenarbeit"))}

Regeln des schulischen Zusammenlebens hält ${name} ${weich(L("regeln"))} ein und erledigt vereinbarte Aufgaben ${sicher(L("regeln"))}.${kritisch(L("regeln"))}

Im Umgang mit anderen begegnet ${name} seinen Mitmenschen ${weich(L("respekt"))} respektvoll.${kritisch(L("respekt"))}

${name} schätzt die eigene Leistungsfähigkeit ${weich(L("selbsteinschaetzung"))} realistisch ein und kann Ziele ${sicher(L("selbsteinschaetzung"))} formulieren.${kritisch(L("selbsteinschaetzung"))}
`.trim();

  return text;
}

function setEditorHTML(html){ el("reportEditor").innerHTML = html; }
function getEditorPlainText(){
  const tmp=document.createElement("div");
  tmp.innerHTML = el("reportEditor").innerHTML;
  return (tmp.innerText||"").trim();
}
function generateText(){
  const name = el("studentName").value.trim() || "Das Kind";
  const P = pronouns(el("gender").value);
  const cycle = getCycle(el("className").value);
  const levels = currentSelections();
  const text = buildProfessionalText({name,P,cycle}, levels);
  setEditorHTML(text.split("\n").map(l=>l===""?"<br>":l).join("<br>"));
}

/* ===== Copilot (A+B+C) ===== */
function buildAiPrompt(text, remarks){
  const cycle=getCycle(el("className").value);
  const tone=(cycle==="low") ? "wärmer, ermutigend, kindzentriert" : "sachlich, arbeitszeugnisnah, professionell";

  return `
Du bist eine Lehrperson und formulierst einen Beurteilungstext im Stil eines professionellen Arbeitszeugnisses (Schweiz).

AUFTRAG:
Formuliere sprachlich präziser, klarer und flüssiger (${tone}).

ZWINGEND:
- Inhaltliche Kongruenz: Keine neuen Informationen hinzufügen, nichts weglassen, keine Wertung verändern.
- Keine medizinischen oder diagnostischen Begriffe erfinden.
- Keine Bulletpoints, sondern Absätze.
- Schweizer Rechtschreibung.
- Kritisch, aber wohlwollend.
- Der Kommentar der Lehrperson ist Teil des Textes und soll ebenfalls geglättet werden.
- Gib das Ergebnis in exakt zwei Blöcken aus (ohne Zusatzkommentar):
  AUSWERTUNG:
  ...
  KOMMENTAR:
  ...

AUSGANGSTEXT:
${text}

KOMMENTAR DER LEHRPERSON:
${(remarks && remarks.trim()) ? remarks.trim() : "(kein zusätzlicher Kommentar)"}
`.trim();
}

function showOverlay(){ el("aiOverlay").hidden=false; }
function hideOverlay(){ el("aiOverlay").hidden=true; }

async function copyPromptAndText(){
  const prompt = buildAiPrompt(getEditorPlainText(), el("teacherRemarks").value || "");
  await navigator.clipboard.writeText(prompt);
  showOverlay();
}
function openCopilot(){
  copyPromptAndText().then(()=> window.open("https://copilot.microsoft.com","_blank"));
}
function localCleanTextAndRemarks(){
  const replacePairs = [
    [/\s+\n/g, "\n"],
    [/\n{3,}/g, "\n\n"],
    [/\s{2,}/g, " "],
    [/ ,/g, ","],
    [/ \./g, "."],
    [/oft/gi, "häufig"],
    [/manchmal/gi, "gelegentlich"],
    [/selten/gi, "vereinzelt"],
    [/hat noch mühe/gi, "zeigt noch Entwicklungsbedarf"],
    [/noch nicht so gut/gi, "noch unsicher"],
  ];

  let txt = (el("reportEditor").innerText || "");
  replacePairs.forEach(([a,b])=> txt = txt.replace(a,b));
  setEditorHTML(txt.split("\n").map(l=>l===""?"<br>":l).join("<br>"));
  editorTouched=true;

  let rem = (el("teacherRemarks").value || "");
  replacePairs.forEach(([a,b])=> rem = rem.replace(a,b));
  el("teacherRemarks").value = rem;
}

/* ===== PDF ===== */
function buildPrintTables(selections){
  const headerRight = `
    <div class="zHeaderRight">
      <div class="rot"><span>${LEVEL_TEXT.vv}</span></div>
      <div class="rot"><span>${LEVEL_TEXT.g}</span></div>
      <div class="rot"><span>${LEVEL_TEXT.ge}</span></div>
      <div class="rot"><span>${LEVEL_TEXT.u}</span></div>
    </div>
  `;

  function rowHTML(item){
    const chosen = selections[item.id] || "g";
    const marks = LEVELS.map(lk => `<div class="${lk===chosen ? "mark mark--on" : "mark"}"></div>`).join("");
    return `<div class="zRowLeft">${item.title}</div><div class="zRowRight">${marks}</div>`;
  }
  function table(group){
    return `<div></div>${headerRight}` + group.items.map(rowHTML).join("");
  }

  el("printTableArbeits").innerHTML = table(DATA[0]);
  el("printTableSozial").innerHTML  = table(DATA[1]);
}

function collectSelectedPoints(item){
  const out = { vv:[], g:[], ge:[], u:[] };
  LEVELS.forEach(lk=>{
    const m=state.checks[item.id][lk]||{};
    item.levels[lk].points.forEach((p, idx)=>{
      if(m[idx]) out[lk].push(pointText(p));
    });
  });
  return out;
}

function buildPrintDetails(selections){
  const include = !!el("pdfIncludeDetails").checked;
  const wrap = el("printDetailsWrap");
  const box  = el("printDetails");

  if(!include){ wrap.hidden=true; box.innerHTML=""; return; }
  wrap.hidden=false;

  const parts=[];
  DATA.forEach(group=>{
    group.items.forEach(item=>{
      const chosen = selections[item.id] || "g";
      const selPts = collectSelectedPoints(item);

      const byLevel = LEVELS
        .map(lk=>({lk, list: selPts[lk]}))
        .filter(x=>x.list.length>0);

      const lines = (byLevel.length===0)
        ? `<div class="dLine"><span class="dLabel">Ausgewählt:</span> (keine Detailpunkte markiert)</div>`
        : byLevel.map(x=>{
            const label = `${LEVEL_TEXT[x.lk]} (${LEVEL_LABEL[x.lk]})`;
            return `<div class="dLine"><span class="dLabel">${label}:</span> ${x.list.join("; ")}</div>`;
          }).join("");

      parts.push(`
        <div class="dItem">
          <div class="dTitle">${item.title} — <span style="font-weight:700;color:#333">${LEVEL_TEXT[chosen]} (${LEVEL_LABEL[chosen]})</span></div>
          ${lines}
        </div>
      `);
    });
  });

  box.innerHTML = parts.join("");
}

function buildPrint(){
  const studentName = el("studentName").value.trim() || "—";
  const className   = el("className").value.trim()   || "—";
  const teacherName = el("teacherName").value.trim() || "—";
  const place       = el("place").value.trim()       || "—";
  const dateCH      = formatDateCH(el("date").value) || "—";

  const head = `Name: ${studentName} · Klasse: ${className} · Ort/Datum: ${place}, ${dateCH} · Lehrperson: ${teacherName}`;
  el("printHead").textContent = head;
  el("printHead2").textContent = head;

  el("sigTeacherCap").textContent = (teacherName && teacherName!=="—") ? `Lehrperson: ${teacherName}` : "Lehrperson";

  const selections = currentSelections();
  buildPrintTables(selections);
  buildPrintDetails(selections);

  const includeDetails = !!el("pdfIncludeDetails").checked;
  const t = el("printText");
  const r = el("printTeacherRemarks");
  t.classList.remove("clampA","clampB");
  r.classList.remove("linesA","linesB");
  t.classList.add(includeDetails ? "clampB" : "clampA");
  r.classList.add(includeDetails ? "linesB" : "linesA");

  el("printText").textContent = getEditorPlainText();

  const remarks=(el("teacherRemarks").value||"").trim();
  if(remarks){
    r.innerHTML = "";
    const p=document.createElement("div");
    p.style.whiteSpace="pre-wrap";
    p.style.marginBottom="3mm";
    p.style.fontSize="10.2pt";
    p.textContent=remarks;
    r.appendChild(p);
    r.insertAdjacentHTML("beforeend", `<div class="line"></div>`);
  } else {
    r.innerHTML = includeDetails
      ? `<div class="line"></div><div class="line"></div>`
      : `<div class="line"></div><div class="line"></div><div class="line"></div>`;
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

async function renderPageToCanvas(pageEl){
  const clone = pageEl.cloneNode(true);
  const staging=document.createElement("div");
  staging.style.position="fixed";
  staging.style.left="0";
  staging.style.top="0";
  staging.style.zIndex="999999";
  staging.style.background="#fff";
  staging.style.pointerEvents="none";
  staging.appendChild(clone);
  document.body.appendChild(staging);

  await new Promise(r=>requestAnimationFrame(r));
  await new Promise(r=>setTimeout(r,140));

  try{
    return await window.html2canvas(clone,{
      backgroundColor:"#ffffff",
      scale:2,
      useCORS:true,
      allowTaint:false,
      logging:false
    });
  } finally {
    document.body.removeChild(staging);
  }
}

async function exportRealPDF(){
  buildPrint();
  const jsPDF=getJsPDF();
  if(!jsPDF) throw new Error("jsPDF nicht verfügbar.");

  const pages=Array.from(document.querySelectorAll("#printArea .printPage"));
  if(pages.length!==2) throw new Error("Printbereich muss genau 2 Seiten enthalten.");

  const pdf=new jsPDF("p","mm","a4");
  const pageW=210;

  for(let i=0;i<pages.length;i++){
    const canvas=await renderPageToCanvas(pages[i]);
    const imgData=canvas.toDataURL("image/jpeg",0.98);
    const imgW=pageW;
    const imgH=(canvas.height*imgW)/canvas.width;

    pdf.addImage(imgData,"JPEG",0,0,imgW,imgH);
    if(i<pages.length-1) pdf.addPage();
  }

  const filename=`Ueberfachliche_Kompetenzen_${(el("studentName").value||"Kind").trim().replaceAll(" ","_")}.pdf`;
  pdf.save(filename);
}

function openPrintView(){
  buildPrint();
  const printHTML=document.querySelector("#printArea").innerHTML;
  const base=location.href.replace(/[^/]+$/,"");
  const cssHref=base+"styles.css";

  const w=window.open("","_blank");
  w.document.write(`
    <!doctype html>
    <html><head>
      <meta charset="utf-8">
      <title>Überfachliche Kompetenzen</title>
      <link rel="stylesheet" href="${cssHref}">
      <style>
        body{margin:0;background:#fff}
        .printArea--offscreen{position:static !important;left:auto !important;top:auto !important}
      </style>
    </head>
    <body onload="window.print()">${printHTML}</body></html>
  `);
  w.document.close();
}

async function handlePdfClick(){
  // ✅ Garantiert: Button tut immer etwas (Export oder Print-Fallback)
  try{
    if(canUseRealPdf()){
      await exportRealPDF();
      return;
    }
    throw new Error("html2canvas/jsPDF nicht geladen.");
  } catch(err){
    console.error("PDF Export Fehler:", err);
    alert("PDF Export nicht möglich (Bibliotheken nicht geladen oder Fehler). Es öffnet sich nun die Druckansicht als Fallback.");
    openPrintView();
  }
}

/* ===== Diktat ===== */
function makeDictationEditable(buttonEl, targetEl){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){buttonEl.disabled=true;return;}
  const rec=new SR();
  rec.lang="de-CH"; rec.interimResults=false; rec.continuous=true;
  let running=false;

  function insertText(text){
    targetEl.focus();
    const sel=window.getSelection();
    if(!sel||sel.rangeCount===0){ targetEl.insertAdjacentText("beforeend", text); return; }
    const range=sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    sel.removeAllRanges(); sel.addRange(range);
  }
  rec.onresult=(event)=>{
    let out="";
    for(let i=event.resultIndex;i<event.results.length;i++){
      if(event.results[i].isFinal) out += event.results[i][0].transcript;
    }
    if(out && out.trim()){ insertText(out.trim()+" "); editorTouched=true; }
  };
  buttonEl.addEventListener("click", ()=>{
    if(running){ running=false; buttonEl.textContent="🎤 Diktat"; rec.stop(); }
    else{ running=true; buttonEl.textContent="⏹️ Stopp"; rec.start(); }
  });
}

function makeDictationTextarea(buttonEl, textarea){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){buttonEl.disabled=true;return;}
  const rec=new SR();
  rec.lang="de-CH"; rec.interimResults=false; rec.continuous=true;
  let running=false;

  function insertAtCursor(text){
    const start=textarea.selectionStart ?? textarea.value.length;
    const end=textarea.selectionEnd ?? textarea.value.length;
    textarea.value = textarea.value.slice(0,start)+text+textarea.value.slice(end);
    const pos=start+text.length;
    textarea.setSelectionRange(pos,pos);
    textarea.focus();
  }
  rec.onresult=(event)=>{
    let out="";
    for(let i=event.resultIndex;i<event.results.length;i++){
      if(event.results[i].isFinal) out += event.results[i][0].transcript;
    }
    if(out && out.trim()) insertAtCursor(out.trim()+" ");
  };
  buttonEl.addEventListener("click", ()=>{
    if(running){ running=false; buttonEl.textContent="🎤 Diktat"; rec.stop(); }
    else{ running=true; buttonEl.textContent="⏹️ Stopp"; rec.start(); }
  });
}

/* ===== Utilities ===== */
function fillDefaults(){
  el("place").value=DEFAULT_PLACE;
  el("date").value=toISODate(new Date());
}
function resetStandard(){
  DATA.forEach(g=>g.items.forEach(item=>{
    ensureItemState(item);
    state.overall[item.id]="auto";
    for(const lk of LEVELS) state.checks[item.id][lk]={};
  }));
  editorTouched=false;
  buildRaster();
  generateText();
}
function regenerateOverwrite(){
  editorTouched=false;
  generateText();
}
async function copyPlain(){
  await navigator.clipboard.writeText(getEditorPlainText());
}

/* ===== Init ===== */
DATA.forEach(g=>g.items.forEach(ensureItemState));
buildRaster();
fillDefaults();
generateText();

el("reportEditor").addEventListener("input", ()=>{ editorTouched=true; });

["studentName","className","gender"].forEach(id=>{
  el(id).addEventListener("input", ()=>{ if(!editorTouched) generateText(); });
});
el("gender").addEventListener("change", ()=>{ if(!editorTouched) generateText(); });

el("btnReset").addEventListener("click", resetStandard);
el("btnRegen").addEventListener("click", regenerateOverwrite);
el("btnPdf").addEventListener("click", handlePdfClick);
el("btnCopy").addEventListener("click", copyPlain);

el("btnAiCopy").addEventListener("click", copyPromptAndText);
el("btnAiOpen").addEventListener("click", openCopilot);
el("btnAiClean").addEventListener("click", localCleanTextAndRemarks);

el("btnOverlayClose").addEventListener("click", hideOverlay);
el("aiOverlay").addEventListener("click",(e)=>{ if(e.target===el("aiOverlay")) hideOverlay(); });
el("btnOverlayCopyAgain").addEventListener("click", copyPromptAndText);
el("btnOverlayOpenCopilot").addEventListener("click", ()=>window.open("https://copilot.microsoft.com","_blank"));

makeDictationEditable(el("btnDictateText"), el("reportEditor"));
makeDictationTextarea(el("btnDictateRemarks"), el("teacherRemarks"));
