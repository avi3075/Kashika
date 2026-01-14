export interface ModelMetadata {
  id: string;
  filename: string;
  originalFilePath: string;
  repairedFilePath?: string;
  uploadDate: string;
  dimensions: {
    height: number;
    width: number;
    depth: number;
    units: string;
  };
  status: 'uploaded' | 'repairing' | 'repaired' | 'failed';
  repairMode?: 'auto' | 'manual';
  aiSuggestion?: string;
}

export interface RepairRequest {
  mode: 'auto' | 'manual';
  manualSelectionMask?: number[]; // Array of face indices
  prompt?: string; // Optional user prompt for AI
}

export interface RepairResponse {
  id: string;
  repairedFilePath: string;
  message: string;
  aiAnalysis?: string;
}
