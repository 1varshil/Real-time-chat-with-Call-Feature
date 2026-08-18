import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    isReceivingCall: false,
    caller: null,
    callAccepted: false,
    callEnded: false,
    callType: null, // 'audio' or 'video'
    remoteSignal: null,
    localStream: null,
    remoteStream: null,
    callInProgress: false
};

const callSlice = createSlice({
    name: "call",
    initialState,
    reducers: {
        setIncomingCall: (state, action) => {
            state.isReceivingCall = true;
            state.caller = action.payload.from;
            state.remoteSignal = action.payload.signal;
            state.callType = action.payload.callType || 'video';
        },
        acceptCall: (state) => {
            state.callAccepted = true;
            state.isReceivingCall = false;
            state.callInProgress = true;
        },
        endCall: (state) => {
            state.isReceivingCall = false;
            state.callAccepted = false;
            state.callEnded = true;
            state.caller = null;
            state.remoteSignal = null;
            state.callInProgress = false;
        },
        resetCall: (state) => {
            return { ...initialState };
        },
        initiateCall: (state, action) => {
            state.callInProgress = true;
            state.callType = action.payload.callType || 'video';
        }
    }
});

export const { setIncomingCall, acceptCall, endCall, resetCall, initiateCall } = callSlice.actions;
export default callSlice.reducer;
