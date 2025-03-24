import React, { useState, useEffect } from 'react';
import { useCustomer } from '../../context/CustomerContext';
import axiosInstance from '../../utils/axiosConfig';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import { agentService } from '../../services/agentService';
import { ImageSearchModal } from '../assistant/ImageSearchModal';
import { Imagemodal } from '../assistant/Imagemodal';
import { Save, Search, ExternalLink, X, AlertTriangle, Wrench, DollarSign, Clock } from 'lucide-react';
import { z } from 'zod';

// Updated Service Research Schema with new diagnostic details and partsAvailability section
const ServiceResearchSchema = z.object({
    diagnosticSteps: z.array(z.object({
        step: z.string(),
        details: z.string(),
        componentsTested: z.array(z.string()).optional(),
        testingProcedure: z.string().optional(),
        tools: z.array(z.string()).optional(),
        expectedReadings: z.string().optional(),
        notes: z.string().optional()
    })),
    possibleCauses: z.array(z.object({
        cause: z.string(),
        likelihood: z.string(),
        explanation: z.string()
    })),
    recommendedFixes: z.array(z.object({
        fix: z.string(),
        difficulty: z.string(),
        estimatedCost: z.string(),
        professionalOnly: z.boolean().optional(),
        parts: z.array(z.string()).optional()
    })),
    technicalNotes: z.object({
        commonIssues: z.array(z.string()),
        serviceIntervals: z.array(z.string()).optional(),
        recalls: z.array(z.string()).optional(),
        tsbs: z.array(z.string()).optional()
    }),
    references: z.array(z.object({
        source: z.string(),
        url: z.string().optional(),
        type: z.string(),
        relevance: z.string()
    })),
    partsAvailability: z.array(z.object({
        part: z.string(),
        supplier: z.string(),
        availability: z.string(),
        cost: z.string(),
        url: z.string().optional(),
        brand: z.string().optional(),
        partNumber: z.string().optional(),
        warranty: z.string().optional(),
        specifications: z.record(z.string()).optional()
    })).optional()
});

// Types based on the schema
type ServiceResearchResponse = z.infer<typeof ServiceResearchSchema>;

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

interface ServiceRequest {
    serviceType: string;
    description: string;
    priority: string;
    additionalNotes?: string;
}

interface ImageResult {
    title: string;
    imageUrl: string;
    thumbnailUrl: string;
    source: string;
    link: string;
}

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    loading: boolean;
    data: DetailedResearchResponse | null;
}

