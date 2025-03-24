import React, { useState } from "react";
import axiosInstance from "../../utils/axiosConfig.js";
import { Calculator } from "@langchain/community/tools/calculator";
import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { pull } from "langchain/hub";
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { Card } from "../ui/card";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Tool } from "@langchain/core/tools";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { vectorStorageService } from "../services/vectorStorageService";
import { ChatOpenAI } from "@langchain/openai";

interface TextAssistProps {
  onMessage: (message: string) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  context?: string[];
  structured?: boolean;
}

const API_TIMEOUT = 30000; // 30 second timeout

// Helper function to format structured content
const formatStructuredResponse = (content: string): JSX.Element => {
  // First, normalize line breaks
  const normalizedContent = content.replace(/\r\n/g, '\n');
  
  // Split into sections based on headers (##, ###, etc) or numbered points
  const sections = normalizedContent.match(/(?:^|\n)(?:#{2,3}|[0-9]+\.) .+(?:\n(?:(?!#{2,3}|[0-9]+\.).)*)+/gs) || [];
  
  return (
    <div className="space-y-4">
      {sections.map((section, index) => {
        // Check if it's a header or numbered point
        const isHeader = section.match(/^#{2,3}/m);
        const content = section.replace(/^(?:#{2,3}|[0-9]+\.) /m, '').trim();
        
        // Split content into paragraphs and bullet points
        const paragraphs = content.split('\n').filter(p => p.trim()).map(p => {
          const isBullet = p.trim().startsWith('•') || p.trim().startsWith('-');
          return {
            text: p.trim().replace(/^[•-] /, ''),
            isBullet
          };
        });
        
        return (
          <div key={index} className="mb-4 bg-gray-800 bg-opacity-40 rounded-lg p-4 border-l-4 border-blue-500 hover:border-blue-400 transition-colors">
            {isHeader ? (
              <h3 className="text-xl font-semibold text-blue-400 mb-2">{content.split('\n')[0]}</h3>
            ) : (
              <div className="flex gap-3">
                <span className="text-blue-400 font-bold min-w-[24px]">
                  {index + 1}.
                </span>
                <div className="flex-1 text-gray-100">
                  {paragraphs.map((p, pIndex) => (
                    <p key={pIndex} className={`${pIndex > 0 ? 'mt-2' : ''} ${p.isBullet ? 'ml-4' : ''}`}>
                      {p.isBullet && <span className="mr-2">•</span>}
                      {p.text}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export function TextAssist({ onMessage }: TextAssistProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getContextFromVectorStore = async (query: string) => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

      const results = await vectorStorageService.queryVectorStore(query);
      clearTimeout(timeout);
      return results.map(doc => doc.pageContent);
    } catch (error: any) {
      console.error("Error getting context from vector store:", error);
      return [];
    }
  };

  const getChatCompletion = async (messages: any[], context: string[]) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await axiosInstance.post("/lmStudio/v1/chat/completions", {
        model: "llama-3.2-1b-instruct",
        messages: [
          {
            role: "system",
            content: `You are a helpful automotive assistant. Use the following context to answer questions about vehicle research:

${context.join('\n\n')}

Instructions for providing responses:
1. Structure your responses clearly using sections and bullet points
2. Use ## for main sections and ### for subsections
3. Use bullet points (•) for lists
4. For step-by-step instructions, use numbered points
5. Keep paragraphs short and focused
6. Highlight important information using clear section headers
7. If providing technical specifications, organize them in clear sections
8. For diagnostic steps, number them sequentially
9. Use consistent formatting throughout your response

If the context doesn't contain relevant information, you can answer based on your general knowledge about vehicles, but maintain the same structured format.`
          },
          ...messages
        ],
        temperature: 0.7,
      }, {
        signal: controller.signal,
        timeout: API_TIMEOUT
      });

      clearTimeout(timeout);
      return response.data;
    } catch (error: any) {
      clearTimeout(timeout);
      if (error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    setIsLoading(true);
    const newUserMessage = { 
      role: "user" as const, 
      content: userInput
    };

    setMessages(prev => [...prev, newUserMessage]);
    setUserInput("");

    try {
      const [context, chatResponse] = await Promise.all([
        getContextFromVectorStore(userInput),
        getChatCompletion(
          [...messages, newUserMessage].map(m => ({ role: m.role, content: m.content })),
          [] // Initial empty context, will be updated in next message
        )
      ]);

      if (chatResponse && chatResponse.choices) {
        const assistantMessage = {
          role: "assistant" as const,
          content: chatResponse.choices[0]?.message?.content || "No response",
          context,
          structured: true // Mark the message as structured
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error("Unexpected API response:", chatResponse);
      }
    } catch (error: any) {
      console.error("Error in chat completion:", error);
      const errorMessage = error.name === 'AbortError' 
        ? "The request took too long to process. Please try again."
        : "I apologize, but I encountered an error processing your request. Please try again.";
        
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolAgentTest = async () => {
    try {
      const prompt = await pull<ChatPromptTemplate>("hwchase17/openai-tools-agent");
      const tools = [new Calculator()];
      const llm = new ChatOpenAI({ openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY });
      const agent = await createOpenAIToolsAgent({ llm, tools, prompt });

      const agentExecutor = new AgentExecutor({ agent, tools });
      const input = "What is the value of (500 * 2) + 350 - 13?";

      const result = await agentExecutor.invoke({ input });
      setMessages((prev) => [...prev, { role: "assistant", content: `Calculated: ${result.output}` }]);
    } catch (error) {
      console.error("Error running tool agent:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="w-[50vw] p-4">
      <Card className="flex flex-col h-[40vh] bg-transparent border-none">
        <div className="p-4 bg-gray-800 bg-opacity-50 rounded-t-lg border-l-4 border-blue-500">
          <h2 className="text-2xl font-semibold text-blue-400">
            Vehicle Research Assistant
          </h2>
        </div>

        <Separator className="bg-gray-700" />

        <div className="flex-1 text-2xl overflow-y-auto p-4 space-y-4 bg-gray-900 bg-opacity-50">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white border-l-4 border-blue-400"
                    : "bg-gray-800 text-gray-100 border-l-4 border-green-500"
                }`}
              >
                {message.structured ? (
                  formatStructuredResponse(message.content)
                ) : (
                  <div className="text-2xl">{message.content}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <Separator className="bg-gray-700" />

        <div className="p-4 flex gap-2 bg-gray-800 bg-opacity-50 rounded-b-lg">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about vehicle research..."
            className="flex-1 bg-gray-900 border-gray-700 text-white text-3xl placeholder:text-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading}
            className={`px-4 py-2 text-white ${
              isLoading ? "bg-gray-600" : "bg-blue-600 hover:bg-blue-700"
            } transition-colors text-xl`}
          >
            {isLoading ? "Processing..." : "Send"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default TextAssist;