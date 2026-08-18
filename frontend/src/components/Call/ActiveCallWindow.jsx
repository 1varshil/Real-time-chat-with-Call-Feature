import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiPhoneOff,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";
import { useWebRTC } from "../../custom-hooks/useWebRTC.jsx";
import { endCall } from "../../redux/callSlice";

const ActiveCallWindow = () => {
  const dispatch = useDispatch();
  const { callAccepted, callEnded, callInProgress } = useSelector(
    (state) => state.call,
  );
  const { localStream, remoteStream, terminateCall, toggleAudio, toggleVideo } =
    useWebRTC();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  if (!callInProgress) return null;

  const handleEndCall = () => {
    terminateCall();
    dispatch(endCall());
  };

  const handleToggleAudio = () => {
    toggleAudio();
    setIsMuted(!isMuted);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoOff(!isVideoOff);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={`fixed z-[9998] bg-gray-900 overflow-hidden shadow-2xl transition-all duration-300 ${
          isExpanded
            ? "inset-0 w-full h-full rounded-none"
            : "bottom-6 right-6 w-[400px] h-[300px] rounded-2xl border border-gray-700/50"
        }`}
      >
        {/* Remote Video (Main) */}
        {remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover bg-black"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
            Connecting...
          </div>
        )}

        {/* Local Video (PIP) */}
        <div className="absolute top-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg">
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FiVideoOff className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
          <button
            onClick={handleToggleAudio}
            className={`p-3 rounded-full transition-colors ${isMuted ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"} text-white`}
          >
            {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
          </button>
          <button
            onClick={handleToggleVideo}
            className={`p-3 rounded-full transition-colors ${isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"} text-white`}
          >
            {isVideoOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
          </button>
          <button
            onClick={handleEndCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            <FiPhoneOff size={20} />
          </button>

          <div className="flex-1" />

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 rounded-full bg-gray-700/50 hover:bg-gray-600/50 text-white transition-colors backdrop-blur-sm"
          >
            {isExpanded ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActiveCallWindow;
