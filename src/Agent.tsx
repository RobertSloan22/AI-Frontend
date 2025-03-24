import { useNavigate, useParams } from "react-router-dom";
import { Button } from "./components/ui/button";

export default function Agent() {
    const navigate = useNavigate();
    const { agentId } = useParams();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
            <p className="text-lg text-gray-600">
                What would you like to do with your ELIZA agent?
            </p>
            <div className="flex flex-col gap-4 w-full max-w-md">
                <Button 
                    onClick={() => navigate(`/${agentId}/chat`)}
                    className="w-full text-lg py-6"
                >
                    Chat with Agent
                </Button>
                <Button 
                    onClick={() => navigate(`/${agentId}/character`)}
                    className="w-full text-lg py-6"
                >
                    Configure Character
                </Button>
                <Button 
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="w-full text-lg py-6"
                >
                    Select Different Agent
                </Button>
            </div>
        </div>
    );
}
