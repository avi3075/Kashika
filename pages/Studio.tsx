import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Wand2, Download, AlertCircle, Loader2, Upload } from 'lucide-react';

export default function Studio() {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit'>('generate');
  
  // Generate State
  const [genPrompt, setGenPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [genImage, setGenImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Edit State
  const [editPrompt, setEditPrompt] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const handleGenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genPrompt) return;
    
    setIsGenerating(true);
    setError(null);
    setGenImage(null);

    try {
      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: genPrompt, aspectRatio }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setGenImage(data.image);
    } catch (err: any) {
      setError(err.message || 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setEditImageFile(file);
      
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditImagePreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editImagePreview || !editPrompt) return;

    setIsEditing(true);
    setError(null);
    setResultImage(null);

    try {
      const response = await fetch('/api/studio/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: editImagePreview, prompt: editPrompt }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      if (data.image) {
        setResultImage(data.image);
      } else {
        setError('No image returned, possibly only text response: ' + (data.text || 'Unknown'));
      }
    } catch (err: any) {
      setError(err.message || 'Editing failed');
    } finally {
      setIsEditing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-2">
          <Wand2 className="w-8 h-8 text-clay-600" />
          Design Studio
        </h1>
        <p className="text-stone-500 mt-2">Generate concepts or edit texture images using Gemini AI.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-stone-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'generate' ? 'bg-white shadow text-clay-800' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Generate New
        </button>
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-6 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'edit' ? 'bg-white shadow text-clay-800' : 'text-stone-500 hover:text-stone-700'
          }`}
        >
          Edit Image
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* GENERATE TAB */}
      {activeTab === 'generate' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <form onSubmit={handleGenSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Prompt</label>
                  <textarea 
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    placeholder="E.g., A ceramic pot with ancient greek patterns, blue and white glaze..."
                    className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-clay-500 focus:border-clay-500 min-h-[100px]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Aspect Ratio</label>
                  <select 
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-clay-500"
                  >
                    <option value="1:1">1:1 (Square)</option>
                    <option value="4:3">4:3</option>
                    <option value="3:4">3:4</option>
                    <option value="16:9">16:9 (Landscape)</option>
                    <option value="9:16">9:16 (Portrait)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isGenerating || !genPrompt}
                  className="w-full py-3 bg-clay-600 hover:bg-clay-700 text-white rounded-xl font-bold shadow-lg shadow-clay-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                  Generate Concept
                </button>
              </form>
            </div>
          </div>

          <div className="bg-stone-100 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center min-h-[400px] overflow-hidden relative">
            {genImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={genImage} alt="Generated" className="max-w-full max-h-full object-contain" />
                <a 
                  href={genImage} 
                  download={`generated-pot-${Date.now()}.png`}
                  className="absolute bottom-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-stone-50 text-stone-700"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            ) : (
              <div className="text-stone-400 flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>Generated image will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT TAB */}
      {activeTab === 'edit' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <form onSubmit={handleEditSubmit} className="space-y-4">
                
                {/* Upload Area */}
                <div className="relative">
                  <label className="block text-sm font-medium text-stone-700 mb-1">Source Image</label>
                  <div className="border-2 border-dashed border-stone-300 rounded-xl p-4 text-center cursor-pointer hover:bg-stone-50 transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleEditFileSelect} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {editImagePreview ? (
                      <div className="flex items-center gap-4">
                        <img src={editImagePreview} className="w-16 h-16 object-cover rounded-lg" />
                        <div className="text-left overflow-hidden">
                          <p className="text-sm font-medium truncate">{editImageFile?.name}</p>
                          <p className="text-xs text-stone-400">Click to change</p>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                         <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                         <p className="text-sm text-stone-500">Upload image to edit</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Edit Instruction</label>
                  <textarea 
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="E.g., Add a retro filter, remove the background, add a crack texture..."
                    className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-clay-500 focus:border-clay-500 min-h-[100px]"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={isEditing || !editPrompt || !editImagePreview}
                  className="w-full py-3 bg-clay-600 hover:bg-clay-700 text-white rounded-xl font-bold shadow-lg shadow-clay-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isEditing ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                  Apply Edit
                </button>
              </form>
            </div>
          </div>

          <div className="bg-stone-100 rounded-2xl border-2 border-dashed border-stone-200 flex items-center justify-center min-h-[400px] overflow-hidden relative">
             {resultImage ? (
              <div className="relative w-full h-full flex items-center justify-center">
                <img src={resultImage} alt="Edited" className="max-w-full max-h-full object-contain" />
                <a 
                  href={resultImage} 
                  download={`edited-pot-${Date.now()}.png`}
                  className="absolute bottom-4 right-4 p-2 bg-white rounded-lg shadow-md hover:bg-stone-50 text-stone-700"
                >
                  <Download className="w-5 h-5" />
                </a>
              </div>
            ) : (
              <div className="text-stone-400 flex flex-col items-center">
                <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                <p>Result will appear here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}