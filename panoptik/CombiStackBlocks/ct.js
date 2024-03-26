/*! Made with ct.js http://ctjs.rocks/ */
try {
    require("electron");
} catch {
    "file:" === location.protocol &&
        alert(
            "Your game won't work like this because\nWeb 👏 builds 👏 require 👏 a web 👏 server!\n\nConsider using a desktop build, or upload your web build to itch.io, GameJolt or your own website.\n\nIf you haven't created this game, please contact the developer about this issue.\n\n Also note that ct.js games do not work inside the itch app; you will need to open the game with your browser of choice."
        );
}
const deadPool = [],
    copyTypeSymbol = Symbol("I am a ct.js copy");
setInterval(function () {
    deadPool.length = 0;
}, 6e4);
const ct = {
    speed: 60,
    templates: {},
    snd: {},
    stack: [],
    fps: 60,
    delta: 1,
    deltaUi: 1,
    camera: null,
    version: "3.2.0",
    meta: { name: "Combi Stack Blocks", author: "Panoptik Digitals", site: "CombiStackBlocks", version: "1.0.0" },
    get width() {
        return ct.pixiApp.renderer.view.width;
    },
    set width(t) {
        return (ct.camera.width = ct.roomWidth = t), (ct.fittoscreen && "fastScale" !== ct.fittoscreen.mode) || ct.pixiApp.renderer.resize(t, ct.height), ct.fittoscreen && ct.fittoscreen(), t;
    },
    get height() {
        return ct.pixiApp.renderer.view.height;
    },
    set height(t) {
        return (ct.camera.height = ct.roomHeight = t), (ct.fittoscreen && "fastScale" !== ct.fittoscreen.mode) || ct.pixiApp.renderer.resize(ct.width, t), ct.fittoscreen && ct.fittoscreen(), t;
    },
};
console.log(
    `%c 😺 %c ct.js game editor %c v${ct.version} %c https://ctjs.rocks/ `,
    "background: #446adb; color: #fff; padding: 0.5em 0;",
    "background: #5144db; color: #fff; padding: 0.5em 0;",
    "background: #446adb; color: #fff; padding: 0.5em 0;",
    "background: #5144db; color: #fff; padding: 0.5em 0;"
),
    (ct.highDensity = !0);
const pixiAppSettings = { width: 2400, height: 2400, antialias: !0, powerPreference: "high-performance", sharedTicker: !1, sharedLoader: !0 };
try {
    ct.pixiApp = new PIXI.Application(pixiAppSettings);
} catch (t) {
    console.error(t),
        console.warn("[ct.js] Something bad has just happened. This is usually due to hardware problems. I'll try to fix them now, but if the game still doesn't run, try including a legacy renderer in the project's settings."),
        (PIXI.settings.SPRITE_MAX_TEXTURES = Math.min(PIXI.settings.SPRITE_MAX_TEXTURES, 16)),
        (ct.pixiApp = new PIXI.Application(pixiAppSettings));
}
(PIXI.settings.ROUND_PIXELS = !1),
    (ct.pixiApp.ticker.maxFPS = 60),
    ct.pixiApp.renderer.options.antialias || (PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST),
    (ct.stage = ct.pixiApp.stage),
    (ct.pixiApp.renderer.autoDensity = ct.highDensity),
    document.getElementById("ct").appendChild(ct.pixiApp.view),
    (ct.u = {
        getEnvironment() {
            if ("ct.js debugger" === window.name) return "ct.ide";
            try {
                if (nw.require) return "nw";
            } catch (t) {}
            try {
                return require("electron"), "electron";
            } catch (t) {}
            return "browser";
        },
        getOS() {
            const t = window.navigator.userAgent;
            return -1 !== t.indexOf("Windows") ? "windows" : -1 !== t.indexOf("Linux") ? "linux" : -1 !== t.indexOf("Mac") ? "darwin" : "unknown";
        },
        ldx: (t, e) => t * Math.cos((e * Math.PI) / 180),
        ldy: (t, e) => t * Math.sin((e * Math.PI) / 180),
        pdn: (t, e, o, i) => ((180 * Math.atan2(i - e, o - t)) / Math.PI + 360) % 360,
        pdc: (t, e, o, i) => Math.sqrt((o - t) * (o - t) + (i - e) * (i - e)),
        degToRad: (t) => (t * Math.PI) / 180,
        radToDeg: (t) => (t / Math.PI) * 180,
        rotate: (t, e, o) => ct.u.rotateRad(t, e, ct.u.degToRad(o)),
        rotateRad(t, e, o) {
            const i = Math.sin(o),
                n = Math.cos(o);
            return new PIXI.Point(n * t - i * e, n * e + i * t);
        },
        deltaDir(t, e) {
            var o = (e = ((e % 360) + 360) % 360) - (t = ((t % 360) + 360) % 360);
            return o > 180 && (o -= 360), o < -180 && (o += 360), o;
        },
        clamp: (t, e, o) => Math.max(t, Math.min(o, e)),
        lerp: (t, e, o) => t + (e - t) * o,
        unlerp: (t, e, o) => (o - t) / (e - t),
        map: (t, e, o, i, n) => ((t - e) * (n - i)) / (o - e) + i,
        uiToGameCoord: (t, e) => ct.camera.uiToGameCoord(t, e),
        gameToUiCoord: (t, e) => ct.camera.gameToUiCoord(t, e),
        hexToPixi: (t) => Number("0x" + t.slice(1)),
        pixiToHex: (t) => "#" + t.toString(16).padStart(6, 0),
        prect(t, e, o) {
            var i, n, s, a;
            return (
                o.splice
                    ? ((i = Math.min(o[0], o[2])), (n = Math.max(o[0], o[2])), (s = Math.min(o[1], o[3])), (a = Math.max(o[1], o[3])))
                    : ((i = o.x - o.shape.left * o.scale.x), (n = o.x + o.shape.right * o.scale.x), (s = o.y - o.shape.top * o.scale.y), (a = o.y + o.shape.bottom * o.scale.y)),
                t >= i && e >= s && t <= n && e <= a
            );
        },
        pcircle: (t, e, o) => (o.splice ? ct.u.pdc(t, e, o[0], o[1]) < o[2] : ct.u.pdc(0, 0, (o.x - t) / o.scale.x, (o.y - e) / o.scale.y) < o.shape.r),
        ext(t, e, o) {
            if (o) for (const i in o) e[o[i]] && (t[o[i]] = e[o[i]]);
            else for (const o in e) t[o] = e[o];
            return t;
        },
        wait: (t) => ct.timer.add(t),
        waitUi: (t) => ct.timer.addUi(t),
        promisify: (t) =>
            function (...e) {
                return new Promise((o, i) => {
                    e.push(function (t, e) {
                        t ? i(t) : o(e);
                    }),
                        t.call(this, ...e);
                });
            },
        required(t, e) {
            let o = "The parameter ";
            throw (t && (o += `${t} `), e && (o += `of ${e} `), (o += "is required."), new Error(o));
        },
        numberedString: (t, e) => t + "_" + e.toString().padStart(2, "0"),
        getStringNumber: (t) => Number(t.split("_").pop()),
    }),
    ct.u.ext(ct.u, { getOs: ct.u.getOS, lengthDirX: ct.u.ldx, lengthDirY: ct.u.ldy, pointDirection: ct.u.pdn, pointDistance: ct.u.pdc, pointRectangle: ct.u.prect, pointCircle: ct.u.pcircle, extend: ct.u.ext }),
    (() => {
        const t = (e) => {
            (e.kill = !0), e.onDestroy && (ct.templates.onDestroy.apply(e), e.onDestroy.apply(e));
            for (const o of e.children) o[copyTypeSymbol] && t(o);
            const o = ct.stack.indexOf(e);
            if ((-1 !== o && ct.stack.splice(o, 1), e.template)) {
                const t = ct.templates.list[e.template].indexOf(e);
                -1 !== t && ct.templates.list[e.template].splice(t, 1);
            }
            deadPool.push(e);
        };
        ct.loop = function () {
            (ct.delta = ct.pixiApp.ticker.deltaMS / (1e3 / (ct.pixiApp.ticker.maxFPS || 60))),
                (ct.deltaUi = ct.pixiApp.ticker.elapsedMS / (1e3 / (ct.pixiApp.ticker.maxFPS || 60))),
                ct.inputs.updateActions(),
                ct.timer.updateTimers(),
                ct.place.debugTraceGraphics.clear(),
                ct.rooms.rootRoomOnStep.apply(ct.room);
            for (let t = 0, e = ct.stack.length; t < e; t++) ct.templates.beforeStep.apply(ct.stack[t]), ct.stack[t].onStep.apply(ct.stack[t]), ct.templates.afterStep.apply(ct.stack[t]);
            for (const t of ct.stage.children) t instanceof Room && (ct.rooms.beforeStep.apply(t), t.onStep.apply(t), ct.rooms.afterStep.apply(t));
            for (const e of ct.stack) e.kill && !e._destroyed && (t(e), e.destroy({ children: !0 }));
            for (const t of ct.stage.children) t.children.sort((t, e) => (t.depth || 0) - (e.depth || 0) || (t.uid || 0) - (e.uid || 0) || 0);
            ct.camera && (ct.camera.update(ct.delta), ct.camera.manageStage());
            for (let t = 0, e = ct.stack.length; t < e; t++)
                ct.templates.beforeDraw.apply(ct.stack[t]), ct.stack[t].onDraw.apply(ct.stack[t]), ct.templates.afterDraw.apply(ct.stack[t]), (ct.stack[t].xprev = ct.stack[t].x), (ct.stack[t].yprev = ct.stack[t].y);
            for (const t of ct.stage.children) t instanceof Room && (ct.rooms.beforeDraw.apply(t), t.onDraw.apply(t), ct.rooms.afterDraw.apply(t));
            ct.rooms.rootRoomOnDraw.apply(ct.room), ct.rooms.switching && ct.rooms.forceSwitch();
        };
    })();
class CtAction {
    constructor(t) {
        return (this.name = t), (this.methodCodes = []), (this.methodMultipliers = []), (this.prevValue = 0), (this.value = 0), this;
    }
    methodExists(t) {
        return -1 !== this.methodCodes.indexOf(t);
    }
    addMethod(t, e) {
        if (-1 !== this.methodCodes.indexOf(t)) throw new Error(`[ct.inputs] An attempt to add an already added input "${t}" to an action "${name}".`);
        this.methodCodes.push(t), this.methodMultipliers.push(void 0 !== e ? e : 1);
    }
    removeMethod(t) {
        const e = this.methodCodes.indexOf(t);
        -1 !== e && (this.methodCodes.splice(e, 1), this.methodMultipliers.splice(e, 1));
    }
    setMultiplier(t, e) {
        const o = this.methodCodes.indexOf(t);
        -1 !== o ? (this.methodMultipliers[o] = e) : (console.warning(`[ct.inputs] An attempt to change multiplier of a non-existent method "${t}" at event ${this.name}`), console.trace());
    }
    update() {
        (this.prevValue = this.value), (this.value = 0);
        for (let t = 0, e = this.methodCodes.length; t < e; t++) {
            const e = ct.inputs.registry[this.methodCodes[t]] || 0;
            this.value += e * this.methodMultipliers[t];
        }
        this.value = Math.max(-1, Math.min(this.value, 1));
    }
    reset() {
        this.prevValue = this.value = 0;
    }
    get pressed() {
        return 0 === this.prevValue && 0 !== this.value;
    }
    get released() {
        return 0 !== this.prevValue && 0 === this.value;
    }
    get down() {
        return 0 !== this.value;
    }
}
(ct.actions = {}),
    (ct.inputs = {
        registry: {},
        addAction(t, e) {
            if (t in ct.actions) throw new Error(`[ct.inputs] An action "${t}" already exists, can't add a new one with the same name.`);
            const o = new CtAction(t);
            for (const t of e) o.addMethod(t.code, t.multiplier);
            return (ct.actions[t] = o), o;
        },
        removeAction(t) {
            delete ct.actions[t];
        },
        updateActions() {
            for (const t in ct.actions) ct.actions[t].update();
        },
    }),
    ct.inputs.addAction("MoveX", [
        { code: "keyboard.KeyD" },
        { code: "keyboard.KeyA", multiplier: -1 },
        { code: "keyboard.ArrowRight" },
        { code: "keyboard.ArrowLeft", multiplier: -1 },
        { code: "gamepad.Right" },
        { code: "gamepad.Left", multiplier: -1 },
        { code: "gamepad.LStickX" },
        { code: "vkeys.Vjoy1X" },
    ]),
    ct.inputs.addAction("Drop", [{ code: "keyboard.Space" }, { code: "vkeys.Vk2" }, { code: "gamepad.Button1" }]),
    ct.inputs.addAction("Switch", [{ code: "keyboard.ControlLeft" }, { code: "keyboard.ControlRight" }, { code: "vkeys.Vk4" }, { code: "gamepad.Button3" }, { code: "keyboard.KeyW" }, { code: "keyboard.ArrowUp" }]),
    ct.inputs.addAction("MoveY", [{ code: "keyboard.KeyS" }, { code: "keyboard.ArrowDown" }, { code: "gamepad.Down" }, { code: "gamepad.LStickY" }, { code: "vkeys.Vjoy1Y" }]);
