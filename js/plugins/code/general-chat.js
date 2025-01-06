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
        this.messages = [];
        this.participants = [];
        this.isJoined = false;
        this.isCameraOn = true;
        this.isMicOn = true;
        this.peerConnections = new Map();
        this.localStream = null;
        this.ws = null;
        this.u = "";
        this.userId = "";

        // Configuration for WebRTC
        this.rtcConfig = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        };
    }

    async setUser() {
        this.u = await document.getElementById('auth').getUserInfo();
        this.userId = this.u.email;
    }

    opened() {
        this.setUser();
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

    async joinCall() {
        try {
            // Get user media
            this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });

            // Add local video
            this.participants = [
                ...this.participants,
                {
                    id: 'local',
                    name: 'You',
                    stream: this.localStream
                }
            ];

            // Connect to signaling server
            this.connectSignalingServer();
            this.isJoined = true;
            this.requestUpdate();

        } catch (err) {
            console.error('Error joining call:', err);
            alert('Error joining call: ' + err.message);
        }
    }

    connectSignalingServer() {
        this.ws = new WebSocket('wss://cloud.wisk.cc/v2/plugins/call');
        const roomId = wisk.editor.pageId;

        this.ws.onopen = () => {
            // Join room
            this.ws.send(JSON.stringify({
                type: 'join',
                roomId: roomId,
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

        const peerConnection = new RTCPeerConnection(this.rtcConfig);
        this.peerConnections.set(userId, peerConnection);

        // Add all local tracks to the peer connection
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
            const existingParticipant = this.participants.find(p => p.id === userId);

            if (!existingParticipant) {
                this.participants = [...this.participants, {
                    id: userId,
                    name: `User ${userId.slice(0, 4)}`,
                    stream: event.streams[0]
                }];
                this.requestUpdate();
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
        const peerConnection = new RTCPeerConnection(this.rtcConfig);
        this.peerConnections.set(userId, peerConnection);

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
            const existingParticipant = this.participants.find(p => p.id === userId);

            if (!existingParticipant) {
                this.participants = [...this.participants, {
                    id: userId,
                    name: `User ${userId.slice(0, 4)}`,
                    stream: event.streams[0]
                }];
                this.requestUpdate();
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
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    async handleIceCandidate(userId, candidate) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
    }

    handleUserLeft(userId) {
        const peerConnection = this.peerConnections.get(userId);
        if (peerConnection) {
            peerConnection.close();
            this.peerConnections.delete(userId);
        }

        this.participants = this.participants.filter(p => p.id !== userId);
        this.requestUpdate();
    }

    endCall() {
        if (this.ws) {
            this.ws.send(JSON.stringify({
                type: 'leave',
                roomId: wisk.editor.pageId,
                userId: this.userId
            }));
            this.ws.close();
        }

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
        }

        this.peerConnections.forEach(pc => pc.close());
        this.peerConnections.clear();
        this.participants = [];
        this.isJoined = false;
        this.localStream = null;
        this.ws = null;
        this.requestUpdate();
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

