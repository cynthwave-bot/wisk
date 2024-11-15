import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

class AuthComponent extends LitElement {
    static styles = css`
        :host {
            display: contents;
        }
        * {
            box-sizing: border-box;
            font-family: var(--font);
        }
        .overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            backdrop-filter: blur(1px);
        }
        .dialog {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 80%;
        }
        .content {
            display: flex;
            flex-direction: column;
            gap: 22px;
        }
        .img-div {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        input {
            border: none;
            outline: none;
            background-color: #f2f2f2;
            border-radius: 2px;
            font-size: 14px;
            padding: 8px 12px;
            border: 1px solid #e6e6e6;
        }
        button {
            border: none;
            outline: none;
            background-color: black;
            color: white;
            cursor: pointer;
            border-radius: 4px;
            filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
            user-select: none;
            font-weight: 600;
            padding: 8px 20px;
            font-size: 14px;
        }
        #linkx,
        .message {
            font-size: 14px;
        }
        .social {
            display: flex;
            gap: 20px;
            align-items: center;
            padding: 10px 0px;
        }
        .error {
            color: red;
            font-size: 14px;
        }
        .success {
            color: green;
            font-size: 14px;
        }
        #btnGoogle {
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: center;
        }
        .user-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        .verified-mark {
            color: green;
            font-weight: bold;
        }
        .underline {
            color: blue;
        }
    `;

    static properties = {
        email: { type: String },
        password: { type: String },
        loading: { type: Boolean },
        error: { type: String },
        success: { type: String },
        mode: { type: String },
        visible: { type: Boolean },
        user: { type: Object },
    };

    constructor() {
        super();
        this.email = "";
        this.password = "";
        this.loading = false;
        this.error = "";
        this.success = "";
        this.mode = "signin";
        this.visible = false;
        this.user = null;

        const firebaseConfig = {
            apiKey: "AIzaSyAdMU0HRiJMV6GX8eX7JKbi3_088siSbdM",
            authDomain: "wisk-cc.firebaseapp.com",
            projectId: "wisk-cc",
            storageBucket: "wisk-cc.appspot.com",
            messagingSenderId: "701150484146",
            appId: "1:701150484146:web:3853862a323eda4ff39bab"
        };

        this.firstReload = true;

        const app = initializeApp(firebaseConfig);
        this.auth = getAuth(app);
        this.authInstance = this.auth;

        onAuthStateChanged(this.auth, this.handleAuthStateChange.bind(this));

        window.addEventListener('focus', this.handleFocusChange.bind(this));
    }

    show() {
        this.visible = true;
        this._originalBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        this.requestUpdate();
    }

    hide() {
        this.visible = false;
        document.body.style.overflow = this._originalBodyOverflow;
    }

    async getUserInfo() {
        const user = this.auth.currentUser;
        if (user) {
            const token = await user.getIdToken();
            return {
                token: token,
                uuid: user.uid,
                email: user.email
            };
        }
        return null;
    }

    render() {
        if (!this.visible) {
            return html``;
        }

        return html`
            <div class="overlay" @click=${this.handleOverlayClick}>
                <div class="dialog" @click=${this.handleDialogClick}>
                    <div class="content">
                        <div class="img-div">
                            <img src="/a7/wisk-logo.svg" alt="Logo" style="width: 45px;" />
                            <span style="font-weight: 600;">Wisk.cc / ${this.getModeTitle()}</span>
                        </div>

                        ${this.user && this.user.emailVerified ? this.renderUserInfo() : this.renderForm()}

                        <div class="error" style="display: ${this.error ? "block" : "none"}">${this.error}</div>

                        <div class="success" style="display: ${this.success ? "block" : "none"}">${this.success}</div>

                        ${this.renderLinks()}
                        ${this.renderSocialLogin()}
                    </div>
                </div>
            </div>
        `;
    }

    renderUserInfo() {
        return html`
            <div class="user-info">
                <p>Signed in as: ${this.user.email} ✓ Verified</p>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button @click=${async () => { await this.reloadUser(); }} style="display: none">Reload User</button>
                    <button @click=${this.logOut}>Log Out</button>
                    <button @click=${() => window.location.href = "/"} style="display: none">Go to Dashboard</button>
                </div>
            </div>
        `;
    }

    renderForm() {
        switch (this.mode) {
            case "signin":
            case "signup":
                return html`
                    <input type="email" id="txtEmail" placeholder="Email" .value=${this.email} @input=${this.handleEmailInput} ?disabled=${this.loading} />
                    <input type="password" id="txtPassword" placeholder="Password" .value=${this.password} @input=${this.handlePasswordInput} ?disabled=${this.loading} />
                    <button @click=${this.mode === "signin" ? this.logInAccount : this.signUpAccount} ?disabled=${this.loading}>${this.loading ? "Loading..." : this.mode === "signin" ? "Sign In" : "Sign Up"}</button>
                `;
            case "reset":
                return html`
                    <input type="email" id="txtEmail" placeholder="Email" .value=${this.email} @input=${this.handleEmailInput} ?disabled=${this.loading} />
                    <button @click=${this.resetPassword} ?disabled=${this.loading}>${this.loading ? "Loading..." : "Reset Password"}</button>
                `;
            case "verify":
                return html`
                    <p class="message">Please check your email for a verification link.</p>
                    <button @click=${this.resendVerificationEmail} ?disabled=${this.loading}>${this.loading ? "Loading..." : "Resend Verification Email"}</button>
                `;
        }
    }

