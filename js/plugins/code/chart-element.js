import { html, css, LitElement } from "/a7/cdn/lit-core-2.7.4.min.js";

var chartjsReady = new Promise((resolve) => {
    if (window.Chart) {
        resolve();
        return;
    }
    if (!document.querySelector('script[src*="chart.js"]')) {
        const chartScript = document.createElement('script');
        chartScript.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        chartScript.onload = () => resolve();
        document.head.appendChild(chartScript);
    }
});

class ChartElement extends LitElement {
    static styles = css`
        * {
            box-sizing: border-box;
            margin: 0px;
            padding: 0px;
            user-select: text;
            transition: background 0.2s, color 0.2s;
        }
        :host {
            display: block;
            position: relative;
        }
        .chart-container {
            border: none;
            padding: var(--padding-4);
            font-size: 16px;
        }
        .chart-container:hover {
            background: var(--bg-2);
            border-radius: var(--radius);
        }
        canvas {
            width: 100% !important;
            height: 400px !important;
        }
        .error {
            color: var(--button-bg-red);
        }
        .edit-button {
            position: absolute;
            top: 8px;
            right: 8px;
            opacity: 0;
            transition: opacity 0.2s;
            background: var(--text-1);
            color: var(--bg-1);
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            ${window.wisk.editor.wiskSite ? css`display: none;` : ''}
        }
        :host(:hover) .edit-button {
            opacity: 1;
        }
        .dialog {
            background: var(--bg-3);
            padding: var(--padding-3);
            border-radius: var(--radius);
        }
        .templates-dialog {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--bg-1);
            padding: var(--padding-4);
            border-radius: var(--radius);
            width: 80%;
            border: 1px solid var(--border-1);
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            filter: var(--drop-shadow);
        }
        .templates-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 8px;
        }
        .template-button {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 12px;
            border: 1px solid var(--bg-2);
            background: var(--bg-2);
            border-radius: var(--radius);
            cursor: pointer;
        }
        .template-button:hover {
            background: var(--bg-3);
        }
        .dialog textarea {
            width: 100%;
            min-height: 200px;
            padding: var(--padding-3);
            color: var(--text-1);
            background: var(--bg-1);
            border-radius: var(--radius);
            font-family: var(--font-mono);
            font-size: 16px;
            resize: vertical;
            border: none;
            outline: none;
        }
        .dialog-buttons {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            margin-top: 8px;
        }
        button {
            background: var(--bg-2);
            color: var(--text-1);
            border: none;
            padding: var(--padding-w1);
            border-radius: var(--radius);
            cursor: pointer;
        }
        .templates-close {
            position: absolute;
            top: var(--padding-4);
            right: var(--padding-4);
            cursor: pointer;
            background: transparent;
        }
        .templates-close:hover {
            color: var(--button-bg-red);
        }
        .templates-dialog h3 {
            margin-bottom: 16px
        }
    `;

    static properties = {
        _chartConfig: { type: String, state: true },
        error: { type: String },
        _showDialog: { type: Boolean, state: true },
        _showTemplates: { type: Boolean, state: true },
    };

