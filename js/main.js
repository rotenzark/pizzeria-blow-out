/* PLUMBING_V 4 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'pizzeria-blow-out', // usato per localStorage lang
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    hours: {
      0: [['10:00', '21:00']],
      1: [['10:00', '21:00']],
      2: [['10:00', '21:00']],
      3: [['10:00', '21:00']],
      4: [['10:00', '21:00']],
      5: [['10:00', '21:00']],
      6: [['10:00', '21:00']]
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 2800,
    revealSelector: '.reveal',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       Forma storica a due lingue, resta valida e invariata. */
    EN: {
      "i.t": "Double tomato.",
      "i.skip": "Skip",
      "m.top": "Pizzeria Blow Out, back to the top",
      "m.sub": "pizza by the slice · since 1990",
      "m.nav": "Sections",
      "m.lingua": "Language",
      "m.lightbox": "Enlarged photo",
      "m.chiudi": "Close",
      "n.pomodoro": "The tomato",
      "n.gusti": "Toppings",
      "n.impasto": "The dough",
      "n.specialita": "Specialties",
      "n.banco": "The counter",
      "n.orari": "Hours & where",
      "n.domande": "Questions",
      "n.chiama": "Call",
      "n.menu": "Open the menu",
      "h.kicker": "Pizza by the slice · Via Lorenteggio 163 · since 1990",
      "h.t": "Double<br>tomato.",
      "h.p": "Those who know us order their slice like this: with more sauce on top. Thick pizza, soft inside and crisp underneath, by the slice or by the whole tray. And then panzerotti, stuffed focaccia, scorzette. On the corner of Largo dei Gelsomini, since 1990.",
      "h.chiama": "Call 02 4837 5035",
      "h.indicazioni": "Directions",
      "h.badge": "<b>4.6 on Google</b> with 889 reviews · «pizza al trancio» is the phrase you write most",
      "h.zoom": "Enlarge the photo of the tomato tray",
      "h.alt": "A tray of pizza covered in tomato sauce and oregano",
      "h.fig": "a tray with tomato (photo from the Google listing)",
      "p.liv": "On top · the tomato",
      "p.t": "First of all, the sauce.",
      "p.p1": "In the reviews the sauce keeps coming back, and people talk about it with passion: «sugo» (sauce) is one of the words Google counts in the 889 reviews. And someone found a way to get more of it.",
      "p.cit": "«to enjoy it at its best, I recommend double tomato»",
      "p.cit2": "from a Google review",
      "p.p2": "Double tomato isn't a separate flavour: it's a slice with more sauce on top. Just ask for it at the counter.",
      "p.zoom": "Enlarge the photo of the sauce",
      "p.alt": "A bowl of tomato sauce with a ladle, next to a tray of panzerotti and a stuffed pie",
      "p.fig": "the sauce bowl, the panzerotti, a stuffed pie (photo from the Google listing)",
      "g.zoom": "Enlarge the photo of the toppings",
      "g.alt": "Slices with different toppings side by side: cherry tomatoes and olives, ham, salami, mushrooms, onion",
      "g.fig": "slices with different toppings, side by side (photo from the Google listing)",
      "g.liv": "On top · the toppings",
      "g.t": "Nineteen toppings, by the slice or by the tray.",
      "g.p1": "These are the ones on our menu. Each one comes by the slice, or as a whole tray to take home.",
      "g.1": "Tomato",
      "g.2": "Margherita",
      "g.3": "Marinara",
      "g.4": "Olives",
      "g.5": "Cooked ham",
      "g.6": "Napoli",
      "g.7": "Rocket",
      "g.8": "Rocket and cherry tomatoes",
      "g.9": "Ham and mushrooms",
      "g.10": "Four seasons",
      "g.11": "Tuna",
      "g.12": "Tuna and onion",
      "g.13": "Spicy salami",
      "g.14": "Würstel",
      "g.15": "Four cheeses",
      "g.16": "Vegetarian",
      "g.17": "Capricciosa",
      "g.18": "Gorgonzola",
      "g.19": "Double mozzarella",
      "g.nota": "What's on the counter changes during the day: if you want a specific topping, ask.",
      "m.liv": "In the middle · the dough",
      "m.t": "Thick. Soft inside, crisp underneath.",
      "m.p1": "It isn't thin pizza: it's thick pizza by the slice, baked in a tray. One slice is enough for lunch, and some say it's even better the next day.",
      "m.mano": "The words used most in the 889 Google reviews:",
      "m.k1": "pizza al trancio",
      "m.k2": "panzerotti",
      "m.k3": "focaccia",
      "m.k4": "risen (lievitata)",
      "m.k5": "tray (teglia)",
      "m.k6": "crispy",
      "m.kn": "Google's counts on the reviews, September 2026",
      "m.zoom": "Enlarge the photo of the slice seen from the side",
      "m.alt": "A spicy salami slice seen from the side: the thick, soft dough",
      "m.fig": "a slice seen from the side (photo from the Google listing)",
      "s.liv": "Alongside · the specialties",
      "s.t": "And then panzerotti, focaccia, scorzette.",
      "s.p1": "We write it on our page too: pizza by the slice, fried or baked panzerotti, stuffed focaccia, schiacciata, scorzette and much more. Here are the specialties on our menu.",
      "s.1t": "Panzerotti, baked or fried",
      "s.1p": "ham, mozzarella, tomato",
      "s.2t": "Baked panzerotti",
      "s.2p": "tomato and mozzarella",
      "s.3t": "Calzoni",
      "s.3p": "with onion, or with vegetables",
      "s.4t": "The Fiorello",
      "s.4p": "one of our stuffed specialties: ask at the counter",
      "s.5t": "Schiacciata",
      "s.5p": "from the oven, to take away",
      "s.6t": "Focaccia lucana and stuffed focaccia",
      "s.6p": "plain or filled",
      "s.7t": "Piadine",
      "s.7p": "tricolore, with vegetables, the Piadina Blow Out, with Nutella",
      "s.8t": "Rustichelle",
      "s.8p": "plain or filled",
      "s.9t": "Scorzette",
      "s.9p": "by the bag, or dressed",
      "s.zoom1": "Enlarge the photo of the glass counter",
      "s.alt1": "The glass counter with red pizzette, stuffed focaccia and arancini",
      "s.fig1": "the glass counter: red pizzette, focaccia, arancini (photo from the Google listing)",
      "s.zoom2": "Enlarge the photo of the stuffed focaccia",
      "s.alt2": "A focaccia stuffed with ham and tomato, cut into pieces",
      "s.fig2": "a stuffed focaccia, cut into pieces (photo from the Google listing)",
      "b.liv": "Underneath · the counter",
      "b.t": "The counter says 1990.",
      "b.p1": "A pebble plaque set in the bricks, next to a mosaic sun: it's the date of our shop, the same as on our logo. The place is small, mostly takeaway, with a few seats inside for a quick bite.",
      "b.p2": "Inside, yellow walls, copper pots and a pharaoh above the shelf. Outside, the «Blow Out pizza al trancio» awning on the corner of Largo dei Gelsomini.",
      "b.p3": "Time comes up a lot in the reviews: some have been coming since they were children, some for twenty years, some see it as a fixed point of the neighbourhood. Fourteen texts out of eighty-three, among the most recent.",
      "b.zoom2": "Enlarge the photo of the counter with the 1990 plaque",
      "b.alt2": "The brick counter with the 1990 plaque and the mosaic sun",
      "b.fig2": "the «1990» plaque on the counter",
      "b.zoom3": "Enlarge the photo of the pharaoh",
      "b.alt3": "A pharaoh bust and a sphinx on the wooden shelf",
      "b.fig3": "the pharaoh above the shelf",
      "r.t": "What you write.",
      "r.p": "Five Google reviews, as they were written.",
      "r.voto": "out of 5 · 889 Google reviews",
      "r.s5": "5 stars",
      "r.s4": "4 stars",
      "r.1": "Pizza by the slice among the best in Milan, if not the best. Thick, soft dough with a crisp base, and excellent top-quality ingredients, all in a family atmosphere. It works mainly as takeaway, but there are also a few seats inside to eat on the spot. Highly recommended.",
      "r.f1": "Stefano Mendolia · 3 months ago · 5 stars",
      "r.2": "Really good pizza by the slice, one of the best if not the best in the area, not to mention the panzerotti, delicious and always generously filled. I've known this pizzeria since the early 90s and I'm glad to see that the quality and goodness of the products have stayed the same over time. Absolutely recommended.",
      "r.f2": "Roberto Vazza · 8 months ago · 5 stars",
      "r.3": "Small place but a landmark for the neighbourhood. Thick pizza, good, easy to digest, very big portions, served in 10 minutes",
      "r.f3": "Paolo Giordano · a year ago · 5 stars",
      "r.4": "For as long as I can remember, when I think pizza I think of a Blow Out slice",
      "r.f4": "Filippo Santamato · a year ago · 5 stars",
      "r.5": "The pizza and the panzerotti are always good",
      "r.f5": "Bezzi Bazzi · a year ago · 4 stars",
      "o.t": "Every day, from 10 to 21.",
      "o.lun": "Monday",
      "o.mar": "Tuesday",
      "o.mer": "Wednesday",
      "o.gio": "Thursday",
      "o.ven": "Friday",
      "o.sab": "Saturday",
      "o.dom": "Sunday",
      "o.avviso": "In the evening and on holidays, best to call before coming: 02 4837 5035.",
      "o.ind": "Address",
      "o.indv": "Via Lorenteggio 163, 20146 Milan, on the corner of Largo dei Gelsomini",
      "o.metro": "Metro",
      "o.metrov": "M4, Gelsomini stop, a few steps away",
      "o.tel": "Phone",
      "o.btn": "Directions",
      "o.zoom": "Enlarge the photo of the shopfront",
      "o.alt": "The shopfront with the Blow Out pizza al trancio awning",
      "o.fig": "look for the awning (photo from the Google listing)",
      "o.mappa": "Map: Pizzeria Blow Out, Via Lorenteggio 163, Milan",
      "q.t": "Questions at the counter.",
      "q.1t": "What is double tomato?",
      "q.1p": "It's a slice with more tomato sauce on top: just ask for it at the counter.",
      "q.2t": "Can I get a whole tray?",
      "q.2p": "Yes: all nineteen toppings come by the slice or as a whole tray.",
      "q.3t": "Can I eat there?",
      "q.3p": "Yes, there are a few seats inside. But it's mostly a takeaway pizzeria.",
      "q.4t": "Are the panzerotti fried or baked?",
      "q.4p": "Both: baked or fried.",
      "q.5t": "Do you deliver?",
      "q.5p": "No: you come to the counter, a few steps from the Gelsomini stop on the M4.",
      "q.6t": "Are you open on Sundays?",
      "q.6p": "Yes, every day from 10 to 21. In the evening and on holidays, best to call first.",
      "q.7t": "Where are you?",
      "q.7p": "Via Lorenteggio 163, on the corner of Largo dei Gelsomini, a few steps from the Gelsomini stop on the M4.",
      "p.1": "Pizzeria Blow Out · pizza by the slice since 1990 · panzerotti, stuffed focaccia, scorzette · every day 10–21",
      "p.3": "Demo site by <a href=\"https://bespokestud.io\" rel=\"noopener\">Bespoke Studio</a> · texts from the business's menu and Google listing and its Facebook page, public reviews on Google (September 2026); photographs from the Google listing.",
      "a.nav": "Quick actions",
      "a.chiama": "Call",
      "a.gusti": "Toppings",
      "a.orari": "Hours",
      "a.mappa": "Map"
    },
    /* MULTILINGUA (V4) — per i siti con più di due lingue, al posto di EN:
         LANGS: { en: {chiave:'...'}, ar: {chiave:'...'} }
       L'italiano resta SEMPRE la lingua del DOM e non ha dizionario.
       Se si valorizza EN e non LANGS, il comportamento è identico a prima. */
    LANGS: null,
    RTL: ['ar', 'he', 'fa', 'ur'],   // lingue che ribaltano dir=rtl
    /* etichette dello stato orari per lingua non-IT; l'IT è nel codice.
       Chiave mancante = fallback all'inglese, poi all'italiano. */
    HOURS_I18N: null,
  };
  /* normalizzazione: EN storico -> LANGS */
  if (!SITE.LANGS) SITE.LANGS = SITE.EN && Object.keys(SITE.EN).length ? { en: SITE.EN } : {};
  var LANG_CODES = Object.keys(SITE.LANGS);   // senza 'it', che è il DOM
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    /* ⚠️ setTimeout 0 NON è decorativo: senza intro questo ramo gira in modo
       SINCRONO, cioè PRIMA che il codice-firma — che sta sotto il marcatore
       di fine plumbing, dentro questa stessa IIFE — abbia assegnato
       `window.bespokeHeroEntrance`. Il risultato è un'entrata dell'hero MUTA:
       nessun errore, elementi visibili, animazione semplicemente mai partita.
       Rimandando di un tick la IIFE è conclusa e l'hook esiste.
       (14/8/2026, A.S.FA. Sicilia: misurato h1 a opacity 1 già al load.)
       Cugino del bug `hero-hook-congelato` del 20/7: lì l'hook era catturato
       troppo presto, qui è CHIAMATO troppo presto. */
    setTimeout(heroEntrance, 0);
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var HOURS_BASE = {
    it: { open: 'Aperto ora', closesAt: 'chiude alle ', opensToday: 'Chiuso · apre oggi alle ',
          opensOn: 'Chiuso · apre {day} alle ', closed: 'Chiuso', days: DAYS_IT },
    en: { open: 'Open now', closesAt: 'closes at ', opensToday: 'Closed · opens today at ',
          opensOn: 'Closed · opens {day} at ', closed: 'Closed', days: DAYS_EN },
  };
  /* risolve le etichette orari per la lingua richiesta, con fallback en -> it */
  function strings(lang) {
    var custom = (SITE.HOURS_I18N && SITE.HOURS_I18N[lang]) || null;
    var base = HOURS_BASE[lang] || HOURS_BASE.en;
    if (!custom) return base;
    var outp = {};
    Object.keys(HOURS_BASE.it).forEach(function (k) {
      outp[k] = custom[k] !== undefined ? custom[k] : base[k];
    });
    return outp;
  }

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    /* V4: le etichette si risolvono per lingua corrente, non con un booleano
       en/it. Fallback a catena lingua -> en -> it, così un sito con AR o FR
       che non traduce lo stato orari resta comunque leggibile. */
    var L = strings(root.lang);
    var txt;
    if (st.open) {
      txt = L.open + ' · ' + L.closesAt + st.closesAt;
    } else if (st.opensToday) {
      txt = L.opensToday + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = L.opensOn.replace('{day}', L.days[st.opensDay]) + st.opensAt;
    } else {
      txt = L.closed;
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    /* V4: qualunque lingua dichiarata in SITE.LANGS, non più solo 'en'.
       'it' resta la lingua del DOM: nessun dizionario, nessuna sostituzione.
       Una lingua sconosciuta ricade su 'it' invece di rompere la pagina. */
    root.lang = (lang === 'it' || LANG_CODES.indexOf(lang) !== -1) ? lang : 'it';
    root.dir = SITE.RTL.indexOf(root.lang) !== -1 ? 'rtl' : 'ltr';
    var dict = SITE.LANGS[root.lang] || null;
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = dict && dict[key] !== undefined ? dict[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    /* V4: il toggle singolo CICLA sull'anello ['it', ...LANG_CODES].
       Con due lingue il comportamento è identico a prima (it <-> en). */
    var RING = ['it'].concat(LANG_CODES);
    langToggle.addEventListener('click', function () {
      var i = RING.indexOf(root.lang);
      setLang(RING[(i + 1) % RING.length]);
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    var saved = localStorage.getItem(SITE.slug + '-lang');
    if (saved && saved !== 'it' && LANG_CODES.indexOf(saved) !== -1) setLang(saved);
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */
  // ── FIRMA «il secondo mestolo» (#198 Pizzeria Blow Out) ──
  // Stato finale nel CSS: in ogni [data-strato] il pomodoro è a doppio spessore e il filo di salsa (.strato__mestolo) è nascosto (scaleY 0).
  // Con GSAP il JS riporta il pomodoro a uno strato solo (data-stato=un-mestolo) e, quando la sezione entra, fa cadere il filo
  // di salsa dall'alto e raddoppia lo strato (versa → doppio). Intro ed hero sono manuali (data-strato-manuale).
  var mestoloVivo = hasGsap && hasST && !reducedMotion;
  var strati = Array.prototype.slice.call(document.querySelectorAll('[data-strato]'));
  var unMestolo = function (el) {
    var s = el.querySelector('.strato__salsa'), m = el.querySelector('.strato__mestolo');
    if (!s) return;
    gsap.set(s, { scaleY: 0.5, transformOrigin: '50% 100%' });
    if (m) gsap.set(m, { scaleY: 0, transformOrigin: '50% 0%' });
    el.setAttribute('data-stato', 'un-mestolo');
  };
  var versa = function (el, subito) {
    var s = el.querySelector('.strato__salsa'), m = el.querySelector('.strato__mestolo');
    var tutti = [s, m].filter(Boolean);
    if (!s) { el.setAttribute('data-stato', 'doppio'); return; }
    if (subito || !hasGsap) { if (hasGsap) gsap.set(tutti, { clearProps: 'all' }); el.setAttribute('data-stato', 'doppio'); return; }
    if (el.getAttribute('data-stato') !== 'un-mestolo') return;
    el.setAttribute('data-stato', 'versa');
    var tl = gsap.timeline({ onComplete: function () { gsap.set(tutti, { clearProps: 'all' }); el.setAttribute('data-stato', 'doppio'); } });
    if (m) tl.to(m, { scaleY: 1, duration: 0.32, ease: 'power1.in' }, 0);
    tl.to(s, { scaleY: 1, duration: 0.8, ease: 'back.out(1.5)' }, m ? 0.22 : 0);
    if (m) { tl.set(m, { transformOrigin: '50% 100%' }, 0.62); tl.to(m, { scaleY: 0, duration: 0.3, ease: 'power1.out' }, 0.62); }
  };
  if (mestoloVivo) {
    strati.forEach(unMestolo);
    strati.filter(function (el) { return !el.hasAttribute('data-strato-manuale'); }).forEach(function (el) {
      ScrollTrigger.create({ trigger: el, start: 'top 82%', once: true, onEnter: function () { versa(el); } });
    });
    setTimeout(function () { strati.forEach(function (el) { if (el.getAttribute('data-stato') === 'un-mestolo' && !el.hasAttribute('data-strato-manuale')) versa(el, true); }); }, 9000); // rete di sicurezza
    var introStrato = document.getElementById('introStrato');
    if (introStrato) setTimeout(function () { versa(introStrato); }, 750);
    var spicchio = document.querySelector('.intro__spicchio');
    if (spicchio) gsap.from(spicchio, { y: 9, opacity: 0, duration: 0.6, ease: 'back.out(1.6)', delay: 0.15 });
  } else {
    strati.forEach(function (el) { versa(el, true); });
  }
  window.bespokeHeroEntrance = function () {
    var hero = document.getElementById('heroStrato');
    if (!hero) return;
    if (!mestoloVivo) { versa(hero, true); return; }
    versa(hero);
    gsap.from(['.apertura__p', '.apertura__stato', '.apertura__azioni', '.apertura__badge'], { opacity: 0, y: 14, duration: 0.6, stagger: 0.08, delay: 0.45, ease: 'power2.out', clearProps: 'all' });
  };
})();
