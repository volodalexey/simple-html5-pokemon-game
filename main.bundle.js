/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/BattleScreen.ts":
/*!*****************************!*\
  !*** ./src/BattleScreen.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BattleScreen = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
class BattleScreen extends pixi_js_1.Container {
    constructor(options) {
        super();
        this.isActive = false;
        this.animationSpeed = 0.05;
        this.setup(options);
    }
    setup(options) {
        this.setupBackground(options);
        this.setupVersus(options);
    }
    setupBackground({ sprites: { background } }) {
        const bgSpr = new pixi_js_1.Sprite(background);
        this.addChild(bgSpr);
        this.background = bgSpr;
    }
    setupVersus({ sprites: { draggle, emby } }) {
        const drlSpr = new pixi_js_1.AnimatedSprite(draggle);
        drlSpr.animationSpeed = this.animationSpeed;
        drlSpr.play();
        this.addChild(drlSpr);
        this.draggle = drlSpr;
        const embSpr = new pixi_js_1.AnimatedSprite(emby);
        embSpr.animationSpeed = this.animationSpeed;
        embSpr.play();
        this.addChild(embSpr);
        this.emby = embSpr;
    }
    activate() {
        this.isActive = true;
    }
    deactivate() {
        this.isActive = false;
    }
    handleScreenTick() {
        if (!this.isActive) {
        }
    }
    handleScreenResize(options) {
    }
}
exports.BattleScreen = BattleScreen;


/***/ }),

/***/ "./src/Boundary.ts":
/*!*************************!*\
  !*** ./src/Boundary.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Boundary = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
class Boundary extends pixi_js_1.Graphics {
    constructor({ rect, fillColor = 0xff0000 }) {
        super();
        this._rect = rect;
        this.x = rect.x;
        this.y = rect.y;
        this.fillColor = fillColor;
        this.draw();
        if (logger_1.logBoundary.enabled) {
            this.visible = true;
            this.alpha = 0.3;
        }
        else {
            this.visible = false;
        }
    }
    draw() {
        this.clear();
        this.beginFill(this.fillColor);
        this.drawRect(0, 0, this._rect.width, this._rect.height);
        this.endFill();
    }
}
exports.Boundary = Boundary;


/***/ }),

/***/ "./src/GameLoader.ts":
/*!***************************!*\
  !*** ./src/GameLoader.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GameLoader = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
class GameLoader {
    constructor() {
        this.loader = pixi_js_1.Assets;
    }
    async loadAll() {
        await this.loadSettings();
        await this.loadResources();
        await this.loadImages();
    }
    async loadSettings() {
        this.settings = await fetch('settings.json').then(async (res) => await res.json());
    }
    async loadResources() {
        this.loader.add('tileset', 'assets/spritesheets/spritesheet.json');
        this.spritesheet = await this.loader.load('tileset');
    }
    async loadImage(url) {
        const res = await fetch(url);
        const imageBlob = await res.blob();
        const blobURL = URL.createObjectURL(imageBlob);
        return await pixi_js_1.Texture.fromURL(blobURL);
    }
    async loadImages() {
        const [worldBgTexture, worldFgTexture, battleBgTexture] = await Promise.all([
            this.loadImage('assets/images/World-Background.png'),
            this.loadImage('assets/images/World-Foreground.png'),
            this.loadImage('assets/images/Battle-Background.png')
        ]);
        this.worldBackgroundTexture = worldBgTexture;
        this.worldForegroundTexture = worldFgTexture;
        this.battleBackgroundTexture = battleBgTexture;
    }
}
exports.GameLoader = GameLoader;


/***/ }),

/***/ "./src/MapScreen.ts":
/*!**************************!*\
  !*** ./src/MapScreen.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MapScreen = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const Boundary_1 = __webpack_require__(/*! ./Boundary */ "./src/Boundary.ts");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
