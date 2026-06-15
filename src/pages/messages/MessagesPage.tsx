import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/messageService';
import { profileService } from '../../services/profileService';
import { Avatar } from '../../components/ui/Avatar';
import { Send, MessageCircle } from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [convs, investors, entrepreneurs] = await Promise.all([
        messageService.getConversations(),
        profileService.getInvestors(),
        profileService.getEntrepreneurs()
      ]);
      setConversations(convs);
      const allUsers = [...investors, ...entrepreneurs].filter(u => u._id !== user?.id);
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const selectUser = async (selectedUserId: string) => {
    const found = users.find(u => u._id === selectedUserId);
    setSelectedUser(found);
    try {
      const msgs = await messageService.getMessages(selectedUserId);
      setMessages(msgs);
      await messageService.markAsRead(selectedUserId);
    } catch (err) {
      console.error('Failed to load messages');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    try {
      await messageService.sendMessage(selectedUser._id, newMessage);
      setNewMessage('');
      const msgs = await messageService.getMessages(selectedUser._id);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
      {/* Left sidebar - user list */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No users available
            </div>
          ) : (
            users.map(u => (
              <div
                key={u._id}
                onClick={() => selectUser(u._id)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                  selectedUser?._id === u._id ? 'bg-primary-50' : ''
                }`}
              >
                <Avatar src={u.avatar} name={u.name} size="md" />
                <div>
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{u.role}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right side - chat window */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <Avatar src={selectedUser.avatar} name={selectedUser.name} size="md" />
              <div>
                <p className="font-medium text-gray-900">{selectedUser.name}</p>
                <p className="text-xs text-gray-500 capitalize">{selectedUser.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  No messages yet. Say hello! 👋
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender._id === user.id || msg.sender === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender._id === user.id || msg.sender === user.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                onClick={sendMessage}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageCircle size={48} className="mb-4 text-gray-300" />
            <p className="text-lg font-medium">Select a conversation</p>
            <p className="text-sm mt-1">Choose someone from the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
