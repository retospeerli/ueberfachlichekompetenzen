/* app.js – Überfachliche Kompetenzen (final, komplett)
   Änderung in dieser Version (genau diese):
   - Nuancen/Ergänzungssätze pro Bewertungsstufe (vv/g bestätigend, ge/u unterstützend)
   - nuanceSentence(key, level, seed, cycle) + Anpassung der Aufrufe in buildProfessionalText()

   Alles andere bleibt wie zuvor:
   - Overlay: NUR Hover >3s über Copilot-Button, immer schliessbar (X, Background, ESC)
   - Exklusivlogik über ex (keine Widersprüche)
   - PDF: 2 Seiten; html2canvas/jsPDF, sonst Print-Fallback
*/

const DEFAULT_PLACE = "Wädenswil";
const LEVELS = ["vv","g","ge","u"];
const LEVEL_LABEL = { vv:"++", g:"+", ge:"-", u:"--" };
const LEVEL_TEXT  = { vv:"sehr gut", g:"gut", ge:"genügend", u:"nicht genügend" };

function el(id){ return document.getElementById(id); }
function cap(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : s; }
function mod(w){ return `<span class="mod">${w}</span>`; }

function toISODate(d){
  const pad=(n)=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function formatDateCH(iso){
  if(!iso) return "";
  const [y,m,d]=iso.split("-");
  return `${d}.${m}.${y}`;
}
function pronouns(g){
  return (g==="w") ? {subj:"sie",obj:"sie",poss:"ihr",dat:"ihr"} : {subj:"er",obj:"ihn",poss:"sein",dat:"ihm"};
}
function getCycle(className){
  const m=(className||"").match(/\d+/);
  if(!m) return "low";
  const k=parseInt(m[0],10);
  return (k<=4) ? "low" : "high";
}

function pointText(p){ return p.t || ""; }
function pointEx(p){ return p.ex || null; }

/* ===== DATA (unverändert) ===== */
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

/* ===== State ===== */
const state = { checks:{}, overall:{} };
let editorTouched = false;

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
  const out = {};
  DATA.forEach(g=>g.items.forEach(it=> out[it.id] = computeOverallLevel(it)));
  return out;
}

/* ===== UI: Raster ===== */
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

  // Checkbox + Exklusiv (pro itemId + ex)
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

  // Override
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

/* ===== Text-Engine v3 (gut = ohne unnötige Weichmacher) + Nuancen pro Stufe ===== */

