import React from 'react';
import { Link } from 'react-router-dom';
import { Upload, ArrowRight, Smartphone, Cpu, Box } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-white rounded-3xl p-12 shadow-sm border border-stone-100 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-clay-300 to-clay-600"></div>
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h1 className="text-5xl font-extrabold text-stone-800 tracking-tight leading-tight">
            Restore Your Pottery with <span className="text-clay-600">Artificial Intelligence</span>
          </h1>
          <p className="text-xl text-stone-500">
            Scan your broken clay pots using KIRI Engine, upload the 3D model, and let our Gemini-powered AI analyze and repair the mesh automatically.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link 
              to="/upload" 
              className="px-8 py-4 bg-clay-600 hover:bg-clay-700 text-white rounded-xl font-bold shadow-lg shadow-clay-200 transition-all transform hover:-translate-y-1 flex items-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload 3D Pot
            </Link>
            <a 
              href="#how-it-works" 
              className="px-8 py-4 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              How it Works
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-clay-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
      </section>

      {/* Feature Grid */}
      <section id="how-it-works" className="grid md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-clay-100 rounded-xl flex items-center justify-center text-clay-700 mb-6">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-3">1. Scan with KIRI</h3>
          <p className="text-stone-500 leading-relaxed">
            Use the KIRI Engine app on your smartphone to scan your broken pot. Export the scan as an .OBJ file.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-700 mb-6">
            <Box className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-3">2. Upload & View</h3>
          <p className="text-stone-500 leading-relaxed">
            Upload your model here. Our viewer immediately calculates precise dimensions (Height, Width, Depth).
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-700 mb-6">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-stone-800 mb-3">3. AI Repair</h3>
          <p className="text-stone-500 leading-relaxed">
            Our AI detects non-manifold geometry and holes, suggesting repairs and generating a fixed OBJ for download.
          </p>
        </div>
      </section>
    </div>
  );
}