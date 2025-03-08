
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ChatBubble: React.FC = () => {
  const navigate = useNavigate();
  
  const handleChatClick = () => {
    navigate('/chat');
  };
  
  return (
    <div className="fixed bottom-20 right-4 z-50">
      <Button 
        onClick={handleChatClick} 
        size="icon" 
        className="h-12 w-12 rounded-full shadow-lg bg-primary hover:bg-primary/90"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
        <span className="sr-only">Chat with Reception</span>
      </Button>
    </div>
  );
};

export default ChatBubble;