    renderLinks() {
        if (this.user && this.user.emailVerified) {
            return html``;
        }

        switch (this.mode) {
            case "signin":
                return html`
                    <div id="linkx">
                        Don't have an account? <a href="#" @click=${() => this.setMode("signup")} class="underline">Sign Up</a> <br/> <br/>
                        <a href="#" @click=${() => this.setMode("reset")} class="underline">Forgot Password?</a>
                    </div>
                `;
            case "signup":
                return html` <div id="linkx">Already have an account? <a href="#" @click=${() => this.setMode("signin")} class="underline">Sign In</a></div> `;
            case "reset":
            case "verify":
                return html`
                    <div id="linkx">
                        <a href="#" @click=${() => this.setMode("signin")} class="underline">Back to Sign In</a>
                    </div>
                `;
        }
    }

    renderSocialLogin() {
        if (this.user && this.user.emailVerified) {
            return html``;
        }
        if (this.mode === "signin" || this.mode === "signup") {
            return html`
                <div></div>
                <div></div>
                <div class="social">
                    <button id="btnGoogle" @click=${this.loginWithGoogle}>
                        ${this.mode === "signin" ? "Sign in" : "Sign up"} with
                        <img src="/a7/forget/google-logo.png" alt="Google" style="filter: invert(1); width: 20px;" />
                    </button>
                </div>
            `;
        }
        return html``;
    }

    getModeTitle() {
        switch (this.mode) {
            case "signin":
                return "Sign In";
            case "signup":
                return "Sign Up";
            case "reset":
                return "Reset Password";
            case "verify":
                return "Verify Email";
        }
    }

    setMode(mode) {
        this.mode = mode;
        this.error = "";
        this.success = "";
    }

    handleEmailInput(e) {
        this.email = e.target.value;
    }

    handlePasswordInput(e) {
        this.password = e.target.value;
    }

    handleOverlayClick(e) {
        // disppatch event to window
        this.hide();
        window.dispatchEvent(new CustomEvent("auth-component-close"));
    }

    handleDialogClick(e) {
        e.stopPropagation();
    }

    async logInAccount() {
        window.tryingIn = true;

        this.loading = true;
        this.error = "";
        this.success = "";

        try {
            await signInWithEmailAndPassword(this.auth, this.email, this.password);
            console.log(`> successfully signed in`);
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }

    async logOut() {
        try {
            await signOut(this.auth);
            this.user = null;
            this.setMode("signin");
            console.log("> logged out");
        } catch (error) {
            this.error = "Error logging out: " + error.message;
        }
    }

    async signUpAccount() {
        window.tryingIn = true;
        this.loading = true;
        this.error = "";
        this.success = "";

        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, this.email, this.password);
            await sendEmailVerification(userCredential.user);
            this.success = "Account created successfully. Please check your email for verification.";
            this.setMode("verify");
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }

    async resetPassword() {
        this.loading = true;
        this.error = "";
        this.success = "";

        try {
            await sendPasswordResetEmail(this.auth, this.email);
            this.success = "Password reset email sent. Please check your inbox.";
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }

    async resendVerificationEmail() {
        this.loading = true;
        this.error = "";
        this.success = "";

        try {
            if (this.auth.currentUser) {
                await sendEmailVerification(this.auth.currentUser);
                this.success = "Verification email resent. Please check your inbox.";
            } else {
                this.error = "No user is currently signed in.";
            }
        } catch (error) {
            this.error = error.message;
        } finally {
            this.loading = false;
        }
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(this.auth, provider);
            console.log(result.user);
        } catch (error) {
            console.log(error);
            this.error = error.message;
        }
    }

    async handleFocusChange() {
        if (this.user && !this.user.emailVerified) {
            await this.reloadUser();
        }
    }

    async reloadUser() {
        await this.user.reload();
        await this.user.getIdToken(true);
        this.handleAuthStateChange(this.auth.currentUser);
    }

    async handleAuthStateChange(user) {
        this.user = user;
        if (user) {
            console.log(`AUTH:: logged in`);
            if (user.emailVerified) {

                const tokenResult = await user.getIdTokenResult();
                const tokenEmailVerified = tokenResult.claims.email_verified || false;
                if (user.emailVerified && !tokenEmailVerified) {
                    await this.reloadUser();
                }

                this.setMode("loggedin");
                
                if (window.tryingIn) {
                    window.location.href = "/";
                }

                if (window.onSignIn) {
                    window.onSignIn();
                } else {
                    console.log(`AUTH:: onSignIn not defined`);
                }
            } else {
                this.setMode("verify");
            }
        } else {
            console.log(`AUTH:: logged out`);
            this.setMode("signin");
            if (window.onSignOut) {
                window.onSignOut();
            } else {
                console.log(`AUTH:: onSignOut not defined`);
            }
        }
        this.requestUpdate();
    }
}

customElements.define("auth-component", AuthComponent);