    constructor() {
        super();
        this.templates = {
            line: {
                name: 'Line Chart',
                config: {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Dataset',
                            data: [12, 19, 3, 5, 2, 3],
                            borderColor: 'rgb(75, 192, 192)',
                            tension: 0.1
                        }]
                    }
                }
            },
            bar: {
                name: 'Bar Chart',
                config: {
                    type: 'bar',
                    data: {
                        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
                        datasets: [{
                            label: 'Colors',
                            data: [12, 19, 3, 5, 2, 3],
                            backgroundColor: [
                                'rgba(75, 192, 192, 0.6)',  // teal
                                'rgba(54, 162, 235, 0.6)',  // blue
                                'rgba(255, 159, 64, 0.6)',  // orange
                                'rgba(153, 102, 255, 0.6)', // purple
                                'rgba(255, 99, 132, 0.6)',  // pink
                                'rgba(255, 206, 86, 0.6)'   // yellow
                            ],
                            borderColor: [
                                'rgba(75, 192, 192, 1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 159, 64, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 99, 132, 1)',
                                'rgba(255, 206, 86, 1)'
                            ],
                            borderWidth: 1
                        }]
                    }
                }
            },
            pie: {
                name: 'Pie Chart',
                config: {
                    type: 'pie',
                    data: {
                        labels: ['Red', 'Blue', 'Yellow'],
                        datasets: [{
                            data: [300, 50, 100],
                            backgroundColor: [
                                'rgb(255, 99, 132)',
                                'rgb(54, 162, 235)',
                                'rgb(255, 205, 86)'
                            ]
                        }]
                    }
                }
            },
            radar: {
                name: 'Radar Chart',
                config: {
                    type: 'radar',
                    data: {
                        labels: ['Speed', 'Power', 'Defense', 'Range', 'Accuracy'],
                        datasets: [{
                            label: 'Stats',
                            data: [85, 72, 78, 90, 95],
                            fill: true,
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            borderColor: 'rgb(54, 162, 235)',
                            pointBackgroundColor: 'rgb(54, 162, 235)',
                            pointBorderColor: '#fff',
                            pointHoverBackgroundColor: '#fff',
                            pointHoverBorderColor: 'rgb(54, 162, 235)'
                        }]
                    }
                }
            },
            doughnut: {
                name: 'Doughnut Chart',
                config: {
                    type: 'doughnut',
                    data: {
                        labels: ['Desktop', 'Tablet', 'Mobile'],
                        datasets: [{
                            data: [300, 50, 100],
                            backgroundColor: [
                                'rgb(255, 99, 132)',
                                'rgb(54, 162, 235)',
                                'rgb(255, 205, 86)'
                            ]
                        }]
                    }
                }
            },
            scatter: {
                name: 'Scatter Plot',
                config: {
                    type: 'scatter',
                    data: {
                        datasets: [{
                            label: 'Scatter Dataset',
                            data: [
                                { x: -10, y: 0 },
                                { x: 0, y: 10 },
                                { x: 10, y: 5 },
                                { x: 20, y: 15 },
                                { x: 30, y: 25 }
                            ],
                            backgroundColor: 'rgb(255, 99, 132)'
                        }]
                    }
                }
            }
        };


        const templateKeys = Object.keys(this.templates);
        const randomTemplate = this.templates[templateKeys[Math.floor(Math.random() * templateKeys.length)]];

        // Add responsive options to the template config
        const configWithOptions = {
            ...randomTemplate.config,
            options: {
                ...randomTemplate.config.options,
                responsive: true,
                maintainAspectRatio: false,
            }
        };

        this._chartConfig = JSON.stringify(configWithOptions, null, 2);
        this.backup = this._chartConfig;
        this.error = '';
        this._showDialog = false;
        this._showTemplates = false;
        this._chart = null;
        this._theme = window.wisk.theme.getThemeData(window.wisk.theme.getTheme());
    }

    setValue(identifier, value) {
        if (!value || typeof value !== 'object') return;

        if (value.chartConfig !== undefined) {
            this._chartConfig = value.chartConfig;
            this.backup = value.chartConfig;
        }

        // Ensure we have current theme data
        this._theme = window.wisk.theme.getThemeData(window.wisk.theme.getTheme());

        this.requestUpdate();
        this.updateChart();
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('themechange', (event) => {
            this._theme = event.detail.theme;
            this.requestUpdate();
            this.renderChart();
        });
    }

    getValue() {
        return {
            chartConfig: this._chartConfig,
        };
    }

    getTextContent() {
        return {
            html: "",
            text: "",
            markdown: '```json\n' + this._chartConfig + '\n```'
        }
    }

    sendUpdates() {
        setTimeout(() => {
            window.wisk.editor.justUpdates(this.id);
        }, 0);
    }

    async renderChart() {
        const canvas = this.shadowRoot.querySelector('canvas');
        if (!canvas) return;

        try {
            await chartjsReady;

            let config = JSON.parse(this._chartConfig);

            // Apply theme colors and chart-specific configurations
            if (this._theme) {
                const chartType = config.type;
                
                // Base options that apply to all charts
                const baseOptions = {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: {
                                color: this._theme['--text-1']
                            }
                        }
                    }
                };

                // Chart-specific options
                let specificOptions = {};
                
                if (['pie', 'doughnut'].includes(chartType)) {
                    // Pie and Doughnut charts don't need any scales
                    specificOptions = {
                        scales: {} // This effectively removes all scales
                    };
                } else if (chartType === 'radar') {
                    specificOptions = {
                        scales: {
                            r: {
                                angleLines: {
                                    color: this._theme['--bg-3']
                                },
                                grid: {
                                    color: this._theme['--bg-3']
                                },
                                pointLabels: {
                                    color: this._theme['--text-1']
                                },
                                ticks: {
                                    color: this._theme['--text-1']
                                }
                            }
                        }
                    };
                } else {
                    // Default options for other chart types (line, bar, scatter)
                    specificOptions = {
                        scales: {
                            x: {
                                grid: {
                                    color: this._theme['--bg-3']
                                },
                                ticks: {
                                    color: this._theme['--text-1']
                                }
                            },
                            y: {
                                grid: {
                                    color: this._theme['--bg-3']
                                },
                                ticks: {
                                    color: this._theme['--text-1']
                                }
                            }
                        }
                    };
                }

                // Merge the options
                config.options = {
                    ...baseOptions,
                    ...specificOptions,
                    ...config.options
                };
            }

            if (this._chart) {
                this._chart.destroy();
            }

            this._chart = new window.Chart(canvas, config);
            this.error = '';
        } catch (e) {
            console.error('Chart Error:', e);
            this.error = `Chart Error: ${e.message}`;
            if (this._chart) {
                this._chart.destroy();
                this._chart = null;
            }
        }
    }


    handleEdit() {
        this._showDialog = true;
    }

    handleSave() {
        const textarea = this.shadowRoot.querySelector('textarea');
        this._chartConfig = textarea.value;
        this._showDialog = false;
        this.sendUpdates();
        this.requestUpdate();
        this.renderChart();
    }

    handleCancel() {
        this._showDialog = false;
    }

    handleReset() {
        this._chartConfig = this.backup;
        this.requestUpdate();
        this.renderChart();
    }

    handleTemplates() {
        this._showTemplates = true;
    }

    handleTemplateSelect(template) {
        const config = {
            ...template.config,
            options: {
                ...template.config.options,
                responsive: true,
                maintainAspectRatio: false,
            }
        };
        this._chartConfig = JSON.stringify(config, null, 2);
        this._showTemplates = false;
        this.requestUpdate();
        this.renderChart();
    }

    updated() {
        this.renderChart();
    }

    updateChart() {
        if (!this.shadowRoot.querySelector('textarea')) return;
        this._chartConfig = this.shadowRoot.querySelector('textarea').value;
        this.renderChart();
        this.requestUpdate();
    }

    render() {
        return html`
            <div class="chart-container">
                <canvas></canvas>
                ${this.error ? html`<div class="error">${this.error}</div>` : ''}
                <button class="edit-button" @click=${this.handleEdit}>Edit</button>
            </div>

            ${this._showDialog ? html`
                <div class="dialog">
                    <p style="padding-bottom: 10px; color: var(--text-2);">yes, we will have gui editor for this in the future, 
                        for now ask chatgpt to "generate this json code for chart.js" and give it data :)</p>
                    <textarea .value=${this._chartConfig} @input=${this.updateChart}></textarea>
                    <div class="dialog-buttons">
                        <button @click=${this.handleReset}>Reset</button>
                        <button @click=${this.handleTemplates}>Chart Templates</button>
                        <button @click=${this.handleCancel}>Cancel</button>
                        <button @click=${this.handleSave}>Save</button>
                    </div>
                </div>
            ` : ''}

            ${this._showTemplates ? html`
                <div class="templates-dialog">
                    <h3>Chart Templates</h3>
                    <div class="templates-grid">
                        ${Object.entries(this.templates).map(([key, template]) => html`
                            <div class="template-button" @click=${() => this.handleTemplateSelect(template)}>
                                ${template.name}
                            </div>
                        `)}
                    </div>
                    <button class="templates-close" @click=${() => this._showTemplates = false}>✕</button>
                </div>
            ` : ''}
        `;
    }
}

customElements.define("chart-element", ChartElement);
