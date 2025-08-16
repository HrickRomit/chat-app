import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

export default function ChatPage() {
  return (
    <div className="h-screen flex">
      {/* Left sidebar */}
      <div className="w-1/4 border-r border-gray-300">
        <Sidebar />
      </div>

      {/* Chat window */}
      <div className="flex-1">
        <ChatWindow />
      </div>
    </div>
  );
}