class Room extends PIXI.Container {
    static getNewId() {
        return this.roomId++, this.roomId;
    }
    constructor(t) {
        if (
            (super(),
            (this.x = this.y = 0),
            (this.uid = Room.getNewId()),
            (this.tileLayers = []),
            (this.backgrounds = []),
            (this.timer1 = this.timer2 = this.timer3 = this.timer4 = this.timer5 = this.timer6 = 0),
            ct.room || (ct.room = ct.rooms.current = this),
            t)
        ) {
            (this.onCreate = t.onCreate),
                (this.onStep = t.onStep),
                (this.onDraw = t.onDraw),
                (this.onLeave = t.onLeave),
                (this.template = t),
                (this.name = t.name),
                (this.isUi = t.isUi),
                (this.follow = t.follow),
                t.extends && ct.u.ext(this, t.extends),
                this === ct.room && (ct.pixiApp.renderer.backgroundColor = ct.u.hexToPixi(this.template.backgroundColor)),
                ct.fittoscreen(),
                this === ct.room && (ct.place.tileGrid = {});
            for (let e = 0, o = t.bgs.length; e < o; e++) {
                const o = new ct.templates.Background(t.bgs[e].texture, null, t.bgs[e].depth, t.bgs[e].exts);
                this.addChild(o);
            }
            for (let e = 0, o = t.tiles.length; e < o; e++) {
                const o = new Tilemap(t.tiles[e]);
                o.cache(), this.tileLayers.push(o), this.addChild(o);
            }
            for (let e = 0, o = t.objects.length; e < o; e++) {
                const o = t.objects[e],
                    i = o.exts || {},
                    n = o.customProperties || {};
                ct.templates.copyIntoRoom(o.template, o.x, o.y, this, { ...i, ...n, scaleX: o.scale.x, scaleY: o.scale.y, rotation: o.rotation, alpha: o.opacity, tint: o.tint });
            }
        }
        return this;
    }
    get x() {
        return -this.position.x;
    }
    set x(t) {
        return (this.position.x = -t), t;
    }
    get y() {
        return -this.position.y;
    }
    set y(t) {
        return (this.position.y = -t), t;
    }
}
(Room.roomId = 0),
    (function () {
        var t;
        ct.rooms = {
            templates: {},
            list: {},
            addBg(t, e) {
                const o = new ct.templates.Background(t, null, e);
                return ct.room.addChild(o), o;
            },
            addTileLayer: (t) => ct.tilemaps.create(t),
            clear() {
                (ct.stage.children = []), (ct.stack = []);
                for (const t in ct.templates.list) ct.templates.list[t] = [];
                for (const t in ct.backgrounds.list) ct.backgrounds.list[t] = [];
                ct.rooms.list = {};
                for (const t in ct.rooms.templates) ct.rooms.list[t] = [];
            },
            remove(t) {
                if (!(t instanceof Room)) {
                    if ("string" == typeof t) throw new Error("[ct.rooms] To remove a room, you should provide a reference to it (to an object), not its name. Provided value:", t);
                    throw new Error("[ct.rooms] An attempt to remove a room that is not actually a room! Provided value:", t);
                }
                const e = ct.rooms.list[t.name];
                -1 !== e ? ct.rooms.list[t.name].splice(e, 1) : console.warn("[ct.rooms] Removing a room that was not found in ct.rooms.list. This is strange…"), (t.kill = !0), ct.stage.removeChild(t);
                for (const e of t.children) e.kill = !0;
                t.onLeave(), ct.rooms.onLeave.apply(t);
            },
            switch(e) {
                ct.rooms.templates[e] ? ((t = e), (ct.rooms.switching = !0)) : console.error('[ct.rooms] The room "' + e + '" does not exist!');
            },
            switching: !1,
            restart() {
                ct.rooms.switch(ct.room.name);
            },
            append(t, e) {
                if (!(t in ct.rooms.templates)) return console.error(`[ct.rooms] append failed: the room ${t} does not exist!`), !1;
                const o = new Room(ct.rooms.templates[t]);
                return e && ct.u.ext(o, e), ct.stage.addChild(o), o.onCreate(), ct.rooms.onCreate.apply(o), ct.rooms.list[t].push(o), o;
            },
            prepend(t, e) {
                if (!(t in ct.rooms.templates)) return console.error(`[ct.rooms] prepend failed: the room ${t} does not exist!`), !1;
                const o = new Room(ct.rooms.templates[t]);
                return e && ct.u.ext(o, e), ct.stage.addChildAt(o, 0), o.onCreate(), ct.rooms.onCreate.apply(o), ct.rooms.list[t].push(o), o;
            },
            merge(t) {
                if (!(t in ct.rooms.templates)) return console.error(`[ct.rooms] merge failed: the room ${t} does not exist!`), !1;
                const e = { copies: [], tileLayers: [], backgrounds: [] },
                    o = ct.rooms.templates[t],
                    i = ct.room;
                for (const t of o.bgs) {
                    const o = new ct.templates.Background(t.texture, null, t.depth, t.extends);
                    i.backgrounds.push(o), i.addChild(o), e.backgrounds.push(o);
                }
                for (const t of o.tiles) {
                    const o = new Tilemap(t);
                    i.tileLayers.push(o), i.addChild(o), e.tileLayers.push(o), o.cache();
                }
                for (const t of o.objects) {
                    const o = ct.templates.copyIntoRoom(t.template, t.x, t.y, i, { tx: t.tx || 1, ty: t.ty || 1, tr: t.tr || 0 });
                    e.copies.push(o);
                }
                return e;
            },
            forceSwitch(e) {
                t && (e = t), ct.room && (ct.rooms.rootRoomOnLeave.apply(ct.room), ct.room.onLeave(), ct.rooms.onLeave.apply(ct.room), (ct.room = void 0)), ct.rooms.clear(), (deadPool.length = 0);
                var o = ct.rooms.templates[e];
                (ct.roomWidth = o.width),
                    (ct.roomHeight = o.height),
                    (ct.camera = new Camera(ct.roomWidth / 2, ct.roomHeight / 2, ct.roomWidth, ct.roomHeight)),
                    o.cameraConstraints && ((ct.camera.minX = o.cameraConstraints.x1), (ct.camera.maxX = o.cameraConstraints.x2), (ct.camera.minY = o.cameraConstraints.y1), (ct.camera.maxY = o.cameraConstraints.y2)),
                    ct.pixiApp.renderer.resize(o.width, o.height),
                    (ct.rooms.current = ct.room = new Room(o)),
                    ct.stage.addChild(ct.room),
                    ct.rooms.rootRoomOnCreate.apply(ct.room),
                    ct.room.onCreate(),
                    ct.rooms.onCreate.apply(ct.room),
                    ct.rooms.list[e].push(ct.room),
                    ct.camera.manageStage(),
                    (ct.rooms.switching = !1),
                    (t = void 0);
            },
            onCreate() {
                if (this === ct.room) {
                    const t = new PIXI.Graphics();
                    (t.depth = 1e7), ct.room.addChild(t), (ct.place.debugTraceGraphics = t);
                }
                for (const t of this.tileLayers) -1 !== this.children.indexOf(t) && ct.place.enableTilemapCollisions(t);
            },
            onLeave() {
                if (!this.kill) {
                    for (var t of ct.tween.tweens) t.reject({ info: "Room switch", code: 1, from: "ct.tween" });
                    ct.tween.tweens = [];
                }
                this === ct.room && (ct.place.grid = {});
            },
            starting: "Main",
        };
    })(),
    (ct.room = null),
    (ct.rooms.beforeStep = function () {
        for (var t = 0; t < ct.tween.tweens.length; ) {
            var e = ct.tween.tweens[t];
            if (e.obj.kill) e.reject({ code: 2, info: "Copy is killed" }), ct.tween.tweens.splice(t, 1);
            else {
                var o = e.timer.time / e.duration;
                for (var i in (o > 1 && (o = 1), e.fields)) {
                    var n = e.starting[i],
                        s = e.fields[i] - e.starting[i];
                    e.obj[i] = e.curve(n, s, o);
                }
                1 !== o ? t++ : (e.resolve(e.fields), ct.tween.tweens.splice(t, 1));
            }
        }
        ct.pointer.updateGestures();
        {
            const t = ct.u.uiToGameCoord(ct.pointer.xui, ct.pointer.yui);
            (ct.pointer.x = t.x), (ct.pointer.y = t.y);
        }
    }),
    (ct.rooms.afterStep = function () {}),
    (ct.rooms.beforeDraw = function () {}),
    (ct.rooms.afterDraw = function () {
        ct.keyboard.clear(),
            (ct.mouse.xprev = ct.mouse.x),
            (ct.mouse.yprev = ct.mouse.y),
            (ct.mouse.xuiprev = ct.mouse.xui),
            (ct.mouse.yuiprev = ct.mouse.yui),
            (ct.mouse.pressed = ct.mouse.released = !1),
            (ct.inputs.registry["mouse.Wheel"] = 0);
        for (const t of ct.pointer.down) (t.xprev = t.x), (t.yprev = t.y), (t.xuiprev = t.x), (t.yuiprev = t.y);
        for (const t of ct.pointer.hover) (t.xprev = t.x), (t.yprev = t.y), (t.xuiprev = t.x), (t.yuiprev = t.y);
        (ct.inputs.registry["pointer.Wheel"] = 0),
            ct.pointer.clearReleased(),
            (ct.pointer.xmovement = ct.pointer.ymovement = 0),
            ct.sound.follow && !ct.sound.follow.kill
                ? ct.sound.howler.pos(ct.sound.follow.x, ct.sound.follow.y, ct.sound.useDepth ? ct.sound.follow.z : 0)
                : ct.sound.manageListenerPosition && ct.sound.howler.pos(ct.camera.x, ct.camera.y, ct.camera.z || 0);
    }),
    (ct.rooms.rootRoomOnCreate = function () {}),
    (ct.rooms.rootRoomOnStep = function () {}),
    (ct.rooms.rootRoomOnDraw = function () {}),
    (ct.rooms.rootRoomOnLeave = function () {}),
    (ct.rooms.templates.Main = {
        name: "Main",
        group: "ungrouped",
        width: 2400,
        height: 2400,
        objects: JSON.parse(
            '[{"x":336.74288595,"y":313.89715438,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Logolized_Combi_stack_blocks"},{"x":1182.97654584,"y":1549.97265625,"opacity":1,"tint":16777215,"scale":{"x":2.04690832,"y":1.907707},"rotation":0,"exts":{},"customProperties":{},"template":"StartGame"},{"x":1182.97654584,"y":1746.39937942,"opacity":1,"tint":16777215,"scale":{"x":2.04264392,"y":1.907707},"rotation":0,"exts":{},"customProperties":{},"template":"HowTo"}]'
        ),
        bgs: JSON.parse('[{"texture":"Main_Title_page","depth":0,"exts":{"movementX":0,"movementY":0,"parallaxX":1,"parallaxY":1,"repeat":"no-repeat","scaleX":1,"scaleY":1,"shiftX":0,"shiftY":0}}]'),
        tiles: JSON.parse("[]"),
        backgroundColor: "#000000",
        onStep() {},
        onDraw() {},
        onLeave() {},
        onCreate() {
            ct.transition.circleIn(750, 8415679);
        },
        isUi: !1,
        follow: !1,
        extends: {},
    }),
    (ct.rooms.templates.Game = {
        name: "Game",
        group: "ungrouped",
        width: 2400,
        height: 2400,
        objects: JSON.parse(
            '[{"x":65,"y":0,"opacity":1,"tint":16777215,"scale":{"x":2.07713126,"y":1.88697789},"rotation":0,"exts":{},"customProperties":{"newProperty6":""},"template":"BG_box"},{"x":2170.79213403,"y":2038.20500494,"opacity":1,"tint":16777215,"scale":{"x":0.25489315,"y":0.25489315},"rotation":0,"exts":{},"customProperties":{},"template":"Combi_FS_choco"},{"x":1650,"y":1305.97973989,"opacity":1,"tint":16777215,"scale":{"x":1.05797804,"y":1.0422297},"rotation":0,"exts":{},"customProperties":{},"template":"Reveal_yellow_rectangle"},{"x":1849.01142889,"y":1125.89420752,"opacity":1,"tint":16777215,"scale":{"x":0.23460252,"y":0.23460252},"rotation":0,"exts":{},"customProperties":{},"template":"Combi_FS_Cow"},{"x":1656.67600872,"y":543.34017124,"opacity":1,"tint":8415679,"scale":{"x":1.7,"y":2.077},"rotation":0,"exts":{},"customProperties":{"newProperty1":"","newProperty2":"","newProperty3":"","newProperty4":"","newProperty5":""},"template":"Score_box"},{"x":1644.57532739,"y":120.48208588,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Score"},{"x":1654.17506711,"y":241.21524121,"opacity":1,"tint":16777215,"scale":{"x":1.7,"y":1.7},"rotation":0,"exts":{},"customProperties":{},"template":"Score_box"},{"x":1087.90080676,"y":295.13668859,"opacity":1,"tint":16777215,"scale":{"x":0.96456189,"y":0.96456189},"rotation":0,"exts":{},"customProperties":{},"template":"BG_vector_element_2"},{"x":235.34085147,"y":282.39357749,"opacity":1,"tint":16777215,"scale":{"x":0.52066316,"y":0.52066316},"rotation":0,"exts":{},"customProperties":{},"template":"BG_vector_element_1"},{"x":1730,"y":1830,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"btnPause"},{"x":1730,"y":2025,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"btnMusicOn"},{"x":1730,"y":2220,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"btnMechanics1"},{"x":1728,"y":616,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"ProgressHolder"},{"x":2263,"y":612,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Star"}]'
        ),
        bgs: JSON.parse('[{"texture":"BG_Main","depth":0,"exts":{"movementX":0,"movementY":0,"parallaxX":1,"parallaxY":1,"repeat":"no-repeat","scaleX":1,"scaleY":1,"shiftX":0,"shiftY":0}}]'),
        tiles: JSON.parse("[]"),
        backgroundColor: "#A3F387",
        onStep() {
            if (this.countdown <= 0) {
                if ((this.dropping || ((this.timer2 = this.dropTime), (this.dropping = !0)), 0 != this.selectedBlocks[2] || 0 != this.grid[0][2] || this.rearranging)) 0 != this.grid[0][2] && (this.gameOver = !0);
                else {
                    if (!this.gameOver) {
                        do {
                            (this.selectedBlocks[0] = Math.floor(3 * Math.random() + 1)), (this.selectedBlocks[1] = Math.floor(3 * Math.random() + 1)), (this.selectedBlocks[2] = Math.floor(3 * Math.random() + 1));
                        } while (this.selectedBlocks[0] === this.selectedBlocks[1] && this.selectedBlocks[1] === this.selectedBlocks[2]);
                        for (let o = 0; o < this.selectedBlocks.length; o++) {
                            var t;
                            switch (this.selectedBlocks[o]) {
                                case 1:
                                    t = "blue";
                                    break;
                                case 2:
                                    t = "green";
                                    break;
                                case 3:
                                    t = "yellow";
                            }
                            var e = ct.templates.copy(t, 704, 384 - 256 * (o + 1));
                            (e.scale.x = e.scale.y = 0.16), this.activeBlocks.push(e), this.activeBlocks.shift();
                        }
                    }
                }
                this.gameOver && null == this.result && ((this.result = ct.rooms.append("Game over")), paused || ct.sound.spawn("gameover"), (ct.pixiApp.ticker.speed = 0), ct.sound.spawn("click"));
            }
            if (
                (this.timer1 > 0 && this.timer1 <= ct.delta / ct.speed
                    ? ((this.timer1 = 0),
                      (this.timer1 = 1),
                      this.countdown > 1
                          ? (this.countdown--, (this.countdownLabel.x = 790), (this.countdownLabel.y = 900), (this.countdownLabel.text = this.countdown), paused || ct.sound.spawn("Sound_kFw56H", { volume: 1 }))
                          : (this.countdown--, (this.countdownLabel.text = ""), paused || ct.sound.spawn("sweep_notifs"), (this.timer1 = 0)))
                    : (this.timer1 -= ct.delta / ct.speed),
                this.timer2 > 0 && this.timer2 <= ct.delta / ct.speed)
            ) {
                if (((this.timer2 = 0), (this.timer2 = this.dropTime), null != this.activeBlocks[0] && !this.dropped && !this.gameOver)) {
                    var o = ((a = this.activeBlocks[0]).y + 128) / 256 - 1,
                        i = (a.x + 64) / 256 - 1;
                    if (a.y < 2176 && o < 9 && 0 == this.grid[o + 1][i])
                        for (let t = 0; t < this.activeBlocks.length; t++) {
                            this.activeBlocks[t].y += 256;
                        }
                    else if (o >= 0) {
                        for (let t = 0; t < this.activeBlocks.length; t++)
                            o - t >= 0
                                ? ((this.grid[o - t][i] = this.selectedBlocks[t]),
                                  (this.gridBlocks[o - t][i] = this.activeBlocks[0]),
                                  this.activeBlocks.push(null),
                                  (this.selectedBlocks[t] = 0),
                                  this.activeBlocks.shift(),
                                  console.log(this.selectedBlocks[t]))
                                : (this.gameOver = !0);
                        CheckPattern(this);
                    }
                }
            } else this.timer2 -= ct.delta / ct.speed;
            if (ct.actions.MoveX.pressed) {
                let t = ct.actions.MoveX.value;
                if (null != this.activeBlocks[0] && ct.pixiApp.ticker.speed > 0) {
                    o = ((a = this.activeBlocks[0]).y + 128) / 256 - 1;
                    var n = 0;
                    (i = (a.x + 64) / 256 - 1) + t > 0 || i + t < 7 ? 0 == this.grid[o][i + t] && (n = 256 * t) : (n = 0);
                    for (let t = 0; t < this.activeBlocks.length; t++) this.activeBlocks[t].position.x += n;
                }
            }
            if (ct.actions.Switch.pressed) {
                ct.actions.Switch.value;
                if (null != this.activeBlocks[0] && ct.pixiApp.ticker.speed > 0) {
                    for (let t = 0; t < this.activeBlocks.length; t++) 0 == t ? (this.activeBlocks[t].y -= 512) : (this.activeBlocks[t].y += 256);
                    this.activeBlocks.push(this.activeBlocks.shift()), this.selectedBlocks.push(this.selectedBlocks.shift());
                }
            }
            if (ct.actions.Drop.pressed) {
                ct.actions.Drop.value;
                if (null != this.activeBlocks[0] && ct.pixiApp.ticker.speed > 0) {
                    (this.dropped = !0), (this.timer2 = 300);
                    var s = 0;
                    (o = ((a = this.activeBlocks[0]).y + 128) / 256 - 1), (i = (a.x + 64) / 256 - 1);
                    paused || ct.sound.spawn("whoop");
                    for (let t = o; t < this.grid.length; t++)
                        if (i < this.grid[t].length) {
                            if (0 !== this.grid[t][i]) break;
                            s = t - o;
                        }
                    for (let t = 0; t < this.activeBlocks.length; t++) {
                        this.activeBlocks[t].y += 256 * s;
                    }
                    for (let t = 0; t < this.activeBlocks.length; t++)
                        o + (s - t) >= 0
                            ? ((this.grid[o + (s - t)][i] = this.selectedBlocks[t]), (this.gridBlocks[o + (s - t)][i] = this.activeBlocks[0]), this.activeBlocks.push(null), (this.selectedBlocks[t] = 0), this.activeBlocks.shift())
                            : ((this.gameOver = !0), console.log("Game over"));
                    CheckPattern(this);
                }
            }
            if (ct.actions.MoveY.pressed) {
                ct.actions.MoveY.value;
            }
            if (ct.actions.MoveY.down) {
                let t = ct.actions.MoveY.value;
                if (null != this.activeBlocks[0] && ct.pixiApp.ticker.speed > 0 && t > 0) {
                    var a;
                    (o = ((a = this.activeBlocks[0]).y + 128) / 256 - 1), (i = (a.x + 64) / 256 - 1), (n = 0);
                    if (((yRange += 64 * t), console.log(yRange), yRange % 256 == 0)) {
                        o + t < 9 ? 0 == this.grid[o + t][i] && (n = 256 * t) : (n = 0);
                        for (let t = 0; t < this.activeBlocks.length; t++) this.activeBlocks[t].position.y += n;
                        yRange = 0;
                    }
                }
            }
        },
        onDraw() {
            if (ct.pointer.down[0] && ct.pixiApp.ticker.speed > 0 && !this.gameOver) {
                if (
                    (null == this.startX && (this.startX = ct.pointer.x),
                    null == this.startY && (this.startY = ct.pointer.y),
                    (this.lX = ct.pointer.x - this.startX),
                    (this.lX = Math.floor(Math.min(Math.max(this.lX, -256), 256))),
                    (this.lY = ct.pointer.y - this.startY),
                    (this.lY = Math.floor(Math.min(Math.max(this.lY, 0), 256))),
                    256 == Math.abs(this.lX))
                ) {
                    if (null != this.activeBlocks[0]) {
                        this.moved = !0;
                        var t = ((e = this.activeBlocks[0]).y + 128) / 256 - 1;
                        if (((o = (e.x + 64) / 256 - 1) + this.lX / 256 > 0 || o + this.lX / 256 < 7) && 0 == this.grid[t][o + this.lX / 256]) for (let t = 0; t < this.activeBlocks.length; t++) this.activeBlocks[t].position.x += this.lX;
                    }
                    this.startX = null;
                }
                if (256 == this.lY) {
                    if (null != this.activeBlocks[0]) {
                        this.moved = !0;
                        t = ((e = this.activeBlocks[0]).y + 128) / 256 - 1;
                        var e,
                            o = (e.x + 64) / 256 - 1;
                        if (t + this.lY / 256 > 0 && t + this.lY / 256 < 9 && (console.log(t + this.lY / 256), 0 == this.grid[t + this.lY / 256][o]))
                            for (let t = 0; t < this.activeBlocks.length; t++) this.activeBlocks[t].position.y += this.lY;
                    }
                    this.startY = null;
                }
            }
            if (ct.pointer.released[0] && ct.pixiApp.ticker.speed > 0 && !this.gameOver) {
                if (null != this.startX && Math.abs(this.lX) < 10 && !this.moved && null != this.activeBlocks[0]) {
                    for (let t = 0; t < this.activeBlocks.length; t++) 0 == t ? (this.activeBlocks[t].y -= 512) : (this.activeBlocks[t].y += 256);
                    this.activeBlocks.push(this.activeBlocks.shift()), this.selectedBlocks.push(this.selectedBlocks.shift());
                }
                (this.startX = null), (this.startY = null), (this.moved = !1);
            }
        },
        onLeave() {},
        onCreate() {
            ct.transition.circleIn(150, 3455230),
                ct.sound.spawn("bgm", { loop: !0, volume: 0.2 }),
                0 === ct.rooms.list["Game paused"].length && firstRun && (ct.rooms.append("How To", { isUi: !0 }), (ct.pixiApp.ticker.speed = 0), (firstRun = !1)),
                (this.startX = null),
                (this.startY = null),
                this.lX,
                this.lY,
                this.moved,
                this.rearranging,
                (this.gameOver = !1),
                (this.progressBar = ct.templates.copy("Progress", 1728, 616)),
                (this.progressBar.scale.x = 0),
                this.result,
                (this.level = 1),
                (this.countdown = 4),
                (this.dropTime = 1),
                (this.dropping = !1),
                (this.dropped = !1),
                (this.selectedBlocks = [0, 0, 0]),
                (this.activeBlocks = [null, null, null]),
                (this.grid = []),
                (this.gridBlocks = []),
                (this.preview = [null, null, null]);
            for (let t = 0; t < 9; t++) {
                this.grid.push([0]);
                for (let e = 0; e < 6; e++) this.grid[t][e] = 0;
            }
            for (let t = 0; t < 9; t++) {
                this.gridBlocks.push([null]);
                for (let e = 0; e < 6; e++) this.gridBlocks[t][e] = null;
            }
            (this.scoreLabel = new PIXI.Text("" + score, ct.styles.get("ScoreLabel"))),
                this.addChild(this.scoreLabel),
                (this.scoreLabel.x = 1690),
                (this.scoreLabel.y = 260),
                (this.scoreLabel.depth = 100),
                (this.countdownLabel = new PIXI.Text("Get Ready!", ct.styles.get("CenterLabel"))),
                this.addChild(this.countdownLabel),
                (this.countdownLabel.x = 350),
                (this.countdownLabel.y = 900),
                (this.countdownLabel.depth = 100),
                (this.levelLabel = new PIXI.Text("Level " + this.level, ct.styles.get("LevelLabel"))),
                this.addChild(this.levelLabel),
                (this.levelLabel.x = 1690),
                (this.levelLabel.y = 560),
                (this.levelLabel.depth = 100),
                (this.timer1 = 3);
        },
        isUi: !1,
        follow: !1,
        extends: {},
    }),
    (ct.rooms.templates["Game paused"] = {
        name: "Game paused",
        group: "ungrouped",
        width: 1600,
        height: 2400,
        objects: JSON.parse(
            '[{"x":64,"y":0,"opacity":0.5,"tint":0,"scale":{"x":0.96,"y":0.97297297},"rotation":0,"exts":{},"customProperties":{},"template":"BG"},{"x":1730,"y":1830,"opacity":1,"tint":16777215,"scale":{"x":1.1,"y":1.1},"rotation":0,"exts":{},"customProperties":{},"template":"btnResume"},{"x":833,"y":1200,"opacity":1,"tint":16777215,"scale":{"x":2.18123667,"y":2.26438826},"rotation":0,"exts":{},"customProperties":{},"template":"NewGame"},{"x":833,"y":950,"opacity":1,"tint":16777215,"scale":{"x":2.18123667,"y":2.26438826},"rotation":0,"exts":{},"customProperties":{},"template":"btnContinue2"},{"x":833,"y":1450,"opacity":1,"tint":16777215,"scale":{"x":2.18123667,"y":2.26438826},"rotation":0,"exts":{},"customProperties":{},"template":"BackToMenu"}]'
        ),
        bgs: JSON.parse("[]"),
        tiles: JSON.parse("[]"),
        backgroundColor: "#000000",
        onStep() {},
        onDraw() {},
        onLeave() {},
        onCreate() {
            (this.alpha = 0), this.cont, ct.tween.add({ obj: this, fields: { alpha: 1 }, duration: 100, silent: !0, useUiDelta: !0 });
        },
        isUi: !1,
        follow: !1,
        extends: {},
    }),
    (ct.rooms.templates["Game over"] = {
        name: "Game over",
        group: "ungrouped",
        width: 2400,
        height: 2400,
        objects: JSON.parse(
            '[{"x":0,"y":0,"opacity":0.22,"tint":16777215,"scale":{"x":1.52,"y":1.02702703},"rotation":0,"exts":{},"customProperties":{},"template":"BG"},{"x":176.25282782,"y":630.63972083,"opacity":1,"tint":16777215,"scale":{"x":1.87391695,"y":1.87391695},"rotation":0,"exts":{},"customProperties":{},"template":"Scorebox_with_elements_for_reference"},{"x":897.0824738,"y":246.27984344,"opacity":1,"tint":16777215,"scale":{"x":0.41276408,"y":0.41276408},"rotation":0,"exts":{},"customProperties":{},"template":"Logolized_Combi_stack_blocks"},{"x":694.74432756,"y":820.9096175,"opacity":1,"tint":16777215,"scale":{"x":1.18797018,"y":1.18797018},"rotation":0,"exts":{},"customProperties":{},"template":"Text_gameover"},{"x":1101.40600552,"y":2216.47382904,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Button_share"},{"x":1354.72883606,"y":2216.47382904,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"btnHome"},{"x":1228.37356757,"y":1835.98095071,"opacity":1,"tint":16777215,"scale":{"x":1.6375266499999999,"y":1.65},"rotation":0,"exts":{},"customProperties":{},"template":"StackAgain"},{"x":1234.10491085,"y":2046.49125743,"opacity":1,"tint":16777215,"scale":{"x":1.6375266499999999,"y":1.43820225},"rotation":0,"exts":{},"customProperties":{},"template":"Shop_Now_button"}]'
        ),
        bgs: JSON.parse("[]"),
        tiles: JSON.parse("[]"),
        backgroundColor: "#000000",
        onStep() {},
        onDraw() {},
        onLeave() {},
        onCreate() {
            (this.label = new PIXI.MultiStyleText("Total Score\n<sc>" + score + "</sc>", { default: ct.styles.get("MainLabel"), sc: { fontSize: "300px" } })),
                this.addChild(this.label),
                (this.label.x = 820),
                (this.label.y = 1100),
                (this.label.depth = 100);
        },
        isUi: !1,
        follow: !1,
        extends: {},
    }),
    (ct.rooms.templates["How To"] = {
        name: "How To",
        group: "ungrouped",
        width: 2400,
        height: 2400,
        objects: JSON.parse(
            '[{"x":1895.49147853,"y":266.87385787,"opacity":1,"tint":16777215,"scale":{"x":1.97567737,"y":1.97567737},"rotation":0,"exts":{},"customProperties":{},"template":"X"},{"x":1204.46679688,"y":1346.1055345,"opacity":1,"tint":16777215,"scale":{"x":2.48616536,"y":2.80853501},"rotation":0,"exts":{},"customProperties":{},"template":"CombiStackHowTo"}]'
        ),
        bgs: JSON.parse('[{"texture":"Holder","depth":0,"exts":{"movementX":0,"movementY":0,"parallaxX":1,"parallaxY":1,"repeat":"no-repeat","scaleX":2,"scaleY":2,"shiftX":0,"shiftY":0}}]'),
        tiles: JSON.parse("[]"),
        backgroundColor: "#000000",
        onStep() {},
        onDraw() {},
        onLeave() {},
        onCreate() {
            (this.alpha = 0), ct.tween.add({ obj: this, fields: { alpha: 1 }, duration: 100, silent: !0, useUiDelta: !0 });
        },
        isUi: !1,
        follow: !1,
        extends: {},
    }),
    (ct.rooms.templates.CTTRANSITIONEMPTYROOM = { name: "CTTRANSITIONEMPTYROOM", width: 1024, height: 1024, objects: [], bgs: [], tiles: [], onStep() {}, onDraw() {}, onLeave() {}, onCreate() {} }),
    (ct.styles = { types: {}, new: (t, e) => ((ct.styles.types[t] = e), e), get: (t, e) => (!0 === e ? ct.u.ext({}, ct.styles.types[t]) : e ? ct.u.ext(ct.u.ext({}, ct.styles.types[t]), e) : ct.styles.types[t]) }),
    ct.styles.new("MainLabel", {
        fontFamily: '"CTPROJFONTwonderbar.regular", "wonderbar.regular", sans-serif',
        fontSize: 135,
        fontStyle: "normal",
        fontWeight: "400",
        align: "center",
        lineJoin: "round",
        lineHeight: 182.25,
        fill: "#FFFFFF",
        strokeThickness: 1,
        stroke: "#000000",
    }),
    ct.styles.new("CenterLabel", {
        fontFamily: '"CTPROJFONTBalooChettan-Regular", "BalooChettan-Regular", sans-serif',
        fontSize: 200,
        fontStyle: "normal",
        fontWeight: "400",
        align: "center",
        lineJoin: "round",
        lineHeight: 60,
        fill: "#FFFFFF",
        strokeThickness: 10,
        stroke: "#8069BF",
    }),
    ct.styles.new("ScoreLabel", { fontFamily: '"CTPROJFONTBalooChettan-Regular", "BalooChettan-Regular", sans-serif', fontSize: 75, fontStyle: "normal", fontWeight: "400", lineJoin: "round", lineHeight: 101.25, fill: "#00A2FF" }),
    ct.styles.new("LevelLabel", {
        fontFamily: '"CTPROJFONTwonderbar.regular", "wonderbar.regular", sans-serif',
        fontSize: 50,
        fontStyle: "normal",
        fontWeight: "400",
        align: "center",
        lineJoin: "round",
        lineHeight: 67.5,
        fill: "#FFFFFF",
        strokeThickness: 1,
        stroke: "#000000",
    }),
    ct.styles.new("Gameover Score", {
        fontFamily: '"CTPROJFONTwonderbar.regular", "wonderbar.regular", sans-serif',
        fontSize: 430,
        fontStyle: "normal",
        fontWeight: "500",
        align: "center",
        lineJoin: "round",
        lineHeight: 580.5,
        wordWrap: !0,
        wordWrapWidth: 100,
        fill: "#FFFFFF",
    });
