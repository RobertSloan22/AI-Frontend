import React from 'react';
import { SavedConversation } from '../services/ConversationService';
import './SavedConversationsModal.scss';

interface Props {
  conversations: SavedConversation[];
  onSelect: (conversation: SavedConversation) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const SavedConversationsModal: React.FC<Props> = ({
  conversations,
  onSelect,
  onClose,
  isOpen
}) => {
  if (!isOpen) return null;

  return (
    <div className="saved-conversations-modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <div className="modal-header">
          <h2>Load Saved Conversation</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="modal-body">
          {conversations.length === 0 ? (
            <div className="no-conversations">
              No saved conversations found
            </div>
          ) : (
            conversations.map((conv) => (
              <div 
                key={conv._id}
                className="conversation-entry"
                onClick={() => onSelect(conv)}
              >
                <h3>{conv.title}</h3>
                <div className="conversation-meta">
                  <span>{new Date(conv.timestamp).toLocaleString()}</span>
                  <span>{conv.items?.length || 0} messages</span>
                </div>
                <div className="conversation-preview">
                  <div className="last-exchange">
                    <div className="user-message">
                      <strong>User:</strong> {conv.lastExchange.userMessage}
                    </div>
                    <div className="assistant-message">
                      <strong>Assistant:</strong> {conv.lastExchange.assistantMessage}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}; 