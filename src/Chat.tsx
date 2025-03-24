import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Button } from "./components/ui/button";
import { ImageIcon } from "lucide-react";
import { Input } from "./components/ui/input";
import "./App.css";

type TextResponse = {
    text: string;
    user: string;
    attachments?: { url: string; contentType: string; title: string }[];
};

// Get the API URL from environment or default to localhost
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export default function Chat() {
    const { agentId = "default" } = useParams();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<TextResponse[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            const formData = new FormData();
            formData.append("text", text);
            formData.append("userId", "user");
            formData.append("roomId", `default-room-${agentId}`);

            if (selectedFile) {
                formData.append("file", selectedFile);
            }

            try {
                console.log('Sending request to:', `${API_BASE_URL}/api/${agentId}/message`);
                console.log('Request payload:', {
                    text,
                    userId: "user",
                    roomId: `default-room-${agentId}`,
                    file: selectedFile
                });

                const res = await fetch(`${API_BASE_URL}/api/${agentId}/message`, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                    },
                    body: formData,
                    credentials: 'include',
                });
                
                if (!res.ok) {
                    const errorText = await res.text();
                    console.error('Server response:', errorText);
                    throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
                }
                
                const data = await res.json();
                console.log('Server response:', data);
                return data as TextResponse[];
            } catch (error) {
                console.error("API call failed:", error);
                throw error;
            }
        },
        onSuccess: (data) => {
            console.log('Mutation succeeded:', data);
            setMessages((prev) => [...prev, ...data]);
            setSelectedFile(null);
        },
        onError: (error) => {
            console.error('Error sending message:', error);
            // You might want to show this error to the user with a toast notification
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !selectedFile) return;

        console.log('Submitting message:', input);

        // Add user message immediately to state
        const userMessage: TextResponse = {
            text: input,
            user: "user",
            attachments: selectedFile ? [{ url: URL.createObjectURL(selectedFile), contentType: selectedFile.type, title: selectedFile.name }] : undefined,
        };
        setMessages((prev) => [...prev, userMessage]);

        mutation.mutate(input);
        setInput("");
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
        }
    };

    const getImageUrl = (url: string) => {
        if (url.startsWith('http')) {
            return url;
        }
        return `${API_BASE_URL}/media/generated/${url.split('/').pop()}`;
    };

    return (
        <div className="flex flex-col h-screen max-h-screen w-full">
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.length > 0 ? (
                        messages.map((message, index) => (
                            <div
                                key={index}
                                className={`text-left flex ${
                                    message.user === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                        message.user === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                    }`}
                                >
                                    {message.text}
                                    {message.attachments?.map((attachment, i) => (
                                        attachment.contentType.startsWith('image/') && (
                                            <img
                                                key={i}
                                                src={message.user === "user"
                                                    ? attachment.url
                                                    : getImageUrl(attachment.url)
                                                }
                                                alt={attachment.title || "Attached image"}
                                                className="mt-2 max-w-full rounded-lg"
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-muted-foreground">
                            No messages yet. Start a conversation!
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t p-4 bg-background">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1"
                            disabled={mutation.isPending}
                        />
                        <button
                            type="button"
                            className="inline-flex items-center justify-center rounded-md border bg-background p-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                            onClick={handleFileSelect}
                            disabled={mutation.isPending}
                        >
                            <ImageIcon className="h-4 w-4" />
                        </button>
                        <button 
                            type="submit" 
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            disabled={mutation.isPending}
                        >
                            {mutation.isPending ? "..." : "Send"}
                        </button>
                    </form>
                    {selectedFile && (
                        <div className="mt-2 text-sm text-muted-foreground">
                            Selected file: {selectedFile.name}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
