// [ "Fruit", "Price", "Quantity", "Total" ],
// [ "Apple", 20, 2, "=this.v(1,1) * this.v(1,2)" ],
// [ "Mango", 10, 10, "=this.v(2,1) * this.v(2,2)" ],
// [ "Banana", 5, 3, "=this.v(3,1) * this.v(3,2)" ],
// [ "", "", "", "" ],
// [ "Total", "=this.v(1,1) + this.v(2,1) + this.v(3,1)", "=this.v(1,2) + this.v(2,2) + this.v(3,2)", "=this.v(1,3) + this.v(2,3) + this.v(3,3)" ] ]
class TableElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.tableContent = {
            headers: ['Column 1'],
            rows: [['Empty']],
        };
        this.render();
    }

    connectedCallback() {
        this.bindEvents();
    }

    setValue(identifier, value) {
        if (value && value.tableContent) {
            this.tableContent = value.tableContent;
        } else {
            console.warn('Invalid value provided to TableElement. Using default empty table.');
            this.tableContent = {
                headers: ['Column 1', 'Column 2'],
                rows: [
                    ['', ''],
                    ['', ''],
                ],
            };
        }
        this.render();
        this.bindEvents();
    }

    getValue() {
        return { tableContent: this.tableContent };
    }

    getCurrentIndex() {
        return 0; // As tables don't have a single cursor position
    }

    focusOnIndex(index) {
        const firstCell = this.shadowRoot.querySelector('td');
        if (firstCell) {
            firstCell.focus();
        }
    }

    onValueUpdated() {
        window.wisk.editor.justUpdates(this.id);
    }

    updateCell(rowIndex, colIndex, value) {
        if (rowIndex === -1) {
            this.tableContent.headers[colIndex] = value;
        } else {
            if (!this.tableContent.rows[rowIndex]) {
                this.tableContent.rows[rowIndex] = [];
            }
            this.tableContent.rows[rowIndex][colIndex] = value;
        }
        this.onValueUpdated();
    }

    addRow() {
        const newRow = new Array(this.tableContent.headers.length).fill('');
        this.tableContent.rows.push(newRow);
        this.render();
        this.bindEvents();
        this.onValueUpdated();
    }

    addColumn() {
        const newHeader = `Column ${this.tableContent.headers.length + 1}`;
        this.tableContent.headers.push(newHeader);
        this.tableContent.rows.forEach(row => row.push(''));
        this.render();
        this.bindEvents();
        this.onValueUpdated();
    }

    render() {
        const { headers, rows } = this.tableContent;

        const innerHTML = `
            <style>
                * {
                    box-sizing: border-box;
                    padding: 0;
                    margin: 0;
                    font-size: 0.97em;
                }
                .table-controls {
                    margin-bottom: 10px;
                }
                button {
                    padding: 5px 10px;
                    margin-right: 10px;
                    background-color: var(--bg-2);
                    border: 1px solid var(--border-1);
                    border-radius: 4px;
                    cursor: pointer;
                    color: var(--text-1);
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 1px solid var(--border-1);
                    border-radius: 4px;
                    margin: 18px 0;
                    white-space: normal;
                    table-layout: fixed;
                }
                th, td {
                    border: 1px solid var(--border-1);
                    padding: var(--padding-w2);
                }
                th {
                    background-color: var(--bg-2);
                    font-weight: 600;
                }
                td {
                    height: 40px;
                    max-width: 400px;
                    min-width: 100px;
                    width: auto;
                }
            </style>
            <div class="table-controls" ${window.wisk.editor.wiskSite ? 'style="display: none;"' : ''}>
                <button id="add-row">Add Row</button>
                <button id="add-column">Add Column</button>
            </div>
            <table id="table">
                <thead>
                    <tr>
                        ${headers.map((header, i) => `<th contenteditable="${!window.wisk.editor.wiskSite}" data-row="-1" data-col="${i}">${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${rows
                        .map(
                            (row, i) => `
                        <tr>
                            ${row.map((cell, j) => `<td contenteditable="${!window.wisk.editor.wiskSite}" data-row="${i}" data-col="${j}">${cell}</td>`).join('')}
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        `;

        this.shadowRoot.innerHTML = innerHTML;
    }

    bindEvents() {
        this.shadowRoot.addEventListener('input', event => {
            const cell = event.target.closest('th, td');
            if (cell) {
                const rowIndex = parseInt(cell.dataset.row);
                const colIndex = parseInt(cell.dataset.col);
                this.updateCell(rowIndex, colIndex, cell.textContent);
            }
        });

        const addRowButton = this.shadowRoot.getElementById('add-row');
        const addColumnButton = this.shadowRoot.getElementById('add-column');

        if (addRowButton) {
            addRowButton.addEventListener('click', () => this.addRow());
        }

        if (addColumnButton) {
            addColumnButton.addEventListener('click', () => this.addColumn());
        }
    }

    getTextContent() {
        const { headers, rows } = this.tableContent;
        const colWidths = headers.map((h, i) => {
            const columnCells = [h, ...rows.map(row => row[i] || '')];
            return Math.max(...columnCells.map(cell => (cell || '').toString().length));
        });

        const headerRow = '| ' + headers.map((h, i) => (h || '').toString().padEnd(colWidths[i])).join(' | ') + ' |';

        const separatorRow = '|' + colWidths.map(w => '-'.repeat(w + 2)).join('|') + '|';

        const dataRows = rows.map(row => '| ' + row.map((cell, i) => (cell || '').toString().padEnd(colWidths[i])).join(' | ') + ' |');

        const markdown = [headerRow, separatorRow, ...dataRows].join('\n');

        return {
            html: this.shadowRoot.querySelector('table').outerHTML,
            text: headers.join('\t') + '\n' + rows.map(row => row.join('\t')).join('\n'),
            markdown: markdown,
        };
    }
}

customElements.define('table-element', TableElement);
