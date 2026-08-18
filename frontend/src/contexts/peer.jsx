import React, { useMemo} from 'react';

const PeerContext = React.createContext();

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) =>{

    const peer = useMemo(()=> new RTCPeerConnection(),[])


    const createOffer = async() => {
        const answer = await peer.createOffer();
        await peer.setLocalDescription(answer);
        return answer;
    }

    
    return (
        <PeerContext.Provider value={{}}>
            {props.children}
        </PeerContext.Provider>
    )
}