const MoveInterface_1 = __webpack_require__(/*! ./MoveInterface */ "./src/MoveInterface.ts");
const Player_1 = __webpack_require__(/*! ./Player */ "./src/Player.ts");
const utils_1 = __webpack_require__(/*! ./utils */ "./src/utils.ts");
class MapScreen extends pixi_js_1.Container {
    constructor(options) {
        super();
        this.cellWidth = 48;
        this.cellHeight = 48;
        this.isActive = false;
        this.tilesPerRow = 70;
        this.boundaries = [];
        this.battleZones = [];
        this.handleKeydown = (e) => {
            const { player } = this;
            (0, logger_1.logKeydown)(e.key);
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    player.addUpImpulse();
                    break;
                case 'a':
                case 'ArrowLeft':
                    player.addLeftImpulse();
                    break;
                case 's':
                case 'ArrowDown':
                    player.addDownImpulse();
                    break;
                case 'd':
                case 'ArrowRight':
                    player.addRightImpulse();
                    break;
            }
        };
        this.handleKeyup = (e) => {
            const { player } = this;
            (0, logger_1.logKeyup)(e.key);
            switch (e.key) {
                case 'w':
                case 'ArrowUp':
                    player.subUpImpulse();
                    break;
                case 'a':
                case 'ArrowLeft':
                    player.subLeftImpulse();
                    break;
                case 's':
                case 'ArrowDown':
                    player.subDownImpulse();
                    break;
                case 'd':
                case 'ArrowRight':
                    player.subRightImpulse();
                    break;
            }
        };
        this.handleDirectionPressedChange = () => {
            const { up, right, down, left } = this.moveInterface.directionPressed;
            this.player.setImpulse({
                up,
                right,
                down,
                left
            });
        };
        this.setup(options);
    }
    setup(options) {
        this.setupBackground(options);
        this.setupLayers(options);
        this.setupPlayer(options);
        this.setupForeground(options);
        this.setupMoveInterface(options);
    }
    setupLayers({ collisionsLayer, battleZonesLayer }) {
        const { tilesPerRow } = this;
        for (let i = 0; i < collisionsLayer.data.length; i += tilesPerRow) {
            const row = collisionsLayer.data.slice(i, tilesPerRow + i);
            row.forEach((symbol, j) => {
                if (symbol === 1025) {
                    const boundary = new Boundary_1.Boundary({
                        rect: {
                            x: j * this.cellWidth,
                            y: i / tilesPerRow * this.cellHeight,
                            width: this.cellWidth,
                            height: this.cellHeight
                        }
                    });
                    this.boundaries.push(boundary);
                    this.addChild(boundary);
                }
            });
        }
        for (let i = 0; i < battleZonesLayer.data.length; i += tilesPerRow) {
            const row = battleZonesLayer.data.slice(i, tilesPerRow + i);
            row.forEach((symbol, j) => {
                if (symbol === 1025) {
                    const boundary = new Boundary_1.Boundary({
                        rect: {
                            x: j * this.cellWidth,
                            y: i / tilesPerRow * this.cellHeight,
                            width: this.cellWidth,
                            height: this.cellHeight
                        },
                        fillColor: 0x0000ff
                    });
                    this.battleZones.push(boundary);
                    this.addChild(boundary);
                }
            });
        }
    }
    setupBackground({ mapSprites: { background } }) {
        const bgSpr = new pixi_js_1.Sprite(background);
        this.addChild(bgSpr);
        this.background = bgSpr;
    }
    setupPlayer({ playerSprites: { up, left, right, down } }) {
        this.player = new Player_1.Player({
            position: {
                x: 1225,
                y: 880
            },
            sprites: {
                up,
                left,
                right,
                down
            }
        });
        this.addChild(this.player);
    }
    setupForeground({ mapSprites: { foreground } }) {
        const fgSpr = new pixi_js_1.Sprite(foreground);
        this.addChild(fgSpr);
        this.foreground = fgSpr;
    }
    activate() {
        this.isActive = true;
        this.addEventLesteners();
    }
    deactivate() {
        this.isActive = false;
        this.removeEventLesteners();
    }
    handleScreenTick() {
        if (!this.isActive) {
            return;
        }
        let isMovingHorizontal = false;
        const horizontalPlayerImpulse = this.player.getHorizontalImpulse();
        if (horizontalPlayerImpulse !== 0) {
            isMovingHorizontal = true;
            const pRectHor = {
                x: this.player.x + horizontalPlayerImpulse,
                y: this.player.y,
                width: this.player.width,
                height: this.player.height
            };
            for (let i = 0; i < this.boundaries.length; i++) {
                const boundary = this.boundaries[i];
                if ((0, utils_1.rectangularCollision)({
                    rect1: pRectHor,
                    rect2: boundary
                })) {
                    (0, logger_1.logPlayerCollision)('Horizontal collision detected! Player stopped');
                    isMovingHorizontal = false;
                    break;
                }
            }
        }
        let isMovingVertical = false;
        const verticalPlayerImpulse = this.player.getVerticalImpulse();
        if (verticalPlayerImpulse !== 0) {
            isMovingVertical = true;
            const pRectVer = {
                x: this.player.x,
                y: this.player.y + verticalPlayerImpulse,
                width: this.player.width,
                height: this.player.height
            };
            for (let i = 0; i < this.boundaries.length; i++) {
                const boundary = this.boundaries[i];
                if ((0, utils_1.rectangularCollision)({
                    rect1: pRectVer,
                    rect2: boundary
                })) {
                    (0, logger_1.logPlayerCollision)('Vertical collision detected! Player stopped');
                    isMovingVertical = false;
                    break;
                }
            }
        }
        if (isMovingHorizontal) {
            this.player.x += horizontalPlayerImpulse;
            this.x -= horizontalPlayerImpulse;
            this.moveInterface.x += horizontalPlayerImpulse;
        }
        if (isMovingVertical) {
            this.player.y += verticalPlayerImpulse;
            this.y -= verticalPlayerImpulse;
            this.moveInterface.y += verticalPlayerImpulse;
        }
    }
    addEventLesteners() {
        window.addEventListener('keydown', this.handleKeydown);
        window.addEventListener('keyup', this.handleKeyup);
    }
    removeEventLesteners() {
        window.removeEventListener('keydown', this.handleKeydown);
        window.removeEventListener('keyup', this.handleKeyup);
    }
    setupMoveInterface({ viewWidth, viewHeight }) {
        const moveInterface = new MoveInterface_1.MoveInterface({
            viewWidth,
            viewHeight,
            playerWidth: this.player.width,
            playerHeight: this.player.height,
            onDirectionPressedChange: this.handleDirectionPressedChange
        });
        this.addChild(moveInterface);
        this.moveInterface = moveInterface;
    }
    resizeMoveInterface({ viewWidth, viewHeight }) {
        this.moveInterface.x = (this.player.x + this.player.width / 2) - viewWidth / 2;
        this.moveInterface.y = (this.player.y + this.player.height / 2) - viewHeight / 2;
        this.moveInterface.width = viewWidth;
        this.moveInterface.height = viewHeight;
    }
    centerCamera({ viewWidth, viewHeight }) {
        this.x = -(this.player.x + this.player.width / 2) + viewWidth / 2;
        this.y = -(this.player.y + this.player.height / 2) + viewHeight / 2;
    }
    handleScreenResize(options) {
        this.centerCamera(options);
        this.resizeMoveInterface(options);
    }
}
exports.MapScreen = MapScreen;


