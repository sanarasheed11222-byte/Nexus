import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Phone, Video, Info, Smile, MessageCircle } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { messageService } from '../../services/messageService';
import { profileService } from '../../services/profileService';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const ChatPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<any>(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [investors, entrepreneurs] = await Promise.all([
          profileService.getInvestors(),
          profileService.getEntrepreneurs()
        ]);
        const allUsers = [...investors, ...entrepreneurs].filter(u => u._id !== currentUser?.id);
        setUsers(allUsers);
      } catch (err) {
        console.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectUser = async (u: any) => {
    setSelectedUser(u);
    try {
      const msgs = await messageService.getMessages(u._id);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    try {
      await messageService.sendMessage(selectedUser._id, newMessage);
      setNewMessage('');
      const msgs = await messageService.getMessages(selectedUser._id);
      setMessages(msgs);
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const handleVideoCall = async () => {
    try {
      const response = await api.post('/video/room');
      const { roomId } = response.data;
      navigate('/video/' + roomId);
    } catch (err) {
      toast.error('Failed to start video call');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : users.map(u => (
            <div
              key={u._id}
              onClick={() => selectUser(u)}
              className={"flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 " + (selectedUser?._id === u._id ? 'bg-primary-50' : '')}
            >
              <Avatar src={u.avatar} name={u.name} size="md" />
              <div>
                <p className="font-medium text-gray-900">{u.name}</p>
                <p className="text-xs text-gray-500 capitalize">{u.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Avatar src={selectedUser.avatar} name={selectedUser.name} size="md" />
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{selectedUser.name}</h2>
                  <p className="text-sm text-gray-500 capitalize">{selectedUser.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={() => toast.success('Voice call coming soon!')}>
                  <Phone size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2" onClick={handleVideoCall}>
                  <Video size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="rounded-full p-2">
                  <Info size={18} />
                </Button>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <MessageCircle size={32} className="text-gray-300 mb-3" />
                  <p className="text-gray-500">No messages yet. Say hello!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isMe = msg.sender._id === currentUser.id || msg.sender === currentUser.id;
                    return (
                      <div key={index} className={"flex " + (isMe ? 'justify-end' : 'justify-start')}>
                        <div className={"max-w-xs px-4 py-2 rounded-lg " + (isMe ? 'bg-primary-600 text-white' : 'bg-white text-gray-900 shadow-sm')}>
                          <p className="text-sm">{msg.content}</p>
                          <p className={"text-xs mt-1 " + (isMe ? 'text-primary-200' : 'text-gray-400')}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <Button type="button" variant="ghost" size="sm" className="rounded-full p-2">
                  <Smile size={20} />
                </Button>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button type="submit" size="sm" disabled={!newMessage.trim()} className="rounded-full p-2 w-10 h-10 flex items-center justify-center">
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <MessageCircle size={48} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-700">Select a conversation</h2>
            <p className="text-gray-500 mt-2">Choose a contact to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};
