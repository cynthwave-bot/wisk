class CanvasElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
        this.isInitialized = false;
        this.pendingValue = null;
        this.isPanning = false;
        this.isMouseWheelPanning = false;
        this.isAddingText = false;
        this.lastTouchDistance = 0;
        this.initialPinchDistance = 0;
        this.lastZoom = 1;
        this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }

    async connectedCallback() {
        await this.loadFabricJS();

        this.initializeCanvas();
        this.bindEvents();

        this.isInitialized = true;
        if (this.pendingValue) {
            this.setValue('', this.pendingValue);
            this.pendingValue = null;
        }
    }

    async loadFabricJS() {
        if (typeof window.fabric !== 'undefined') {
            console.log('Fabric.js is already loaded');
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js';

        await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            this.shadowRoot.appendChild(script);
        });
    }

    async onPluginLoad() {
        await this.loadFabricJS();
    }

    initializeCanvas() {
        this.canvas = new fabric.Canvas(this.shadowRoot.getElementById('drawing-canvas'), {
            width: this.clientWidth,
            height: this.clientHeight,
            backgroundColor: '#ffffff',
        });

        this.canvas.setZoom(1);
        this.canvas.renderAll();

        this.pan = { x: 0, y: 0 };
        this.lastPosX = 0;
        this.lastPosY = 0;
        this.isPanning = false;

        this.currentMode = 'select';
        this.currentColor = '#000000';
        this.currentThickness = 2;

        // Add event listener for any canvas modifications
        this.canvas.on('object:modified', this.sendUpdates.bind(this));
        this.canvas.on('object:added', this.sendUpdates.bind(this));
        this.canvas.on('object:removed', this.sendUpdates.bind(this));

        // Set initial drawing properties
        this.canvas.freeDrawingBrush.color = this.currentColor;
        this.canvas.freeDrawingBrush.width = this.currentThickness;
    }

    selectAllAndLeaveAll() {
        // Store current selection state
        const currentSelection = this.canvas.getActiveObjects();

        const objects = this.canvas.getObjects();
        this.canvas.discardActiveObject();

        if (objects.length > 0) {
            const selection = new fabric.ActiveSelection(objects, {
                canvas: this.canvas,
            });
            this.canvas.setActiveObject(selection);

            this.canvas.requestRenderAll();

            this.canvas.discardActiveObject();

            if (currentSelection.length > 0) {
                const newSelection = new fabric.ActiveSelection(currentSelection, {
                    canvas: this.canvas,
                });
                this.canvas.setActiveObject(newSelection);
            }
        }

        this.canvas.requestRenderAll();
    }

    bindEvents() {
        const toolbar = this.shadowRoot.getElementById('toolbar');
        toolbar.addEventListener('click', this.handleToolbarClick.bind(this));

        this.canvas.on('mouse:down', this.onMouseDown.bind(this));
        this.canvas.on('mouse:move', this.onMouseMove.bind(this));
        this.canvas.on('mouse:up', this.onMouseUp.bind(this));
        this.canvas.on('mouse:wheel', this.onMouseWheel.bind(this));
        this.canvas.on('selection:created', this.onSelectionCreated.bind(this));
        this.canvas.on('selection:cleared', this.onSelectionCleared.bind(this));
        this.canvas.on('mouse:dblclick', this.onDoubleClick.bind(this));

        const imageInput = this.shadowRoot.getElementById('image-input');
        imageInput.addEventListener('change', this.handleImageUpload.bind(this));

        this.canvas.wrapperEl.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
        this.canvas.wrapperEl.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
        this.canvas.wrapperEl.addEventListener('touchend', this.onTouchEnd.bind(this), { passive: false });

        this.canvas.wrapperEl.addEventListener('mousedown', this.onMouseWheelDown.bind(this));
        this.canvas.wrapperEl.addEventListener('mouseup', this.onMouseWheelUp.bind(this));
        this.canvas.wrapperEl.addEventListener('mouseleave', this.onMouseLeave.bind(this));

        const colorPicker = this.shadowRoot.getElementById('color-picker');
        colorPicker.addEventListener('change', e => {
            this.currentColor = e.target.value;
            this.canvas.freeDrawingBrush.color = this.currentColor;
            this.sendUpdates();
        });

        const thicknessSlider = this.shadowRoot.getElementById('thickness-slider');
        thicknessSlider.addEventListener('input', e => {
            this.currentThickness = parseInt(e.target.value);
            this.canvas.freeDrawingBrush.width = this.currentThickness;
            this.sendUpdates();
        });
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }
    onTouchStart(e) {
        // Check if we're in a drawing mode
        const isDrawingMode = ['draw', 'line', 'arrow', 'rectangle', 'circle', 'text'].includes(this.currentMode);

        if (isDrawingMode && e.touches.length === 1) {
            // Handle drawing modes with single touch
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                buttons: 1,
            });
            this.onMouseDown({
                e: mouseEvent,
                pointer: this.canvas.getPointer(mouseEvent),
            });
            return; // Exit early to prevent default prevention
        }

        // For non-drawing modes, handle pan and zoom
        e.preventDefault();

        if (e.touches.length === 2) {
            // Two finger touch - strictly for zooming
            this.canvas.selection = false;
            this.isPanning = false; // Ensure panning is disabled during zoom
            this.initialPinchDistance = this.getTouchDistance(e.touches);
            this.lastZoom = this.canvas.getZoom();
        } else if (e.touches.length === 1) {
            // Single finger touch - strictly for panning (when not in drawing mode)
            const touch = e.touches[0];
            this.lastPosX = touch.clientX;
            this.lastPosY = touch.clientY;
            this.isPanning = true;
            this.canvas.selection = false;
        }
    }

    onTouchMove(e) {
        // Check if we're in a drawing mode
        const isDrawingMode = ['draw', 'line', 'arrow', 'rectangle', 'circle', 'text'].includes(this.currentMode);

        if (isDrawingMode && e.touches.length === 1) {
            // Handle drawing with single touch
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY,
                buttons: 1,
            });
            this.onMouseMove({
                e: mouseEvent,
                pointer: this.canvas.getPointer(mouseEvent),
            });
            return; // Exit early to prevent default prevention
        }

        e.preventDefault();

        if (e.touches.length === 2) {
            // Handle pinch zoom
            const currentDistance = this.getTouchDistance(e.touches);
            const scaleFactor = currentDistance / this.initialPinchDistance;
            let newZoom = this.lastZoom * scaleFactor;

            // Limit zoom range
            newZoom = Math.min(Math.max(newZoom, 0.1), 20);

            const center = {
                x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
            };

            const rect = this.canvas.wrapperEl.getBoundingClientRect();
            const canvasCenter = {
                x: center.x - rect.left,
                y: center.y - rect.top,
            };

            this.canvas.zoomToPoint(new fabric.Point(canvasCenter.x, canvasCenter.y), newZoom);
            this.canvas.requestRenderAll();
        } else if (e.touches.length === 1 && this.isPanning && !isDrawingMode) {
            // Handle single finger pan with reduced sensitivity (only when not drawing)
            const touch = e.touches[0];
            const deltaX = (touch.clientX - this.lastPosX) * 0.3;
            const deltaY = (touch.clientY - this.lastPosY) * 0.3;

            const vpt = this.canvas.viewportTransform;
            vpt[4] += deltaX;
            vpt[5] += deltaY;

            this.canvas.requestRenderAll();
            this.lastPosX = touch.clientX;
            this.lastPosY = touch.clientY;
        }
    }

    onTouchEnd(e) {
        // Check if we're in a drawing mode
        const isDrawingMode = ['draw', 'line', 'arrow', 'rectangle', 'circle', 'text'].includes(this.currentMode);

        if (isDrawingMode) {
            // Handle end of drawing
            const mouseEvent = new MouseEvent('mouseup', {
                buttons: 0,
            });
            this.onMouseUp({ e: mouseEvent });
            return;
        }

        // For non-drawing modes
        if (e.touches.length === 0) {
            // Reset all states when all fingers are lifted
            this.isPanning = false;
            this.initialPinchDistance = 0;
            this.canvas.selection = true;
        } else if (e.touches.length === 1) {
            // If going from 2 fingers to 1, update the last position
            const touch = e.touches[0];
            this.lastPosX = touch.clientX;
            this.lastPosY = touch.clientY;
            this.isPanning = true;
            this.canvas.selection = false;
        }
    }

    handleToolbarClick(e) {
        const action = e.target.dataset.action;
        switch (action) {
            case 'home':
                this.resetView();
                break;
            case 'pan':
            case 'select':
            case 'draw':
            case 'line':
            case 'arrow':
            case 'rectangle':
            case 'circle':
            case 'text':
                this.setMode(action);
                break;
            case 'image':
                this.shadowRoot.getElementById('image-input').click();
                break;
            case 'delete':
                this.deleteSelected();
                break;
        }
    }

    deleteSelected() {
        const activeObjects = this.canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            activeObjects.forEach(obj => {
                this.canvas.remove(obj);
            });
            this.canvas.discardActiveObject();
            this.canvas.requestRenderAll();
            this.sendUpdates();
        }
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            // Check if file is an image
            if (!file.type.startsWith('image/')) {
                alert('Please select an image file');
                return;
            }

            const reader = new FileReader();
            reader.onload = event => {
                fabric.Image.fromURL(event.target.result, img => {
                    // Scale image to reasonable size if too large
                    const maxSize = 500;
                    let scale = 1;

                    if (img.width > maxSize || img.height > maxSize) {
                        scale = maxSize / Math.max(img.width, img.height);
                    }

                    img.scale(scale);

                    // Center the image on the canvas
                    const zoom = this.canvas.getZoom();
                    const vpw = this.canvas.width / zoom;
                    const vph = this.canvas.height / zoom;
                    const center = this.canvas.getVpCenter();

                    img.set({
                        left: center.x - (img.width * scale) / 2,
                        top: center.y - (img.height * scale) / 2,
                    });

                    this.canvas.add(img);
                    this.canvas.setActiveObject(img);
                    this.canvas.requestRenderAll();
                    this.sendUpdates();
                });
            };
            reader.readAsDataURL(file);
        }
        // Reset the input so the same file can be selected again
        e.target.value = '';
    }

    setMode(mode) {
        if (mode == 'pan' && this.isTouchDevice) {
            alert(
                'Pan mode is currently not supported on touch devices, to move the canvas by zooming out and then zooming in on target, sorry for inconvinence.'
            );
            return;
        }

        for (const button of this.shadowRoot.querySelectorAll('#toolbar button')) {
            button.classList.remove('button-active');
        }

        const activeButton = this.shadowRoot.querySelector(`#toolbar button[data-action="${mode}"]`);
        if (activeButton) {
            activeButton.classList.add('button-active');
        }

        this.currentMode = mode;
        this.canvas.isDrawingMode = mode === 'draw';
        this.canvas.selection = mode === 'select';
        this.isAddingText = mode === 'text';
        this.canvas.forEachObject(obj => {
            obj.selectable = mode === 'select';
            obj.evented = mode === 'select';
        });

        this.updateCursor();
    }

    updateCursor() {
        switch (this.currentMode) {
            case 'pan':
                this.canvas.defaultCursor = 'move';
                break;
            case 'select':
                this.canvas.defaultCursor = 'default';
                break;
            case 'text':
                this.canvas.defaultCursor = 'text';
                break;
            case 'draw':
            case 'line':
            case 'arrow':
            case 'rectangle':
            case 'circle':
                this.canvas.defaultCursor = 'crosshair';
                break;
        }
    }

    resetView() {
        this.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        this.lastZoom = 1;
        this.pan = { x: 0, y: 0 };
        this.canvas.requestRenderAll();
    }

    onMouseWheelDown(e) {
        if (e.button === 1) {
            // Middle mouse button
            this.isMouseWheelPanning = true;
            this.lastPosX = e.clientX;
            this.lastPosY = e.clientY;
            this.canvas.defaultCursor = 'move';
            this.canvas.selection = false;
            e.preventDefault();
        }
    }

    onMouseWheelUp(e) {
        if (e.button === 1) {
            // Middle mouse button
            this.isMouseWheelPanning = false;
            this.canvas.defaultCursor = 'default';
            this.canvas.selection = true;
            this.updateCursor();
            e.preventDefault();
        }
    }

    onMouseDown(opt) {
        if (opt.e.button === 1 || this.isMouseWheelPanning) {
            return;
        }

        if (this.currentMode === 'text' && !this.isEditing) {
            this.addText(opt);
            return;
        }

        if (this.currentMode === 'pan') {
            this.isPanning = true;
            this.lastPosX = opt.e.clientX;
            this.lastPosY = opt.e.clientY;
            this.canvas.selection = false;
        } else if (['arrow', 'rectangle', 'circle', 'line'].includes(this.currentMode)) {
            this.startDrawing(opt);
        }
    }

    addText(opt) {
        const pointer = this.canvas.getPointer(opt.e);
        const computedStyle = getComputedStyle(this);
        const fontFamily = computedStyle.getPropertyValue('--font').trim() || 'system-ui';

        const text = new fabric.IText('Text', {
            left: pointer.x,
            top: pointer.y,
            fontFamily: fontFamily,
            fontSize: 20,
            fill: this.currentColor,
            selectable: true,
            evented: true,
        });

        this.canvas.add(text);
        this.canvas.setActiveObject(text);
        text.enterEditing();
        this.isEditing = true;

        text.on('editing:exited', () => {
            this.isEditing = false;
            if (text.text.trim() === '') {
                this.canvas.remove(text);
            }
            this.sendUpdates();
        });

        this.sendUpdates();
    }

    onDoubleClick(opt) {
        if (this.currentMode === 'select') {
            const object = this.canvas.findTarget(opt.e);
            if (object && object.type === 'i-text') {
                this.isEditing = true;
                object.enterEditing();
            }
        }
    }

    onMouseMove(opt) {
        if (this.isPanning || this.isMouseWheelPanning) {
            const vpt = this.canvas.viewportTransform;
            vpt[4] += opt.e.clientX - this.lastPosX;
            vpt[5] += opt.e.clientY - this.lastPosY;

            this.selectAllAndLeaveAll();

            this.canvas.requestRenderAll();
            this.lastPosX = opt.e.clientX;
            this.lastPosY = opt.e.clientY;
        } else if (this.isDrawing) {
            this.updateDrawing(opt);
        }
    }

    onMouseLeave() {
        // Reset panning states when mouse leaves the canvas
        this.isPanning = false;
        this.isMouseWheelPanning = false;
        this.canvas.selection = true;
        this.updateCursor();
    }

    onMouseWheel(opt) {
        const delta = opt.e.deltaY;
        let zoom = this.canvas.getZoom();
        zoom *= 0.999 ** delta;
        if (zoom > 20) zoom = 20;
        if (zoom < 0.01) zoom = 0.01;
        this.canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
        opt.e.preventDefault();
        opt.e.stopPropagation();
    }

    onSelectionCreated() {
        this.setMode('select');
    }

    onSelectionCleared() {
        if (this.currentMode === 'select') {
            this.setMode('select');
        }
    }

    startDrawing(opt) {
        this.isDrawing = true;
        const pointer = this.canvas.getPointer(opt.e);

        switch (this.currentMode) {
            case 'arrow':
                this.startX = pointer.x;
                this.startY = pointer.y;
                this.drawingObject = new fabric.Path('M 0 0', {
                    stroke: this.currentColor,
                    strokeWidth: this.currentThickness,
                    fill: this.currentColor,
                    selectable: false,
                    evented: false,
                });
                break;
            case 'line':
                this.startX = pointer.x;
                this.startY = pointer.y;
                this.drawingObject = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
                    stroke: this.currentColor,
                    strokeWidth: this.currentThickness,
                    selectable: false,
                    evented: false,
                });
                break;
            case 'rectangle':
                this.startX = pointer.x;
                this.startY = pointer.y;
                this.drawingObject = new fabric.Rect({
                    left: this.startX,
                    top: this.startY,
                    width: 0,
                    height: 0,
                    fill: 'transparent',
                    stroke: this.currentColor,
                    strokeWidth: this.currentThickness,
                    selectable: false,
                    evented: false,
                });
                break;
            case 'circle':
                this.drawingObject = new fabric.Circle({
                    left: pointer.x,
                    top: pointer.y,
                    originX: 'center',
                    originY: 'center',
                    radius: 0,
                    fill: 'transparent',
                    stroke: this.currentColor,
                    strokeWidth: this.currentThickness,
                });
                break;
        }

        if (this.drawingObject) {
            this.canvas.add(this.drawingObject);
        }
    }

    updateDrawing(opt) {
        const pointer = this.canvas.getPointer(opt.e);

        switch (this.currentMode) {
            case 'arrow':
                // Remove the old arrow
                this.canvas.remove(this.drawingObject);

                // Calculate the angle and arrow properties
                const dx = pointer.x - this.startX;
                const dy = pointer.y - this.startY;
                const angle = Math.atan2(dy, dx);
                const headLength = Math.max(15, this.currentThickness * 3); // Scale with line thickness
                const headAngle = Math.PI / 6; // 30 degrees

                // Calculate arrowhead points
                const endX = pointer.x;
                const endY = pointer.y;
                const arrowPoint1X = endX - headLength * Math.cos(angle - headAngle);
                const arrowPoint1Y = endY - headLength * Math.sin(angle - headAngle);
                const arrowPoint2X = endX - headLength * Math.cos(angle + headAngle);
                const arrowPoint2Y = endY - headLength * Math.sin(angle + headAngle);

                // Create the path string for the complete arrow
                const pathString = `M ${this.startX} ${this.startY} 
                                  L ${endX} ${endY}
                                  M ${endX} ${endY}
                                  L ${arrowPoint1X} ${arrowPoint1Y}
                                  M ${endX} ${endY}
                                  L ${arrowPoint2X} ${arrowPoint2Y}`;

                // Create new arrow with the complete path
                this.drawingObject = new fabric.Path(pathString, {
                    stroke: this.currentColor,
                    strokeWidth: this.currentThickness,
                    fill: 'transparent',
                    selectable: false,
                    evented: false,
                });

                // Add the new arrow to the canvas
                this.canvas.add(this.drawingObject);
                break;
            case 'line':
                // Remove the old line
                this.canvas.remove(this.drawingObject);

                // Create new line with updated coordinates
                this.drawingObject = new fabric.Line([this.startX, this.startY, pointer.x, pointer.y], {
                    stroke: this.currentColor,
                    strokeWidth: this.currentThickness,
                    selectable: false,
                    evented: false,
                });

                // Add the new line to the canvas
                this.canvas.add(this.drawingObject);
                break;
            case 'rectangle':
                const width = Math.abs(pointer.x - this.startX);
                const height = Math.abs(pointer.y - this.startY);
                const newLeft = pointer.x < this.startX ? pointer.x : this.startX;
                const newTop = pointer.y < this.startY ? pointer.y : this.startY;

                // Remove the old rectangle
                this.canvas.remove(this.drawingObject);

                // Create a new rectangle with the updated dimensions
                this.drawingObject = new fabric.Rect({
                    left: newLeft,
                    top: newTop,
                    width: width,
                    height: height,
                    fill: 'transparent',
                    stroke: this.currentColor,
                    strokeWidth: this.currentThickness,
                    selectable: false,
                    evented: false,
                });

                // Add the new rectangle to the canvas
                this.canvas.add(this.drawingObject);
                break;
            case 'circle':
                const radius = Math.sqrt(Math.pow(pointer.x - this.drawingObject.left, 2) + Math.pow(pointer.y - this.drawingObject.top, 2)) / 2;
                this.drawingObject.set({ radius: radius });
                break;
        }

        this.canvas.renderAll();
        this.sendUpdates();
    }

    onMouseUp(opt) {
        if (this.isPanning) {
            this.isPanning = false;
            this.canvas.selection = true;
            this.updateCursor();
        }
        if (this.isDrawing) {
            this.isDrawing = false;
            if (this.drawingObject) {
                // Re-enable selection and events after drawing is complete
                this.drawingObject.set({
                    selectable: true,
                    evented: true,
                });
            }
        }
        this.sendUpdates();
    }

    addArrowhead(arrow, end) {
        const start = { x: arrow.path[0][1], y: arrow.path[0][2] };
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);

        const headLength = 15;
        const headAngle = Math.PI / 6;

        const arrowHeadPoints = [
            end.x - headLength * Math.cos(angle - headAngle),
            end.y - headLength * Math.sin(angle - headAngle),
            end.x,
            end.y,
            end.x - headLength * Math.cos(angle + headAngle),
            end.y - headLength * Math.sin(angle + headAngle),
        ];

        arrow.path = [
            ['M', start.x, start.y],
            ['L', end.x, end.y],
            ['M', ...arrowHeadPoints],
        ];
    }

    setValue(identifier, value) {
        if (!this.isInitialized) {
            this.pendingValue = value;
            return;
        }

        if (value == null || value.canvasContent == undefined || value.canvasContent == null) {
            this.canvas.clear();
            this.canvas.setBackgroundColor('#ffffff', this.canvas.renderAll.bind(this.canvas));
            return;
        }

        this.canvas.loadFromJSON(
            value.canvasContent,
            () => {
                this.canvas.renderAll();
                console.log('Canvas content loaded successfully');
                this.sendUpdates();
            },
            (o, object) => {
                console.log('Loading object: ', object);
            }
        );
    }

    getValue() {
        if (!this.isInitialized) {
            return { canvasContent: null };
        }
        return {
            canvasContent: JSON.stringify(this.canvas.toJSON()),
        };
    }

    sendUpdates() {
        setTimeout(() => {
            wisk.editor.justUpdates(this.id);
        }, 0);
    }

    render() {
        const style = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                    height: 100%;
                    box-sizing: border-box;
                    border: 1px solid var(--border-1);
                    border-radius: var(--radius);
                    overflow: hidden;
                }
                #toolbar {
                    display: flex;
                    gap: 10px;
                    padding: 10px;
                    background-color: var(--bg-1);
                    align-items: center;
                    flex-wrap: wrap;
                }
                #drawing-canvas {
                    width: 100%;
                    height: calc(100% - 50px);
                }
                #toolbar button img {
                    height: 20px;
                    width: 20px;
                    filter: var(--themed-svg);
                }
                .tbn {
                    height: 30px;
                    width: 30px;
                    outline: none;
                    border-radius: var(--radius);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: transparent;
                    cursor: pointer;
                }
                .button-active {
                    background-color: var(--bg-3);
                }
                #toolbar button:hover {
                    background-color: var(--bg-2);
                }
                #color-picker-wrapper {
                    position: relative;
                    width: 30px;
                    height: 30px;
                }
                #color-picker {
                    position: absolute;
                    inset: 0;
                    width: 30px;
                    height: 30px;
                    padding: 0;
                    border: none;
                    border-radius: var(--radius);
                    cursor: pointer;
                    background: none;
                }
                #color-picker::-webkit-color-swatch-wrapper {
                    padding: 0;
                }
                #color-picker::-webkit-color-swatch {
                    border: 2px solid var(--border-1);
                    border-radius: var(--radius);
                }
                #color-picker::-moz-color-swatch {
                    border: 2px solid var(--border-1);
                    border-radius: var(--radius);
                }
                #image-input {
                    display: none;
                }
                #thickness-slider-wrapper {
                    position: relative;
                    width: 100px;
                    display: flex;
                    align-items: center;
                }
                #thickness-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 4px;
                    border-radius: var(--radius);
                    background: var(--bg-3);
                    outline: none;
                }
                #thickness-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 10px;
                    height: 10px;
                    border-radius: var(--radius);
                    background: var(--fg-1);
                    cursor: pointer;
                    border: none;
                    transition: transform 0.1s;
                }
                #thickness-slider::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: var(--accent);
                    cursor: pointer;
                    border: none;
                    transition: transform 0.1s;
                }
                #thickness-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                #thickness-slider::-moz-range-thumb:hover {
                    transform: scale(1.1);
                }
                #thickness-slider:active::-webkit-slider-thumb {
                    transform: scale(0.9);
                }
                #thickness-slider:active::-moz-range-thumb {
                    transform: scale(0.9);
                }
                .none {
                    display: none;
                }
            </style>
        `;

        var x = wisk.editor.readonly;

        const content = `
            <div id="toolbar">
                <button class="tbn" data-action="home"><img data-action="home" src="/a7/plugins/canvas-element/home.svg" alt="Home"/></button>
                <button class="tbn" data-action="pan"><img data-action="pan" src="/a7/plugins/canvas-element/pan.svg" alt="Pan"/></button>
                <button class="tbn" data-action="select"><img data-action="select" src="/a7/plugins/canvas-element/select.svg" alt="Select"/></button>
                <button class="tbn ${x ? 'none' : ''}" data-action="draw"><img data-action="draw" src="/a7/plugins/canvas-element/draw.svg" alt="Draw"/></button>
                <button class="tbn ${x ? 'none' : ''}" data-action="line"><img data-action="line" src="/a7/plugins/canvas-element/line.svg" alt="Line"/></button>
                <button class="tbn ${x ? 'none' : ''}" data-action="arrow"><img data-action="arrow" src="/a7/plugins/canvas-element/arrow.svg" alt="Arrow"/></button>
                <button class="tbn ${x ? 'none' : ''}" data-action="rectangle"><img data-action="rectangle" src="/a7/plugins/canvas-element/rectangle.svg" alt="Rectangle"/></button>
                <button class="tbn ${x ? 'none' : ''}" data-action="circle"><img data-action="circle" src="/a7/plugins/canvas-element/circle.svg" alt="Circle"/></button>
                <button class="tbn ${x ? 'none' : ''}" data-action="text"><img data-action="text" src="/a7/plugins/canvas-element/text.svg" alt="Text"/></button>
                <button class="tbn ${x ? 'none' : ''}" data-action="image"><img data-action="image" src="/a7/plugins/canvas-element/image.svg" alt="Add Image"/></button>
                <button class="tbn ${x ? 'none' : ''}" data-action="delete"><img data-action="delete" src="/a7/plugins/canvas-element/trash.svg" alt="Delete"/></button>
                <input type="file" id="image-input" accept="image/*" class="${x ? 'none' : ''}" />

                <div style="flex: 1"></div>
                <div id="color-picker-wrapper" class="${x ? 'none' : ''}">
                    <input type="color" id="color-picker" value="#000000">
                </div>
                <div id="thickness-slider-wrapper" class="${x ? 'none' : ''}">
                    <input type="range" id="thickness-slider" min="1" max="20" value="2">
                </div>
            </div>
            <canvas id="drawing-canvas"></canvas>
        `;
        this.shadowRoot.innerHTML = style + content;
    }
}

customElements.define('canvas-element', CanvasElement);
