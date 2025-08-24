import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  const [activeChat, setActiveChat] = useState(null);

  const handleChatSelect = (chatData) => {
    setActiveChat(chatData);
  };

  return (
    <div className="h-screen flex">
      {/* Left sidebar */}
      <div className="w-1/4 border-r border-gray-300">
        <Sidebar onChatSelect={handleChatSelect} />
      </div>

      {/* Chat window */}
      <div className="flex-1">
        {activeChat ? (
          <ChatWindow 
            chatId={activeChat.chatId}
            otherUser={activeChat.otherUser}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-xl mb-2">💬</div>
              <div>Select a user to start chatting</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}