/***/ }),

/***/ "./src/MoveInterface.ts":
/*!******************************!*\
  !*** ./src/MoveInterface.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MoveInterface = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
var EnumDirection;
(function (EnumDirection) {
    EnumDirection["up"] = "up";
    EnumDirection["right"] = "right";
    EnumDirection["down"] = "down";
    EnumDirection["left"] = "left";
})(EnumDirection || (EnumDirection = {}));
class MoveInterface extends pixi_js_1.Container {
    constructor(options) {
        super();
        this.isPressed = false;
        this.maximizePressure = 'allAxes';
        this.directionPressed = {
            up: 0,
            right: 0,
            down: 0,
            left: 0
        };
        this.interactive = true;
        this.playerWidth = options.playerWidth;
        this.playerHeight = options.playerHeight;
        this.onDirectionPressedChange = options.onDirectionPressedChange;
        this.setup();
        this.draw(options);
    }
    setup() {
        const polygon = new pixi_js_1.Graphics();
        polygon.alpha = logger_1.logMoveInterface.enabled ? 0.5 : 0;
        this.addChild(polygon);
        this.polygon = polygon;
        this.setupEventLesteners();
    }
    draw({ viewWidth, viewHeight, upFillColor = 0xff0000, upRightFillColor = 0xffff00, rightFillColor = 0x0000ff, downRightFillColor = 0xffffff, downFillColor = 0x00ff00, downLeftFillColor = 0x00ffff, leftFillColor = 0xff00ff, upLeftFillColor = 0x000000 }) {
        const halfWidth = viewWidth / 2;
        const halfLeft = halfWidth - this.playerWidth / 2;
        const halfRight = halfWidth + this.playerWidth / 2;
        const halfHeight = viewHeight / 2;
        const halfTop = halfHeight - this.playerHeight / 2;
        const halfBottom = halfHeight + this.playerHeight / 2;
        this.polygon.beginFill(upFillColor);
        this.polygon.drawPolygon([
            { x: halfLeft, y: 0 }, { x: halfRight, y: 0 },
            { x: halfRight, y: halfTop }, { x: halfLeft, y: halfTop }
        ]);
        this.polygon.endFill();
        this.polygon.beginFill(upRightFillColor);
        this.polygon.drawPolygon([
            { x: halfRight, y: 0 }, { x: viewWidth, y: 0 },
            { x: viewWidth, y: halfTop }, { x: halfRight, y: halfTop }
        ]);
        this.polygon.endFill();
        this.polygon.beginFill(rightFillColor);
        this.polygon.drawPolygon([
            { x: halfRight, y: halfTop }, { x: viewWidth, y: halfTop },
            { x: viewWidth, y: halfBottom }, { x: halfRight, y: halfBottom }
        ]);
        this.polygon.endFill();
        this.polygon.beginFill(downRightFillColor);
        this.polygon.drawPolygon([
            { x: halfRight, y: halfBottom }, { x: viewWidth, y: halfBottom },
            { x: viewWidth, y: viewHeight }, { x: halfRight, y: viewHeight }
        ]);
        this.polygon.endFill();
        this.polygon.beginFill(downFillColor);
        this.polygon.drawPolygon([
            { x: halfLeft, y: halfBottom }, { x: halfRight, y: halfBottom },
            { x: halfRight, y: viewHeight }, { x: halfLeft, y: viewHeight }
        ]);
        this.polygon.endFill();
        this.polygon.beginFill(downLeftFillColor);
        this.polygon.drawPolygon([
            { x: 0, y: halfBottom }, { x: halfLeft, y: halfBottom },
            { x: halfLeft, y: viewHeight }, { x: 0, y: viewHeight }
        ]);
        this.polygon.endFill();
        this.polygon.beginFill(leftFillColor);
        this.polygon.drawPolygon([
            { x: 0, y: halfTop }, { x: halfLeft, y: halfTop },
            { x: halfLeft, y: halfBottom }, { x: 0, y: halfBottom }
        ]);
        this.polygon.endFill();
        this.polygon.beginFill(upLeftFillColor);
        this.polygon.drawPolygon([
            { x: 0, y: 0 }, { x: halfLeft, y: 0 },
            { x: halfLeft, y: halfTop }, { x: 0, y: halfTop }
        ]);
        this.polygon.endFill();
    }
    setupEventLesteners() {
        this.on('pointerdown', (e) => {
            this.setDirectionPressed(true, e.clientX, e.clientY);
        });
        this.on('pointermove', (e) => {
            this.setDirectionPressed(undefined, e.clientX, e.clientY);
        });
        this.on('pointerup', (e) => {
            this.setDirectionPressed(false, e.clientX, e.clientY);
        });
    }
    setDirectionPressed(pressed, x, y) {
        if (typeof pressed === 'boolean') {
            this.isPressed = pressed;
        }
        const { directionPressed } = this;
        Object.keys(directionPressed).forEach(key => {
            directionPressed[key] = 0;
        });
        if (this.isPressed) {
            const halfWidth = this.width / 2;
            const halfHeight = this.height / 2;
            const halfLeft = halfWidth - this.playerWidth / 2;
            const maxHorizontal = halfLeft;
            const halfRight = halfWidth + this.playerWidth / 2;
            const halfTop = halfHeight - this.playerHeight / 2;
            const maxVertical = halfTop;
            const halfBottom = halfHeight + this.playerHeight / 2;
            const rightPressure = x >= halfRight ? (x - halfRight) / maxHorizontal : 0;
            const leftPressure = x <= halfLeft ? (halfLeft - x) / maxHorizontal : 0;
            if (rightPressure > 0) {
                directionPressed.right = rightPressure;
            }
            else if (leftPressure > 0) {
                directionPressed.left = leftPressure;
            }
            const downPressure = y >= halfBottom ? (y - halfBottom) / maxVertical : 0;
            const upPressure = y <= halfTop ? (halfTop - y) / maxVertical : 0;
            if (downPressure > 0) {
                directionPressed.down = downPressure;
            }
            else if (upPressure > 0) {
                directionPressed.up = upPressure;
            }
            if (this.maximizePressure !== 'none') {
                if (this.maximizePressure === 'mainAxis') {
                    const maxHorizontal = Math.max(directionPressed.left, directionPressed.right);
                    const maxVertical = Math.max(directionPressed.up, directionPressed.down);
                    if (maxHorizontal > 0 && maxHorizontal > maxVertical) {
                        if (directionPressed.left > 0) {
                            directionPressed.left = 1;
                        }
                        else if (directionPressed.right > 0) {
                            directionPressed.right = 1;
                        }
                    }
                    else if (maxVertical > 0 && maxVertical > maxHorizontal) {
                        if (directionPressed.up > 0) {
                            directionPressed.up = 1;
                        }
                        else if (directionPressed.down > 0) {
                            directionPressed.down = 1;
                        }
                    }
                    else if (maxHorizontal > 0 && maxHorizontal === maxVertical) {
                        if (directionPressed.left > 0) {
                            directionPressed.left = 1;
                        }
                        else if (directionPressed.right > 0) {
                            directionPressed.right = 1;
                        }
                        if (directionPressed.up > 0) {
                            directionPressed.up = 1;
                        }
                        else if (directionPressed.down > 0) {
                            directionPressed.down = 1;
                        }
                    }
                }
                else {
                    if (directionPressed.left > 0) {
                        directionPressed.left = 1;
                    }
                    else if (directionPressed.right > 0) {
                        directionPressed.right = 1;
                    }
                    if (directionPressed.up > 0) {
                        directionPressed.up = 1;
                    }
                    else if (directionPressed.down > 0) {
                        directionPressed.down = 1;
                    }
                }
            }
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            (0, logger_1.logPointerEvent)(`pressed=${pressed} x=${x} y=${y} hw=${halfWidth} hh=${halfHeight}`);
        }
        this.onDirectionPressedChange();
    }
}
exports.MoveInterface = MoveInterface;


/***/ }),