const Copy = (function () {
    const t = Symbol("texture"),
        e = Symbol("zeroDirection"),
        o = Symbol("hspeed"),
        i = Symbol("vspeed");
    let n = 0;
    class s extends PIXI.AnimatedSprite {
        constructor(s, a, r, c, l) {
            var d;
            if (((l = l || ct.room), s)) {
                if (!(s in ct.templates.templates)) throw new Error(`[ct.templates] An attempt to create a copy of a non-existent template \`${s}\` detected. A typo?`);
                if ((d = ct.templates.templates[s]).texture && "-1" !== d.texture) {
                    const e = ct.res.getTexture(d.texture);
                    super(e), (this[t] = d.texture), (this.anchor.x = e[0].defaultAnchor.x), (this.anchor.y = e[0].defaultAnchor.y);
                } else {
                    const t = new PIXI.Rectangle(0, 0, d.width || 1, d.height || 1);
                    super([new PIXI.Texture(PIXI.Texture.EMPTY, t)]), (this.anchor.x = d.anchorX || 0), (this.anchor.y = d.anchorY || 0);
                }
                (this.template = s),
                    (this.parent = l),
                    (this.blendMode = d.blendMode || PIXI.BLEND_MODES.NORMAL),
                    (this.loop = d.loopAnimation),
                    (this.animationSpeed = d.animationFPS / 60),
                    !1 === d.visible && (this.visible = !1),
                    d.playAnimationOnStart && this.play(),
                    d.extends && ct.u.ext(this, d.extends);
            } else super([PIXI.Texture.EMPTY]);
            return (
                (this[copyTypeSymbol] = !0),
                this.position.set(a || 0, r || 0),
                (this.xprev = this.xstart = this.x),
                (this.yprev = this.ystart = this.y),
                (this[o] = 0),
                (this[i] = 0),
                (this[e] = 0),
                (this.speed = this.direction = this.gravity = 0),
                (this.gravityDir = 90),
                (this.depth = 0),
                (this.timer1 = this.timer2 = this.timer3 = this.timer4 = this.timer5 = this.timer6 = 0),
                c && (ct.u.ext(this, c), c.scaleX && (this.scale.x = c.scaleX), c.scaleY && (this.scale.y = c.scaleY)),
                (this.uid = ++n),
                s &&
                    (ct.u.ext(this, { template: s, depth: d.depth, onStep: d.onStep, onDraw: d.onDraw, onCreate: d.onCreate, onDestroy: d.onDestroy, shape: ct.res.getTextureShape(d.texture || -1) }),
                    c && void 0 !== c.depth && (this.depth = c.depth),
                    ct.templates.list[s] ? ct.templates.list[s].push(this) : (ct.templates.list[s] = [this]),
                    this.onBeforeCreateModifier(),
                    ct.templates.templates[s].onCreate.apply(this)),
                this
            );
        }
        set tex(e) {
            if (this[t] === e) return e;
            var { playing: o } = this;
            return (this.textures = ct.res.getTexture(e)), (this[t] = e), (this.shape = ct.res.getTextureShape(e)), (this.anchor.x = this.textures[0].defaultAnchor.x), (this.anchor.y = this.textures[0].defaultAnchor.y), o && this.play(), e;
        }
        get tex() {
            return this[t];
        }
        get speed() {
            return Math.hypot(this.hspeed, this.vspeed);
        }
        set speed(t) {
            if (0 === t) return (this[e] = this.direction), void (this.hspeed = this.vspeed = 0);
            if (0 === this.speed) {
                const n = this[e];
                return (this[o] = t * Math.cos((n * Math.PI) / 180)), void (this[i] = t * Math.sin((n * Math.PI) / 180));
            }
            var n = t / this.speed;
            (this.hspeed *= n), (this.vspeed *= n);
        }
        get hspeed() {
            return this[o];
        }
        set hspeed(t) {
            return 0 === this.vspeed && 0 === t && (this[e] = this.direction), (this[o] = t), t;
        }
        get vspeed() {
            return this[i];
        }
        set vspeed(t) {
            return 0 === this.hspeed && 0 === t && (this[e] = this.direction), (this[i] = t), t;
        }
        get direction() {
            return 0 === this.speed ? this[e] : ((180 * Math.atan2(this.vspeed, this.hspeed)) / Math.PI + 360) % 360;
        }
        set direction(t) {
            if (((this[e] = t), this.speed > 0)) {
                var o = this.speed;
                (this.hspeed = o * Math.cos((t * Math.PI) / 180)), (this.vspeed = o * Math.sin((t * Math.PI) / 180));
            }
            return t;
        }
        move() {
            this.gravity && ((this.hspeed += this.gravity * ct.delta * Math.cos((this.gravityDir * Math.PI) / 180)), (this.vspeed += this.gravity * ct.delta * Math.sin((this.gravityDir * Math.PI) / 180))),
                (this.x += this.hspeed * ct.delta),
                (this.y += this.vspeed * ct.delta);
        }
        addSpeed(t, e) {
            (this.hspeed += t * Math.cos((e * Math.PI) / 180)), (this.vspeed += t * Math.sin((e * Math.PI) / 180));
        }
        getRoom() {
            let t = this.parent;
            for (; !(t instanceof Room); ) t = t.parent;
            return t;
        }
        onBeforeCreateModifier() {}
    }
    return s;
})();
!(function (ct) {
    const t = function () {
        this.$chashes = ct.place.getHashes(this);
        for (const t of this.$chashes) t in ct.place.grid ? ct.place.grid[t].push(this) : (ct.place.grid[t] = [this]);
    };
    (ct.templates = {
        Copy: Copy,
        list: { BACKGROUND: [], TILEMAP: [] },
        templates: {},
        copyIntoRoom(e, o = 0, i = 0, n, s) {
            if (!(n && n instanceof Room)) throw new Error(`Attempt to spawn a copy of template ${e} inside an invalid room. Room's value provided: ${n}`);
            const a = new Copy(e, o, i, s);
            return n.addChild(a), ct.stack.push(a), t.apply(a), a;
        },
        copy: (t, e = 0, o = 0, i) => ct.templates.copyIntoRoom(t, e, o, ct.room, i),
        each(t) {
            for (const e of ct.stack) e instanceof Copy && t.apply(e, this);
        },
        withCopy(t, e) {
            e.apply(t, this);
        },
        withTemplate(t, e) {
            for (const o of ct.templates.list[t]) e.apply(o, this);
        },
        exists(t) {
            if (!(t in ct.templates.templates)) throw new Error(`[ct.templates] ct.templates.exists: There is no such template ${t}.`);
            return ct.templates.list[t].length > 0;
        },
        valid: (t) => (t instanceof Copy ? !t.kill : t instanceof PIXI.DisplayObject ? Boolean(t.position) : Boolean(t)),
        isCopy: (t) => t instanceof Copy,
    }),
        (ct.templates.templates.Main_Title_page = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Main_Title_page",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Main_Title_page = []),
        (ct.templates.templates.Logolized_Combi_stack_blocks = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Logolized_Combi_stack_blocks",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Logolized_Combi_stack_blocks = []),
        (ct.templates.templates.Button_2_purple = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_2_purple",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Button_2_purple = []),
        (ct.templates.templates.Close = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Close",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Close = []),
        (ct.templates.templates.HowTo = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "HowTo",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        ct.rooms.append("How To"), ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.2, y: 2.1 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.04690832, y: 1.907707 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.HowTo = []),
        (ct.templates.templates.StartGame = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "StartGame",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        ct.transition.circleOut(750, 3455230).then(() => ct.rooms.switch("Game")), ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.2, y: 2.1 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.04690832, y: 1.907707 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.StartGame = []),
        (ct.templates.templates.How_to_play = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "How_to_play",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.How_to_play = []),
        (ct.templates.templates.BG_box = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "BG_box",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.BG_box = []),
        (ct.templates.templates.btnPause = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_pause",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        0 === ct.rooms.list["Game paused"].length && (ct.rooms.append("Game paused", { isUi: !0 }), (ct.pixiApp.ticker.speed = 0)), ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.1, y: 1.1 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1, y: 1 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnPause = []),
        (ct.templates.templates.btnMusicOn = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_music",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed || ((this.pressed = !0), (this.kill = !0), ct.templates.copy("btnMusicOff", this.x, this.y), ct.sound.pause("bgm"), (paused = !0)), ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.1, y: 1.1 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1, y: 1 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnMusicOn = []),
        (ct.templates.templates.btnMechanics1 = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_mechanics",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        0 === ct.rooms.list["Game paused"].length && (ct.rooms.append("How To", { isUi: !0 }), (ct.pixiApp.ticker.speed = 0)), ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.1, y: 1.1 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1, y: 1 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnMechanics1 = []),
        (ct.templates.templates.Combi_FS_choco = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Combi_FS_choco",
            onStep: function () {
                this.clockwise ? ((this.angle += 0.2), this.angle >= 10 && (this.clockwise = !1)) : this.clockwise || ((this.angle -= 0.2), this.angle <= -10 && (this.clockwise = !0));
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                this.clockwise;
            },
            extends: {},
        }),
        (ct.templates.list.Combi_FS_choco = []),
        (ct.templates.templates.Combi_FS_Cow = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Combi_FS_Cow",
            onStep: function () {},
            onDraw: function () {
                this.clockwise ? ((this.angle += 0.5), this.angle >= 15 && (this.clockwise = !1)) : this.clockwise || ((this.angle -= 0.5), this.angle <= -15 && (this.clockwise = !0));
            },
            onDestroy: function () {},
            onCreate: function () {
                this.clockwise = !0;
            },
            extends: {},
        }),
        (ct.templates.list.Combi_FS_Cow = []),
        (ct.templates.templates.Reveal_yellow_rectangle = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Reveal_yellow_rectangle",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Reveal_yellow_rectangle = []),
        (ct.templates.templates.BCrack = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Box",
            texture: "Reveal_crackers",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.BCrack = []),
        (ct.templates.templates.BFill = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Box",
            texture: "Reveal_fillings",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.BFill = []),
        (ct.templates.templates.BWafer = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Box",
            texture: "Reveal_wafers",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.BWafer = []),
        (ct.templates.templates.Score = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Score",
            texture: "Score",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Score = []),
        (ct.templates.templates.Score_box = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Score",
            texture: "Score_box",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Score_box = []),
        (ct.templates.templates.btnContinue = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_continue_change_color",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 100, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 100, useUiDelta: !0 }), ct.rooms.remove(this.getRoom());
                            })),
                            ct.sound.spawn("click");
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnContinue = []),
        (ct.templates.templates.btnClose = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_close",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 1e3, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 1e3, useUiDelta: !0 }), ct.rooms.remove(this.getRoom()), ct.transition.circleOut(750).then(() => ct.rooms.switch("Main"));
                            }));
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnClose = []),
        (ct.templates.templates.btnNew = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_New_game",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 1e3, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 1e3, useUiDelta: !0 }), ct.rooms.remove(this.getRoom()), ct.transition.circleOut(750).then(() => ct.rooms.switch("Game"));
                            })),
                            ct.sound.spawn("click"),
                            ct.sound.stop("bgm");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.9, y: 2 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.18123667, y: 2.26438826 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnNew = []),
        (ct.templates.templates.BG_vector_element_1 = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "BG_vector_element_1",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.BG_vector_element_1 = []),
        (ct.templates.templates.BG_vector_element_2 = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "BG_vector_element_2",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.BG_vector_element_2 = []),
        (ct.templates.templates.Button_1_blue = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_1_blue",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0), this.on("pointertap", () => {});
            },
            extends: {},
        }),
        (ct.templates.list.Button_1_blue = []),
        (ct.templates.templates.Button_3_pink = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_3_pink",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Button_3_pink = []),
        (ct.templates.templates.GCombi = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Box",
            texture: "Reveal_combi",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.GCombi = []),
        (ct.templates.templates.BLACK = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Placeholder",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.BLACK = []),
        (ct.templates.templates.Scorebox_with_elements_for_reference = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Scorebox_with_elements_for_reference",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Scorebox_with_elements_for_reference = []),
        (ct.templates.templates.Text_gameover = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Text_gameover",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Text_gameover = []),
        (ct.templates.templates.Button_Stack_Again = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Button_Stack_Again",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 1e3, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 1e3, useUiDelta: !0 }), ct.rooms.remove(this.getRoom()), ct.transition.circleOut(750).then(() => ct.rooms.switch("Game"));
                            })),
                            ct.sound.spawn("click"),
                            ct.sound.stop("bgm"),
                            (score = 0);
                    });
            },
            extends: {},
        }),
        (ct.templates.list.Button_Stack_Again = []),
        (ct.templates.templates.btnHome = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_home",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 100, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 100, useUiDelta: !0 }), ct.rooms.remove(this.getRoom()), ct.transition.circleOut(750, 8415679).then(() => ct.rooms.switch("Main"));
                            })),
                            ct.sound.spawn("click"),
                            ct.sound.stop("bgm");
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnHome = []),
        (ct.templates.templates.Button_share = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_share",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        window.open("https://www.facebook.com/sharer/sharer.php?u=https://epicghani.github.io/panoptik/CombiStackBlocks/index.html&img=https://epicghani.github.io/panoptik/CombiStackBlocks/apple-touch-icon-1024x1024.png");
                    });
            },
            extends: {},
        }),
        (ct.templates.list.Button_share = []),
        (ct.templates.templates.X = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "X",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 100, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 100, useUiDelta: !0 }), ct.rooms.remove(this.getRoom());
                            }),
                            ct.templates.copy("btnMechanics1", 1730, 2220)),
                            ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.1, y: 2.1 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.97567737, y: 1.97567737 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.X = []),
        (ct.templates.templates.Holder = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Holder",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Holder = []),
        (ct.templates.templates.blue = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Blocks",
            texture: "Block_blue_ctc",
            onStep: function () {},
            onDraw: function () {
                this.matched &&
                    ((this.angle += 10),
                    ct.tween.add({ obj: this.scale, fields: { x: 0, y: 0 }, duration: 300, silent: !0 }).then(() => {
                        (this.kill = !0), console.log("Matched"), RearrangeGrid(ct.room, 1);
                    }));
            },
            onDestroy: function () {},
            onCreate: function () {
                this.matched = !1;
            },
            extends: {},
        }),
        (ct.templates.list.blue = []),
        (ct.templates.templates.green = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Blocks",
            texture: "Block_green_combi",
            onStep: function () {},
            onDraw: function () {
                this.matched &&
                    ((this.angle += 10),
                    ct.tween.add({ obj: this.scale, fields: { x: 0, y: 0 }, duration: 300, silent: !0 }).then(() => {
                        (this.kill = !0), console.log("Matched"), RearrangeGrid(ct.room, 2);
                    }));
            },
            onDestroy: function () {},
            onCreate: function () {
                this.matched = !1;
            },
            extends: {},
        }),
        (ct.templates.list.green = []),
        (ct.templates.templates.yellow = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Blocks",
            texture: "Block_yellow_ctcheese",
            onStep: function () {},
            onDraw: function () {
                this.matched &&
                    ((this.angle += 10),
                    ct.tween.add({ obj: this.scale, fields: { x: 0, y: 0 }, duration: 300, silent: !0 }).then(() => {
                        (this.kill = !0), console.log("Matched"), RearrangeGrid(ct.room, 3);
                    }));
            },
            onDestroy: function () {},
            onCreate: function () {
                this.matched = !1;
            },
            extends: {},
        }),
        (ct.templates.list.yellow = []),
        (ct.templates.templates.YCrack = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Box",
            texture: "Reveal_cracker",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.YCrack = []),
        (ct.templates.templates.YFill = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Box",
            texture: "Reveal_filling",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.YFill = []),
        (ct.templates.templates.YWafer = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Box",
            texture: "Reveal_wafer",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.YWafer = []),
        (ct.templates.templates.Star = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Text & BG",
            texture: "Star",
            onStep: function () {},
            onDraw: function () {
                levelup ? ((this.wiggleTime += 0.2 * ct.delta), (this.angle = 15 * Math.sin(this.wiggleTime))) : (this.angle = 0);
            },
            onDestroy: function () {},
            onCreate: function () {
                this.wiggleTime = 0;
            },
            extends: {},
        }),
        (ct.templates.list.Star = []),
        (ct.templates.templates.BG = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "ungrouped",
            texture: "BG",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.BG = []),
        (ct.templates.templates.btnMusicOff = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_music_change_color",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed || ((this.pressed = !0), (this.kill = !0), ct.templates.copy("btnMusicOn", this.x, this.y), ct.sound.resume("bgm"), (paused = !1));
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.1, y: 1.1 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1, y: 1 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnMusicOff = []),
        (ct.templates.templates.btnResume = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_pause_change_color",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 100, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 100, useUiDelta: !0 }), ct.rooms.remove(this.getRoom());
                            })),
                            ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.2, y: 1.2 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.1, y: 1.1 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnResume = []),
        (ct.templates.templates.btnMechanics2 = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_mechanics_change_color",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed || ((this.pressed = !0), (this.kill = !0), ct.templates.copy("btnMechanics1", this.x, this.y)), ct.sound.spawn("click");
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnMechanics2 = []),
        (ct.templates.templates.btnCont1 = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "btnCont",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 100, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 100, useUiDelta: !0 }), ct.rooms.remove(this.getRoom());
                            })),
                            ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.9, y: 2 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.18123667, y: 2.26438826 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnCont1 = []),
        (ct.templates.templates.NewGame = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "NewGame",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 100, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 100, useUiDelta: !0 }), ct.rooms.remove(this.getRoom()), ct.transition.circleOut(750, 3455230).then(() => ct.rooms.switch("Game"));
                            })),
                            ct.sound.spawn("click"),
                            ct.sound.stop("bgm"),
                            (score = 0);
                    });
            },
            extends: {},
        }),
        (ct.templates.list.NewGame = []),
        (ct.templates.templates.StackAgain = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "StackAgain",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 1e3, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 1e3, useUiDelta: !0 }), ct.rooms.remove(this.getRoom()), ct.transition.circleOut(750, 3455230).then(() => ct.rooms.switch("Game"));
                            })),
                            ct.sound.spawn("click"),
                            ct.sound.stop("bgm"),
                            (score = 0);
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.8, y: 1.8 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.6375266499999999, y: 1.65 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.StackAgain = []),
        (ct.templates.templates.btnHome2 = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "Buttons",
            texture: "Button_home_change_color",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1, y: 1 }, duration: 200, silent: !0 }), (this.kill = !0), ct.templates.copy("btnHome", this.x, this.y);
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnHome2 = []),
        (ct.templates.templates.btnContinue2 = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "ungrouped",
            texture: "btnContinue2",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 100, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 100, useUiDelta: !0 }), ct.rooms.remove(this.getRoom());
                            })),
                            ct.sound.spawn("click");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.2, y: 2.4 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.18123667, y: 2.26438826 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnContinue2 = []),
        (ct.templates.templates.btnContinue1 = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "ungrouped",
            texture: "btnContinue1",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 2.18123667, y: 2.26438826 }, duration: 200, silent: !0 }), (this.kill = !0), ct.templates.copy("btnContinue2", this.x, this.y);
                    });
            },
            extends: {},
        }),
        (ct.templates.list.btnContinue1 = []),
        (ct.templates.templates.CombiStackHowTo = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "ungrouped",
            texture: "CombiStackHowTo",
            onStep: function () {
                this.move();
            },
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.animationSpeed = 0.2), this.play();
            },
            extends: {},
        }),
        (ct.templates.list.CombiStackHowTo = []),
        (ct.templates.templates.ProgressHolder = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "ungrouped",
            texture: "ProgressHolder",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.ProgressHolder = []),
        (ct.templates.templates.Progress = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "ungrouped",
            texture: "Progress",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {},
            extends: {},
        }),
        (ct.templates.list.Progress = []),
        (ct.templates.templates.Shop_Now_button = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "ungrouped",
            texture: "Shop_Now_button",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        window.open("https://bit.ly/3jRi5zC");
                    }),
                    (this.interactive = !0),
                    this.on("pointerover", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.8, y: 1.6 }, duration: 200, silent: !0 });
                    }),
                    (this.interactive = !0),
                    this.on("pointerout", () => {
                        ct.tween.add({ obj: this.scale, fields: { x: 1.6375266499999999, y: 1.43820225 }, duration: 200, silent: !0 });
                    });
            },
            extends: {},
        }),
        (ct.templates.list.Shop_Now_button = []),
        (ct.templates.templates.BackToMenu = {
            depth: 0,
            blendMode: PIXI.BLEND_MODES.NORMAL,
            animationFPS: 30,
            playAnimationOnStart: !1,
            loopAnimation: !0,
            visible: !0,
            group: "ungrouped",
            texture: "BackToMenu",
            onStep: function () {},
            onDraw: function () {},
            onDestroy: function () {},
            onCreate: function () {
                (this.interactive = !0),
                    this.on("pointertap", () => {
                        this.pressed ||
                            ((this.pressed = !0),
                            ct.tween.add({ obj: this.getRoom(), fields: { alpha: 0 }, duration: 100, useUiDelta: !0 }).then(() => {
                                ct.tween.add({ obj: ct.pixiApp.ticker, fields: { speed: 1 }, duration: 100, useUiDelta: !0 }), ct.rooms.remove(this.getRoom()), ct.transition.circleOut(750, 8415679).then(() => ct.rooms.switch("Main"));
                            })),
                            ct.sound.spawn("click"),
                            ct.sound.stop("bgm");
                    });
            },
            extends: {},
        }),
        (ct.templates.list.BackToMenu = []),
        (function () {
            const t = () => {};
            (ct.templates.templates.CTTRANSITION_FADE = {
                onStep() {},
                onDraw() {},
                onDestroy() {
                    ct.rooms.remove(this.room);
                },
                onCreate() {
                    (this.tex = -1),
                        (this.overlay = new PIXI.Graphics()),
                        this.overlay.beginFill(this.color),
                        this.overlay.drawRect(0, 0, ct.camera.width + 1, ct.camera.height + 1),
                        this.overlay.endFill(),
                        (this.overlay.alpha = this.in ? 1 : 0),
                        this.addChild(this.overlay),
                        (this.promise = ct.tween.add({ obj: this.overlay, fields: { alpha: this.in ? 0 : 1 }, duration: this.duration, silent: !0 }).then(() => {
                            this.kill = !0;
                        }));
                },
            }),
                (ct.templates.templates.CTTRANSITION_SCALE = {
                    onStep() {},
                    onDraw() {},
                    onDestroy() {
                        ct.rooms.remove(this.room);
                    },
                    onCreate() {
                        (this.tex = -1),
                            (this.overlay = new PIXI.Graphics()),
                            this.overlay.beginFill(this.color),
                            this.overlay.drawRect(0, 0, ct.camera.width + 1, ct.camera.height + 1),
                            this.overlay.endFill(),
                            (this.overlay.alpha = this.in ? 1 : 0),
                            this.addChild(this.overlay);
                        var e = ct.camera.scale.x,
                            o = ct.camera.scale.y,
                            i = this.in ? e : e * this.scaling,
                            n = this.in ? o : o * this.scaling,
                            s = this.in ? e * this.scaling : e,
                            a = this.in ? o * this.scaling : o;
                        (ct.camera.scale.x = s),
                            (ct.camera.scale.y = a),
                            (this.promise = ct.tween.add({ obj: ct.camera.scale, fields: { x: i, y: n }, duration: this.duration, silent: !0 }).then(() => {
                                (ct.camera.scale.x = e), (ct.camera.scale.y = o), (this.kill = !0);
                            })),
                            ct.tween.add({ obj: this.overlay, fields: { alpha: this.in ? 0 : 1 }, duration: this.duration, silent: !0 }).catch(t);
                    },
                }),
                (ct.templates.templates.CTTRANSITION_SLIDE = {
                    onStep() {},
                    onDraw() {},
                    onDestroy() {
                        ct.rooms.remove(this.room);
                    },
                    onCreate() {
                        (this.tex = -1),
                            (this.overlay = new PIXI.Graphics()),
                            this.overlay.beginFill(this.color),
                            this.overlay.drawRect(0, 0, ct.camera.width + 1, ct.camera.height + 1),
                            this.overlay.endFill(),
                            "left" === this.endAt || "right" === this.endAt
                                ? ((this.scale.x = this.in ? 1 : 0),
                                  (this.promise = ct.tween.add({ obj: this.scale, fields: { x: this.in ? 0 : 1 }, duration: this.duration, curve: ct.tween.easeOutQuart, silent: !0 }).then(() => {
                                      this.kill = !0;
                                  })))
                                : ((this.scale.y = this.in ? 1 : 0),
                                  (this.promise = ct.tween.add({ obj: this.scale, fields: { y: this.in ? 0 : 1 }, duration: this.duration, curve: ct.tween.easeOutQuart, silent: !0 }).then(() => {
                                      this.kill = !0;
                                  }))),
                            this.in || "left" !== this.endAt || ((this.x = ct.camera.width + 1), ct.tween.add({ obj: this, fields: { x: 0 }, duration: this.duration, curve: ct.tween.easeOutQuart, silent: !0 }).catch(t)),
                            this.in || "top" !== this.endAt || ((this.y = ct.camera.height + 1), ct.tween.add({ obj: this, fields: { y: 0 }, duration: this.duration, curve: ct.tween.easeOutQuart, silent: !0 }).catch(t)),
                            this.in && "right" === this.endAt && ct.tween.add({ obj: this, fields: { x: ct.camera.width + 1 }, duration: this.duration, curve: ct.tween.easeOutQuart, silent: !0 }).catch(t),
                            this.in && "bottom" === this.endAt && ct.tween.add({ obj: this, fields: { y: ct.camera.height + 1 }, duration: this.duration, curve: ct.tween.easeOutQuart, silent: !0 }).catch(t),
                            this.addChild(this.overlay);
                    },
                }),
                (ct.templates.templates.CTTRANSITION_CIRCLE = {
                    onStep() {},
                    onDraw() {},
                    onDestroy() {
                        ct.rooms.remove(this.room);
                    },
                    onCreate() {
                        (this.tex = -1),
                            (this.x = (ct.camera.width + 1) / 2),
                            (this.y = (ct.camera.height + 1) / 2),
                            (this.overlay = new PIXI.Graphics()),
                            this.overlay.beginFill(this.color),
                            this.overlay.drawCircle(0, 0, ct.u.pdc(0, 0, (ct.camera.width + 1) / 2, (ct.camera.height + 1) / 2)),
                            this.overlay.endFill(),
                            this.addChild(this.overlay),
                            (this.scale.x = this.scale.y = this.in ? 0 : 1),
                            (this.promise = ct.tween.add({ obj: this.scale, fields: { x: this.in ? 1 : 0, y: this.in ? 1 : 0 }, duration: this.duration, silent: !0 }).then(() => {
                                this.kill = !0;
                            }));
                    },
                });
        })(),
        (ct.templates.templates.VKEY = {
            onStep: function () {
                var t = !1,
                    e = !1;
                if ((ct.mouse && ct.mouse.hoversUi(this) && ((e = !0), ct.mouse.down && (t = !0)), ct.touch))
                    for (const o of ct.touch.events)
                        if (ct.touch.collideUi(this, o.id)) {
                            t = e = !0;
                            break;
                        }
                ct.pointer && ct.pointer.hoversUi(this) && ((e = !0), ct.pointer.collidesUi(this) && (t = !0)),
                    t
                        ? ((this.tex = this.opts.texActive || this.opts.texNormal), (ct.inputs.registry["vkeys." + this.opts.key] = 1))
                        : ((ct.inputs.registry["vkeys." + this.opts.key] = 0), (this.tex = (e && this.opts.texHover) || this.opts.texNormal));
            },
            onDraw: function () {
                (this.x = "function" == typeof this.opts.x ? this.opts.x() : this.opts.x), (this.y = "function" == typeof this.opts.y ? this.opts.y() : this.opts.y);
            },
            onDestroy: function () {},
            onCreate: function () {
                (this.tex = this.opts.texNormal), (this.depth = this.opts.depth);
            },
        }),
        (ct.templates.templates.VJOYSTICK = {
            onCreate: function () {
                (this.tex = this.opts.tex), (this.depth = this.opts.depth), (this.down = !1), (this.trackball = new PIXI.Sprite(ct.res.getTexture(this.opts.trackballTex, 0))), this.addChild(this.trackball);
            },
            onStep: function () {
                var t = 0,
                    e = 0;
                if ((ct.mouse && (ct.mouse.hoversUi(this) && ct.mouse.down && (this.down = !0), ct.mouse.released && (this.down = !1), this.down && ((t = ct.mouse.xui - this.x), (e = ct.mouse.yui - this.y))), ct.touch)) {
                    if (!this.touchId)
                        for (const t of ct.touch.events)
                            if (ct.touch.collideUi(this, t.id)) {
                                (this.down = !0), (this.touchId = t.id);
                                break;
                            }
                    var o = ct.touch.getById(this.touchId);
                    o ? ((t = o.xui - this.x), (e = o.yui - this.y)) : ((this.touchId = !1), (this.down = !1));
                }
                if (ct.pointer) {
                    if ((this.trackedPointer && !ct.pointer.down.includes(this.trackedPointer) && (this.trackedPointer = void 0), !this.trackedPointer)) {
                        const t = ct.pointer.collidesUi(this);
                        t && ((this.down = !0), (this.trackedPointer = t));
                    }
                    this.trackedPointer ? ((t = this.trackedPointer.xui - this.x), (e = this.trackedPointer.yui - this.y)) : ((this.touchId = !1), (this.down = !1));
                }
                var i = this.shape.r || this.shape.right || 64;
                if (this.down) {
                    (t /= i), (e /= i);
                    var n = Math.hypot(t, e);
                    n > 1 && ((t /= n), (e /= n)), (ct.inputs.registry["vkeys." + this.opts.key + "X"] = t), (ct.inputs.registry["vkeys." + this.opts.key + "Y"] = e);
                } else (ct.inputs.registry["vkeys." + this.opts.key + "X"] = 0), (ct.inputs.registry["vkeys." + this.opts.key + "Y"] = 0);
                (this.trackball.x = t * i), (this.trackball.y = e * i);
            },
            onDraw: function () {
                (this.x = "function" == typeof this.opts.x ? this.opts.x() : this.opts.x), (this.y = "function" == typeof this.opts.y ? this.opts.y() : this.opts.y);
            },
            onDestroy: function () {},
        }),
        (ct.templates.beforeStep = function () {}),
        (ct.templates.afterStep = function () {}),
        (ct.templates.beforeDraw = function () {
            !1;
        }),
        (ct.templates.afterDraw = function () {
            if ((this.transform && this.transform._localID !== this.transform._currentLocalID) || this.x !== this.xprev || this.y !== this.yprev) {
                delete this._shape;
                const t = this.$chashes || [];
                this.$chashes = ct.place.getHashes(this);
                for (const e of t) -1 === this.$chashes.indexOf(e) && ct.place.grid[e].splice(ct.place.grid[e].indexOf(this), 1);
                for (const e of this.$chashes) -1 === t.indexOf(e) && (e in ct.place.grid ? ct.place.grid[e].push(this) : (ct.place.grid[e] = [this]));
            }
        }),
        (ct.templates.onDestroy = function () {
            if (this.$chashes) for (const t of this.$chashes) ct.place.grid[t].splice(ct.place.grid[t].indexOf(this), 1);
        });
})(ct);
class Background extends PIXI.TilingSprite {
    constructor(t, e = 0, o = 0, i = {}) {
        var n = ct.camera.width,
            s = ct.camera.height;
        const a = t instanceof PIXI.Texture ? t : ct.res.getTexture(t, e || 0);
        ("no-repeat" !== i.repeat && "repeat-x" !== i.repeat) || (s = a.height * (i.scaleY || 1)),
            ("no-repeat" !== i.repeat && "repeat-y" !== i.repeat) || (n = a.width * (i.scaleX || 1)),
            super(a, n, s),
            ct.backgrounds.list[t] || (ct.backgrounds.list[t] = []),
            ct.backgrounds.list[t].push(this),
            ct.templates.list.BACKGROUND.push(this),
            ct.stack.push(this),
            (this.anchor.x = this.anchor.y = 0),
            (this.depth = o),
            (this.shiftX = this.shiftY = this.movementX = this.movementY = 0),
            (this.parallaxX = this.parallaxY = 1),
            i && ct.u.extend(this, i),
            this.scaleX && (this.tileScale.x = Number(this.scaleX)),
            this.scaleY && (this.tileScale.y = Number(this.scaleY)),
            this.reposition();
    }
    onStep() {
        (this.shiftX += ct.delta * this.movementX), (this.shiftY += ct.delta * this.movementY);
    }
    reposition() {
        const t = this.isUi ? { x: 0, y: 0, width: ct.camera.width, height: ct.camera.height } : ct.camera.getBoundingBox(),
            e = ct.camera.x - ct.camera.width / 2,
            o = ct.camera.y - ct.camera.height / 2;
        "repeat-x" !== this.repeat && "no-repeat" !== this.repeat
            ? ((this.y = t.y), (this.tilePosition.y = -this.y - o * (this.parallaxY - 1) + this.shiftY), (this.height = t.height + 1))
            : (this.y = this.shiftY + t.y * (this.parallaxY - 1)),
            "repeat-y" !== this.repeat && "no-repeat" !== this.repeat
                ? ((this.x = t.x), (this.tilePosition.x = -this.x - e * (this.parallaxX - 1) + this.shiftX), (this.width = t.width + 1))
                : (this.x = this.shiftX + t.x * (this.parallaxX - 1));
    }
    onDraw() {
        this.reposition();
    }
    static onCreate() {}
    static onDestroy() {}
    get isUi() {
        return !!this.parent && Boolean(this.parent.isUi);
    }
}
(ct.backgrounds = {
    Background: Background,
    list: {},
    add(t, e = 0, o = 0, i = ct.room) {
        if (!t) throw new Error("[ct.backgrounds] The texName argument is required.");
        const n = new Background(t, e, o);
        return i.addChild(n), n;
    },
}),
    (ct.templates.Background = Background);
