'use strict';

// Pure functions are also exposed to the local verification script (no dependencies).
const Workshop = (() => {
  const builtin = [
    {id:'llm',category:'KI-Grundlagen',question:'Was ist ein Large Language Model (LLM)?',answer:'Ein auf großen Textmengen trainiertes Modell, das aus einem Kontext wahrscheinliche nächste Tokens erzeugt. Es kann Texte verarbeiten und formulieren, garantiert aber weder Faktenrichtigkeit noch belastbares Schlussfolgern.',example:'BWL-Praxis: Einen Lieferantenbericht zusammenfassen und die Aussagen anschließend an der Originalquelle prüfen.'},
    {id:'harness',category:'KI-Grundlagen',question:'Was leistet der Harness rund um ein KI-Modell?',answer:'Der Harness ist die ausführende Umgebung: Er verbindet Modell, Werkzeuge, Regeln, Kontext und Prüfungen zu einem Arbeitsablauf. Das Modell allein ist noch kein vollständiger Agent.',example:'BWL-Praxis: Ein Agent darf einen Kapazitätsbericht lesen und eine Empfehlung entwerfen; der Harness verlangt vor dem Versand eine menschliche Freigabe.'},
    {id:'rag',category:'KI-Grundlagen',question:'Wie funktioniert Retrieval-Augmented Generation (RAG)?',answer:'Zunächst werden passende Inhalte aus einer Wissensquelle gesucht. Diese Inhalte werden dem Modell als Kontext für die Antwort gegeben. RAG verändert nicht automatisch die Modellgewichte und kann fehlerhafte Quellen oder Antworten nicht ausschließen.',example:'BWL-Praxis: Eine Frage zu einer Lieferantenvereinbarung anhand ausgewählter Vertragspassagen beantworten und Fundstellen angeben.'},
    {id:'memory',category:'KI-Grundlagen',question:'Was bedeutet „Memory“ bei einem KI-Assistenten?',answer:'Memory speichert ausgewählte Informationen über einzelne Interaktionen hinaus und bringt sie später wieder in den Kontext ein. Es ist von kurzfristigem Kontext und vom Training zu unterscheiden. Umfang, Zugriff und Löschung sollten bewusst festgelegt sein.',example:'BWL-Praxis: Die bevorzugte Berichtsstruktur merken, aber keine vertraulichen Lieferantendaten ungefragt dauerhaft speichern.'},
    {id:'injection',category:'Sicherheit & Recht',question:'Was ist eine Prompt Injection?',answer:'Nicht vertrauenswürdige Inhalte versuchen, ein KI-System zu unerwünschten Handlungen zu bewegen, etwa über Anweisungen in einer Webseite oder Datei. Externe Inhalte sind Daten, keine Berechtigung. Begrenzte Werkzeugrechte und Freigaben reduzieren das Risiko.',example:'BWL-Praxis: Ein Lieferanten-PDF fordert den Agenten auf, interne Daten zu versenden. Diese Anweisung darf den eigentlichen Auftrag nicht ersetzen.'},
    {id:'tokens',category:'BWL & Wirtschaft',question:'Warum gehören Input- und Output-Tokens in die Kostenrechnung?',answer:'Tokens sind Textbausteine. Bei vielen APIs werden Eingabe und erzeugte Ausgabe separat bepreist. Lange Kontexte, viele Wiederholungen und umfangreiche Antworten erhöhen das Volumen. Ein Token entspricht nicht immer einem Wort.',example:'BWL-Praxis: 1 Mio. Input-Tokens zu 5 € plus 0,2 Mio. Output-Tokens zu 15 € ergeben 8 € Tokenkosten. Die Preise sind nur ein Rechenbeispiel.'},
    {id:'aiact',category:'Sicherheit & Recht',question:'Welches Grundprinzip verfolgt der EU AI Act?',answer:'Der EU AI Act verfolgt einen risikobasierten Ansatz: Bestimmte Praktiken sind verboten, für Hochrisiko-Systeme gelten besondere Pflichten und für bestimmte Anwendungen Transparenzpflichten. Konkrete Pflichten hängen unter anderem von Zweck und Rolle des Unternehmens ab.',example:'BWL-Praxis: Vor einer KI-Einführung den Einsatzzweck, betroffene Personen, Verantwortlichkeiten und einschlägige Pflichten prüfen. Lernüberblick, keine Rechtsberatung; Quellenstand: 29.10.2026.'},
    {id:'roi',category:'BWL & Wirtschaft',question:'Wann amortisiert sich eine KI-Investition?',answer:'Im einfachen statischen Modell: wenn die kumulierte positive Nettoersparnis den einmaligen Einführungsaufwand deckt. Die Amortisationsdauer ist Einmalaufwand geteilt durch monatliche Nettoersparnis. Ohne positive Nettoersparnis gibt es in diesem Modell keine Amortisation.',example:'BWL-Praxis: 1.500 € Einführung und 300 € monatliche Nettoersparnis ergeben 5 Monate. Zeitgewinn ist nur bei sinnvoller Nutzung auch ein wirtschaftlicher Nutzen.'},
    {id:'quality',category:'BWL & Wirtschaft',question:'Warum ist das günstigste Modell nicht immer die wirtschaftlichste Wahl?',answer:'Entscheidend sind Gesamtkosten und nutzbare Qualität: Modellkosten, Infrastruktur, menschliche Prüfung, Fehlerfolgen und Integration. Ein teureres Modell kann bei geringerem Nachbearbeitungsaufwand wirtschaftlicher sein.',example:'BWL-Praxis: Zwei Modelle mit denselben typischen Fällen testen und akzeptierte Ergebnisse, Zeitaufwand und Kosten gemeinsam bewerten.'},
    {id:'human',category:'Sicherheit & Recht',question:'Was bedeutet Human-in-the-Loop im Geschäftsprozess?',answer:'Ein Mensch prüft oder bestätigt definierte Schritte, bevor sie ausgeführt werden. Die Freigabe sollte verständlich zeigen, was mit welchen Daten für wen geschieht. Besonders wichtig ist das bei folgenreichen oder schwer rückgängig zu machenden Aktionen.',example:'BWL-Praxis: Ein Agent entwirft eine Nachricht zur Kapazitätsanpassung; die zuständige Person prüft Inhalt und Empfänger und gibt den Versand ausdrücklich frei.'}
  ];
  const limits = {
    tasks:[0,10000,1000], minutes:[0,120,12], hourly:[0,200,40], tokens:[100,50000,4000], inputShare:[0,100,75],
    frontInput:[0,1000,5], frontOutput:[0,1000,15], frontGain:[0,100,65], frontFixed:[0,1000000,20], frontSetup:[0,10000000,1500],
    miniInput:[0,1000,.2], miniOutput:[0,1000,.8], miniGain:[0,100,45], miniFixed:[0,1000000,60], miniSetup:[0,10000000,1000]
  };
  function defaults() { return {schemaVersion:1,customCards:[],progress:{},notes:'',theme:'system',calculator:Object.fromEntries(Object.entries(limits).map(([key,value])=>[key,value[2]]))}; }
  function calculate(values) {
    const hours = values.tasks * values.minutes / 60;
    const baseline = hours * values.hourly;
    const strategies = {};
    for (const prefix of ['front','mini']) {
      const tokens = values.tasks * values.tokens / 1000000 * (values.inputShare / 100 * values[prefix+'Input'] + (1-values.inputShare/100) * values[prefix+'Output']);
      const total = baseline * (1-values[prefix+'Gain']/100) + tokens + values[prefix+'Fixed'];
      const net = baseline - total;
      const setup = values[prefix+'Setup'];
      strategies[prefix] = {tokens,total,net,payback:net>0?setup/net:null,roi:setup>0?(12*net-setup)/setup*100:null};
    }
    return {baseline,hours,...strategies};
  }
  function validate(data) {
    const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
    const text = (value,max) => typeof value === 'string' && value.length <= max;
    if (!object(data) || data.schemaVersion!==1) throw Error('Unbekanntes Dateiformat oder nicht unterstützte Backup-Version.');
    if (!Array.isArray(data.customCards) || data.customCards.length>200) throw Error('Maximal 200 eigene Karten sind erlaubt.');
    const customCards = data.customCards.map(card=>{
      if (!object(card) || !/^custom-[a-zA-Z0-9-]{1,80}$/.test(card.id) || !text(card.question,500) || !card.question.trim() || !text(card.answer,3000) || !card.answer.trim() || !text(card.example,1500)) throw Error('Eine eigene Karte ist ungültig. Frage und Antwort sind erforderlich.');
      return {id:card.id,category:'Eigene Karten',question:card.question.trim(),answer:card.answer.trim(),example:card.example.trim()};
    });
    const validIDs = new Set([...builtin,...customCards].map(card=>card.id));
    if (validIDs.size!==builtin.length+customCards.length) throw Error('Doppelte Karten-IDs im Backup.');
    if (!object(data.progress)) throw Error('Der Lernstand ist ungültig.');
    const progress = {};
    for (const [id,value] of Object.entries(data.progress)) {
      if (!validIDs.has(id) || !object(value) || !['known','repeat'].includes(value.status) || !Number.isSafeInteger(value.reviews) || value.reviews<0 || value.reviews>1000000000) throw Error('Ein Lernstand-Eintrag ist ungültig.');
      progress[id] = {status:value.status,reviews:value.reviews};
    }
    if (!text(data.notes,50000)) throw Error('Notizen dürfen maximal 50.000 Zeichen enthalten.');
    if (!['system','light','dark'].includes(data.theme)) throw Error('Ungültige Design-Einstellung.');
    if (!object(data.calculator)) throw Error('Rechnerannahmen fehlen.');
    const calculator = {};
    for (const [key,[min,max]] of Object.entries(limits)) {
      const value = data.calculator[key];
      if (typeof value!=='number' || !Number.isFinite(value) || value<min || value>max) throw Error('Ungültiger Rechnerwert: '+key);
      // Range inputs must round-trip without the browser silently changing imported values.
      const steps={tasks:50,minutes:1,hourly:1,tokens:100,inputShare:5,frontGain:1,miniGain:1,frontFixed:1,miniFixed:1,frontSetup:1,miniSetup:1};
      if (steps[key] && Math.abs((value-min)/steps[key]-Math.round((value-min)/steps[key]))>1e-7) throw Error('Ungültige Schieberegler-Schrittweite: '+key);
      if (Math.abs(value*100-Math.round(value*100))>1e-5) throw Error('Rechnerwerte dürfen maximal zwei Nachkommastellen haben.');
      calculator[key]=value;
    }
    return {schemaVersion:1,customCards,progress,notes:data.notes,theme:data.theme,calculator};
  }
  return {builtin,limits,defaults,calculate,validate};
})();

