import { ResearchResponse, DetailedResearchResponse } from '../../../context/ResearchContext';

interface ResearchData {
  problem: string;
  researchData: ResearchResponse | null;
  detailedData: Record<string, DetailedResearchResponse>;
}

class ResearchService {
  private static instance: ResearchService;
  private currentData: ResearchData = {
    problem: '',
    researchData: null,
    detailedData: {}
  };

  private constructor() {}

  public static getInstance(): ResearchService {
    if (!ResearchService.instance) {
      ResearchService.instance = new ResearchService();
    }
    return ResearchService.instance;
  }

  public updateResearchData(data: Partial<ResearchData>) {
    this.currentData = {
      ...this.currentData,
      ...data
    };
  }

  public getResearchData(dataType: 'all' | 'problem' | 'research' | 'detailed'): any {
    switch (dataType) {
      case 'all':
        return this.currentData;
      case 'problem':
        return this.currentData.problem;
      case 'research':
        return this.currentData.researchData;
      case 'detailed':
        return this.currentData.detailedData;
      default:
        return null;
    }
  }
}

export const researchService = ResearchService.getInstance(); 