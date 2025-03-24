import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { researchService } from '../app/src/services/researchService';
import { toast } from 'react-hot-toast';
import axiosInstance from '../utils/axiosConfig';

// Enhanced part structure
interface EnhancedPart {
  name: string;
  partNumber: string;
  estimatedPrice: string;
  notes: string;
}

// Updated ResearchResponse interface
export interface ResearchResponse {
  diagnosticSteps: Array<{
    step: string;
    details: string;
    componentsTested: string[];
    testingProcedure: string;
    tools: string[];
    expectedReadings: string;
    notes: string;
    estimatedTime: string;
    skillLevel: string;
  }>;
  possibleCauses: Array<{
    cause: string;
    likelihood: "High" | "Medium" | "Low";
    explanation: string;
    commonSymptoms: string[];
    relatedComponents: string[];
  }>;
  recommendedFixes: Array<{
    fix: string;
    difficulty: "Easy" | "Moderate" | "Complex";
    estimatedCost: string;
    professionalOnly: boolean;
    parts: Array<EnhancedPart>;
    laborTime: string;
    specialTools: string[];
  }>;
  technicalNotes: {
    commonIssues: string[];
    serviceIntervals: string[];
    recalls: string[];
    tsbs: string[];
    specifications: {
      torqueSpecs: string[];
      fluidCapacities: string[];
      adjustments: string[];
    };
  };
  references: Array<{
    source: string;
    url?: string;
    type: "TSB" | "Manual" | "Forum" | "Recall";
    relevance: string;
    documentNumber: string;
  }>;
  safetyPrecautions: string[];
  requiredEquipment: string[];
}

interface DetailedResearchResponse {
  title: string;
  category: string;
  detailedDescription: string;
  additionalSteps?: string[];
  warnings?: string[];
  expertTips?: string[];
  relatedIssues?: string[];
  estimatedTime?: string;
  requiredExpertise?: string;
  additionalResources?: Array<{
    title: string;
    url?: string;
    description: string;
  }>;
}

interface ResearchContextType {
  researchData: ResearchResponse | null;
  detailedData: Record<string, DetailedResearchResponse>;
  problem: string;
  setProblem: (problem: string) => void;
  setResearchData: (data: ResearchResponse | null) => void;
  addDetailedData: (key: string, data: DetailedResearchResponse) => void;
  clearResearch: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isLoadingAllDetails: boolean;
  allDetailsLoaded: boolean;
  preloadAllDetails: () => Promise<void>;
  loadDetail: (category: string, item: any, index: number) => Promise<void>;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export function ResearchProvider({ children }: { children: ReactNode }) {
  const [researchData, setResearchData] = useState<ResearchResponse | null>(null);
  const [detailedData, setDetailedData] = useState<Record<string, DetailedResearchResponse>>({});
  const [problem, setProblem] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAllDetails, setIsLoadingAllDetails] = useState(false);
  const [allDetailsLoaded, setAllDetailsLoaded] = useState(false);

  // Update research service whenever data changes
  useEffect(() => {
    researchService.updateResearchData({
      problem,
      researchData,
      detailedData
    });
  }, [problem, researchData, detailedData]);

  const addDetailedData = (key: string, data: DetailedResearchResponse) => {
    setDetailedData(prev => ({
      ...prev,
      [key]: data
    }));
  };

  const clearResearch = () => {
    setResearchData(null);
    setDetailedData({});
    setProblem('');
    researchService.updateResearchData({
      problem: '',
      researchData: null,
      detailedData: {}
    });
  };

  const preloadAllDetails = async () => {
    if (!researchData || isLoadingAllDetails) return;
    setIsLoadingAllDetails(true);
    try {
      const preloadPromises: Promise<void>[] = [];

      researchData.diagnosticSteps?.forEach((step, index) => {
        preloadPromises.push(loadDetail('diagnostic', step, index));
      });
      researchData.possibleCauses?.forEach((cause, index) => {
        preloadPromises.push(loadDetail('causes', cause, index));
      });
      researchData.recommendedFixes?.forEach((fix, index) => {
        preloadPromises.push(loadDetail('fixes', fix, index));
      });

      await Promise.all(preloadPromises);
      setAllDetailsLoaded(true);
      toast.success('All detailed information has been preloaded');
    } catch (error) {
      console.error('Error preloading all details:', error);
      toast.error('Failed to preload all details');
    } finally {
      setIsLoadingAllDetails(false);
    }
  };

  // Add loadDetail function
  const loadDetail = async (category: string, item: any, index: number) => {
    const preloadKey = `${category}-${index}`;
    if (detailedData[preloadKey]) return;

    try {
      // Format the item data based on category
      let formattedItem;
      switch (category) {
        case 'diagnostic':
          formattedItem = {
            step: item.step,
            details: item.details,
            componentsTested: item.componentsTested,
            testingProcedure: item.testingProcedure,
            tools: item.tools,
            expectedReadings: item.expectedReadings,
            notes: item.notes,
            estimatedTime: item.estimatedTime,
            skillLevel: item.skillLevel
          };
          break;
        case 'causes':
          formattedItem = {
            cause: item.cause,
            likelihood: item.likelihood,
            explanation: item.explanation,
            commonSymptoms: item.commonSymptoms,
            relatedComponents: item.relatedComponents
          };
          break;
        case 'fixes':
          formattedItem = {
            fix: item.fix,
            difficulty: item.difficulty,
            estimatedCost: item.estimatedCost,
            professionalOnly: item.professionalOnly,
            parts: item.parts,
            laborTime: item.laborTime || '',
            specialTools: item.specialTools || []
          };
          break;
        default:
          formattedItem = item;
      }

      const response = await axiosInstance.post('/research/detail', {
        category,
        item: formattedItem,
        index,
        originalProblem: problem
      });

      if (response.data?.result) {
        let parsed = typeof response.data.result === 'string' 
          ? JSON.parse(response.data.result) 
          : response.data.result;

        // Ensure all optional fields are at least empty strings
        const detailData = {
          ...parsed,
          url: parsed.url || '',
          fileType: parsed.fileType || '',
          thumbnail: parsed.thumbnail || '',
          sourceUrl: parsed.sourceUrl || '',
          link: parsed.link || ''
        };

        addDetailedData(preloadKey, detailData);
      }
    } catch (error) {
      console.error(`Failed to load detail for ${category} ${index}:`, error);
      throw error;
    }
  };

  const value = {
    researchData,
    detailedData,
    problem,
    setProblem,
    setResearchData,
    addDetailedData,
    clearResearch,
    isLoading,
    setIsLoading,
    isLoadingAllDetails,
    allDetailsLoaded,
    preloadAllDetails,
    loadDetail
  };

  return (
    <ResearchContext.Provider value={value}>
      {children}
    </ResearchContext.Provider>
  );
}

export function useResearch() {
  const context = useContext(ResearchContext);
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
}

// Export types for use in other components
export type { ResearchResponse, DetailedResearchResponse, EnhancedPart }; 