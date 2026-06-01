import { Philosopher, Connection, Epoch } from "./types";

export const epochs: Epoch[] = [
  {
    id: "antika",
    name: "Antika",
    period: "6. st. pr. Kr. – 5. st.",
    color: {
      bg: "bg-emerald-50 text-emerald-900 border-emerald-200",
      text: "text-emerald-700",
      border: "border-emerald-300",
      hex: "#10b981", // Tailwind Emerald 500
      hoverHex: "#059669"
    }
  },
  {
    id: "srednji_vijek_renesansa",
    name: "Srednji vijek i Renesansa",
    period: "5. st. – 16. st.",
    color: {
      bg: "bg-amber-50 text-amber-900 border-amber-200",
      text: "text-amber-700",
      border: "border-amber-300",
      hex: "#f59e0b", // Tailwind Amber 500
      hoverHex: "#d97706"
    }
  },
  {
    id: "moderno_doba",
    name: "Moderno doba",
    period: "17. st. – 19. st.",
    color: {
      bg: "bg-indigo-50 text-indigo-900 border-indigo-200",
      text: "text-indigo-700",
      border: "border-indigo-300",
      hex: "#6366f1", // Tailwind Indigo 500
      hoverHex: "#4f46e5"
    }
  },
  {
    id: "suvremeno_doba",
    name: "Suvremeno doba",
    period: "20. st. – danas",
    color: {
      bg: "bg-rose-50 text-rose-900 border-rose-200",
      text: "text-rose-700",
      border: "border-rose-300",
      hex: "#f43f5e", // Tailwind Rose 500
      hoverHex: "#e11d48"
    }
  }
];

