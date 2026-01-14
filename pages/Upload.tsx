import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileType, AlertCircle, Loader2 } from 'lucide-react';

export default function Upload() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    const validExtensions = ['.obj', '.zip'];
    const extension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    
    if (!validExtensions.includes(extension)) {
      setError("Please upload an .obj file or a .zip containing the model.");
      return;
    }
    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('model', file);

    try {
      // Use relative path; Vite proxy will forward to localhost:3001
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      navigate(`/viewer/${data.id}`);
    } catch (err) {
      setError("Failed to upload file. Please ensure the backend server is running.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-stone-800">Upload Your Scan</h2>
        <p className="text-stone-500 mt-2">Supports .OBJ files (exported from KIRI Engine) or .ZIP archives.</p>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-3 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer
          ${isDragging 
            ? 'border-clay-500 bg-clay-50 scale-[1.02]' 
            : 'border-stone-300 hover:border-clay-400 hover:bg-stone-50 bg-white'
          }
        `}
      >
        <input 
          type="file" 
          id="fileInput" 
          className="hidden" 
          accept=".obj,.zip" 
          onChange={handleFileSelect} 
        />
        
        {!file ? (
          <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <UploadCloud className={`w-10 h-10 ${isDragging ? 'text-clay-600' : 'text-stone-400'}`} />
            </div>
            <p className="text-xl font-medium text-stone-700">Drag & Drop your 3D model here</p>
            <p className="text-stone-400 mt-2">or <span className="text-clay-600 underline decoration-2 underline-offset-2">browse files</span></p>
            <p className="text-xs text-stone-300 mt-8">Max file size: 50MB</p>
          </label>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-clay-100 rounded-full flex items-center justify-center mb-6">
              <FileType className="w-10 h-10 text-clay-600" />
            </div>
            <p className="text-xl font-medium text-stone-800">{file.name}</p>
            <p className="text-stone-500 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setFile(null)}
                className="px-6 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-clay-600 text-white rounded-lg hover:bg-clay-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</> : 'Start Processing'}
              </button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}