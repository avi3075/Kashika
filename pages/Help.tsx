import React from 'react';

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12">
      <div className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl font-bold text-stone-800">User Guide</h1>
        <p className="text-stone-500 mt-2">How to get the best results with PotFix 3D.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-clay-700">1. Scanning with KIRI Engine</h2>
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3 text-stone-600">
          <p>
            We recommend using the <strong>KIRI Engine</strong> app (iOS/Android) for photogrammetry.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Place your pot on a pattern-rich surface (like a newspaper).</li>
            <li>Ensure even lighting (outdoors on a cloudy day is best).</li>
            <li>Take 20-40 photos circling the object at different heights.</li>
            <li>Process the scan in KIRI and export as <strong>OBJ</strong> format.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-clay-700">2. Preparing for Upload</h2>
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3 text-stone-600">
          <p>PotFix 3D accepts <strong>.obj</strong> files.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>If you have textures (.mtl + images), zip them together with the .obj.</li>
            <li>Currently, the viewer works best with single-mesh OBJs.</li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-clay-700">3. Using AI Repair</h2>
        <div className="bg-white p-6 rounded-xl border border-stone-200 space-y-3 text-stone-600">
          <p>
            The "Auto Repair" function uses algorithms to identify:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Non-manifold edges:</strong> Edges that share more than 2 faces (geometry errors).</li>
            <li><strong>Holes:</strong> Open boundaries in the mesh.</li>
          </ul>
          <p className="mt-2 text-sm italic bg-stone-50 p-2 rounded">
            Note: Complex texture in-painting is currently experimental. The geometry will be fixed, but the color of the patch may be a solid filler color.
          </p>
        </div>
      </section>
    </div>
  );
}