export const philosophers: Philosopher[] = [
  // Antika
  {
    id: "sokrat",
    name: "Sokrat",
    originalName: "Socrates",
    birthDeath: "oko 470. pr. Kr. – 399. pr. Kr.",
    born: "oko 470. pr. Kr.",
    died: "399. pr. Kr.",
    epoch: "antika",
    shortBio: "Jedan od najutjecajnijih grčkih filozofa, poznat po uvođenju sokratovske metode elenktike (postavljanja pitanja) i fokusiranju filozofije na etiku, vrlinu i ljudski život umjesto na fiziku svemira.",
    keyIdeas: ["Sokratova metoda (dijalektika)", "Intelektualni optimizam (vrlina je znanje)", "Svjestan vlastitog neznanja ('Znam da ništa ne znam')"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Sokrat"
  },
  {
    id: "platon",
    name: "Platon",
    originalName: "Plato",
    birthDeath: "oko 428. pr. Kr. – 348. pr. Kr.",
    born: "oko 428. pr. Kr.",
    died: "348. pr. Kr.",
    epoch: "antika",
    shortBio: "Sokratov najpoznatiji učenik, osnivač Akademije u Ateni (prve institucije visokog obrazovanja u zapadnom svijetu). Zapisao je Sokratove dijaloge i razvio teoriju o svijetu vječnih, nepromjenjivih ideja.",
    keyIdeas: ["Teorija ideja (oblika)", "Alegorija o špilji", "Idealna država (vladavina filozofa)", "Anamneza (učenje kao sjećanje)"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Platon"
  },
  {
    id: "aristotel",
    name: "Aristotel",
    originalName: "Aristotle",
    birthDeath: "384. pr. Kr. – 322. pr. Kr.",
    born: "384. pr. Kr.",
    died: "322. pr. Kr.",
    epoch: "antika",
    shortBio: "Platonov učenik koji je sistematizirao cjelokupno antičko znanje. Utemeljitelj formalne logike i autor kapitalnih djela iz fizike, metafizike, poetike, retorike i etike. Naglašavao je empirijsko promatranje.",
    keyIdeas: ["Hilemorfizam (materija i oblik)", "Teleologija (svrhovitost)", "Zlatna sredina u etici", "Sila i mogućnost (potentia i actus)"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Aristotel"
  },
  {
    id: "epikur",
    name: "Epikur",
    originalName: "Epicurus",
    birthDeath: "341. pr. Kr. – 270. pr. Kr.",
    born: "341. pr. Kr.",
    died: "270. pr. Kr.",
    epoch: "antika",
    shortBio: "Osnivač epikurejske škole (Vrt). Zagovarao je da je cilj ljudskog života postizanje ataraksije (duševnog mira) i aponije (odsutnosti boli) kroz umjereno uživanje i prijateljstvo.",
    keyIdeas: ["Ataraksija (nepomućenost)", "Materijalistički atomizam", "Odbacivanje straha od bogova i smrti", "Vrijednost jednostavnog života i prijateljstva"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Epikur"
  },

  // Srednji vijek / Renesansa
  {
    id: "augustin",
    name: "Augustin",
    originalName: "Aurelius Augustinus",
    birthDeath: "354. – 430.",
    born: 354,
    died: 430,
    epoch: "srednji_vijek_renesansa",
    shortBio: "Sveti Augustin, teolog i filozof s kršćanskog zapada, čija je misao spojila kršćansku dogmu s novoplatonizmom. Autor djela 'O državi Božjoj' i 'Ispovijesti' u kojima preispituje grijeh, vrijeme i milost.",
    keyIdeas: ["Božanska iluminacija", "Teodiceja (problem zla kao nedostatka dobra)", "Linearno shvaćanje povijesti (Država Božja)", "Vrijeme kao funkcija ljudskog uma"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Sveti_Augustin"
  },
  {
    id: "toma_akvinski",
    name: "Toma Akvinski",
    originalName: "Thomas Aquinas",
    birthDeath: "1225. – 1274.",
    born: 1225,
    died: 1274,
    epoch: "srednji_vijek_renesansa",
    shortBio: "Dominikanac, najznačajniji predstavnik skolastičke filozofije. Uspio je pomiriti i sintetizirati Aristotelovo učenje s kršćanskim objavljenjem. Autor djela 'Summa Theologiae'.",
    keyIdeas: ["Pet dokaza za postojanje Boga (Quinque viae)", "Odnos razuma i vjere (harmonizacija)", "Prirodni zakon", "Esencija i egzistencija"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Toma_Akvinski"
  },
  {
    id: "machiavelli",
    name: "Machiavelli",
    originalName: "Niccolò Machiavelli",
    birthDeath: "1469. – 1527.",
    born: 1469,
    died: 1527,
    epoch: "srednji_vijek_renesansa",
    shortBio: "Talijanski renesansni politički filozof, diplomat i povjesničar. Autor knjige 'Vladar' u kojoj je postavio temelje političkog realizma, tvrdeći da je politika odvojena od privatne moralnosti.",
    keyIdeas: ["Politički realizam", "Cilj opravdava sredstva (u političkom kontekstu)", "Virtù (politička sposobnost) i Fortuna (kod utjecaja sudbine)", "Koncept stabilnosti države iznad svega"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Niccol%C3%B2_Machiavelli"
  },
  {
    id: "montaigne",
    name: "Montaigne",
    originalName: "Michel de Montaigne",
    birthDeath: "1533. – 1592.",
    born: 1533,
    died: 1592,
    epoch: "srednji_vijek_renesansa",
    shortBio: "Francuski pisac i filozof koji je utemeljio književni žanr eseja. Kroz svoja djela 'Eseji' popularizirao je renesansni skepticizam i preispitivao apsolutne dogme i ljudski ego.",
    keyIdeas: ["Receptivni skepticizam ('Što ja znam?' / Que sais-je?)", "Metoda eseja (autoetnografija)", "Humanističko obrazovanje", "Odbacivanje etnocentrizma"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Michel_de_Montaigne"
  },

  // Moderno doba
  {
    id: "descartes",
    name: "Descartes",
    originalName: "René Descartes",
    birthDeath: "1596. – 1650.",
    born: 1596,
    died: 1650,
    epoch: "moderno_doba",
    shortBio: "Naziva se 'ocem moderne filozofije'. Utemeljitelj modernog racionalizma koji je primijenio metodološku sumnju kako bi pronašao neoborive istine, što ga je dovelo do poznatog aksioma 'Mislim, dakle jesam'.",
    keyIdeas: ["Metodološki skepticizam", "Dualizam uma i tijela (kartuzijanski dualizam)", "Cogito, ergo sum", "Matematizacija prirode"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Ren%C3%A9_Descartes"
  },
  {
    id: "spinoza",
    name: "Spinoza",
    originalName: "Baruch Spinoza",
    birthDeath: "1632. – 1677.",
    born: 1632,
    died: 1677,
    epoch: "moderno_doba",
    shortBio: "Židovski nizozemski filozof koji je razvio radikalno monističko shvaćanje svemira u svom remek-djelu 'Etika'. Tvrdio je da Bog i Priroda predstavljaju istu realnost podijeljenu u beskrajne atribute.",
    keyIdeas: ["Panteizam ('Bog ili Priroda' / Deus sive Natura)", "Substancijalni monizam", "Moralni i politički determinizam", "Spoznaja kao put do istinske slobode"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Baruch_de_Spinoza"
  },
  {
    id: "locke",
    name: "Locke",
    originalName: "John Locke",
    birthDeath: "1632. – 1704.",
    born: 1632,
    died: 1704,
    epoch: "moderno_doba",
    shortBio: "Glavni predstavnik britanskog empirizma i utemeljitelj liberalizma. Tvrdio je da se čovjek rađa bez urođenih ideja i da je ljudski um 'prazna ploča' koja se ispunjava isključivo iskustvom.",
    keyIdeas: ["Tabula rasa (prazna ploča)", "Primarna i sekundarna svojstva", "Društveni ugovor i pravo na revoluciju", "Odvajanje crkve od države (tolerancija)"],
    wikiUrl: "https://hr.wikipedia.org/wiki/John_Locke"
  },
  {
    id: "kant",
    name: "Kant",
    originalName: "Immanuel Kant",
    birthDeath: "1724. – 1804.",
    born: 1724,
    died: 1804,
    epoch: "moderno_doba",
    shortBio: "Njemački prosvjetiteljski filozof, tvorac kritičkog idealizma koji je izveo kopernikanski obrat u filozofiji spajanjem racionalizma i empirizma. Postavio je dužnost u središte moralne teorije.",
    keyIdeas: ["Kopernikanski obrat (subjekt oblikuje objekt)", "Kategorički imperativ (etika dužnosti)", "Apriorne spoznajne forme (prostor, vrijeme, kategorije)", "Razlika između fenomena i noumenona ('stvari po sebi')"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Immanuel_Kant"
  },
  {
    id: "hegel",
    name: "Hegel",
    originalName: "Georg Wilhelm Friedrich Hegel",
    birthDeath: "1770. – 1831.",
    born: 1770,
    died: 1831,
    epoch: "moderno_doba",
    shortBio: "Vrhunac njemačkog klasičnog idealizma. Njegov filozofski sustav nastoji obuhvatiti cjelokupnu povijest mišljenja i stvarnosti kroz spekulativnu dijalektiku (teza, antiteza, sinteza) u evoluciji Apsolutnog Duha.",
    keyIdeas: ["Dijalektička metoda (razvoj kroz suprotnosti)", "Apsolutni idealizam", "Svjetski duh (Weltgeist) i filozofija povijesti", "Borba gospodara i sluge (priroda samosvijesti)"],
    wikiUrl: "https://hr.wikipedia.org/wiki/G._W._F._Hegel"
  },
  {
    id: "nietzsche",
    name: "Nietzsche",
    originalName: "Friedrich Nietzsche",
    birthDeath: "1844. – 1900.",
    born: 1844,
    died: 1900,
    epoch: "moderno_doba",
    shortBio: "Jedan od najutjecajnijih kritičara zapadne metafizike, morala i religije. Njegova filozofija sumnje ističe volju za moć, nadilaženje čovjeka kroz lik 'Übermenscha' i proglašenje 'smrti Boga'.",
    keyIdeas: ["Volja za moć", "Nadčovjek (Übermensch)", "Vječno vraćanje istog", "Perspektivizam (ne postoje činjenice, samo interpretacije)", "Kritika kršćanskog morala stada"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Friedrich_Nietzsche"
  },

  // Suvremeno doba
  {
    id: "husserl",
    name: "Husserl",
    originalName: "Edmund Husserl",
    birthDeath: "1859. – 1938.",
    born: 1859,
    died: 1938,
    epoch: "suvremeno_doba",
    shortBio: "Njemački matematičar i filozof, utemeljitelj moderne fenomenologije. Njegov je cilj bio pretvoriti filozofiju u 'strogu znanost' kroz suspenziju uobičajenih pretpostavki kako bi se analizirala čista struktura svijesti.",
    keyIdeas: ["Fenomenološka redukcija (Epohé - stavljanje u zagrade)", "Intencionalnost (svijest je uvijek svijest o nečemu)", "Životni svijet (Lebenswelt)"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Edmund_Husserl"
  },
  {
    id: "wittgenstein",
    name: "Wittgenstein",
    originalName: "Ludwig Wittgenstein",
    birthDeath: "1889. – 1951.",
    born: 1889,
    died: 1951,
    epoch: "suvremeno_doba",
    shortBio: "Austrijsko-britanski filozof blizak logičkom pozitivizmu koji je izvršio jezični obrat u filozofiji. Njegova rani rad (Tractatus) tvrdi da su granice jezika granice svijeta, dok kasniji rad ('Filozofijska istraživanja') analizu usmjerava na 'jezične igre'.",
    keyIdeas: ["Jezične igre (Language games)", "Teorija slike značenja", "Obiteljske sličnosti u konceptima", "Privatni jezik je nemoguć"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Ludwig_Wittgenstein"
  },
  {
    id: "heidegger",
    name: "Heidegger",
    originalName: "Martin Heidegger",
    birthDeath: "1889. – 1976.",
    born: 1889,
    died: 1976,
    epoch: "suvremeno_doba",
    shortBio: "Jedan od najoriginalnijih egzistencijalnih fenomemologa 20. stoljeća. U svom djelu 'Bitak i vrijeme' vratio je pitanje o bitku (ontološko pitanje) u središte filozofije analizirajući ljudski bitak kao Dasein (tubitak).",
    keyIdeas: ["Dasein (tubitak / bivovanje-u-svijetu)", "Zaborav bitka (Seinsvergessenheit)", "Bačenost u svijet (Geworfenheit)", "Autentičnost i tjeskoba pred smrću"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Martin_Heidegger"
  },
  {
    id: "sartre",
    name: "Sartre",
    originalName: "Jean-Paul Sartre",
    birthDeath: "1905. – 1980.",
    born: 1905,
    died: 1980,
    epoch: "suvremeno_doba",
    shortBio: "Francuski pisac, dramaturg i vodeći predstavnik ateističkog egzistencijalizma koji je u eseju 'Egzistencijalizam je humanizam' sažeo svoju doktrinu idealom da kod čovjeka 'egzistencija prethodi esenciji'.",
    keyIdeas: ["Egzistencija prethodi esenciji", "Bitak za sebe i bitak po sebi (le pour-soi et l'en-soi)", "Apsolutna sloboda i radikalna odgovornost", "Loša vjera (loša savjest/samozavaravanje)"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Jean-Paul_Sartre"
  },
  {
    id: "foucault",
    name: "Foucault",
    originalName: "Michel Foucault",
    birthDeath: "1926. – 1984.",
    born: 1926,
    died: 1984,
    epoch: "suvremeno_doba",
    shortBio: "Francuski povjesničar sustava mišljenja, sociolog i filozof. Njegova istraživanja analiziraju nastanak diskursa u povijesti medicine, kaznionica i psihijatrije, razotkrivajući kako se moć i znanje uzajamno stvaraju.",
    keyIdeas: ["Arheologija znanja i genealogija moći", "Biopolitika i biovlast", "Panoptikon (disciplinarna moć)", "Regulacija ljudskog diskursa"],
    wikiUrl: "https://hr.wikipedia.org/wiki/Michel_Foucault"
  }
];

export const connections: Connection[] = [
  // Antika
  {
    source: "sokrat",
    target: "platon",
    description: "Platon je bio Sokratov učenik; preuzeo je njegovu sokratovsku metodu elenktike (dijaloga) i postavio Sokrata kao glavno lice opusa."
  },
  {
    source: "platon",
    target: "aristotel",
    description: "Aristotel je studirao na Platonovoj Akademiji 20 godina. Iako je kritizirao teoriju ideja, Platonova metafizika i teleologija položile su temelje njegovoj misli."
  },
  {
    source: "sokrat",
    target: "epikur",
    description: "Epikurov poticaj na traženje vrline i sreće (eudajmonije) u privatnom životu razvio se iz etičkih temelja koje je uspostavio Sokrat."
  },

  // Srednji vijek / Kršćanski utjecaj
  {
    source: "platon",
    target: "augustin",
    description: "Augustin je integrirao novoplatonističku metafiziku (preko Plotina) s kršćanskom teologijom, formulirajući rane dogme kršćanskog zapada."
  },
  {
    source: "aristotel",
    target: "toma_akvinski",
    description: "Toma Akvinski je u potpunosti pomirio i integrirao Aristotelovu fiziku i metafiziku s kršćanskom dogmom, što je kamen temeljac skolastike i tomizma."
  },
  {
    source: "augustin",
    target: "toma_akvinski",
    description: "Akvinski nadograđuje Augustinovu teološku kozmologiju i sakramentalnu teologiju, reinterpretirajući je kroz aristotelijanske kategorije."
  },

  // Renesansa i Modernizam
  {
    source: "montaigne",
    target: "descartes",
    description: "Montaigneov radikalni skepticizam i istraživanje nemoći ljudskog razuma natjerali su Descartesa na pronalazak apsolutno sigurnog temelja znanja metodom sumnje."
  },
  {
    source: "machiavelli",
    target: "spinoza",
    description: "Spinoza u svojim političkim raspravama usvaja Machiavellijev realizam u pogledu ljudske naravi, države i upravljanja, odbijajući utopizam."
  },
  {
    source: "descartes",
    target: "spinoza",
    description: "Spinoza temelji svoju terminologiju na Descartesovoj definiciji supstancije, no rješava kartezijanski dualizam duha i tijela radikalnim panteističkim monizmom."
  },
  {
    source: "descartes",
    target: "locke",
    description: "Locke je razvio svoj empirizam izravno reagirajući protiv Descartesovih urođenih ideja (innate ideas), predlažući um kao tabula rasa."
  },

  // Prosvjetiteljstvo, njemački idealizam i kritika
  {
    source: "locke",
    target: "kant",
    description: "Lockeov empirizam i kasniji skepticizam Davida Humea probudili su Kanta iz 'dogmatskog drijemeža' i inicirali nastanak transcendentalne kognitivne analize."
  },
  {
    source: "descartes",
    target: "kant",
    description: "Descartesov skepticizam bio je polazišna točka Kantove transcedentalne dedukcije i pokušaja pomirenja racionalističke i empirističke struje."
  },
  {
    source: "kant",
    target: "hegel",
    description: "Hegel je nadrastao Kantov kriticizam i strogu podjelu svijeta na fenomene i nedohvatljivu stvar po sebi (noumenon) kroz dinamičnu dijalektiku Apsolutnog duha."
  },
  {
    source: "kant",
    target: "nietzsche",
    description: "Nietzsche se borio protiv Kantovog poimanja univerzalnog kategoričkog imperativa i sumnjičave spoznaje, proglasivši ih ostatkom kršćanske teologije."
  },
  {
    source: "hegel",
    target: "nietzsche",
    description: "Nietzsche je žestoko odbacio hegelovsku vjeru u nužan racionalni napredak svjetske povijesti i dijalektiku, ističući umjesto toga iracionalnu volju za moć."
  },

  // 20. stoljeće i Suvremenost
  {
    source: "descartes",
    target: "husserl",
    description: "Husserlove 'Kartuzijanske meditacije' izravno preuzimaju Descartesov ego cogito kao prvu točku filozofiranja, no proširuju ga u fenomenološku redukciju."
  },
  {
    source: "kant",
    target: "husserl",
    description: "Husserl razvija transcendentalnu fenomenologiju oslanjajući se na Kantove uvjete mogućnosti iskustva i ulogu transcendentalnog subjekta u konstituiranju svijeta."
  },
  {
    source: "husserl",
    target: "heidegger",
    description: "Heidegger je bio Husserlov student; preoblikovao je očevu čistu opisanu fenomenologiju svijesti u hermeneutičku fenomenologiju ljudskog bitka u svijetu (Dasein)."
  },
  {
    source: "kant",
    target: "wittgenstein",
    description: "Rani Wittgenstein (Tractatus) povlači granice onoga što se može smisleno izreći, što predstavlja svojevrsnu jezičnu inačicu Kantovog kriticizma i granica uma."
  },
  {
    source: "augustin",
    target: "wittgenstein",
    description: "Wittgenstein započinje svoja kultna 'Filozofijska istraživanja' kritičkom raspravom o Augustinovoj teoriji dječjeg učenja jezika iznesenoj u 'Ispovijestima'."
  },
  {
    source: "heidegger",
    target: "sartre",
    description: "Sartre razvija francuski egzistencijalizam ('Bitak i ništa') na temeljima Heideggerovog ontološkog opisa Daseina, bačenosti i suočavanja s tjeskobom bivstva."
  },
  {
    source: "nietzsche",
    target: "foucault",
    description: "Foucaultova čitava genealoška analiza diskursa, kažnjavanja i seksualnosti ('Arheologija znanja') temelji se na Nietzscheovoj metodi genealogije morala i analizi odnosa moći."
  },
  {
    source: "heidegger",
    target: "foucault",
    description: "Heideggerova dekonstrukcija zapadne metafizike i analiza tehnologije bitno su utjecale na Foucaultovo propitivanje povijesnih formacija znanja i epistemoloških horizonata."
  },
  {
    source: "sartre",
    target: "foucault",
    description: "Foucault stvara svoj strukturalistički i arheološki pristup u direktnoj opreci sa Sartreovim humanističkim egzistencijalizmom, tvrdeći da je subjekt konstrukt moći, a ne izvor apsolutne slobode."
  }
];