if (typeof module!=='undefined' && module.exports) module.exports=Workshop;
if (typeof document!=='undefined') (()=>{
  const $ = id=>document.getElementById(id);
  const key='ki-lernwerkstatt:v1:'+new URL('./',location.href).pathname;
  const euro = new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:2});
  const number = new Intl.NumberFormat('de-DE',{maximumFractionDigits:1});
  let state=Workshop.defaults(), storageBlocked=false, pendingImport=null, pendingDelete=null, deck=[], cursor=0, revealed=false;
  let notifyTimer, saveTimer, calcTimer;
  function notify(message) { $('toast').textContent=message; $('toast').hidden=false; clearTimeout(notifyTimer); notifyTimer=setTimeout(()=>$('toast').hidden=true,4500); }
  function storageWarning(message) { $('storage-warning').textContent=message; $('storage-warning').hidden=false; $('save-state').textContent='Nur in dieser Sitzung'; }
  try {
    const raw=localStorage.getItem(key);
    if (raw!==null) {
      try { state=Workshop.validate(JSON.parse(raw)); }
      catch (_) { storageBlocked=true; storageWarning('Vorhandene Daten konnten nicht gelesen werden und bleiben unverändert. Diese Sitzung nutzt einen neuen Lernstand. Exportiere ihn oder importiere ein gültiges Backup, um die Speicherung wieder zu aktivieren.'); }
    }
  } catch (_) { storageWarning('Dieser Browser erlaubt gerade keine lokale Speicherung. Deine Daten bleiben in dieser Sitzung nutzbar. Bitte sichere sie über JSON exportieren.'); }
  function save() {
    clearTimeout(saveTimer);
    if (storageBlocked) return false;
    try { localStorage.setItem(key,JSON.stringify(state)); $('storage-warning').hidden=true; $('save-state').textContent='Lokal gespeichert'; return true; }
    catch (_) { storageWarning('Speichern nicht möglich: Browser-Speicher gesperrt oder voll. Bitte JSON-Backup exportieren; Änderungen bleiben nur in dieser Sitzung erhalten.'); return false; }
  }
  const cards = ()=>[...Workshop.builtin,...state.customCards];
  function buildDeck(preserveID) {
    deck=cards().filter(card=>($('category').value==='all'||card.category===$('category').value)&&(!$('only-open').checked||state.progress[card.id]?.status!=='known'));
    cursor=Math.max(0,deck.findIndex(card=>card.id===preserveID)); renderCard();
  }
  function renderProgress() {
    const all=cards(), known=all.filter(card=>state.progress[card.id]?.status==='known').length;
    $('mastered-count').textContent=known; $('total-count').textContent=all.length;
    $('learning-progress').max=all.length; $('learning-progress').value=known;
  }
  function renderCard() {
    revealed=false; $('answer-area').hidden=true; $('card-side').textContent='FRAGE'; $('reveal').setAttribute('aria-expanded','false');
    const card=deck[cursor];
    $('empty-cards').hidden=!!card; $('reveal').hidden=!card;
    $('card-question').hidden=!card; $('card-question').textContent=card?.question||'';
    $('card-topic').textContent=card?.category||'Lernpause';
    $('card-counter').textContent=card?`Karte ${cursor+1} von ${deck.length}`:'Keine Karten im Filter';
    $('card-answer').textContent=card?.answer||'';
    $('card-example').textContent=card?.example||''; $('card-example').hidden=!card?.example;
    $('reveal').textContent='Antwort aufdecken ↗';
    $('repeat').disabled=true; $('known').disabled=true;
    $('previous').disabled=deck.length<2; $('next').disabled=deck.length<2;
    $('delete-card').hidden=!card?.id.startsWith('custom-');
    const progress=card&&state.progress[card.id];
    $('card-state').textContent=progress?`${progress.status==='known'?'Sicher':'Noch üben'} · ${progress.reviews} Bewertungen`:(card?'Noch nicht bewertet':'Alle sicheren Karten bleiben im Filter „Alle Themen“ verfügbar.');
    renderProgress();
  }
  function move(delta) { if (!deck.length) return; cursor=(cursor+delta+deck.length)%deck.length; renderCard(); }
  $('reveal').addEventListener('click',()=>{
    if (!deck[cursor]) return;
    revealed=!revealed; $('answer-area').hidden=!revealed; $('card-side').textContent=revealed?'FRAGE & ANTWORT':'FRAGE';
    $('reveal').textContent=revealed?'Antwort verbergen':'Antwort aufdecken ↗'; $('reveal').setAttribute('aria-expanded',String(revealed));
    $('repeat').disabled=!revealed; $('known').disabled=!revealed;
  });
  function rate(status) {
    const card=deck[cursor]; if (!card||!revealed) return;
    const reviews=Math.min(1000000000,(state.progress[card.id]?.reviews||0)+1);
    state.progress[card.id]={status,reviews}; save();
    if ($('only-open').checked&&status==='known') { deck.splice(cursor,1); cursor=deck.length?cursor%deck.length:0; renderCard(); }
    else move(1);
    notify(status==='known'?'Als sicher markiert.':'Zum Weiterüben markiert.');
  }
  $('known').addEventListener('click',()=>rate('known')); $('repeat').addEventListener('click',()=>rate('repeat'));
  $('previous').addEventListener('click',()=>move(-1)); $('next').addEventListener('click',()=>move(1));
  $('category').addEventListener('change',()=>buildDeck()); $('only-open').addEventListener('change',()=>buildDeck());
  $('shuffle').addEventListener('click',()=>{for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}cursor=0;renderCard();notify('Reihenfolge gemischt.');});
  $('add-card').addEventListener('click',()=>{
    if (state.customCards.length>=200) return notify('Maximal 200 eigene Karten. Exportiere dein Backup, bevor du Karten entfernst.');
    $('card-form').reset();$('card-error').textContent='';$('card-dialog').showModal();
  });
  $('card-form').addEventListener('submit',event=>{
    event.preventDefault();const question=$('new-question').value.trim(),answer=$('new-answer').value.trim();
    if (!question||!answer) { $('card-error').textContent='Bitte eine Frage und eine Antwort eingeben.';return; }
    const id='custom-'+(globalThis.crypto?.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
    state.customCards.push({id,category:'Eigene Karten',question,answer,example:$('new-example').value.trim()});
    save();$('category').value='Eigene Karten';$('only-open').checked=false;buildDeck(id);$('card-dialog').close();notify('Eigene Karte hinzugefügt.');
  });
  $('delete-card').addEventListener('click',()=>{const card=deck[cursor];if (!card?.id.startsWith('custom-'))return;pendingDelete=card.id;$('delete-summary').textContent=card.question;$('delete-dialog').showModal();});
  $('confirm-delete').addEventListener('click',()=>{if (!pendingDelete)return;state.customCards=state.customCards.filter(card=>card.id!==pendingDelete);delete state.progress[pendingDelete];pendingDelete=null;save();buildDeck();$('delete-dialog').close();notify('Eigene Karte gelöscht.');});
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  $('import-dialog').addEventListener('close',()=>pendingImport=null);
  $('delete-dialog').addEventListener('close',()=>pendingDelete=null);

  const media=matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {const dark=state.theme==='dark'||(state.theme==='system'&&media.matches);document.documentElement.dataset.theme=dark?'dark':'light';$('theme').setAttribute('aria-pressed',String(dark));$('theme').setAttribute('aria-label',dark?'Hellen Modus aktivieren':'Dunklen Modus aktivieren');document.querySelector('meta[name="theme-color"]').content=dark?'#102027':'#24666A';}
  $('theme').addEventListener('click',()=>{state.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';applyTheme();save();});
  media.addEventListener('change',()=>{if(state.theme==='system')applyTheme();});

  function renderCalc() {
    const values={};let invalid=false;
    for(const [name,[min,max]] of Object.entries(Workshop.limits)){
      const field=$(name),value=field.valueAsNumber;
      if(!field.value.trim()||!Number.isFinite(value)||value<min||value>max||!field.checkValidity()){invalid=true;field.setAttribute('aria-invalid','true');}
      else {values[name]=value;field.removeAttribute('aria-invalid');}
      if($(name+'-out'))$(name+'-out').textContent=Number.isFinite(value)?number.format(value)+(name==='hourly'?' €':name.endsWith('Gain')||name==='inputShare'?' %':''):'—';
    }
    $('calc-error').hidden=!invalid;
    if(invalid){$('calc-error').textContent='Bitte gültige, nicht negative Werte innerhalb der angegebenen Feldgrenzen eingeben.';for(const prefix of ['front','mini'])for(const suffix of ['net','token','total','payback','roi'])$(prefix+'-'+suffix).textContent='—';$('baseline-cost').textContent='—';$('baseline-hours').textContent='';return;}
    state.calculator=values;save();const result=Workshop.calculate(values);
    $('baseline-cost').textContent=euro.format(result.baseline);$('baseline-hours').textContent=number.format(result.hours)+' Arbeitsstunden / Monat';
    for(const prefix of ['front','mini']){const model=result[prefix];$(prefix+'-net').textContent=euro.format(model.net);$(prefix+'-net').classList.toggle('negative',model.net<0);$(prefix+'-token').textContent=euro.format(model.tokens);$(prefix+'-total').textContent=euro.format(model.total);$(prefix+'-payback').textContent=model.payback===null?'Keine Amortisation':model.payback===0?'Sofort (kein Einmalaufwand)':model.payback>0&&model.payback<.1?'< 0,1 Monate':number.format(model.payback)+' Monate';$(prefix+'-roi').textContent=model.roi===null?'Nicht definiert':number.format(model.roi)+' %';}
    clearTimeout(calcTimer);calcTimer=setTimeout(()=>$('calc-announcement').textContent=`Monatliche Nettoersparnis: Frontier ${euro.format(result.front.net)}, Mini oder Lokal ${euro.format(result.mini.net)}.`,600);
  }
  document.querySelectorAll('[data-calc]').forEach(field=>field.addEventListener('input',renderCalc));
  function fillFields() {for(const [name,value]of Object.entries(state.calculator))$(name).value=value;$('notes').value=state.notes;renderNoteCount();applyTheme();renderCalc();buildDeck();}
  function renderNoteCount(){$('note-count').textContent=number.format(state.notes.length)+' / 50.000 Zeichen';}
  $('notes').addEventListener('input',()=>{state.notes=$('notes').value;renderNoteCount();$('save-state').textContent=storageBlocked?'Nur in dieser Sitzung':'Wird gespeichert …';clearTimeout(saveTimer);saveTimer=setTimeout(save,350);});
  addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});

  $('export').addEventListener('click',()=>{
    // Export only validated state; calculator edits in progress keep the last valid scenario.
    try {const data={...Workshop.validate(state),exportedAt:new Date().toISOString()};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ki-lernwerkstatt-backup-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);$('backup-message').textContent='Backup zum Download bereitgestellt. Prüfe deinen Download-Ordner.';}
    catch(_){$('backup-message').textContent='Backup konnte nicht erstellt werden. Bitte versuche es erneut.';}
  });
  $('import').addEventListener('change',async event=>{
    const file=event.target.files[0];event.target.value='';if(!file)return;
    try {if(file.size>2000000)throw Error('Die Datei ist größer als 2 MB.');const candidate=Workshop.validate(JSON.parse(await file.text()));pendingImport=candidate;const mastered=Object.values(candidate.progress).filter(item=>item.status==='known').length;$('import-summary').textContent=`Geprüft: ${candidate.customCards.length} eigene Karten, ${mastered} sichere Karten, ${number.format(candidate.notes.length)} Zeichen Notizen und vollständige Rechnerannahmen.`;$('import-dialog').showModal();}
    catch(error){$('backup-message').textContent='Import abgelehnt: '+(error instanceof SyntaxError?'Keine gültige JSON-Datei.':error.message);pendingImport=null;}
  });
  $('confirm-import').addEventListener('click',()=>{if(!pendingImport)return;state=pendingImport;pendingImport=null;storageBlocked=false;$('category').value='all';$('only-open').checked=false;fillFields();const persisted=save();$('import-dialog').close();$('backup-message').textContent=persisted?'Backup übernommen und lokal gespeichert.':'Backup für diese Sitzung übernommen. Lokale Speicherung nicht verfügbar.';notify('Backup übernommen.');});

  let installPrompt=null;
  addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
  $('install').addEventListener('click',async()=>{if(installPrompt){const prompt=installPrompt;installPrompt=null;await prompt.prompt();await prompt.userChoice;}else $('install-dialog').showModal();});
  $('install-help').addEventListener('click',()=>$('install-dialog').showModal());
  addEventListener('appinstalled',()=>{installPrompt=null;notify('App installiert. Deine Lernwerkstatt ist startklar.');});
  let offlineReady=false,workerRegistration=null;
  function connection(){ $('connection').textContent=offlineReady?(navigator.onLine?'Offline bereit':'Offline · bereit'):(navigator.onLine?'Offline-Modus wird vorbereitet':'Offline noch nicht bereit'); }
  addEventListener('online',connection);addEventListener('offline',connection);
  function showUpdate(reg){if(reg.waiting){workerRegistration=reg;$('update-banner').hidden=false;}}
  $('update-app').addEventListener('click',()=>{save();workerRegistration?.waiting?.postMessage({type:'SKIP_WAITING'});});
  if('serviceWorker'in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
    let refreshing=false;
    navigator.serviceWorker.addEventListener('controllerchange',()=>{if(workerRegistration?.waiting||!$('update-banner').hidden){if(!refreshing){refreshing=true;location.reload();}}});
    navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).then(reg=>{
      showUpdate(reg);reg.addEventListener('updatefound',()=>{const installing=reg.installing;installing?.addEventListener('statechange',()=>{if(installing.state==='installed')showUpdate(reg);});});
      return navigator.serviceWorker.ready;
    }).then(()=>{offlineReady=true;connection();}).catch(()=>{$('connection').textContent='Offline-Modus nicht verfügbar';notify('Offline-Cache konnte nicht eingerichtet werden. Bitte online neu laden.');});
  }else{$('connection').textContent='Für Offline bitte HTTPS / localhost nutzen';}
  fillFields();if('serviceWorker'in navigator&&location.protocol!=='file:')connection();
})();
