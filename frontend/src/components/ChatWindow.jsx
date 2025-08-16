export default function ChatPage() {
    return (
        <div className="h-flex flex flex-col">
            <div className="p-4 border-b border-gray-300 font-semibold">
                Select a friend to start chatting
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
                <p className="text-gray-500">
                    no message yet
                </p>
            </div>

            <div className="p-4 border-t border-gray-300">
                <input type="text" placeholder="Type a message..." 
                className="w-full border rounded-lg px-3 py-2 focus:outline-none"/>
            </div>

        </div>
    );
}