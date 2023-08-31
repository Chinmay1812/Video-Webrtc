import { useCallback, useEffect,useState} from "react";
import { useSocket } from "../context/SocketProvider";
import ReactPlayer from 'react-player'
import peer from '../service/peer'


const RoomPage=()=>{

    const socket=useSocket();

    const [remoteSocketId,setRemoteSocketId]=useState(null);
    const [myStream,setMyStream]=useState();
    const [remoteStream,setRemoteStream]=useState();


    const handleUserJoined=useCallback((data)=>{
        const {email,id}=data;
        setRemoteSocketId(id);
        // console.log(data) Will Print only to members which are beforehand present in Room 
    },[])

    const handleIncomingCall=useCallback(async({from,offer})=>{
        setRemoteSocketId(from);
        const stream=await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        })
        setMyStream(stream);
        const ans=await peer.getAnswer(offer);
        socket.emit('call:accepted',{to:from,ans});
        
    },[socket])



    const handleVideoCall=useCallback(async()=>{
        const stream=await navigator.mediaDevices.getUserMedia({
            audio:true,
            video:true
        })
        const offer=await peer.getOffer();
        socket.emit('user:call',{to:remoteSocketId,offer})
        setMyStream(stream);
    },[remoteSocketId, socket])


    const sendStreams=useCallback((from,ans)=>{
        for(const track of myStream.getTracks()){
            peer.peer.addTrack(track,myStream);
        }},[myStream])
    
        const handleNegoNeeded = useCallback(async () => {
            const offer = await peer.getOffer();
            socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
          }, [remoteSocketId, socket]);
        
          useEffect(() => {
            peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
            return () => {
              peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
            };
          }, [handleNegoNeeded]);
        
          const handleNegoNeedIncomming = useCallback(
            async ({ from, offer }) => {
              const ans = await peer.getAnswer(offer);
              socket.emit("peer:nego:done", { to: from, ans });
            },
            [socket]
          );
        
          const handleNegoNeedFinal = useCallback(async ({ ans }) => {
            await peer.setLocalDescription(ans);
          }, []);
            


    const handleCallAccepted=useCallback((from,ans)=>{
        peer.setLocalDescription(ans);
        sendStreams();
       
    },[sendStreams]);

    useEffect(()=>{
        peer.peer.addEventListener('track',async ev=>{
            const remoteStream=ev.streams
            setRemoteStream(remoteStream[0]);
        })
    })


    useEffect(()=>{
        socket.on('user:joined',handleUserJoined)
        socket.on('incoming:call',handleIncomingCall)
        socket.on('call:accepted',handleCallAccepted);
        socket.on("peer:nego:needed", handleNegoNeedIncomming);
        socket.on("peer:nego:final", handleNegoNeedFinal);


        return ()=>{
            socket.off('user:joined',handleUserJoined)
            socket.off('incoming:call',handleIncomingCall)
            socket.off('call:accepted',handleCallAccepted);
            socket.off("peer:nego:needed", handleNegoNeedIncomming);
            socket.off("peer:nego:final", handleNegoNeedFinal);
        }

    },[socket, handleUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncomming, handleNegoNeedFinal]);



    return <>
     <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleVideoCall}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}

    </>
}

export default RoomPage;