/***/ "./src/Player.ts":
/*!***********************!*\
  !*** ./src/Player.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Player = void 0;
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
var PlayerDirection;
(function (PlayerDirection) {
    PlayerDirection[PlayerDirection["up"] = 0] = "up";
    PlayerDirection[PlayerDirection["down"] = 1] = "down";
    PlayerDirection[PlayerDirection["left"] = 2] = "left";
    PlayerDirection[PlayerDirection["right"] = 3] = "right";
})(PlayerDirection || (PlayerDirection = {}));
class Player extends pixi_js_1.Container {
    constructor(options) {
        super();
        this.DIRECTIONS = PlayerDirection;
        this.animationSpeed = 0.1;
        this.velocity = 3;
        this.impulse = {
            up: 0,
            left: 0,
            right: 0,
            down: 0
        };
        this.setup(options);
        this.setDirection(PlayerDirection.down);
        this.x = options.position.x;
        this.y = options.position.y;
    }
    hideAllDirections() {
        [this.up, this.left, this.right, this.down].forEach(spr => {
            spr.visible = false;
        });
    }
    setDirection(dir) {
        this.hideAllDirections();
        switch (dir) {
            case PlayerDirection.down:
                this.down.visible = true;
                break;
            case PlayerDirection.left:
                this.left.visible = true;
                break;
            case PlayerDirection.right:
                this.right.visible = true;
                break;
            case PlayerDirection.up:
                this.up.visible = true;
                break;
        }
        this._direction = dir;
    }
    stopAllAnimations() {
        [this.up, this.left, this.right, this.down].forEach(spr => {
            spr.stop();
        });
    }
    playAnimation() {
        this.stopAllAnimations();
        switch (this._direction) {
            case PlayerDirection.down:
                this.down.play();
                break;
            case PlayerDirection.left:
                this.left.play();
                break;
            case PlayerDirection.right:
                this.right.play();
                break;
            case PlayerDirection.up:
                this.up.play();
                break;
        }
    }
    setup({ sprites: { up, left, right, down } }) {
        const upSpr = new pixi_js_1.AnimatedSprite(up);
        upSpr.animationSpeed = this.animationSpeed;
        this.addChild(upSpr);
        this.up = upSpr;
        const leftSpr = new pixi_js_1.AnimatedSprite(left);
        leftSpr.animationSpeed = this.animationSpeed;
        this.addChild(leftSpr);
        this.left = leftSpr;
        const righSpr = new pixi_js_1.AnimatedSprite(right);
        righSpr.animationSpeed = this.animationSpeed;
        this.addChild(righSpr);
        this.right = righSpr;
        const downSpr = new pixi_js_1.AnimatedSprite(down);
        downSpr.animationSpeed = this.animationSpeed;
        this.addChild(downSpr);
        this.down = downSpr;
    }
    setImpulse(impulse) {
        /* eslint-disable @typescript-eslint/restrict-template-expressions */
        (0, logger_1.logPlayerImpulse)(`Got impulse up=${impulse.up} left=${impulse.left} right=${impulse.right} down=${impulse.down}`);
        Object.assign(this.impulse, impulse);
        if (typeof impulse.up === 'number' && impulse.up > 0 && this.impulse.down > 0) {
            this.impulse.down = 0;
        }
        else if (typeof impulse.left === 'number' && impulse.left > 0 && this.impulse.right > 0) {
            this.impulse.right = 0;
        }
        else if (typeof impulse.right === 'number' && impulse.right > 0 && this.impulse.left > 0) {
            this.impulse.left = 0;
        }
        else if (typeof impulse.down === 'number' && impulse.down > 0 && this.impulse.up > 0) {
            this.impulse.up = 0;
        }
        if (this.impulse.left > 0) {
            this.setDirection(PlayerDirection.left);
        }
        else if (this.impulse.right > 0) {
            this.setDirection(PlayerDirection.right);
        }
        else if (this.impulse.up > 0) {
            this.setDirection(PlayerDirection.up);
        }
        else if (this.impulse.down > 0) {
            this.setDirection(PlayerDirection.down);
        }
        if (this.impulse.left > 0 || this.impulse.right > 0 || this.impulse.up > 0 || this.impulse.down > 0) {
            this.playAnimation();
        }
        else {
            this.stopAllAnimations();
        }
        (0, logger_1.logPlayerImpulse)(`up=${this.impulse.up} left=${this.impulse.left} right=${this.impulse.right} down=${this.impulse.down}`);
        /* eslint-enable @typescript-eslint/restrict-template-expressions */
    }
    addUpImpulse() {
        this.setImpulse({ up: 1 });
    }
    subUpImpulse() {
        this.setImpulse({ up: 0 });
    }
    addLeftImpulse() {
        this.setImpulse({ left: 1 });
    }
    subLeftImpulse() {
        this.setImpulse({ left: 0 });
    }
    addRightImpulse() {
        this.setImpulse({ right: 1 });
    }
    subRightImpulse() {
        this.setImpulse({ right: 0 });
    }
    addDownImpulse() {
        this.setImpulse({ down: 1 });
    }
    subDownImpulse() {
        this.setImpulse({ down: 0 });
    }
    releaseAllImpulse() {
        this.setImpulse({ up: 0, left: 0, right: 0, down: 0 });
    }
    getVerticalImpulse() {
        return this.impulse.up > 0 ? -this.velocity * this.impulse.up : this.impulse.down > 0 ? this.velocity * this.impulse.down : 0;
    }
    getHorizontalImpulse() {
        return this.impulse.left > 0 ? -this.velocity * this.impulse.left : this.impulse.right > 0 ? this.velocity * this.impulse.right : 0;
    }
}
exports.Player = Player;


