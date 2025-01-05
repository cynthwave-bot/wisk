import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class GeneralChat extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            scroll-behavior: smooth;
        }
        .container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }
        .tabs {
            display: flex;
            background-color: var(--bg-1);
            border-bottom: 1px solid var(--border-1);
        }
        .tab {
            padding: var(--padding-3) var(--padding-4);
            cursor: pointer;
            color: var(--text-2);
            border-bottom: 2px solid transparent;
            transition: all 0.2s ease;
        }
        .tab.active {
            color: var(--text-1);
            border-bottom: 2px solid var(--fg-blue);
        }
        .chat-container {
            flex: 1;
            overflow-y: auto;
            background-color: var(--bg-1);
            padding: var(--padding-4);
            display: flex;
            flex-direction: column;
            gap: var(--gap-3);
        }
        .video-container {
            flex: 1;
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .video-participants {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: var(--gap-3);
            position: relative;
            overflow: auto;
            flex: 1;
            padding: var(--padding-4);
        }
        .video-participant {
            aspect-ratio: 1/1;
            background-color: var(--bg-3);
            border-radius: var(--radius);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
        }
        .participant-video {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .participant-name {
            position: absolute;
            bottom: var(--padding-2);
            left: var(--padding-2);
            color: var(--text-1);
            font-size: 14px;
            background-color: rgba(0, 0, 0, 0.5);
            padding: var(--padding-1) var(--padding-2);
            border-radius: var(--radius);
        }
        .message {
            display: flex;
            gap: var(--gap-2);
            align-items: flex-start;
        }
        .message.sent {
            flex-direction: row-reverse;
        }
        .message-bubble {
            background-color: var(--bg-3);
            padding: var(--padding-3);
            border-radius: var(--radius);
            max-width: 70%;
            font-size: 14px;
            color: var(--text-1);
        }
        .message.sent .message-bubble {
            background-color: var(--fg-blue);
            color: white;
        }
        .input-container {
            padding: var(--padding-4);
            background-color: var(--bg-1);
            border-top: 1px solid var(--border-1);
        }
        .input-wrapper {
            display: flex;
            gap: var(--gap-2);
            align-items: center;
        }
        .input-textarea {
            flex: 1;
            padding: var(--padding-3);
            border-radius: var(--radius);
            border: 1px solid var(--border-1);
            background-color: var(--bg-3);
            color: var(--text-1);
            font-size: 14px;
            resize: none;
            outline: none;
            min-height: 40px;
        }
        .send-button {
            padding: var(--padding-3);
            background-color: var(--fg-blue);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .video-controls {
            display: flex;
            gap: var(--gap-2);
            padding: var(--padding-2);
            border-radius: var(--radius);
            align-items: center;
            justify-content: center;
        }
        .control-button {
            padding: var(--padding-3);
            border-radius: 50%;
            border: none;
            cursor: pointer;
            background-color: var(--bg-3);
            color: var(--text-1);
            width: 54px;
            height: 54px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .control-button.end-call {
            background-color: #ff4444;
            color: white;
        }
        .control-button.disabled {
            background-color: var(--bg-2);
            cursor: not-allowed;
        }
        .join-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: var(--gap-4);
            height: 100%;
        }
        .join-button {
            padding: var(--padding-3) var(--padding-4);
            background-color: var(--fg-blue);
            border: none;
            border-radius: var(--radius);
            cursor: pointer;
            color: white;
            font-size: 16px;
        }
    `;

    static properties = {
        activeTab: { type: String },
        messages: { type: Array },
        participants: { type: Array },
        isJoined: { type: Boolean },
        localStream: { type: Object },
        peerConnections: { type: Object },
        wsConnection: { type: Object },
        isCameraOn: { type: Boolean },
        isMicOn: { type: Boolean }
    };

    constructor() {
        super();
        this.activeTab = 'text';
        this.messages = [
            { id: 1, text: "Hey everyone!", sender: "Alice", sent: false },
            { id: 2, text: "Hi Alice!", sender: "Bob", sent: false },
            { id: 3, text: "How's it going?", sender: "Me", sent: true },
            { id: 4, text: "Great! Just working on some code.", sender: "Charlie", sent: false }
        ];
        this.participants = [];
        this.isJoined = false;
        this.localStream = null;
        this.peerConnections = {};
        this.wsConnection = null;
        this.isCameraOn = true;
        this.isMicOn = true;
    }

    async joinCall() {
        const roomId = wisk.editor.pageId;
        if (!roomId) return;

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            this.participants = [{ id: 'local', name: 'Me (You)', stream: this.localStream }];
            this.isJoined = true;
            this.connectWebSocket(roomId); // Pass roomId to WebSocket connection
            
            // Update UI
            this.requestUpdate();
            
            // Set up local video
            const localVideo = this.shadowRoot.querySelector('#local-video');
            if (localVideo) {
                localVideo.srcObject = this.localStream;
            }
        } catch (e) {
            console.error('Error accessing media devices:', e);
        }
    }

    connectWebSocket(roomId) {
        this.wsConnection = new WebSocket(`wss://cloud.wisk.cc/v2/plugins/call?roomId=${roomId}`);
        
        this.wsConnection.onopen = () => {
            console.log('WebSocket Connected');
        };
        
        this.wsConnection.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            
            switch (message.type) {
                case 'new-peer':
                    this.handleNewPeer(message.peerId);
                    break;
                case 'offer':
                    await this.handleOffer(message.peerId, message.offer);
                    break;
                case 'answer':
                    await this.handleAnswer(message.peerId, message.answer);
                    break;
                case 'ice-candidate':
                    await this.handleIceCandidate(message.peerId, message.candidate);
                    break;
                case 'peer-disconnected':
                    this.handlePeerDisconnected(message.peerId);
                    break;
            }
        };
    }

    async handleNewPeer(peerId) {
        const pc = this.createPeerConnection(peerId);

        try {
            // Create an offer and set it as the local description
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Send the offer to the remote peer
            this.wsConnection.send(JSON.stringify({
                type: 'offer',
                peerId: peerId,
                offer: offer
            }));
        } catch (e) {
            console.error('Error creating offer:', e);
        }
    }

    createPeerConnection(peerId) {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        this.peerConnections[peerId] = pc;

        // Add local tracks to the connection
        this.localStream.getTracks().forEach(track => {
            pc.addTrack(track, this.localStream);
        });

        // Handle incoming streams
        pc.ontrack = (event) => {
            const stream = event.streams[0];
            if (!this.participants.find(p => p.id === peerId)) {
                this.participants = [...this.participants, {
                    id: peerId,
                    name: `Participant ${peerId}`,
                    stream: stream
                }];
            }
        };

        // Handle ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.wsConnection.send(JSON.stringify({
                    type: 'ice-candidate',
                    peerId: peerId,
                    candidate: event.candidate
                }));
            }
        };

        return pc;
    }

    async handleOffer(peerId, offer) {
        const pc = this.createPeerConnection(peerId);

        try {
            // Set the remote description (offer) first
            await pc.setRemoteDescription(new RTCSessionDescription(offer));

            // Create an answer and set it as the local description
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            // Send the answer to the remote peer
            this.wsConnection.send(JSON.stringify({
                type: 'answer',
                peerId: peerId,
                answer: answer
            }));
        } catch (e) {
            console.error('Error handling offer:', e);
        }
    }

    async handleAnswer(peerId, answer) {
        try {
            const pc = this.peerConnections[peerId];

            // Set the remote description (answer)
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (e) {
            console.error('Error handling answer:', e);
        }
}

    async handleIceCandidate(peerId, candidate) {
        try {
            const pc = this.peerConnections[peerId];
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
            console.error('Error handling ICE candidate:', e);
        }
    }

    handlePeerDisconnected(peerId) {
        if (this.peerConnections[peerId]) {
            this.peerConnections[peerId].close();
            delete this.peerConnections[peerId];
        }
        
        this.participants = this.participants.filter(p => p.id !== peerId);
    }

    toggleCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.isCameraOn = videoTrack.enabled;
            }
        }
    }

    toggleMic() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.isMicOn = audioTrack.enabled;
            }
        }
    }

    endCall() {
        // Close all peer connections
        Object.values(this.peerConnections).forEach(pc => pc.close());
        this.peerConnections = {};
        
        // Stop all tracks in local stream
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }
        
        // Close WebSocket connection
        if (this.wsConnection) {
            this.wsConnection.close();
            this.wsConnection = null;
        }
        
        // Reset state
        this.isJoined = false;
        this.participants = [];
        this.isCameraOn = true;
        this.isMicOn = true;
    }

    switchTab(tab) {
        this.activeTab = tab;
    }

    sendMessage(event) {
        event.preventDefault();
        const textarea = this.shadowRoot.querySelector('.input-textarea');
        const message = textarea.value.trim();
        
        if (!message) return;
        
        this.messages = [
            ...this.messages,
            {
                id: this.messages.length + 1,
                text: message,
                sender: "Me",
                sent: true
            }
        ];
        
        textarea.value = '';
    }

    render() {
        return html`
            <div class="container">
                <div class="tabs">
                    <div class="tab ${this.activeTab === 'text' ? 'active' : ''}" 
                         @click=${() => this.switchTab('text')}>
                        Text Chat
                    </div>
                    <div class="tab ${this.activeTab === 'video' ? 'active' : ''}"
                         @click=${() => this.switchTab('video')}>
                        Video Chat
                    </div>
                </div>

                ${this.activeTab === 'text' ? html`
                    <div class="chat-container">
                        ${this.messages.map(message => html`
                            <div class="message ${message.sent ? 'sent' : ''}">
                                <div class="message-bubble">
                                    ${!message.sent ? html`<strong>${message.sender}:</strong> ` : ''}
                                    ${message.text}
                                </div>
                            </div>
                        `)}
                    </div>
                    <div class="input-container">
                        <div class="input-wrapper">
                            <textarea class="input-textarea" 
                                placeholder="Type a message..."
                                @keydown=${(e) => e.key === 'Enter' && !e.shiftKey && this.sendMessage(e)}></textarea>
                            <button class="send-button" @click=${this.sendMessage}>
                                Send
                            </button>
                        </div>
                    </div>
                ` : html`
                    <div class="video-container">
                        ${!this.isJoined ? html`
                            <div class="join-container">
                                <button class="join-button" @click=${this.joinCall}>
                                    Join Video Call
                                </button>
                            </div>
                        ` : html`
                            <div class="video-participants">
                                ${this.participants.map(participant => html`
                                    <div class="video-participant">
                                        <video
                                            id="${participant.id}-video"
                                            class="participant-video"
                                            ?muted=${participant.id === 'local'}
                                            autoplay
                                            playsinline
                                            .srcObject=${participant.stream}
                                        ></video>
                                        <span class="participant-name">${participant.name}</span>
                                    </div>
                                `)}
                            </div>

                            <div class="video-controls">
                                <button 
                                    class="control-button ${!this.localStream ? 'disabled' : ''}"
                                    @click=${this.toggleCamera}
                                >
                                    <img 
                                        src=${this.isCameraOn ? "/a7/plugins/general-chat/cam-on.svg" : "/a7/plugins/general-chat/cam-off.svg"}
                                        style="filter: var(--themed-svg)" 
                                    />
                                </button>
                                <button 
                                    class="control-button ${!this.localStream ? 'disabled' : ''}"
                                    @click=${this.toggleMic}
                                >
                                    <img 
                                        src=${this.isMicOn ? "/a7/plugins/general-chat/mic-on.svg" : "/a7/plugins/general-chat/mic-off.svg"}
                                        style="filter: var(--themed-svg)" 
                                    />
                                </button>
                                <button class="control-button end-call" @click=${this.endCall}>
                                    <img 
                                        src="/a7/plugins/general-chat/phone-exit.svg"
                                        style="filter: invert(1)"
                                    />
                                </button>
                            </div>
                        `}
                    </div>
                `}
            </div>
        `;
    }
}

customElements.define("general-chat", GeneralChat);
