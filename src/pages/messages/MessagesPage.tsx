import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { messageService } from '../../services/messageService';
import { profileService } from '../../services/profileService';
import { Avatar } from '../../components/ui/Avatar';
import { Send, MessageCircle, Phone, Video } from 'lucide-react';
import api from '../../services/api';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const messagesEndRef = useRef<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    loadUsers();

const socket = io(import.meta.env.VITE_BASE_URL || 'http://localhost:5000');
    socketRef.current = socket;
    
    socket.on('connect', () => {
      if (user?.id) {
        socket.emit('join', user.id);
      }
    });

    socket.on('incomingCall', (data: any) => {
      setIncomingCall(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadUsers = async () => {
    try {
      const [investors, entrepreneurs] = await Promise.all([
        profileService.getInvestors(),
        profileService.getEntrepreneurs()
      ]);
      const allUsers = [...investors, ...entrepreneurs].filter(u => u._id !== user?.id);
      setUsers(allUsers);
    } catch (err) {
      console.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const selectUser = async (u: any) => {
    setSelectedUser(u);
    try {
      const msgs = await messageService.getMessages(u._id);
      setMessages(msgs);
      await messageService.markAsRead(u._id);
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
      toast.error('Failed to send message');
    }
  };

  const handleVideoCall = async () => {
    try {
      const response = await api.post('/video/room');
      const { roomId } = response.data;

      socketRef.current?.emit('callUser', {
        userToCall: selectedUser._id,
        from: user?.id,
        name: user?.name,
        roomId
      });

      toast.success('Calling ' + selectedUser.name + '...');
      navigate('/video/' + roomId);
    } catch (err) {
      toast.error('Failed to start video call');
    }
  };

  const acceptCall = () => {
    navigate('/video/' + incomingCall.roomId);
    setIncomingCall(null);
  };

  const declineCall = () => {
    setIncomingCall(null);
    toast('Call declined');
  };

  if (!user) return null;

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex relative">
      {/* Incoming call popup */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl w-80">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Video size={32} className="text-primary-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">{incomingCall.name}</h3>
            <p className="text-sm text-gray-500 mb-6">is calling you...</p>
            <div className="flex justify-center gap-4">
              <button onClick={declineCall} className="bg-red-500 text-white p-4 rounded-full hover:bg-red-600 transition-colors">
                <Phone size={20} className="rotate-135" />
              </button>
              <button onClick={acceptCall} className="bg-green-500 text-white p-4 rounded-full hover:bg-green-600 transition-colors">
                <Phone size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : users.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No users available</div>
          ) : (
            users.map(u => (
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
            ))
          )}
        </div>
      </div>

      {/* Right chat window */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar src={selectedUser.avatar} name={selectedUser.name} size="md" />
                <div>
                  <p className="font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{selectedUser.role}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toast.success('Voice call coming soon!')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Phone size={18} className="text-gray-600" />
                </button>
                <button onClick={handleVideoCall} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                  <Video size={18} className="text-gray-600" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <MessageCircle size={32} className="text-gray-300 mb-3" />
                  <p className="text-gray-500">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender._id === user.id || msg.sender === user.id;
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button onClick={sendMessage} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
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