/***/ }),

/***/ "./src/World.ts":
/*!**********************!*\
  !*** ./src/World.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.World = void 0;
const MapScreen_1 = __webpack_require__(/*! ./MapScreen */ "./src/MapScreen.ts");
const BattleScreen_1 = __webpack_require__(/*! ./BattleScreen */ "./src/BattleScreen.ts");
var WorldScreen;
(function (WorldScreen) {
    WorldScreen[WorldScreen["map"] = 0] = "map";
    WorldScreen[WorldScreen["battle"] = 1] = "battle";
})(WorldScreen || (WorldScreen = {}));
class World {
    constructor({ app, gameLoader }) {
        this.resizeTimeout = 300;
        this.totalWidth = 1024;
        this.totalHeight = 576;
        this.resizeDeBounce = () => {
            this.cancelScheduledResizeHandler();
            this.scheduleResizeHandler();
        };
        this.resizeHandler = () => {
            const params = { viewWidth: this.app.view.width, viewHeight: this.app.view.height };
            this.mapScreen.handleScreenResize(params);
            this.battleScreen.handleScreenResize(params);
        };
        this.handleAppTick = () => {
            switch (this.screen) {
                case WorldScreen.map:
                    this.mapScreen.handleScreenTick();
                    break;
                case WorldScreen.battle:
                    this.battleScreen.handleScreenTick();
                    break;
            }
        };
        this.app = app;
        this.gameLoader = gameLoader;
        this.setup();
        this.setScreen(WorldScreen.map);
    }
    setup() {
        this.setupCanvas();
        this.setupScreens();
        this.setupEventLesteners();
        this.resizeHandler();
    }
    setupEventLesteners() {
        window.addEventListener('resize', this.resizeDeBounce);
        this.app.ticker.add(this.handleAppTick);
    }
    findTileLayer(name) {
        const layer = this.gameLoader.settings.layers.find((l) => l.type === 'tilelayer' && l.name === name);
        if (layer == null) {
            throw new Error(`Unable to detect "${name}" layer`);
        }
        return layer;
    }
    setupCanvas() {
        document.body.appendChild(this.app.view);
    }
    setupScreens() {
        const { app: { view: { width, height } }, gameLoader: { worldBackgroundTexture, worldForegroundTexture, battleBackgroundTexture, spritesheet: { animations } } } = this;
        this.mapScreen = new MapScreen_1.MapScreen({
            viewWidth: width,
            viewHeight: height,
            collisionsLayer: this.findTileLayer('Collisions'),
            battleZonesLayer: this.findTileLayer('Battle Zones'),
            playerSprites: {
                up: animations['Player-Up'],
                left: animations['Player-Left'],
                right: animations['Player-Right'],
                down: animations['Player-Down']
            },
            mapSprites: {
                background: worldBackgroundTexture,
                foreground: worldForegroundTexture
            }
        });
        this.battleScreen = new BattleScreen_1.BattleScreen({
            sprites: {
                draggle: animations['Draggle-Idle'],
                emby: animations['Emby-Idle'],
                background: battleBackgroundTexture
            }
        });
        this.app.stage.addChild(this.mapScreen);
        this.app.stage.addChild(this.battleScreen);
    }
    cancelScheduledResizeHandler() {
        clearTimeout(this.resizeTimeoutId);
    }
    scheduleResizeHandler() {
        this.resizeTimeoutId = setTimeout(() => {
            this.cancelScheduledResizeHandler();
            this.resizeHandler();
        }, this.resizeTimeout);
    }
    setScreen(screen) {
        switch (screen) {
            case WorldScreen.map:
                this.mapScreen.visible = true;
                this.mapScreen.activate();
                this.battleScreen.visible = false;
                this.battleScreen.deactivate();
                break;
            case WorldScreen.battle:
                this.mapScreen.visible = false;
                this.mapScreen.deactivate();
                this.battleScreen.visible = true;
                this.battleScreen.activate();
                break;
        }
        this.screen = screen;
    }
}
exports.World = World;
World.SCREENS = WorldScreen;


