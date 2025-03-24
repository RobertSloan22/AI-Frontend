import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DiagnosticStep {
  step: string;
  details: string;
  tools?: string[];
  expectedReadings?: string;
  componentsTested?: string[];
  testingProcedure?: string;
  notes?: string;
  estimatedTime?: string;
  skillLevel?: string;
}

interface PossibleCause {
  cause: string;
  likelihood: string;
  explanation: string;
}

interface RecommendedFix {
  fix: string;
  difficulty: "Easy" | "Moderate" | "Complex";
  estimatedCost: string;
  professionalOnly?: boolean;
  parts?: string[];
  laborTime?: string;
  specialTools?: string[];
}

interface TechnicalNotes {
  commonIssues: string[];
  serviceIntervals?: string[];
  recalls?: string[];
  tsbs?: string[];
}

interface ItemData {
  name: string;
  brand: string;
  price: string;
}

export interface DiagnosticInfo {
  diagnosticSteps?: DiagnosticStep[];
  possibleCauses?: PossibleCause[];
  recommendedFixes?: RecommendedFix[];
  technicalNotes?: TechnicalNotes;
  partsData?: {
    [category: string]: ItemData[];
  };
  problem?: string;
  detailedAnalysis?: Record<string, any>;
}

interface DiagnosticContextType {
  diagnosticInfo: DiagnosticInfo;
  updateDiagnosticInfo: (info: Partial<DiagnosticInfo>) => void;
  clearDiagnosticInfo: () => void;
}

const DiagnosticContext = createContext<DiagnosticContextType | undefined>(undefined);

export function DiagnosticProvider({ children }: { children: ReactNode }) {
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo>({});

  const updateDiagnosticInfo = (info: Partial<DiagnosticInfo>) => {
    setDiagnosticInfo(prevInfo => ({
      ...prevInfo,
      ...info,
      technicalNotes: info.technicalNotes ? {
        commonIssues: info.technicalNotes.commonIssues || [],
        recalls: info.technicalNotes.recalls || [],
        serviceIntervals: info.technicalNotes.serviceIntervals || [],
        tsbs: info.technicalNotes.tsbs || []
      } : prevInfo.technicalNotes
    }));
  };

  const clearDiagnosticInfo = () => {
    setDiagnosticInfo({});
  };

  return (
    <DiagnosticContext.Provider value={{ diagnosticInfo, updateDiagnosticInfo, clearDiagnosticInfo }}>
      {children}
    </DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  const context = useContext(DiagnosticContext);
  if (context === undefined) {
    throw new Error('useDiagnostic must be used within a DiagnosticProvider');
  }
  return context;
} 