const DetailModal: React.FC<DetailModalProps> = ({ isOpen, onClose, loading, data }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-3xl font-bold text-white">{data?.title}</h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={28} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Main Description */}
                        <div className="bg-gray-700 p-4 rounded-lg">
                            <h4 className="text-blue-400 text-2xl mb-2">Detailed Description</h4>
                            <p className="text-white text-xl">{data?.detailedDescription}</p>
                        </div>

                        {/* Additional Steps */}
                        {data?.additionalSteps && data.additionalSteps.length > 0 && (
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="text-blue-400 text-2xl mb-2">Additional Steps</h4>
                                <ul className="list-disc list-inside text-white space-y-2">
                                    {data.additionalSteps.map((step, index) => (
                                        <li key={index} className="text-xl">{step}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Warnings */}
                        {data?.warnings && data.warnings.length > 0 && (
                            <div className="bg-red-900 bg-opacity-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="text-red-400" size={24} />
                                    <h4 className="text-red-400 text-2xl">Important Warnings</h4>
                                </div>
                                <ul className="list-disc list-inside text-white space-y-2">
                                    {data.warnings.map((warning, index) => (
                                        <li key={index} className="text-xl">{warning}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Expert Tips */}
                        {data?.expertTips && data.expertTips.length > 0 && (
                            <div className="bg-green-900 bg-opacity-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Wrench className="text-green-400" size={24} />
                                    <h4 className="text-green-400 text-2xl">Expert Tips</h4>
                                </div>
                                <ul className="list-disc list-inside text-white space-y-2">
                                    {data.expertTips.map((tip, index) => (
                                        <li key={index} className="text-xl">{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Time and Expertise */}
                        <div className="grid grid-cols-2 gap-4">
                            {data?.estimatedTime && (
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Clock className="text-blue-400" size={24} />
                                        <h4 className="text-blue-400 text-2xl">Estimated Time</h4>
                                    </div>
                                    <p className="text-white mt-2 text-xl">{data.estimatedTime}</p>
                                </div>
                            )}
                            {data?.requiredExpertise && (
                                <div className="bg-gray-700 p-4 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Wrench className="text-blue-400" size={24} />
                                        <h4 className="text-blue-400 text-2xl">Required Expertise</h4>
                                    </div>
                                    <p className="text-white mt-2 text-xl">{data.requiredExpertise}</p>
                                </div>
                            )}
                        </div>

                        {/* Additional Resources */}
                        {data?.additionalResources && data.additionalResources.length > 0 && (
                            <div className="bg-gray-700 p-4 rounded-lg">
                                <h4 className="text-blue-400 text-2xl mb-2">Additional Resources</h4>
                                <div className="space-y-4">
                                    {data.additionalResources.map((resource, index) => (
                                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                                            <h5 className="text-white font-semibold text-xl">{resource.title}</h5>
                                            <p className="text-gray-300 mt-1 text-xl">{resource.description}</p>
                                            {resource.url && (
                                                <a
                                                    href={resource.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-2 mt-2 text-xl"
                                                >
                                                    View Resource
                                                    <ExternalLink size={20} />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const ServiceResearch: React.FC = () => {
    const { selectedCustomer, selectedVehicle } = useCustomer();
    const [serviceRequest, setServiceRequest] = useState<ServiceRequest>({
        serviceType: '',
        description: '',
        priority: 'Normal',
        additionalNotes: ''
    });
    const [researchData, setResearchData] = useState<ServiceResearchResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailData, setDetailData] = useState<DetailedResearchResponse | null>(null);
    const [activeTab, setActiveTab] = useState('diagnostic');

    // Image handling states
    const [isImageSearchModalOpen, setIsImageSearchModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
    const [selectedImage, setSelectedImage] = useState<ImageResult | null>(null);

    const handleSaveImage = async (image: ImageResult) => {
        try {
            const response = await axiosInstance.post('/images/save', {
                title: image.title,
                imageUrl: image.imageUrl,
                thumbnailUrl: image.thumbnailUrl,
                source: image.source,
                link: image.link,
                timestamp: new Date().toISOString()
            });
            return response.data;
        } catch (error) {
            console.error('Error saving image:', error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicle || !serviceRequest.description.trim()) return;

        setIsLoading(true);
        setResearchData(null);

        try {
            const response = await axiosInstance.post('/research/service', {
                serviceRequest,
                vehicle: selectedVehicle,
                customer: selectedCustomer
            });

            if (response.data?.success) {
                try {
                    const validatedData = ServiceResearchSchema.parse(response.data.result);
                    setResearchData(validatedData);
                    
                    if (response.data.warning) {
                        toast.warning(response.data.warning);
                    } else {
                        toast.success('Service research completed successfully');
                    }

                    // Send to AI Assistant if needed
                    try {
                        await sendToElizaChat();
                    } catch (error) {
                        console.error('Error sending to AI Assistant:', error);
                    }
                } catch (validationError) {
                    console.error('Validation error:', validationError);
                    // Still set the data even if validation fails
                    setResearchData(response.data.result);
                    toast.warning('Some research data may be incomplete');
                }
            } else if (response.data?.partialResults) {
                // Handle partial results
                setResearchData(response.data.partialResults);
                toast.warning('Only partial results available');
            }
        } catch (error) {
            console.error('Service research error:', error);
            if (error.response?.data?.partialResults) {
                setResearchData(error.response.data.partialResults);
                toast.warning('Error occurred, but partial results available');
            } else {
                toast.error('Error researching the service request');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const sendToElizaChat = async () => {
        if (!selectedCustomer || !selectedVehicle || !researchData) {
            toast.error('Missing required data to send to AI Assistant');
            return;
        }

        try {
            await agentService.sendComprehensiveData(
                selectedCustomer,
                selectedVehicle,
                [],
                researchData
            );
            toast.success('Research data sent to AI Assistant');
        } catch (error) {
            console.error('Error sending data to AI Assistant:', error);
            toast.error('Failed to send data to AI Assistant');
        }
    };

    // Render functions for each section
    const renderDiagnosticSteps = () => {
        return researchData?.diagnosticSteps?.map((step, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg">
                <h4 className="text-2xl font-semibold text-blue-400">Step {index + 1}</h4>
                <p className="text-white mt-2 text-xl">{step.step}</p>
                <p className="text-gray-300 mt-1 text-xl">{step.details}</p>
                
                {step.componentsTested && step.componentsTested.length > 0 && (
                    <div className="mt-2">
                        <span className="text-blue-400 text-xl">Components to Test:</span>
                        <ul className="list-disc list-inside text-gray-300 ml-4">
                            {step.componentsTested.map((component, i) => (
                                <li key={i} className="text-xl">{component}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {step.testingProcedure && (
                    <div className="mt-2">
                        <span className="text-blue-400 text-xl">Testing Procedure:</span>
                        <p className="text-gray-300 ml-4 text-xl">{step.testingProcedure}</p>
                    </div>
                )}
            </div>
        ));
    };

    // Additional render functions
    const renderPossibleCauses = () => {
        return researchData?.possibleCauses?.map((cause, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                    <h4 className="text-2xl font-semibold text-yellow-400">{cause.cause}</h4>
                    <span className={`px-2 py-1 rounded text-sm ${
                        cause.likelihood.toLowerCase().includes('high') ? 'bg-red-500' :
                        cause.likelihood.toLowerCase().includes('medium') ? 'bg-yellow-500' :
                        'bg-green-500'
                    }`}>
                        {cause.likelihood}
                    </span>
                </div>
                <p className="text-gray-300 mt-2 text-xl">{cause.explanation}</p>
            </div>
        ));
    };

    const renderRecommendedFixes = () => {
        return researchData?.recommendedFixes?.map((fix, index) => (
            <div key={index} className="mb-4 p-4 bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center">
                    <h4 className="text-2xl font-semibold text-green-400">{fix.fix}</h4>
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-sm ${
                            fix.difficulty.toLowerCase().includes('complex') ? 'bg-red-500' :
                            fix.difficulty.toLowerCase().includes('moderate') ? 'bg-yellow-500' :
                            'bg-green-500'
                        }`}>
                            {fix.difficulty}
                        </span>
                        <span className="text-gray-300 text-xl">{fix.estimatedCost}</span>
                    </div>
                </div>
                {fix.professionalOnly && (
                    <div className="mt-2 text-red-400 flex items-center gap-2">
                        <AlertTriangle size={20} />
                        Professional installation required
                    </div>
                )}
                {fix.parts && fix.parts.length > 0 && (
                    <div className="mt-2">
                        <span className="text-blue-400 text-xl">Required Parts:</span>
                        <ul className="list-disc list-inside text-gray-300 ml-4">
                            {fix.parts.map((part, i) => (
                                <li key={i} className="text-xl">{part}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        ));
    };

    const renderTechnicalNotes = () => {
        return (
            <div className="space-y-4">
                {researchData?.technicalNotes?.commonIssues && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <h4 className="text-2xl font-semibold text-blue-400 mb-2">Common Issues</h4>
                        <ul className="list-disc list-inside text-gray-300 text-xl">
                            {researchData.technicalNotes.commonIssues.map((issue, index) => (
                                <li key={index}>{issue}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {researchData?.technicalNotes?.serviceIntervals && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <h4 className="text-2xl font-semibold text-blue-400 mb-2">Service Intervals</h4>
                        <ul className="list-disc list-inside text-gray-300 text-xl">
                            {researchData.technicalNotes.serviceIntervals.map((interval, index) => (
                                <li key={index}>{interval}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {researchData?.technicalNotes?.recalls && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <h4 className="text-2xl font-semibold text-red-400 mb-2">Recalls</h4>
                        <ul className="list-disc list-inside text-gray-300 text-xl">
                            {researchData.technicalNotes.recalls.map((recall, index) => (
                                <li key={index}>{recall}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {researchData?.technicalNotes?.tsbs && (
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <h4 className="text-2xl font-semibold text-yellow-400 mb-2">Technical Service Bulletins</h4>
                        <ul className="list-disc list-inside text-gray-300 text-xl">
                            {researchData.technicalNotes.tsbs.map((tsb, index) => (
                                <li key={index}>{tsb}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const renderPartsAvailability = () => {
        return researchData?.partsAvailability && (
            <div className="space-y-4">
                <h4 className="text-2xl font-semibold text-blue-400 mb-2">Parts Availability</h4>
                {researchData.partsAvailability.map((part, index) => (
                    <div key={index} className="p-4 bg-gray-800 rounded-lg">
                        <div className="flex justify-between items-center">
                            <div>
                                <h5 className="text-white font-semibold text-xl">{part.part}</h5>
                                {part.brand && (
                                    <span className="text-gray-400 text-sm ml-2">Brand: {part.brand}</span>
                                )}
                                {part.partNumber && (
                                    <span className="text-gray-400 text-sm ml-2">Part #: {part.partNumber}</span>
                                )}
                            </div>
                            <span className="text-green-400 text-xl">{part.cost}</span>
                        </div>
                        <div className="mt-2 text-gray-300 text-xl">
                            <p>Supplier: {part.supplier}</p>
                            <p>Availability: {part.availability}</p>
                            {part.warranty && (
                                <p className="text-blue-300">Warranty: {part.warranty}</p>
                            )}
                            {part.specifications && Object.keys(part.specifications).length > 0 && (
                                <div className="mt-2">
                                    <p className="text-blue-400">Specifications:</p>
                                    <ul className="list-disc list-inside ml-4">
                                        {Object.entries(part.specifications).map(([key, value], i) => (
                                            <li key={i} className="text-sm">
                                                {key}: {value}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {part.url && (
                                <a
                                    href={part.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-2 mt-2 text-xl"
                                >
                                    View Part
                                    <ExternalLink size={24} />
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4">
            <form onSubmit={handleSubmit} className="mb-6 bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white mb-2 text-xl">Service Type</label>
                        <input
                            type="text"
                            value={serviceRequest.serviceType}
                            onChange={(e) => setServiceRequest(prev => ({
                                ...prev,
                                serviceType: e.target.value
                            }))}
                            className="w-full p-2 bg-gray-700 text-white rounded text-xl"
                            placeholder="e.g., Maintenance, Repair, Diagnostic"
                        />
                    </div>
                    <div>
                        <label className="block text-white mb-2 text-xl">Priority</label>
                        <select
                            value={serviceRequest.priority}
                            onChange={(e) => setServiceRequest(prev => ({
                                ...prev,
                                priority: e.target.value
                            }))}
                            className="w-full p-2 bg-gray-700 text-white rounded text-xl"
                        >
                            <option value="Low">Low</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-white mb-2 text-xl">Description</label>
                    <textarea
                        value={serviceRequest.description}
                        onChange={(e) => setServiceRequest(prev => ({
                            ...prev,
                            description: e.target.value
                        }))}
                        className="w-full p-2 bg-gray-700 text-white rounded text-xl"
                        rows={3}
                        placeholder="Describe the service needed or issue to diagnose"
                    />
                </div>

                <div className="mt-4">
                    <label className="block text-white mb-2 text-xl">Additional Notes</label>
                    <textarea
                        value={serviceRequest.additionalNotes}
                        onChange={(e) => setServiceRequest(prev => ({
                            ...prev,
                            additionalNotes: e.target.value
                        }))}
                        className="w-full p-2 bg-gray-700 text-white rounded text-xl"
                        rows={2}
                        placeholder="Any additional information or special instructions"
                    />
                </div>

                <div className="mt-4">
                    <Button type="submit" disabled={isLoading} className="text-xl">
                        {isLoading ? 'Researching...' : 'Research Service'}
                    </Button>
                </div>
            </form>

            {/* Research Results */}
            {researchData && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Diagnostic Steps */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-2xl font-bold text-yellow-300 mb-4">Diagnostic Steps</h3>
                        {renderDiagnosticSteps()}
                    </div>

                    {/* Possible Causes */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-2xl font-bold text-yellow-300 mb-4">Possible Causes</h3>
                        {renderPossibleCauses()}
                    </div>

                    {/* Recommended Fixes */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-2xl font-bold text-yellow-300 mb-4">Recommended Fixes</h3>
                        {renderRecommendedFixes()}
                    </div>

                    {/* Technical Notes */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <h3 className="text-2xl font-bold text-yellow-300 mb-4">Technical Notes</h3>
                        {renderTechnicalNotes()}
                    </div>

                    {/* Parts Availability */}
                    {researchData.partsAvailability && (
                        <div className="bg-gray-800 p-4 rounded-lg col-span-full">
                            <h3 className="text-2xl font-bold text-yellow-300 mb-4">Parts Availability</h3>
                            {renderPartsAvailability()}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <DetailModal
                isOpen={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                loading={detailLoading}
                data={detailData}
            />

            <ImageSearchModal
                isOpen={isImageSearchModalOpen}
                onClose={() => setIsImageSearchModalOpen(false)}
                searchResults={searchResults}
                onImageClick={(image) => setSelectedImage(image)}
                onSaveImage={async (image) => {
                    try {
                        await handleSaveImage(image);
                        toast.success('Image saved successfully');
                    } catch (error) {
                        console.error('Error saving image:', error);
                        toast.error('Failed to save image');
                    }
                }}
            />

            {selectedImage && (
                <Imagemodal
                    open={!!selectedImage}
                    onClose={() => setSelectedImage(null)}
                >
                    <div className="flex flex-col items-center">
                        <img
                            src={selectedImage.imageUrl}
                            alt={selectedImage.title}
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                        <p className="mt-4 text-xl text-white">{selectedImage.title}</p>
                        {selectedImage.source && (
                            <p className="mt-2 text-gray-400 text-xl">Source: {selectedImage.source}</p>
                        )}
                    </div>
                </Imagemodal>
            )}
        </div>
    );
};

export default ServiceResearch; 