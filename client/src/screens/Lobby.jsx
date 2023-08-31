import React,{useState,useCallback,useEffect} from "react";
import {useNavigate} from 'react-router-dom'
import { useSocket } from "../context/SocketProvider";

const LobbyScreen=()=>{

    const [email,setEmail]=useState('');
    const [room,setRoom]=useState('');

    const socket=useSocket();
    const navigate=useNavigate();

    const handleSubmitForm=useCallback((e)=>{
        e.preventDefault();
        socket.emit('room:joined',{email,room});
        setEmail('');
        setRoom('');
    },[email, room, socket])

    const handleJoinRoom=useCallback((data)=>{
        const {email,room}=data;
        navigate(`/room/${room}`);
    },[navigate])

    useEffect(()=>{
        socket.on('room:joined',handleJoinRoom);

        return ()=>{
            socket.off('room:joined',handleJoinRoom)//De-register a listener
        }

    },[handleJoinRoom, socket])//why useEffect? why it prints 2 times? 


    return <>
    <h1>Lobby Screen</h1>
    <form onSubmit={handleSubmitForm}>
        <label htmlFor="email" >Email Id</label>
        <input type="email" id="email" value={email} onChange={
            (event)=>{setEmail(event.target.value)}
        }/>

        <br/>

        <label htmlFor="room">Room Number</label>
        <input type="text" id="room"
        value={room}
        onChange={(event)=>{setRoom(event.target.value)}}
        />
        <br/>
        <button>Join</button>
    </form>
    </>
}

export default LobbyScreen;