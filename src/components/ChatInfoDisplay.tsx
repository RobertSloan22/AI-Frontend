import React from 'react';
import { Card } from "./ui/card";

interface DiagnosticStep {
  step: string;
  details: string;
  tools?: string[];
  expectedReadings?: string;
}

interface PossibleCause {
  cause: string;
  likelihood: string;
  explanation: string;
}

interface RecommendedFix {
  fix: string;
  difficulty: string;
  estimatedCost: string;
  professionalOnly?: boolean;
  parts?: string[];
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

interface ExtractedInfo {
  diagnosticSteps?: DiagnosticStep[];
  possibleCauses?: PossibleCause[];
  recommendedFixes?: RecommendedFix[];
  technicalNotes?: TechnicalNotes;
  partsData?: {
    [category: string]: ItemData[];
  };
}

interface ChatInfoDisplayProps {
  messages: Array<{ text: string; sender: "user" | "eliza" }>;
}

export const ChatInfoDisplay: React.FC<ChatInfoDisplayProps> = ({ messages }) => {
  const extractInfo = (messages: Array<{ text: string; sender: "user" | "eliza" }>): ExtractedInfo => {
    const info: ExtractedInfo = {};
    
    messages.forEach(message => {
      if (message.sender === "eliza") {
        // Extract Diagnostic Steps
        if (message.text.includes("Diagnostic Steps:")) {
          const steps: DiagnosticStep[] = [];
          const stepMatches = message.text.matchAll(/(\d+)\.\s+Step:\s+(.*?)\s+Details:\s+(.*?)(?=\d+\.\s+Step:|$)/gs);
          for (const match of stepMatches) {
            steps.push({
              step: match[2].trim(),
              details: match[3].trim()
            });
          }
          if (steps.length > 0) info.diagnosticSteps = steps;
        }

        // Extract Possible Causes
        if (message.text.includes("Possible Causes:")) {
          const causes: PossibleCause[] = [];
          const causeMatches = message.text.matchAll(/(\d+)\.\s+(.*?)\s+\((.*?)\)\s+(.*?)(?=\d+\.|$)/gs);
          for (const match of causeMatches) {
            causes.push({
              cause: match[2].trim(),
              likelihood: match[3].trim(),
              explanation: match[4].trim()
            });
          }
          if (causes.length > 0) info.possibleCauses = causes;
        }

        // Extract Recommended Fixes
        if (message.text.includes("Recommended Fixes:")) {
          const fixes: RecommendedFix[] = [];
          const fixMatches = message.text.matchAll(/(\d+)\.\s+(.*?)\s+Difficulty:\s+(.*?)\s+Cost:\s+\$([\d.]+)/gs);
          for (const match of fixMatches) {
            fixes.push({
              fix: match[2].trim(),
              difficulty: match[3].trim(),
              estimatedCost: `$${match[4].trim()}`
            });
          }
          if (fixes.length > 0) info.recommendedFixes = fixes;
        }

        // Extract Parts Data
        if (message.text.includes("Components:")) {
          const partsData: { [category: string]: ItemData[] } = {};
          const categoryMatches = message.text.matchAll(/(.*?) Components:\s+((?:.*?\n)*)/gs);
          for (const match of categoryMatches) {
            const category = match[1].trim();
            const items: ItemData[] = [];
            const itemMatches = match[2].matchAll(/- (.*?):\s*\$(\d+\.\d+)/g);
            for (const itemMatch of itemMatches) {
              const name = itemMatch[1].trim();
              const brand = name.split(" ")[0];
              items.push({
                name,
                brand,
                price: `$${itemMatch[2]}`
              });
            }
            if (items.length > 0) partsData[category] = items;
          }
          if (Object.keys(partsData).length > 0) info.partsData = partsData;
        }

        // Extract Technical Notes
        if (message.text.includes("Technical Notes:")) {
          const technicalNotes: TechnicalNotes = {
            commonIssues: [],
            recalls: [],
            serviceIntervals: [],
            tsbs: []
          };

          const sections = message.text.split(/(?=Common Issues:|Recalls:|Service Intervals:|Technical Service Bulletins:)/);
          sections.forEach(section => {
            const lines = section.split('\n').map(line => line.trim()).filter(Boolean);
            if (section.includes("Common Issues:")) {
              technicalNotes.commonIssues = lines.slice(1).filter(line => line.startsWith('-')).map(line => line.slice(1).trim());
            } else if (section.includes("Recalls:")) {
              technicalNotes.recalls = lines.slice(1).filter(line => line.startsWith('-')).map(line => line.slice(1).trim());
            } else if (section.includes("Service Intervals:")) {
              technicalNotes.serviceIntervals = lines.slice(1).filter(line => line.startsWith('-')).map(line => line.slice(1).trim());
            } else if (section.includes("Technical Service Bulletins:")) {
              technicalNotes.tsbs = lines.slice(1).filter(line => line.startsWith('-')).map(line => line.slice(1).trim());
            }
          });

          if (Object.values(technicalNotes).some(arr => arr.length > 0)) {
            info.technicalNotes = technicalNotes;
          }
        }
      }
    });

    return info;
  };

  const extractedInfo = extractInfo(messages);

  return (
    <div className="space-y-4">
      {/* Diagnostic Steps */}
      {extractedInfo.diagnosticSteps && extractedInfo.diagnosticSteps.length > 0 && (
        <Card className="p-4 bg-gray-800 bg-opacity-40">
          <h3 className="text-xl font-bold text-blue-400 mb-3">Diagnostic Steps</h3>
          <div className="space-y-3">
            {extractedInfo.diagnosticSteps.map((step, index) => (
              <div key={index} className="bg-gray-700 bg-opacity-40 p-3 rounded-lg">
                <div className="font-semibold text-blue-300">{index + 1}. {step.step}</div>
                <div className="text-gray-300 mt-1">{step.details}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Possible Causes */}
      {extractedInfo.possibleCauses && extractedInfo.possibleCauses.length > 0 && (
        <Card className="p-4 bg-gray-800 bg-opacity-40">
          <h3 className="text-xl font-bold text-yellow-400 mb-3">Possible Causes</h3>
          <div className="space-y-3">
            {extractedInfo.possibleCauses.map((cause, index) => (
              <div key={index} className="bg-gray-700 bg-opacity-40 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-yellow-300">{index + 1}. {cause.cause}</div>
                  <div className="text-yellow-200 text-sm">{cause.likelihood}</div>
                </div>
                <div className="text-gray-300 mt-1">{cause.explanation}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommended Fixes */}
      {extractedInfo.recommendedFixes && extractedInfo.recommendedFixes.length > 0 && (
        <Card className="p-4 bg-gray-800 bg-opacity-40">
          <h3 className="text-xl font-bold text-green-400 mb-3">Recommended Fixes</h3>
          <div className="space-y-3">
            {extractedInfo.recommendedFixes.map((fix, index) => (
              <div key={index} className="bg-gray-700 bg-opacity-40 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-green-300">{index + 1}. {fix.fix}</div>
                  <div className="text-green-200">{fix.estimatedCost}</div>
                </div>
                <div className="text-gray-300 mt-1">Difficulty: {fix.difficulty}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Parts Data */}
      {extractedInfo.partsData && Object.keys(extractedInfo.partsData).length > 0 && (
        <Card className="p-4 bg-gray-800 bg-opacity-40">
          <h3 className="text-xl font-bold text-purple-400 mb-3">Parts Information</h3>
          {Object.entries(extractedInfo.partsData).map(([category, items]) => (
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
      )}

      {/* Technical Notes */}
      {extractedInfo.technicalNotes && (
        <Card className="p-4 bg-gray-800 bg-opacity-40">
          <h3 className="text-xl font-bold text-red-400 mb-3">Technical Notes</h3>
          
          {extractedInfo.technicalNotes.commonIssues.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-red-300 mb-2">Common Issues</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {extractedInfo.technicalNotes.commonIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          )}

          {extractedInfo.technicalNotes.recalls?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-red-300 mb-2">Recalls</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {extractedInfo.technicalNotes.recalls.map((recall, index) => (
                  <li key={index}>{recall}</li>
                ))}
              </ul>
            </div>
          )}

          {extractedInfo.technicalNotes.serviceIntervals?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-red-300 mb-2">Service Intervals</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {extractedInfo.technicalNotes.serviceIntervals.map((interval, index) => (
                  <li key={index}>{interval}</li>
                ))}
              </ul>
            </div>
          )}

          {extractedInfo.technicalNotes.tsbs?.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-red-300 mb-2">Technical Service Bulletins</h4>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {extractedInfo.technicalNotes.tsbs.map((tsb, index) => (
                  <li key={index}>{tsb}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}; 