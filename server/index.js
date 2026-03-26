const {Server} =require('socket.io');

const io=new Server(8000,{
    cors:true
})

const emailToSocketId=new Map();
const socketidtoEmail=new Map();

io.on('connection',(socket)=>{
    console.log(`Socket conncted ${socket.id}`);

    socket.on('room:joined',(data)=>{
        const {email,room}=data;

        emailToSocketId.set(email,socket.id); 
        socketidtoEmail.set(socket.id,email) // this data is coming from Lobby

        
        io.to(room).emit('user:joined',{email,id:socket.id}); //sending socket id to room
        socket.join(room);

        io.to(socket.id).emit('room:joined',data); //sending because user will navigate to room
    })

    socket.on('user:call',({to,offer})=>{
        io.to(to).emit('incoming:call',{from:socket.id,offer});
    })

    socket.on('call:accepted',({to,ans})=>{
        io.to(to).emit('call:accepted',{from:socket.id,ans}); 
    })

    socket.on("peer:nego:needed", ({ to, offer }) => {
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
      });
    
      socket.on("peer:nego:done", ({ to, ans }) => {
        io.to(to).emit("peer:nego:final", { from: socket.id, ans });
      });

})
//Role of Socket is to exchange SESSION DESCRIPTION LAYER (SDP) WHICH CONTAINS PUBLIC IP ,ROUTE TO CONNCECT ETC.
//webRTC is peer-to-peer connection 
//SDP is described as Offer.