class Tilemap extends PIXI.Container {
    constructor(t) {
        if ((super(), (this.pixiTiles = []), t)) {
            (this.depth = t.depth), (this.tiles = t.tiles.map((t) => ({ ...t }))), t.extends && Object.assign(this, t.extends);
            for (let e = 0, o = t.tiles.length; e < o; e++) {
                const o = t.tiles[e],
                    i = ct.res.getTexture(o.texture),
                    n = new PIXI.Sprite(i[o.frame]);
                (n.anchor.x = i[0].defaultAnchor.x),
                    (n.anchor.y = i[0].defaultAnchor.y),
                    (n.shape = i.shape),
                    n.scale.set(o.scale.x, o.scale.y),
                    (n.rotation = o.rotation),
                    (n.alpha = o.opacity),
                    (n.tint = o.tint),
                    (n.x = o.x),
                    (n.y = o.y),
                    this.addChild(n),
                    this.pixiTiles.push(n),
                    (this.tiles[e].sprite = n);
            }
        } else this.tiles = [];
        ct.templates.list.TILEMAP.push(this);
    }
    addTile(t, e, o, i = 0) {
        if (this.cached) throw new Error("[ct.tiles] Adding tiles to cached tilemaps is forbidden. Create a new tilemap, or add tiles before caching the tilemap.");
        const n = ct.res.getTexture(t, i),
            s = new PIXI.Sprite(n);
        return (s.x = e), (s.y = o), (s.shape = n.shape), this.tiles.push({ texture: t, frame: i, x: e, y: o, width: s.width, height: s.height, sprite: s }), this.addChild(s), this.pixiTiles.push(s), s;
    }
    cache(t = 1024) {
        if (this.cached) throw new Error("[ct.tiles] Attempt to cache an already cached tilemap.");
        const e = this.getLocalBounds(),
            o = Math.ceil(e.width / t),
            i = Math.ceil(e.height / t);
        this.cells = [];
        for (let t = 0; t < i; t++)
            for (let t = 0; t < o; t++) {
                const t = new PIXI.Container();
                this.cells.push(t);
            }
        for (let i = 0, n = this.tiles.length; i < n; i++) {
            const i = this.children[0],
                n = Math.floor((i.x - e.x) / t),
                s = Math.floor((i.y - e.y) / t);
            this.cells[s * o + n].addChild(i);
        }
        this.removeChildren();
        for (let t = 0, e = this.cells.length; t < e; t++) 0 !== this.cells[t].children.length ? (this.addChild(this.cells[t]), (this.cells[t].cacheAsBitmap = !0)) : (this.cells.splice(t, 1), t--, e--);
        this.cached = !0;
    }
    cacheDiamond(t = 1024) {
        if (this.cached) throw new Error("[ct.tiles] Attempt to cache an already cached tilemap.");
        (this.cells = []), (this.diamondCellMap = {});
        for (let e = 0, o = this.tiles.length; e < o; e++) {
            const e = this.children[0],
                [o, i] = ct.u.rotate(e.x, 2 * e.y, -45),
                n = Math.floor(o / t),
                s = Math.floor(i / t),
                a = `${n}:${s}`;
            if (!(a in this.diamondCellMap)) {
                const t = new PIXI.Container();
                (t.chunkX = n), (t.chunkY = s), (this.diamondCellMap[a] = t), this.cells.push(t);
            }
            this.diamondCellMap[a].addChild(e);
        }
        this.removeChildren(),
            this.cells.sort((t, e) => {
                const o = Math.max(t.chunkY, t.chunkX),
                    i = Math.max(e.chunkY, e.chunkX);
                return o === i ? e.chunkX - t.chunkX : o - i;
            });
        for (let t = 0, e = this.cells.length; t < e; t++) this.addChild(this.cells[t]), (this.cells[t].cacheAsBitmap = !0);
        this.cached = !0;
    }
}
(ct.templates.Tilemap = Tilemap),
    (ct.tilemaps = {
        create(t = 0) {
            const e = new Tilemap();
            return (e.depth = t), ct.room.addChild(e), e;
        },
        addTile: (t, e, o, i, n = 0) => t.addTile(e, o, i, n),
        cache(t, e) {
            t.cache(e);
        },
        cacheDiamond(t, e) {
            t.cacheDiamond(e);
        },
    });
const Camera = (function () {
    class t extends PIXI.DisplayObject {
        constructor(t, e, o, i) {
            super(),
                (this.follow = this.rotate = !1),
                (this.followX = this.followY = !0),
                (this.targetX = this.x = t),
                (this.targetY = this.y = e),
                (this.z = 500),
                (this.width = o || 1920),
                (this.height = i || 1080),
                (this.shiftX = this.shiftY = this.interpolatedShiftX = this.interpolatedShiftY = 0),
                (this.borderX = this.borderY = null),
                (this.drift = 0),
                (this.shake = 0),
                (this.shakeDecay = 5),
                (this.shakeX = this.shakeY = 1),
                (this.shakeFrequency = 50),
                (this.shakePhase = this.shakePhaseX = this.shakePhaseY = 0),
                (this.shakeMax = 10),
                (this.getBounds = this.getBoundingBox);
        }
        get scale() {
            return this.transform.scale;
        }
        set scale(t) {
            "number" == typeof t && (t = { x: t, y: t }), this.transform.scale.copyFrom(t);
        }
        moveTo(t, e) {
            (this.targetX = t), (this.targetY = e);
        }
        teleportTo(t, e) {
            (this.targetX = this.x = t), (this.targetY = this.y = e), (this.shakePhase = this.shakePhaseX = this.shakePhaseY = 0), (this.interpolatedShiftX = this.shiftX), (this.interpolatedShiftY = this.shiftY);
        }
        update(t) {
            !(function (t, e) {
                const o = e / (PIXI.Ticker.shared.maxFPS || 60);
                (t.shake -= o * t.shakeDecay), (t.shake = Math.max(0, t.shake)), t.shakeMax && (t.shake = Math.min(t.shake, t.shakeMax));
                const i = o * t.shakeFrequency;
                (t.shakePhase += i), (t.shakePhaseX += i * (1 + 0.25 * Math.sin(0.1489 * t.shakePhase))), (t.shakePhaseY += i * (1 + 0.25 * Math.sin(0.1734 * t.shakePhase)));
            })(this, t),
                this.follow && this.follow.kill && (this.follow = !1),
                !this.follow && ct.room.follow && (this.follow = ct.templates.list[ct.room.follow][0]),
                this.follow &&
                    "x" in this.follow &&
                    "y" in this.follow &&
                    (function (t) {
                        const e = null === t.borderX ? t.width / 2 : Math.min(t.borderX, t.width / 2),
                            o = null === t.borderY ? t.height / 2 : Math.min(t.borderY, t.height / 2),
                            i = t.uiToGameCoord(e, o),
                            n = t.uiToGameCoord(t.width - e, t.height - o);
                        t.followX && (t.follow.x < i.x - t.interpolatedShiftX ? (t.targetX = t.follow.x - e + t.width / 2) : t.follow.x > n.x - t.interpolatedShiftX && (t.targetX = t.follow.x + e - t.width / 2)),
                            t.followY && (t.follow.y < i.y - t.interpolatedShiftY ? (t.targetY = t.follow.y - o + t.height / 2) : t.follow.y > n.y - t.interpolatedShiftY && (t.targetY = t.follow.y + o - t.height / 2));
                    })(this);
            const e = this.drift ? Math.min(1, (1 - this.drift) * t) : 1;
            (this.x = this.targetX * e + this.x * (1 - e)),
                (this.y = this.targetY * e + this.y * (1 - e)),
                (this.interpolatedShiftX = this.shiftX * e + this.interpolatedShiftX * (1 - e)),
                (this.interpolatedShiftY = this.shiftY * e + this.interpolatedShiftY * (1 - e)),
                (function (t) {
                    if (void 0 !== t.minX) {
                        const e = t.minX + t.width * t.scale.x * 0.5;
                        (t.x = Math.max(e, t.x)), (t.targetX = Math.max(e, t.targetX));
                    }
                    if (void 0 !== t.maxX) {
                        const e = t.maxX - t.width * t.scale.x * 0.5;
                        (t.x = Math.min(e, t.x)), (t.targetX = Math.min(e, t.targetX));
                    }
                    if (void 0 !== t.minY) {
                        const e = t.minY + t.height * t.scale.y * 0.5;
                        (t.y = Math.max(e, t.y)), (t.targetY = Math.max(e, t.targetY));
                    }
                    if (void 0 !== t.maxY) {
                        const e = t.maxY - t.height * t.scale.y * 0.5;
                        (t.y = Math.min(e, t.y)), (t.targetY = Math.min(e, t.targetY));
                    }
                })(this),
                (this.x = this.x || 0),
                (this.y = this.y || 0);
        }
        get computedX() {
            const t = (Math.sin(this.shakePhaseX) + 0.25 * Math.sin(3.1846 * this.shakePhaseX)) / 1.25;
            return this.x + ((t * this.shake * Math.max(this.width, this.height)) / 100) * this.shakeX + this.interpolatedShiftX;
        }
        get computedY() {
            const t = (Math.sin(this.shakePhaseY) + 0.25 * Math.sin(2.8948 * this.shakePhaseY)) / 1.25;
            return this.y + ((t * this.shake * Math.max(this.width, this.height)) / 100) * this.shakeY + this.interpolatedShiftY;
        }
        get left() {
            return this.computedX - (this.width / 2) * this.scale.x;
        }
        get top() {
            return this.computedY - (this.height / 2) * this.scale.y;
        }
        get right() {
            return this.computedX + (this.width / 2) * this.scale.x;
        }
        get bottom() {
            return this.computedY + (this.height / 2) * this.scale.y;
        }
        uiToGameCoord(t, e) {
            const o = (t - this.width / 2) * this.scale.x,
                i = (e - this.height / 2) * this.scale.y,
                n = ct.u.rotate(o, i, this.angle);
            return new PIXI.Point(n.x + this.computedX, n.y + this.computedY);
        }
        gameToUiCoord(t, e) {
            const o = t - this.computedX,
                i = e - this.computedY,
                n = ct.u.rotate(o, i, -this.angle);
            return new PIXI.Point(n.x / this.scale.x + this.width / 2, n.y / this.scale.y + this.height / 2);
        }
        getTopLeftCorner() {
            return this.uiToGameCoord(0, 0);
        }
        getTopRightCorner() {
            return this.uiToGameCoord(this.width, 0);
        }
        getBottomLeftCorner() {
            return this.uiToGameCoord(0, this.height);
        }
        getBottomRightCorner() {
            return this.uiToGameCoord(this.width, this.height);
        }
        getBoundingBox() {
            const t = new PIXI.Bounds(),
                e = this.getTopLeftCorner(),
                o = this.getTopRightCorner(),
                i = this.getBottomLeftCorner(),
                n = this.getBottomRightCorner();
            return t.addPoint(new PIXI.Point(e.x, e.y)), t.addPoint(new PIXI.Point(o.x, o.y)), t.addPoint(new PIXI.Point(i.x, i.y)), t.addPoint(new PIXI.Point(n.x, n.y)), t.getRectangle();
        }
        contains(t) {
            const e = t.getBounds(!0);
            return e.right > 0 && e.left < this.width * this.scale.x && e.bottom > 0 && e.top < this.width * this.scale.y;
        }
        realign(t) {
            if (!t.isUi) throw new Error("[ct.camera] An attempt to realing a room that is not in UI space. The room in question is", t);
            const e = ct.rooms.templates[t.name].width || 1,
                o = ct.rooms.templates[t.name].height || 1;
            for (const i of t.children) "xstart" in i && !i.skipRealign && ((i.x = (i.xstart / e) * this.width), (i.y = (i.ystart / o) * this.height));
        }
        manageStage() {
            const t = this.computedX,
                e = this.computedY,
                o = 1 / (isNaN(this.scale.x) ? 1 : this.scale.x),
                i = 1 / (isNaN(this.scale.y) ? 1 : this.scale.y);
            for (const n of ct.stage.children) !n.isUi && n.pivot && ((n.x = -this.width / 2), (n.y = -this.height / 2), (n.pivot.x = t), (n.pivot.y = e), (n.scale.x = o), (n.scale.y = i), (n.angle = -this.angle));
        }
    }
    return t;
})();
if (
    ((function () {
        const t = Symbol("time"),
            e = Symbol("roomUid"),
            o = Symbol("timeLeftOriginal"),
            i = Symbol("promiseResolve"),
            n = Symbol("promiseReject");
        class s {
            constructor(s, a = !1, r = !1) {
                (this[e] = ct.room.uid || null),
                    (this.name = a && a.toString()),
                    (this.isUi = r),
                    (this[t] = 0),
                    (this[o] = s),
                    (this.timeLeft = this[o]),
                    (this.promise = new Promise((t, e) => {
                        (this[i] = t), (this[n] = e);
                    })),
                    (this.rejected = !1),
                    (this.done = !1),
                    (this.settled = !1),
                    ct.timer.timers.add(this);
            }
            then(...t) {
                return this.promise.then(...t);
            }
            catch(t) {
                return this.promise.catch(t);
            }
            get time() {
                return (1e3 * this[t]) / ct.speed;
            }
            set time(e) {
                this[t] = (e / 1e3) * ct.speed;
            }
            update() {
                !0 !== this.rejected && !0 !== this.done
                    ? ((this[t] += this.isUi ? ct.deltaUi : ct.delta),
                      ct.room.uid !== this[e] && null !== this[e] && this.reject({ info: "Room switch", from: "ct.timer" }),
                      0 !== this.timeLeft && ((this.timeLeft = this[o] - this.time), this.timeLeft <= 0 && this.resolve()))
                    : this.remove();
            }
            resolve() {
                this.settled || ((this.done = !0), (this.settled = !0), this[i](), this.remove());
            }
            reject(t) {
                this.settled || ((this.rejected = !0), (this.settled = !0), this[n](t), this.remove());
            }
            remove() {
                ct.timer.timers.delete(this);
            }
        }
        (window.CtTimer = s),
            (ct.timer = {
                timers: new Set(),
                counter: 0,
                add: (t, e = !1) => new s(t, e, !1),
                addUi: (t, e = !1) => new s(t, e, !0),
                updateTimers() {
                    for (const t of this.timers) t.update();
                },
            });
    })(),
    document.fonts)
)
    for (const t of document.fonts) t.load();
