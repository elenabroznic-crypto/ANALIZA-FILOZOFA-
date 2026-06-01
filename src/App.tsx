import { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";
import { BookOpen, RefreshCw, Layers, Layout, ArrowRight, Download, Copy, Check, Info, HelpCircle, Search, ExternalLink, Moon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { epochs, philosophers, connections } from "./data";
import { Philosopher, Connection, Epoch } from "./types";
import { pythonScriptTemplate } from "./pythonScript";

// Design Theme - Elegant Dark
// Custom positions for philosophers in a 1000x650 viewport
const INITIAL_POSITIONS: Record<string, { x: number; y: number }> = {
  // Antika
  sokrat: { x: 120, y: 130 },
  platon: { x: 120, y: 260 },
  aristotel: { x: 120, y: 390 },
  epikur: { x: 120, y: 520 },

  // Srednji vijek / renesansa
  augustin: { x: 380, y: 130 },
  toma_akvinski: { x: 380, y: 260 },
  machiavelli: { x: 380, y: 390 },
  montaigne: { x: 380, y: 520 },

  // Moderno doba
  descartes: { x: 640, y: 80 },
  spinoza: { x: 640, y: 180 },
  locke: { x: 640, y: 280 },
  kant: { x: 640, y: 380 },
  hegel: { x: 640, y: 480 },
  nietzsche: { x: 640, y: 580 },

  // Suvremeno doba
  husserl: { x: 900, y: 110 },
  wittgenstein: { x: 900, y: 220 },
  heidegger: { x: 900, y: 335 },
  sartre: { x: 900, y: 450 },
  foucault: { x: 900, y: 560 },
};

export default function App() {
  // Filter States
  const [selectedEpochs, setSelectedEpochs] = useState<string[]>(["antika", "srednji_vijek_renesansa", "moderno_doba", "suvremeno_doba"]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLayout, setSelectedLayout] = useState<"columns" | "circular" | "custom">("columns");

  // Selection States
  const [activePhilosopherId, setActivePhilosopherId] = useState<string>("sokrat");
  const [activeConnection, setActiveConnection] = useState<Connection | null>(null);

  // Gemini API States
  const [geminiResponse, setGeminiResponse] = useState<string>("");
  const [loadingGemini, setLoadingGemini] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Draggable node coordinate state
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>(INITIAL_POSITIONS);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Script tab preview & action states
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [showCodeModal, setShowCodeModal] = useState<boolean>(false);

  // UI status metrics
  const activePhilosopher = philosophers.find((p) => p.id === activePhilosopherId) || philosophers[0];

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Re-layout when layout setting changes
  useEffect(() => {
    if (selectedLayout === "columns") {
      setNodePositions(INITIAL_POSITIONS);
    } else if (selectedLayout === "circular") {
      // Calculate active philosophers and organize in a circle
      const activeIds = philosophers
        .filter((p) => selectedEpochs.includes(p.epoch))
        .map((p) => p.id);
      
      const count = activeIds.length;
      if (count === 0) return;

      const centerX = 500;
      const centerY = 325;
      const radius = 240;

      const newPositions = { ...nodePositions };
      activeIds.forEach((id, index) => {
        const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
        newPositions[id] = {
          x: Math.round(centerX + radius * Math.cos(angle)),
          y: Math.round(centerY + radius * Math.sin(angle)),
        };
      });
      setNodePositions(newPositions);
    }
  }, [selectedLayout, selectedEpochs]);

  // Handle Drag & Drop within SVG wrapper
  const handlePointerDown = (id: string, e: MouseEvent<SVGGElement> | TouchEvent<SVGGElement>) => {
    e.preventDefault();
    setDraggingNodeId(id);
    if (selectedLayout !== "custom") {
      setSelectedLayout("custom");
    }
    setActivePhilosopherId(id);
    setActiveConnection(null);
  };

  const handlePointerMove = (e: MouseEvent<SVGSVGElement> | TouchEvent<SVGSVGElement>) => {
    if (!draggingNodeId || !svgRef.current) return;

    // Retrieve pointer coordinates depending on Mouse or Touch events
    let clientX = 0;
    let clientY = 0;
    if ("touches" in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const viewBoxX = ((clientX - rect.left) / rect.width) * 1024;
    const viewBoxY = ((clientY - rect.top) / rect.height) * 650;

    // Boundaries check inside SVG viewbox
    const boundedX = Math.max(40, Math.min(984, viewBoxX));
    const boundedY = Math.max(40, Math.min(610, viewBoxY));

    setNodePositions((prev) => ({
      ...prev,
      [draggingNodeId]: { x: Math.round(boundedX), y: Math.round(boundedY) },
    }));
  };

  const handlePointerUp = () => {
    setDraggingNodeId(null);
  };

  // Toggle Epoch Helper
  const toggleEpoch = (epochId: string) => {
    setSelectedEpochs((prev) =>
      prev.includes(epochId) ? prev.filter((id) => id !== epochId) : [...prev, epochId]
    );
  };

  // Action: Analyze with Gemini AI
  const analyzeWithGemini = async (mode: "philosopher" | "connection", connectionObj?: Connection) => {
    setLoadingGemini(true);
    setApiError(null);
    setGeminiResponse("");

    try {
      const bodyPayload = mode === "philosopher" 
        ? { mode, philosopher: activePhilosopher }
        : { 
            mode, 
            source: philosophers.find((p) => p.id === connectionObj?.source), 
            target: philosophers.find((p) => p.id === connectionObj?.target) 
          };

      const res = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Došlo je do pogreške pri dohvaćanju analize.");
      }

      setGeminiResponse(data.text);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "Neuspjelo povezivanje s Gemini AI.");
    } finally {
      setLoadingGemini(false);
    }
  };

  // Trigger default analysis when active content changes
  useEffect(() => {
    setGeminiResponse("");
    setApiError(null);
  }, [activePhilosopherId, activeConnection]);

  // Filter local lists
  const filteredPhilosophers = philosophers.filter((p) => {
    const matchesEpoch = selectedEpochs.includes(p.epoch);
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (p.originalName && p.originalName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          p.keyIdeas.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesEpoch && (searchQuery.trim() === "" ? true : matchesSearch);
  });

  const filteredConnections = connections.filter((conn) => {
    const srcNode = philosophers.find((p) => p.id === conn.source);
    const tgtNode = philosophers.find((p) => p.id === conn.target);
    if (!srcNode || !tgtNode) return false;

    // Both ends must be active in selected epochs
    const srcActive = selectedEpochs.includes(srcNode.epoch);
    const tgtActive = selectedEpochs.includes(tgtNode.epoch);
    
    // Check search query matches either node if searching
    if (searchQuery.trim() !== "") {
      const nameMatch = srcNode.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        tgtNode.name.toLowerCase().includes(searchQuery.toLowerCase());
      return srcActive && tgtActive && nameMatch;
    }

    return srcActive && tgtActive;
  });

  // Calculate coordinates and shapes for arrow paths
  const getArrowPath = (conn: Connection) => {
    const srcPos = nodePositions[conn.source];
    const tgtPos = nodePositions[conn.target];
    if (!srcPos || !tgtPos) return "";

    const x1 = srcPos.x;
    const y1 = srcPos.y;
    const x2 = tgtPos.x;
    const y2 = tgtPos.y;

    const nodeRadius = 30; // Radius of philosopher circles
    const arrowOffset = 8;
    const totalOffset = nodeRadius + arrowOffset;

    const angle = Math.atan2(y2 - y1, x2 - x1);
    
    // Dynamic starting circle edge coordinate
    const sx = x1 + Math.cos(angle) * nodeRadius;
    const sy = y1 + Math.sin(angle) * nodeRadius;

    // Dynamic arrow head coordinate right on the target edge
    const tx = x2 - Math.cos(angle) * totalOffset;
    const ty = y2 - Math.sin(angle) * totalOffset;

    // Curve rendering for organic flow, especially when going backwards or vertical
    const dx = tx - sx;
    const dy = ty - sy;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (selectedLayout === "columns") {
      // Draw a gentle cubic Bezier curve that flows nicely from left to right
      const forceHex = 0.4; 
      const cx1 = sx + dx * forceHex;
      const cy1 = sy;
      const cx2 = tx - dx * forceHex;
      const cy2 = ty;
      return `M ${sx} ${sy} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${tx} ${ty}`;
    } else {
      // Gentle curve to prevent line overlaps in circular layout
      const cx = (sx + tx) / 2 - (dy / dist) * 20;
      const cy = (sy + ty) / 2 + (dx / dist) * 20;
      return `M ${sx} ${sy} Q ${cx} ${cy} ${tx} ${ty}`;
    }
  };

  // Helper code copy
  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(pythonScriptTemplate);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Action: Trigger Python script file download
  const downloadPythonFile = () => {
    const element = document.createElement("a");
    const file = new Blob([pythonScriptTemplate], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = "filozofija_mreza.py";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0c0d10] text-slate-300 font-sans overflow-hidden">
      
      {/* Top Professional Navigation Header */}
      <nav className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f1116] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase sm:text-base">
              PHILO-GRAPH <span className="text-xs font-semibold text-purple-400 border border-purple-500/30 px-1 py-0.5 rounded ml-2">Gemini AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 hidden sm:block">Interaktivna mreža filozofskih utjecaja i računalna analiza</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900/80 rounded-full border border-white/5 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gemini API: 3.5 Flash</span>
          </div>

          <button 
            onClick={() => setShowCodeModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-md transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Preuzmi Python Pokretač</span>
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Control and Configuration Drawer */}
        <aside className="w-72 bg-[#0f1116] border-r border-white/5 flex flex-col p-5 overflow-y-auto shrink-0 space-y-6">
          
          {/* Section: Layout and Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Razmještaj grafa</label>
              <span className="text-[9px] text-slate-400 bg-white/5 px-1 py-0.5 rounded flex items-center gap-1">
                <Layout className="w-2.5 h-2.5 text-indigo-400" />
                Interaktivno
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-1 p-1 bg-black/40 rounded-lg border border-white/5 text-xs text-center">
              <button
                onClick={() => setSelectedLayout("columns")}
                className={`py-1.5 rounded transition-all cursor-pointer ${selectedLayout === "columns" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                title="Povijesna kronologija s lijeva na desno"
              >
                Epohe
              </button>
              <button
                onClick={() => setSelectedLayout("circular")}
                className={`py-1.5 rounded transition-all cursor-pointer ${selectedLayout === "circular" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                title="Svi aktivni filozofi u krug"
              >
                Krug
              </button>
              <button
                onClick={() => setSelectedLayout("custom")}
                className={`py-1.5 rounded transition-all cursor-pointer ${selectedLayout === "custom" ? "bg-indigo-600 text-white font-medium" : "text-slate-400 hover:text-white"}`}
                title="Slobodno drag&drop pozicioniranje"
              >
                Slobodno
              </button>
            </div>
            {selectedLayout === "custom" && (
              <p className="text-[10px] text-indigo-400 mt-1.5 italic">💡 Povucite mišem bilo koji čvor za preraspodjelu!</p>
            )}
          </div>

          <hr className="border-white/5" />

          {/* Section: Search Bar */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Pretraga ideja / filozofa</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input 
                type="text"
                placeholder="npr. Platon, empirizam, bitak..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-black/40 rounded border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="text-[10px] text-slate-500 hover:text-white absolute right-2.5 top-2.5 cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Section: Historical Epoch Filters */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Vremenske Epohe ({selectedEpochs.length} aktivne)</label>
            <div className="space-y-1.5">
              {epochs.map((ep) => {
                const isActive = selectedEpochs.includes(ep.id);
                // Dynamically build border/bg colors following standard palette to make it visually distinctive
                return (
                  <button
                    key={ep.id}
                    onClick={() => toggleEpoch(ep.id)}
                    className={`w-full flex items-center justify-between p-2 rounded text-left transition-all border text-xs cursor-pointer ${
                      isActive 
                        ? `bg-[#0f1116] border-[${ep.color.hex}]/40 hover:bg-[#1a1d24]` 
                        : "bg-black/20 border-white/5 opacity-50 hover:opacity-85"
                    }`}
                    style={{ borderLeft: isActive ? `4px solid ${ep.color.hex}` : "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div>
                      <span className="font-semibold text-white block leading-tight">{ep.name}</span>
                      <span className="text-[9px] text-slate-500">{ep.period}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={isActive}
                      readOnly
                      className="rounded border-none accent-indigo-500 cursor-pointer h-3.5 w-3.5"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-white/5" />

          {/* Section: Status metrics and instructions */}
          <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 text-[11px] space-y-2">
            <span className="text-xs font-semibold text-white block">Upute za korištenje:</span>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>Kliknite na <b>filozofa</b> za detaljne biografije i ideje.</li>
              <li>Kliknite na <b>strelicu utjecaja</b> za uvid u njihov specifični dijalog.</li>
              <li>Kliknite <b>"Zatraži Gemini AI Analizu"</b> na dnu desnog panela za generiranje znanstvenog opisa na hrvatskom jeziku.</li>
            </ul>
            <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
              <span>Filozofa: {filteredPhilosophers.length} / 19</span>
              <span>Konekcija: {filteredConnections.length} / 24</span>
            </div>
          </div>

        </aside>

        {/* Center Canvas Area: Interactive Philosophy Network SVG Visualizer */}
        <main className="flex-1 relative bg-[#0c0d10] overflow-hidden flex flex-col min-w-0">
          
          {/* Canvas Header / Controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className="bg-[#12141c]/90 px-3 py-1.5 rounded-lg border border-white/5 text-xs flex items-center gap-2 shadow-lg backdrop-blur">
              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
              <span className="text-[11px] text-slate-400">Antika</span>
              <span className="w-2.5 h-2.5 rounded bg-[#f59e0b] ml-1"></span>
              <span className="text-[11px] text-slate-400">Srednji / Renesansa</span>
              <span className="w-2.5 h-2.5 rounded bg-indigo-500 ml-1"></span>
              <span className="text-[11px] text-slate-400">Moderno</span>
              <span className="w-2.5 h-2.5 rounded bg-rose-500 ml-1"></span>
              <span className="text-[11px] text-slate-400">Suvremeno</span>
            </div>
            
            <button
              onClick={() => {
                setNodePositions(INITIAL_POSITIONS);
                setSelectedLayout("columns");
                setActivePhilosopherId("sokrat");
                setActiveConnection(null);
              }}
              className="bg-[#12141c]/90 hover:bg-[#1c1f2b] p-1.5 rounded-lg border border-white/5 text-slate-400 hover:text-white transition-all shadow-lg flex items-center gap-1.5 text-xs cursor-pointer font-medium"
              title="Resetiraj pozicije i nivoe"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              Reset
            </button>
          </div>

          {/* Dotted Ambient Background & Live Scalable Graph Canvas */}
          <div className="flex-1 w-full relative bg-[radial-gradient(#1f212d_1px,transparent_1px)] bg-[size:32px_32px]">
            {filteredPhilosophers.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <HelpCircle className="w-12 h-12 text-slate-600 mb-2 animate-bounce" />
                <h3 className="text-base font-semibold text-white">Nema aktivnih filozofa</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Uključite jednu ili više povijesnih epoha na lijevom panelu ili očistite pretragu.
                </p>
              </div>
            ) : (
              <svg
                ref={svgRef}
                viewBox="0 0 1024 650"
                className="w-full h-full select-none"
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                {/* SVG Definitions for Arrowheads corresponding to Epoch Colors for ultimate clarity */}
                <defs>
                  {epochs.map((ep) => (
                    <marker
                      key={ep.id}
                      id={`arrow-${ep.id}`}
                      viewBox="0 0 10 10"
                      refX="18"
                      refY="5"
                      markerWidth="7"
                      markerHeight="7"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={ep.color.hex} />
                    </marker>
                  ))}
                  <marker
                    id="arrow-default"
                    viewBox="0 0 10 10"
                    refX="18"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#6b7280" />
                  </marker>
                  
                  {/* Subtle shadows for nodes */}
                  <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Draw Timeline labels when column display is selected */}
                {selectedLayout === "columns" && searchQuery.trim() === "" && (
                  <g className="opacity-25" pointerEvents="none">
                    <line x1="250" y1="20" x2="250" y2="630" stroke="#374151" strokeDasharray="4,4" />
                    <line x1="510" y1="20" x2="510" y2="630" stroke="#374151" strokeDasharray="4,4" />
                    <line x1="770" y1="20" x2="770" y2="630" stroke="#374151" strokeDasharray="4,4" />

                    <text x="120" y="30" textAnchor="middle" fill="#9ca3af" className="text-[11px] font-semibold tracking-wider uppercase">Antika</text>
                    <text x="380" y="30" textAnchor="middle" fill="#9ca3af" className="text-[11px] font-semibold tracking-wider uppercase">Srednji / Renesansa</text>
                    <text x="640" y="30" textAnchor="middle" fill="#9ca3af" className="text-[11px] font-semibold tracking-wider uppercase">Moderno</text>
                    <text x="900" y="30" textAnchor="middle" fill="#9ca3af" className="text-[11px] font-semibold tracking-wider uppercase">Suvremeno</text>
                  </g>
                )}

                {/* Render Directed Connections (Lines) */}
                <g id="edges-group">
                  {filteredConnections.map((conn, index) => {
                    const srcNode = philosophers.find((p) => p.id === conn.source);
                    const isSelected = activeConnection?.source === conn.source && activeConnection?.target === conn.target;
                    const epochColorHex = srcNode ? epochs.find((e) => e.id === srcNode.epoch)?.color.hex : "#6b7280";
                    const activeMarker = srcNode ? `url(#arrow-${srcNode.epoch})` : "url(#arrow-default)";

                    const pathString = getArrowPath(conn);
                    if (!pathString) return null;

                    return (
                      <g 
                        key={`${conn.source}-${conn.target}-${index}`} 
                        className="cursor-pointer"
                        onClick={() => {
                          setActiveConnection(conn);
                          setActivePhilosopherId("");
                        }}
                      >
                        {/* Invisible extra thick line for easy hovering and clicking */}
                        <path
                          d={pathString}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="15"
                        />
                        {/* Beautiful styled visual path */}
                        <path
                          d={pathString}
                          fill="none"
                          stroke={isSelected ? "#ffffff" : epochColorHex}
                          strokeWidth={isSelected ? "3" : "1.8"}
                          className="transition-all hover:stroke-white duration-200"
                          style={{
                            opacity: isSelected ? 1 : 0.45,
                            strokeDasharray: isSelected ? "none" : "none",
                          }}
                          markerEnd={activeMarker}
                        />
                      </g>
                    );
                  })}
                </g>

                {/* Render Interactive Philosopher Nodes */}
                <g id="nodes-group">
                  {filteredPhilosophers.map((phil) => {
                    const pos = nodePositions[phil.id] || { x: 500, y: 325 };
                    const epochDetails = epochs.find((e) => e.id === phil.epoch) || epochs[0];
                    const isSelected = activePhilosopherId === phil.id;
                    const isDragging = draggingNodeId === phil.id;

                    return (
                      <g
                        key={phil.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        className="cursor-grab active:cursor-grabbing"
                        onPointerDown={(e) => handlePointerDown(phil.id, e)}
                        filter="url(#node-shadow)"
                      >
                        {/* Selective backdrop glow for selected active node */}
                        {isSelected && (
                          <circle
                            r="36"
                            fill="transparent"
                            stroke={epochDetails.color.hex}
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            className="animate-spin"
                            style={{ animationDuration: "12s" }}
                          />
                        )}

                        {/* Background filling layer */}
                        <circle
                          r="26"
                          fill="#12141c"
                          stroke={isSelected ? "#ffffff" : epochDetails.color.hex}
                          strokeWidth={isSelected ? "3.5" : "2"}
                          className="transition-all duration-150"
                        />

                        {/* Dynamic Core Glow Color matching the epoch style */}
                        <circle
                          r="10"
                          fill={epochDetails.color.hex}
                          opacity="0.15"
                        />

                        {/* Philosopher Text Display Label */}
                        <text
                          y="-36"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontWeight="700"
                          className="text-[12px] tracking-wide"
                        >
                          {phil.name}
                        </text>

                        {/* Year string snippet label */}
                        <text
                          y="42"
                          textAnchor="middle"
                          fill="#64748b"
                          className="text-[9px]"
                        >
                          {phil.birthDeath.length > 20 ? phil.birthDeath.substring(0, 18) + "..." : phil.birthDeath}
                        </text>
                      </g>
                    );
                  })}
                </g>
              </svg>
            )}
          </div>

          {/* Quick interactive reset banner */}
          <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-white/5 py-1.5 px-3 rounded-lg text-[11px] text-slate-400 shadow-xl pointer-events-none hidden md:block">
            📊 Klikni na vezu ili filozofa za ispitivanje utjecaja sa <span className="text-white font-semibold">Gemini AI</span> krajem povijesne pruge.
          </div>
        </main>

        {/* Right Details Panel: displays Philosopher Profile, connection logic, and Gemini deep academic analysis */}
        <section className="w-96 bg-[#0f1116] border-l border-white/5 flex flex-col overflow-y-auto shrink-0 bg-gradient-to-b from-[#0f1116] to-[#0a0b0e]">
          
          <div className="p-5 flex-1 flex flex-col space-y-6">
            
            {/* Context A: Philosopher Profile details */}
            {activePhilosopherId && !activeConnection ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Profil Filozofa</span>
                    <h2 className="text-xl font-extrabold text-white">{activePhilosopher.name}</h2>
                    {activePhilosopher.originalName && (
                      <p className="text-xs text-slate-500 italic">izvorno: {activePhilosopher.originalName}</p>
                    )}
                  </div>
                  
                  {/* Epoch Indicator Accent */}
                  <span className={`text-[10px] px-2.5 py-1 rounded-full border ${epochs.find((e) => e.id === activePhilosopher.epoch)?.color.bg}`}>
                    {epochs.find((e) => e.id === activePhilosopher.epoch)?.name}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="bg-white/5 p-3 rounded border border-white/5 relative">
                    <p className="text-indigo-300 font-semibold mb-1">Životni vijek i godine:</p>
                    <p className="text-white text-sm font-bold">{activePhilosopher.birthDeath}</p>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-sm antialiased">{activePhilosopher.shortBio}</p>
                </div>

                {/* Key idea bullets */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ključne ideje i doprinosi:</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activePhilosopher.keyIdeas.map((idea, idx) => (
                      <span key={idx} className="bg-indigo-500/10 text-indigo-300 text-[11px] px-2.5 py-1 rounded border border-indigo-500/20">
                        {idea}
                      </span>
                    ))}
                  </div>
                </div>

                {activePhilosopher.wikiUrl && (
                  <a 
                    href={activePhilosopher.wikiUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 hover:underline transition-all pt-2 cursor-pointer"
                  >
                    <span>Više na Wikipediji</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <hr className="border-white/5" />

                <div className="space-y-3 pt-1">
                  <button
                    onClick={() => analyzeWithGemini("philosopher")}
                    disabled={loadingGemini}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-lg shadow-lg hover:shadow-purple-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Zatraži Gemini AI Analizu</span>
                  </button>
                </div>
              </div>
            ) : activeConnection ? (
              // Context B: Connection Details between two philosophers
              <div className="space-y-5">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1.5">Međusobni utjecaj</span>
                  <div className="flex items-center justify-between gap-2 p-3 bg-black/40 rounded-lg border border-white/5">
                    <div className="text-center flex-1">
                      <p className="text-xs font-bold text-white leading-tight">
                        {philosophers.find((p) => p.id === activeConnection.source)?.name}
                      </p>
                      <span className="text-[9px] text-slate-500 block">
                        {epochs.find((e) => e.id === philosophers.find((p) => p.id === activeConnection.source)?.epoch)?.name}
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-500" />

                    <div className="text-center flex-1">
                      <p className="text-xs font-bold text-white leading-tight">
                        {philosophers.find((p) => p.id === activeConnection.target)?.name}
                      </p>
                      <span className="text-[9px] text-slate-500 block">
                        {epochs.find((e) => e.id === philosophers.find((p) => p.id === activeConnection.target)?.epoch)?.name}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-xs space-y-3">
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Sažetak utjecaja:</p>
                  <div className="bg-indigo-500/5 border border-indigo-500/20 p-3.5 rounded leading-relaxed text-slate-300 italic text-[12px]">
                    "{activeConnection.description}"
                  </div>
                </div>

                <hr className="border-white/5" />

                <div className="space-y-3">
                  <button
                    onClick={() => analyzeWithGemini("connection", activeConnection)}
                    disabled={loadingGemini}
                    className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-lg shadow-lg hover:shadow-purple-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 animate-pulse" />
                    <span>Zatraži Gemini AI Analizu utjecaja</span>
                  </button>
                </div>
              </div>
            ) : (
              // Empty Select Instruction Fallback
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <Info className="w-8 h-8 text-indigo-500/60" />
                <p className="text-xs">
                  Odaberite čvor filozofa ili usmjerenu vezu (strelicu) na grafu za pregled povijesnih činjenica i generiranje Gemini AI analize.
                </p>
              </div>
            )}

            {/* Structured response output of the Gemini model */}
            {(loadingGemini || geminiResponse || apiError) && (
              <div className="border-t border-white/5 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Odgovor od Gemini AI</label>
                  {loadingGemini && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping"></span>
                  )}
                </div>

                {/* API Error Notification */}
                {apiError && (
                  <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded text-xs text-rose-400 leading-relaxed">
                    <p className="font-bold mb-1">Pogreška:</p>
                    <p className="mb-2">{apiError}</p>
                    <p className="text-[10px] text-slate-400">
                      Ako niste unijeli API ključ u okviru <b>Settings &gt; Secrets &gt; GEMINI_API_KEY</b>, učinite to i restartajte poslužitelj.
                    </p>
                  </div>
                )}

                {/* Academic Loading state skeleton */}
                {loadingGemini && (
                  <div className="space-y-2.5 animate-pulse pt-2">
                    <div className="h-3.5 bg-slate-800 rounded w-1/4"></div>
                    <div className="h-2.5 bg-slate-800 rounded w-full"></div>
                    <div className="h-2.5 bg-slate-800 rounded w-5/6"></div>
                    <div className="h-2.5 bg-slate-800 rounded w-11/12"></div>
                    <div className="h-3.5 bg-slate-800 rounded w-1/3 pt-3"></div>
                    <div className="h-2.5 bg-slate-800 rounded w-full"></div>
                    <div className="h-2.5 bg-slate-800 rounded w-4/5"></div>
                  </div>
                )}

                {/* Fully stylized scientific Markdown text response */}
                {geminiResponse && (
                  <div className="bg-[#0b0c10] border border-white/5 p-4 rounded-lg text-xs leading-relaxed text-slate-200 antialiased max-h-[300px] overflow-y-auto prose prose-invert prose-indigo">
                    <ReactMarkdown>{geminiResponse}</ReactMarkdown>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Footer of Profile with direct context of the active model and node details */}
          <div className="p-4 border-t border-white/5 bg-black/30 text-[10px] text-slate-500 space-y-1">
            <p>Aktivna epoha: <span className="text-slate-400 font-semibold">{activePhilosopherId ? epochs.find((e) => e.id === activePhilosopher.epoch)?.name : "Odaberite"}</span></p>
            <p className="leading-snug">Pomoć: Podatkovni model mapira {philosophers.length} utemeljitelja i {connections.length} utjecaja s točnim godinama.</p>
          </div>
        </section>
      </div>

      {/* Code Modal with python executable script block */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0f1116] border border-white/10 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            <header className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <div className="p-1 px-2 rounded bg-indigo-600/20 text-indigo-400 text-xs font-bold leading-tight uppercase font-mono">
                  Python + Pyvis
                </div>
                <h3 className="text-sm font-extrabold text-white">Preuzmite Izvorni Kod Vizualizacije</h3>
              </div>
              <button 
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/5 transition-all cursor-pointer"
              >
                Zatvori (Esc)
              </button>
            </header>

            <div className="p-5 flex-1 overflow-y-auto text-xs space-y-4">
              
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg text-indigo-300 leading-relaxed flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold mb-1">Što sadrži ova Python skripta?</p>
                  <p>
                    Kompletan kod koristi novu <b>google-genai</b> knjižnicu i <b>pyvis</b> (ili NetworkX s backend opcijom) za renderiranje interaktivne web mreže utjecaja. Čvorovi su obojani po epohama, a strelice usmjeravaju utjecaj. Imate opciju integriranog razgovora s Gemini AI-jem direktno iz terminala prije iscrtavanja HTML-a!
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>filozofija_mreza.py</span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyScriptToClipboard}
                      className="px-2.5 py-1 bg-white/5 rounded hover:bg-[#1a1d28] hover:text-white transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedScript ? "Kopirano!" : "Kopiraj kod"}</span>
                    </button>

                    <button
                      onClick={downloadPythonFile}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Preuzmi .py skriptu</span>
                    </button>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-lg border border-white/5 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-[300px]">
                  <pre>{pythonScriptTemplate}</pre>
                </div>
              </div>

              <div className="bg-slate-900/40 p-3.5 rounded border border-white/5 text-slate-400 space-y-1.5 leading-snug">
                <p className="font-bold text-white text-[11px]">Kako pokrenuti lokalno:</p>
                <p>1. Instalirajte biblioteke: <code className="bg-black px-1.5 py-0.5 rounded text-indigo-400">pip install google-genai pyvis networkx</code></p>
                <p>2. Postavite API ključ: <code className="bg-black px-1.5 py-0.5 rounded text-indigo-400">export GEMINI_API_KEY="vaš_ključ"</code> (ili <code className="bg-black px-1.5 py-0.5 rounded text-indigo-400">set GEMINI_API_KEY="vaš_ključ"</code> na Windows sistemu)</p>
                <p>3. Pokrenite: <code className="bg-black px-1.5 py-0.5 rounded text-indigo-400">python filozofija_mreza.py</code></p>
              </div>

            </div>

            <footer className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowCodeModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-semibold text-xs cursor-pointer transition-all"
              >
                U redu, zatvori
              </button>
            </footer>

          </div>
        </div>
      )}

    </div>
  );
}
