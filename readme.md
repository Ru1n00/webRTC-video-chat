# WebRTC Video Chat
A minimalistic WebRTC video chat web application create for learning purposes. Utilizes Agora for signaling and features a bare-bones frontend with just two video tags to keep things simple and focused.


## Key Features:
- **Peer-to-Peer Connections:** Establishes direct connections between peers for efficient video chat
- **Google STUN Server:** Uses Google's public STUN servers to facilitate NAT traversal and help peer discover each other.
- **Symmetric NAT Challenge:** Note that the application may not work correctly with Symmetric NAT due to the lack of a TURN server, which is essential for relaying media in networks with restirctive NAT configurations.