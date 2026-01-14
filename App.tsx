import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { UploadCloud, Box, Home as HomeIcon, HelpCircle, Palette } from 'lucide-react';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Viewer from './pages/Viewer';
import Help from './pages/Help';
import Studio from './pages/Studio';

const NavBar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path 
    ? "text-clay-700 bg-clay-100 font-semibold" 
    : "text-stone-500 hover:text-clay-600 hover:bg-stone-100";

  return (
    <nav className="w-64 bg-white border-r border-stone-200 h-screen flex flex-col fixed left-0 top-0 z-10 shadow-sm">
      <div className="p-6 border-b border-stone-100">
        <h1 className="text-2xl font-bold text-clay-800 flex items-center gap-2">
          <Box className="w-8 h-8" />
          PotFix 3D
        </h1>
        <p className="text-xs text-stone-400 mt-1">AI-Powered Restoration</p>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1">
        <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}>
          <HomeIcon className="w-5 h-5" />
          Home
        </Link>
        <Link to="/upload" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/upload')}`}>
          <UploadCloud className="w-5 h-5" />
          Upload & Repair
        </Link>
         <Link to="/studio" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/studio')}`}>
          <Palette className="w-5 h-5" />
          Design Studio
        </Link>
        <Link to="/help" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/help')}`}>
          <HelpCircle className="w-5 h-5" />
          Guide & Help
        </Link>
      </div>

      <div className="p-6 border-t border-stone-100">
        <div className="bg-clay-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-clay-900 mb-1">Status</h4>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs text-stone-600">System Online</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen bg-stone-50">
        <NavBar />
        <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/viewer/:id" element={<Viewer />} />
              <Route path="/studio" element={<Studio />} />
              <Route path="/help" element={<Help />} />
            </Routes>
          </div>
        </main>
      </div>
    </HashRouter>
  );
}