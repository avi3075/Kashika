import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import * as THREE from 'three';

interface ModelProps {
  url: string | null;
  wireframe: boolean;
  color: string;
}

export function Model({ url, wireframe, color }: ModelProps) {
  // If no url, return null (or placeholder)
  if (!url) return null;

  const obj = useLoader(OBJLoader, url);

  const clonedObj = useMemo(() => {
    // Clone to avoid modifying the cached loader object if we switch views
    const clone = obj.clone();
    
    // Apply material properties
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: color,
          wireframe: wireframe,
          roughness: 0.8,
          flatShading: false,
          side: THREE.DoubleSide
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [obj, wireframe, color]);

  return <primitive object={clonedObj} />;
}