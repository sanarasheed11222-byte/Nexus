import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Video, VideoOff, Mic, MicOff, PhoneOff, Copy } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const VideoPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);

  useEffect(() => {
    startCamera();
    setTimeout(() => setIsConnecting(false), 2000);
    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast.error('Could not access camera/microphone');
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    stream?.getTracks().forEach(track => track.stop());
    navigate('/messages');
    toast.success('Call ended');
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId || '');
    toast.success('Room ID copied! Share it with others to join.');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video size={24} className="text-white" />
          <div>
            <h1 className="text-white font-semibold">Video Call</h1>
            <p className="text-gray-400 text-sm">Room: {roomId?.slice(0, 8)}...</p>
          </div>
        </div>
        <button
          onClick={copyRoomId}
          className="flex items-center gap-2 bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-600 transition-colors"
        >
          <Copy size={14} />
          Copy Room ID
        </button>
      </div>

      {/* Video area */}
      <div className="flex-1 relative p-4">
        {/* Remote video placeholder */}
        <div className="w-full h-full min-h-96 bg-gray-800 rounded-xl flex items-center justify-center">
          {isConnecting ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-white text-lg">Connecting...</p>
              <p className="text-gray-400 text-sm mt-1">Waiting for others to join</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl text-white font-bold">?</span>
              </div>
              <p className="text-white text-lg">Waiting for participant</p>
              <p className="text-gray-400 text-sm mt-1">Share the Room ID to invite someone</p>
            </div>
          )}
        </div>

        {/* Local video */}
        <div className="absolute bottom-8 right-8 w-48 h-36 bg-gray-700 rounded-xl overflow-hidden shadow-xl border-2 border-gray-600">
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <VideoOff size={24} className="text-gray-400 mx-auto" />
                <p className="text-gray-400 text-xs mt-1">Camera off</p>
              </div>
            </div>
          ) : (
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover mirror"
              style={{ transform: 'scaleX(-1)' }}
            />
          )}
          <div className="absolute bottom-2 left-2">
            <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">
              {user?.name} (You)
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}
          >
            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-500'}`}
          >
            {isVideoOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
          >
            <PhoneOff size={24} className="text-white" />
          </button>
        </div>

        <p className="text-gray-400 text-sm text-center mt-4">
          Share Room ID <span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">{roomId?.slice(0, 8)}</span> to invite others
        </p>
      </div>
    </div>
  );
};
