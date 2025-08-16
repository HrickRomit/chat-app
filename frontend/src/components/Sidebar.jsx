import { useState }  from "react";
import {FaUserCircle} from "react-icons/fa";

export default function Sidebar(){
    const[friends] = useState ([
        {id: 1, name: "John Doe"},
        {id: 2, name: "Jane Smith"},
        {id: 3, name: "Alice Johnson"}
    ]);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-300 flex items-center justify-between">
                <h2 className="text-lg font-semibold">ChatApp</h2>
                <button className="p-2 rounded-full hover:bg-gray-200">
                <FaUserCircle size={28} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
        {friends.map((friend) => (
          <div
            key={friend.id}
            className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200"
          >
            {friend.name}
          </div>
        ))}
      </div>

        </div>
    );
}