/***/ }),

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const pixi_js_1 = __webpack_require__(/*! pixi.js */ "./node_modules/pixi.js/lib/index.js");
const World_1 = __webpack_require__(/*! ./World */ "./src/World.ts");
const GameLoader_1 = __webpack_require__(/*! ./GameLoader */ "./src/GameLoader.ts");
async function run() {
    const gameLoader = new GameLoader_1.GameLoader();
    await gameLoader.loadAll();
    const app = new pixi_js_1.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: 0xe6e7ea,
        resizeTo: window
    });
    void new World_1.World({ app, gameLoader });
}
run().catch(console.error);


/***/ }),

/***/ "./src/logger.ts":
/*!***********************!*\
  !*** ./src/logger.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.logPointerEvent = exports.logMoveInterface = exports.logBoundary = exports.logPlayerCollision = exports.logPlayerImpulse = exports.logKeyup = exports.logKeydown = exports.logPokeLayout = void 0;
const debug_1 = __importDefault(__webpack_require__(/*! debug */ "./node_modules/debug/src/browser.js"));
exports.logPokeLayout = (0, debug_1.default)('poke-layout');
exports.logKeydown = (0, debug_1.default)('poke-keydown');
exports.logKeyup = (0, debug_1.default)('poke-keyup');
exports.logPlayerImpulse = (0, debug_1.default)('poke-player-impulse');
exports.logPlayerCollision = (0, debug_1.default)('poke-player-collision');
exports.logBoundary = (0, debug_1.default)('poke-boundary');
exports.logMoveInterface = (0, debug_1.default)('poke-move-interface');
exports.logPointerEvent = (0, debug_1.default)('poke-pointer-event');


/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rectangularCollision = void 0;
const logger_1 = __webpack_require__(/*! ./logger */ "./src/logger.ts");
function rectangularCollision({ rect1, rect2 }) {
    (0, logger_1.logPlayerCollision)(`r1x=${rect1.x} r1y=${rect1.y} r1w=${rect1.width} r1h=${rect1.height} <> r2x=${rect2.x} r2y=${rect2.y} r2w=${rect2.width} r2h=${rect2.height}`);
    return (rect1.x + rect1.width >= rect2.x &&
        rect1.x <= rect2.x + rect2.width &&
        rect1.y <= rect2.y + rect2.height &&
        rect1.y + rect1.height >= rect2.y);
}
exports.rectangularCollision = rectangularCollision;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		__webpack_require__.O.j = (chunkId) => (installedChunks[chunkId] === 0);
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 			return __webpack_require__.O(result);
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunksimple_html5_pokemon_game"] = self["webpackChunksimple_html5_pokemon_game"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 	var __webpack_exports__ = __webpack_require__.O(undefined, ["vendor"], () => (__webpack_require__("./src/app.ts")))
/******/ 	__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 	
/******/ })()
;
//# sourceMappingURL=main.bundle.js.map