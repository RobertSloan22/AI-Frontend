import React, { useState } from 'react';
import { CircularProgress } from '@mui/material';
import { ForumCrawlerService } from '../../services/ForumCrawlerService';
import { Input as UiInput } from "../ui/input";
import { Button as UiButton } from "../ui/button";

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    structured?: boolean;
}

interface ForumDTCAnalyzerProps {
    forumUrl: string;
}

// Helper function to format structured content
const formatStructuredResponse = (content: string): JSX.Element => {
    // First, normalize line breaks and split into sections
    const normalizedContent = content.replace(/\r\n/g, '\n');
    
    // Split into sections based on numbered points (1., 2., etc)
    const sections = normalizedContent.match(/\d+\.\s+[^\d]+((?!\d+\.).)*(\n|$)/gs) || [];
    
    return (
        <div className="space-y-4">
            {sections.map((section, index) => {
                // Extract the number and content
                const [, num, text] = section.match(/(\d+)\.\s+(.+)/s) || [];
                
                // Split content into paragraphs
                const paragraphs = text.split('\n').filter(p => p.trim());
                
                return (
                    <div key={index} className="mb-4 bg-gray-800 bg-opacity-40 rounded-lg p-4 border-l-4 border-blue-500 hover:border-blue-400 transition-colors">
                        <div className="flex gap-3">
                            <span className="text-blue-400 font-bold min-w-[24px]">
                                {num}.
                            </span>
                            <div className="flex-1 text-gray-100">
                                {paragraphs.map((paragraph, pIndex) => (
                                    <p key={pIndex} className={pIndex > 0 ? 'mt-2' : ''}>
                                        {paragraph.trim()}
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// Helper function to detect if content is structured
const isStructuredContent = (content: string): boolean => {
    // Check for numbered sections (1., 2., etc) with content
    const numberedSections = content.match(/\d+\.\s+[^\d]+((?!\d+\.).)*(\n|$)/gs);
    return numberedSections ? numberedSections.length > 1 : false;
};

export const ForumDTCAnalyzer: React.FC<ForumDTCAnalyzerProps> = ({ forumUrl: initialForumUrl }) => {
    const [forumUrl, setForumUrl] = useState(initialForumUrl);
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [url, setUrl] = useState('');
    const [processingDetails, setProcessingDetails] = useState({
        pagesProcessed: 0,
        totalChunks: 0,
        currentPage: '',
        linksFound: 0,
        chunksCreated: 0,
        depth: 0,
        status: '',
        error: null as string | null
    });

    const [presetUrls] = useState([
        {
            name: 'F30 Bimmerpost',
            url: 'https://f30.bimmerpost.com/forums/'
        },
        {
            name: 'Jeep Wrangler Forum',
            url: 'https://www.jlwranglerforums.com/forum/'
        }, 
        {
            name: 'Jeep Grand Cherokee Forums',
            url: 'https://www.jeepforum.com/forums'
        },
        {
            name: 'Audi Forums',
            url: 'https://www.audiworld.com/forums/'
        },
        {
            name: 'Hyuandi Forums',
            url: 'https://www.hyundai-forums.com/'
        },
        {
            name: 'VW-vortex',
            url: 'https://www.vwvortex.com/forums/'
        }
    ]);
    const handleProcessForum = async () => {
        try {
            setIsProcessing(true);
            setProcessingDetails({
                pagesProcessed: 0,
                totalChunks: 0,
                currentPage: '',
                linksFound: 0,
                chunksCreated: 0,
                depth: 0,
                status: 'Initializing crawler...',
                error: null
            });
            
            const result = await ForumCrawlerService.processForum(
                forumUrl, 
                question.trim() ? question : undefined,
                (data) => {
                    setProcessingDetails(prev => ({
                        ...prev,
                        ...data, // Ensure this data structure matches the backend response
                    }));
                }
            );
            
            setProcessingDetails(prev => ({
                ...prev,
                pagesProcessed: result.pagesProcessed,
                totalChunks: result.totalChunks,
                status: 'Processing complete!'
            }));
            
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Forum content processed successfully! Processed ${result.pagesProcessed} pages with ${result.totalChunks} content chunks. You can now ask questions about it.`
            }]);
        } catch (error) {
            console.error(error);
            setProcessingDetails(prev => ({
                ...prev,
                status: 'Error processing forum',
                error: error instanceof Error ? error.message : 'An unknown error occurred'
            }));
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Failed to process forum content. Please try again.'
            }]);
        } finally {
            setIsProcessing(false);
        }
    };
    const handleAskQuestion = async () => {
        if (!question.trim()) return;

        try {
            setLoading(true);
            setMessages(prev => [...prev, { role: 'user', content: question }]);
            
            const response = await ForumCrawlerService.queryForum(question);
            const isStructured = isStructuredContent(response.answer);
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: response.answer,
                structured: isStructured
            }]);
            setQuestion('');
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your question.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const renderMessage = (message: ChatMessage) => {
        const isAssistant = message.role === 'assistant';
        
        return (
            <div
                className={`max-w-[80%] p-3 rounded-lg ${
                    !isAssistant
                        ? 'bg-blue-600 text-white border-l-4 border-blue-400'
                        : 'bg-gray-800 text-gray-100 border-l-4 border-green-500'
                } text-xl`}
            >
                {message.structured ? formatStructuredResponse(message.content) : message.content}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-[48vh] bg-gray-900 bg-opacity-75 rounded-lg shadow-lg">
            <div className="p-4 bg-gray-800 bg-opacity-50 rounded-t-lg border-l-4 border-blue-500">
                <h2 className="text-2xl font-semibold text-blue-300">
                    Forum Content Analysis
                </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-white bg-gray-900 bg-opacity-50">
                <div className="mb-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {presetUrls.map((preset) => (
                            <UiButton
                                key={preset.url}
                                onClick={() => setForumUrl(preset.url)}
                                className={`
                                    px-4 py-2 bg-green-600 text-white text-lg rounded-lg hover:bg-green-700
                                    ${forumUrl === preset.url ? 'bg-white-600' : 'bg-transparent'}
                                `}
                            >
                                {preset.name}
                            </UiButton>
                        ))}
                    </div>
                    
                    <UiInput
                        value={forumUrl}
                        onChange={(e) => setForumUrl(e.target.value)}
                        placeholder="Enter forum URL..."
                        className="w-full h-24 bg-gray-800 text-white text-3xl placeholder:text-gray-400 border-gray-700"
                    />
                   <div className="relative">
                    <UiButton
                        onClick={handleProcessForum}
                        disabled={isProcessing || !forumUrl}
                        className={`mt-2 w-full text-xl ${
                            isProcessing ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white font-semibold py-4`}
                    >
                        {isProcessing ? 'Processing...' : 'Process Forum Content'}
                    </UiButton>
                    
                    {isProcessing && (
                        <div className="absolute top-full left-0 w-full mt-2 bg-gray-800 rounded-lg p-4 border border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-white-400">Processing Forum Content...</span>
                                <CircularProgress size={20} className="text-blue-500" />
                            </div>
                            <div className="space-y-2">
                                {processingDetails.currentPage && (
                                    <div className="text-sm">
                                        <span className="text-gray-400">Current Page:</span>
                                        <span className="text-blue-400 ml-2 truncate block">
                                            {processingDetails.currentPage}
                                        </span>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Depth:</span>
                                        <span className="text-blue-400">{processingDetails.depth}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Links Found:</span>
                                        <span className="text-blue-400">{processingDetails.linksFound}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Page Chunks:</span>
                                        <span className="text-blue-400">{processingDetails.chunksCreated}</span>
                                    </div>
                                </div>
                                <div className="border-t border-gray-700 my-2"></div>
                                <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Pages:</span>
                                        <span className="text-blue-400">{processingDetails.pagesProcessed}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total Chunks:</span>
                                        <span className="text-blue-400">{processingDetails.totalChunks}</span>
                                    </div>
                                </div>
                                {processingDetails.status && (
                                    <div className="text-sm text-gray-400 mt-2">
                                        {processingDetails.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                </div>

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                    >
                        {renderMessage(message)}
                    </div>
                ))}
            </div>

            <div className="flex gap-2 p-4 bg-gray-800 bg-opacity-50 rounded-b-lg">
                <UiInput
                    value={question}
                    onChange={(e) => {
                        console.log('Input change:', e.target.value);
                        setQuestion(e.target.value);
                    }}
                    placeholder="Ask a question about the forum content..."
                    className="flex-1 bg-gray-800 text-white text-2xl placeholder:text-gray-400 border-gray-700 h-16"
                    disabled={loading}
                />
                <UiButton
                    onClick={handleAskQuestion}
                    disabled={loading || !question.trim()}
                    className={`px-4 py-2 text-white ${
                        loading ? 'bg-gray-600' : 'bg-blue-600 hover:bg-blue-700'
                    } text-2xl`}
                >
                    {loading ? <CircularProgress size={24} /> : 'Ask'}
                </UiButton>
            </div>
        </div>
    );
};

export default ForumDTCAnalyzer