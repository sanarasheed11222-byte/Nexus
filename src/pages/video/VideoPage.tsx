import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Copy } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

export const VideoPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [connected, setConnected] = useState(false);
  const [waiting, setWaiting] = useState(true);
  const socketRef = useRef<any>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    startCall();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      socketRef.current?.disconnect();
      pcRef.current?.close();
    };
  }, []);

  const createPeerConnection = (mediaStream: MediaStream, socket: any) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setConnected(true);
        setWaiting(false);
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('iceCandidate', { roomId, candidate: event.candidate });
      }
    };

    return pc;
  };

  const startCall = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(mediaStream);
      if (localVideoRef.current) localVideoRef.current.srcObject = mediaStream;

      const socket = io('http://localhost:5000');
      socketRef.current = socket;

   socket.emit('join', user?.id);
      socket.emit('joinRoom', roomId);

      socket.on('roomJoined', ({ isInitiator }: any) => {
        if (isInitiator) {
          console.log('I am the first user, waiting for someone to join');
        }
      });

      socket.on('userJoinedRoom', async () => {
        setWaiting(false);
        const pc = createPeerConnection(mediaStream, socket);
        pcRef.current = pc;
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { roomId, offer });
      });

      socket.on('offer', async ({ offer }: any) => {
        const pc = createPeerConnection(mediaStream, socket);
        pcRef.current = pc;
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', { roomId, answer });
      });

      socket.on('answer', async ({ answer }: any) => {
        await pcRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
      });

      socket.on('iceCandidate', async ({ candidate }: any) => {
        try {
          await pcRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('ICE error', e);
        }
      });

    } catch (err) {
      toast.error('Could not access camera/microphone');
    }
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    stream?.getTracks().forEach(t => t.stop());
    socketRef.current?.disconnect();
    pcRef.current?.close();
    navigate('/messages');
    toast.success('Call ended');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Video size={24} className="text-white" />
          <div>
            <h1 className="text-white font-semibold">Video Call</h1>
            <p className="text-gray-400 text-sm">
              {connected ? '🟢 Connected' : waiting ? '⏳ Waiting...' : '🔄 Connecting...'}
            </p>
          </div>
        </div>
        <button
          onClick={() => { navigator.clipboard.writeText(roomId || ''); toast.success('Room ID copied!'); }}
          className="flex items-center gap-2 bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-600"
        >
          <Copy size={14} />
          Copy Room ID
        </button>
      </div>

      <div className="flex-1 relative p-4">
        <div className="w-full h-full min-h-96 bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className={connected ? 'w-full h-full object-cover' : 'hidden'} />
          {!connected && (
            <div className="text-center">
              <div className="animate-pulse w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video size={40} className="text-gray-400" />
              </div>
              <p className="text-white text-lg">Waiting for participant...</p>
              <p className="text-gray-400 text-sm mt-2">
                Room: <span className="font-mono text-white">{roomId?.slice(0, 8)}</span>
              </p>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 right-8 w-48 h-36 bg-gray-700 rounded-xl overflow-hidden shadow-xl border-2 border-gray-600">
          {isVideoOff ? (
            <div className="w-full h-full flex items-center justify-center">
              <VideoOff size={24} className="text-gray-400" />
            </div>
          ) : (
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
          )}
          <div className="absolute bottom-2 left-2">
            <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-0.5 rounded">{user?.name}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 p-6">
        <div className="flex items-center justify-center gap-4">
          <button onClick={toggleMute} className={"p-4 rounded-full " + (isMuted ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500')}>
            {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
          </button>
          <button onClick={toggleVideo} className={"p-4 rounded-full " + (isVideoOff ? 'bg-red-500' : 'bg-gray-600 hover:bg-gray-500')}>
            {isVideoOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
          </button>
          <button onClick={endCall} className="p-4 rounded-full bg-red-500 hover:bg-red-600">
            <PhoneOff size={24} className="text-white" />
          </button>
        </div>
        <p className="text-gray-400 text-sm text-center mt-4">
          Share Room ID <span className="text-white font-mono bg-gray-700 px-2 py-0.5 rounded">{roomId?.slice(0, 8)}</span>
        </p>
      </div>
    </div>
  );
};
