import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "../contexts/socketContext";
import {
  setIncomingCall,
  acceptCall,
  endCall,
  resetCall,
  initiateCall,
} from "../redux/callSlice";

const CallContext = createContext();

export const useWebRTC = () => useContext(CallContext);

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const dispatch = useDispatch();
  const { userData: authUser } = useSelector((state) => state.user);
  const callState = useSelector((state) => state.call);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const peerConnection = useRef(null);
  const remoteUserIdRef = useRef(null);

  // Initialize peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(configuration);

    // Send any ice candidates to the other peer
    pc.onicecandidate = (event) => {
      if (event.candidate && remoteUserIdRef.current) {
        socket.emit("iceCandidate", {
          to: remoteUserIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    // When remote stream arrives, set it
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnection.current = pc;
    return pc;
  };

  useEffect(() => {
    if (!socket || !authUser) return;

    const handleIncomingCall = async (data) => {
      dispatch(setIncomingCall(data));
    };

    const handleCallAccepted = async (signal) => {
      dispatch(acceptCall());
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(signal),
        );
      }
    };

    const handleIceCandidate = async (candidate) => {
      if (peerConnection.current) {
        try {
          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        } catch (e) {
          console.error("Error adding received ice candidate", e);
        }
      }
    };

    const handleCallEnded = () => {
      cleanupCall();
    };

    socket.on("incomingCall", handleIncomingCall);
    socket.on("callAccepted", handleCallAccepted);
    socket.on("iceCandidate", handleIceCandidate);
    socket.on("callEnded", handleCallEnded);

    return () => {
      socket.off("incomingCall", handleIncomingCall);
      socket.off("callAccepted", handleCallAccepted);
      socket.off("iceCandidate", handleIceCandidate);
      socket.off("callEnded", handleCallEnded);
    };
  }, [socket, authUser, dispatch, callState.caller]);

  const startLocalStream = async (video = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Error accessing media devices.", error);
    }
  };

  const callUser = async (userToCall, video = true) => {
    dispatch(initiateCall({ callType: video ? "video" : "audio" }));
    remoteUserIdRef.current = userToCall;

    const stream = await startLocalStream(video);
    if (!stream) return;

    const pc = createPeerConnection();

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Create offer
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    socket.emit("callUser", {
      userToCall,
      signalData: offer,
      from: authUser._id,
      name: authUser.fullName || authUser.username,
      callType: video ? "video" : "audio",
    });
  };

  const answerCurrentCall = async () => {
    remoteUserIdRef.current = callState.caller;

    const stream = await startLocalStream(callState.callType === "video");
    if (!stream) return;

    const pc = createPeerConnection();

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Set remote description from the offer
    await pc.setRemoteDescription(
      new RTCSessionDescription(callState.remoteSignal),
    );

    // Create answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    socket.emit("answerCall", {
      to: callState.caller,
      signal: answer,
    });

    dispatch(acceptCall());
  };

  const cleanupCall = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStream(null);
    remoteUserIdRef.current = null;
    dispatch(resetCall());
  };

  const terminateCall = () => {
    if (remoteUserIdRef.current) {
      socket.emit("endCall", { to: remoteUserIdRef.current });
    } else if (callState.caller) {
      socket.emit("endCall", { to: callState.caller });
    }
    cleanupCall();
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  return (
    <CallContext.Provider
      value={{
        localStream,
        remoteStream,
        callUser,
        answerCurrentCall,
        terminateCall,
        toggleAudio,
        toggleVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
