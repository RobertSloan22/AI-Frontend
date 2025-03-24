import React from 'react';
import { SavedConversation } from './ConversationService';
interface Props {
  conversations: SavedConversation[];
  onSelect: (conversation: SavedConversation) => void;
  onClose: () => void;
}
// define the onclick function to close the modal 


export const SavedConversationsModal: React.FC<Props> = ({
  conversations,
  onSelect,
  onClose,
}) => {
  return (
    <>
    <div className="bg-black bg-opacity-50 z-[1000] fixed inset-0">
      <div className="saved-conversations-modal max-w-2xl mx-auto mt-20">
        <div className="modal-header z-[1000]">
          <h2>Resume Saved Conversation</h2>
          <button onClick={onClose}>×</button>
        </div>
        <div className="modal-body h-[60vh] overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className="conversation-item p-4 hover:bg-gray-800 cursor-pointer"
              onClick={() => onSelect(conv)}
            >
              <h3 className="text-lg font-semibold">{conv.title}</h3>
              <div className="conversation-date text-sm text-gray-400">
                {new Date(conv.timestamp).toLocaleString()}
              </div>
              <div className="conversation-preview mt-2">
                <div className="text-sm">
                  <strong>Last Exchange:</strong>
                  <div className="pl-4 text-gray-300">
                    User: {conv.lastExchange.userMessage}
                  </div>
                  <div className="pl-4 text-gray-300">
                    Assistant: {conv.lastExchange.assistantMessage}
                  </div>
                </div>
                {conv.keyPoints.length > 0 && (
                  <div className="mt-2 text-sm">
                    <strong>Key Points:</strong>
                    <ul className="pl-4 text-gray-300">
                      {conv.keyPoints.slice(0, 3).map((point, i) => (
                        <li key={i}>• {point}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}; 