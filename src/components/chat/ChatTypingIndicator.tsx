
import React from 'react';
import { RobotWithMessage } from '../career-chat/robot-avatar/RobotWithMessage';

export function ChatTypingIndicator() {
  return (
    <div className="flex-start mb-4 animate-fade-in" style={{ animationDuration: '150ms' }}>
      <RobotWithMessage 
        message="Thinking" 
        isTyping={true} 
      />
    </div>
  );
}
