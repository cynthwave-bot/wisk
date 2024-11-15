import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class CySearch extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
            outline: none;
            transition: all 0.2s ease;
        }

        .p12 {
            font-size: 42px;
            font-weight: 700;
            color: #000;
            text-align: center;
            margin-bottom: 20px;
            margin-top: 20px;
            font-family: "Plus Jakarta Sans", sans-serif;
            display: none;
        }

        @media (max-width: 1000px) {
            .p12 {
                font-size: 32px;
                margin-bottom: 20px;
            }
        }

        .checkbox-label {
            font-size: 14px;
            color: #333;
            width: 100%;
            max-width: 200px;
        }

        input[type="checkbox"] {
            width: 20px;
            height: 20px;
            cursor: pointer;
        }

        @media (max-width: 1000px) {
            input[type="checkbox"] {
                width: 18px;
                height: 18px;
            }

            .checkbox-label {
                max-width: 100%;
            }
        }

        .below {
            padding: 10px;
            border-radius: 4px;
            background-color: white;
            justify-content: center;
            width: 100%;
            max-width: 800px;
            margin: 30px 0;
            flex-direction: row;
            display: flex;
            gap: 20px;
            font-size: 14px;
        }

        .displaynone {
            display: none;
        }

        @media (max-width: 1000px) {
            .below {
                flex-direction: column;
                gap: 10px;
                padding: 10px;
                font-size: 12px;
                margin: 20px 0;
                margin-bottom: 0px;
            }
        }

        .case-study > label,
        .case-study > input {
            padding: 10px 0;
            width: 100%;
            outline: none;
        }

        .search {
            display: flex;
            align-items: center;
            flex-direction: column;
            padding: 20px;
        }

        @media (max-width: 1000px) {
            .search {
            }
        }

        .suggestions {
            display: flex;
            flex-direction: row;
            gap: 20px;
            padding: 20px 40px;
            align-items: center;
            white-space: nowrap;

            max-width: 100vw;
            overflow-x: scroll;
            margin-top: 20px;
        }

        *::-webkit-scrollbar {
            display: none;
        }

        * {
            -ms-overflow-style: none; /* IE and Edge */
            scrollbar-width: none; /* Firefox */
        }

        @media (max-width: 1000px) {
            .suggestions {
                padding: 10px 20px;
                gap: 10px;
                margin-top: 20px;
                max-width: 100vw;
            }
        }

        .suggestion-title {
            font-size: 12px;
            font-weight: 500;
            color: #000;
        }

        .suggestion {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 4px 10px;
            border: 1px solid #eee;
            border-radius: 20px;
            background-color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 12px;
        }

        .suggestion:hover {
            border: 1px solid #000;
        }

        @media (max-width: 1000px) {
            .suggestion {
                padding: 4px 10px;
            }
        }

        .search-bar {
            width: 100%;
            max-width: 800px;
            display: flex;
            align-items: center;
            justify-content: center;
            filter: drop-shadow(0px 4px 7px rgba(0, 0, 0, 0.6));
            border-radius: 51px;
            padding: 0 20px;
            padding-left: 12px;
            padding-right: 15px;
            background-color: #18181b;
            overflow: hidden;
        }

        @media (max-width: 1000px) {
            .search-bar {
                padding: 0 20px;
                padding-right: 15px;
            }
        }

        .select-bar {
            width: 100%;
            max-width: 800px;
            display: flex;
            gap: 10px;
            align-items: center;
            justify-content: center;
            background-color: white;
            margin-bottom: 20px;
        }

        @media (max-width: 1000px) {
            .select-bar {
                margin-bottom: 20px;
            }
        }

        .select-button {
            padding: 10px 20px;
            border-radius: 20px;
            border: none;
            background-color: white;
            color: #000;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            outline: none;
        }

        @media (max-width: 1000px) {
            .select-button {
                padding: 7px 14px;
                font-size: 12px;
            }
        }

        @media (min-width: 1000px) {
            .select-button:hover {
                background-color: #eee;
                color: #000;
            }
        }

        .select-active {
            background-color: black;
            color: white;
        }

        .search-input {
            width: 100%;
            height: 50px;
            border-radius: 0px;
            border: none;
            padding: 10px;
            font-size: 14px;
            background-color: #18181b;
            color: #fff;
            outline: none;
            font-weight: 500;
        }

        @media (max-width: 1000px) {
            .search-input {
                padding: 0px;
            }
        }

        ::placeholder {
            color: #9999a2;
        }

        .search-icon {
            height: 50px;
            width: 50px;
            padding: 10px;
            font-size: 14px;
            color: #fff;
            margin-left: 0px;
            border-radius: 240px;
            padding-left: 0px;
            border: none;
            border-top-right-radius: 0px;
            border-bottom-right-radius: 0px;
            /*()filter: drop-shadow(0px 0px 7px rgba(255, 255, 255, 1));*/
        }

        @media (max-width: 1000px) {
            .search-icon {
                width: 34px;
            }
        }

        .btn-disabled {
            cursor: not-allowed;
            opacity: 0.5;
        }

        .suggestions-hidden {
            opacity: 0;
            pointer-events: none;
        }
    `;

    static properties = {
        defaultOption: { type: String },
    };

    constructor() {
        super();
        this.defaultOption = "diagram";
        this.connectionLock = false;
        this.currentOption = "diagram";
        this.selectedFiles = []; // this will keep files in base64 format
        this.suggestions = {
            "case-study": [
                {
                    short: "Impact of remote work on productivity in the ...",
                    long: "Impact of remote work on productivity in the tech industry over the past five years",
                },
                {
                    short: "Examining the success of renewable energy initiatives in reducing ...",
                    long: "Examining the success of renewable energy initiatives in reducing carbon emissions in European countries, with a focus on solar and wind energy from 2015 to 2023",
                },
                {
                    short: "Role of microfinance in empowering women entrepreneurs in ...",
                    long: "Role of microfinance in empowering women entrepreneurs in Southeast Asia, with success stories and economic impact analysis from the last decade",
                },
            ],
            "data-analysis": [],
            diagram: [
                {
                    short: "Show how lending loan works in banks ...",
                    long: "Show how lending loan works in banks using sequence diagram in detail",
                },
                {
                    short: "Explain the working of fizzbuzz program",
                    long: "Explain the working of fizzbuzz program using flowchart",
                },
                {
                    short: "Show an outline of how to take a product from idea to ...",
                    long: "Show an outline of how to take a product from idea to market in detail",
                },
            ],
        };
    }

    firstUpdated() {
        const select = this.defaultOption;
        this.updateButtonLabels(this.defaultOption);

        const searchInput = this.renderRoot.querySelector(".search-input");
        searchInput.addEventListener("keydown", this.handleInputKeydown.bind(this));
    }

    handleInputKeydown(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            this.onSearchInput();
        }
    }

    updateButtonLabels(option) {
        const suggestions = this.suggestions[option] || [];
        suggestions.forEach((suggestion, index) => {
            const button = this.renderRoot.querySelector(`#sug${index + 1}`);
            if (button) {
                button.textContent = suggestion.short;
            }
        });
        this.shadowRoot.querySelector(".search-input").value = "";
    }

    onFirstSuggestionClick() {
        this.animateSuggestion(this.suggestions[this.currentOption][0].long);
    }

    onSecondSuggestionClick() {
        this.animateSuggestion(this.suggestions[this.currentOption][1].long);
    }

    onThirdSuggestionClick() {
        this.animateSuggestion(this.suggestions[this.currentOption][2].long);
    }

    async animateSuggestion(str) {
        if (this.connectionLock) return;
        this.connectionLock = true;
        const it = this.shadowRoot.querySelector(".search-input");

        for (var i = 0; i < str.length + 1; i++) {
            it.value = str.substring(0, i);
            it.scrollLeft = it.scrollWidth; // Update scroll position
            await new Promise((r) => setTimeout(r, 15));
        }

        it.focus();
        this.connectionLock = false;
    }

    async onSearchInput() {
        console.log("searching");
        if (this.connectionLock) return;
        this.connectionLock = true;
        console.log("done");

        if (window.__user == null) {
            window.location.href = "/signin";
            return;
        }

        if (this.shadowRoot.querySelector(".search-input").value.length < 25) {
            window.showErrorOrInfoDialog("Query should be at least 25 character long", "error");
            this.connectionLock = false;
            this.shadowRoot.querySelector(".search-input").blur();
            return;
        }

        if (this.shadowRoot.querySelector(".search-input").value.length > 1500) {
            window.showErrorOrInfoDialog("Query should be at most 1500 character long", "error");
            this.connectionLock = false;
            this.shadowRoot.querySelector(".search-input").blur();
            return;
        }

        if (this.currentOption == "diagram") {
            const cooking = document.querySelector("#cooking");
            cooking.style.display = "flex";

            cooking.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 200,
                iterations: 1,
                fill: "forwards",
            });

            (async () => {
                const rawResponse = await fetch("https://cloud.diagram.chat/v3/diagram/project", {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${window.__user.accessToken}`,
                    },
                    body: JSON.stringify({
                        query: this.shadowRoot.querySelector(".search-input").value,
                        type: "diagram",
                    }),
                });

                document.querySelector("#cooking").style.display = "none";
                if (rawResponse.status !== 200) {
                    alert("Something went wrong. Please try again.");
                    window.showErrorOrInfoDialog("Something went wrong. Please try again.", "error");
                    return;
                }

                const responseText = await rawResponse.text();
                window.location.href = "/editor/diagram?id=" + responseText;
            })();
        }

        if (this.currentOption == "case-study") {
            const cooking = document.querySelector("#cooking");
            cooking.style.display = "flex";

            cooking.animate([{ opacity: 0 }, { opacity: 1 }], {
                duration: 200,
                iterations: 1,
                fill: "forwards",
            });

            await this.fetchData();
        }

        this.connectionLock = false;
        this.shadowRoot.querySelector(".search-input").blur();
    }

    async fetchData() {
        const cooking = document.querySelector("#cooking");
        const input = this.shadowRoot.querySelector(".search-input");
        const scrapeWeb = this.shadowRoot.querySelector("#file-checkbox").checked;
        const generateOutlineOnly = this.shadowRoot.querySelector("#outline-checkbox").checked;
        const attachedStuff = this.selectedFiles.length > 0;
        const attachments = this.selectedFiles;

        // disable scrolling
        document.body.style.overflow = "hidden";
        try {
            console.log("fetching data");

            const tokn = window.__user.accessToken;
            const socket = new WebSocket("wss://cloud.diagram.chat/v3/document/new");

            console.log("socket", tokn);

            socket.onopen = function (e) {
                console.log("[open] Connection established");

                const data = {
                    firebaseAuthToken: tokn,
                    query: input.value,
                    type_name: "case-study",
                    scrape_web: scrapeWeb,
                    generate_outline_only: generateOutlineOnly,
                    attached_stuff: attachedStuff,
                    attachments: attachments,
                };

                // Send the data through WebSocket
                console.log("[message] Sending data to server: ", data);
                socket.send(JSON.stringify(data));
            };

            socket.onmessage = function (event) {
                console.log(`[message] Data received from server: ${event.data}`);
                if (event.data.startsWith("err")) {
                    document.body.style.overflow = "auto";
                    cooking.style.display = "none";

                    window.clearCooking();
                    window.showErrorOrInfoDialog(event.data.substring(3), "error");
                    return;
                }
                if (event.data.startsWith("inf")) {
                    document.body.style.overflow = "auto";
                    cooking.style.display = "none";

                    window.clearCooking();
                    window.showErrorOrInfoDialog(event.data.substring(3), "info");
                    return;
                }
                if (event.data.startsWith("msg")) {
                    const resTextDiv = document.getElementById("cooking-p");
                    const messageSpan = document.createElement("span");
                    messageSpan.style.overflow = "hidden";

                    messageSpan.innerHTML = event.data.substring(3) + "<br>";
                    resTextDiv.appendChild(messageSpan);

                    const resTextv = document.getElementById("cooking");
                    resTextv.scrollTop = resTextv.scrollHeight;
                    return;
                }
                if (event.data.startsWith("res")) {
                    const pageId = event.data.split(" ")[1];
                    window.location.href = "/editor/case-study?id=" + pageId;
                    return;
                }
            };

            socket.onerror = function (error) {
                console.log(`[error] ${error.message}`);
                alert("Something went wrong, please try again later");
                cooking.style.display = "none";
                document.body.style.overflow = "auto";
            };

            socket.onclose = function (event) {
                if (event.wasClean) {
                    console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
                } else {
                    console.log("[close] Connection died");
                    window.clearCooking();
                    window.showErrorOrInfoDialog("Connection died", "error");
                }
            };
        } catch (err) {
            console.error(err);
            alert("Something went wrong, please try again later");
            cooking.style.display = "none";
            document.body.style.overflow = "auto";
        } finally {
            console.log("finally");
            // Make sure 'cooking' is defined and used correctly
        }
    }

    selectedButton(name) {
        this.currentOption = name;
        if (name === "case-study") {
            this.shadowRoot.querySelector(".case-study").classList.remove("displaynone");
            this.shadowRoot.querySelector(".data-analysis").classList.add("displaynone");

            // change the background color of the button
            this.shadowRoot.querySelector("#case-study-button").classList.add("select-active");
            this.shadowRoot.querySelector("#diagram-button").classList.remove("select-active");
            this.shadowRoot.querySelector("#data-analysis-button").classList.remove("select-active");
        } else if (name === "data-analysis") {
            this.shadowRoot.querySelector(".case-study").classList.add("displaynone");
            this.shadowRoot.querySelector(".data-analysis").classList.remove("displaynone");

            // change the background color of the button
            this.shadowRoot.querySelector("#data-analysis-button").classList.add("select-active");
            this.shadowRoot.querySelector("#diagram-button").classList.remove("select-active");
            this.shadowRoot.querySelector("#case-study-button").classList.remove("select-active");
        } else {
            this.shadowRoot.querySelector(".case-study").classList.add("displaynone");
            this.shadowRoot.querySelector(".data-analysis").classList.add("displaynone");

            // change the background color of the button
            this.shadowRoot.querySelector("#diagram-button").classList.add("select-active");
            this.shadowRoot.querySelector("#case-study-button").classList.remove("select-active");
            this.shadowRoot.querySelector("#data-analysis-button").classList.remove("select-active");
        }
        this.updateButtonLabels(name);
    }

    onFileCheckboxChange(event) {
        if (event.target.checked) {
            this.shadowRoot.querySelector("#outline-checkbox").checked = false;
            this.shadowRoot.querySelector("#file").disabled = false;
        } else {
            this.shadowRoot.querySelector("#outline-checkbox").checked = true;
            this.shadowRoot.querySelector("#file").disabled = true;
        }
    }

    onOutlineCheckboxChange(event) {
        if (event.target.checked) {
            this.shadowRoot.querySelector("#file-checkbox").checked = false;
            this.shadowRoot.querySelector("#file").disabled = true;
        } else {
            this.shadowRoot.querySelector("#file-checkbox").checked = true;
            this.shadowRoot.querySelector("#file").disabled = false;
        }
    }

    onFileChange(event) {
        this.selectedFiles = [];
        for (let i = 0; i < event.target.files.length; i++) {
            const file = event.target.files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                if (e.target.result.startsWith("data:application/pdf") == true) {
                    // remove the data:application/pdf;base64, part
                    this.selectedFiles.push(e.target.result.split(",")[1]);
                }
            };
            reader.readAsDataURL(file);
        }
        if (this.selectedFiles.length > 0) {
            this.shadowRoot.querySelector("#outline-checkbox").checked = false;
        }
    }

    render() {
        return html`
            <div
                class="search"
                @mouseover="${() => {
                    this.shadowRoot.querySelector(".suggestions").classList.remove("suggestions-hidden");
                }}"
                @mouseout="${() => {
                    this.shadowRoot.querySelector(".suggestions").classList.add("suggestions-hidden");
                }}"
            >
                <p class="p12">Research and create, <br />with AI Agents.</p>

                <div class="select-bar">
                    <button class="select-button select-active" @click="${() => this.selectedButton("diagram")}" id="diagram-button">Diagram</button>
                    <button class="select-button btn-disabled" disabled @click="${() => this.selectedButton("case-study")}" id="case-study-button">Document</button>
                    <button class="select-button btn-disabled" @click="${() => this.selectedButton("data-analysis")}" id="data-analysis-button" disabled title="Coming soon">Data Analysis</button>
                </div>

                <div class="search-bar">
                    <img src="../a2/a1/creation.svg" class="search-icon" alt="" />

                    <form style="flex:1">
                        <input type="text" placeholder="Just describe... " class="search-input" maxlength="300" />
                        <button type="submit" class="search-button" style="display: none" @click="${this.onSearchInput}"></button>
                    </form>
                </div>

                <div class="case-study below displaynone" style="">
                    <div style="display: flex; flex-direction: column; gap: 10px; flex: 1">
                        <div style="display: flex; flex-direction: row; gap: 10px">
                            <label for="file-checkbox" class="checkbox-label">Use Internet for Research</label>
                            <input type="checkbox" id="file-checkbox" name="file-checkbox" value="file" checked @change="${this.onFileCheckboxChange}" />
                        </div>
                        <div style="display: flex; flex-direction: row; gap: 10px">
                            <label for="outline-checkbox" class="checkbox-label">Generate outline only</label>
                            <input type="checkbox" id="outline-checkbox" name="outline-checkbox" value="outline" @change="${this.onOutlineCheckboxChange}" />
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px; border-radius: 14px; border: 1px solid #e8e8e8; background-color: #efefef; min-height: 110px;">
                        <label for="file">Upload files</label>
                        <label for="file" style="font-size: 14px; color: #333">Files are optional (pdf) </label>
                        <input type="file" id="file" name="file" accept=".pdf" multiple="multiple" @change="${this.onFileChange}" />
                    </div>
                </div>

                <div class="data-analysis below displaynone" style="justify-content: flex-end">
                    <div style="display: flex; flex-direction: column; gap: 10px; padding: 10px; border-radius: 4px; border: 1px solid #e8e8e8; background-color: #efefef; min-height: 110px;">
                        <label for="data-analysis-file">Upload files</label>
                        <label for="data-analysis-file" style="font-size: 14px; color: #333">Files are needed (csv, xlsx, xls)</label>
                        <input type="file" id="data-analysis-file" name="file" accept=".csv, .xlsx, .xls" multiple="multiple" />
                    </div>
                </div>

                <div class="suggestions suggestions-hidden">
                    <p class="suggestion-title">Suggestions</p>
                    <button class="suggestion" id="sug1" @click="${this.onFirstSuggestionClick}">...</button>
                    <button class="suggestion" id="sug2" @click="${this.onSecondSuggestionClick}">...</button>
                    <button class="suggestion" id="sug3" @click="${this.onThirdSuggestionClick}">...</button>
                </div>
            </div>
        `;
    }
}

customElements.define("cy-search", CySearch);
