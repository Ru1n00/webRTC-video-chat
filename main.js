// agora variables
let appId = "38fdd9a342e44adcaf32ca3b7f4209b6"  // fake app ID
let token = null;
let uid = String(Math.floor(Math.random() * 1000000000));
let client;
let channel;

let localStream;
let remoteStream;
let peerConnection;

const servers = {
    iceServers: [
        {
            urls: [
                "stun:stun.l.google.com:19302",
                "stun:stun1.l.google.com:19302",
                "stun:stun2.l.google.com:19302"
            ]
        }
    ]
}

let init = async () => {
    client = await AgoraRTM.createInstance(appId);
    console.log("AgoraRTC client initialized", client);

    await client.login({uid, token}).catch(console.error);
    console.log("AgoraRTC client logged in", client);

    channel = client.createChannel("main");
    await channel.join().catch(console.error);

    channel.on('MemberJoined', handleUserJoined);
    client.on('MessageFromPeer', handleMessageFromPeer);


    getLocalStream();
};

let getLocalStream = async () => {
    // get user media
    let devices = await navigator.mediaDevices.enumerateDevices();
    let audioInputDevices = devices.filter((device) => device.kind === "audioinput");
    let videoInputDevices = devices.filter((device) => device.kind === "videoinput");

    console.log("Audio input devices:", audioInputDevices);
    console.log("Video input devices:", videoInputDevices);

    let constraints = {};
    if (audioInputDevices.length > 0) {
        constraints.audio = true;
    }
    if (videoInputDevices.length > 0) {
        videoInputDevices[0].deviceId !== '' ? constraints.video = true : constraints.video = false;
        // constraints.video = true;
    }
    
    localStream = await navigator.mediaDevices.getUserMedia(constraints).catch(console.error);
    if(constraints.video) {
        document.getElementById('localVideo').srcObject = localStream;
    }
    if(constraints.audio) {
        document.getElementById('localAudio').srcObject = localStream;
    }
    // document.getElementById('localVideo').srcObject = localStream;
};

let handleUserJoined = async (memberId) => {
    console.log("User joined:", memberId);
    createOffer(memberId);
}

let handleMessageFromPeer = async (message, memberId) => {
    message = JSON.parse(message.text);
    console.log("Message from peer:", message, memberId);
};


let createOffer = async (memberId) => {
    // create RTCPeerConnection
    peerConnection = new RTCPeerConnection();
    // peerConnection.addStream(localStream);
    
    // create MediaStream for remote video
    remoteStream = new MediaStream();
    document.getElementById('remoteVideo').srcObject = remoteStream;

    // add localStream to peerConnection
    if(!localStream) {
        await getLocalStream();
    }
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    // add tracks to remoteStream
    peerConnection.ontrack = (event) => { 
        console.log("ontrack event:", event);
        event.streams[0].getTracks().forEach(track => remoteStream.addTrack(track));
    }
    
    // add ICE candidate
    peerConnection.onicecandidate = (event) => {
        if(event.candidate) {
            console.log("ICE candidate:", event.candidate);
            client.sendMessageToPeer({text: JSON.stringify({'type': 'candidate', 'candidate': event.candidate})}, memberId).then(sendResult => {
                console.log("Message sent:", sendResult);
            }).catch(console.error);
        }
    }
    


    // create offer
    let offer = await peerConnection.createOffer(servers);
    await peerConnection.setLocalDescription(offer);
    console.log("Offer:", offer);
    
    client.sendMessageToPeer({text: JSON.stringify({'type': 'offer', 'offer': offer})}, memberId).then(sendResult => {
        console.log("Message sent:", sendResult);
    }).catch(console.error);

    

    console.log("peerConnection:", peerConnection);
}

// createOffer();
init();