function pickStable(list, seedStr){
  let h = 2166136261;
  for(let i=0;i<seedStr.length;i++){
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return list[Math.abs(h) % list.length];
}

function freqPhrase(level, seed){
  if(level === "g") return ""; // gut = keine Weichmacher

  const vv = ["durchwegs", "konsequent", "ausnahmslos", "in jeder Situation"];
  const ge = ["teilweise", "phasenweise", "stellenweise", "nicht immer", "noch nicht durchgehend", "mit Schwankungen"];
  const u  = ["selten", "kaum", "nur vereinzelt", "noch nicht verlässlich", "noch nicht ausreichend", "nur sporadisch"];
  const bank = (level==="vv") ? vv : (level==="ge") ? ge : u;
  return mod(pickStable(bank, seed));
}

function qualityWord(level, seed){
  const vv = ["sehr sicher", "äusserst zuverlässig", "mit hoher Selbstständigkeit", "überzeugend"];
  const g  = ["zuverlässig", "sicher", "selbstständig", "gut"];
  const ge = ["noch nicht durchgehend sicher", "mit Unterstützung", "mit wechselnder Sicherheit", "noch etwas unsicher"];
  const u  = ["klar unterstützungsbedürftig", "noch deutlich unsicher", "nur mit enger Begleitung", "noch nicht ausreichend"];
  const bank = level==="vv"?vv : level==="g"?g : level==="ge"?ge : u;
  return mod(pickStable(bank, seed));
}

function supportHint(level, seed){
  if(level==="vv" || level==="g") return "";

  const ge = [
    `Gelegentlich braucht ${mod("es")} eine kurze Erinnerung oder eine klare Struktur, damit ${mod("die Ausführung")} gelingt.`,
    `Mit einer kurzen Orientierung (z.B. Schrittfolge, Zeitrahmen) gelingen die Anforderungen ${mod("zuverlässiger")}.`,
    `In anspruchsvolleren Situationen hilft eine gezielte Rückfrage oder ein Zwischenziel.`,
    `Eine klare Aufgabenstruktur unterstützt, damit ${mod("Konstanz")} entsteht.`
  ];
  const u = [
    `Hier ist ${mod("regelmässig")} Unterstützung nötig, damit Anforderungen verstanden und umgesetzt werden.`,
    `Es braucht ${mod("deutlich")} mehr Begleitung und Kontrolle, damit Arbeitsschritte zuverlässig abgeschlossen werden.`,
    `Aktuell ist eine engere Führung hilfreich (z.B. Teilaufträge, häufige Rückmeldeschlaufen).`,
    `Damit Fortschritte stabil werden, sind klare Abmachungen und konsequentes Einfordern notwendig.`
  ];
  return " " + (level==="ge" ? pickStable(ge, seed) : pickStable(u, seed));
}

function sentenceLowHigh(low, high, cycle){
  return (cycle==="low") ? low : high;
}

// Nuancen v2: pro Bewertungsstufe passend
const NUANCE = {
  puenktlich: {
    vv: [
      "Er startet ruhig und geordnet in den Unterricht und behält seine Materialien zuverlässig im Griff.",
      "Der Unterrichtsbeginn gelingt ihm konstant strukturiert; Material und Abmachungen sind verlässlich geregelt."
    ],
    g: [
      "Er startet in der Regel geordnet; eine klare Startstruktur unterstützt diesen guten Einstieg zusätzlich.",
      "Der Unterrichtsbeginn gelingt ihm stabil – feste Abläufe helfen, diese Qualität beizubehalten."
    ],
    ge: [
      "Eine klare Startstruktur (z.B. kurzer Check von Material/HA) hilft, den Einstieg zuverlässiger zu gestalten.",
      "Mit festen Routinen zu Beginn gelingt ein ruhiger Start zunehmend verlässlicher."
    ],
    u: [
      "Für einen verlässlichen Unterrichtsbeginn braucht es klare Rituale, Kontrolle von Material/HA und konsequente Rückmeldung.",
      "Ein verbindlicher Startablauf mit klaren Erwartungen ist nötig, damit Material und Abmachungen zuverlässig eingehalten werden."
    ]
  },

  aktiv: {
    vv: [
      "Er bringt seine Gedanken sehr klar ein, stellt passende Fragen und bereichert Gespräche spürbar.",
      "Er beteiligt sich konstant engagiert und übernimmt Verantwortung für sein Lernen mit hoher Eigeninitiative."
    ],
    g: [
      "Er bringt sich aktiv ein und zeigt Interesse; offene Fragen klärt er zunehmend selbstständig.",
      "Seine Beiträge sind passend und hilfreich – dieses aktive Mitdenken ist eine klare Stärke."
    ],
    ge: [
      "Gezielte Impulse (z.B. Leitfragen) unterstützen, damit er sich häufiger einbringt und seine Ideen sichtbarer werden.",
      "Mit klaren Gesprächsregeln und kurzen Denkpausen kann er seine Beiträge sicherer formulieren."
    ],
    u: [
      "Damit er sich beteiligt, braucht es regelmässige Ansprache, klare Fragen und kurze, erreichbare Beteiligungsziele.",
      "Eine verbindliche Beteiligungsstruktur (z.B. Meldezeichen, kurze Teilaufträge) ist nötig, damit er aktiv mitarbeitet."
    ]
  },

  konzentriert: {
    vv: [
      "Er bleibt auch bei längeren Arbeitsphasen konzentriert und zeigt eine ausgeprägte Ausdauer.",
      "Er arbeitet sehr fokussiert und kann seine Aufmerksamkeit konstant auf die Aufgabe richten."
    ],
    g: [
      "Er arbeitet konzentriert und hält den Fokus gut; klare Zwischenziele helfen, diese Stärke weiter auszubauen.",
      "Er bleibt zuverlässig bei der Sache – mit einer passenden Zeiteinteilung gelingt ihm die Arbeit besonders rund."
    ],
    ge: [
      "Kurze Etappen, sichtbare Zwischenziele und kurze Rückmeldeschlaufen helfen, den Fokus stabiler zu halten.",
      "Eine ruhige Arbeitsatmosphäre und klare Schrittfolgen unterstützen seine Ausdauer spürbar."
    ],
    u: [
      "Damit er konzentriert arbeiten kann, braucht es engere Führung, kurze Teilaufträge und häufige Rückmeldungen.",
      "Klare Struktur (Schrittfolge, Zeitrahmen) und konsequentes Einfordern sind nötig, damit Aufgaben zuverlässig abgeschlossen werden."
    ]
  },

  sorgfalt: {
    vv: [
      "Er arbeitet sehr sorgfältig; seine Ergebnisse sind durchgehend sauber, vollständig und gut nachvollziehbar.",
      "Er zeigt eine hohe Verlässlichkeit in der Ausführung und geht verantwortungsvoll mit Material um."
    ],
    g: [
      "Er arbeitet sorgfältig und liefert verlässliche Ergebnisse; kurze Selbstkontrollen helfen, die Qualität konstant hoch zu halten.",
      "Seine Ergebnisse sind gut nachvollziehbar – das gezielte Überprüfen rundet seine Arbeit zusätzlich ab."
    ],
    ge: [
      "Checklisten und kurze Selbstkontrollen unterstützen, damit seine Ergebnisse vollständiger und sorgfältiger werden.",
      "Mit klaren Qualitätskriterien (z.B. nochmals lesen/prüfen) gelingt die Ausführung verlässlicher."
    ],
    u: [
      "Damit sorgfältige Arbeit gelingt, braucht es klare Kriterien, häufige Kontrolle und verbindliche Rückmeldungen.",
      "Eine enge Begleitung (Teilkontrollen, Checkliste) ist nötig, damit Ergebnisse vollständiger und zuverlässiger werden."
    ]
  },

  zusammenarbeit: {
    vv: [
      "Er arbeitet sehr kooperativ, übernimmt Verantwortung und trägt aktiv zu einem guten Gruppenklima bei.",
      "Er unterstützt andere umsichtig und findet auch in wechselnden Gruppen schnell eine passende Rolle."
    ],
    g: [
      "Er arbeitet kooperativ und übernimmt Verantwortung; klare Rollen fördern eine weiterhin reibungslose Zusammenarbeit.",
      "Er trägt verlässlich zur Gruppenarbeit bei und kann Absprachen gut einhalten."
    ],
    ge: [
      "Klare Rollen und Absprachen helfen, damit die Zusammenarbeit konstanter gelingt und Aufgaben besser verteilt werden.",
      "Mit konkreten Zuständigkeiten und kurzen Absprachen kann er seine Rolle in der Gruppe sicherer erfüllen."
    ],
    u: [
      "Für gelingende Zusammenarbeit braucht es klare Rollen, enge Begleitung und konsequentes Einfordern von Absprachen.",
      "Ein verbindlicher Rahmen (Rolle, Auftrag, Gesprächsregeln) ist nötig, damit Gruppenarbeit nicht beeinträchtigt wird."
    ]
  },

  regeln: {
    vv: [
      "Er hält Regeln konsequent ein und übernimmt Aufgaben zuverlässig – auch in dynamischen Situationen.",
      "Er zeigt eine sehr gute Selbststeuerung und richtet sein Verhalten klar an Abmachungen aus."
    ],
    g: [
      "Er hält Regeln ein und setzt Abmachungen zuverlässig um; klare Erwartungen unterstützen die Konstanz zusätzlich.",
      "Er orientiert sich gut an Vereinbarungen und erledigt Aufgaben verlässlich."
    ],
    ge: [
      "Klare Abmachungen und konsequente Rückmeldungen helfen, damit Regeln und Aufgaben verlässlicher eingehalten werden.",
      "In unruhigen Situationen unterstützen klare Signale und kurze Erinnerungen die Umsetzung von Regeln."
    ],
    u: [
      "Damit Regeln eingehalten werden, braucht es klare Abmachungen, engere Begleitung und konsequente Rückmeldung bei Regelverstössen.",
      "Ein verbindlicher Rahmen mit klaren Konsequenzen ist nötig, damit Abmachungen und Aufgaben zuverlässig umgesetzt werden."
    ]
  },

  respekt: {
    vv: [
      "Er begegnet anderen durchwegs respektvoll und kommuniziert auch bei Unterschieden sehr fair.",
      "Er nimmt Rückmeldungen sehr gut an und setzt sie sichtbar in seinem Verhalten um."
    ],
    g: [
      "Er begegnet anderen respektvoll und kann Rückmeldungen gut aufnehmen – das trägt zu einem positiven Miteinander bei.",
      "Seine Kommunikation ist in der Regel fair; kleine Klärungen helfen, Missverständnisse rasch aufzulösen."
    ],
    ge: [
      "Kurze Klärungen und klare Gesprächsregeln helfen, damit der respektvolle Umgang konstanter gelingt.",
      "Gezielte Rückmeldungen unterstützen, damit er Rücksicht und respektvolle Kommunikation zuverlässiger zeigt."
    ],
    u: [
      "Für einen respektvollen Umgang braucht es klare Gesprächsregeln, engere Begleitung und konsequente Rückmeldung bei Grenzüberschreitungen.",
      "Ein verbindlicher Rahmen und direkte Klärung sind nötig, damit respektvolle Kommunikation verlässlich gelingt."
    ]
  },

  selbsteinschaetzung: {
    vv: [
      "Er reflektiert seine Leistungen sehr realistisch und kann Ziele klar setzen und konsequent verfolgen.",
      "Er kennt seine Stärken und Entwicklungsfelder gut und nutzt Rückmeldungen sehr zielgerichtet."
    ],
    g: [
      "Er schätzt seine Leistungen realistisch ein und kann Ziele gut formulieren; kurze Zwischenfeedbacks unterstützen die Zielarbeit zusätzlich.",
      "Er kann eigene Fortschritte gut einschätzen und richtet seine nächsten Schritte zunehmend zielorientiert aus."
    ],
    ge: [
      "Zwischenziele und kurze Rückmeldungen helfen, damit er seine Leistungen sicherer einschätzen und realistischere Ziele setzen kann.",
      "Mit klaren Kriterien gelingt es ihm besser, Stärken und Entwicklungsfelder zu erkennen und passende Ziele zu formulieren."
    ],
    u: [
      "Damit eine realistische Selbsteinschätzung gelingt, braucht es klare Kriterien, engere Begleitung und regelmässige Rückmeldungen.",
      "Ein strukturierter Zielprozess (kleine Schritte, häufiges Feedback) ist nötig, damit Ziele realistisch und erreichbar werden."
    ]
  }
};

function nuanceSentence(key, level, seed, cycle){
  const bank = NUANCE[key]?.[level] || [];
  if(!bank.length) return "";
  return " " + pickStable(bank, seed + "|" + level + "|" + cycle);
}

function withFreq(level, seed, phrase){
  const f = freqPhrase(level, seed);
  return f ? phrase.replace("{F}", f) : phrase.replace("{F} ", "").replace(" {F}", "");
}

function buildProfessionalText(ctx, levels){
  const { name, P, cycle } = ctx;
  const L = (id)=>levels[id] || "g";
  const seedBase = `${name}|${cycle}`;

  const intro = sentenceLowHigh(
    `${name} zeigt in den überfachlichen Kompetenzen insgesamt ein ${mod("stimmiges")} Bild. Die folgenden Beobachtungen beschreiben, wie ${P.subj} den Schulalltag bewältigt.`,
    `${name} zeigt in den überfachlichen Kompetenzen insgesamt ein ${mod("differenziertes")} Profil. Die folgenden Ausführungen beschreiben das Arbeits-, Lern- und Sozialverhalten im Schulalltag.`,
    cycle
  );

  const p1 = (() => {
    const lv = L("puenktlich");
    const q  = qualityWord(lv, seedBase+"|p1q");
    const s1 = withFreq(lv, seedBase+"|p1f", `${cap(P.subj)} ist zu Unterrichtsbeginn {F} startbereit und wirkt gut organisiert.`);
    const s2 = (lv==="g" || lv==="vv")
      ? `Material und Hausaufgaben sind vollständig vorhanden; Abmachungen werden ${q} eingehalten.`
      : `Material und Hausaufgaben sind nicht immer vollständig vorhanden; Abmachungen werden ${q} eingehalten.`;
    return `${s1} ${s2}${nuanceSentence("puenktlich", lv, seedBase+"|n1", cycle)}${supportHint(lv, seedBase+"|p1h")}`;
  })();

  const p2 = (() => {
    const lv = L("aktiv");
    const q  = qualityWord(lv, seedBase+"|p2q");
    const s1 = withFreq(lv, seedBase+"|p2f", `Im Unterricht beteiligt sich ${name} {F}.`);
    const s2 = `Er zeigt Interesse, bringt passende Beiträge ein und übernimmt ${q} Eigeninitiative.`;
    return `${s1} ${s2}${nuanceSentence("aktiv", lv, seedBase+"|n2", cycle)}${supportHint(lv, seedBase+"|p2h")}`;
  })();

  const p3 = (() => {
    const lv = L("konzentriert");
    const q  = qualityWord(lv, seedBase+"|p3q");
    const s1 = withFreq(lv, seedBase+"|p3f", `Bei der Bearbeitung von Aufgaben arbeitet ${name} {F} konzentriert und bleibt ${q} bei der Sache.`);
    const s2 = (lv==="u")
      ? `Über längere Zeit gelingt Ausdauer aktuell ${q}.`
      : `Auch über längere Zeit kann er ${q} dranbleiben.`;
    return `${s1} ${s2}${nuanceSentence("konzentriert", lv, seedBase+"|n3", cycle)}${supportHint(lv, seedBase+"|p3h")}`;
  })();

  const p4 = (() => {
    const lv = L("sorgfalt");
    const q  = qualityWord(lv, seedBase+"|p4q");
    const s1 = withFreq(lv, seedBase+"|p4f", `Aufträge führt ${name} {F} sorgfältig aus.`);
    const s2 = `Die Ergebnisse zeigen, dass er ${q} arbeitet und mit Material verantwortungsvoll umgeht.`;
    return `${s1} ${s2}${nuanceSentence("sorgfalt", lv, seedBase+"|n4", cycle)}${supportHint(lv, seedBase+"|p4h")}`;
  })();

  const p5 = (() => {
    const lv = L("zusammenarbeit");
    const q  = qualityWord(lv, seedBase+"|p5q");
    const s1 = withFreq(lv, seedBase+"|p5f", `In Partner- und Gruppenarbeiten arbeitet ${name} {F} kooperativ mit anderen zusammen.`);
    const s2 = `Er kann Verantwortung übernehmen und unterstützt andere ${q}.`;
    return `${s1} ${s2}${nuanceSentence("zusammenarbeit", lv, seedBase+"|n5", cycle)}${supportHint(lv, seedBase+"|p5h")}`;
  })();

  const p6 = (() => {
    const lv = L("regeln");
    const q  = qualityWord(lv, seedBase+"|p6q");
    const s1 = withFreq(lv, seedBase+"|p6f", `${name} hält Regeln des schulischen Zusammenlebens {F} ein.`);
    const s2 = `Vereinbarte Aufgaben werden ${q} erledigt.`;
    return `${s1} ${s2}${nuanceSentence("regeln", lv, seedBase+"|n6", cycle)}${supportHint(lv, seedBase+"|p6h")}`;
  })();

  const p7 = (() => {
    const lv = L("respekt");
    const q  = qualityWord(lv, seedBase+"|p7q");
    const s1 = withFreq(lv, seedBase+"|p7f", `Im Umgang mit Lehrpersonen und Mitschülerinnen und Mitschülern verhält sich ${name} {F} respektvoll.`);
    const s2 = `Er kann Rückmeldungen ${q} aufnehmen und im Verhalten umsetzen.`;
    return `${s1} ${s2}${nuanceSentence("respekt", lv, seedBase+"|n7", cycle)}${supportHint(lv, seedBase+"|p7h")}`;
  })();

  const p8 = (() => {
    const lv = L("selbsteinschaetzung");
    const q  = qualityWord(lv, seedBase+"|p8q");
    const s1 = withFreq(lv, seedBase+"|p8f", `${name} schätzt die eigene Leistungsfähigkeit {F} realistisch ein.`);
    const s2 = `Ziele kann er ${q} formulieren und daran arbeiten.`;
    return `${s1} ${s2}${nuanceSentence("selbsteinschaetzung", lv, seedBase+"|n8", cycle)}${supportHint(lv, seedBase+"|p8h")}`;
  })();

  const outro = sentenceLowHigh(
    `Insgesamt zeigt ${name} viele Ressourcen.`,
    `Insgesamt zeigt ${name} ein solides Arbeits- und Sozialverhalten.`,
    cycle
  );

  return [intro,"",p1,"",p2,"",p3,"",p4,"",p5,"",p6,"",p7,"",p8,"",outro].join("\n").trim();
}

/* ===== Editor ===== */
function setEditorHTML(html){ el("reportEditor").innerHTML = html; }
function getEditorPlainText(){
  const tmp=document.createElement("div");
  tmp.innerHTML = el("reportEditor").innerHTML;
  return (tmp.innerText || "").trim();
}

function generateText(){
  const name = el("studentName").value.trim() || "Das Kind";
  const P = pronouns(el("gender").value);
  const cycle = getCycle(el("className").value);
  const levels = currentSelections();
  const text = buildProfessionalText({name,P,cycle}, levels);
  setEditorHTML(text.split("\n").map(l=>l===""?"<br>":l).join("<br>"));
}

/* ===== Copilot ===== */
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

async function copyPromptOnly(){
  const prompt = buildAiPrompt(getEditorPlainText(), el("teacherRemarks").value || "");
  await navigator.clipboard.writeText(prompt);
}

async function handleAiCopyClick(){
  try{
    await copyPromptOnly();
    alert("Prompt + Text wurden kopiert. Jetzt in Copilot einfügen (Ctrl+V).");
  }catch(err){
    console.error(err);
    alert("Kopieren nicht möglich. Prüfe Browser-Berechtigungen für Zwischenablage.");
  }
}

async function openCopilot(){
  try{ await copyPromptOnly(); } catch(e){ console.error(e); }
  window.open("https://copilot.microsoft.com","_blank");
}

function localCleanTextAndRemarks(){
  const pairs = [
    [/\s+\n/g, "\n"],
    [/\n{3,}/g, "\n\n"],
    [/\s{2,}/g, " "],
    [/ ,/g, ","],
    [/ \./g, "."],
    [/oft/gi, "häufig"],
    [/manchmal/gi, "gelegentlich"],
    [/selten/gi, "vereinzelt"]
  ];

  let txt = (el("reportEditor").innerText || "");
  pairs.forEach(([a,b])=> txt = txt.replace(a,b));
  setEditorHTML(txt.split("\n").map(l=>l===""?"<br>":l).join("<br>"));
  editorTouched=true;

  let rem = (el("teacherRemarks").value || "");
  pairs.forEach(([a,b])=> rem = rem.replace(a,b));
  el("teacherRemarks").value = rem;
}

/* ===== Overlay: robust (class toggling + capture click) ===== */
let copilotHoverTimer = null;

function openOverlay(){
  const ov = el("aiOverlay");
  ov.classList.add("is-open");
  ov.setAttribute("aria-hidden","false");
}
function closeOverlay(){
  const ov = el("aiOverlay");
  ov.classList.remove("is-open");
  ov.setAttribute("aria-hidden","true");
}

function setupOverlay(){
  const btn = el("btnAiOpen");
  const overlay = el("aiOverlay");

  btn.addEventListener("mouseenter", ()=>{
    clearTimeout(copilotHoverTimer);
    copilotHoverTimer = setTimeout(openOverlay, 3000);
  });
  btn.addEventListener("mouseleave", ()=>{
    clearTimeout(copilotHoverTimer);
    copilotHoverTimer = null;
  });

  document.addEventListener("keydown", (e)=>{
    if(e.key==="Escape") closeOverlay();
  });

  document.addEventListener("click", (e)=>{
    if(!overlay.classList.contains("is-open")) return;

    const closeHit = e.target.closest('[data-close="copilot"]');
    const isBackdrop = e.target.classList && e.target.classList.contains("overlay__backdrop");

    if(closeHit || isBackdrop){
      e.preventDefault();
      e.stopPropagation();
      closeOverlay();
    }
  }, true);

  el("btnOverlayOpenCopilot").addEventListener("click", ()=> window.open("https://copilot.microsoft.com","_blank"));
  el("btnOverlayCopyAgain").addEventListener("click", async ()=>{
    try{
      await copyPromptOnly();
      alert("Prompt + Text wurden nochmals kopiert.");
    }catch(err){
      console.error(err);
      alert("Kopieren nicht möglich (Zwischenablage-Berechtigung).");
    }
  });
}

/* ===== Print/PDF ===== */
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

      const byLevel = LEVELS.map(lk=>({lk, list: selPts[lk]})).filter(x=>x.list.length>0);

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

/* ===== Misc ===== */
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
setupOverlay();

el("reportEditor").addEventListener("input", ()=>{ editorTouched=true; });

["studentName","className","gender"].forEach(id=>{
  el(id).addEventListener("input", ()=>{ if(!editorTouched) generateText(); });
});
el("gender").addEventListener("change", ()=>{ if(!editorTouched) generateText(); });

el("btnReset").addEventListener("click", resetStandard);
el("btnRegen").addEventListener("click", regenerateOverwrite);
el("btnPdf").addEventListener("click", handlePdfClick);
el("btnCopy").addEventListener("click", copyPlain);

el("btnAiCopy").addEventListener("click", handleAiCopyClick);
el("btnAiOpen").addEventListener("click", openCopilot);
el("btnAiClean").addEventListener("click", localCleanTextAndRemarks);

makeDictationEditable(el("btnDictateText"), el("reportEditor"));
makeDictationTextarea(el("btnDictateRemarks"), el("teacherRemarks"));
