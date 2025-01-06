import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class WebRTCRoom {
    constructor(component) {
        this.component = component;
        this.localStream = null;
        this.peers = new Map();
        this.ws = null;
        this.userId = Math.random().toString(36).substr(2, 9);
    }

    async setupLocalStream() {
        this.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        this.component.participants = [
            ...this.component.participants,
            {
                id: 'local',
                name: 'You',
                stream: this.localStream
            }
        ];
    }

    connectSignalingServer() {
        this.ws = new WebSocket('wss://cloud.wisk.cc/v2/plugins/call');

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({
                type: 'join',
                userId: this.userId
            }));
        };

        this.ws.onmessage = async (event) => {
            const message = JSON.parse(event.data);
            await this.handleSignalingMessage(message);
        };
    }

    async handleSignalingMessage(message) {
        switch (message.type) {
            case 'user-joined':
                await this.handleUserJoined(message.userId);
                break;
            case 'user-left':
                this.handleUserLeft(message.userId);
                break;
            case 'offer':
                await this.handleOffer(message.userId, message.offer);
                break;
            case 'answer':
                await this.handleAnswer(message.userId, message.answer);
                break;
            case 'ice-candidate':
                await this.handleIceCandidate(message.userId, message.candidate);
                break;
        }
    }

    async handleUserJoined(userId) {
        if (userId === this.userId) return;
        
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
        
        const peerConnection = new RTCPeerConnection(configuration);
        this.peers.set(userId, peerConnection);

        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    userId: this.userId,
                    targetUserId: userId,
                    candidate: event.candidate
                }));
            }
        };

        peerConnection.ontrack = (event) => {
            const exists = this.component.participants.some(p => p.id === userId);
            if (!exists) {
                this.component.participants = [
                    ...this.component.participants,
                    {
                        id: userId,
                        name: `User ${userId.substr(0, 4)}`,
                        stream: event.streams[0]
                    }
                ];
            }
        };

        if (this.userId > userId) {
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            
            this.ws.send(JSON.stringify({
                type: 'offer',
                userId: this.userId,
                targetUserId: userId,
                offer
            }));
        }
    }

    async handleOffer(userId, offer) {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });
        this.peers.set(userId, peerConnection);

        this.localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, this.localStream);
        });

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                this.ws.send(JSON.stringify({
                    type: 'ice-candidate',
                    userId: this.userId,
                    targetUserId: userId,
                    candidate: event.candidate
                }));
            }
        };

        peerConnection.ontrack = (event) => {
            const exists = this.component.participants.some(p => p.id === userId);
            if (!exists) {
                this.component.participants = [
                    ...this.component.participants,
                    {
                        id: userId,
                        name: `User ${userId.substr(0, 4)}`,
                        stream: event.streams[0]
                    }
                ];
            }
        };

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        this.ws.send(JSON.stringify({
            type: 'answer',
            userId: this.userId,
            targetUserId: userId,
            answer
        }));
    }

    async handleAnswer(userId, answer) {
        const peerConnection = this.peers.get(userId);
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    async handleIceCandidate(userId, candidate) {
        const peerConnection = this.peers.get(userId);
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    handleUserLeft(userId) {
        const peerConnection = this.peers.get(userId);
        if (peerConnection) {
            peerConnection.close();
            this.peers.delete(userId);
        }

        this.component.participants = this.component.participants.filter(p => p.id !== userId);
    }

    async disconnect() {
        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        this.peers.forEach(peerConnection => peerConnection.close());
        this.peers.clear();

        if (this.ws) {
            this.ws.send(JSON.stringify({
                type: 'leave',
                userId: this.userId
            }));
            this.ws.close();
        }

        this.component.participants = [];
        this.component.isJoined = false;
    }
}

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
        isCameraOn: { type: Boolean },
        isMicOn: { type: Boolean }
    };

    constructor() {
        super();
        this.activeTab = 'text';
        this.messages = [
            { id: 1, text: "Hey everyone!", sender: "Alice", sent: false },
            { id: 2, text: "Hi Alice!", sender: "Bob", sent: false },
            { id: 3, text: "How's it going?", sender: "Me", sent: true }
        ];
        this.participants = [];
        this.isJoined = false;
        this.isCameraOn = true;
        this.isMicOn = true;
        this.webrtcRoom = new WebRTCRoom(this);
    }

    async joinCall() {
        try {
            await this.webrtcRoom.setupLocalStream();
            this.webrtcRoom.connectSignalingServer();
            this.isJoined = true;
        } catch (error) {
            console.error('Error joining call:', error);
        }
    }

    async endCall() {
        await this.webrtcRoom.disconnect();
    }

    toggleCamera() {
        if (this.localStream) {
            const videoTrack = this.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                this.isCameraOn = videoTrack.enabled;
                this.requestUpdate();
            }
        }
    }

    toggleMic() {
        if (this.localStream) {
            const audioTrack = this.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                this.isMicOn = audioTrack.enabled;
                this.requestUpdate();
            }
        }
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
                        Video Call
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