!(function (ct) {
    var t = function (t) {
        switch (t.shape.type) {
            case "rect":
                return (function (t) {
                    const { shape: e } = t,
                        o = new SSCD.Vector(t.x, t.y);
                    if (0 === t.angle)
                        return (
                            (o.x -= t.scale.x > 0 ? e.left * t.scale.x : -t.scale.x * e.right),
                            (o.y -= t.scale.y > 0 ? e.top * t.scale.y : -e.bottom * t.scale.y),
                            new SSCD.Rectangle(o, new SSCD.Vector(Math.abs((e.left + e.right) * t.scale.x), Math.abs((e.bottom + e.top) * t.scale.y)))
                        );
                    const i = ct.u.rotate(-e.left * t.scale.x, -e.top * t.scale.y, t.angle),
                        n = ct.u.rotate(-e.left * t.scale.x, e.bottom * t.scale.y, t.angle),
                        s = ct.u.rotate(e.right * t.scale.x, e.bottom * t.scale.y, t.angle),
                        a = ct.u.rotate(e.right * t.scale.x, -e.top * t.scale.y, t.angle);
                    return new SSCD.LineStrip(o, [new SSCD.Vector(i.x, i.y), new SSCD.Vector(n.x, n.y), new SSCD.Vector(s.x, s.y), new SSCD.Vector(a.x, a.y)], !0);
                })(t);
            case "circle":
                return (function (t) {
                    const { shape: e } = t,
                        o = new SSCD.Vector(t.x, t.y);
                    if (Math.abs(t.scale.x) === Math.abs(t.scale.y)) return new SSCD.Circle(o, e.r * Math.abs(t.scale.x));
                    const i = [];
                    for (let o = 0; o < 16; o++) {
                        const n = [ct.u.ldx(e.r * t.scale.x, 22.5 * o), ct.u.ldy(e.r * t.scale.y, 22.5 * o)];
                        if (0 !== t.angle) {
                            const { x: e, y: o } = ct.u.rotate(n[0], n[1], t.angle);
                            i.push(new SSCD.Vector(e, o));
                        } else i.push(new SSCD.Vector(n[0], n[1]));
                    }
                    return new SSCD.LineStrip(o, i, !0);
                })(t);
            case "strip":
                return (function (t) {
                    const { shape: e } = t,
                        o = new SSCD.Vector(t.x, t.y),
                        i = [];
                    if (0 !== t.angle)
                        for (const o of e.points) {
                            const { x: e, y: n } = ct.u.rotate(o.x * t.scale.x, o.y * t.scale.y, t.angle);
                            i.push(new SSCD.Vector(e, n));
                        }
                    else for (const o of e.points) i.push(new SSCD.Vector(o.x * t.scale.x, o.y * t.scale.y));
                    return new SSCD.LineStrip(o, i, Boolean(e.closedStrip));
                })(t);
            case "line":
                return (function (t) {
                    const { shape: e } = t;
                    if (0 !== t.angle) {
                        const { x: o, y: i } = ct.u.rotate(e.x1 * t.scale.x, e.y1 * t.scale.y, t.angle),
                            { x: n, y: s } = ct.u.rotate(e.x2 * t.scale.x, e.y2 * t.scale.y, t.angle);
                        return new SSCD.Line(new SSCD.Vector(t.x + o, t.y + i), new SSCD.Vector(n - o, s - i));
                    }
                    return new SSCD.Line(new SSCD.Vector(t.x + e.x1 * t.scale.x, t.y + e.y1 * t.scale.y), new SSCD.Vector((e.x2 - e.x1) * t.scale.x, (e.y2 - e.y1) * t.scale.y));
                })(t);
            default:
                return new SSCD.Circle(new SSCD.Vector(t.x, t.y), 0);
        }
    };
    const e = (t, e, o) => e.template === o,
        o = (t, e, o) => !o || o === e.cgroup,
        i = function (e, o, i, n, s, a, r) {
            const c = e.x,
                l = e.y,
                d = e._shape;
            let h, p;
            void 0 === o || (c === o && l === i) ? ((h = e.$chashes || ct.place.getHashes(e)), (e._shape = e._shape || t(e))) : ((e.x = o), (e.y = i), (e._shape = t(e)), (h = ct.place.getHashes(e))), s && (p = []);
            for (const t of h) {
                const o = n[t];
                if (o)
                    for (const t of o)
                        if (t !== e && a(e, t, r) && ct.place.collide(e, t)) {
                            if (!s) return (c === e.x && l === e.y) || ((e.x = c), (e.y = l), (e._shape = d)), t;
                            p.includes(t) || p.push(t);
                        }
            }
            return (c === e.x && l === e.y) || ((e.x = c), (e.y = l), (e._shape = d)), !!s && p;
        };
    (ct.place = {
        m: 1,
        gridX: 1024,
        gridY: 1024,
        grid: {},
        tileGrid: {},
        getHashes(t) {
            var e = [],
                o = Math.round(t.x / ct.place.gridX),
                i = Math.round(t.y / ct.place.gridY),
                n = Math.sign(t.x - ct.place.gridX * o),
                s = Math.sign(t.y - ct.place.gridY * i);
            return e.push(`${o}:${i}`), n && (e.push(`${o + n}:${i}`), s && e.push(`${o + n}:${i + s}`)), s && e.push(`${o}:${i + s}`), e;
        },
        drawDebugGraphic(e) {
            const o = this._shape || t(this),
                i = this.$cDebugCollision,
                n = this.transform.localTransform.clone().invert();
            this.$cDebugCollision.transform.setFromMatrix(n), this.$cDebugCollision.position.set(0, 0);
            let s = 65535;
            if ((this instanceof Copy ? (s = 26367) : this instanceof PIXI.Sprite && (s = 6684927), this.$cHadCollision && (s = 65280), i.lineStyle(2, s), o instanceof SSCD.Rectangle)) {
                const t = o.get_position(),
                    n = o.get_size();
                i.beginFill(s, 0.1), e ? i.drawRect(t.x, t.y, n.x, n.y) : i.drawRect(t.x - this.x, t.y - this.y, n.x, n.y), i.endFill();
            } else if (o instanceof SSCD.LineStrip)
                if (e) {
                    i.moveTo(o.__points[0].x + this.x, o.__points[0].y + this.y);
                    for (let t = 1; t < o.__points.length; t++) i.lineTo(o.__points[t].x + this.x, o.__points[t].y + this.y);
                } else {
                    i.moveTo(o.__points[0].x, o.__points[0].y);
                    for (let t = 1; t < o.__points.length; t++) i.lineTo(o.__points[t].x, o.__points[t].y);
                }
            else if (o instanceof SSCD.Circle && o.get_radius() > 0) i.beginFill(s, 0.1), e ? i.drawCircle(this.x, this.y, o.get_radius()) : i.drawCircle(0, 0, o.get_radius()), i.endFill();
            else if (o instanceof SSCD.Line)
                if (e) {
                    const t = o.get_p1(),
                        e = o.get_p2();
                    i.moveTo(t.x, t.y).lineTo(e.x, e.y);
                } else i.moveTo(o.__position.x, o.__position.y).lineTo(o.__position.x + o.__dest.x, o.__position.y + o.__dest.y);
            else
                e
                    ? i
                          .moveTo(-16 + this.x, -16 + this.y)
                          .lineTo(16 + this.x, 16 + this.y)
                          .moveTo(-16 + this.x, 16 + this.y)
                          .lineTo(16 + this.x, -16 + this.y)
                    : i.moveTo(-16, -16).lineTo(16, 16).moveTo(-16, 16).lineTo(16, -16);
        },
        collide(e, o) {
            if (((e._shape = e._shape || t(e)), (o._shape = o._shape || t(o)), "strip" === e._shape.__type || "strip" === o._shape.__type || "complex" === e._shape.__type || "complex" === o._shape.__type)) {
                const t = e._shape.get_aabb(),
                    i = o._shape.get_aabb();
                if (!t.intersects(i)) return !1;
            }
            return !!SSCD.CollisionManager.test_collision(e._shape, o._shape);
        },
        occupied(t, e, n, s) {
            "number" != typeof n && ((s = e), (e = void 0), (n = void 0));
            const a = i(t, e, n, ct.place.grid, !1, o, s);
            return a || i(t, e, n, ct.place.tileGrid, !1, o, s);
        },
        occupiedMultiple(t, e, n, s) {
            "number" != typeof n && ((s = e), (e = void 0), (n = void 0));
            const a = i(t, e, n, ct.place.grid, !0, o, s),
                r = i(t, e, n, ct.place.tileGrid, !0, o, s);
            return a.concat(r);
        },
        free: (t, e, o, i) => !ct.place.occupied(t, e, o, i),
        meet: (t, o, n, s) => ("number" != typeof n && ((s = o), (o = void 0), (n = void 0)), i(t, o, n, ct.place.grid, !1, e, s)),
        meetMultiple: (t, o, n, s) => ("number" != typeof n && ((s = o), (o = void 0), (n = void 0)), i(t, o, n, ct.place.grid, !0, e, s)),
        copies: (t, e, n, s) => ("number" != typeof n && ((s = e), (e = void 0), (n = void 0)), i(t, e, n, ct.place.grid, !1, o, s)),
        copiesMultiple: (t, e, n, s) => ("number" != typeof n && ((s = e), (e = void 0), (n = void 0)), i(t, e, n, ct.place.grid, !0, o, s)),
        tiles: (t, e, n, s) => ("number" != typeof n && ((s = e), (e = void 0), (n = void 0)), i(t, e, n, ct.place.tileGrid, !1, o, s)),
        tilesMultiple: (t, e, n, s) => ("number" != typeof n && ((s = e), (e = void 0), (n = void 0)), i(t, e, n, ct.place.tileGrid, !0, o, s)),
        lastdist: null,
        nearest(t, e, o) {
            const i = ct.templates.list[o];
            if (i.length > 0) {
                var n = Math.hypot(t - i[0].x, e - i[0].y),
                    s = i[0];
                for (const o of i) Math.hypot(t - o.x, e - o.y) < n && ((n = Math.hypot(t - o.x, e - o.y)), (s = o));
                return (ct.place.lastdist = n), s;
            }
            return !1;
        },
        furthest(t, e, o) {
            const i = ct.templates.list[o];
            if (i.length > 0) {
                var n = Math.hypot(t - i[0].x, e - i[0].y),
                    s = i[0];
                for (const o of i) Math.hypot(t - o.x, e - o.y) > n && ((n = Math.hypot(t - o.x, e - o.y)), (s = o));
                return (ct.place.lastdist = n), s;
            }
            return !1;
        },
        enableTilemapCollisions(e, o) {
            const i = o || e.cgroup;
            if (e.addedCollisions) throw new Error("[ct.place] The tilemap already has collisions enabled.");
            e.cgroup = i;
            for (const o of e.pixiTiles) {
                (o._shape = t(o)), (o.cgroup = i), (o.$chashes = ct.place.getHashes(o));
                for (const t of o.$chashes) t in ct.place.tileGrid ? ct.place.tileGrid[t].push(o) : (ct.place.tileGrid[t] = [o]);
                o.depth = e.depth;
            }
            e.addedCollisions = !0;
        },
        moveAlong(t, e, o, i, n) {
            if (!o) return !1;
            "number" == typeof i && ((n = i), (i = void 0)), (n = Math.abs(n || 1)), o < 0 && ((o *= -1), (e += 180));
            for (var s = Math.cos((e * Math.PI) / 180) * n, a = Math.sin((e * Math.PI) / 180) * n; o > 0; ) {
                o < 1 && ((s *= o), (a *= o));
                const e = ct.place.occupied(t, t.x + s, t.y + a, i);
                if (e) return e;
                (t.x += s), (t.y += a), delete t._shape, o--;
            }
            return !1;
        },
        moveByAxes(t, e, o, i, n) {
            if ((e === o) === 0) return !1;
            "number" == typeof i && ((n = i), (i = void 0));
            const s = { x: !1, y: !1 };
            for (n = Math.abs(n || 1); Math.abs(e) > n; ) {
                const o = ct.place.occupied(t, t.x + Math.sign(e) * n, t.y, i);
                if (o) {
                    s.x = o;
                    break;
                }
                (t.x += Math.sign(e) * n), (e -= Math.sign(e) * n);
            }
            for (; Math.abs(o) > n; ) {
                const e = ct.place.occupied(t, t.x, t.y + Math.sign(o) * n, i);
                if (e) {
                    s.y = e;
                    break;
                }
                (t.y += Math.sign(o) * n), (o -= Math.sign(o) * n);
            }
            return Math.abs(e) < n && ct.place.free(t, t.x + e, t.y, i) && (t.x += e), Math.abs(o) < n && ct.place.free(t, t.x, t.y + o, i) && (t.y += o), !(!s.x && !s.y) && s;
        },
        go(t, e, o, i, n) {
            if (ct.u.pdc(t.x, t.y, e, o) < i) return void (ct.place.free(t, e, o, n) && ((t.x = e), (t.y = o), delete t._shape));
            var s = ct.u.pdn(t.x, t.y, e, o);
            let a = t.x + ct.u.ldx(i, s),
                r = t.y + ct.u.ldy(i, s);
            if (ct.place.free(t, a, r, n)) (t.x = a), (t.y = r), delete t._shape, (t.dir = s);
            else
                for (var c = -1; c <= 1; c += 2)
                    for (var l = 30; l < 150; l += 30)
                        if (((a = t.x + ct.u.ldx(i, s + l * ct.place.m * c)), (r = t.y + ct.u.ldy(i, s + l * ct.place.m * c)), ct.place.free(t, a, r, n))) return (t.x = a), (t.y = r), delete t._shape, void (t.dir = s + l * ct.place.m * c);
        },
        traceCustom(t, e, o, i) {
            const n = [];
            if (!e) return i ? ct.place.occupiedMultiple(t, o) : ct.place.occupied(t, o);
            for (const e of ct.stack)
                if ((!o || e.cgroup === o) && ct.place.collide(t, e)) {
                    if (!i) return e;
                    n.push(e);
                }
            for (const e of ct.templates.list.TILEMAP)
                if (e.addedCollisions && (!o || e.cgroup === o))
                    for (const o of e.pixiTiles)
                        if (ct.place.collide(t, o)) {
                            if (!i) return o;
                            n.push(o);
                        }
            return !!i && n;
        },
        traceLine(t, e, o) {
            let i = !1;
            (Math.abs(t.x1 - t.x2) > ct.place.gridX || Math.abs(t.y1 - t.y2) > ct.place.gridY) && (i = !0);
            const n = { x: t.x1, y: t.y1, scale: { x: 1, y: 1 }, rotation: 0, angle: 0, shape: { type: "line", x1: 0, y1: 0, x2: t.x2 - t.x1, y2: t.y2 - t.y1 } },
                s = ct.place.traceCustom(n, i, e, o);
            return (
                o &&
                    s.sort(function (e, o) {
                        return ct.u.pdc(t.x1, t.y1, e.x, e.y) - ct.u.pdc(t.x1, t.y1, o.x, o.y);
                    }),
                s
            );
        },
        traceRect(t, e, o) {
            let i = !1;
            "x1" in (t = { ...t }) && ((t.x = t.x1), (t.y = t.y1), (t.width = t.x2 - t.x1), (t.height = t.y2 - t.y1)), (Math.abs(t.width) > ct.place.gridX || Math.abs(t.height) > ct.place.gridY) && (i = !0);
            const n = { x: t.x, y: t.y, scale: { x: 1, y: 1 }, rotation: 0, angle: 0, shape: { type: "rect", left: 0, top: 0, right: t.width, bottom: t.height } };
            return ct.place.traceCustom(n, i, e, o);
        },
        traceCircle(t, e, o) {
            let i = !1;
            (2 * t.radius > ct.place.gridX || 2 * t.radius > ct.place.gridY) && (i = !0);
            const n = { x: t.x, y: t.y, scale: { x: 1, y: 1 }, rotation: 0, angle: 0, shape: { type: "circle", r: t.radius } };
            return ct.place.traceCustom(n, i, e, o);
        },
        tracePolyline(t, e, o) {
            const i = { x: 0, y: 0, scale: { x: 1, y: 1 }, rotation: 0, angle: 0, shape: { type: "strip", points: t } };
            return ct.place.traceCustom(i, !0, e, o);
        },
        tracePoint(t, e, o) {
            const i = { x: t.x, y: t.y, scale: { x: 1, y: 1 }, rotation: 0, angle: 0, shape: { type: "point" } };
            return ct.place.traceCustom(i, !1, e, o);
        },
    }),
        (ct.place.traceRectange = ct.place.traceRect),
        setInterval(function () {
            ct.place.m *= -1;
        }, 789);
})(ct),
    (function (ct) {
        document.body.style.overflow = "hidden";
        var t = ct.pixiApp.view;
        var e = function () {
            const { mode: e } = ct.fittoscreen,
                o = (ct.highDensity && window.devicePixelRatio) || 1,
                i = window.innerWidth / ct.roomWidth,
                n = window.innerHeight / ct.roomHeight;
            let s = Math.min(i, n);
            var a, r, c, l;
            "fastScaleInteger" === e && (s = s < 1 ? s : Math.floor(s)),
                "expandViewport" === e || "expand" === e
                    ? ((a = Math.ceil(window.innerWidth * o)), (r = Math.ceil(window.innerHeight * o)), (c = window.innerWidth), (l = window.innerHeight))
                    : "fastScale" === e || "fastScaleInteger" === e
                    ? ((a = Math.ceil(ct.roomWidth * o)), (r = Math.ceil(ct.roomHeight * o)), (c = ct.roomWidth), (l = ct.roomHeight))
                    : ("scaleFit" !== e && "scaleFill" !== e) ||
                      ("scaleFill" === e
                          ? ((a = Math.ceil(ct.roomWidth * i * o)), (r = Math.ceil(ct.roomHeight * n * o)), (c = window.innerWidth / s), (l = window.innerHeight / s))
                          : ((a = Math.ceil(ct.roomWidth * s * o)), (r = Math.ceil(ct.roomHeight * s * o)), (c = ct.roomWidth), (l = ct.roomHeight))),
                ct.pixiApp.renderer.resize(a, r),
                (ct.pixiApp.stage.scale.x = ct.pixiApp.stage.scale.y = "scaleFill" !== e && "scaleFit" !== e ? o : o * s),
                (t.style.width = Math.ceil(a / o) + "px"),
                (t.style.height = Math.ceil(r / o) + "px"),
                ct.camera && ((ct.camera.width = c), (ct.camera.height = l)),
                (function (e, o) {
                    "fastScale" === e || "fastScaleInteger" === e
                        ? ((t.style.transform = `translate(-50%, -50%) scale(${o})`), (t.style.position = "absolute"), (t.style.top = "50%"), (t.style.left = "50%"))
                        : "expandViewport" === e || "expand" === e || "scaleFill" === e
                        ? ((t.style.position = "static"), (t.style.top = "unset"), (t.style.left = "unset"))
                        : "scaleFit" === e && ((t.style.transform = "translate(-50%, -50%)"), (t.style.position = "absolute"), (t.style.top = "50%"), (t.style.left = "50%"));
                })(e, s);
        };
        window.addEventListener("resize", e),
            (ct.fittoscreen = e),
            (ct.fittoscreen.toggleFullscreen = function () {
                try {
                    const t = require("electron").remote.BrowserWindow.getFocusedWindow();
                    return void t.setFullScreen(!t.isFullScreen());
                } catch (t) {}
                var t = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement,
                    e = document.getElementById("ct"),
                    o = e.requestFullscreen || e.webkitRequestFullscreen || e.mozRequestFullScreen || e.msRequestFullscreen,
                    i = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
                if (t) i && i.call(document);
                else {
                    var n = o.call(e);
                    n &&
                        n.catch(function (t) {
                            console.error("[ct.fittoscreen]", t);
                        });
                }
            });
        var o = "scaleFit";
        Object.defineProperty(ct.fittoscreen, "mode", {
            configurable: !1,
            enumerable: !0,
            set(t) {
                o = t;
            },
            get: () => o,
        }),
            (ct.fittoscreen.mode = o),
            (ct.fittoscreen.getIsFullscreen = function () {
                try {
                    return require("electron").remote.BrowserWindow.getFocusedWindow.isFullScreen;
                } catch (t) {}
                return document.fullscreen || document.webkitIsFullScreen || document.mozFullScreen;
            });
    })(ct),
    (function () {
        var t = function (t, e) {
            ct.inputs.registry["keyboard." + t] = e;
        };
        (ct.keyboard = {
            string: "",
            lastKey: "",
            lastCode: "",
            alt: !1,
            shift: !1,
            ctrl: !1,
            clear() {
                delete ct.keyboard.lastKey, delete ct.keyboard.lastCode, (ct.keyboard.string = ""), (ct.keyboard.alt = !1), (ct.keyboard.shift = !1), (ct.keyboard.ctrl = !1);
            },
            check: [],
            onDown(e) {
                (ct.keyboard.shift = e.shiftKey),
                    (ct.keyboard.alt = e.altKey),
                    (ct.keyboard.ctrl = e.ctrlKey),
                    (ct.keyboard.lastKey = e.key),
                    (ct.keyboard.lastCode = e.code),
                    e.code ? t(e.code, 1) : t("Unknown", 1),
                    e.key && (1 === e.key.length ? (ct.keyboard.string += e.key) : "Backspace" === e.key ? (ct.keyboard.string = ct.keyboard.string.slice(0, -1)) : "Enter" === e.key && (ct.keyboard.string = "")),
                    e.preventDefault();
            },
            onUp(e) {
                (ct.keyboard.shift = e.shiftKey), (ct.keyboard.alt = e.altKey), (ct.keyboard.ctrl = e.ctrlKey), e.code ? t(e.code, 0) : t("Unknown", 0), e.preventDefault();
            },
        }),
            document.addEventListener
                ? (document.addEventListener("keydown", ct.keyboard.onDown, !1), document.addEventListener("keyup", ct.keyboard.onUp, !1))
                : (document.attachEvent("onkeydown", ct.keyboard.onDown), document.attachEvent("onkeyup", ct.keyboard.onUp));
    })(),
    (function (t) {
        "use strict";
        var e = "KeyboardEvent" in t;
        e ||
            (t.KeyboardEvent = function () {
                throw TypeError("Illegal constructor");
            }),
            [
                ["DOM_KEY_LOCATION_STANDARD", 0],
                ["DOM_KEY_LOCATION_LEFT", 1],
                ["DOM_KEY_LOCATION_RIGHT", 2],
                ["DOM_KEY_LOCATION_NUMPAD", 3],
            ].forEach(function (e) {
                e[0] in t.KeyboardEvent || (t.KeyboardEvent[e[0]] = e[1]);
            });
        var o = t.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
            i = t.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
            n = t.KeyboardEvent.DOM_KEY_LOCATION_RIGHT,
            s = t.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;
        function a(t, e) {
            return -1 !== String(t).indexOf(e);
        }
        var r = a(navigator.platform, "Win")
                ? "win"
                : a(navigator.platform, "Mac")
                ? "mac"
                : a(navigator.platform, "CrOS")
                ? "cros"
                : a(navigator.platform, "Linux")
                ? "linux"
                : a(navigator.userAgent, "iPad") || a(navigator.platform, "iPod") || a(navigator.platform, "iPhone")
                ? "ios"
                : "",
            c = a(navigator.userAgent, "Chrome/") ? "chrome" : a(navigator.vendor, "Apple") ? "safari" : a(navigator.userAgent, "MSIE") ? "ie" : a(navigator.userAgent, "Gecko/") ? "moz" : a(navigator.userAgent, "Opera/") ? "opera" : "",
            l = c + "-" + r;
        function d(t, e, o) {
            (l !== e && c !== e && r !== e) ||
                Object.keys(o).forEach(function (e) {
                    t[e] = o[e];
                });
        }
        var h = {
            3: { code: "Cancel" },
            6: { code: "Help" },
            8: { code: "Backspace" },
            9: { code: "Tab" },
            12: { code: "Clear" },
            13: { code: "Enter" },
            16: { code: "Shift" },
            17: { code: "Control" },
            18: { code: "Alt" },
            19: { code: "Pause" },
            20: { code: "CapsLock" },
            21: { code: "KanaMode" },
            22: { code: "Lang1" },
            25: { code: "Lang2" },
            27: { code: "Escape" },
            28: { code: "Convert" },
            29: { code: "NonConvert" },
            30: { code: "Accept" },
            31: { code: "ModeChange" },
            32: { code: "Space" },
            33: { code: "PageUp" },
            34: { code: "PageDown" },
            35: { code: "End" },
            36: { code: "Home" },
            37: { code: "ArrowLeft" },
            38: { code: "ArrowUp" },
            39: { code: "ArrowRight" },
            40: { code: "ArrowDown" },
            41: { code: "Select" },
            42: { code: "Print" },
            43: { code: "Execute" },
            44: { code: "PrintScreen" },
            45: { code: "Insert" },
            46: { code: "Delete" },
            47: { code: "Help" },
            48: { code: "Digit0", keyCap: "0" },
            49: { code: "Digit1", keyCap: "1" },
            50: { code: "Digit2", keyCap: "2" },
            51: { code: "Digit3", keyCap: "3" },
            52: { code: "Digit4", keyCap: "4" },
            53: { code: "Digit5", keyCap: "5" },
            54: { code: "Digit6", keyCap: "6" },
            55: { code: "Digit7", keyCap: "7" },
            56: { code: "Digit8", keyCap: "8" },
            57: { code: "Digit9", keyCap: "9" },
            65: { code: "KeyA", keyCap: "a" },
            66: { code: "KeyB", keyCap: "b" },
            67: { code: "KeyC", keyCap: "c" },
            68: { code: "KeyD", keyCap: "d" },
            69: { code: "KeyE", keyCap: "e" },
            70: { code: "KeyF", keyCap: "f" },
            71: { code: "KeyG", keyCap: "g" },
            72: { code: "KeyH", keyCap: "h" },
            73: { code: "KeyI", keyCap: "i" },
            74: { code: "KeyJ", keyCap: "j" },
            75: { code: "KeyK", keyCap: "k" },
            76: { code: "KeyL", keyCap: "l" },
            77: { code: "KeyM", keyCap: "m" },
            78: { code: "KeyN", keyCap: "n" },
            79: { code: "KeyO", keyCap: "o" },
            80: { code: "KeyP", keyCap: "p" },
            81: { code: "KeyQ", keyCap: "q" },
            82: { code: "KeyR", keyCap: "r" },
            83: { code: "KeyS", keyCap: "s" },
            84: { code: "KeyT", keyCap: "t" },
            85: { code: "KeyU", keyCap: "u" },
            86: { code: "KeyV", keyCap: "v" },
            87: { code: "KeyW", keyCap: "w" },
            88: { code: "KeyX", keyCap: "x" },
            89: { code: "KeyY", keyCap: "y" },
            90: { code: "KeyZ", keyCap: "z" },
            91: { code: "MetaLeft", location: i },
            92: { code: "MetaRight", location: n },
            93: { code: "ContextMenu" },
            95: { code: "Standby" },
            96: { code: "Numpad0", keyCap: "0", location: s },
            97: { code: "Numpad1", keyCap: "1", location: s },
            98: { code: "Numpad2", keyCap: "2", location: s },
            99: { code: "Numpad3", keyCap: "3", location: s },
            100: { code: "Numpad4", keyCap: "4", location: s },
            101: { code: "Numpad5", keyCap: "5", location: s },
            102: { code: "Numpad6", keyCap: "6", location: s },
            103: { code: "Numpad7", keyCap: "7", location: s },
            104: { code: "Numpad8", keyCap: "8", location: s },
            105: { code: "Numpad9", keyCap: "9", location: s },
            106: { code: "NumpadMultiply", keyCap: "*", location: s },
            107: { code: "NumpadAdd", keyCap: "+", location: s },
            108: { code: "NumpadComma", keyCap: ",", location: s },
            109: { code: "NumpadSubtract", keyCap: "-", location: s },
            110: { code: "NumpadDecimal", keyCap: ".", location: s },
            111: { code: "NumpadDivide", keyCap: "/", location: s },
            112: { code: "F1" },
            113: { code: "F2" },
            114: { code: "F3" },
            115: { code: "F4" },
            116: { code: "F5" },
            117: { code: "F6" },
            118: { code: "F7" },
            119: { code: "F8" },
            120: { code: "F9" },
            121: { code: "F10" },
            122: { code: "F11" },
            123: { code: "F12" },
            124: { code: "F13" },
            125: { code: "F14" },
            126: { code: "F15" },
            127: { code: "F16" },
            128: { code: "F17" },
            129: { code: "F18" },
            130: { code: "F19" },
            131: { code: "F20" },
            132: { code: "F21" },
            133: { code: "F22" },
            134: { code: "F23" },
            135: { code: "F24" },
            144: { code: "NumLock", location: s },
            145: { code: "ScrollLock" },
            160: { code: "ShiftLeft", location: i },
            161: { code: "ShiftRight", location: n },
            162: { code: "ControlLeft", location: i },
            163: { code: "ControlRight", location: n },
            164: { code: "AltLeft", location: i },
            165: { code: "AltRight", location: n },
            166: { code: "BrowserBack" },
            167: { code: "BrowserForward" },
            168: { code: "BrowserRefresh" },
            169: { code: "BrowserStop" },
            170: { code: "BrowserSearch" },
            171: { code: "BrowserFavorites" },
            172: { code: "BrowserHome" },
            173: { code: "AudioVolumeMute" },
            174: { code: "AudioVolumeDown" },
            175: { code: "AudioVolumeUp" },
            176: { code: "MediaTrackNext" },
            177: { code: "MediaTrackPrevious" },
            178: { code: "MediaStop" },
            179: { code: "MediaPlayPause" },
            180: { code: "LaunchMail" },
            181: { code: "MediaSelect" },
            182: { code: "LaunchApp1" },
            183: { code: "LaunchApp2" },
            186: { code: "Semicolon", keyCap: ";" },
            187: { code: "Equal", keyCap: "=" },
            188: { code: "Comma", keyCap: "," },
            189: { code: "Minus", keyCap: "-" },
            190: { code: "Period", keyCap: "." },
            191: { code: "Slash", keyCap: "/" },
            192: { code: "Backquote", keyCap: "`" },
            219: { code: "BracketLeft", keyCap: "[" },
            220: { code: "Backslash", keyCap: "\\" },
            221: { code: "BracketRight", keyCap: "]" },
            222: { code: "Quote", keyCap: "'" },
            226: { code: "IntlBackslash", keyCap: "\\" },
            229: { code: "Process" },
            246: { code: "Attn" },
            247: { code: "CrSel" },
            248: { code: "ExSel" },
            249: { code: "EraseEof" },
            250: { code: "Play" },
            251: { code: "ZoomToggle" },
            254: { code: "Clear" },
        };
        d(h, "moz", {
            59: { code: "Semicolon", keyCap: ";" },
            61: { code: "Equal", keyCap: "=" },
            107: { code: "Equal", keyCap: "=" },
            109: { code: "Minus", keyCap: "-" },
            187: { code: "NumpadAdd", keyCap: "+", location: s },
            189: { code: "NumpadSubtract", keyCap: "-", location: s },
        }),
            d(h, "moz-mac", { 12: { code: "NumLock", location: s }, 173: { code: "Minus", keyCap: "-" } }),
            d(h, "moz-win", { 173: { code: "Minus", keyCap: "-" } }),
            d(h, "chrome-mac", { 93: { code: "MetaRight", location: n } }),
            d(h, "safari", { 3: { code: "Enter" }, 25: { code: "Tab" } }),
            d(h, "ios", { 10: { code: "Enter", location: o } }),
            d(h, "safari-mac", { 91: { code: "MetaLeft", location: i }, 93: { code: "MetaRight", location: n }, 229: { code: "KeyQ", keyCap: "Q" } });
        var p = {};
        "cros" === r &&
            ((p["U+00A0"] = { code: "ShiftLeft", location: i }),
            (p["U+00A1"] = { code: "ShiftRight", location: n }),
            (p["U+00A2"] = { code: "ControlLeft", location: i }),
            (p["U+00A3"] = { code: "ControlRight", location: n }),
            (p["U+00A4"] = { code: "AltLeft", location: i }),
            (p["U+00A5"] = { code: "AltRight", location: n })),
            "chrome-mac" === l && (p["U+0010"] = { code: "ContextMenu" }),
            "safari-mac" === l && (p["U+0010"] = { code: "ContextMenu" }),
            "ios" === r &&
                ((p["U+0010"] = { code: "Function" }),
                (p["U+001C"] = { code: "ArrowLeft" }),
                (p["U+001D"] = { code: "ArrowRight" }),
                (p["U+001E"] = { code: "ArrowUp" }),
                (p["U+001F"] = { code: "ArrowDown" }),
                (p["U+0001"] = { code: "Home" }),
                (p["U+0004"] = { code: "End" }),
                (p["U+000B"] = { code: "PageUp" }),
                (p["U+000C"] = { code: "PageDown" }));
        var u = [];
        (u[i] = { 16: { code: "ShiftLeft", location: i }, 17: { code: "ControlLeft", location: i }, 18: { code: "AltLeft", location: i } }),
            (u[n] = { 16: { code: "ShiftRight", location: n }, 17: { code: "ControlRight", location: n }, 18: { code: "AltRight", location: n } }),
            (u[s] = { 13: { code: "NumpadEnter", location: s } }),
            d(u[s], "moz", { 109: { code: "NumpadSubtract", location: s }, 107: { code: "NumpadAdd", location: s } }),
            d(u[i], "moz-mac", { 224: { code: "MetaLeft", location: i } }),
            d(u[n], "moz-mac", { 224: { code: "MetaRight", location: n } }),
            d(u[n], "moz-win", { 91: { code: "MetaRight", location: n } }),
            d(u[n], "mac", { 93: { code: "MetaRight", location: n } }),
            d(u[s], "chrome-mac", { 12: { code: "NumLock", location: s } }),
            d(u[s], "safari-mac", {
                12: { code: "NumLock", location: s },
                187: { code: "NumpadAdd", location: s },
                189: { code: "NumpadSubtract", location: s },
                190: { code: "NumpadDecimal", location: s },
                191: { code: "NumpadDivide", location: s },
            });
        var m = {
            ShiftLeft: { key: "Shift" },
            ShiftRight: { key: "Shift" },
            ControlLeft: { key: "Control" },
            ControlRight: { key: "Control" },
            AltLeft: { key: "Alt" },
            AltRight: { key: "Alt" },
            MetaLeft: { key: "Meta" },
            MetaRight: { key: "Meta" },
            NumpadEnter: { key: "Enter" },
            Space: { key: " " },
            Digit0: { key: "0", shiftKey: ")" },
            Digit1: { key: "1", shiftKey: "!" },
            Digit2: { key: "2", shiftKey: "@" },
            Digit3: { key: "3", shiftKey: "#" },
            Digit4: { key: "4", shiftKey: "$" },
            Digit5: { key: "5", shiftKey: "%" },
            Digit6: { key: "6", shiftKey: "^" },
            Digit7: { key: "7", shiftKey: "&" },
            Digit8: { key: "8", shiftKey: "*" },
            Digit9: { key: "9", shiftKey: "(" },
            KeyA: { key: "a", shiftKey: "A" },
            KeyB: { key: "b", shiftKey: "B" },
            KeyC: { key: "c", shiftKey: "C" },
            KeyD: { key: "d", shiftKey: "D" },
            KeyE: { key: "e", shiftKey: "E" },
            KeyF: { key: "f", shiftKey: "F" },
            KeyG: { key: "g", shiftKey: "G" },
            KeyH: { key: "h", shiftKey: "H" },
            KeyI: { key: "i", shiftKey: "I" },
            KeyJ: { key: "j", shiftKey: "J" },
            KeyK: { key: "k", shiftKey: "K" },
            KeyL: { key: "l", shiftKey: "L" },
            KeyM: { key: "m", shiftKey: "M" },
            KeyN: { key: "n", shiftKey: "N" },
            KeyO: { key: "o", shiftKey: "O" },
            KeyP: { key: "p", shiftKey: "P" },
            KeyQ: { key: "q", shiftKey: "Q" },
            KeyR: { key: "r", shiftKey: "R" },
            KeyS: { key: "s", shiftKey: "S" },
            KeyT: { key: "t", shiftKey: "T" },
            KeyU: { key: "u", shiftKey: "U" },
            KeyV: { key: "v", shiftKey: "V" },
            KeyW: { key: "w", shiftKey: "W" },
            KeyX: { key: "x", shiftKey: "X" },
            KeyY: { key: "y", shiftKey: "Y" },
            KeyZ: { key: "z", shiftKey: "Z" },
            Numpad0: { key: "0" },
            Numpad1: { key: "1" },
            Numpad2: { key: "2" },
            Numpad3: { key: "3" },
            Numpad4: { key: "4" },
            Numpad5: { key: "5" },
            Numpad6: { key: "6" },
            Numpad7: { key: "7" },
            Numpad8: { key: "8" },
            Numpad9: { key: "9" },
            NumpadMultiply: { key: "*" },
            NumpadAdd: { key: "+" },
            NumpadComma: { key: "," },
            NumpadSubtract: { key: "-" },
            NumpadDecimal: { key: "." },
            NumpadDivide: { key: "/" },
            Semicolon: { key: ";", shiftKey: ":" },
            Equal: { key: "=", shiftKey: "+" },
            Comma: { key: ",", shiftKey: "<" },
            Minus: { key: "-", shiftKey: "_" },
            Period: { key: ".", shiftKey: ">" },
            Slash: { key: "/", shiftKey: "?" },
            Backquote: { key: "`", shiftKey: "~" },
            BracketLeft: { key: "[", shiftKey: "{" },
            Backslash: { key: "\\", shiftKey: "|" },
            BracketRight: { key: "]", shiftKey: "}" },
            Quote: { key: "'", shiftKey: '"' },
            IntlBackslash: { key: "\\", shiftKey: "|" },
        };
        d(m, "mac", { MetaLeft: { key: "Meta" }, MetaRight: { key: "Meta" } });
        var y,
            f,
            g,
            x = {
                Add: "+",
                Decimal: ".",
                Divide: "/",
                Subtract: "-",
                Multiply: "*",
                Spacebar: " ",
                Esc: "Escape",
                Nonconvert: "NonConvert",
                Left: "ArrowLeft",
                Up: "ArrowUp",
                Right: "ArrowRight",
                Down: "ArrowDown",
                Del: "Delete",
                Menu: "ContextMenu",
                MediaNextTrack: "MediaTrackNext",
                MediaPreviousTrack: "MediaTrackPrevious",
                SelectMedia: "MediaSelect",
                HalfWidth: "Hankaku",
                FullWidth: "Zenkaku",
                RomanCharacters: "Romaji",
                Crsel: "CrSel",
                Exsel: "ExSel",
                Zoom: "ZoomToggle",
            },
            w =
                ((y = h),
                (f = "code"),
                (g = {}),
                Object.keys(y).forEach(function (t) {
                    var e = y[t];
                    f in e && (g[e[f]] = e);
                }),
                g);
        try {
            var v = e && "location" in new KeyboardEvent("");
        } catch (t) {}
        function b(t) {
            var e = "keyCode" in t ? t.keyCode : "which" in t ? t.which : 0,
                o = (function () {
                    if (v || "keyLocation" in t) {
                        var o = v ? t.location : t.keyLocation;
                        if (o && e in u[o]) return u[o][e];
                    }
                    return "keyIdentifier" in t && t.keyIdentifier in p ? p[t.keyIdentifier] : e in h ? h[e] : null;
                })();
            if (!o) return null;
            var i,
                n = (i = m[o.code]) ? (t.shiftKey && "shiftKey" in i ? i.shiftKey : i.key) : o.code;
            return { code: o.code, key: n, location: o.location, keyCap: o.keyCap };
        }
        "KeyboardEvent" in t &&
            "defineProperty" in Object &&
            (function () {
                function t(t, e, o) {
                    e in t || Object.defineProperty(t, e, o);
                }
                if (
                    (t(KeyboardEvent.prototype, "code", {
                        get: function () {
                            var t = b(this);
                            return t ? t.code : "";
                        },
                    }),
                    "key" in KeyboardEvent.prototype)
                ) {
                    var e = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, "key");
                    Object.defineProperty(KeyboardEvent.prototype, "key", {
                        get: function () {
                            var t = e.get.call(this);
                            return x.hasOwnProperty(t) ? x[t] : t;
                        },
                    });
                }
                t(KeyboardEvent.prototype, "key", {
                    get: function () {
                        var t = b(this);
                        return t && "key" in t ? t.key : "Unidentified";
                    },
                }),
                    t(KeyboardEvent.prototype, "location", {
                        get: function () {
                            var t = b(this);
                            return t && "location" in t ? t.location : o;
                        },
                    }),
                    t(KeyboardEvent.prototype, "locale", {
                        get: function () {
                            return "";
                        },
                    });
            })(),
            "queryKeyCap" in t.KeyboardEvent ||
                (t.KeyboardEvent.queryKeyCap = function (t, e) {
                    if (((t = String(t)), !w.hasOwnProperty(t))) return "Undefined";
                    if (e && "en-us" !== String(e).toLowerCase()) throw Error("Unsupported locale");
                    var o = w[t];
                    return o.keyCap || o.code || "Undefined";
                }),
            (t.identifyKey = function (t) {
                if (!("code" in t)) {
                    var e = b(t);
                    (t.code = e ? e.code : ""), (t.key = e && "key" in e ? e.key : "Unidentified"), (t.location = "location" in t ? t.location : "keyLocation" in t ? t.keyLocation : e && "location" in e ? e.location : o), (t.locale = "");
                }
            });
    })(self),
    (function () {
        const t = function (t, e) {
            (ct.rooms.templates.CTTRANSITIONEMPTYROOM.width = ct.camera.width), (ct.rooms.templates.CTTRANSITIONEMPTYROOM.height = ct.camera.height);
            const o = ct.rooms.append("CTTRANSITIONEMPTYROOM", { isUi: !0 });
            return ct.templates.copyIntoRoom(t, 0, 0, o, Object.assign({ room: o }, e)).promise;
        };
        ct.transition = {
            fadeOut: (e, o) => t("CTTRANSITION_FADE", { duration: (e = e || 500), color: (o = o || 0), in: !1 }),
            fadeIn: (e, o) => t("CTTRANSITION_FADE", { duration: (e = e || 500), color: (o = o || 0), in: !0 }),
            scaleOut: (e, o, i) => t("CTTRANSITION_SCALE", { duration: (e = e || 500), color: (i = i || 0), scaling: (o = o || 0.1), in: !1 }),
            scaleIn: (e, o, i) => t("CTTRANSITION_SCALE", { duration: (e = e || 500), color: (i = i || 0), scaling: (o = o || 0.1), in: !0 }),
            slideOut: (e, o, i) => t("CTTRANSITION_SLIDE", { duration: (e = e || 500), color: (i = i || 0), endAt: (o = o || "right"), in: !1 }),
            slideIn: (e, o, i) => t("CTTRANSITION_SLIDE", { duration: (e = e || 500), color: (i = i || 0), endAt: (o = o || "right"), in: !0 }),
            circleOut: (e, o) => t("CTTRANSITION_CIRCLE", { duration: e, color: (o = o || 0), in: !0 }),
            circleIn: (e, o) => t("CTTRANSITION_CIRCLE", { duration: e, color: (o = o || 0), in: !1 }),
        };
    })(),
    (ct.tween = {
        add(t) {
            var e = { obj: t.obj, fields: t.fields || {}, curve: t.curve || ct.tween.ease, duration: t.duration || 1e3, timer: new CtTimer(this.duration, !1, t.useUiDelta || !1) },
                o = new Promise((t, o) => {
                    for (var i in ((e.resolve = t), (e.reject = o), (e.starting = {}), e.fields)) e.starting[i] = e.obj[i] || 0;
                    ct.tween.tweens.push(e);
                });
            return (
                t.silent && (o.catch(() => {}), e.timer.catch(() => {})),
                (o.stop = function () {
                    e.reject({ code: 0, info: "Stopped by game logic", from: "ct.tween" });
                }),
                o
            );
        },
        linear: (t, e, o) => e * o + t,
        ease: (t, e, o) => ((o *= 2) < 1 ? (e / 2) * o * o + t : (-e / 2) * (--o * (o - 2) - 1) + t),
        easeInQuad: (t, e, o) => e * o * o + t,
        easeOutQuad: (t, e, o) => -e * o * (o - 2) + t,
        easeInCubic: (t, e, o) => e * o * o * o + t,
        easeOutCubic: (t, e, o) => e * (--o * o * o + 1) + t,
        easeInOutCubic: (t, e, o) => ((o *= 2) < 1 ? (e / 2) * o * o * o + t : (e / 2) * ((o -= 2) * o * o + 2) + t),
        easeInOutQuart: (t, e, o) => ((o *= 2) < 1 ? (e / 2) * o * o * o * o + t : (-e / 2) * ((o -= 2) * o * o * o - 2) + t),
        easeInQuart: (t, e, o) => e * o * o * o * o + t,
        easeOutQuart: (t, e, o) => -e * (--o * o * o * o - 1) + t,
        easeInCirc: (t, e, o) => -e * (Math.sqrt(1 - o * o) - 1) + t,
        easeOutCirc: (t, e, o) => (o--, e * Math.sqrt(1 - o * o) + t),
        easeInOutCirc: (t, e, o) => ((o *= 2) < 1 ? (-e / 2) * (Math.sqrt(1 - o * o) - 1) + t : ((o -= 2), (e / 2) * (Math.sqrt(1 - o * o) + 1) + t)),
        easeInBack(t, e, o) {
            const i = 1.70158;
            return e * (2.70158 * o * o * o - i * o * o) + t;
        },
        easeOutBack(t, e, o) {
            const i = 1.70158;
            return e * (1 + 2.70158 * (o - 1) ** 3 + i * (o - 1) ** 2) + t;
        },
        easeInOutBack(t, e, o) {
            const i = 2.5949095;
            return e * (o < 0.5 ? ((2 * o) ** 2 * (7.189819 * o - i)) / 2 : ((2 * o - 2) ** 2 * ((i + 1) * (2 * o - 2) + i) + 2) / 2) + t;
        },
        easeInElastic(t, e, o) {
            const i = (2 * Math.PI) / 3;
            return e * (0 === o ? 0 : 1 === o ? 1 : -(2 ** (10 * o - 10)) * Math.sin((10 * o - 10.75) * i)) + t;
        },
        easeOutElastic(t, e, o) {
            const i = (2 * Math.PI) / 3;
            return e * (0 === o ? 0 : 1 === o ? 1 : 2 ** (-10 * o) * Math.sin((10 * o - 0.75) * i) + 1) + t;
        },
        easeInOutElastic(t, e, o) {
            const i = (2 * Math.PI) / 4.5;
            return e * (0 === o ? 0 : 1 === o ? 1 : o < 0.5 ? (-(2 ** (20 * o - 10)) * Math.sin((20 * o - 11.125) * i)) / 2 : (2 ** (-20 * o + 10) * Math.sin((20 * o - 11.125) * i)) / 2 + 1) + t;
        },
        easeOutBounce(t, e, o) {
            const i = 7.5625,
                n = 2.75;
            return e * (o < 1 / n ? i * o * o : o < 2 / n ? i * (o -= 1.5 / n) * o + 0.75 : o < 2.5 / n ? i * (o -= 2.25 / n) * o + 0.9375 : i * (o -= 2.625 / n) * o + 0.984375) + t;
        },
        easeInBounce(t, e, o) {
            const i = 7.5625,
                n = 2.75;
            return e * (1 - ((o = 1 - o) < 1 / n ? i * o * o : o < 2 / n ? i * (o -= 1.5 / n) * o + 0.75 : o < 2.5 / n ? i * (o -= 2.25 / n) * o + 0.9375 : i * (o -= 2.625 / n) * o + 0.984375)) + t;
        },
        easeInOutBounce(t, e, o) {
            const i = 7.5625,
                n = 2.75;
            var s;
            return (
                (s = o < 0.5 ? 1 - 2 * o : 2 * o - 1) < 1 / n ? i * s * s : s < 2 / n ? i * (s -= 1.5 / n) * s + 0.75 : s < 2.5 / n ? i * (s -= 2.25 / n) * s + 0.9375 : i * (s -= 2.625 / n) * s + 0.984375,
                e * (o < 0.5 ? (1 - s) / 1 : (1 + s) / 1) + t
            );
        },
        tweens: [],
        wait: ct.u.wait,
    }),
    (ct.tween.easeInOutQuad = ct.tween.ease),
    (function () {
        const t = {
                controllers: {},
                buttonsMapping: ["Button1", "Button2", "Button3", "Button4", "L1", "R1", "L2", "R2", "Select", "Start", "L3", "R3", "Up", "Down", "Left", "Right"],
                axesMapping: ["LStickX", "LStickY", "RStickX", "RStickY"],
            },
            e = "gamepad.",
            o = function (t, o) {
                ct.inputs.registry[e + t] = o;
            },
            i = function (t) {
                return ct.inputs.registry[e + t] || 0;
            },
            n = function () {
                return navigator.getGamepads ? navigator.getGamepads() : [];
            },
            s = function (e) {
                t.controllers[e.index] = e;
            };
        (ct.gamepad = Object.assign(new PIXI.utils.EventEmitter(), {
            list: n(),
            connected(t) {
                ct.gamepad.emit("connected", t.gamepad, t), s(t.gamepad);
            },
            disconnected(e) {
                ct.gamepad.emit("disconnected", e.gamepad, e), delete t.controllers[e.gamepad.index];
            },
            getButton: (e) => {
                if (-1 === t.buttonsMapping.indexOf(e) && "Any" !== e) throw new Error(`[ct.gamepad] Attempt to get the state of a non-existing button ${e}. A typo?`);
                return i(e);
            },
            getAxis: (e) => {
                if (-1 === t.axesMapping.indexOf(e)) throw new Error(`[ct.gamepad] Attempt to get the state of a non-existing axis ${e}. A typo?`);
                return i(e);
            },
            lastButton: null,
        })),
            window.addEventListener("gamepadconnected", ct.gamepad.connected),
            window.addEventListener("gamepaddisconnected", ct.gamepad.disconnected),
            ct.pixiApp.ticker.add(function () {
                let e;
                !(function () {
                    const e = n();
                    for (let o = 0, i = e.length; o < i; o++)
                        if (e[o]) {
                            const { controllers: i } = t;
                            e[o].index in i ? (i[e[o].index] = e[o]) : s(e[o]);
                        }
                })();
                const { controllers: a } = t,
                    { buttonsMapping: r } = t,
                    { axesMapping: c } = t;
                for (e in a) {
                    const t = a[e],
                        n = t.buttons.length;
                    o("Any", 0);
                    for (let e = 0; e < n; e++) o(r[e], t.buttons[e].value), o("Any", Math.max(i("Any"), t.buttons[e].value)), (ct.gamepad.lastButton = r[e]);
                    const s = t.axes.length;
                    for (let e = 0; e < s; e++) o(c[e], t.axes[e]);
                }
            });
    })(),
    (ct.vkeys = {
        button(t) {
            var e = ct.u.ext({ key: "Vk1", depth: 100, texNormal: -1, x: 128, y: 128, container: ct.room }, t || {});
            const o = ct.templates.copy("VKEY", 0, 0, { opts: e }, e.container);
            return ("function" != typeof t.x && "function" != typeof t.y) || (o.skipRealign = !0), o;
        },
        joystick(t) {
            var e = ct.u.ext({ key: "Vjoy1", depth: 100, tex: -1, trackballTex: -1, x: 128, y: 128, container: ct.room }, t || {});
            const o = ct.templates.copy("VJOYSTICK", 0, 0, { opts: e }, e.container);
            return ("function" != typeof t.x && "function" != typeof t.y) || (o.skipRealign = !0), o;
        },
    }),
    (function (ct) {
        const t = "pointer.",
            e = function (e, o) {
                ct.inputs.registry[t + e] = o;
            },
            o = { Primary: 1, Middle: 4, Secondary: 2, ExtraOne: 8, ExtraTwo: 16, Eraser: 32 };
        var i = 0,
            n = 0,
            s = 0,
            a = 0,
            r = 0,
            c = () => {
                e("Any", ct.pointer.down.length > 0 ? 1 : 0), e("Double", ct.pointer.down.length > 1 ? 1 : 0), e("Triple", ct.pointer.down.length > 2 ? 1 : 0);
            },
            l = (t) => {
                const e = ct.pixiApp.view.getBoundingClientRect(),
                    o = ((t.clientX - e.left) / e.width) * ct.camera.width,
                    i = ((t.clientY - e.top) / e.height) * ct.camera.height,
                    n = ct.u.uiToGameCoord(o, i);
                return {
                    id: t.pointerId,
                    x: n.x,
                    y: n.y,
                    clientX: t.clientX,
                    clientY: t.clientY,
                    xui: o,
                    yui: i,
                    xprev: n.x,
                    yprev: n.y,
                    buttons: t.buttons,
                    xuiprev: o,
                    yuiprev: i,
                    pressure: t.pressure,
                    tiltX: t.tiltX,
                    tiltY: t.tiltY,
                    twist: t.twist,
                    type: t.pointerType,
                    width: (t.width / e.width) * ct.camera.width,
                    height: (t.height / e.height) * ct.camera.height,
                };
            },
            d = (t, e) => {
                const o = ct.pixiApp.view.getBoundingClientRect(),
                    i = ((e.clientX - o.left) / o.width) * ct.camera.width,
                    n = ((e.clientY - o.top) / o.height) * ct.camera.height,
                    s = ct.u.uiToGameCoord(i, n);
                Object.assign(t, {
                    x: s.x,
                    y: s.y,
                    xui: i,
                    yui: n,
                    clientX: e.clientX,
                    clientY: e.clientY,
                    pressure: e.pressure,
                    buttons: e.buttons,
                    tiltX: e.tiltX,
                    tiltY: e.tiltY,
                    twist: e.twist,
                    width: (e.width / o.width) * ct.camera.width,
                    height: (e.height / o.height) * ct.camera.height,
                });
            },
            h = function (t) {
                Object.assign(ct.pointer, { x: t.x, y: t.y, xui: t.xui, yui: t.yui, pressure: t.pressure, buttons: t.buttons, tiltX: t.tiltX, tiltY: t.tiltY, twist: t.twist });
            },
            p = function (t) {
                window.focus();
                const e = l(t);
                ct.pointer.hover.push(e), t.isPrimary && h(e);
            },
            u = function (t) {
                const e = ct.pointer.hover.find((e) => e.id === t.pointerId);
                e && ((e.invalid = !0), ct.pointer.hover.splice(ct.pointer.hover.indexOf(e), 1));
                const o = ct.pointer.down.findIndex((e) => e.id === t.pointerId);
                -1 !== o && ct.pointer.down.splice(o, 1);
            },
            m = function (t) {
                t.preventDefault();
                let e = ct.pointer.hover.find((e) => e.id === t.pointerId);
                e || (p(t), (e = ct.pointer.hover.find((e) => e.id === t.pointerId)));
                const o = ct.pointer.down.find((e) => e.id === t.pointerId);
                (e || o) && (e && d(e, t), o && d(o, t), t.isPrimary && h(e || o));
            },
            y = function (t) {
                t.preventDefault(), (ct.pointer.type = t.pointerType);
                const e = l(t);
                ct.pointer.down.push(e), c(), t.isPrimary && h(e);
            },
            f = function (t) {
                t.preventDefault();
                const e = ct.pointer.down.find((e) => e.id === t.pointerId);
                e && ct.pointer.released.push(e), -1 !== ct.pointer.down.indexOf(e) && ct.pointer.down.splice(ct.pointer.down.indexOf(e), 1), c();
            },
            g = function (t) {
                e("Wheel", (t.wheelDelta || -t.detail) < 0 ? -1 : 1), t.preventDefault();
            };
        let x = !1;
        const w = function (t, e, o, i) {
                if (x) return !1;
                for (const n of o)
                    if (
                        (!e || n.id === e.id) &&
                        ct.place.collide(t, { x: i ? n.xui : n.x, y: i ? n.yui : n.y, scale: { x: 1, y: 1 }, angle: 0, shape: { type: "rect", top: n.height / 2, bottom: n.height / 2, left: n.width / 2, right: n.width / 2 } })
                    )
                        return n;
                return !1;
            },
            v = function () {
                if (!document.pointerLockElement && !document.mozPointerLockElement) {
                    (document.body.requestPointerLock || document.body.mozRequestPointerLock).apply(document.body);
                }
            },
            b = function (t) {
                const e = ct.pixiApp.view.getBoundingClientRect(),
                    o = (t.movementX / e.width) * ct.camera.width,
                    i = (t.movementY / e.height) * ct.camera.height;
                (ct.pointer.xlocked += o), (ct.pointer.ylocked += i), (ct.pointer.xmovement = o), (ct.pointer.ymovement = i);
            };
        (ct.pointer = {
            setupListeners() {
                document.addEventListener("pointerenter", p, !1),
                    document.addEventListener("pointerout", u, !1),
                    document.addEventListener("pointerleave", u, !1),
                    document.addEventListener("pointerdown", y, !1),
                    document.addEventListener("pointerup", f, !1),
                    document.addEventListener("pointercancel", f, !1),
                    document.addEventListener("pointermove", m, !1),
                    document.addEventListener("wheel", g, { passive: !1 }),
                    document.addEventListener("DOMMouseScroll", g, { passive: !1 }),
                    document.addEventListener("contextmenu", (t) => {
                        t.preventDefault();
                    });
            },
            hover: [],
            down: [],
            released: [],
            x: 0,
            y: 0,
            xprev: 0,
            yprev: 0,
            xui: 0,
            yui: 0,
            xuiprev: 0,
            yuiprev: 0,
            xlocked: 0,
            ylocked: 0,
            xmovement: 0,
            ymovement: 0,
            pressure: 1,
            buttons: 0,
            tiltX: 0,
            tiltY: 0,
            twist: 0,
            width: 1,
            height: 1,
            type: null,
            clear() {
                (ct.pointer.down.length = 0), (ct.pointer.hover.length = 0), ct.pointer.clearReleased(), c();
            },
            clearReleased() {
                ct.pointer.released.length = 0;
            },
            collides(t, e, o) {
                var i = o ? ct.pointer.released : ct.pointer.down;
                return w(t, e, i, !1);
            },
            collidesUi(t, e, o) {
                var i = o ? ct.pointer.released : ct.pointer.down;
                return w(t, e, i, !0);
            },
            hovers: (t, e) => w(t, e, ct.pointer.hover, !1),
            hoversUi: (t, e) => w(t, e, ct.pointer.hover, !0),
            isButtonPressed(e, i) {
                return i ? ((i.buttons & o[e]) === e ? 1 : 0) : Boolean(((n = e), ct.inputs.registry[t + n]));
                var n;
            },
            updateGestures() {
                let t = 0,
                    c = 0;
                const l = ct.pixiApp.view.getBoundingClientRect();
                for (const e of ct.pointer.down) (t += (e.clientX - l.left) / l.width), (c += (e.clientY - l.top) / l.height);
                (t /= ct.pointer.down.length), (c /= ct.pointer.down.length);
                let d = 0,
                    h = a;
                if (ct.pointer.down.length > 1) {
                    const t = [ct.pointer.down[0], ct.pointer.down[1]].sort((t, e) => t.id - e.id);
                    (d = ct.u.pdn(t[0].x, t[0].y, t[1].x, t[1].y)), (h = ct.u.pdc(t[0].x, t[0].y, t[1].x, t[1].y));
                }
                i === ct.pointer.down.length
                    ? (ct.pointer.down.length > 1 ? (e("DeltaRotation", ct.u.degToRad(ct.u.deltaDir(r, d))), e("DeltaPinch", h / a - 1)) : (e("DeltaPinch", 0), e("DeltaRotation", 0)),
                      ct.pointer.down.length ? (e("PanX", t - n), e("PanY", c - s)) : (e("PanX", 0), e("PanY", 0)))
                    : ((i = ct.pointer.down.length), e("DeltaPinch", 0), e("DeltaRotation", 0), e("PanX", 0), e("PanY", 0)),
                    (n = t),
                    (s = c),
                    (r = d),
                    (a = h);
                for (const t in o) {
                    e(t, 0);
                    for (const i of ct.pointer.down) (i.buttons & o[t]) === o[t] && e(t, 1);
                }
            },
            lock() {
                if (x) return;
                (x = !0), (ct.pointer.xlocked = ct.pointer.xui), (ct.pointer.ylocked = ct.pointer.yui);
                (document.body.requestPointerLock || document.body.mozRequestPointerLock).apply(document.body), document.addEventListener("click", v), document.addEventListener("pointermove", b);
            },
            unlock() {
                x &&
                    ((x = !1),
                    (document.pointerLockElement || document.mozPointerLockElement) && (document.exitPointerLock || document.mozExitPointerLock)(),
                    document.removeEventListener("click", v),
                    document.removeEventListener("pointermove", b));
            },
            get locked() {
                return Boolean(document.pointerLockElement || document.mozPointerLockElement);
            },
        }),
            e("Wheel", 0);
    })(ct),
    (function () {
        var t = function (t, e) {
                ct.inputs.registry["mouse." + t] = e;
            },
            e = { 0: "Left", 1: "Middle", 2: "Right", 3: "Special1", 4: "Special2", 5: "Special3", 6: "Special4", 7: "Special5", 8: "Special6", unknown: "Unknown" };
        (ct.mouse = {
            xui: 0,
            yui: 0,
            xprev: 0,
            yprev: 0,
            xuiprev: 0,
            yuiprev: 0,
            inside: !1,
            pressed: !1,
            down: !1,
            released: !1,
            button: 0,
            hovers: (t) =>
                !!t.shape && ("rect" === t.shape.type ? ct.u.prect(ct.mouse.x, ct.mouse.y, t) : "circle" === t.shape.type ? ct.u.pcircle(ct.mouse.x, ct.mouse.y, t) : "point" === t.shape.type && ct.mouse.x === t.x && ct.mouse.y === t.y),
            hoversUi: (t) =>
                !!t.shape &&
                ("rect" === t.shape.type ? ct.u.prect(ct.mouse.xui, ct.mouse.yui, t) : "circle" === t.shape.type ? ct.u.pcircle(ct.mouse.xui, ct.mouse.yui, t) : "point" === t.shape.type && ct.mouse.xui === t.x && ct.mouse.yui === t.y),
            hide() {
                ct.pixiApp.renderer.view.style.cursor = "none";
            },
            show() {
                ct.pixiApp.renderer.view.style.cursor = "";
            },
            get x() {
                return ct.u.uiToGameCoord(ct.mouse.xui, ct.mouse.yui).x;
            },
            get y() {
                return ct.u.uiToGameCoord(ct.mouse.xui, ct.mouse.yui).y;
            },
        }),
            (ct.mouse.listenerMove = function (t) {
                var e = ct.pixiApp.view.getBoundingClientRect();
                (ct.mouse.xui = ((t.clientX - e.left) * ct.camera.width) / e.width),
                    (ct.mouse.yui = ((t.clientY - e.top) * ct.camera.height) / e.height),
                    ct.mouse.xui > 0 && ct.mouse.yui > 0 && ct.mouse.yui < ct.camera.height && ct.mouse.xui < ct.camera.width ? (ct.mouse.inside = !0) : (ct.mouse.inside = !1),
                    window.focus();
            }),
            (ct.mouse.listenerDown = function (o) {
                t(e[o.button] || e.unknown, 1), (ct.mouse.pressed = !0), (ct.mouse.down = !0), (ct.mouse.button = o.button), window.focus(), o.preventDefault();
            }),
            (ct.mouse.listenerUp = function (o) {
                t(e[o.button] || e.unknown, 0), (ct.mouse.released = !0), (ct.mouse.down = !1), (ct.mouse.button = o.button), window.focus(), o.preventDefault();
            }),
            (ct.mouse.listenerContextMenu = function (t) {
                t.preventDefault();
            }),
            (ct.mouse.listenerWheel = function (e) {
                t("Wheel", (e.wheelDelta || -e.detail) < 0 ? -1 : 1);
            }),
            (ct.mouse.setupListeners = function () {
                document.addEventListener
                    ? (document.addEventListener("mousemove", ct.mouse.listenerMove, !1),
                      document.addEventListener("mouseup", ct.mouse.listenerUp, !1),
                      document.addEventListener("mousedown", ct.mouse.listenerDown, !1),
                      document.addEventListener("wheel", ct.mouse.listenerWheel, !1, { passive: !1 }),
                      document.addEventListener("contextmenu", ct.mouse.listenerContextMenu, !1),
                      document.addEventListener("DOMMouseScroll", ct.mouse.listenerWheel, { passive: !1 }))
                    : (document.attachEvent("onmousemove", ct.mouse.listenerMove),
                      document.attachEvent("onmouseup", ct.mouse.listenerUp),
                      document.attachEvent("onmousedown", ct.mouse.listenerDown),
                      document.attachEvent("onmousewheel", ct.mouse.listenerWheel),
                      document.attachEvent("oncontextmenu", ct.mouse.listenerContextMenu));
            });
    })(),
    ct.sound
        ? console.error("Another sound system is already enabled. Disable `sound.basic` module in your ct.js project.")
        : ((ct.sound = {
              detect(t) {
                  var e = document.createElement("audio");
                  return Boolean(e.canPlayType && e.canPlayType(t).replace(/no/, ""));
              },
              init(t, e, o) {
                  var i = "";
                  ct.sound.mp3 && e.mp3 ? (i = e.mp3) : ct.sound.ogg && e.ogg ? (i = e.ogg) : ct.sound.wav && e.wav && (i = e.wav), (o = o || {});
                  var n = { src: i, direct: document.createElement("audio"), pool: [], poolSize: o.poolSize || 5 };
                  return (
                      "" !== i
                          ? (ct.res.soundsLoaded++,
                            (n.direct.preload = o.music ? "metadata" : "auto"),
                            (n.direct.onerror = n.direct.onabort = function () {
                                console.error("[ct.sound] Oh no! We couldn't load " + i + "!"), (n.buggy = !0), ct.res.soundsError++, ct.res.soundsLoaded--;
                            }),
                            (n.direct.src = i))
                          : (ct.res.soundsError++, (n.buggy = !0), console.error("[ct.sound] We couldn't load sound named \"" + t + "\" because the browser doesn't support any of proposed formats.")),
                      (ct.res.sounds[t] = n),
                      n
                  );
              },
              spawn(t, e, o) {
                  "function" == typeof (e = e || {}) && (o = e);
                  var i = ct.res.sounds[t];
                  if (i.pool.length < i.poolSize) {
                      var n = document.createElement("audio");
                      return (
                          (n.src = i.src),
                          e && ct.u.ext(n, e),
                          i.pool.push(n),
                          n.addEventListener("ended", function (t) {
                              i.pool.splice(i.pool.indexOf(n), 1), o && o(!0, t);
                          }),
                          n.play(),
                          n
                      );
                  }
                  return o && o(!1), !1;
              },
              exists: (t) => t in ct.res.sounds,
          }),
          (ct.sound.wav = ct.sound.detect('audio/wav; codecs="1"')),
          (ct.sound.mp3 = ct.sound.detect("audio/mpeg;")),
          (ct.sound.ogg = ct.sound.detect("audio/ogg;"))),
    (function () {
        (ct.sound = {}), (ct.sound.howler = Howler), Howler.orientation(0, -1, 0, 0, 0, 1), Howler.pos(0, 0, 0), (ct.sound.howl = Howl);
        (ct.sound.useDepth = !1),
            (ct.sound.manageListenerPosition = !0),
            (ct.sound.detect = Howler.codecs),
            (ct.sound.init = function (t, e, o) {
                o = o || {};
                var i = [];
                e.wav && ".wav" === e.wav.slice(-4) && i.push(e.wav), e.mp3 && ".mp3" === e.mp3.slice(-4) && i.push(e.mp3), e.ogg && ".ogg" === e.ogg.slice(-4) && i.push(e.ogg);
                var n = !navigator.userAgent.startsWith("ct.js") && o.music,
                    s = new Howl({
                        src: i,
                        autoplay: !1,
                        preload: !n,
                        html5: n,
                        loop: o.loop,
                        pool: o.poolSize || 5,
                        onload: function () {
                            n || ct.res.soundsLoaded++;
                        },
                        onloaderror: function () {
                            ct.res.soundsError++, (s.buggy = !0), console.error("[ct.sound.howler] Oh no! We couldn't load " + (e.wav || e.mp3 || e.ogg) + "!");
                        },
                    });
                n && ct.res.soundsLoaded++, (ct.res.sounds[t] = s);
            });
        (ct.sound.spawn = function (t, e, o) {
            "function" == typeof (e = e || {}) && ((o = e), (e = {}));
            var i = ct.res.sounds[t],
                n = i.play();
            if ((e.loop && i.loop(!0, n), void 0 !== e.volume && i.volume(e.volume, n), void 0 !== e.rate && i.rate(e.rate, n), void 0 !== e.x || e.position)) {
                if (void 0 !== e.x) i.pos(e.x, e.y || 0, e.z || 0, n);
                else {
                    const t = e.position;
                    i.pos(t.x, t.y, e.z || (ct.sound.useDepth ? t.depth : 0), n);
                }
                ((t, e, o) => {
                    t.pannerAttr(
                        {
                            coneInnerAngle: e.coneInnerAngle || 360,
                            coneOuterAngle: e.coneOuterAngle || 360,
                            coneOuterGain: e.coneOuterGain || 1,
                            distanceModel: e.distanceModel || "linear",
                            maxDistance: e.maxDistance || 2500,
                            refDistance: e.refDistance || 1,
                            rolloffFactor: e.rolloffFactor || 1,
                            panningModel: e.panningModel || "HRTF",
                        },
                        o
                    );
                })(i, e, n);
            }
            return o && i.once("end", o, n), n;
        }),
            (ct.sound.stop = function (t, e) {
                ct.sound.playing(t, e) && ct.res.sounds[t].stop(e);
            }),
            (ct.sound.pause = function (t, e) {
                ct.res.sounds[t].pause(e);
            }),
            (ct.sound.resume = function (t, e) {
                ct.res.sounds[t].play(e);
            }),
            (ct.sound.playing = function (t, e) {
                return ct.res.sounds[t].playing(e);
            }),
            (ct.sound.load = function (t) {
                ct.res.sounds[t].load();
            }),
            (ct.sound.volume = function (t, e, o) {
                return ct.res.sounds[t].volume(e, o);
            }),
            (ct.sound.fade = function (t, e, o, i) {
                if (ct.sound.playing(t, i)) {
                    var n = ct.res.sounds[t],
                        s = i ? n.volume(i) : n.volume;
                    try {
                        n.fade(s, e, o, i);
                    } catch (o) {
                        console.warn("Could not reliably fade a sound, reason:", o), ct.sound.volume(t, e, i);
                    }
                }
            }),
            (ct.sound.moveListener = function (t, e, o) {
                Howler.pos(t, e, o || 0);
            }),
            (ct.sound.position = function (t, e, o, i, n) {
                if (ct.sound.playing(t, e)) {
                    var s = ct.res.sounds[t],
                        a = s.pos(e);
                    s.pos(o, i, n || a[2], e);
                }
            }),
            (ct.sound.globalVolume = Howler.volume.bind(Howler)),
            (ct.sound.exists = function (t) {
                return t in ct.res.sounds;
            });
    })(),
    (function (t, e) {
        t.PIXI.MultiStyleText = (function (t) {
            var e = [
                    "pointerover",
                    "pointerenter",
                    "pointerdown",
                    "pointermove",
                    "pointerup",
                    "pointercancel",
                    "pointerout",
                    "pointerleave",
                    "gotpointercapture",
                    "lostpointercapture",
                    "mouseover",
                    "mouseenter",
                    "mousedown",
                    "mousemove",
                    "mouseup",
                    "mousecancel",
                    "mouseout",
                    "mouseleave",
                    "touchover",
                    "touchenter",
                    "touchdown",
                    "touchmove",
                    "touchup",
                    "touchcancel",
                    "touchout",
                    "touchleave",
                ],
                o = { bbcode: ["[", "]"], xml: ["<", ">"] },
                i = (function (i) {
                    function n(t, o) {
                        var n = this;
                        i.call(this, t),
                            (this.styles = o),
                            e.forEach(function (t) {
                                n.on(t, function (t) {
                                    return n.handleInteraction(t);
                                });
                            });
                    }
                    i && (n.__proto__ = i), ((n.prototype = Object.create(i && i.prototype)).constructor = n);
                    var s = { styles: { configurable: !0 } };
                    return (
                        (n.prototype.handleInteraction = function (t) {
                            var e = t,
                                o = t.data.getLocalPosition(this),
                                i = this.hitboxes.reduce(function (t, e) {
                                    return void 0 !== t ? t : e.hitbox.contains(o.x, o.y) ? e : void 0;
                                }, void 0);
                            e.targetTag = void 0 === i ? void 0 : i.tag;
                        }),
                        (s.styles.set = function (e) {
                            for (var o in ((this.textStyles = {}), (this.textStyles.default = this.assign({}, n.DEFAULT_TAG_STYLE)), e))
                                "default" === o ? this.assign(this.textStyles.default, e[o]) : (this.textStyles[o] = this.assign({}, e[o]));
                            "bbcode" === this.textStyles.default.tagStyle &&
                                ((this.textStyles.b = this.assign({}, { fontStyle: "bold" })),
                                (this.textStyles.i = this.assign({}, { fontStyle: "italic" })),
                                (this.textStyles.color = this.assign({}, { fill: "" })),
                                (this.textStyles.outline = this.assign({}, { stroke: "", strokeThickness: 6 })),
                                (this.textStyles.font = this.assign({}, { fontFamily: "" })),
                                (this.textStyles.shadow = this.assign({}, { dropShadowColor: "", dropShadow: !0, dropShadowBlur: 3, dropShadowDistance: 3, dropShadowAngle: 2 })),
                                (this.textStyles.size = this.assign({}, { fontSize: "px" })),
                                (this.textStyles.spacing = this.assign({}, { letterSpacing: "" })),
                                (this.textStyles.align = this.assign({}, { align: "" }))),
                                (this.withPrivateMembers()._style = new t.TextStyle(this.textStyles.default)),
                                (this.withPrivateMembers().dirty = !0);
                        }),
                        (n.prototype.setTagStyle = function (e, o) {
                            e in this.textStyles ? this.assign(this.textStyles[e], o) : (this.textStyles[e] = this.assign({}, o)),
                                (this.withPrivateMembers()._style = new t.TextStyle(this.textStyles.default)),
                                (this.withPrivateMembers().dirty = !0);
                        }),
                        (n.prototype.deleteTagStyle = function (e) {
                            "default" === e ? (this.textStyles.default = this.assign({}, n.DEFAULT_TAG_STYLE)) : delete this.textStyles[e],
                                (this.withPrivateMembers()._style = new t.TextStyle(this.textStyles.default)),
                                (this.withPrivateMembers().dirty = !0);
                        }),
                        (n.prototype.getTagRegex = function (t, e) {
                            var i = Object.keys(this.textStyles).join("|");
                            i = t ? "(" + i + ")" : "(?:" + i + ")";
                            var n =
                                "bbcode" === this.textStyles.default.tagStyle
                                    ? "\\" + o.bbcode[0] + i + "(?:\\=(?:[A-Za-z0-9_\\-\\#]+|'(?:[^']+|\\\\')*'))*\\s*\\" + o.bbcode[1] + "|\\" + o.bbcode[0] + "\\/" + i + "\\s*\\" + o.bbcode[1]
                                    : "\\" + o.xml[0] + i + "(?:\\s+[A-Za-z0-9_\\-]+=(?:\"(?:[^\"]+|\\\\\")*\"|'(?:[^']+|\\\\')*'))*\\s*\\" + o.xml[1] + "|\\" + o.xml[0] + "\\/" + i + "\\s*\\" + o.xml[1];
                            return e && (n = "(" + n + ")"), new RegExp(n, "g");
                        }),
                        (n.prototype.getPropertyRegex = function () {
                            return new RegExp("([A-Za-z0-9_\\-]+)=(?:\"((?:[^\"]+|\\\\\")*)\"|'((?:[^']+|\\\\')*)')", "g");
                        }),
                        (n.prototype.getBBcodePropertyRegex = function () {
                            return new RegExp("[A-Za-z0-9_\\-]+=([A-Za-z0-9_\\-\\#]+)", "g");
                        }),
                        (n.prototype._getTextDataPerLine = function (t) {
                            for (var e = [], i = this.getTagRegex(!0, !1), n = [this.assign({}, this.textStyles.default)], s = [{ name: "default", properties: {} }], a = 0; a < t.length; a++) {
                                for (var r = [], c = [], l = void 0; (l = i.exec(t[a])); ) c.push(l);
                                if (0 === c.length) r.push(this.createTextData(t[a], n[n.length - 1], s[s.length - 1]));
                                else {
                                    for (var d = 0, h = 0; h < c.length; h++) {
                                        if ((c[h].index > d && r.push(this.createTextData(t[a].substring(d, c[h].index), n[n.length - 1], s[s.length - 1])), "/" === c[h][0][1])) n.length > 1 && (n.pop(), s.pop());
                                        else {
                                            for (var p = {}, u = this.getPropertyRegex(), m = void 0; (m = u.exec(c[h][0])); ) p[m[1]] = m[2] || m[3];
                                            if ((s.push({ name: c[h][1], properties: p }), "bbcode" === this.textStyles.default.tagStyle && c[h][0].includes("=") && this.textStyles[c[h][1]])) {
                                                var y = this.getBBcodePropertyRegex().exec(c[h][0]),
                                                    f = {};
                                                Object.entries(this.textStyles[c[h][1]]).forEach(function (t) {
                                                    f[t[0]] = "string" != typeof t[1] ? t[1] : y[1] + t[1];
                                                }),
                                                    n.push(this.assign({}, n[n.length - 1], f));
                                            } else n.push(this.assign({}, n[n.length - 1], this.textStyles[c[h][1]]));
                                        }
                                        d = c[h].index + c[h][0].length;
                                    }
                                    if (d < t[a].length) {
                                        var g = this.createTextData(d ? t[a].substring(d) : t[a], n[n.length - 1], s[s.length - 1]);
                                        r.push(g);
                                    }
                                }
                                e.push(r);
                            }
                            var x = this.textStyles.default.tagStyle;
                            return (
                                e[e.length - 1].map(function (t) {
                                    t.text.includes(o[x][0]) && (t.text = t.text.match("bbcode" === x ? /^(.*)\[/ : /^(.*)\</)[1]);
                                }),
                                e
                            );
                        }),
                        (n.prototype.getFontString = function (e) {
                            return new t.TextStyle(e).toFontString();
                        }),
                        (n.prototype.createTextData = function (t, e, o) {
                            return { text: t, style: e, width: 0, height: 0, fontProperties: void 0, tag: o };
                        }),
                        (n.prototype.getDropShadowPadding = function () {
                            var t = this,
                                e = 0,
                                o = 0;
                            return (
                                Object.keys(this.textStyles).forEach(function (i) {
                                    var n = t.textStyles[i],
                                        s = n.dropShadowBlur;
                                    (e = Math.max(e, n.dropShadowDistance || 0)), (o = Math.max(o, s || 0));
                                }),
                                e + o
                            );
                        }),
                        (n.prototype.withPrivateMembers = function () {
                            return this;
                        }),
                        (n.prototype.updateText = function () {
                            var e = this;
                            if (this.withPrivateMembers().dirty) {
                                (this.hitboxes = []), (this.texture.baseTexture.resolution = this.resolution);
                                var o = this.textStyles,
                                    i = this.text;
                                this.withPrivateMembers()._style.wordWrap && (i = this.wordWrap(this.text));
                                for (var s = i.split(/(?:\r\n|\r|\n)/), a = this._getTextDataPerLine(s), r = [], c = [], l = [], d = 0, h = 0; h < s.length; h++) {
                                    for (var p = 0, u = 0, m = 0, y = 0; y < a[h].length; y++) {
                                        var f = a[h][y].style;
                                        (this.context.font = this.getFontString(f)),
                                            (a[h][y].width = this.context.measureText(a[h][y].text).width),
                                            0 !== a[h][y].text.length && ((a[h][y].width += (a[h][y].text.length - 1) * f.letterSpacing), y > 0 && (p += f.letterSpacing / 2), y < a[h].length - 1 && (p += f.letterSpacing / 2)),
                                            (p += a[h][y].width),
                                            (a[h][y].fontProperties = t.TextMetrics.measureFont(this.context.font)),
                                            (a[h][y].height = a[h][y].fontProperties.fontSize),
                                            "number" == typeof f.valign
                                                ? ((u = Math.min(u, f.valign - a[h][y].fontProperties.descent)), (m = Math.max(m, f.valign + a[h][y].fontProperties.ascent)))
                                                : ((u = Math.min(u, -a[h][y].fontProperties.descent)), (m = Math.max(m, a[h][y].fontProperties.ascent)));
                                    }
                                    (r[h] = p), (c[h] = u), (l[h] = m), (d = Math.max(d, p));
                                }
                                var g = Object.keys(o)
                                        .map(function (t) {
                                            return o[t];
                                        })
                                        .reduce(function (t, e) {
                                            return Math.max(t, e.strokeThickness || 0);
                                        }, 0),
                                    x = this.getDropShadowPadding(),
                                    w = d + 2 * g + 2 * x,
                                    v =
                                        l.reduce(function (t, e) {
                                            return t + e;
                                        }, 0) -
                                        c.reduce(function (t, e) {
                                            return t + e;
                                        }, 0) +
                                        2 * g +
                                        2 * x;
                                (this.canvas.width = w * this.resolution),
                                    (this.canvas.height = v * this.resolution),
                                    this.context.scale(this.resolution, this.resolution),
                                    (this.context.textBaseline = "alphabetic"),
                                    (this.context.lineJoin = "round");
                                for (var b = x + g, k = [], S = 0; S < a.length; S++) {
                                    var M = a[S],
                                        C = void 0;
                                    switch (this.withPrivateMembers()._style.align) {
                                        case "left":
                                            C = x + g;
                                            break;
                                        case "center":
                                            C = x + g + (d - r[S]) / 2;
                                            break;
                                        case "right":
                                            C = x + g + d - r[S];
                                    }
                                    for (var _ = 0; _ < M.length; _++) {
                                        var D = M[_],
                                            B = D.style,
                                            P = D.text,
                                            A = D.fontProperties,
                                            O = D.width,
                                            T = D.tag,
                                            I = b + A.ascent;
                                        switch (B.valign) {
                                            case "top":
                                                break;
                                            case "baseline":
                                                I += l[S] - A.ascent;
                                                break;
                                            case "middle":
                                                I += (l[S] - c[S] - A.ascent - A.descent) / 2;
                                                break;
                                            case "bottom":
                                                I += l[S] - c[S] - A.ascent - A.descent;
                                                break;
                                            default:
                                                I += l[S] - A.ascent - B.valign;
                                        }
                                        if (0 === B.letterSpacing) k.push({ text: P, style: B, x: C, y: I, width: O, ascent: A.ascent, descent: A.descent, tag: T }), (C += M[_].width);
                                        else {
                                            this.context.font = this.getFontString(M[_].style);
                                            for (var L = 0; L < P.length; L++) {
                                                (L > 0 || _ > 0) && (C += B.letterSpacing / 2);
                                                var E = this.context.measureText(P.charAt(L)).width;
                                                k.push({ text: P.charAt(L), style: B, x: C, y: I, width: E, ascent: A.ascent, descent: A.descent, tag: T }), (C += E), (L < P.length - 1 || _ < M.length - 1) && (C += B.letterSpacing / 2);
                                            }
                                        }
                                    }
                                    b += l[S] - c[S];
                                }
                                this.context.save(),
                                    k.forEach(function (o) {
                                        var i = o.style,
                                            n = o.text,
                                            s = o.x,
                                            a = o.y;
                                        if (i.dropShadow) {
                                            e.context.font = e.getFontString(i);
                                            var r = i.dropShadowColor;
                                            "number" == typeof r && (r = t.utils.hex2string(r)),
                                                (e.context.shadowColor = r),
                                                (e.context.shadowBlur = i.dropShadowBlur),
                                                (e.context.shadowOffsetX = Math.cos(i.dropShadowAngle) * i.dropShadowDistance * e.resolution),
                                                (e.context.shadowOffsetY = Math.sin(i.dropShadowAngle) * i.dropShadowDistance * e.resolution),
                                                e.context.fillText(n, s, a);
                                        }
                                    }),
                                    this.context.restore(),
                                    k.forEach(function (o) {
                                        var i = o.style,
                                            n = o.text,
                                            s = o.x,
                                            a = o.y;
                                        if (void 0 !== i.stroke && i.strokeThickness) {
                                            e.context.font = e.getFontString(i);
                                            var r = i.stroke;
                                            "number" == typeof r && (r = t.utils.hex2string(r)), (e.context.strokeStyle = r), (e.context.lineWidth = i.strokeThickness), e.context.strokeText(n, s, a);
                                        }
                                    }),
                                    k.forEach(function (o) {
                                        var i = o.style,
                                            n = o.text,
                                            s = o.x,
                                            a = o.y;
                                        if (void 0 !== i.fill) {
                                            e.context.font = e.getFontString(i);
                                            var r = i.fill;
                                            if ("number" == typeof r) r = t.utils.hex2string(r);
                                            else if (Array.isArray(r))
                                                for (var c = 0; c < r.length; c++) {
                                                    var l = r[c];
                                                    "number" == typeof l && (r[c] = t.utils.hex2string(l));
                                                }
                                            (e.context.fillStyle = e._generateFillStyle(new t.TextStyle(i), [n])), e.context.fillText(n, s, a);
                                        }
                                    }),
                                    k.forEach(function (o) {
                                        var i = o.style,
                                            s = o.x,
                                            a = o.y,
                                            r = o.width,
                                            c = o.ascent,
                                            l = o.descent,
                                            d = o.tag,
                                            h = -e.withPrivateMembers()._style.padding - e.getDropShadowPadding();
                                        e.hitboxes.push({ tag: d, hitbox: new t.Rectangle(s + h, a - c + h, r, c + l) }),
                                            (void 0 === i.debug ? n.debugOptions.spans.enabled : i.debug) &&
                                                ((e.context.lineWidth = 1),
                                                n.debugOptions.spans.bounding &&
                                                    ((e.context.fillStyle = n.debugOptions.spans.bounding),
                                                    (e.context.strokeStyle = n.debugOptions.spans.bounding),
                                                    e.context.beginPath(),
                                                    e.context.rect(s, a - c, r, c + l),
                                                    e.context.fill(),
                                                    e.context.stroke(),
                                                    e.context.stroke()),
                                                n.debugOptions.spans.baseline &&
                                                    ((e.context.strokeStyle = n.debugOptions.spans.baseline), e.context.beginPath(), e.context.moveTo(s, a), e.context.lineTo(s + r, a), e.context.closePath(), e.context.stroke()),
                                                n.debugOptions.spans.top &&
                                                    ((e.context.strokeStyle = n.debugOptions.spans.top), e.context.beginPath(), e.context.moveTo(s, a - c), e.context.lineTo(s + r, a - c), e.context.closePath(), e.context.stroke()),
                                                n.debugOptions.spans.bottom &&
                                                    ((e.context.strokeStyle = n.debugOptions.spans.bottom), e.context.beginPath(), e.context.moveTo(s, a + l), e.context.lineTo(s + r, a + l), e.context.closePath(), e.context.stroke()),
                                                n.debugOptions.spans.text &&
                                                    ((e.context.fillStyle = "#ffffff"),
                                                    (e.context.strokeStyle = "#000000"),
                                                    (e.context.lineWidth = 2),
                                                    (e.context.font = "8px monospace"),
                                                    e.context.strokeText(d.name, s, a - c + 8),
                                                    e.context.fillText(d.name, s, a - c + 8),
                                                    e.context.strokeText(r.toFixed(2) + "x" + (c + l).toFixed(2), s, a - c + 16),
                                                    e.context.fillText(r.toFixed(2) + "x" + (c + l).toFixed(2), s, a - c + 16)));
                                    }),
                                    n.debugOptions.objects.enabled &&
                                        (n.debugOptions.objects.bounding && ((this.context.fillStyle = n.debugOptions.objects.bounding), this.context.beginPath(), this.context.rect(0, 0, w, v), this.context.fill()),
                                        n.debugOptions.objects.text &&
                                            ((this.context.fillStyle = "#ffffff"),
                                            (this.context.strokeStyle = "#000000"),
                                            (this.context.lineWidth = 2),
                                            (this.context.font = "8px monospace"),
                                            this.context.strokeText(w.toFixed(2) + "x" + v.toFixed(2), 0, 8, w),
                                            this.context.fillText(w.toFixed(2) + "x" + v.toFixed(2), 0, 8, w))),
                                    this.updateTexture();
                            }
                        }),
                        (n.prototype.wordWrap = function (t) {
                            var e = "",
                                o = this.getTagRegex(!0, !0),
                                i = t.split("\n"),
                                n = this.withPrivateMembers()._style.wordWrapWidth,
                                s = [this.assign({}, this.textStyles.default)];
                            this.context.font = this.getFontString(this.textStyles.default);
                            for (var a = 0; a < i.length; a++) {
                                for (var r = n, c = i[a].split(o), l = !0, d = 0; d < c.length; d++)
                                    if (o.test(c[d])) (e += c[d]), "/" === c[d][1] ? ((d += 2), s.pop()) : (s.push(this.assign({}, s[s.length - 1], this.textStyles[c[++d]])), d++), (this.context.font = this.getFontString(s[s.length - 1]));
                                    else
                                        for (var h = c[d].split(" "), p = 0; p < h.length; p++) {
                                            var u = this.context.measureText(h[p]).width;
                                            if (this.withPrivateMembers()._style.breakWords && u > r) {
                                                var m = h[p].split("");
                                                p > 0 && ((e += " "), (r -= this.context.measureText(" ").width));
                                                for (var y = 0; y < m.length; y++) {
                                                    var f = this.context.measureText(m[y]).width;
                                                    f > r ? ((e += "\n" + m[y]), (r = n - f)) : ((e += m[y]), (r -= f));
                                                }
                                            } else if (this.withPrivateMembers()._style.breakWords) (e += h[p]), (r -= u);
                                            else {
                                                var g = u + (p > 0 ? this.context.measureText(" ").width : 0);
                                                g > r ? (l || (e += "\n"), (e += h[p]), (r = n - u)) : ((r -= g), p > 0 && (e += " "), (e += h[p]));
                                            }
                                            l = !1;
                                        }
                                a < i.length - 1 && (e += "\n");
                            }
                            return e;
                        }),
                        (n.prototype.updateTexture = function () {
                            var t = this.withPrivateMembers()._texture,
                                e = this.getDropShadowPadding();
                            t.baseTexture.setRealSize(this.canvas.width, this.canvas.height, this.resolution),
                                (t.trim.width = t.frame.width = this.canvas.width / this.resolution),
                                (t.trim.height = t.frame.height = this.canvas.height / this.resolution),
                                (t.trim.x = -this.withPrivateMembers()._style.padding - e),
                                (t.trim.y = -this.withPrivateMembers()._style.padding - e),
                                (t.orig.width = t.frame.width - 2 * (this.withPrivateMembers()._style.padding + e)),
                                (t.orig.height = t.frame.height - 2 * (this.withPrivateMembers()._style.padding + e)),
                                this.withPrivateMembers()._onTextureUpdate(),
                                t.baseTexture.emit("update", t.baseTexture),
                                (this.withPrivateMembers().dirty = !1);
                        }),
                        (n.prototype.assign = function (t) {
                            for (var e = [], o = arguments.length - 1; o-- > 0; ) e[o] = arguments[o + 1];
                            for (var i = 0, n = e; i < n.length; i += 1) {
                                var s = n[i];
                                for (var a in s) t[a] = s[a];
                            }
                            return t;
                        }),
                        Object.defineProperties(n.prototype, s),
                        n
                    );
                })(t.Text);
            return (
                (i.DEFAULT_TAG_STYLE = {
                    align: "left",
                    breakWords: !1,
                    dropShadow: !1,
                    dropShadowAngle: Math.PI / 6,
                    dropShadowBlur: 0,
                    dropShadowColor: "#000000",
                    dropShadowDistance: 5,
                    fill: "black",
                    fillGradientType: t.TEXT_GRADIENT.LINEAR_VERTICAL,
                    fontFamily: "Arial",
                    fontSize: 26,
                    fontStyle: "normal",
                    fontVariant: "normal",
                    fontWeight: "normal",
                    letterSpacing: 0,
                    lineHeight: 0,
                    lineJoin: "miter",
                    miterLimit: 10,
                    padding: 0,
                    stroke: "black",
                    strokeThickness: 0,
                    textBaseline: "alphabetic",
                    valign: "baseline",
                    wordWrap: !1,
                    wordWrapWidth: 100,
                    tagStyle: "xml",
                }),
                (i.debugOptions = {
                    spans: { enabled: !1, baseline: "#44BB44", top: "#BB4444", bottom: "#4444BB", bounding: "rgba(255, 255, 255, 0.1)", text: !0 },
                    objects: { enabled: !1, bounding: "rgba(255, 255, 255, 0.05)", text: !0 },
                }),
                i
            );
        })(t.PIXI);
    })(this),
    (function (ct) {
        const t = document.querySelector(".ct-aLoadingScreen"),
            e = t.querySelector(".ct-aLoadingBar"),
            o = window.dragonBones ? dragonBones.PixiFactory.factory : null;
        (ct.res = {
            sounds: {},
            textures: {},
            skeletons: {},
            groups: {
                fonts: { ungrouped: ["BoldenVan", "BalooChettan-Regular", "wonderbar.regular"] },
                textures: {
                    ungrouped: ["Placeholder", "Bar", "BG", "Button_1_blues", "btnCont", "NewGame", "StackAgain", "btnContinue2", "btnContinue1", "CombiStackHowTo", "ProgressHolder", "Progress", "Shop_Now_button", "BackToMenu"],
                    Blocks: ["Block_yellow_ctcheese", "Block_green_combi", "Block_blue_ctc"],
                    Background: ["BG_Main", "BG_box", "BG_vector_element_1", "BG_vector_element_2", "Combi_FS_Cow", "Combi_FS_choco", "Holder"],
                    "Button Mechanics": ["Button_music", "Button_music_change_color", "Button_pause", "Button_mechanics_change_color", "Button_mechanics", "Button_pause_change_color"],
                    "Blue Block Reveal": ["Reveal_crackers", "Reveal_fillings", "Reveal_wafers"],
                    "Green Block Reveal": ["Reveal_combi"],
                    "Yellow Block Reveal": ["Reveal_yellow_rectangle", "Reveal_filling", "Reveal_cracker", "Reveal_wafer"],
                    Score: ["Score", "Score_box"],
                    Buttons: [
                        "Button_1_blue",
                        "Button_continue_change_color",
                        "Button_close_change_color",
                        "Button_New_game_change_color",
                        "Button_New_game",
                        "Button_close",
                        "Button_2_purple",
                        "Button_home",
                        "Button_home_change_color",
                        "Button_share",
                        "Button_share_change_color",
                        "Button_Stack_Again",
                        "Button_3_pink",
                        "HowTo",
                        "Close",
                        "StartGame",
                        "X",
                    ],
                    "Text & Others": [
                        "Text_gameover",
                        "Text_total_score",
                        "Scorebox",
                        "Cheese",
                        "Logolized_Combi_stack_blocks",
                        "Splash_yellow",
                        "Scorebox_with_elements_for_reference",
                        "Splash_chocolate",
                        "Main_Title_page",
                        "How_to_play",
                        "Star",
                        "Progress_bar",
                    ],
                },
                styles: { ungrouped: ["MainLabel", "CenterLabel", "ScoreLabel", "LevelLabel", "Gameover Score"] },
                rooms: { ungrouped: ["Main", "Game", "Game paused", "Game over", "How To"] },
                templates: {
                    ungrouped: ["BG", "btnContinue2", "btnContinue1", "CombiStackHowTo", "ProgressHolder", "Progress", "Shop_Now_button", "BackToMenu"],
                    "Text & BG": [
                        "Main_Title_page",
                        "Logolized_Combi_stack_blocks",
                        "BG_box",
                        "Combi_FS_choco",
                        "Combi_FS_Cow",
                        "Reveal_yellow_rectangle",
                        "BG_vector_element_1",
                        "BG_vector_element_2",
                        "BLACK",
                        "Scorebox_with_elements_for_reference",
                        "Text_gameover",
                        "Button_Stack_Again",
                        "Holder",
                        "Star",
                    ],
                    Buttons: [
                        "Button_2_purple",
                        "Close",
                        "HowTo",
                        "StartGame",
                        "How_to_play",
                        "btnPause",
                        "btnMusicOn",
                        "btnMechanics1",
                        "btnContinue",
                        "btnClose",
                        "btnNew",
                        "Button_1_blue",
                        "Button_3_pink",
                        "btnHome",
                        "Button_share",
                        "X",
                        "btnMusicOff",
                        "btnResume",
                        "btnMechanics2",
                        "btnCont1",
                        "NewGame",
                        "StackAgain",
                        "btnHome2",
                    ],
                    Box: ["BCrack", "BFill", "BWafer", "GCombi", "YCrack", "YFill", "YWafer"],
                    Score: ["Score", "Score_box"],
                    Blocks: ["blue", "green", "yellow"],
                },
                sounds: { ungrouped: ["8_bit", "bloop", "battle_sound", "sweep_notifs", "whoop", "button", "Sound_bQ7Lk2", "bgm", "pop", "levelup", "Sound_kFw56H", "click", "gameover"] },
                emitterTandems: { ungrouped: [] },
            },
            loadScript(t = ct.u.required("url", "ct.res.loadScript")) {
                var e = document.createElement("script");
                e.src = t;
                const o = new Promise((t, o) => {
                    (e.onload = () => {
                        t();
                    }),
                        (e.onerror = () => {
                            o();
                        });
                });
                return document.getElementsByTagName("head")[0].appendChild(e), o;
            },
            loadTexture(t = ct.u.required("url", "ct.res.loadTexture"), e = ct.u.required("name", "ct.res.loadTexture"), o = {}) {
                const i = new PIXI.Loader();
                return (
                    i.add(t, t),
                    new Promise((e, o) => {
                        i.load((t, o) => {
                            e(o);
                        }),
                            i.onError.add(() => {
                                o(new Error(`[ct.res] Could not load image ${t}`));
                            });
                    }).then((i) => {
                        const n = [i[t].texture];
                        return (n.shape = n[0].shape = o.shape || {}), (n[0].defaultAnchor = new PIXI.Point(o.anchor.x || 0, o.anchor.x || 0)), (ct.res.textures[e] = n), n;
                    })
                );
            },
            loadDragonBonesSkeleton(t, e, o, i = ct.u.required("name", "ct.res.loadDragonBonesSkeleton")) {
                const n = dragonBones.PixiFactory.factory,
                    s = new PIXI.Loader();
                return (
                    s.add(t, t).add(e, e).add(o, o),
                    new Promise((i, n) => {
                        s.load(() => {
                            i();
                        }),
                            s.onError.add(() => {
                                n(new Error(`[ct.res] Could not load skeleton with _ske.json: ${t}, _tex.json: ${e}, _tex.png: ${o}.`));
                            });
                    }).then(() => {
                        n.parseDragonBonesData(s.resources[t].data), n.parseTextureAtlasData(s.resources[e].data, s.resources[o].texture), (ct.res.skeletons[i] = s.resources[t].data);
                    })
                );
            },
            loadAtlas(t = ct.u.required("url", "ct.res.loadAtlas")) {
                const e = new PIXI.Loader();
                return (
                    e.add(t, t),
                    new Promise((o, i) => {
                        e.load((t, e) => {
                            o(e);
                        }),
                            e.onError.add(() => {
                                i(new Error(`[ct.res] Could not load atlas ${t}`));
                            });
                    }).then((e) => {
                        const o = e[t].spritesheet;
                        for (const t in o.animations) {
                            const e = o.animations[t],
                                i = o.data.animations;
                            for (let n = 0, s = i[t].length; n < s; n++) {
                                const s = i[t][n];
                                e[n].shape = o.data.frames[s].shape;
                            }
                            (e.shape = e[0].shape || {}), (ct.res.textures[t] = e);
                        }
                        return Object.keys(o.animations);
                    })
                );
            },
            loadBitmapFont(t = ct.u.required("url", "ct.res.loadBitmapFont"), e = ct.u.required("name", "ct.res.loadBitmapFont")) {
                const o = new PIXI.Loader();
                return (
                    o.add(e, t),
                    new Promise((e, i) => {
                        o.load((t, o) => {
                            e(o);
                        }),
                            o.onError.add(() => {
                                i(new Error(`[ct.res] Could not load bitmap font ${t}`));
                            });
                    })
                );
            },
            loadGame() {
                const o = [
                        "./img/a0.json",
                        "./img/a1.json",
                        "./img/a2.json",
                        "./img/a3.json",
                        "./img/a4.json",
                        "./img/a5.json",
                        "./img/a6.json",
                        "./img/a7.json",
                        "./img/a8.json",
                        "./img/a9.json",
                        "./img/a10.json",
                        "./img/a11.json",
                        "./img/a12.json",
                        "./img/a13.json",
                    ],
                    i = {},
                    n = [
                        { name: "8_bit", wav: !1, mp3: "./snd/cFHCtGQ39pd9Gr.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "bloop", wav: !1, mp3: "./snd/pp6nHChbhTH47b.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "battle_sound", wav: !1, mp3: "./snd/4NBRpBpM4zzdHg.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "sweep_notifs", wav: !1, mp3: "./snd/hbR2FWwb2Hm6Bp.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "whoop", wav: !1, mp3: "./snd/ctJ2zrrL8nC9fM.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "button", wav: !1, mp3: "./snd/gpddcw7jMm7h5f.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "Sound_bQ7Lk2", wav: !1, mp3: "./snd/PzHBqrqKbQ7Lk2.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "bgm", wav: !1, mp3: "./snd/dgwMFCBgTMFTCf.mp3", ogg: !1, poolSize: 5, isMusic: !0 },
                        { name: "pop", wav: !1, mp3: "./snd/3cDq469g3dDgf7.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "levelup", wav: !1, mp3: "./snd/gDQz5qMQQrdB4m.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "Sound_kFw56H", wav: !1, mp3: "./snd/WRMjKFQCkFw56H.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "click", wav: !1, mp3: "./snd/n4dD66c22F4J3L.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                        { name: "gameover", wav: !1, mp3: "./snd/Hw2bpD7gzLb95g.mp3", ogg: !1, poolSize: 5, isMusic: !1 },
                    ],
                    s = {},
                    a = [];
                if (n.length && !ct.sound) throw new Error("[ct.res] No sound system found. Make sure you enable one of the `sound` catmods. If you don't need sounds, remove them from your ct.js project.");
                const r = o.length;
                let c = 0;
                const l = [];
                l.push(
                    ...o.map((o) =>
                        ct.res.loadAtlas(o).then((o) => {
                            var i;
                            return c++, (i = (c / r) * 100), t.setAttribute("data-progress", i), (e.style.width = i + "%"), o;
                        })
                    )
                );
                for (const t in i) l.push(ct.res.loadTexture(i[t].source, t, { anchor: i[t].anchor, shape: i[t].shape }));
                for (const t in s) l.push(ct.res.loadBitmapFont(s[t], t));
                for (const t of a) l.push(ct.res.loadDragonBonesSkeleton(...t));
                for (const t of n) ct.sound.init(t.name, { wav: t.wav || !1, mp3: t.mp3 || !1, ogg: t.ogg || !1 }, { poolSize: t.poolSize, music: t.isMusic });
                Promise.all(l)
                    .then(() => {
                        ct.mouse.setupListeners(),
                            Object.defineProperty(ct.templates.Copy.prototype, "cgroup", {
                                set: function (t) {
                                    this.$cgroup = t;
                                },
                                get: function () {
                                    return this.$cgroup;
                                },
                            }),
                            Object.defineProperty(ct.templates.Copy.prototype, "moveContinuous", {
                                value: function (t, e) {
                                    return (
                                        this.gravity && ((this.hspeed += this.gravity * ct.delta * Math.cos((this.gravityDir * Math.PI) / 180)), (this.vspeed += this.gravity * ct.delta * Math.sin((this.gravityDir * Math.PI) / 180))),
                                        ct.place.moveAlong(this, this.direction, this.speed * ct.delta, t, e)
                                    );
                                },
                            }),
                            Object.defineProperty(ct.templates.Copy.prototype, "moveBullet", {
                                value: function (t, e) {
                                    return this.moveContinuous(t, e);
                                },
                            }),
                            Object.defineProperty(ct.templates.Copy.prototype, "moveContinuousByAxes", {
                                value: function (t, e) {
                                    return (
                                        this.gravity && ((this.hspeed += this.gravity * ct.delta * Math.cos((this.gravityDir * Math.PI) / 180)), (this.vspeed += this.gravity * ct.delta * Math.sin((this.gravityDir * Math.PI) / 180))),
                                        ct.place.moveByAxes(this, this.hspeed * ct.delta, this.vspeed * ct.delta, t, e)
                                    );
                                },
                            }),
                            Object.defineProperty(ct.templates.Copy.prototype, "moveSmart", {
                                value: function (t, e) {
                                    return this.moveContinuousByAxes(t, e);
                                },
                            }),
                            Object.defineProperty(ct.templates.Tilemap.prototype, "enableCollisions", {
                                value: function (t) {
                                    ct.place.enableTilemapCollisions(this, t);
                                },
                            }),
                            ct.pointer.setupListeners(),
                            t.classList.add("hidden"),
                            ct.pixiApp.ticker.add(ct.loop),
                            ct.rooms.forceSwitch(ct.rooms.starting);
                    })
                    .catch(console.error);
            },
            getTexture(t, e) {
                if ((null === e && (e = void 0), -1 === t)) return void 0 !== e ? PIXI.Texture.EMPTY : [PIXI.Texture.EMPTY];
                if (!(t in ct.res.textures)) throw new Error(`Attempt to get a non-existent texture ${t}`);
                const o = ct.res.textures[t];
                return void 0 !== e ? o[e] : o;
            },
            getTextureShape(t) {
                if (-1 === t) return {};
                if (!(t in ct.res.textures)) throw new Error(`Attempt to get a shape of a non-existent texture ${t}`);
                return ct.res.textures[t].shape;
            },
            makeSkeleton(t, e) {
                const i = ct.res.skeletons[t],
                    n = o.buildArmatureDisplay("Armature", i.name, e);
                return (
                    (n.ctName = t),
                    n.on(dragonBones.EventObject.SOUND_EVENT, function (t) {
                        ct.sound.exists(t.name) ? ct.sound.spawn(t.name) : console.warn(`Skeleton ${n.ctName} tries to play a non-existing sound ${t.name} at animation ${n.animation.lastAnimationName}`);
                    }),
                    n
                );
            },
        }),
            ct.res.loadGame();
    })(ct),
    (ct.content = JSON.parse('{"":[]}'));
let score = 0,
    paused = !1,
    firstRun = !0,
    yRange = 0;
var matchFound = !1,
    matchType = 0,
    tempScore = 0,
    levelup = !1,
    RearrangeGrid = function (t, e) {
        if (!t.rearranging) {
            if (((t.rearranging = !0), ct.camera.shake <= 0 && (ct.camera.shake += 0.1), null != t.preview[0])) for (let e = 0; e < t.preview.length; e++) t.preview[e].kill = !0;
            switch (e) {
                case 1:
                    (t.preview[0] = ct.templates.copy("BCrack", 1792, 1472)), (t.preview[1] = ct.templates.copy("BFill", 1984, 1472)), (t.preview[2] = ct.templates.copy("BWafer", 2176, 1472));
                    break;
                case 2:
                    (t.preview[0] = ct.templates.copy("GCombi", 1792, 1472)), (t.preview[1] = ct.templates.copy("GCombi", 1984, 1472)), (t.preview[2] = ct.templates.copy("GCombi", 2176, 1472));
                    break;
                case 3:
                    (t.preview[0] = ct.templates.copy("YCrack", 1792, 1472)), (t.preview[1] = ct.templates.copy("YFill", 1984, 1472)), (t.preview[2] = ct.templates.copy("YWafer", 2176, 1472));
            }
            if (null != t.preview[0]) for (let e = 0; e < t.preview.length; e++) (t.preview[e].scale.x = 0.5), (t.preview[e].scale.y = 0.5);
            for (let e = 0; e < t.grid[0].length; e++) {
                let o = 0;
                for (let i = t.grid.length - 1; i >= 0; i--)
                    0 === t.grid[i][e] ? o++ : o > 0 && ((t.grid[i + o][e] = t.grid[i][e]), (t.gridBlocks[i + o][e] = t.gridBlocks[i][e]), (t.gridBlocks[i][e].y += 256 * o), (t.grid[i][e] = 0), (t.gridBlocks[i][e] = null));
            }
            (t.rearranging = !1), CheckPattern(t);
        }
    },
    CheckPattern = function (t) {
        if (!(matchFound = !1))
            for (let e = 0; e < t.grid[0].length; e++)
                for (let o = 0; o < t.grid.length; o++)
                    t.grid[o][e] > 0 &&
                        t.grid[o][e] === t.grid[o][e + 1] &&
                        t.grid[o][e] === t.grid[o][e + 2] &&
                        ((matchType = t.grid[o][e]),
                        (t.grid[o][e] = 0),
                        (t.grid[o][e + 1] = 0),
                        (t.grid[o][e + 2] = 0),
                        (t.gridBlocks[o][e].matched = !0),
                        (t.gridBlocks[o][e + 1].matched = !0),
                        (t.gridBlocks[o][e + 2].matched = !0),
                        (t.gridBlocks[o][e] = null),
                        (t.gridBlocks[o][e + 1] = null),
                        (t.gridBlocks[o][e + 2] = null),
                        (score += 10),
                        paused || ct.sound.spawn("pop"),
                        (t.scoreLabel.text = score),
                        (tempScore += 10),
                        (t.progressBar.scale.x = tempScore / 60),
                        score % 60 == 0 && ((t.level += 1), (t.levelLabel.text = "Level " + t.level), (t.dropTime -= t.dropTime > 0.025 ? 0.025 : 0), paused || ct.sound.spawn("levelup"), (t.progressBar.scale.x = 0), (tempScore = 0)),
                        (matchFound = !0));
        if (!matchFound)
            for (let e = 0; e < t.grid[0].length; e++)
                for (let o = 0; o < t.grid.length - 2; o++)
                    t.grid[o][e] > 0 &&
                        t.grid[o][e] === t.grid[o + 1][e] &&
                        t.grid[o][e] === t.grid[o + 2][e] &&
                        ((matchType = t.grid[o][e]),
                        (t.grid[o][e] = 0),
                        (t.grid[o + 1][e] = 0),
                        (t.grid[o + 2][e] = 0),
                        (t.gridBlocks[o][e].matched = !0),
                        (t.gridBlocks[o + 1][e].matched = !0),
                        (t.gridBlocks[o + 2][e].matched = !0),
                        (t.gridBlocks[o][e] = null),
                        (t.gridBlocks[o + 1][e] = null),
                        (t.gridBlocks[o + 2][e] = null),
                        (score += 10),
                        paused || ct.sound.spawn("pop"),
                        (t.scoreLabel.text = score),
                        (tempScore += 10),
                        (t.progressBar.scale.x = tempScore / 60),
                        score % 60 == 0 && ((t.level += 1), (t.levelLabel.text = "Level " + t.level), (t.dropTime -= t.dropTime > 0.025 ? 0.025 : 0), paused || ct.sound.spawn("levelup"), (t.progressBar.scale.x = 0), (tempScore = 0)),
                        (matchFound = !0));
        if (!matchFound)
            for (let e = 0; e < t.grid[0].length - 2; e++)
                for (let o = 0; o < t.grid.length - 2; o++)
                    t.grid[o][e] > 0 &&
                        t.grid[o][e] === t.grid[o + 1][e + 1] &&
                        t.grid[o][e] === t.grid[o + 2][e + 2] &&
                        ((matchType = t.grid[o][e]),
                        (t.grid[o][e] = 0),
                        (t.grid[o + 1][e + 1] = 0),
                        (t.grid[o + 2][e + 2] = 0),
                        (t.gridBlocks[o][e].matched = !0),
                        (t.gridBlocks[o + 1][e + 1].matched = !0),
                        (t.gridBlocks[o + 2][e + 2].matched = !0),
                        (t.gridBlocks[o][e] = null),
                        (t.gridBlocks[o + 1][e + 1] = null),
                        (t.gridBlocks[o + 2][e + 2] = null),
                        (score += 10),
                        paused || ct.sound.spawn("pop"),
                        (t.scoreLabel.text = score),
                        (tempScore += 10),
                        (t.progressBar.scale.x = tempScore / 60),
                        score % 60 == 0 && ((t.level += 1), (t.levelLabel.text = "Level " + t.level), (t.dropTime -= t.dropTime > 0.025 ? 0.025 : 0), paused || ct.sound.spawn("levelup"), (t.progressBar.scale.x = 0), (tempScore = 0)),
                        (matchFound = !0));
        if (!matchFound)
            for (let e = 2; e < t.grid[0].length; e++)
                for (let o = 0; o < t.grid.length - 2; o++)
                    t.grid[o][e] > 0 &&
                        t.grid[o][e] === t.grid[o + 1][e - 1] &&
                        t.grid[o][e] === t.grid[o + 2][e - 2] &&
                        ((matchType = t.grid[o][e]),
                        (t.grid[o][e] = 0),
                        (t.grid[o + 1][e - 1] = 0),
                        (t.grid[o + 2][e - 2] = 0),
                        (t.gridBlocks[o][e].matched = !0),
                        (t.gridBlocks[o + 1][e - 1].matched = !0),
                        (t.gridBlocks[o + 2][e - 2].matched = !0),
                        (t.gridBlocks[o][e] = null),
                        (t.gridBlocks[o + 1][e - 1] = null),
                        (t.gridBlocks[o + 2][e - 2] = null),
                        (score += 10),
                        paused || ct.sound.spawn("pop"),
                        (t.scoreLabel.text = score),
                        (tempScore += 10),
                        (t.progressBar.scale.x = tempScore / 60),
                        score % 60 == 0 && ((t.level += 1), (t.levelLabel.text = "Level " + t.level), (t.dropTime -= t.dropTime > 0.025 ? 0.025 : 0), paused || ct.sound.spawn("levelup"), (t.progressBar.scale.x = 0), (tempScore = 0)),
                        (matchFound = !0));
        (levelup = score % 60 == 0), (t.dropped = !1), (t.timer2 = t.dropTime);
    };
