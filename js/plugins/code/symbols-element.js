import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

class SymbolsElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            font-family: var(--font);
            margin: 0px;
            padding: 0px;
        }
        :host {
            display: block;
            padding: 1rem;
            background-color: var(--bg-1);
        }
        .search-input {
            width: 100%;
            padding: var(--padding-w2);
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            outline: none;
            background-color: var(--bg-2);
            color: var(--text-1);
        }
        .symbols-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
            gap: 1rem;
            overflow-y: auto;
        }
        .symbol-item {
            border: 1px solid var(--border-1);
            border-radius: var(--radius);
            padding: var(--padding-3);
            text-align: center;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .symbol-item:hover {
            background-color: var(--bg-2);
        }
        .symbol {
            font-size: 24px;
        }
        .symbol-name {
            font-size: 12px;
            color: var(--text-2);
        }

        *::-webkit-scrollbar { width: 15px; }
        *::-webkit-scrollbar-track { background: var(--bg-1); }
        *::-webkit-scrollbar-thumb { background-color: var(--bg-3); border-radius: 20px; border: 4px solid var(--bg-1); }
        ::placeholder { color: var(--text-2); }
    `;

    static properties = {
        searchTerm: { type: String },
        filteredSymbols: { type: Array }
    };

    constructor() {
        super();
        this.searchTerm = '';
        this.symbols = {
            doubleQuote: '"',
            ampersand: "&",
            singleQuote: "'",
            lessThan: "<",
            greaterThan: ">",
            invertedExclamation: "¡",
            centSign: "¢",
            poundSign: "£",
            currencySign: "¤",
            yenSign: "¥",
            euroSign: "€",
            dollarSign: "$",
            rupeeSign: "₹",
            rubleSign: "₽",
            bitcoinSign: "₿",
            wonSign: "₩", 
            shekelSign: "₪",
            pesoSign: "₱",
            bahtSign: "฿",
            colonSign: "₡",
            cruzeirSign: "₢",
            franceSign: "₣",
            liraSign: "₤",
            millSign: "₥",
            nairaSign: "₦",
            peseteSign: "₧",
            pfennigSign: "₰",
            cedisSign: "₵",
            cediSign: "¢",
            dongsSign: "₫",
            drachmaSign: "₯",
            guaraniSign: "₲",
            tugrikSign: "₮",
            hryvniaSign: "₴",
            austrelSign: "₳",
            kipsSign: "₭",
            brokenVerticalBar: "¦",
            sectionSign: "§",
            diaeresis: "¨",
            copyrightSign: "©",
            feminineOrdinal: "ª",
            leftDoubleAngleQuote: "«",
            negationSign: "¬",
            registeredSign: "®",
            macron: "¯",
            degreeSign: "°",
            plusMinusSign: "±",
            superscriptTwo: "²",
            superscriptThree: "³",
            acuteAccent: "´",
            microSign: "µ",
            paragraphSign: "¶",
            middleDot: "·",
            cedilla: "¸",
            superscriptOne: "¹",
            masculineOrdinal: "º",
            rightDoubleAngleQuote: "»",
            oneQuarter: "¼",
            oneHalf: "½",
            threeQuarters: "¾",
            invertedQuestionMark: "¿",
            uppercaseAGrave: "À",
            uppercaseAAcute: "Á",
            uppercaseACircumflex: "Â",
            uppercaseATilde: "Ã",
            uppercaseADiaeresis: "Ä",
            uppercaseARing: "Å",
            uppercaseAE: "Æ",
            uppercaseCCedilla: "Ç",
            uppercaseEGrave: "È",
            uppercaseEAcute: "É",
            uppercaseECircumflex: "Ê",
            uppercaseEDiaeresis: "Ë",
            uppercaseIGrave: "Ì",
            uppercaseIAcute: "Í",
            uppercaseICircumflex: "Î",
            uppercaseIDiaeresis: "Ï",
            uppercaseEth: "Ð",
            uppercaseNTilde: "Ñ",
            uppercaseOGrave: "Ò",
            uppercaseOAcute: "Ó",
            uppercaseOCircumflex: "Ô",
            uppercaseOTilde: "Õ",
            uppercaseODiaeresis: "Ö",
            multiplicationSign: "×",
            uppercaseOSlash: "Ø",
            uppercaseUGrave: "Ù",
            uppercaseUAcute: "Ú",
            uppercaseUCircumflex: "Û",
            uppercaseUDiaeresis: "Ü",
            uppercaseYAcute: "Ý",
            uppercaseThorn: "Þ",
            sharpS: "ß",
            lowercaseAGrave: "à",
            lowercaseAAcute: "á",
            lowercaseACircumflex: "â",
            lowercaseATilde: "ã",
            lowercaseADiaeresis: "ä",
            lowercaseARing: "å",
            lowercaseAE: "æ",
            lowercaseCCedilla: "ç",
            lowercaseEGrave: "è",
            lowercaseEAcute: "é",
            lowercaseECircumflex: "ê",
            lowercaseEDiaeresis: "ë",
            lowercaseIGrave: "ì",
            lowercaseIAcute: "í",
            lowercaseICircumflex: "î",
            lowercaseIDiaeresis: "ï",
            lowercaseEth: "ð",
            lowercaseNTilde: "ñ",
            lowercaseOGrave: "ò",
            lowercaseOAcute: "ó",
            lowercaseOCircumflex: "ô",
            lowercaseOTilde: "õ",
            lowercaseODiaeresis: "ö",
            divisionSign: "÷",
            lowercaseOSlash: "ø",
            lowercaseUGrave: "ù",
            lowercaseUAcute: "ú",
            lowercaseUCircumflex: "û",
            lowercaseUDiaeresis: "ü",
            lowercaseYAcute: "ý",
            lowercaseThorn: "þ",
            lowercaseYDiaeresis: "ÿ",
            uppercaseOE: "Œ",
            lowercaseOE: "œ",
            uppercaseScaron: "Š",
            lowercaseScaron: "š",
            uppercaseYDiaeresis: "Ÿ",
            florin: "ƒ",
            circumflexAccent: "ˆ",
            tildeAccent: "˜",
            greekAlpha: "Α",
            greekBeta: "Β",
            greekGamma: "Γ",
            greekDelta: "Δ",
            greekEpsilon: "Ε",
            greekZeta: "Ζ",
            greekEta: "Η",
            greekTheta: "Θ",
            greekIota: "Ι",
            greekKappa: "Κ",
            greekLambda: "Λ",
            greekMu: "Μ",
            greekNu: "Ν",
            greekXi: "Ξ",
            greekOmicron: "Ο",
            greekPi: "Π",
            greekRho: "Ρ",
            greekSigma: "Σ",
            greekTau: "Τ",
            greekUpsilon: "Υ",
            greekPhi: "Φ",
            greekChi: "Χ",
            greekPsi: "Ψ",
            greekOmega: "Ω",
            greekAlphaLower: "α",
            greekBetaLower: "β",
            greekGammaLower: "γ",
            greekDeltaLower: "δ",
            greekEpsilonLower: "ε",
            greekZetaLower: "ζ",
            greekEtaLower: "η",
            greekThetaLower: "θ",
            greekIotaLower: "ι",
            greekKappaLower: "κ",
            greekLambdaLower: "λ",
            greekMuLower: "μ",
            greekNuLower: "ν",
            greekXiLower: "ξ",
            greekOmicronLower: "ο",
            greekPiLower: "π",
            greekRhoLower: "ρ",
            greekSigmaFinal: "ς",
            greekSigmaLower: "σ",
            greekTauLower: "τ",
            greekUpsilonLower: "υ",
            greekPhiLower: "φ",
            greekChiLower: "χ",
            greekPsiLower: "ψ",
            greekOmegaLower: "ω",
            greekThetaSymbol: "ϑ",
            greekUpsilonHook: "ϒ",
            greekPiSymbol: "ϖ",
            enSpace: " ",
            enDash: "–",
            emDash: "—",
            leftSingleQuote: "'",
            rightSingleQuote: "'",
            singleLowQuote: "‚",
            doubleLowQuote: "„",
            singleDagger: "†",
            doubleDagger: "‡",
            bullet: "•",
            horizontalEllipsis: "…",
            perMille: "‰",
            singlePrime: "′",
            doublePrime: "″",
            singleLeftAngleQuote: "‹",
            singleRightAngleQuote: "›",
            overline: "‾",
            fractionSlash: "⁄",
            euroSign: "€",
            imaginaryI: "ℑ",
            scriptP: "℘",
            realNumberR: "ℜ",
            trademark: "™",
            alef: "ℵ",
            leftArrow: "←",
            upArrow: "↑",
            rightArrow: "→",
            downArrow: "↓",
            leftRightArrow: "↔",
            returnArrow: "↵",
            leftDoubleArrow: "⇐",
            upDoubleArrow: "⇑",
            rightDoubleArrow: "⇒",
            downDoubleArrow: "⇓",
            leftRightDoubleArrow: "⇔",
            forAll: "∀",
            partialDifferential: "∂",
            thereExists: "∃",
            emptySet: "∅",
            nabla: "∇",
            elementOf: "∈",
            notElementOf: "∉",
            contains: "∋",
            nAryProduct: "∏",
            nArySum: "∑",
            minusSign: "−",
            asteriskOperator: "∗",
            squareRoot: "√",
            proportionalTo: "∝",
            infinity: "∞",
            angle: "∠",
            logicalAnd: "∧",
            logicalOr: "∨",
            intersection: "∩",
            union: "∪",
            integral: "∫",
            therefore: "∴",
            similarTo: "∼",
            congruentTo: "≅",
            approximatelyEqual: "≈",
            notEqual: "≠",
            identicalTo: "≡",
            lessThanOrEqual: "≤",
            greaterThanOrEqual: "≥",
            subset: "⊂",
            superset: "⊃",
            notSubset: "⊄",
            subsetOrEqual: "⊆",
            supersetOrEqual: "⊇",
            circledPlus: "⊕",
            circledTimes: "⊗",
            perpendicular: "⊥",
            dotOperator: "⋅",
            leftCeiling: "⌈",
            rightCeiling: "⌉",
            leftFloor: "⌊",
            rightFloor: "⌋",
            leftAngleBracket: "〈",
            rightAngleBracket: "〉",
            lozenge: "◊",
            spadeSuit: "♠",
            clubSuit: "♣",
            heartSuit: "♥",
            diamondSuit: "♦"
        },
        this.filteredSymbols = this.getFilteredSymbols();
    }

    handleInput(e) {
        this.searchTerm = e.target.value;
        this.filteredSymbols = this.getFilteredSymbols();
        this.requestUpdate();
    }

    getFilteredSymbols() {
        return Object.entries(this.symbols).filter(([name]) => 
            this.camelToNormalCase(name).toLowerCase().includes((this.searchTerm || '').toLowerCase())
        );
    }

    copySymbol(symbol) {
        navigator.clipboard.writeText(symbol);
        window.showToast('Copied', 2000);
    }

    camelToNormalCase(camelStr) {
        if (!camelStr) return '';

        const specialAcronyms = /([A-Z]{2,})/g;
        const withPreservedAcronyms = camelStr.replace(specialAcronyms, ' $1');

        const spaced = withPreservedAcronyms.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');

        return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
    }

    firstUpdated() {
        this.shadowRoot.querySelector('.search-input').focus();
    }

    render() {
        return html`
            <div style="height: 100%; display: flex; flex-direction: column; gap: var(--gap-3);">
                <input type="text" class="search-input" placeholder="Search symbols..." .value=${this.searchTerm} @input=${this.handleInput} />
                <div class="symbols-grid">
                    ${this.filteredSymbols.map(([name, symbol]) => html`
                        <div class="symbol-item" @click=${() => this.copySymbol(symbol)}>
                            <div class="symbol">${symbol}</div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }
}

customElements.define("symbols-element", SymbolsElement);
