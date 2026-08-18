import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { FiPhoneIncoming, FiPhoneOff, FiPhone } from "react-icons/fi";
import { endCall } from "../../redux/callSlice";
import { useWebRTC } from "../../custom-hooks/useWebRTC.jsx";

const IncomingCallModal = () => {
  const dispatch = useDispatch();
  const {
    isReceivingCall,
    caller,
    name: callerName,
    callAccepted,
  } = useSelector((state) => state.call);
  const { answerCurrentCall, terminateCall } = useWebRTC();

  if (!isReceivingCall || callAccepted) return null;

  const handleAccept = () => {
    answerCurrentCall();
  };

  const handleReject = () => {
    terminateCall();
    dispatch(endCall());
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-10 right-10 z-[9999] bg-gray-900/80 backdrop-blur-md text-white p-6 rounded-2xl shadow-2xl border border-gray-700/50 flex flex-col items-center gap-4 w-72"
      >
        <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center animate-pulse">
          <FiPhoneIncoming className="w-8 h-8 text-indigo-400" />
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-1">
            {callerName || "Incoming Call..."}
          </h3>
          <p className="text-sm text-gray-400">Incoming Video Call</p>
        </div>

        <div className="flex justify-between w-full mt-4">
          <button
            onClick={handleReject}
            className="flex items-center justify-center w-12 h-12 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-full transition-colors"
            title="Reject"
          >
            <FiPhoneOff size={24} />
          </button>

          <button
            onClick={handleAccept}
            className="flex items-center justify-center w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors animate-bounce"
            title="Accept"
          >
            <FiPhone size={24} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallModal;
