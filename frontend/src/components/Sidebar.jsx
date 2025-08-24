import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import api from "../utils/api";

export default function Sidebar({ onChatSelect }) {
  const { user } = useAuth();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users when component mounts
  useEffect(() => {
    if (user) {
      fetchUsers();
      fetchChats();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data.filter(u => u.id !== user?.id));
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats");
      setChats(data);
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    }
  };

  const handleUserClick = async (otherUser) => {
    try {
      // Create or get existing chat
      const { data: chat } = await api.post("/chats", {
        otherUserId: otherUser.id
      });
      
      // Pass chat info to parent component
      onChatSelect({
        chatId: chat.id,
        otherUser: otherUser
      });
      
      // Refresh chats list
      fetchChats();
    } catch (error) {
      console.error("Failed to create/get chat:", error);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* User profile section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} className="w-10 h-10 rounded-full" alt="avatar" />
          ) : (
            <FaUserCircle className="w-10 h-10 text-gray-400" />
          )}
          <div>
            <div className="font-medium">{user?.username || "Guest"}</div>
            <div className="text-xs text-gray-500">online</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex gap-1">
          <Link
            to="/chat"
            className={`px-3 py-2 rounded text-sm ${
              location.pathname === "/chat"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
          >
            Chat
          </Link>
          <Link
            to="/profile"
            className={`px-3 py-2 rounded text-sm ${
              location.pathname === "/profile"
                ? "bg-blue-100 text-blue-700"
                : "hover:bg-gray-100"
            }`}
          >
            Profile
          </Link>
        </div>
      </div>

      {/* Recent Chats */}
      {chats.length > 0 && (
        <div className="border-b border-gray-200">
          <div className="p-3 text-sm font-medium text-gray-700">Recent Chats</div>
          <div className="space-y-1 px-2 pb-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect({
                  chatId: chat.id,
                  otherUser: {
                    id: chat.other_user_id,
                    username: chat.other_user_name,
                    avatarUrl: chat.other_user_avatar
                  }
                })}
                className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
              >
                {chat.other_user_avatar ? (
                  <img src={chat.other_user_avatar} className="w-8 h-8 rounded-full" alt="avatar" />
                ) : (
                  <FaUserCircle className="w-8 h-8 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{chat.other_user_name}</div>
                  {chat.last_message_content && (
                    <div className="text-xs text-gray-500 truncate">
                      {chat.last_message_content}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 text-sm font-medium text-gray-700">All Users</div>
        <div className="space-y-1 px-2">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} className="w-8 h-8 rounded-full" alt="avatar" />
              ) : (
                <FaUserCircle className="w-8 h-8 text-gray-400" />
              )}
              <div>
                <div className="font-medium text-sm">{user.username}</div>
                <div className="text-xs text-gray-500">
                  {user.statusMessage || user.email}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}