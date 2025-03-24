import React from 'react';
import { Card } from "./ui/card";
import { useDiagnostic } from '../context/DiagnosticContext';

interface EnhancedPart {
  name: string;
  brand: string;
  price: string;
}

interface TechnicalNotes {
  commonIssues: string[];
  recalls?: string[];
  serviceIntervals?: string[];
  tsbs?: string[];
}

interface RecommendedFix {
  fix: string;
  difficulty: string;
  estimatedCost: string;
  professionalOnly?: boolean;
  parts?: string[] | EnhancedPart[];
}

// Helper function to check if an array is of EnhancedPart type
const isEnhancedPartArray = (parts: string[] | EnhancedPart[]): parts is EnhancedPart[] => {
  return parts.length > 0 && 
    typeof parts[0] === 'object' && 
    'name' in parts[0] && 
    'brand' in parts[0] && 
    'price' in parts[0];
};

export const DiagnosticDisplay: React.FC = () => {
  const { diagnosticInfo } = useDiagnostic();

  // Render diagnostic steps section
  const renderDiagnosticSteps = () => {
    if (!diagnosticInfo.diagnosticSteps?.length) return null;

    return (
      <Card className="p-4 bg-gray-800 bg-opacity-40">
        <h3 className="text-xl font-bold text-blue-400 mb-3">Diagnostic Steps</h3>
        <div className="space-y-3">
          {diagnosticInfo.diagnosticSteps.map((step, index) => (
            <div key={index} className="bg-gray-700 bg-opacity-40 p-3 rounded-lg">
              <div className="font-semibold text-blue-300">Step {index + 1}: {step.step}</div>
              <div className="text-gray-300 mt-1">{step.details}</div>
              {step.tools && step.tools.length > 0 && (
                <div className="text-blue-200 text-sm mt-2">
                  Tools needed: {step.tools.join(', ')}
                </div>
              )}
              {step.expectedReadings && (
                <div className="text-blue-200 text-sm mt-1">
                  Expected readings: {step.expectedReadings}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Render possible causes section
  const renderPossibleCauses = () => {
    if (!diagnosticInfo.possibleCauses?.length) return null;

    return (
      <Card className="p-4 bg-gray-800 bg-opacity-40">
        <h3 className="text-xl font-bold text-yellow-400 mb-3">Possible Causes</h3>
        <div className="space-y-3">
          {diagnosticInfo.possibleCauses.map((cause, index) => (
            <div key={index} className="bg-gray-700 bg-opacity-40 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-yellow-300">{index + 1}. {cause.cause}</div>
                <div className="text-yellow-200 text-sm px-2 py-1 bg-yellow-900 bg-opacity-50 rounded">
                  {cause.likelihood}
                </div>
              </div>
              <div className="text-gray-300 mt-1">{cause.explanation}</div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Render recommended fixes section
  const renderRecommendedFixes = () => {
    if (!diagnosticInfo.recommendedFixes?.length) return null;

    return (
      <Card className="p-4 bg-gray-800 bg-opacity-40">
        <h3 className="text-xl font-bold text-green-400 mb-3">Recommended Fixes</h3>
        <div className="space-y-3">
          {diagnosticInfo.recommendedFixes.map((fix, index) => (
            <div key={index} className="bg-gray-700 bg-opacity-40 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-green-300">{index + 1}. {fix.fix}</div>
                <div className="text-green-200">{fix.estimatedCost}</div>
              </div>
              <div className="flex justify-between text-gray-300 mt-1">
                <span>Difficulty: {fix.difficulty}</span>
                {fix.professionalOnly && (
                  <span className="text-red-400">Professional installation required</span>
                )}
              </div>
              {fix.parts && fix.parts.length > 0 && (
                <div className="text-gray-400 text-sm mt-2">
                  Required parts: {isEnhancedPartArray(fix.parts)
                    ? fix.parts.map(part => `${part.name} (${part.brand} - ${part.price})`).join(', ')
                    : fix.parts.join(', ')
                  }
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Render technical notes section
  const renderTechnicalNotes = () => {
    if (!diagnosticInfo.technicalNotes) return null;
    const notes = diagnosticInfo.technicalNotes as TechnicalNotes;

    return (
      <Card className="p-4 bg-gray-800 bg-opacity-40">
        <h3 className="text-xl font-bold text-red-400 mb-3">Technical Notes</h3>
        
        {notes.commonIssues?.length > 0 && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-red-300 mb-2">Common Issues</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {notes.commonIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {notes.recalls && notes.recalls.length > 0 && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-red-300 mb-2">Recalls</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {notes.recalls.map((recall, index) => (
                <li key={index}>{recall}</li>
              ))}
            </ul>
          </div>
        )}

        {notes.serviceIntervals && notes.serviceIntervals.length > 0 && (
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-red-300 mb-2">Service Intervals</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {notes.serviceIntervals.map((interval, index) => (
                <li key={index}>{interval}</li>
              ))}
            </ul>
          </div>
        )}

        {notes.tsbs && notes.tsbs.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-red-300 mb-2">Technical Service Bulletins</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-300">
              {notes.tsbs.map((tsb, index) => (
                <li key={index}>{tsb}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>
    );
  };

  // Render parts data section
  const renderPartsData = () => {
    if (!diagnosticInfo.partsData || Object.keys(diagnosticInfo.partsData).length === 0) return null;

    return (
      <Card className="p-4 bg-gray-800 bg-opacity-40">
        <h3 className="text-xl font-bold text-purple-400 mb-3">Parts Information</h3>
        {Object.entries(diagnosticInfo.partsData).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h4 className="text-lg font-semibold text-purple-300 mb-2">{category}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((item, index) => (
                <div key={index} className="bg-gray-700 bg-opacity-40 p-3 rounded-lg">
                  <div className="font-semibold text-purple-200">{item.name}</div>
                  <div className="flex justify-between text-gray-300">
                    <span>{item.brand}</span>
                    <span>{item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-4">
        {renderDiagnosticSteps()}
        {renderPossibleCauses()}
      </div>
      <div className="space-y-4">
        {renderRecommendedFixes()}
        {renderTechnicalNotes()}
        {renderPartsData()}
      </div>
    </div>
  );
}; 