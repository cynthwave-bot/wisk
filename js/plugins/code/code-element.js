class CodeElement extends HTMLElement {
   constructor() {
       super();
       this.attachShadow({ mode: 'open' });
       this.render();
       this.valueBuffer = null;
       this.supportedLanguages = {
           'javascript': 'JavaScript',
           'python': 'Python', 
           'typescript': 'TypeScript',
           'java': 'Java',
           'go': 'Go',
           'cpp': 'C++',
           'csharp': 'C#',
           'php': 'PHP',
           'ruby': 'Ruby',
           'swift': 'Swift',
           'kotlin': 'Kotlin',
           'sql': 'SQL',
           'html': 'HTML',
           'css': 'CSS',
           'markdown': 'Markdown'
       };
   }

   async connectedCallback() {
       await this.initializeCodeMirror();
       this.initializeLanguageSelector();
   }

   async initializeCodeMirror() {
       await import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js');
       
       const modes = [
           'javascript', 'xml', 'css', 'python', 'clike', 'markdown',
           'go', 'sql', 'php', 'ruby', 'swift'
       ];
       
       await Promise.all(modes.map(mode => 
           import(`https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/${mode}/${mode}.min.js`)
       ));

       await Promise.all([
           import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closebrackets.min.js'),
           import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/matchbrackets.min.js'),
           import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closetag.min.js'),
           import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/comment/comment.min.js'),
           import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/foldcode.min.js'),
           import('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/fold/brace-fold.min.js')
       ]);

       const editorContainer = this.shadowRoot.querySelector('#editor');
       
       this.editor = CodeMirror(editorContainer, {
           lineNumbers: false,
           theme: 'custom',
           mode: 'javascript',
           lineWrapping: true,
           indentUnit: 4,
           tabSize: 4,
           scrollbarStyle: null,
           viewportMargin: Infinity,
           autoCloseBrackets: true,
           matchBrackets: true,
           autoCloseTags: true,
           foldGutter: true,
           gutters: ["CodeMirror-foldgutter"],
           extraKeys: {
               "Tab": (cm) => cm.execCommand("indentMore"),
               "Shift-Tab": (cm) => cm.execCommand("indentLess"),
               "Ctrl-/": "toggleComment",
               "Cmd-/": "toggleComment",
               "Ctrl-J": "toMatchingTag",
               "Ctrl-Space": "autocomplete"
           }
       });

       this.editor.on('change', () => {
           this.sendUpdates();
       });

       if (this.valueBuffer) {
           this.setValue(null, this.valueBuffer);
           this.valueBuffer = null;
       }
   }

   initializeLanguageSelector() {
       const select = this.shadowRoot.querySelector('#language-select');
       select.value = 'javascript';
       Object.entries(this.supportedLanguages).forEach(([value, label]) => {
           const option = document.createElement('option');
           option.value = value;
           option.textContent = label;
           select.appendChild(option);
       });
       
       select.addEventListener('change', (e) => {
           const mode = this.getModeForLanguage(e.target.value);
           this.editor.setOption('mode', mode);
           this.sendUpdates();
       });
   }

   getModeForLanguage(lang) {
       const modeMap = {
           javascript: 'javascript',
           typescript: 'javascript',
           java: 'text/x-java',
           cpp: 'text/x-c++src',
           csharp: 'text/x-csharp',
           python: 'python',
           go: 'go',
           php: 'php',
           ruby: 'ruby',
           swift: 'swift',
           kotlin: 'text/x-kotlin',
           sql: 'sql',
           html: 'xml',
           css: 'css',
           markdown: 'markdown'
       };
       return modeMap[lang] || lang;
   }

    setValue(path, value) {
        if (!this.editor) {
            this.valueBuffer = value;
            return;
        }
        const content = value.textContent || '';
        this.editor.setValue(content);
        const mode = this.getModeForLanguage(value.language);
        this.editor.setOption('mode', mode);
        this.shadowRoot.querySelector('#language-select').value = value.language;
    }

   getValue() {
       if (!this.editor) return this.valueBuffer;
       return {
           textContent: this.editor.getValue(),
           language: this.shadowRoot.querySelector('#language-select').value
       };
   }

   getTextContent() {
       if (!this.editor) return { html: '', text: '', markdown: '' };
       const code = this.editor.getValue();
       const lang = this.shadowRoot.querySelector('#language-select').value;
       
       return {
           html: `<pre><code class="language-${lang}">${code}</code></pre>`,
           text: code,
           markdown: '```' + lang + '\n' + code + '\n```'
       };
   }

   focus() {
       if (this.editor) {
           this.editor.focus();
       }
   }

   sendUpdates() {
       setTimeout(() => {
           window.wisk?.editor?.justUpdates(this.id);
       }, 0);
   }

   render() {
       const style = `
           <style>
           @import url('https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css');
           
           :host {
               display: block;
               position: relative;
           }
           
           select {
               font-family: var(--font-mono);
               padding: var(--padding-w1);
               border: 1px solid var(--border-1);
               border-radius: var(--radius);
               background: var(--bg-2);
               color: var(--text-1);
               cursor: pointer;
               position: absolute;
               top: var(--padding-2);
               right: var(--padding-2);
               z-index: 1;
               outline: none;
           }
           
           select:focus {
               outline: none;
               border-color: var(--accent-text);
           }
           
           .CodeMirror {
               height: auto;
               font-family: var(--font-mono);
               background: var(--bg-1);
               color: var(--text-1);
               border: 1px solid var(--border-1);
               border-radius: 0 0 var(--radius) var(--radius);
               padding: var(--padding-2);
               caret-color: var(--text-1);
           }
           
           .cm-matchingbracket {
               background-color: var(--bg-green);
               color: var(--fg-green) !important;
           }
           
           .cm-nonmatchingbracket {
               background-color: var(--bg-red);
               color: var(--fg-red) !important;
           }
           
           .CodeMirror-selected {
               background-color: var(--accent-bg) !important;
           }
           
           .cm-keyword { color: var(--fg-purple); }
           .cm-def { color: var(--fg-blue); }
           .cm-variable { color: var(--text-1); }
           .cm-operator { color: var(--fg-red); }
           .cm-number { color: var(--fg-orange); }
           .cm-string { color: var(--fg-green); }
           .cm-comment { color: var(--text-2); }
           .cm-property { color: var(--fg-cyan); }
           
           ::-webkit-scrollbar { width: 15px; }
           ::-webkit-scrollbar-track { background: var(--bg-1); }
           ::-webkit-scrollbar-thumb { 
               background-color: var(--bg-3);
               border-radius: 20px;
               border: 4px solid var(--bg-1);
           }
           ::-webkit-scrollbar-thumb:hover {
               background-color: var(--text-1);
           }
           .CodeMirror-gutters {
               display: none;
           }
            .CodeMirror-cursor {
                border-left: 1px solid var(--text-1);
            }
           </style>
           <select id="language-select"></select>
           <div id="editor"></div>
       `;
       
       this.shadowRoot.innerHTML = style;
   }
}

customElements.define('code-element', CodeElement);
