export const pythonScriptTemplate = `#!/usr/bin/env python3
"""
Philosophy Influence Graph Generator
------------------------------------
Ova aplikacija koristi novi official 'google-genai' SDK i knjižnicu 'pyvis'
kako bi rekonstruirala interaktivni graf utjecaja između filozofa.

Za svaku vezu ili filozofa poziva se Gemini API kako bi ponudio stručnu
kontekstualnu analizu izravno u grafu ili konzoli.

Zahtjevi:
    pip install google-genai pyvis networkx

Postavljanje API ključa u terminalu:
    export GEMINI_API_KEY="vaš-api-ključ-ovdje"

Pokretanje:
    python filozofija_mreza.py
"""

import os
import sys
from google import genai
from google.genai import types
from pyvis.network import Network
import networkx as nx

# 1. Definicija podataka o filozofima (naziv, godine, epoha, boja)
EPOCHS = {
    "antika": {
        "name": "Antika",
        "color": "#10b981",  # Emerald
    },
    "srednji_vijek_renesansa": {
        "name": "Srednji vijek i Renesansa",
        "color": "#f59e0b",  # Amber
    },
    "moderno_doba": {
        "name": "Moderno doba",
        "color": "#6366f1",  # Indigo
    },
    "suvremeno_doba": {
        "name": "Suvremeno doba",
        "color": "#f43f5e",  # Rose
    }
}

PHILOSOPHERS = [
    # Antika
    {"id": "sokrat", "name": "Sokrat", "years": "oko 470. pr. Kr. – 399. pr. Kr.", "epoch": "antika"},
    {"id": "platon", "name": "Platon", "years": "oko 428. pr. Kr. – 348. pr. Kr.", "epoch": "antika"},
    {"id": "aristotel", "name": "Aristotel", "years": "384. pr. Kr. – 322. pr. Kr.", "epoch": "antika"},
    {"id": "epikur", "name": "Epikur", "years": "341. pr. Kr. – 270. pr. Kr.", "epoch": "antika"},
    # Srednji vijek i renesansa
    {"id": "augustin", "name": "Sveti Augustin", "years": "354. – 430.", "epoch": "srednji_vijek_renesansa"},
    {"id": "toma_akvinski", "name": "Toma Akvinski", "years": "1225. – 1274.", "epoch": "srednji_vijek_renesansa"},
    {"id": "machiavelli", "name": "Niccolò Machiavelli", "years": "1469. – 1527.", "epoch": "srednji_vijek_renesansa"},
    {"id": "montaigne", "name": "Michel de Montaigne", "years": "1533. – 1592.", "epoch": "srednji_vijek_renesansa"},
    # Moderno doba
    {"id": "descartes", "name": "René Descartes", "years": "1596. – 1650.", "epoch": "moderno_doba"},
    {"id": "spinoza", "name": "Baruch Spinoza", "years": "1632. – 1677.", "epoch": "moderno_doba"},
    {"id": "locke", "name": "John Locke", "years": "1632. – 1704.", "epoch": "moderno_doba"},
    {"id": "kant", "name": "Immanuel Kant", "years": "1724. – 1804.", "epoch": "moderno_doba"},
    {"id": "hegel", "name": "G. W. F. Hegel", "years": "1770. – 1831.", "epoch": "moderno_doba"},
    {"id": "nietzsche", "name": "Friedrich Nietzsche", "years": "1844. – 1900.", "epoch": "moderno_doba"},
    # Suvremeno doba
    {"id": "husserl", "name": "Edmund Husserl", "years": "1859. – 1938.", "epoch": "suvremeno_doba"},
    {"id": "wittgenstein", "name": "Ludwig Wittgenstein", "years": "1889. – 1951.", "epoch": "suvremeno_doba"},
    {"id": "heidegger", "name": "Martin Heidegger", "years": "1889. – 1976.", "epoch": "suvremeno_doba"},
    {"id": "sartre", "name": "Jean-Paul Sartre", "years": "1905. – 1980.", "epoch": "suvremeno_doba"},
    {"id": "foucault", "name": "Michel Foucault", "years": "1926. – 1984.", "epoch": "suvremeno_doba"}
]

CONNECTIONS = [
    ("sokrat", "platon", "Platon je bio Sokratov učenik i zapisao je njegove dijaloge."),
    ("platon", "aristotel", "Aristotel je studirao na Platonovoj Akademiji, no kritizirao je teoriju ideja."),
    ("sokrat", "epikur", "Etički temelj traženja ataraksije i autarhije."),
    ("platon", "augustin", "Augustin je integrirao novoplatonizam s kršćanskom teologijom."),
    ("aristotel", "toma_akvinski", "Toma Akvinski je sintetizirao aristotelizam s kršćanskom dogmom."),
    ("augustin", "toma_akvinski", "Reinterpretacija teoloških okvira kroz skolastiku."),
    ("montaigne", "descartes", "Skepticizam koji je potaknuo metodološku sumnju."),
    ("machiavelli", "spinoza", "Politički realizam nasuprot utopizmu."),
    ("descartes", "spinoza", "Monizam koji nadilazi kartezijanski dualizam supstancije."),
    ("descartes", "locke", "Lockeov empirizam reagira protiv kartezijanskih urođenih ideja."),
    ("locke", "kant", "Sinteza empirizma i racionalizma u transcendentalnoj kritici."),
    ("descartes", "kant", "Polazište za analizu spoznajnog subjekta."),
    ("kant", "hegel", "Hegelova dijalektika koja nadrasta Kantov dualizam fenomena/noumena."),
    ("kant", "nietzsche", "Žestoka kritika Kantovog univerzalnog morala dužnosti."),
    ("hegel", "nietzsche", "Odbacivanje racionalnog napretka u korist volje za moć."),
    ("descartes", "husserl", "Ego cogito kao ishodište fenomenologije."),
    ("kant", "husserl", "Uvjeti mogućnosti iskustva i uloga konstitucije svijesti."),
    ("husserl", "heidegger", "Transformacija deskriptivne fenomenologije u hermeneutiku Daseina."),
    ("kant", "wittgenstein", "Rano utvrđivanje granica onoga što je smisleno izreći."),
    ("augustin", "wittgenstein", "Analiza učenja jezika na početku Filozofijskih istraživanja."),
    ("heidegger", "sartre", "Egzistencijalizam izgrađen na pojmu Daseina i tjeskobe."),
    ("nietzsche", "foucault", "Arheologija znanja i genealogija moći nastale iz genealogije morala."),
    ("heidegger", "foucault", "Analiza kraja metafizike i njezinih društvenih implikacija."),
    ("sartre", "foucault", "Suprostavljanje strukturalizma i egzistencijalističkog humanizma.")
]


def pitaj_gemini(upit: str) -> str:
    \"\"\"Poziva Gemini API i vraća analizu na hrvatskom jeziku.\"\"\"
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return "⚠️ [API ključ nije postavljen u varijabli okruženja GEMINI_API_KEY. Molimo postavite ga.]"
        
    try:
        # Inicijalizacija novog GoogleGenAI klijenta
        client = genai.Client()
        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=upit,
            config=types.GenerateContentConfig(
                system_instruction="Ti si vrhunski asistent za povijest filozofije. Odgovaraj točno, duboko i na hrvatskom jeziku.",
                temperature=0.7
            )
        )
        return response.text
    except Exception as e:
        return f"Došlo je do pogreške pri pozivu Gemini API-ja: {str(e)}"


def generiraj_interaktivni_graf():
    print("Inicijaliziram interaktivnu Pyvis mrežu...")
    
    # Kreiramo pyvis mrežu. Podešavamo tamnu pozadinu za elegantan izgled.
    net = Network(height="750px", width="100%", bgcolor="#0c0d10", font_color="#d1d5db", directed=True)
    
    # Postavljanje fizike za ugodno ponašanje grafičkih čvorova
    net.set_options(\"\"\"
    var options = {
      "nodes": {
        "borderWidth": 2,
        "borderWidthSelected": 4,
        "shadow": true,
        "font": {
          "size": 14,
          "face": "Tahoma"
        }
      },
      "edges": {
        "color": {
          "inherit": false
        },
        "smooth": {
          "type": "cubicBezier",
          "forceDirection": "horizontal",
          "roundness": 0.4
        },
        "arrows": {
          "to": {
            "enabled": True,
            "scaleFactor": 1.2
          }
        },
        "shadow": true
      },
      "physics": {
        "barnesHut": {
          "gravitationalConstant": -12000,
          "centralGravity": 0.1,
          "springLength": 180,
          "springConstant": 0.04
        },
        "minVelocity": 0.75
      }
    }
    \"\"\")
    
    # Dodajemo čvorove
    for phil in PHILOSOPHERS:
        epoch_info = EPOCHS.get(phil["epoch"], {"name": "Nepoznato", "color": "#9ca3af"})
        label = f"{phil['name']}\\n({phil['years']})"
        color_hex = epoch_info["color"]
        
        # HTML opis koji se pojavljuje kada korisnik pokaže mišem na čvor
        title_html = f\"\"\"
        <div style="background-color: #16181d; color: #f3f4f6; border: 1px solid #374151; padding: 10px; border-radius: 8px; font-family: sans-serif; pointer-events: none;">
            <b style="color: {color_hex}">{phil['name']}</b> ({epoch_info['name']})<br/>
            <span>⏳ {phil['years']}</span><br/>
            <hr style="border-color: #374151; margin: 6px 0;" />
            <p style="margin: 0; font-size: 11px; max-width: 250px;">
                Kliknite na ovog filozofa i upotrijebite Gemini AI za kompletnu analizu.
            </p>
        </div>
        \"\"\"
        
        net.add_node(
            phil["id"], 
            label=label, 
            title=title_html, 
            color=color_hex, 
            size=25,
            shape="dot"
        )
        
    # Dodajemo usmjerene veze (strelica pokazuje utjecaj, npr: Sokrat -> Platon)
    for src, tgt, desc in CONNECTIONS:
        # Pronalazimo boju polazišnog filozofa radi lakšeg praćenja tijeka
        src_phil = next((p for p in PHILOSOPHERS if p["id"] == src), None)
        edge_color = EPOCHS.get(src_phil["epoch"], {"color": "#6b7280"})["color"] if src_phil else "#6b7280"
        
        title_html = f\"\"\"
        <div style="background-color: #16181d; color: #f3f4f6; border: 1px solid #374151; padding: 10px; border-radius: 8px; font-family: sans-serif; max-width: 300px;">
            <b>Utjecaj:</b><br/>
            <span>{desc}</span>
        </div>
        \"\"\"
        
        net.add_edge(
            src, 
            tgt, 
            title=title_html, 
            color=edge_color,
            width=2
        )
        
    output_filename = "povijest_filozofije_utjecaji.html"
    print(f"Spremam graf u datoteku: {output_filename} ...")
    net.save_graph(output_filename)
    print(f"🎉 Graf je uspješno generiran! Otvorite datoteku '{output_filename}' u pregledniku.")


if __name__ == "__main__":
    print("=========================================================")
    print("  FILO-GRAF: Analiza povijesnih utjecaja s Gemini AI-jem ")
    print("=========================================================")
    
    # 1. Pitaj korisnika želi li dobiti detaljnu Gemini analizu o nekom filozofu ili vezi prije kreiranja grafa
    print("\\nPopis dostupnih filozofa:")
    for i, phil in enumerate(PHILOSOPHERS, 1):
        print(f"{i:2d}. {phil['name']} ({phil['years']})")
        
    proizvoljni_izbor = input("\\nŽelite li pokrenuti Gemini AI analizu za nekog filozofa? (Unesite broj, ili pritisnite Enter za preskok): ").strip()
    
    if proizvoljni_izbor.isdigit():
        index = int(proizvoljni_izbor) - 1
        if 0 <= index < len(PHILOSOPHERS):
            odabrani = PHILOSOPHERS[index]
            print(f"\\nPozivam Gemini AI za analizu filozofa: {odabrani['name']}...")
            upit_za_ai = f"Napravi fascinantnu i stručnu analizu filozofa {odabrani['name']} ({odabrani['years']}) i njegovog trajnog utjecaja na zapadnu misao."
            rezultat = pitaj_gemini(upit_za_ai)
            print("\\n--- GEMINI ANALIZA ---")
            print(rezultat)
            print("----------------------\\n")
        else:
            print("Nevažeći broj.")
            
    # 2. Generiranje vizualizacije
    generiraj_interaktivni_graf()
`;
