import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Center, Grid, Html, useProgress } from '@react-three/drei';
import { Model } from '../components/Model';
import { ModelMetadata } from '../types';
import { Ruler, RefreshCw, Wand2, Download, Layers, AlertTriangle } from 'lucide-react';

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-clay-200 border-t-clay-600 rounded-full animate-spin mb-2"></div>
        <div className="text-clay-800 font-bold">{progress.toFixed(0)}% loaded</div>
      </div>
    </Html>
  );
}

export default function Viewer() {
  const { id } = useParams<{ id: string }>();
  const [metadata, setMetadata] = useState<ModelMetadata | null>(null);
  const [viewMode, setViewMode] = useState<'original' | 'repaired'>('original');
  const [showWireframe, setShowWireframe] = useState(false);
  const [repairStatus, setRepairStatus] = useState<'idle' | 'analyzing' | 'repairing' | 'complete'>('idle');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Fetch metadata on load
  useEffect(() => {
    if (!id) return;
    // Use relative path for proxy
    fetch(`/api/model/${id}/metadata`)
      .then(res => res.json())
      .then(data => setMetadata(data))
      .catch(err => console.error("Failed to load metadata", err));
  }, [id]);

  const handleRepair = async () => {
    if (!id) return;
    setRepairStatus('analyzing');
    
    // Step 1: Request Repair
    try {
      const response = await fetch(`/api/model/${id}/repair`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'auto' })
      });
      const data = await response.json();
      
      // Update local state with result
      setRepairStatus('complete');
      setAiAnalysis(data.aiAnalysis);
      setMetadata(prev => prev ? { ...prev, repairedFilePath: data.repairedFilePath } : null);
      setViewMode('repaired'); // Auto switch
    } catch (e) {
      console.error(e);
      setRepairStatus('idle'); // Reset on error
    }
  };

  const getModelUrl = () => {
    if (!metadata) return null;
    // Backend returns paths starting with /repaired/ or /uploads/, so we use them directly relative to root
    if (viewMode === 'repaired' && metadata.repairedFilePath) {
      return metadata.repairedFilePath;
    }
    return metadata.originalFilePath;
  };

  if (!metadata) return <div className="p-12 text-center text-stone-500">Loading model details...</div>;

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6">
      
      {/* LEFT PANEL: 3D VIEWER */}
      <div className="flex-1 bg-stone-900 rounded-3xl overflow-hidden relative shadow-inner shadow-black/20">
        <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-mono">
          {viewMode === 'original' ? 'ORIGINAL MESH' : 'REPAIRED MESH'}
        </div>
        
        <Canvas shadows camera={{ position: [4, 4, 4], fov: 50 }}>
          <Suspense fallback={<Loader />}>
            <Stage environment="studio" intensity={0.5} adjustCamera={false}>
              <Center>
                <Model 
                  url={getModelUrl()} 
                  wireframe={showWireframe} 
                  color={viewMode === 'repaired' ? '#c08663' : '#a8a29e'}
                />
              </Center>
            </Stage>
            <Grid infiniteGrid fadeDistance={50} fadeStrength={5} />
            <OrbitControls makeDefault />
          </Suspense>
        </Canvas>

        {/* Floating Toggle Controls */}
        <div className="absolute bottom-6 left-6 z-10 flex gap-2">
          <button 
            onClick={() => setShowWireframe(!showWireframe)}
            className={`p-2 rounded-lg backdrop-blur transition-all ${showWireframe ? 'bg-clay-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            title="Toggle Wireframe"
          >
            <Layers className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* RIGHT PANEL: CONTROLS */}
      <div className="w-96 bg-white rounded-3xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 bg-stone-50">
          <h2 className="text-lg font-bold text-stone-800 truncate" title={metadata.filename}>{metadata.filename}</h2>
          <p className="text-xs text-stone-500 font-mono mt-1">ID: {metadata.id.substring(0,8)}...</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Dimensions */}
          <section>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Ruler className="w-4 h-4" /> Dimensions
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-stone-50 p-3 rounded-xl text-center border border-stone-100">
                <div className="text-xs text-stone-400 mb-1">Height</div>
                <div className="font-mono font-bold text-stone-800">{metadata.dimensions.height.toFixed(1)}</div>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl text-center border border-stone-100">
                <div className="text-xs text-stone-400 mb-1">Width</div>
                <div className="font-mono font-bold text-stone-800">{metadata.dimensions.width.toFixed(1)}</div>
              </div>
              <div className="bg-stone-50 p-3 rounded-xl text-center border border-stone-100">
                <div className="text-xs text-stone-400 mb-1">Depth</div>
                <div className="font-mono font-bold text-stone-800">{metadata.dimensions.depth.toFixed(1)}</div>
              </div>
            </div>
            <div className="text-center mt-2 text-xs text-stone-400">Units: {metadata.dimensions.units} (Approx)</div>
          </section>

          {/* Repair Section */}
          <section>
             <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Wand2 className="w-4 h-4" /> AI Restoration
            </h3>
            
            {repairStatus === 'idle' && (
              <div className="space-y-3">
                <p className="text-sm text-stone-600 mb-2">
                  Use Gemini AI to detect cracks, holes, and non-manifold geometry.
                </p>
                <button 
                  onClick={handleRepair}
                  className="w-full py-3 bg-clay-600 hover:bg-clay-700 text-white rounded-xl font-bold shadow-md shadow-clay-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Wand2 className="w-4 h-4" />
                  Auto Repair Mesh
                </button>
              </div>
            )}

            {repairStatus === 'analyzing' && (
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-center">
                 <RefreshCw className="w-6 h-6 text-blue-500 animate-spin mx-auto mb-2" />
                 <p className="text-sm font-medium text-blue-800">Gemini is analyzing mesh structure...</p>
                 <p className="text-xs text-blue-600 mt-1">Identifying topological defects</p>
              </div>
            )}

            {repairStatus === 'complete' && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                  <div className="flex items-center gap-2 mb-2 text-green-800 font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Restoration Complete
                  </div>
                  {aiAnalysis && (
                    <p className="text-xs text-green-700 italic border-t border-green-100 pt-2 mt-2">
                      "AI Note: {aiAnalysis}"
                    </p>
                  )}
                </div>

                <div className="flex bg-stone-100 p-1 rounded-lg">
                  <button 
                    onClick={() => setViewMode('original')}
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'original' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500'}`}
                  >
                    Original
                  </button>
                  <button 
                    onClick={() => setViewMode('repaired')}
                    className={`flex-1 py-1 text-sm font-medium rounded-md transition-all ${viewMode === 'repaired' ? 'bg-white shadow-sm text-clay-700' : 'text-stone-500'}`}
                  >
                    Repaired
                  </button>
                </div>
                
                <a 
                  href={metadata.repairedFilePath}
                  download
                  className="w-full py-3 border border-stone-200 hover:bg-stone-50 text-stone-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download OBJ
                </a>
              </div>
            )}
          </section>

          {/* Manual Tools Placeholder */}
          <section className="pt-4 border-t border-stone-100 opacity-60 pointer-events-none">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Manual Tools (Pro)
            </h3>
            <p className="text-xs text-stone-400">Select area mode unavailable in demo.</p>
          </section>

        </div>
      </div>
    </div>
  );
}