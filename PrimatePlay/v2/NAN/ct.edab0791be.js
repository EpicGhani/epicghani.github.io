(() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b ||= {})
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __accessCheck = (obj, member, msg) => {
    if (!member.has(obj))
      throw TypeError("Cannot " + msg);
  };
  var __privateGet = (obj, member, getter) => {
    __accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  };
  var __privateAdd = (obj, member, value) => {
    if (member.has(obj))
      throw TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  };
  var __privateSet = (obj, member, value, setter) => {
    __accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  };
  var __privateMethod = (obj, member, method) => {
    __accessCheck(obj, member, "access private method");
    return method;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // src/ct.release/timer.ts
  var ctTimerTime = Symbol("time");
  var ctTimerRoomUid = Symbol("roomUid");
  var ctTimerTimeLeftOriginal = Symbol("timeLeftOriginal");
  var promiseResolve = Symbol("promiseResolve");
  var promiseReject = Symbol("promiseReject");
  var CtTimer = class {
    /**
     * An object for holding a timer
     *
     * @param timeMs The length of the timer, **in milliseconds**
     * @param [name=false] The name of the timer
     * @param [uiDelta=false] If `true`, it will use `ct.deltaUi` for counting time.
     * if `false`, it will use `ct.delta` for counting time.
     */
    constructor(timeMs, name, uiDelta = false) {
      this.rejected = false;
      this.done = false;
      this.settled = false;
      this[ctTimerRoomUid] = rooms_default.current.uid || null;
      this.name = name && name.toString();
      this.isUi = uiDelta;
      this[ctTimerTime] = 0;
      this[ctTimerTimeLeftOriginal] = timeMs / 1e3;
      this.timeLeft = this[ctTimerTimeLeftOriginal];
      this.promise = new Promise((resolve, reject) => {
        this[promiseResolve] = resolve;
        this[promiseReject] = reject;
      });
      timerLib.timers.add(this);
    }
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     *
     * @param {Function} onfulfilled The callback to execute when the Promise is resolved.
     * @param {Function} [onrejected] The callback to execute when the Promise is rejected.
     * @returns {Promise} A Promise for the completion of which ever callback is executed.
     */
    then(arg) {
      return this.promise.then(arg);
    }
    /**
     * Attaches a callback for the rejection of the Promise.
     *
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    catch(onrejected) {
      return this.promise.catch(onrejected);
    }
    /**
     * The time passed on this timer, **in seconds**
     * @type {number}
     */
    get time() {
      return this[ctTimerTime];
    }
    set time(newTime) {
      this[ctTimerTime] = newTime;
    }
    /**
     * Updates the timer. **DONT CALL THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
     *
     * @returns {void}
     * @private
     */
    update() {
      if (this.rejected === true || this.done === true) {
        this.remove();
        return;
      }
      this[ctTimerTime] += this.isUi ? u_default.timeUi : u_default.time;
      if (rooms_default.current.uid !== this[ctTimerRoomUid] && this[ctTimerRoomUid] !== null) {
        this.reject({
          info: "Room has been switched",
          from: "timer"
        });
      }
      if (this.timeLeft !== 0) {
        this.timeLeft = this[ctTimerTimeLeftOriginal] - this.time;
        if (this.timeLeft <= 0) {
          this.resolve();
        }
      }
    }
    /**
     * Instantly triggers the timer and calls the callbacks added through `then` method.
     * @returns {void}
     */
    resolve() {
      if (this.settled) {
        return;
      }
      this.done = true;
      this.settled = true;
      this[promiseResolve]();
      this.remove();
    }
    /**
     * Stops the timer with a given message by rejecting a Promise object.
     * @param {any} message The value to pass to the `catch` callback
     * @returns {void}
     */
    reject(message) {
      if (this.settled) {
        return;
      }
      this.rejected = true;
      this.settled = true;
      this[promiseReject](message);
      this.remove();
    }
    /**
     * Removes the timer from ct.js game loop. This timer will not trigger.
     * @returns {void}
     */
    remove() {
      timerLib.timers.delete(this);
    }
  };
  ctTimerRoomUid, ctTimerTime, ctTimerTimeLeftOriginal, promiseResolve, promiseReject;
  var timerLib = {
    /**
     * A set with all the active timers.
     * @type Set<CtTimer>
     */
    timers: /* @__PURE__ */ new Set(),
    counter: 0,
    /**
     * Adds a new timer with a given name
     *
     * @param timeMs The length of the timer, **in milliseconds**
     * @param [name] The name of the timer, which you use
     * to access it from `ct.timer.timers`.
     * @returns {CtTimer} The timer
     */
    add(timeMs, name) {
      return new CtTimer(timeMs, name, false);
    },
    /**
     * Adds a new timer with a given name that runs in a UI time scale
     *
     * @param timeMs The length of the timer, **in milliseconds**
     * @param [name=false] The name of the timer, which you use
     * to access it from `ct.timer.timers`.
     * @returns The timer
     */
    addUi(timeMs, name) {
      return new CtTimer(timeMs, name, true);
    },
    /**
     * Updates the timers. **DONT CALL THIS UNLESS YOU KNOW WHAT YOU ARE DOING**
     *
     * @returns {void}
     * @private
     */
    updateTimers() {
      for (const timer of this.timers) {
        timer.update();
      }
    }
  };
  var timer_default = timerLib;

  // src/ct.release/sounds.ts
  var PannerFilter = class extends PIXI.sound.filters.Filter {
    constructor(refDistance, rolloffFactor) {
      const { audioContext } = PIXI.sound.context;
      const panner = audioContext.createPanner();
      panner.panningModel = "equalpower";
      panner.distanceModel = "inverse";
      panner.refDistance = refDistance;
      panner.rolloffFactor = rolloffFactor;
      const destination = panner;
      super(destination);
      this._panner = panner;
    }
    reposition(tracked) {
      if (tracked.kill) {
        return;
      }
      this._panner.positionX.value = tracked.x / camera.referenceLength;
      this._panner.positionY.value = tracked.y / camera.referenceLength;
    }
    destroy() {
      super.destroy();
      this._panner = null;
    }
  };
  var pannedSounds = /* @__PURE__ */ new Map();
  var _a;
  var exportedSounds = (_a = [
    []
  ][0]) != null ? _a : [];
  var soundMap = {};
  for (const exportedSound of exportedSounds) {
    soundMap[exportedSound.name] = exportedSound;
  }
  var pixiSoundInstances = {};
  var fxNames = Object.keys(PIXI.sound.filters).filter((name) => name !== "Filter" && name !== "StreamFilter");
  var fxNamesToClasses = {};
  for (const fxName of fxNames) {
    fxNamesToClasses[fxName] = PIXI.sound.filters[fxName];
  }
  var pixiSoundPrefix = "pixiSound-";
  var randomRange = (min, max) => Math.random() * (max - min) + min;
  var withSound = (name, fn) => {
    const pixiFind = PIXI.sound.exists(name) && PIXI.sound.find(name);
    if (pixiFind) {
      return fn(pixiFind, name);
    }
    if (name in pixiSoundInstances) {
      return fn(pixiSoundInstances[name], name);
    }
    if (name in soundMap) {
      let lastVal;
      for (const variant of soundMap[name].variants) {
        const assetName = `${pixiSoundPrefix}${variant.uid}`;
        lastVal = fn(pixiSoundInstances[assetName], assetName);
      }
      return lastVal;
    }
    throw new Error(`[sounds] Sound "${name}" was not found. Is it a typo?`);
  };
  var playVariant = (sound, variant, options) => {
    var _a2, _b, _c, _d, _e;
    const pixiSoundInst = PIXI.sound.find(`${pixiSoundPrefix}${variant.uid}`).play(options);
    if ((_a2 = sound.volume) == null ? void 0 : _a2.enabled) {
      pixiSoundInst.volume = randomRange(sound.volume.min, sound.volume.max) * ((options == null ? void 0 : options.volume) || 1);
    } else if ((options == null ? void 0 : options.volume) !== void 0) {
      pixiSoundInst.volume = options.volume;
    }
    if ((_b = sound.pitch) == null ? void 0 : _b.enabled) {
      pixiSoundInst.speed = randomRange(sound.pitch.min, sound.pitch.max) * ((options == null ? void 0 : options.speed) || 1);
    } else if ((options == null ? void 0 : options.speed) !== void 0) {
      pixiSoundInst.speed = options.speed;
    }
    if ((_c = sound.distortion) == null ? void 0 : _c.enabled) {
      soundsLib.addDistortion(
        pixiSoundInst,
        randomRange(sound.distortion.min, sound.distortion.max)
      );
    }
    if ((_d = sound.reverb) == null ? void 0 : _d.enabled) {
      soundsLib.addReverb(
        pixiSoundInst,
        randomRange(sound.reverb.secondsMin, sound.reverb.secondsMax),
        randomRange(sound.reverb.decayMin, sound.reverb.decayMax),
        sound.reverb.reverse
      );
    }
    if ((_e = sound.eq) == null ? void 0 : _e.enabled) {
      soundsLib.addEqualizer(
        pixiSoundInst,
        ...sound.eq.bands.map((band) => randomRange(band.min, band.max))
        // 🍝
      );
    }
    return pixiSoundInst;
  };
  var playRandomVariant = (sound, options) => {
    const variant = sound.variants[Math.floor(Math.random() * sound.variants.length)];
    return playVariant(sound, variant, options);
  };
  var soundsLib = {
    /**
     * Preloads a sound. This is usually applied to music files before playing
     * as they are not preloaded by default.
     *
     * @param {string} name The name of a sound
     * @returns {Promise<string>} A promise that resolves into the name of the loaded sound asset.
     */
    load(name) {
      return __async(this, null, function* () {
        const promises = [];
        withSound(name, (soundRes, resName) => {
          const s = PIXI.sound.play(resName, {
            muted: true
          });
          if (s instanceof Promise) {
            promises.push(s);
            s.then((i) => {
              i.stop();
            });
          } else {
            s.stop();
          }
        });
        yield Promise.all(promises);
        return name;
      });
    },
    /**
     * Plays a sound.
     *
     * @param {string} name Sound's name
     * @param {PlayOptions} [options] Options used for sound playback.
     * @param {Function} options.complete When completed.
     * @param {number} options.end End time in seconds.
     * @param {filters.Filter[]} options.filters Filters that apply to play.
     * @param {Function} options.loaded If not already preloaded, callback when finishes load.
     * @param {boolean} options.loop Override default loop, default to the Sound's loop setting.
     * @param {boolean} options.muted If sound instance is muted by default.
     * @param {boolean} options.singleInstance Setting true will stop any playing instances.
     * @param {number} options.speed Override default speed, default to the Sound's speed setting.
     * @param {number} options.start Start time offset in seconds.
     * @param {number} options.volume Override default volume.
     * @returns Either a sound instance, or a promise that resolves into a sound instance.
     */
    play(name, options) {
      if (name in soundMap) {
        const exported = soundMap[name];
        return playRandomVariant(exported, options);
      }
      if (name in pixiSoundInstances) {
        return pixiSoundInstances[name].play(options);
      }
      throw new Error(`[sounds.play] Sound "${name}" was not found. Is it a typo?`);
    },
    playAt(name, position, options) {
      const sound = soundsLib.play(name, options);
      const { panning } = soundMap[name];
      if (sound instanceof Promise) {
        sound.then((instance) => {
          soundsLib.addPannerFilter(
            instance,
            position,
            panning.refDistance,
            panning.rolloffFactor
          );
        });
      } else {
        soundsLib.addPannerFilter(
          sound,
          position,
          panning.refDistance,
          panning.rolloffFactor
        );
      }
      return sound;
    },
    /**
     * Stops a sound if a name is specified, otherwise stops all sound.
     *
     * @param {string|IMediaInstance} [name] Sound's name, or the sound instance.
     *
     * @returns {void}
     */
    stop(name) {
      if (name) {
        if (typeof name === "string") {
          withSound(name, (sound) => sound.stop());
        } else {
          name.stop();
        }
      } else {
        PIXI.sound.stopAll();
      }
    },
    /**
     * Pauses a sound if a name is specified, otherwise pauses all sound.
     *
     * @param {string} [name] Sound's name
     *
     * @returns {void}
     */
    pause(name) {
      if (name) {
        withSound(name, (sound) => sound.pause());
      } else {
        PIXI.sound.pauseAll();
      }
    },
    /**
     * Resumes a sound if a name is specified, otherwise resumes all sound.
     *
     * @param {string} [name] Sound's name
     *
     * @returns {void}
     */
    resume(name) {
      if (name) {
        withSound(name, (sound) => sound.resume());
      } else {
        PIXI.sound.resumeAll();
      }
    },
    /**
     * Returns whether a sound with the specified name was added to the game.
     * This doesn't tell whether it is fully loaded or not, it only checks
     * for existance of sound's metadata in your game.
     *
     * @param {string} name Sound's name
     *
     * @returns {boolean}
     */
    exists(name) {
      return name in soundMap || name in pixiSoundInstances;
    },
    /**
     * Returns whether a sound is currently playing if a name is specified,
     * otherwise if any sound is currently playing.
     *
     * @param {string} [name] Sound's name
     *
     * @returns {boolean} `true` if the sound is playing, `false` otherwise.
     */
    playing(name) {
      if (!name) {
        return PIXI.sound.isPlaying();
      }
      if (name in pixiSoundInstances) {
        return pixiSoundInstances[name].isPlaying;
      } else if (name in soundMap) {
        for (const variant of soundMap[name].variants) {
          if (pixiSoundInstances[`${pixiSoundPrefix}${variant.uid}`].isPlaying) {
            return true;
          }
        }
      } else {
        throw new Error(`[sounds] Sound "${name}" was not found. Is it a typo?`);
      }
      return false;
    },
    /**
     * Get or set the volume for a sound.
     *
     * @param {string|IMediaInstance} name Sound's name or instance
     * @param {number} [volume] The new volume where 1 is 100%.
     * If empty, will return the existing volume.
     *
     * @returns {number} The current volume of the sound.
     */
    volume(name, volume) {
      if (volume !== void 0) {
        if (typeof name === "string") {
          withSound(name, (sound) => {
            sound.volume = volume;
          });
        } else {
          name.volume = volume;
        }
      }
      if (typeof name === "string") {
        return withSound(name, (sound) => sound.volume);
      }
      return name.volume;
    },
    /**
     * Set the global volume for all sounds.
     * @param {number} value The new volume where 1 is 100%.
     *
     */
    globalVolume(value) {
      PIXI.sound.volumeAll = value;
    },
    /**
     * Fades a sound to a given volume. Can affect either a specific instance or the whole group.
     *
     * @param [name] Sound's name or instance to affect. If null, all sounds are faded.
     * @param [newVolume] The new volume where 1 is 100%. Default is 0.
     * @param [duration] The duration of transition, in milliseconds. Default is 1000.
     */
    fade(name, newVolume = 0, duration = 1e3) {
      const start = {
        time: performance.now(),
        value: null
      };
      if (name) {
        start.value = soundsLib.volume(name);
      } else {
        start.value = PIXI.sound.context.volume;
      }
      const updateVolume = (currentTime) => {
        const elapsed = currentTime - start.time;
        const progress = Math.min(elapsed / duration, 1);
        const value = start.value + (newVolume - start.value) * progress;
        if (name) {
          soundsLib.volume(name, value);
        } else {
          soundsLib.globalVolume(value);
        }
        if (progress < 1) {
          requestAnimationFrame(updateVolume);
        }
      };
      requestAnimationFrame(updateVolume);
    },
    /**
     * Adds a filter to the specified sound and remembers its constructor name.
     * This method is not intended to be called directly.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     */
    addFilter(sound, filter, filterName) {
      const fx = filter;
      fx.preserved = filterName;
      if (sound === false) {
        PIXI.sound.filtersAll = [...PIXI.sound.filtersAll || [], fx];
      } else if (typeof sound === "string") {
        withSound(sound, (soundInst) => {
          soundInst.filters = [...soundInst.filters || [], fx];
        });
      } else if (sound) {
        sound.filters = [...sound.filters || [], fx];
      } else {
        throw new Error(`[sounds.addFilter] Invalid sound: ${sound}`);
      }
    },
    /**
     * Adds a distortion filter.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     * @param {number} amount The amount of distortion to set from 0 to 1. Default is 0.
     */
    addDistortion(sound, amount) {
      const fx = new PIXI.sound.filters.DistortionFilter(amount);
      soundsLib.addFilter(sound, fx, "DistortionFilter");
      return fx;
    },
    /**
     * Adds an equalizer filter.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     * @param {number} f32 Default gain for 32 Hz. Default is 0.
     * @param {number} f64 Default gain for 64 Hz. Default is 0.
     * @param {number} f125 Default gain for 125 Hz. Default is 0.
     * @param {number} f250 Default gain for 250 Hz. Default is 0.
     * @param {number} f500 Default gain for 500 Hz. Default is 0.
     * @param {number} f1k Default gain for 1000 Hz. Default is 0.
     * @param {number} f2k Default gain for 2000 Hz. Default is 0.
     * @param {number} f4k Default gain for 4000 Hz. Default is 0.
     * @param {number} f8k Default gain for 8000 Hz. Default is 0.
     * @param {number} f16k Default gain for 16000 Hz. Default is 0.
     */
    // eslint-disable-next-line max-params
    addEqualizer(sound, f32, f64, f125, f250, f500, f1k, f2k, f4k, f8k, f16k) {
      const fx = new PIXI.sound.filters.EqualizerFilter(f32, f64, f125, f250, f500, f1k, f2k, f4k, f8k, f16k);
      soundsLib.addFilter(sound, fx, "EqualizerFilter");
      return fx;
    },
    /**
     * Combine all channels into mono channel.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     */
    addMonoFilter(sound) {
      const fx = new PIXI.sound.filters.MonoFilter();
      soundsLib.addFilter(sound, fx, "MonoFilter");
      return fx;
    },
    /**
     * Adds a reverb filter.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     * @param {number} seconds Seconds for reverb. Default is 3.
     * @param {number} decay The decay length. Default is 2.
     * @param {boolean} reverse Reverse reverb. Default is false.
     */
    addReverb(sound, seconds, decay, reverse) {
      const fx = new PIXI.sound.filters.ReverbFilter(seconds, decay, reverse);
      soundsLib.addFilter(sound, fx, "ReverbFilter");
      return fx;
    },
    /**
     * Adds a filter for stereo panning.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     * @param {number} pan The amount of panning: -1 is left, 1 is right. Default is 0 (centered).
     */
    addStereoFilter(sound, pan) {
      const fx = new PIXI.sound.filters.StereoFilter(pan);
      soundsLib.addFilter(sound, fx, "StereoFilter");
      return fx;
    },
    /**
     * Adds a 3D sound filter.
     * This filter can only be applied to sound instances.
     *
     * @param sound The sound to apply effect to.
     * @param position Any object with x and y properties — for example, copies.
     */
    addPannerFilter(sound, position, refDistance, rolloffFactor) {
      const fx = new PannerFilter(refDistance, rolloffFactor);
      soundsLib.addFilter(sound, fx, "PannerFilter");
      pannedSounds.set(position, fx);
      sound.on("end", () => {
        pannedSounds.delete(position);
      });
      return fx;
    },
    /**
     * Adds a telephone-sound filter.
     *
     * @param sound If set to false, applies the filter globally.
     * If set to a string, applies the filter to the specified sound asset.
     * If set to a media instance or PIXI.Sound instance, applies the filter to it.
     */
    addTelephone(sound) {
      const fx = new PIXI.sound.filters.TelephoneFilter();
      soundsLib.addFilter(sound, fx, "TelephoneFilter");
      return fx;
    },
    /**
     * Remove a filter to the specified sound.
     *
     * @param {string} [name] The sound to affect. Can be a name of the sound asset
     * or the specific sound instance you get from running `sounds.play`.
     * If set to false, it affects all sounds.
     * @param {string} [filter] The name of the filter. If omitted, all the filters are removed.
     *
     * @returns {void}
     */
    removeFilter(name, filter) {
      const setFilters = (newFilters) => {
        if (typeof name === "string") {
          withSound(name, (soundInst) => {
            soundInst.filters = newFilters;
          });
        } else {
          name.filters = newFilters;
        }
      };
      if (!name && !filter) {
        PIXI.sound.filtersAll = [];
        return;
      }
      if (name && !filter) {
        setFilters([]);
        return;
      }
      let filters;
      if (!name) {
        filters = PIXI.sound.filtersAll;
      } else {
        filters = typeof name === "string" ? withSound(name, (soundInst) => soundInst.filters) : name.filters;
      }
      if (filter && !filter.includes("Filter")) {
        filter += "Filter";
      }
      const copy = [...filters];
      filters.forEach((f, i) => {
        if (f.preserved === filter) {
          copy.splice(i, 1);
        }
      });
      if (!name) {
        PIXI.sound.filtersAll = copy;
      } else {
        setFilters(copy);
      }
    },
    /**
     * Set the speed (playback rate) of a sound.
     *
     * @param {string|IMediaInstance} name Sound's name or instance
     * @param {number} [value] The new speed, where 1 is 100%.
     * If empty, will return the existing speed value.
     *
     * @returns {number} The current speed of the sound.
     */
    speed(name, value) {
      if (value) {
        if (typeof name === "string") {
          withSound(name, (sound) => {
            sound.speed = value;
          });
        } else {
          name.speed = value;
        }
        return value;
      }
      if (typeof name === "string") {
        if (name in soundMap) {
          return pixiSoundInstances[soundMap[name].variants[0].uid].speed;
        }
        if (name in pixiSoundInstances) {
          return pixiSoundInstances[name].speed;
        }
        throw new Error(`[sounds.speed] Invalid sound name: ${name}. Is it a typo?`);
      }
      return name.speed;
    },
    /**
     * Set the global speed (playback rate) for all sounds.
     * @param {number} value The new speed, where 1 is 100%.
     *
     */
    speedAll(value) {
      PIXI.sound.speedAll = value;
    },
    /**
    * Toggle muted property for all sounds.
    * @returns {boolean} `true` if all sounds are muted.
    */
    toggleMuteAll() {
      return PIXI.sound.toggleMuteAll();
    },
    /**
    * Toggle paused property for all sounds.
    * @returns {boolean} `true` if all sounds are paused.
    */
    togglePauseAll() {
      return PIXI.sound.togglePauseAll();
    }
  };
  var sounds_default = soundsLib;

  // src/ct.release/res.ts
  var loadingScreen = document.querySelector(".ct-aLoadingScreen");
  var loadingBar = loadingScreen.querySelector(".ct-aLoadingBar");
  var normalizeAssetPath = (path) => {
    path = path.replace(/\\/g, "/");
    if (path[0] === "/") {
      path = path.slice(1);
    }
    return path.split("/").filter((empty) => empty);
  };
  var getEntriesByPath = (nPath) => {
    if (!resLib.tree) {
      throw new Error("[res] Asset tree was not exported; check your project's export settings.");
    }
    let current = resLib.tree;
    for (const subpath of nPath) {
      const folder = current.find((i) => i.name === subpath && i.type === "folder");
      if (!folder) {
        throw new Error(`[res] Could not find folder ${subpath} in path ${nPath.join("/")}`);
      }
      current = folder.entries;
    }
    return current;
  };
  var resLib = {
    sounds: soundMap,
    pixiSounds: pixiSoundInstances,
    textures: {},
    tree: [
      false
    ][0],
    /**
     * Loads and executes a script by its URL
     * @param {string} url The URL of the script file, with its extension.
     * Can be relative or absolute.
     * @returns {Promise<void>}
     * @async
     */
    loadScript(url = required("url", "ct.res.loadScript")) {
      var script = document.createElement("script");
      script.src = url;
      const promise = new Promise((resolve, reject) => {
        script.onload = () => {
          resolve();
        };
        script.onerror = () => {
          reject();
        };
      });
      document.getElementsByTagName("head")[0].appendChild(script);
      return promise;
    },
    /**
     * Loads an individual image as a named ct.js texture.
     * @param {string|boolean} url The path to the source image.
     * @param {string} name The name of the resulting ct.js texture
     * as it will be used in your code.
     * @param {ITextureOptions} textureOptions Information about texture's axis
     * and collision shape.
     * @returns {Promise<CtjsAnimation>} The imported animation, ready to be used.
     */
    loadTexture() {
      return __async(this, arguments, function* (url = required("url", "ct.res.loadTexture"), name = required("name", "ct.res.loadTexture"), textureOptions = {}) {
        let texture;
        try {
          texture = yield PIXI.Assets.load(url);
        } catch (e) {
          console.error(`[ct.res] Could not load image ${url}`);
          throw e;
        }
        const ctTexture = [texture];
        ctTexture.shape = texture.shape = textureOptions.shape || {};
        texture.defaultAnchor = ctTexture.defaultAnchor = new PIXI.Point(
          textureOptions.anchor.x || 0,
          textureOptions.anchor.x || 0
        );
        const hitArea = u_default.getHitArea(texture.shape);
        if (hitArea) {
          texture.hitArea = ctTexture.hitArea = hitArea;
        }
        resLib.textures[name] = ctTexture;
        return ctTexture;
      });
    },
    /**
     * Loads a Texture Packer compatible .json file with its source image,
     * adding ct.js textures to the game.
     * @param {string} url The path to the JSON file that describes the atlas' textures.
     * @returns A promise that resolves into an array
     * of all the loaded textures' names.
     */
    loadAtlas() {
      return __async(this, arguments, function* (url = required("url", "ct.res.loadAtlas")) {
        const sheet = yield PIXI.Assets.load(url);
        for (const animation in sheet.animations) {
          const tex = sheet.animations[animation];
          const animData = sheet.data.animations;
          for (let i = 0, l = animData[animation].length; i < l; i++) {
            const a = animData[animation], f = a[i];
            tex[i].shape = sheet.data.frames[f].shape;
          }
          tex.shape = tex[0].shape || {};
          resLib.textures[animation] = tex;
          const hitArea = u_default.getHitArea(resLib.textures[animation].shape);
          if (hitArea) {
            resLib.textures[animation].hitArea = hitArea;
            for (const frame of resLib.textures[animation]) {
              frame.hitArea = hitArea;
            }
          }
        }
        return Object.keys(sheet.animations);
      });
    },
    /**
     * Unloads the specified atlas by its URL and removes all the textures
     * it has introduced to the game.
     * Will do nothing if the specified atlas was not loaded (or was already unloaded).
     */
    unloadAtlas() {
      return __async(this, arguments, function* (url = required("url", "ct.res.unloadAtlas")) {
        const { animations } = PIXI.Assets.get(url);
        if (!animations) {
          console.log(`[ct.res] Attempt to unload an atlas that was not loaded/was unloaded already: ${url}`);
          return;
        }
        for (const animation of animations) {
          delete resLib.textures[animation];
        }
        yield PIXI.Assets.unload(url);
      });
    },
    /**
     * Loads a bitmap font by its XML file.
     * @param url The path to the XML file that describes the bitmap fonts.
     * @returns A promise that resolves into the font's name (the one you've passed with `name`).
     */
    loadBitmapFont() {
      return __async(this, arguments, function* (url = required("url", "ct.res.loadBitmapFont")) {
        yield PIXI.Assets.load(url);
      });
    },
    unloadBitmapFont() {
      return __async(this, arguments, function* (url = required("url", "ct.res.unloadBitmapFont")) {
        yield PIXI.Assets.unload(url);
      });
    },
    /**
     * Loads a sound.
     * @param path Path to the sound
     * @param name The name of the sound as it will be used in ct.js game.
     * @param preload Whether to start loading now or postpone it.
     * Postponed sounds will load when a game tries to play them, or when you manually
     * trigger the download with `sounds.load(name)`.
     * @returns A promise with the name of the imported sound.
     */
    loadSound(path = required("path", "ct.res.loadSound"), name = required("name", "ct.res.loadSound"), preload = true) {
      return new Promise((resolve, reject) => {
        const asset = PIXI.sound.add(name, {
          url: path,
          preload,
          loaded: preload ? (err) => {
            if (err) {
              reject(err);
            } else {
              resLib.pixiSounds[name] = asset;
              resolve(name);
            }
          } : void 0
        });
        if (!preload) {
          resolve(name);
        }
      });
    },
    loadGame() {
      return __async(this, null, function* () {
        const changeProgress = (percents) => {
          loadingScreen.setAttribute("data-progress", String(percents));
          loadingBar.style.width = percents + "%";
        };
        const atlases = [
          ["./img/a0.{webp,png}.40fec0dac7.json","./img/a1.{webp,png}.dcae61c014.json","./img/a2.{webp,png}.affb7af63d.json","./img/a3.{webp,png}.178d417173.json","./img/a4.{webp,png}.cfbffa7ac4.json","./img/a5.{webp,png}.4a3e6b3d50.json","./img/a6.{webp,png}.87ef85a7e1.json"]
        ][0];
        const tiledImages = [
          {}
        ][0];
        const bitmapFonts = [
          {"Geist-Regular_400":"BdNGWmNGgrKJNN.xml","Ridley Grotesk Bold_400":"5n8W6R95fPfwNn.xml","Trade Gothic LT Bold_400":"qcb9tjtrQNm7H4.xml"}
        ][0];
        const totalAssets = atlases.length;
        let assetsLoaded = 0;
        const loadingPromises = [];
        loadingPromises.push(...atlases.map((atlas) => resLib.loadAtlas(atlas).then((texturesNames) => {
          assetsLoaded++;
          changeProgress(assetsLoaded / totalAssets * 100);
          return texturesNames;
        })));
        for (const name in tiledImages) {
          loadingPromises.push(resLib.loadTexture(
            tiledImages[name].source,
            name,
            {
              anchor: tiledImages[name].anchor,
              shape: tiledImages[name].shape
            }
          ));
        }
        for (const font in bitmapFonts) {
          loadingPromises.push(resLib.loadBitmapFont(bitmapFonts[font]));
        }
        for (const sound of exportedSounds) {
          for (const variant of sound.variants) {
            loadingPromises.push(resLib.loadSound(
              variant.source,
              `${pixiSoundPrefix}${variant.uid}`,
              sound.preload
            ));
          }
        }
        /*!@res@*/
        
        yield Promise.all(loadingPromises);
        loadingScreen.classList.add("hidden");
      });
    },
    /**
     * Gets a pixi.js texture from a ct.js' texture name,
     * so that it can be used in pixi.js objects.
     * @param name The name of the ct.js texture, or -1 for an empty texture
     * @param [frame] The frame to extract
     * @returns {PIXI.Texture|PIXI.Texture[]} If `frame` was specified,
     * returns a single PIXI.Texture. Otherwise, returns an array
     * with all the frames of this ct.js' texture.
     */
    getTexture: (name, frame) => {
      if (frame === null) {
        frame = void 0;
      }
      if (name === -1) {
        if (frame !== void 0) {
          return PIXI.Texture.EMPTY;
        }
        return [PIXI.Texture.EMPTY];
      }
      if (!(name in resLib.textures)) {
        throw new Error(`Attempt to get a non-existent texture ${name}`);
      }
      const tex = resLib.textures[name];
      if (frame !== void 0) {
        return tex[frame];
      }
      return tex;
    },
    /**
     * Returns the collision shape of the given texture.
     * @param name The name of the ct.js texture, or -1 for an empty collision shape
     */
    getTextureShape(name) {
      if (name === -1) {
        return {
          type: "point"
        };
      }
      if (!(name in resLib.textures)) {
        throw new Error(`Attempt to get a shape of a non-existent texture ${name}`);
      }
      return resLib.textures[name].shape;
    },
    /**
     * Gets direct children of a folder
     */
    getChildren(path) {
      return getEntriesByPath(normalizeAssetPath(path || "")).filter((entry) => entry.type !== "folder");
    },
    /**
     * Gets direct children of a folder, filtered by asset type
     */
    getOfType(type, path) {
      return getEntriesByPath(normalizeAssetPath(path || "")).filter((entry) => entry.type === type);
    },
    /**
     * Gets all the assets inside of a folder, including in subfolders.
     */
    getAll(path) {
      const folderEntries = getEntriesByPath(normalizeAssetPath(path || "")), entries = [];
      const walker = (currentList) => {
        for (const entry of currentList) {
          if (entry.type === "folder") {
            walker(entry.entries);
          } else {
            entries.push(entry);
          }
        }
      };
      walker(folderEntries);
      return entries;
    },
    /**
     * Get all the assets inside of a folder, including in subfolders, filtered by type.
     */
    getAllOfType(type, path) {
      const folderEntries = getEntriesByPath(normalizeAssetPath(path || "")), entries = [];
      const walker = (currentList) => {
        for (const entry of currentList) {
          if (entry.type === "folder") {
            walker(entry.entries);
          }
          if (entry.type === type) {
            entries.push(entry);
          }
        }
      };
      walker(folderEntries);
      return entries;
    }
  };
  if (document.fonts) { for (const font of document.fonts) { font.load(); }}
  var res_default = resLib;

  // src/ct.release/backgrounds.ts
  var bgList = {};
  var Background = class extends PIXI.TilingSprite {
    constructor(texName, frame = 0, depth = 0, exts = {
      movementX: 0,
      movementY: 0,
      parallaxX: 0,
      parallaxY: 0,
      repeat: "repeat",
      scaleX: 0,
      scaleY: 0,
      shiftX: 0,
      shiftY: 0
    }) {
      let { width, height } = camera_default;
      const texture = texName instanceof PIXI.Texture ? texName : res_default.getTexture(texName, frame || 0);
      if (exts.repeat === "no-repeat" || exts.repeat === "repeat-x") {
        height = texture.height * (exts.scaleY || 1);
      }
      if (exts.repeat === "no-repeat" || exts.repeat === "repeat-y") {
        width = texture.width * (exts.scaleX || 1);
      }
      super(texture, width, height);
      this.parallaxX = 1;
      this.parallaxY = 1;
      this.shiftX = 0;
      this.shiftY = 0;
      this.movementX = 0;
      this.movementY = 0;
      if (typeof texName === "string") {
        if (!bgList[texName]) {
          bgList[texName] = [];
        }
        bgList[texName].push(this);
      } else {
        if (!bgList.OTHER) {
          bgList.OTHER = [];
        }
        bgList.OTHER.push(this);
      }
      templates_default.list.BACKGROUND.push(this);
      stack.push(this);
      this.on("destroyed", () => {
        templates_default.list.BACKGROUND.splice(templates_default.list.BACKGROUND.indexOf(this), 1);
        stack.splice(stack.indexOf(this), 1);
      });
      this.zIndex = depth;
      this.anchor.set(0, 0);
      if (exts) {
        Object.assign(this, exts);
      }
      if (this.scaleX) {
        this.tileScale.x = Number(this.scaleX);
      }
      if (this.scaleY) {
        this.tileScale.y = Number(this.scaleY);
      }
      this.reposition();
    }
    onStep() {
      this.shiftX += u_default.time * this.movementX;
      this.shiftY += u_default.time * this.movementY;
    }
    /**
     * Updates the position of this background.
     */
    reposition() {
      const cameraBounds = this.isUi ? {
        x: 0,
        y: 0,
        width: camera_default.width,
        height: camera_default.height
      } : camera_default.getBoundingBox();
      const dx = camera_default.x - camera_default.width / 2, dy = camera_default.y - camera_default.height / 2;
      if (this.repeat !== "repeat-x" && this.repeat !== "no-repeat") {
        this.y = cameraBounds.y;
        this.tilePosition.y = -this.y - dy * (this.parallaxY - 1) + this.shiftY;
        this.height = cameraBounds.height + 1;
      } else {
        this.y = this.shiftY + cameraBounds.y * (this.parallaxY - 1);
      }
      if (this.repeat !== "repeat-y" && this.repeat !== "no-repeat") {
        this.x = cameraBounds.x;
        this.tilePosition.x = -this.x - dx * (this.parallaxX - 1) + this.shiftX;
        this.width = cameraBounds.width + 1;
      } else {
        this.x = this.shiftX + cameraBounds.x * (this.parallaxX - 1);
      }
    }
    onDraw() {
      this.reposition();
    }
    static onCreate() {
    }
    static onDestroy() {
    }
    get isUi() {
      return this.parent ? Boolean(this.parent.isUi) : false;
    }
  };
  var backgroundsLib = {
    /**
     * An object that contains all the backgrounds of the current room.
     * @type {Record<string, Background[]>}
     */
    list: bgList,
    /**
     * @param texName - Name of a texture to use as a background
     * @param [frame] - The index of a frame to use. Defaults to 0
     * @param [depth] - The depth to place the background at. Defaults to 0
     * @param [container] - Where to put the background. Defaults to current room,
     * can be a room or other pixi container.
     * @returns {Background} The created background
     */
    add(texName, frame = 0, depth = 0, container) {
      if (!container) {
        container = rooms_default.current;
      }
      if (!texName) {
        throw new Error("[backgrounds] The texName argument is required.");
      }
      const bg = new Background(texName, frame, depth);
      if (container instanceof Room) {
        container.backgrounds.push(bg);
      }
      container.addChild(bg);
      return bg;
    }
  };
  var backgrounds_default = backgroundsLib;

  // src/ct.release/tilemaps.ts
  var Tile = class extends PIXI.Sprite {
  };
  var TileChunk = class extends PIXI.Container {
    // pixi.js' Container is a jerk
  };
  var Tilemap = class extends PIXI.Container {
    /**
     * @param template A template object that contains data about depth
     * and tile placement. It is usually used by ct.IDE.
     */
    constructor(template) {
      super();
      this.pixiTiles = [];
      if (template) {
        this.zIndex = template.depth;
        this.tiles = template.tiles.map((tile) => __spreadValues({}, tile));
        if (template.extends) {
          Object.assign(this, template.extends);
        }
        for (let i = 0, l = template.tiles.length; i < l; i++) {
          const tile = template.tiles[i];
          const textures = res_default.getTexture(tile.texture);
          const sprite = new Tile(textures[tile.frame]);
          sprite.anchor.x = textures[0].defaultAnchor.x;
          sprite.anchor.y = textures[0].defaultAnchor.y;
          sprite.shape = textures.shape;
          sprite.scale.set(tile.scale.x, tile.scale.y);
          sprite.rotation = tile.rotation;
          sprite.alpha = tile.opacity;
          sprite.tint = tile.tint;
          sprite.x = tile.x;
          sprite.y = tile.y;
          this.addChild(sprite);
          this.pixiTiles.push(sprite);
          this.tiles[i].sprite = sprite;
        }
        if (template.cache) {
          this.cache();
        }
      } else {
        this.tiles = [];
      }
      templates_default.list.TILEMAP.push(this);
      this.on("destroyed", () => {
        templates_default.list.TILEMAP.splice(templates_default.list.TILEMAP.indexOf(this), 1);
      });
    }
    /**
     * Adds a tile to the tilemap. Will throw an error if a tilemap is cached.
     * @param textureName The name of the texture to use
     * @param x The horizontal location of the tile
     * @param y The vertical location of the tile
     * @param [frame] The frame to pick from the source texture. Defaults to 0.
     * @returns The created tile
     */
    addTile(textureName, x, y, frame = 0) {
      if (this.cached) {
        throw new Error("[ct.tiles] Adding tiles to cached tilemaps is forbidden. Create a new tilemap, or add tiles before caching the tilemap.");
      }
      const texture = res_default.getTexture(textureName, frame);
      const sprite = new Tile(texture);
      sprite.x = x;
      sprite.y = y;
      sprite.shape = texture.shape;
      this.tiles.push({
        texture: textureName,
        frame,
        x,
        y,
        width: sprite.width,
        height: sprite.height,
        sprite,
        opacity: 1,
        rotation: 1,
        scale: {
          x: 1,
          y: 1
        },
        tint: 16777215
      });
      this.addChild(sprite);
      this.pixiTiles.push(sprite);
      return sprite;
    }
    /**
     * Enables caching on this tileset, freezing it and turning it
     * into a series of bitmap textures. This proides great speed boost,
     * but prevents further editing.
     */
    cache(chunkSize = 1024) {
      if (this.cached) {
        throw new Error("[ct.tiles] Attempt to cache an already cached tilemap.");
      }
      const bounds = this.getLocalBounds();
      const cols = Math.ceil(bounds.width / chunkSize), rows = Math.ceil(bounds.height / chunkSize);
      this.cells = [];
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const cell = new TileChunk();
          this.cells.push(cell);
        }
      }
      for (let i = 0, l = this.tiles.length; i < l; i++) {
        const [tile] = this.children, x = Math.floor((tile.x - bounds.x) / chunkSize), y = Math.floor((tile.y - bounds.y) / chunkSize);
        this.cells[y * cols + x].addChild(tile);
      }
      this.removeChildren();
      for (let i = 0, l = this.cells.length; i < l; i++) {
        if (this.cells[i].children.length === 0) {
          this.cells.splice(i, 1);
          i--;
          l--;
          continue;
        }
        this.addChild(this.cells[i]);
        if (settings.pixelart) {
          this.cells[i].cacheAsBitmapResolution = 1;
        }
        this.cells[i].cacheAsBitmap = true;
      }
      this.cached = true;
    }
    /**
     * Enables caching on this tileset, freezing it and turning it
     * into a series of bitmap textures. This proides great speed boost,
     * but prevents further editing.
     *
     * This version packs tiles into rhombus-shaped chunks, and sorts them
     * from top to bottom. This fixes seam issues for isometric games.
     */
    cacheDiamond(chunkSize = 1024) {
      if (this.cached) {
        throw new Error("[ct.tiles] Attempt to cache an already cached tilemap.");
      }
      this.cells = [];
      this.diamondCellMap = {};
      for (let i = 0, l = this.tiles.length; i < l; i++) {
        const [tile] = this.children;
        const { x: xNormalized, y: yNormalized } = u_default.rotate(tile.x, tile.y * 2, -45);
        const x = Math.floor(xNormalized / chunkSize), y = Math.floor(yNormalized / chunkSize), key = `${x}:${y}`;
        if (!(key in this.diamondCellMap)) {
          const chunk = new TileChunk();
          chunk.chunkX = x;
          chunk.chunkY = y;
          this.diamondCellMap[key] = chunk;
          this.cells.push(chunk);
        }
        this.diamondCellMap[key].addChild(tile);
      }
      this.removeChildren();
      this.cells.sort((a, b) => {
        const maxA = Math.max(a.chunkY, a.chunkX), maxB = Math.max(b.chunkY, b.chunkX);
        if (maxA === maxB) {
          return b.chunkX - a.chunkX;
        }
        return maxA - maxB;
      });
      for (let i = 0, l = this.cells.length; i < l; i++) {
        this.addChild(this.cells[i]);
        this.cells[i].cacheAsBitmap = true;
      }
      this.cached = true;
    }
  };
  var tilemapsLib = {
    /**
     * Creates a new tilemap at a specified depth, and adds it to the main room (ct.room).
     * @param {number} [depth] The depth of a newly created tilemap. Defaults to 0.
     * @returns {Tilemap} The created tilemap.
     */
    create(depth = 0) {
      const tilemap = new Tilemap();
      tilemap.zIndex = depth;
      rooms_default.current.addChild(tilemap);
      return tilemap;
    },
    /**
     * Adds a tile to the specified tilemap. It is the same as
     * calling `tilemap.addTile(textureName, x, y, frame).
     * @param tilemap The tilemap to modify.
     * @param textureName The name of the texture to use.
     * @param x The horizontal location of the tile.
     * @param y The vertical location of the tile.
     * @param frame The frame to pick from the source texture. Defaults to 0.
     * @returns {PIXI.Sprite} The created tile
     */
    addTile(tilemap, textureName, x, y, frame = 0) {
      return tilemap.addTile(textureName, x, y, frame);
    },
    /**
     * Enables caching on this tileset, freezing it and turning it
     * into a series of bitmap textures. This proides great speed boost,
     * but prevents further editing.
     *
     * This is the same as calling `tilemap.cache();`
     *
     * @param tilemap The tilemap which needs to be cached.
     * @param chunkSize The size of one chunk.
     */
    cache(tilemap, chunkSize) {
      tilemap.cache(chunkSize);
    },
    /**
     * Enables caching on this tileset, freezing it and turning it
     * into a series of bitmap textures. This proides great speed boost,
     * but prevents further editing.
     *
     * This version packs tiles into rhombus-shaped chunks, and sorts them
     * from top to bottom. This fixes seam issues for isometric games.
     * Note that tiles should be placed on a flat plane for the proper sorting.
     * If you need an effect of elevation, consider shifting each tile with
     * tile.pivot.y property.
     *
     * This is the same as calling `tilemap.cacheDiamond();`
     *
     * @param tilemap The tilemap which needs to be cached.
     * @param chunkSize The size of one chunk.
     */
    cacheDiamond(tilemap, chunkSize) {
      tilemap.cacheDiamond(chunkSize);
    }
  };
  var tilemaps_default = tilemapsLib;

  // src/ct.release/behaviors.ts
  var behaviorsLib = {
    templates: [
      {}
    ][0],
    rooms: [
      {}
    ][0],
    /**
     * Adds a behavior to the given room or template.
     * Only dynamic behaviors can be added.
     * (Static behaviors are marked with a frozen (❄️) sign in UI.)
     * @param target The room or template to which the behavior should be added.
     * @param behavior The name of the behavior to be added, as it was named in ct.IDE.
     */
    add(target, behavior) {
      if (target.behaviors.includes(behavior)) {
        throw new Error(`[behaviors.add] Behavior ${behavior} already exists on ${target instanceof Room ? target.name : target.template}`);
      }
      const domain = target instanceof Room ? "rooms" : "templates";
      if (behaviorsLib[domain][behavior] === "static") {
        throw new Error(`[behaviors.add] Behavior ${behavior} cannot be added to ${target instanceof Room ? target.name : target.template} because this behavior cannot be added dynamically.`);
      }
      if (!behaviorsLib[domain][behavior]) {
        throw new Error(`[behaviors.add] Behavior ${behavior} does not exist or cannot be applied to ${domain}.`);
      }
      target.behaviors.push(behavior);
    },
    /**
     * Removes a behavior from the given room or template.
     * Only dynamic behaviors can be removed.
     * (Static behaviors are marked with a frozen (❄️) sign in UI.)
     * @param target The room or template from which the behavior should be removed.
     * @param behavior The name of the behavior to be removed, as it was named in ct.IDE.
     */
    remove(target, behavior) {
      if (!target.behaviors.includes(behavior)) {
        throw new Error(`[behaviors.remove] Behavior ${behavior} already exists on ${target instanceof Room ? target.name : target.template}`);
      }
      const domain = target instanceof Room ? "rooms" : "templates";
      if (behaviorsLib[domain][behavior] === "static") {
        throw new Error(`[behaviors.remove] Behavior ${behavior} cannot be removed from ${target instanceof Room ? target.name : target.template} because this behavior cannot be removed dynamically.`);
      }
      if (!behaviorsLib[domain][behavior]) {
        throw new Error(`[behaviors.remove] Behavior ${behavior} does not exist or cannot be applied to ${domain}.`);
      }
      target.behaviors.splice(target.behaviors.indexOf(behavior), 1);
    },
    /**
     * Tells whether the specified object has a behavior applied to it.
     * @param target A room or a copy to test against.
     * @param behavior The behavior to look for.
     */
    has(target, behavior) {
      return target.behaviors.includes(behavior);
    }
  };
  var runBehaviors = (target, domain, kind) => {
    var _a2;
    for (const bh of target.behaviors) {
      const fn = behaviorsLib[domain][bh];
      if (fn === "static" || !fn) {
        continue;
      }
      (_a2 = fn[kind]) == null ? void 0 : _a2.apply(target);
    }
  };
  var behaviors_default = behaviorsLib;

  // src/ct.release/styles.ts
  var stylesLib = {
    types: {},
    /**
     * Creates a new style with a given name.
     * Technically, it just writes `data` to `styles.types`
     */
    new(name, styleTemplate) {
      stylesLib.types[name] = styleTemplate;
      return styleTemplate;
    },
    /**
     * Returns a style of a given name. The actual behavior strongly depends on `copy` parameter.
     * @param name The name of the style to load
     * @param [copy] If not set, returns the source style object.
     * Editing it will affect all new style calls.
     * When set to `true`, will create a new object, which you can safely modify
     * without affecting the source style.
     * When set to an object, this will create a new object as well,
     * augmenting it with given properties.
     * @returns {object} The resulting style
     */
    get(name, copy) {
      if (copy === true) {
        return Object.assign({}, stylesLib.types[name]);
      }
      if (copy) {
        return Object.assign(Object.assign({}, stylesLib.types[name]), copy);
      }
      return stylesLib.types[name];
    }
  };
  var styles_default = stylesLib;

  // src/ct.release/templateBaseClasses/PixiButton.ts
  var _disabled;
  var PixiButton = class extends PIXI.Container {
    constructor(t, exts) {
      var _a2, _b, _c, _d, _e, _f, _g, _h;
      if ((t == null ? void 0 : t.baseClass) !== "Button") {
        throw new Error("Don't call PixiButton class directly! Use templates.copy to create an instance instead.");
      }
      super();
      __privateAdd(this, _disabled, void 0);
      this.normalTexture = res_default.getTexture(t.texture, 0);
      this.hoverTexture = t.hoverTexture ? res_default.getTexture(t.hoverTexture, 0) : this.normalTexture;
      this.pressedTexture = t.pressedTexture ? res_default.getTexture(t.pressedTexture, 0) : this.normalTexture;
      this.disabledTexture = t.disabledTexture ? res_default.getTexture(t.disabledTexture, 0) : this.normalTexture;
      this.panel = new PIXI.NineSlicePlane(
        this.normalTexture,
        (_b = (_a2 = t.nineSliceSettings) == null ? void 0 : _a2.left) != null ? _b : 16,
        (_d = (_c = t.nineSliceSettings) == null ? void 0 : _c.top) != null ? _d : 16,
        (_f = (_e = t.nineSliceSettings) == null ? void 0 : _e.right) != null ? _f : 16,
        (_h = (_g = t.nineSliceSettings) == null ? void 0 : _g.bottom) != null ? _h : 16
      );
      const style = t.textStyle === -1 ? PIXI.TextStyle.defaultStyle : styles_default.get(t.textStyle, true);
      if (exts.customSize) {
        style.fontSize = Number(exts.customSize);
      }
      this.textLabel = new PIXI.Text(exts.customText || t.defaultText || "", style);
      this.textLabel.anchor.set(0.5);
      this.addChild(this.panel, this.textLabel);
      this.eventMode = "dynamic";
      this.cursor = "pointer";
      this.on("pointerenter", this.hover);
      this.on("pointerentercapture", this.hover);
      this.on("pointerleave", this.blur);
      this.on("pointerleavecapture", this.blur);
      this.on("pointerdown", this.press);
      this.on("pointerdowncapture", this.press);
      this.on("pointerup", this.hover);
      this.on("pointerupcapture", this.hover);
      this.on("pointerupoutside", this.blur);
      this.on("pointerupoutsidecapture", this.blur);
      this.updateNineSliceShape = t.nineSliceSettings.autoUpdate;
      let baseWidth = this.panel.width, baseHeight = this.panel.height;
      if ("scaleX" in exts) {
        baseWidth *= exts.scaleX;
      }
      if ("scaleY" in exts) {
        baseHeight *= exts.scaleY;
      }
      this.resize(baseWidth, baseHeight);
      u_default.reshapeNinePatch(this);
    }
    get disabled() {
      return __privateGet(this, _disabled);
    }
    set disabled(val) {
      __privateSet(this, _disabled, val);
      if (val) {
        this.panel.texture = this.disabledTexture;
        this.eventMode = "none";
      } else {
        this.panel.texture = this.normalTexture;
        this.eventMode = "dynamic";
      }
    }
    get text() {
      return this.textLabel.text;
    }
    set text(val) {
      this.textLabel.text = val;
    }
    /**
     * The color of the button's texture.
     */
    get tint() {
      return this.panel.tint;
    }
    set tint(val) {
      this.panel.tint = val;
    }
    unsize() {
      const { x, y } = this.scale;
      this.panel.scale.x *= x;
      this.panel.scale.y *= y;
      this.scale.set(1);
      this.textLabel.x = this.panel.width / 2;
      this.textLabel.y = this.panel.height / 2;
    }
    resize(newWidth, newHeight) {
      this.panel.width = newWidth;
      this.panel.height = newHeight;
      this.textLabel.x = newWidth / 2;
      this.textLabel.y = newHeight / 2;
    }
    hover() {
      if (this.disabled) {
        return;
      }
      this.panel.texture = this.hoverTexture;
    }
    blur() {
      if (this.disabled) {
        return;
      }
      this.panel.texture = this.normalTexture;
    }
    press() {
      if (this.disabled) {
        return;
      }
      this.panel.texture = this.pressedTexture;
    }
  };
  _disabled = new WeakMap();

  // src/ct.release/templateBaseClasses/PixiSpritedCounter.ts
  var _count, _baseWidth, _baseHeight;
  var PixiSpritedCounter = class extends PIXI.TilingSprite {
    constructor(t, exts) {
      var _a2, _b;
      if (t.baseClass !== "SpritedCounter") {
        throw new Error("Don't call PixiScrollingTexture class directly! Use templates.copy to create an instance instead.");
      }
      const tex = res_default.getTexture(t.texture, 0);
      super(tex, tex.width, tex.height);
      __privateAdd(this, _count, void 0);
      __privateAdd(this, _baseWidth, void 0);
      __privateAdd(this, _baseHeight, void 0);
      __privateSet(this, _baseWidth, this.width);
      __privateSet(this, _baseHeight, this.height);
      this.anchor.set(0);
      if ("scaleX" in exts) {
        this.scale.x = (_a2 = exts.scaleX) != null ? _a2 : 1;
      }
      if ("scaleY" in exts) {
        this.scale.y = (_b = exts.scaleY) != null ? _b : 1;
      }
      this.count = t.spriteCount;
    }
    /**
     * Amount of sprites to show.
     */
    get count() {
      return __privateGet(this, _count);
    }
    set count(val) {
      __privateSet(this, _count, val);
      this.width = __privateGet(this, _count) * __privateGet(this, _baseWidth) * this.scale.x;
      this.height = __privateGet(this, _baseHeight) * this.scale.y;
      this.tileScale.set(this.scale.x, this.scale.y);
      this.shape = {
        type: "rect",
        left: 0,
        top: 0,
        right: __privateGet(this, _baseWidth) * __privateGet(this, _count),
        bottom: __privateGet(this, _baseHeight)
      };
    }
  };
  _count = new WeakMap();
  _baseWidth = new WeakMap();
  _baseHeight = new WeakMap();

  // src/ct.release/templateBaseClasses/PixiScrollingTexture.ts
  var _baseWidth2, _baseHeight2;
  var PixiScrollingTexture = class extends PIXI.TilingSprite {
    constructor(t, exts) {
      var _a2, _b;
      if (t.baseClass !== "RepeatingTexture") {
        throw new Error("Don't call PixiScrollingTexture class directly! Use templates.copy to create an instance instead.");
      }
      const tex = res_default.getTexture(t.texture, 0);
      super(tex, tex.width, tex.height);
      __privateAdd(this, _baseWidth2, void 0);
      __privateAdd(this, _baseHeight2, void 0);
      __privateSet(this, _baseWidth2, this.width);
      __privateSet(this, _baseHeight2, this.height);
      this.anchor.set(0);
      this.scrollSpeedX = t.scrollX;
      this.scrollSpeedY = t.scrollY;
      if ("scaleX" in exts) {
        this.width = __privateGet(this, _baseWidth2) * ((_a2 = exts.scaleX) != null ? _a2 : 1);
      }
      if ("scaleY" in exts) {
        this.height = __privateGet(this, _baseHeight2) * ((_b = exts.scaleY) != null ? _b : 1);
      }
      this.on("added", () => {
        rooms_default.current.tickerSet.add(this);
      });
      this.on("removed", () => {
        rooms_default.current.tickerSet.delete(this);
      });
      this.shape = {
        type: "rect",
        left: 0,
        top: 0,
        right: this.width,
        bottom: this.height
      };
    }
    tick() {
      if (this.isUi) {
        this.tilePosition.x += this.scrollSpeedX * u_default.timeUi;
        this.tilePosition.y += this.scrollSpeedY * u_default.timeUi;
      } else {
        this.tilePosition.x += this.scrollSpeedX * u_default.time;
        this.tilePosition.y += this.scrollSpeedY * u_default.time;
      }
    }
  };
  _baseWidth2 = new WeakMap();
  _baseHeight2 = new WeakMap();

  // src/ct.release/templateBaseClasses/PixiTextBox.ts
  var cssStyle = document.createElement("style");
  document.head.appendChild(cssStyle);
  var _disabled2, _focused, _prevPreventDefault, _setFocused, setFocused_fn, _htmlInput, _pointerUp, _submitHandler, _repositionRestyleInput, _text;
  var PixiTextBox = class extends PIXI.Container {
    // eslint-disable-next-line max-lines-per-function
    constructor(t, exts) {
      var _a2, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      if ((t == null ? void 0 : t.baseClass) !== "TextBox") {
        throw new Error("Don't call PixiTextBox class directly! Use templates.copy to create an instance instead.");
      }
      super();
      __privateAdd(this, _setFocused);
      __privateAdd(this, _disabled2, void 0);
      __privateAdd(this, _focused, void 0);
      __privateAdd(this, _prevPreventDefault, void 0);
      __privateAdd(this, _htmlInput, void 0);
      // eslint-disable-next-line no-empty-function, class-methods-use-this
      this.onchange = () => {
      };
      // eslint-disable-next-line no-empty-function, class-methods-use-this
      this.oninput = () => {
      };
      __privateAdd(this, _pointerUp, (e) => {
        if (e.target !== this) {
          this.blur();
        }
      });
      __privateAdd(this, _submitHandler, (e) => {
        if (e.key === "Enter" && __privateGet(this, _focused)) {
          __privateMethod(this, _setFocused, setFocused_fn).call(this, false);
          e.preventDefault();
        }
      });
      __privateAdd(this, _repositionRestyleInput, () => {
        var _a2, _b, _c, _d, _e, _f, _g;
        const { isUi } = this.getRoom();
        const x1 = this.x, y1 = this.y, x2 = this.x + this.width, y2 = this.y + this.height;
        const scalar = isUi ? u_default.uiToCssScalar : u_default.gameToCssScalar, coord = isUi ? u_default.uiToCssCoord : u_default.gameToCssCoord;
        const lt = coord(x1, y1), br = coord(x2, y2);
        const textStyle = this.textLabel.style;
        Object.assign(__privateGet(this, _htmlInput).style, {
          fontSize: scalar(parseFloat(textStyle.fontSize)) + "px",
          left: lt.x + "px",
          top: lt.y + "px",
          width: br.x - lt.x + "px",
          height: br.y - lt.y + "px",
          lineHeight: br.y - lt.y + "px",
          color: Array.isArray(textStyle.fill) ? textStyle.fill[0] : textStyle.fill
        });
        if (textStyle.strokeThickness) {
          __privateGet(this, _htmlInput).style.textStroke = `${scalar(textStyle.strokeThickness / 2)}px ${textStyle.stroke}`;
          __privateGet(this, _htmlInput).style.webkitTextStroke = __privateGet(this, _htmlInput).style.textStroke;
        } else {
          __privateGet(this, _htmlInput).style.textStroke = __privateGet(this, _htmlInput).style.webkitTextStroke = "unset";
        }
        if (textStyle.dropShadow) {
          const angle = u_default.radToDeg((_a2 = textStyle.dropShadowAngle) != null ? _a2 : 0);
          let x = u_default.ldx((_b = textStyle.dropShadowDistance) != null ? _b : 0, angle), y = u_default.ldy((_c = textStyle.dropShadowDistance) != null ? _c : 0, angle);
          x = scalar(x);
          y = scalar(y);
          const css = `${x}px ${y}px ${scalar((_d = textStyle.dropShadowBlur) != null ? _d : 0)}px ${textStyle.dropShadowColor}`;
          __privateGet(this, _htmlInput).style.textShadow = `${css}, ${css}`;
        }
        __privateGet(this, _htmlInput).style.fontStyle = (_e = textStyle.fontStyle) != null ? _e : "unset";
        __privateGet(this, _htmlInput).style.fontFamily = (_f = textStyle.fontFamily) != null ? _f : "unset";
        __privateGet(this, _htmlInput).style.fontWeight = (_g = textStyle.fontWeight) != null ? _g : "400";
        if (this.selectionColor) {
          cssStyle.innerHTML = `
                ::selection {
                    background: ${this.selectionColor};
                }
            `;
        } else {
          cssStyle.innerHTML = "";
        }
      });
      __privateAdd(this, _text, void 0);
      this.normalTexture = res_default.getTexture(t.texture, 0);
      this.hoverTexture = t.hoverTexture ? res_default.getTexture(t.hoverTexture, 0) : this.normalTexture;
      this.pressedTexture = t.pressedTexture ? res_default.getTexture(t.pressedTexture, 0) : this.normalTexture;
      this.disabledTexture = t.disabledTexture ? res_default.getTexture(t.disabledTexture, 0) : this.normalTexture;
      this.panel = new PIXI.NineSlicePlane(
        this.normalTexture,
        (_b = (_a2 = t.nineSliceSettings) == null ? void 0 : _a2.left) != null ? _b : 16,
        (_d = (_c = t.nineSliceSettings) == null ? void 0 : _c.top) != null ? _d : 16,
        (_f = (_e = t.nineSliceSettings) == null ? void 0 : _e.right) != null ? _f : 16,
        (_h = (_g = t.nineSliceSettings) == null ? void 0 : _g.bottom) != null ? _h : 16
      );
      this.maxLength = (_i = t.maxTextLength) != null ? _i : 0;
      this.fieldType = (_j = t.fieldType) != null ? _j : "text";
      const style = t.textStyle === -1 ? PIXI.TextStyle.defaultStyle : styles_default.get(t.textStyle, true);
      if (exts.customSize) {
        style.fontSize = Number(exts.customSize);
      }
      let text = exts.customText || t.defaultText || "";
      __privateSet(this, _text, text);
      if (this.fieldType === "password") {
        text = "\u2022".repeat(text.length);
      }
      this.textLabel = new PIXI.Text(text, style);
      this.textLabel.anchor.set(0.5);
      this.addChild(this.panel, this.textLabel);
      if (t.selectionColor) {
        this.selectionColor = t.selectionColor;
      }
      this.eventMode = "dynamic";
      this.cursor = "pointer";
      this.on("pointerenter", this.hover);
      this.on("pointerentercapture", this.hover);
      this.on("pointerleave", this.unhover);
      this.on("pointerleavecapture", this.unhover);
      this.on("pointerdown", this.press);
      this.on("pointerdowncapture", this.press);
      this.on("pointerup", this.hover);
      this.on("pointerupcapture", this.hover);
      this.on("pointerupoutside", this.unhover);
      this.on("pointerupoutsidecapture", this.unhover);
      this.updateNineSliceShape = t.nineSliceSettings.autoUpdate;
      let baseWidth = this.panel.width, baseHeight = this.panel.height;
      if ("scaleX" in exts) {
        baseWidth *= exts.scaleX;
      }
      if ("scaleY" in exts) {
        baseHeight *= exts.scaleY;
      }
      this.resize(baseWidth, baseHeight);
      u_default.reshapeNinePatch(this);
      __privateSet(this, _disabled2, false);
      __privateSet(this, _focused, false);
      __privateSet(this, _htmlInput, document.createElement("input"));
      __privateGet(this, _htmlInput).type = "text";
      __privateGet(this, _htmlInput).className = "aCtJsTextboxInput";
      __privateGet(this, _htmlInput).addEventListener("click", (e) => {
        e.stopPropagation();
      });
      __privateGet(this, _htmlInput).addEventListener("pointerup", (e) => {
        e.stopPropagation();
      });
      __privateGet(this, _htmlInput).addEventListener("input", () => {
        this.oninput(__privateGet(this, _htmlInput).value);
      });
      this.on("pointerup", () => {
        __privateMethod(this, _setFocused, setFocused_fn).call(this, true);
      });
    }
    get disabled() {
      return __privateGet(this, _disabled2);
    }
    set disabled(val) {
      __privateSet(this, _disabled2, val);
      if (val) {
        this.panel.texture = this.disabledTexture;
        this.eventMode = "none";
      } else {
        this.panel.texture = this.normalTexture;
        this.eventMode = "auto";
      }
    }
    get isFocused() {
      return __privateGet(this, _focused);
    }
    blur() {
      __privateMethod(this, _setFocused, setFocused_fn).call(this, false);
    }
    focus() {
      __privateMethod(this, _setFocused, setFocused_fn).call(this, true);
    }
    get text() {
      return __privateGet(this, _text);
    }
    set text(val) {
      __privateSet(this, _text, val);
      if (this.fieldType === "password") {
        this.textLabel.text = "\u2022".repeat(val.length);
      } else {
        this.textLabel.text = val;
      }
    }
    unsize() {
      const { x, y } = this.scale;
      this.panel.scale.x *= x;
      this.panel.scale.y *= y;
      this.scale.set(1);
      this.textLabel.x = this.panel.width / 2;
      this.textLabel.y = this.panel.height / 2;
    }
    resize(newWidth, newHeight) {
      this.panel.width = newWidth;
      this.panel.height = newHeight;
      this.textLabel.x = newWidth / 2;
      this.textLabel.y = newHeight / 2;
    }
    hover() {
      if (this.disabled) {
        return;
      }
      this.panel.texture = this.hoverTexture;
    }
    unhover() {
      if (this.disabled) {
        return;
      }
      this.panel.texture = this.normalTexture;
    }
    press() {
      if (this.disabled) {
        return;
      }
      this.panel.texture = this.pressedTexture;
    }
  };
  _disabled2 = new WeakMap();
  _focused = new WeakMap();
  _prevPreventDefault = new WeakMap();
  _setFocused = new WeakSet();
  setFocused_fn = function(val) {
    var _a2, _b;
    if (val === __privateGet(this, _focused)) {
      return;
    }
    __privateSet(this, _focused, val);
    if (val) {
      if (__privateGet(this, _disabled2)) {
        __privateSet(this, _focused, false);
        return;
      }
      setFocusedElement(this);
      this.panel.texture = (_b = (_a2 = this.pressedTexture) != null ? _a2 : this.hoverTexture) != null ? _b : this.normalTexture;
      __privateGet(this, _repositionRestyleInput).call(this);
      if (this.maxLength > 0) {
        __privateGet(this, _htmlInput).maxLength = this.maxLength;
      } else {
        delete __privateGet(this, _htmlInput).maxLength;
      }
      __privateGet(this, _htmlInput).type = this.fieldType;
      __privateGet(this, _htmlInput).value = this.text;
      document.body.appendChild(__privateGet(this, _htmlInput));
      __privateGet(this, _htmlInput).focus();
      this.textLabel.alpha = 0;
      try {
        __privateSet(this, _prevPreventDefault, settings.preventDefault);
        settings.preventDefault = false;
      } catch (oO) {
      }
      document.addEventListener("keydown", __privateGet(this, _submitHandler));
      window.addEventListener("resize", __privateGet(this, _repositionRestyleInput));
      pixiApp.stage.off("pointerup", __privateGet(this, _pointerUp));
    } else {
      this.panel.texture = this.normalTexture;
      this.text = __privateGet(this, _htmlInput).value;
      document.body.removeChild(__privateGet(this, _htmlInput));
      this.textLabel.alpha = 1;
      try {
        settings.preventDefault = __privateGet(this, _prevPreventDefault);
      } catch (oO) {
      }
      this.onchange(this.text);
      document.removeEventListener("keydown", __privateGet(this, _submitHandler));
      window.removeEventListener("resize", __privateGet(this, _repositionRestyleInput));
      pixiApp.stage.on("pointerup", __privateGet(this, _pointerUp));
    }
  };
  _htmlInput = new WeakMap();
  _pointerUp = new WeakMap();
  _submitHandler = new WeakMap();
  _repositionRestyleInput = new WeakMap();
  _text = new WeakMap();

  // src/ct.release/templateBaseClasses/PixiNineSlicePlane.ts
  var PixiPanel = class extends PIXI.NineSlicePlane {
    constructor(t, exts) {
      var _a2, _b, _c, _d, _e, _f, _g, _h;
      if ((t == null ? void 0 : t.baseClass) !== "NineSlicePlane") {
        throw new Error("Don't call PixiPanel class directly! Use templates.copy to create an instance instead.");
      }
      const tex = res_default.getTexture(t.texture, 0);
      super(
        tex,
        (_b = (_a2 = t.nineSliceSettings) == null ? void 0 : _a2.left) != null ? _b : 16,
        (_d = (_c = t.nineSliceSettings) == null ? void 0 : _c.top) != null ? _d : 16,
        (_f = (_e = t.nineSliceSettings) == null ? void 0 : _e.right) != null ? _f : 16,
        (_h = (_g = t.nineSliceSettings) == null ? void 0 : _g.bottom) != null ? _h : 16
      );
      this.baseClass = "NineSlicePlane";
      this.updateNineSliceShape = t.nineSliceSettings.autoUpdate;
      const baseWidth = this.width, baseHeight = this.height;
      if ("scaleX" in exts) {
        this.width = baseWidth * exts.scaleX;
      }
      if ("scaleY" in exts) {
        this.height = baseHeight * exts.scaleY;
      }
      u_default.reshapeNinePatch(this);
      this.blendMode = t.blendMode || PIXI.BLEND_MODES.NORMAL;
    }
  };

  // src/ct.release/templateBaseClasses/PixiText.ts
  var PixiText = class extends PIXI.Text {
    constructor(t, exts) {
      var _a2, _b, _c, _d;
      if ((t == null ? void 0 : t.baseClass) !== "Text") {
        throw new Error("Don't call PixiPanel class directly! Use templates.copy to create an instance instead.");
      }
      let style;
      if (t.textStyle && t.textStyle !== -1) {
        style = styles_default.get(t.textStyle, true);
      } else {
        style = {};
      }
      if (exts.customWordWrap) {
        style.wordWrap = true;
        style.wordWrapWidth = Number(exts.customWordWrap);
      }
      if (exts.customSize) {
        style.fontSize = Number(exts.customSize);
      }
      super(
        exts.customText || t.defaultText || "",
        style
      );
      if (exts.customAnchor) {
        const anchor = exts.customAnchor;
        this.anchor.set((_a2 = anchor == null ? void 0 : anchor.x) != null ? _a2 : 0, (_b = anchor == null ? void 0 : anchor.y) != null ? _b : 0);
      }
      this.shape = u_default.getRectShape(this);
      this.scale.set(
        (_c = exts.scaleX) != null ? _c : 1,
        (_d = exts.scaleY) != null ? _d : 1
      );
      return this;
    }
  };

  // src/ct.release/templateBaseClasses/PixiContainer.ts
  var PixiContainer = class extends PIXI.Container {
    constructor() {
      super();
      this.shape = {
        type: "point"
      };
      return this;
    }
  };

  // src/ct.release/templateBaseClasses/PixiAnimatedSprite.ts
  var PixiAnimateSprite = class extends PIXI.AnimatedSprite {
    constructor(t, exts) {
      var _a2, _b, _c, _d, _e, _f;
      if ((t == null ? void 0 : t.baseClass) !== "AnimatedSprite") {
        throw new Error("Don't call PixiButton class directly! Use templates.copy to create an instance instead.");
      }
      const textures = res_default.getTexture(t.texture);
      super(textures);
      this.anchor.x = (_b = (_a2 = t.anchorX) != null ? _a2 : textures[0].defaultAnchor.x) != null ? _b : 0;
      this.anchor.y = (_d = (_c = t.anchorY) != null ? _c : textures[0].defaultAnchor.y) != null ? _d : 0;
      this.scale.set(
        (_e = exts.scaleX) != null ? _e : 1,
        (_f = exts.scaleY) != null ? _f : 1
      );
      this.blendMode = t.blendMode || PIXI.BLEND_MODES.NORMAL;
      this.loop = t.loopAnimation;
      this.animationSpeed = t.animationFPS / 60;
      if (t.playAnimationOnStart) {
        this.play();
      }
      return this;
    }
  };

  // src/ct.release/templateBaseClasses/index.ts
  var baseClassToPixiClass = {
    AnimatedSprite: PixiAnimateSprite,
    Button: PixiButton,
    Container: PixiContainer,
    NineSlicePlane: PixiPanel,
    RepeatingTexture: PixiScrollingTexture,
    // ScrollBox: PixiScrollBox,
    SpritedCounter: PixiSpritedCounter,
    Text: PixiText,
    TextBox: PixiTextBox
  };

  // src/ct.release/templates.ts
  var uid = 0;
  var focusedElement;
  var blurFocusedElement = () => {
    focusedElement.blur();
  };
  var setFocusedElement = (elt) => {
    if (focusedElement && focusedElement !== elt) {
      blurFocusedElement();
    }
    focusedElement = elt;
  };
  var CopyProto = {
    set tex(value) {
      if (this._tex === value) {
        return;
      }
      var { playing } = this;
      this.textures = res_default.getTexture(value);
      [this.texture] = this.textures;
      this._tex = value;
      this.shape = res_default.getTextureShape(value);
      this.hitArea = this.textures.hitArea;
      if (this.anchor) {
        this.anchor.x = this.textures[0].defaultAnchor.x;
        this.anchor.y = this.textures[0].defaultAnchor.y;
        if (playing) {
          this.play();
        }
      }
      if ("_bottomHeight" in this) {
        u_default.reshapeNinePatch(this);
      }
    },
    get tex() {
      return this._tex;
    },
    get speed() {
      return Math.hypot(this.hspeed, this.vspeed);
    },
    set speed(value) {
      if (value === 0) {
        this._zeroDirection = this.direction;
        this.hspeed = this.vspeed = 0;
        return;
      }
      if (this.speed === 0) {
        const restoredDir = this._zeroDirection;
        this._hspeed = value * Math.cos(restoredDir * Math.PI / 180);
        this._vspeed = value * Math.sin(restoredDir * Math.PI / 180);
        return;
      }
      var multiplier = value / this.speed;
      this.hspeed *= multiplier;
      this.vspeed *= multiplier;
    },
    get hspeed() {
      return this._hspeed;
    },
    set hspeed(value) {
      if (this.vspeed === 0 && value === 0) {
        this._zeroDirection = this.direction;
      }
      this._hspeed = value;
    },
    get vspeed() {
      return this._vspeed;
    },
    set vspeed(value) {
      if (this.hspeed === 0 && value === 0) {
        this._zeroDirection = this.direction;
      }
      this._vspeed = value;
    },
    get direction() {
      if (this.speed === 0) {
        return this._zeroDirection;
      }
      return (Math.atan2(this.vspeed, this.hspeed) * 180 / Math.PI + 360) % 360;
    },
    set direction(value) {
      this._zeroDirection = value;
      if (this.speed > 0) {
        var { speed } = this;
        this.hspeed = speed * Math.cos(value * Math.PI / 180);
        this.vspeed = speed * Math.sin(value * Math.PI / 180);
      }
    },
    move() {
      if (this.gravity) {
        this.hspeed += this.gravity * u_default.time * Math.cos(this.gravityDir * Math.PI / 180);
        this.vspeed += this.gravity * u_default.time * Math.sin(this.gravityDir * Math.PI / 180);
      }
      this.x += this.hspeed * u_default.time;
      this.y += this.vspeed * u_default.time;
    },
    addSpeed(spd, dir) {
      this.hspeed += spd * Math.cos(dir * Math.PI / 180);
      this.vspeed += spd * Math.sin(dir * Math.PI / 180);
    },
    getRoom() {
      let { parent } = this;
      while (!(parent instanceof Room)) {
        ({ parent } = parent);
      }
      return parent;
    },
    onBeforeCreateModifier() {
      if (this.matterEnable) {
    matter.onCreate(this);
}

      /*!@onbeforecreate@*/
    }
  };
  var Copy = function(x, y, template, container, exts) {
    container = container || rooms_default.current;
    this[copyTypeSymbol] = true;
    if (template) {
      this.baseClass = template.baseClass;
      this.parent = container;
      if (template.baseClass === "AnimatedSprite" || template.baseClass === "NineSlicePlane") {
        this._tex = template.texture;
      }
      this.behaviors = [...template.behaviors];
      if (template.visible === false) {
        this.visible = false;
      }
    } else {
      this.behaviors = [];
    }
    const oldScale = this.scale;
    Object.defineProperty(this, "scale", {
      get: () => oldScale,
      set: (value) => {
        this.scale.x = this.scale.y = Number(value);
      }
    });
    this[copyTypeSymbol] = true;
    this.xprev = this.xstart = this.x = x;
    this.yprev = this.ystart = this.y = y;
    this._hspeed = 0;
    this._vspeed = 0;
    this._zeroDirection = 0;
    this.gravity = 0;
    this.gravityDir = 90;
    this.zIndex = 0;
    this.timer1 = this.timer2 = this.timer3 = this.timer4 = this.timer5 = this.timer6 = 0;
    this.uid = ++uid;
    if (template) {
      Object.assign(this, {
        template: template.name,
        zIndex: template.depth,
        onStep: template.onStep,
        onDraw: template.onDraw,
        onBeforeCreateModifier: CopyProto.onBeforeCreateModifier,
        onCreate: template.onCreate,
        onDestroy: template.onDestroy
      });
      this.zIndex = template.depth;
      Object.assign(this, template.extends);
      if (exts) {
        Object.assign(this, exts);
      }
      if ("texture" in template && !this.shape) {
        this.shape = res_default.getTextureShape(template.texture || -1);
        if (typeof template.texture === "string") {
          this.hitArea = res_default.getTexture(template.texture).hitArea;
        }
      }
      if (templatesLib.list[template.name]) {
        templatesLib.list[template.name].push(this);
      } else {
        templatesLib.list[template.name] = [this];
      }
      this.onBeforeCreateModifier.apply(this);
      templatesLib.templates[template.name].onCreate.apply(this);
      onCreateModifier.apply(this);
    } else if (exts) {
      Object.assign(this, exts);
      this.onBeforeCreateModifier.apply(this);
      onCreateModifier.apply(this);
    }
    if (!this.shape) {
      this.shape = res_default.getTextureShape(-1);
    }
    if (this.behaviors.length) {
      runBehaviors(this, "templates", "thisOnCreate");
    }
    return this;
  };
  var mix = (target, x, y, template, parent, exts) => {
    const proto = CopyProto;
    const properties = Object.getOwnPropertyNames(proto);
    for (const y2 in properties) {
      if (properties[y2] !== "constructor") {
        Object.defineProperty(
          target,
          properties[y2],
          Object.getOwnPropertyDescriptor(proto, properties[y2])
        );
      }
    }
    Copy.apply(target, [x, y, template, parent, exts]);
  };
  var makeCopy = (template, x, y, parent, exts) => {
    if (!(template in templatesLib.templates)) {
      throw new Error(`[ct.templates] An attempt to create a copy of a non-existent template \`${template}\` detected. A typo?`);
    }
    const t = templatesLib.templates[template];
    if (!(t.baseClass in baseClassToPixiClass)) {
      throw new Error(`[internal -> makeCopy] Unknown base class \`${t.baseClass}\` for template \`${template}\`.`);
    }
    const copy = new baseClassToPixiClass[t.baseClass](t, exts);
    mix(copy, x, y, t, parent, exts);
    return copy;
  };
  var onCreateModifier = function() {
    this.$chashes = place.getHashes(this);
for (const hash of this.$chashes) {
    if (!(hash in place.grid)) {
        place.grid[hash] = [this];
    } else {
        place.grid[hash].push(this);
    }
}
if ([false][0] && templates.isCopy(this)) {
    this.$cDebugText = new PIXI.Text('Not initialized', {
        fill: 0xffffff,
        dropShadow: true,
        dropShadowDistance: 2,
        fontSize: [][0] || 16
    });
    this.$cDebugCollision = new PIXI.Graphics();
    this.addChild(this.$cDebugCollision, this.$cDebugText);
}

  };
  var templatesLib = {
    CopyProto,
    Background,
    Tilemap,
    /**
     * An object that contains arrays of copies of all templates.
     */
    list: {
      BACKGROUND: [],
      TILEMAP: []
    },
    /**
     * A map of all the templates of templates exported from ct.IDE.
     */
    templates: {},
    /**
     * Creates a new copy of a given template inside a specific room.
     * @param template The name of the template to use
     * @param [x] The x coordinate of a new copy. Defaults to 0.
     * @param [y] The y coordinate of a new copy. Defaults to 0.
     * @param [room] The room to which add the copy.
     * Defaults to the current room.
     * @param [exts] An optional object which parameters will be applied
     * to the copy prior to its OnCreate event.
     * @returns The created copy.
     */
    // eslint-disable-next-line max-len
    copyIntoRoom(template, x = 0, y = 0, room, exts = {}) {
      if (!room || !(room instanceof Room)) {
        throw new Error(`Attempt to spawn a copy of template ${template} inside an invalid room. Room's value provided: ${room}`);
      }
      const obj = makeCopy(template, x, y, room, exts);
      room.addChild(obj);
      stack.push(obj);
      return obj;
    },
    /**
     * Creates a new copy of a given template inside the current root room.
     * A shorthand for `templates.copyIntoRoom(template, x, y, ct.room, exts)`
     * @param template The name of the template to use
     * @param [x] The x coordinate of a new copy. Defaults to 0.
     * @param [y] The y coordinate of a new copy. Defaults to 0.
     * @param [exts] An optional object which parameters will be applied
     * to the copy prior to its OnCreate event.
     * @returns The created copy.
     */
    copy(template, x = 0, y = 0, exts = {}) {
      return templatesLib.copyIntoRoom(template, x, y, rooms_default.current, exts);
    },
    /**
     * Applies a function to each copy in the current room
     * @param {Function} func The function to apply
     * @returns {void}
     */
    each(func) {
      for (const copy of stack) {
        if (!(copy instanceof Copy)) {
          continue;
        }
        func.apply(copy, this);
      }
    },
    /**
     * Applies a function to a given object (e.g. to a copy)
     * @param {Copy} obj The copy to perform function upon.
     * @param {Function} function The function to be applied.
     */
    withCopy(obj, func) {
      func.apply(obj, this);
    },
    /**
     * Applies a function to every copy of the given template name
     * @param {string} template The name of the template to perform function upon.
     * @param {Function} function The function to be applied.
     */
    withTemplate(template, func) {
      for (const copy of templatesLib.list[template]) {
        func.apply(copy, this);
      }
    },
    /**
     * Checks whether there are any copies of this template's name.
     * Will throw an error if you pass an invalid template name.
     * @param {string} template The name of a template to check.
     * @returns {boolean} Returns `true` if at least one copy exists in a room;
     * `false` otherwise.
     */
    exists(template) {
      if (!(template in templatesLib.templates)) {
        throw new Error(`[ct.templates] templates.exists: There is no such template ${template}.`);
      }
      return templatesLib.list[template].length > 0;
    },
    /**
     * Checks whether a given object is a ct.js copy.
     * @param {any} obj The object which needs to be checked.
     * @returns {boolean} Returns `true` if the passed object is a copy; `false` otherwise.
     */
    isCopy: (obj) => obj && obj[copyTypeSymbol],
    /**
     * Checks whether a given object exists in game's world.
     * Intended to be applied to copies, but may be used with other PIXI entities.
     */
    valid: (obj) => {
      if (typeof obj !== "object") {
        return false;
      }
      if (copyTypeSymbol in obj) {
        return !obj.kill;
      }
      if (obj instanceof PIXI.DisplayObject) {
        return Boolean(obj.position);
      }
      return false;
    },
    beforeStep() {
      
    },
    afterStep() {
      
      if (this.behaviors.length) {
        runBehaviors(this, "templates", "thisOnStep");
      }
    },
    beforeDraw() {
      if ([false][0] && templates.isCopy(this)) {
    const inverse = this.transform.localTransform.clone().invert();
    this.$cDebugCollision.transform.setFromMatrix(inverse);
    this.$cDebugCollision.position.set(0, 0);
    this.$cDebugText.transform.setFromMatrix(inverse);
    this.$cDebugText.position.set(0, 0);

    const newtext = `Partitions: ${this.$chashes.join(', ')}
CGroup: ${this.cgroup || 'unset'}
Shape: ${(this._shape && this._shape.__type) || 'unused'}`;
    if (this.$cDebugText.text !== newtext) {
        this.$cDebugText.text = newtext;
    }
    this.$cDebugCollision
    .clear();
    place.drawDebugGraphic.apply(this);
    this.$cHadCollision = false;
}

    },
    afterDraw() {
      if (this.behaviors.length) {
        runBehaviors(this, "templates", "thisOnDraw");
      }
      if (this.baseClass === "Button" && (this.scale.x !== 1 || this.scale.y !== 1)) {
        this.unsize();
      }
      if (this.updateNineSliceShape) {
        if (this.prevWidth !== this.width || this.prevHeight !== this.height) {
          this.prevWidth = this.width;
          this.prevHeight = this.height;
          u_default.reshapeNinePatch(this);
        }
      }
      /* eslint-disable no-underscore-dangle */
if ((this.transform && (this.transform._localID !== this.transform._currentLocalID)) ||
    this.x !== this.xprev ||
    this.y !== this.yprev
) {
    delete this._shape;
    const oldHashes = this.$chashes || [];
    this.$chashes = place.getHashes(this);
    for (const hash of oldHashes) {
        if (this.$chashes.indexOf(hash) === -1) {
            place.grid[hash].splice(place.grid[hash].indexOf(this), 1);
        }
    }
    for (const hash of this.$chashes) {
        if (oldHashes.indexOf(hash) === -1) {
            if (!(hash in place.grid)) {
                place.grid[hash] = [this];
            } else {
                place.grid[hash].push(this);
            }
        }
    }
}
if (this.matterEnable) {
    this.rotation = this.matterBody.angle;
    this.x = this.matterBody.position.x;
    this.y = this.matterBody.position.y;
    //this.speed = this.matterBody.speed;
    this.hspeed = this.matterBody.velocity.x;
    this.vspeed = this.matterBody.velocity.y;
    //this.direction = u.pdn(this.hspeed, this.vspeed);
}

    },
    onDestroy() {
      if (this.$chashes) {
    for (const hash of this.$chashes) {
        place.grid[hash].splice(place.grid[hash].indexOf(this), 1);
    }
}
if (this.matterEnable) {
    Matter.World.remove(rooms.current.matterWorld, this.matterBody);
}

      if (this.behaviors.length) {
        runBehaviors(this, "templates", "thisOnDestroy");
      }
    }
  };
  var templates_default = templatesLib;

  // src/ct.release/camera.ts
  var shakeCamera = function shakeCamera2(camera2, time) {
    camera2.shake -= time * camera2.shakeDecay;
    camera2.shake = Math.max(0, camera2.shake);
    if (camera2.shakeMax) {
      camera2.shake = Math.min(camera2.shake, camera2.shakeMax);
    }
    const phaseDelta = time * camera2.shakeFrequency;
    camera2.shakePhase += phaseDelta;
    camera2.shakePhaseX += phaseDelta * (1 + Math.sin(camera2.shakePhase * 0.1489) * 0.25);
    camera2.shakePhaseY += phaseDelta * (1 + Math.sin(camera2.shakePhase * 0.1734) * 0.25);
  };
  var followCamera = function followCamera2(camera2) {
    const bx = camera2.borderX === null ? camera2.width / 2 : Math.min(camera2.borderX, camera2.width / 2), by = camera2.borderY === null ? camera2.height / 2 : Math.min(camera2.borderY, camera2.height / 2);
    const tl = camera2.uiToGameCoord(bx, by), br = camera2.uiToGameCoord(camera2.width - bx, camera2.height - by);
    if (!camera2.follow) {
      return;
    }
    if (camera2.followX) {
      if (camera2.follow.x < tl.x - camera2.interpolatedShiftX) {
        camera2.targetX = camera2.follow.x - bx + camera2.width / 2;
      } else if (camera2.follow.x > br.x - camera2.interpolatedShiftX) {
        camera2.targetX = camera2.follow.x + bx - camera2.width / 2;
      }
    }
    if (camera2.followY) {
      if (camera2.follow.y < tl.y - camera2.interpolatedShiftY) {
        camera2.targetY = camera2.follow.y - by + camera2.height / 2;
      } else if (camera2.follow.y > br.y - camera2.interpolatedShiftY) {
        camera2.targetY = camera2.follow.y + by - camera2.height / 2;
      }
    }
  };
  var restrictInRect = function restrictInRect2(camera2) {
    if (camera2.minX !== void 0) {
      const boundary = camera2.minX + camera2.width * camera2.scale.x * 0.5;
      camera2.x = Math.max(boundary, camera2.x);
      camera2.targetX = Math.max(boundary, camera2.targetX);
    }
    if (camera2.maxX !== void 0) {
      const boundary = camera2.maxX - camera2.width * camera2.scale.x * 0.5;
      camera2.x = Math.min(boundary, camera2.x);
      camera2.targetX = Math.min(boundary, camera2.targetX);
    }
    if (camera2.minY !== void 0) {
      const boundary = camera2.minY + camera2.height * camera2.scale.y * 0.5;
      camera2.y = Math.max(boundary, camera2.y);
      camera2.targetY = Math.max(boundary, camera2.targetY);
    }
    if (camera2.maxY !== void 0) {
      const boundary = camera2.maxY - camera2.height * camera2.scale.y * 0.5;
      camera2.y = Math.min(boundary, camera2.y);
      camera2.targetY = Math.min(boundary, camera2.targetY);
    }
  };
  var _width, _height;
  var Camera = class extends PIXI.DisplayObject {
    constructor(x, y, w, h) {
      super();
      __privateAdd(this, _width, void 0);
      __privateAdd(this, _height, void 0);
      // Same story
      this.sortDirty = false;
      this.reset(x, y, w, h);
      this.getBounds = this.getBoundingBox;
    }
    reset(x, y, w, h) {
      this.followX = this.followY = true;
      this.follow = void 0;
      this.targetX = this.x = x;
      this.targetY = this.y = y;
      this.z = 500;
      __privateSet(this, _width, w || 1920);
      __privateSet(this, _height, h || 1080);
      this.referenceLength = Math.max(__privateGet(this, _width), __privateGet(this, _height)) / 2;
      this.shiftX = this.shiftY = this.interpolatedShiftX = this.interpolatedShiftY = 0;
      this.borderX = this.borderY = null;
      this.minX = this.maxX = this.minY = this.maxY = void 0;
      this.drift = 0;
      this.shake = 0;
      this.shakeDecay = 5;
      this.shakeX = this.shakeY = 1;
      this.shakeFrequency = 50;
      this.shakePhase = this.shakePhaseX = this.shakePhaseY = 0;
      this.shakeMax = 10;
    }
    get width() {
      return __privateGet(this, _width);
    }
    set width(value) {
      __privateSet(this, _width, value);
    }
    get height() {
      return __privateGet(this, _height);
    }
    set height(value) {
      __privateSet(this, _height, value);
    }
    get scale() {
      return this.transform.scale;
    }
    set scale(value) {
      if (typeof value === "number") {
        this.transform.scale.x = this.transform.scale.y = value;
      } else {
        this.transform.scale.copyFrom(value);
      }
    }
    // Dummying unneeded methods that need implementation in non-abstract classes of DisplayObject
    render() {
    }
    // Can't have children as it is not a container
    removeChild() {
    }
    calculateBounds() {
    }
    /**
     * Moves the camera to a new position. It will have a smooth transition
     * if a `drift` parameter is set.
     * @param x New x coordinate
     * @param y New y coordinate
     */
    moveTo(x, y) {
      this.targetX = x;
      this.targetY = y;
    }
    /**
     * Moves the camera to a new position. Ignores the `drift` value.
     * @param x New x coordinate
     * @param y New y coordinate
     */
    teleportTo(x, y) {
      this.targetX = this.x = x;
      this.targetY = this.y = y;
      this.shakePhase = this.shakePhaseX = this.shakePhaseY = 0;
      this.interpolatedShiftX = this.shiftX;
      this.interpolatedShiftY = this.shiftY;
    }
    /**
     * Updates the position of the camera
     * @param time Time between the last two frames, in seconds.
     * This is usually `u.time`.
     */
    update(time) {
      shakeCamera(this, time);
      if (this.follow && copyTypeSymbol in this.follow && this.follow.kill) {
        this.follow = false;
      }
      if (!this.follow && rooms_default.current.follow) {
        [this.follow] = templates_default.list[rooms_default.current.follow];
      }
      if (this.follow && "x" in this.follow && "y" in this.follow) {
        followCamera(this);
      }
      const speed = this.drift ? Math.min(1, (1 - this.drift) * time * 60) : 1;
      this.x = this.targetX * speed + this.x * (1 - speed);
      this.y = this.targetY * speed + this.y * (1 - speed);
      this.interpolatedShiftX = this.shiftX * speed + this.interpolatedShiftX * (1 - speed);
      this.interpolatedShiftY = this.shiftY * speed + this.interpolatedShiftY * (1 - speed);
      restrictInRect(this);
      this.x = this.x || 0;
      this.y = this.y || 0;
      const { listener } = PIXI.sound.context.audioContext;
      if ("positionX" in listener) {
        listener.positionX.value = this.x / this.referenceLength;
        listener.positionY.value = this.y / this.referenceLength;
        listener.positionZ.value = this.scale.x;
      } else {
        listener.setPosition(
          this.x / this.referenceLength,
          this.y / this.referenceLength,
          this.scale.x
        );
      }
      pannedSounds.forEach((filter, pos) => filter.reposition(pos));
    }
    /**
     * Returns the current camera position plus the screen shake effect.
     * @readonly
     */
    get computedX() {
      const dx = (Math.sin(this.shakePhaseX) + Math.sin(this.shakePhaseX * 3.1846) * 0.25) / 1.25;
      const x = this.x + dx * this.shake * Math.max(this.width, this.height) / 100 * this.shakeX;
      return x + this.interpolatedShiftX;
    }
    /**
     * Returns the current camera position plus the screen shake effect.
     * @readonly
     */
    get computedY() {
      const dy = (Math.sin(this.shakePhaseY) + Math.sin(this.shakePhaseY * 2.8948) * 0.25) / 1.25;
      const y = this.y + dy * this.shake * Math.max(this.width, this.height) / 100 * this.shakeY;
      return y + this.interpolatedShiftY;
    }
    /**
     * Returns the position of the left edge where the visible rectangle ends,
     * in game coordinates.
     * This can be used for UI positioning in game coordinates.
     * This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopLeftCorner`
     * and `getBottomLeftCorner` methods.
     * @returns The location of the left edge.
     * @readonly
     */
    get left() {
      return this.computedX - this.width / 2 * this.scale.x;
    }
    /**
     * Returns the position of the top edge where the visible rectangle ends,
     * in game coordinates.
     * This can be used for UI positioning in game coordinates.
     * This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopLeftCorner`
     * and `getTopRightCorner` methods.
     * @returns The location of the top edge.
     * @readonly
     */
    get top() {
      return this.computedY - this.height / 2 * this.scale.y;
    }
    /**
     * Returns the position of the right edge where the visible rectangle ends,
     * in game coordinates.
     * This can be used for UI positioning in game coordinates.
     * This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopRightCorner`
     * and `getBottomRightCorner` methods.
     * @returns The location of the right edge.
     * @readonly
     */
    get right() {
      return this.computedX + this.width / 2 * this.scale.x;
    }
    /**
     * Returns the position of the bottom edge where the visible rectangle ends,
     * in game coordinates. This can be used for UI positioning in game coordinates.
     * This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getBottomLeftCorner`
     * and `getBottomRightCorner` methods.
     * @returns The location of the bottom edge.
     * @readonly
     */
    get bottom() {
      return this.computedY + this.height / 2 * this.scale.y;
    }
    /**
     * Translates a point from UI space to game space.
     * @param x The x coordinate in UI space.
     * @param y The y coordinate in UI space.
     * @returns A pair of new `x` and `y` coordinates.
     */
    uiToGameCoord(x, y) {
      const modx = (x - this.width / 2) * this.scale.x, mody = (y - this.height / 2) * this.scale.y;
      const result = u_default.rotate(modx, mody, this.angle);
      return new PIXI.Point(
        result.x + this.computedX,
        result.y + this.computedY
      );
    }
    /**
     * Translates a point from game space to UI space.
     * @param {number} x The x coordinate in game space.
     * @param {number} y The y coordinate in game space.
     * @returns {PIXI.Point} A pair of new `x` and `y` coordinates.
     */
    gameToUiCoord(x, y) {
      const relx = x - this.computedX, rely = y - this.computedY;
      const unrotated = u_default.rotate(relx, rely, -this.angle);
      return new PIXI.Point(
        unrotated.x / this.scale.x + this.width / 2,
        unrotated.y / this.scale.y + this.height / 2
      );
    }
    /**
     * Gets the position of the top-left corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates,
     * especially with rotated viewports.
     * @returns {PIXI.Point} A pair of `x` and `y` coordinates.
     */
    getTopLeftCorner() {
      return this.uiToGameCoord(0, 0);
    }
    /**
     * Gets the position of the top-right corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates,
     * especially with rotated viewports.
     * @returns {PIXI.Point} A pair of `x` and `y` coordinates.
     */
    getTopRightCorner() {
      return this.uiToGameCoord(this.width, 0);
    }
    /**
     * Gets the position of the bottom-left corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates,
     * especially with rotated viewports.
     * @returns {PIXI.Point} A pair of `x` and `y` coordinates.
     */
    getBottomLeftCorner() {
      return this.uiToGameCoord(0, this.height);
    }
    /**
     * Gets the position of the bottom-right corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates,
     * especially with rotated viewports.
     * @returns {PIXI.Point} A pair of `x` and `y` coordinates.
     */
    getBottomRightCorner() {
      return this.uiToGameCoord(this.width, this.height);
    }
    /**
     * Returns the bounding box of the camera.
     * Useful for rotated viewports when something needs to be reliably covered by a rectangle.
     * @returns {PIXI.Rectangle} The bounding box of the camera.
     */
    getBoundingBox() {
      const bb = new PIXI.Bounds();
      const tl = this.getTopLeftCorner(), tr = this.getTopRightCorner(), bl = this.getBottomLeftCorner(), br = this.getBottomRightCorner();
      bb.addPoint(new PIXI.Point(tl.x, tl.y));
      bb.addPoint(new PIXI.Point(tr.x, tr.y));
      bb.addPoint(new PIXI.Point(bl.x, bl.y));
      bb.addPoint(new PIXI.Point(br.x, br.y));
      return bb.getRectangle();
    }
    /**
     * Checks whether a given object (or any Pixi's DisplayObject)
     * is potentially visible, meaning that its bounding box intersects
     * the camera's bounding box.
     * @param {PIXI.DisplayObject} copy An object to check for.
     * @returns {boolean} `true` if an object is visible, `false` otherwise.
     */
    contains(copy) {
      const bounds = copy.getBounds(true);
      return bounds.right > 0 && bounds.left < this.width * this.scale.x && bounds.bottom > 0 && bounds.top < this.width * this.scale.y;
    }
    /**
     * Realigns all the copies in a room so that they distribute proportionally
     * to a new camera size based on their `xstart` and `ystart` coordinates.
     * Will throw an error if the given room is not in UI space (if `room.isUi` is not `true`).
     * You can skip the realignment for some copies
     * if you set their `skipRealign` parameter to `true`.
     * @param {Room} room The room which copies will be realigned.
     * @returns {void}
     */
    realign(room) {
      if (!room.isUi) {
        console.error("[ct.camera] An attempt to realing a room that is not in UI space. The room in question is", room);
        throw new Error("[ct.camera] An attempt to realing a room that is not in UI space.");
      }
      const w = rooms_default.templates[room.name].width || 1, h = rooms_default.templates[room.name].height || 1;
      for (const copy of room.children) {
        if (!(copyTypeSymbol in copy)) {
          continue;
        }
        if (copy.skipRealign) {
          continue;
        }
        copy.x = copy.xstart / w * this.width;
        copy.y = copy.ystart / h * this.height;
      }
    }
    /**
     * This will align all non-UI layers in the game according to the camera's transforms.
     * This is automatically called internally, and you will hardly ever use it.
     */
    manageStage() {
      const px = this.computedX, py = this.computedY, sx = 1 / (isNaN(this.scale.x) ? 1 : this.scale.x), sy = 1 / (isNaN(this.scale.y) ? 1 : this.scale.y);
      for (const item of pixiApp.stage.children) {
        if (!("isUi" in item && item.isUi) && item.pivot) {
          item.x = -this.width / 2;
          item.y = -this.height / 2;
          item.pivot.x = px;
          item.pivot.y = py;
          item.scale.x = sx;
          item.scale.y = sy;
          item.angle = -this.angle;
        }
      }
    }
  };
  _width = new WeakMap();
  _height = new WeakMap();
  var mainCamera = new Camera(
    0,
    0,
    [
      720
    ][0],
    [
      1280
    ][0]
  );
  var camera_default = mainCamera;

  // src/ct.release/u.ts
  var required = function required2(paramName, method) {
    let str = "The parameter ";
    if (paramName) {
      str += `${paramName} `;
    }
    if (method) {
      str += `of ${method} `;
    }
    str += "is required.";
    throw new Error(str);
  };
  var uLib = {
    /**
     * A measure of how long the previous frame took time to draw,
     * usually equal to 1 and larger on lags.
     * For example, if it is equal to 2, it means that the previous frame took twice as much time
     * compared to expected FPS rate.
     *
     * Note that `this.move()` already uses it, so there is no need to premultiply
     * `this.speed` with it.
     *
     * **A minimal example:**
     * ```js
     * this.x += this.windSpeed * u.delta;
     * ```
     *
     * @deprecated Use `u.time` instead.
     */
    delta: 1,
    /**
     * A measure of how long the previous frame took time to draw, usually equal to 1
     * and larger on lags.
     * For example, if it is equal to 2, it means that the previous frame took twice as much time
     * compared to expected FPS rate.
     *
     * This is a version for UI elements, as it is not affected by time scaling, and thus works well
     * both with slow-mo effects and game pause.
     *
     * @deprecated Use `u.timeUi` instead.
     */
    deltaUi: 1,
    /**
     * A measure of how long the previous frame took time to draw, in seconds.
     * You can use it by multiplying it with your copies' speed and other values with velocity
     * to get the same speed with different framerate, regardless of lags or max framerate cap.
     *
     * If you plan on changing your game's target framerate,
     * you should use `u.time` instead of `u.delta`.
     *
     * **A minimal example:**
     * ```js
     * this.x += this.windSpeed * u.time;
     * ```
     */
    time: 1 / 60,
    /**
     * A measure of how long the previous frame took time to draw, in seconds.
     * You can use it by multiplying it with your copies' speed and other values with velocity
     * to get the same speed with different framerate, regardless of lags or max framerate cap.
     *
     * This version ignores the effects of slow-mo effects and game pause,
     * and thus is perfect for UI element.
     *
     * If you plan on changing your game's target framerate,
     * you should use `u.timeUi` instead of `u.deltaUi`.
     */
    timeUi: 1 / 60,
    /**
     * A measure of how long the previous frame took time to draw, in seconds.
     * You can use it by multiplying it with your copies' speed and other values with velocity
     * to get the same speed with different framerate, regardless of lags or max framerate cap.
     *
     * This version ignores the effects of slow-mo effects and game pause,
     * and thus is perfect for UI element.
     *
     * If you plan on changing your game's target framerate,
     * you should use `u.timeUi` instead of `u.deltaUi`.
     */
    timeUI: 1 / 60,
    // ⚠️ keep this "duplicate": it is an alias with different capitalization
    /**
     * Get the environment the game runs on.
     * @returns {string} Either 'ct.ide', or 'nw', or 'electron', or 'browser'.
     */
    getEnvironment() {
      if (window.name === "ct.js debugger") {
        return "ct.ide";
      }
      try {
        if ("nw" in window && "require" in window.nw) {
          return "nw";
        }
      } catch (oO) {
      }
      try {
        __require("electron");
        return "electron";
      } catch (Oo) {
      }
      return "browser";
    },
    /**
     * Get the current operating system the game runs on.
     * @returns {string} One of 'windows', 'darwin' (which is MacOS), 'linux', or 'unknown'.
     */
    getOS() {
      const ua = window.navigator.userAgent;
      if (ua.indexOf("Windows") !== -1) {
        return "windows";
      }
      if (ua.indexOf("Linux") !== -1) {
        return "linux";
      }
      if (ua.indexOf("Mac") !== -1) {
        return "darwin";
      }
      return "unknown";
    },
    /**
     * Returns the length of a vector projection onto an X axis.
     * @param {number} l The length of the vector
     * @param {number} d The direction of the vector
     * @returns {number} The length of the projection
     */
    ldx(l, d) {
      return l * Math.cos(d * Math.PI / 180);
    },
    /**
     * Returns the length of a vector projection onto an Y axis.
     * @param {number} l The length of the vector
     * @param {number} d The direction of the vector
     * @returns {number} The length of the projection
     */
    ldy(l, d) {
      return l * Math.sin(d * Math.PI / 180);
    },
    /**
     * Returns the direction of a vector that points from the first point to the second one.
     * @param {number} x1 The x location of the first point
     * @param {number} y1 The y location of the first point
     * @param {number} x2 The x location of the second point
     * @param {number} y2 The y location of the second point
     * @returns {number} The angle of the resulting vector, in degrees
     */
    pdn(x1, y1, x2, y2) {
      return (Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI + 360) % 360;
    },
    // Point-point DistanCe
    /**
     * Returns the distance between two points
     * @param {number} x1 The x location of the first point
     * @param {number} y1 The y location of the first point
     * @param {number} x2 The x location of the second point
     * @param {number} y2 The y location of the second point
     * @returns {number} The distance between the two points
     */
    pdc(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    },
    /**
     * Convers degrees to radians
     * @param {number} deg The degrees to convert
     * @returns {number} The resulting radian value
     */
    degToRad(deg) {
      return deg * Math.PI / 180;
    },
    /**
     * Convers radians to degrees
     * @param {number} rad The radian value to convert
     * @returns {number} The resulting degree
     */
    radToDeg(rad) {
      return rad / Math.PI * 180;
    },
    /**
     * Rotates a vector (x; y) by `deg` around (0; 0)
     * @param {number} x The x component
     * @param {number} y The y component
     * @param {number} deg The degree to rotate by
     * @returns {PIXI.Point} A pair of new `x` and `y` parameters.
     */
    rotate(x, y, deg) {
      return uLib.rotateRad(x, y, uLib.degToRad(deg));
    },
    /**
     * Rotates a vector (x; y) by `rad` around (0; 0)
     * @param {number} x The x component
     * @param {number} y The y component
     * @param {number} rad The radian value to rotate around
     * @returns {PIXI.Point} A pair of new `x` and `y` parameters.
     */
    rotateRad(x, y, rad) {
      const sin = Math.sin(rad), cos = Math.cos(rad);
      return new PIXI.Point(
        cos * x - sin * y,
        cos * y + sin * x
      );
    },
    /**
     * Gets the most narrow angle between two vectors of given directions
     * @param {number} dir1 The direction of the first vector
     * @param {number} dir2 The direction of the second vector
     * @returns {number} The resulting angle
     */
    deltaDir(dir1, dir2) {
      dir1 = (dir1 % 360 + 360) % 360;
      dir2 = (dir2 % 360 + 360) % 360;
      var t = dir1, h = dir2, ta = h - t;
      if (ta > 180) {
        ta -= 360;
      }
      if (ta < -180) {
        ta += 360;
      }
      return ta;
    },
    /**
     * Returns a number in between the given range (clamps it).
     * @param {number} min The minimum value of the given number
     * @param {number} val The value to fit in the range
     * @param {number} max The maximum value of the given number
     * @returns {number} The clamped value
     */
    clamp(min, val, max) {
      return Math.max(min, Math.min(max, val));
    },
    /**
     * Linearly interpolates between two values by the apha value.
     * Can also be describing as mixing between two values with a given proportion `alpha`.
     * @param {number} a The first value to interpolate from
     * @param {number} b The second value to interpolate to
     * @param {number} alpha The mixing value
     * @returns {number} The result of the interpolation
     */
    lerp(a, b, alpha) {
      return a + (b - a) * alpha;
    },
    /**
     * Returns the position of a given value in a given range. Opposite to linear interpolation.
     * @param  {number} a The first value to interpolate from
     * @param  {number} b The second value to interpolate top
     * @param  {number} val The interpolated values
     * @return {number} The position of the value in the specified range.
     * When a <= val <= b, the result will be inside the [0;1] range.
     */
    unlerp(a, b, val) {
      return (val - a) / (b - a);
    },
    /**
     * Re-maps the given value from one number range to another.
     * @param  {number} val The value to be mapped
     * @param  {number} inMin Lower bound of the value's current range
     * @param  {number} inMax Upper bound of the value's current range
     * @param  {number} outMin Lower bound of the value's target range
     * @param  {number} outMax Upper bound of the value's target range
     * @returns {number} The mapped value.
     */
    map(val, inMin, inMax, outMin, outMax) {
      return (val - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    },
    hexToPixi(hex) {
      return Number("0x" + hex.slice(1));
    },
    pixiToHex(pixi) {
      return "#" + pixi.toString(16).padStart(6, "0");
    },
    /**
     * Returns a shape object based on the dimensions of the given sprite.
     */
    getRectShape(sprite) {
      return {
        type: "rect",
        left: sprite.width * sprite.anchor.x,
        top: sprite.height * sprite.anchor.y,
        right: sprite.width * (1 - sprite.anchor.x),
        bottom: sprite.height * (1 - sprite.anchor.y)
      };
    },
    /**
     * Takes a CopyPanel instance and changes its shape to accommodate its new dimensions.
     * Doesn't work with circular collision shapes.
     */
    reshapeNinePatch(copy) {
      const target = copy.baseClass === "NineSlicePlane" ? copy : copy.panel;
      const origTex = target.texture;
      const origShape = origTex.shape;
      const origWidth = origTex.width, origHeight = origTex.height;
      const dwx = target.width - origWidth, dhy = target.height - origHeight;
      const bw = origWidth - target.leftWidth - target.rightWidth, bh = origHeight - target.topHeight - target.bottomHeight;
      if (origShape.type === "circle") {
        throw new Error(`[u.reshapeNinePatch] Cannot reshape a circular collision mask for ${copy.template}. Please use a different collision type for its texture.`);
      }
      if (origShape.type === "rect") {
        const shape = {
          type: "rect",
          left: origShape.left,
          top: origShape.top,
          right: origShape.right + dwx,
          bottom: origShape.bottom + dhy
        };
        if (origShape.left > target.leftWidth) {
          shape.left = (origShape.left - target.leftWidth) * (1 + dwx) / bw;
        }
        if (origShape.right < target.rightWidth) {
          shape.right = (origShape.right - target.rightWidth) * (1 + dwx) / bw;
        }
        if (origShape.top > target.topHeight) {
          shape.top = (origShape.top - target.topHeight) * (1 + dhy) / bh;
        }
        if (origShape.bottom < target.bottomHeight) {
          shape.bottom = (origShape.bottom - target.bottomHeight) * (1 + dhy) / bh;
        }
        copy.shape = shape;
        return;
      }
      if (origShape.type === "strip") {
        const shape = {
          type: "strip",
          points: [],
          closedStrip: origShape.closedStrip
        };
        shape.points = origShape.points.map((point) => {
          let { x, y } = point;
          if (point.x >= origWidth - target.rightWidth) {
            x += dwx;
          } else if (point.x > target.leftWidth) {
            x = target.leftWidth + (point.x - target.leftWidth) * (1 + dwx / bw);
          }
          if (point.y >= origHeight - target.bottomHeight) {
            y += dhy;
          } else if (point.y > target.topHeight) {
            y = target.topHeight + (point.y - target.topHeight) * (1 + dhy / bh);
          }
          return {
            x,
            y
          };
        });
        copy.shape = shape;
      }
      const hitarea = uLib.getHitArea(copy.shape);
      if (hitarea) {
        copy.hitArea = hitarea;
      }
    },
    getHitArea(shape) {
      if (shape.type === "circle") {
        return new PIXI.Circle(0, 0, shape.r);
      }
      if (shape.type === "rect") {
        return new PIXI.Rectangle(
          -shape.left,
          -shape.top,
          shape.left + shape.right,
          shape.top + shape.bottom
        );
      }
      if (shape.type === "strip") {
        return new PIXI.Polygon(shape.points.map((point) => new PIXI.Point(point.x, point.y)));
      }
      return false;
    },
    /**
     * Tests whether a given point is inside the given rectangle
     * (it can be either a copy or an array).
     * @param {number} x The x coordinate of the point.
     * @param {number} y The y coordinate of the point.
     * @param {(Copy|Array<Number>)} arg Either a copy (it must have a rectangular shape)
     * or an array in a form of [x1, y1, x2, y2], where (x1;y1) and (x2;y2) specify
     * the two opposite corners of the rectangle.
     * @returns {boolean} `true` if the point is inside the rectangle, `false` otherwise.
     */
    prect(x, y, arg) {
      var xmin, xmax, ymin, ymax;
      if (arg instanceof Array) {
        xmin = Math.min(arg[0], arg[2]);
        xmax = Math.max(arg[0], arg[2]);
        ymin = Math.min(arg[1], arg[3]);
        ymax = Math.max(arg[1], arg[3]);
      } else {
        if (arg.shape.type !== "rect") {
          throw new Error("[ct.u.prect] The specified copy doesn't have a rectangular collision shape.");
        }
        xmin = arg.x - arg.shape.left * arg.scale.x;
        xmax = arg.x + arg.shape.right * arg.scale.x;
        ymin = arg.y - arg.shape.top * arg.scale.y;
        ymax = arg.y + arg.shape.bottom * arg.scale.y;
      }
      return x >= xmin && y >= ymin && x <= xmax && y <= ymax;
    },
    /**
     * Tests whether a given point is inside the given circle (it can be either a copy or an array)
     * @param {number} x The x coordinate of the point
     * @param {number} y The y coordinate of the point
     * @param {(Copy|Array<Number>)} arg Either a copy (it must have a circular shape)
     * or an array in a form of [x1, y1, r], where (x1;y1) define the center of the circle
     * and `r` defines the radius of it.
     * @returns {boolean} `true` if the point is inside the circle, `false` otherwise
     */
    pcircle(x, y, arg) {
      if (arg instanceof Array) {
        return uLib.pdc(x, y, arg[0], arg[1]) < arg[2];
      }
      if (arg.shape.type !== "circle") {
        throw new Error("[ct.u.pcircle] The specified copy doesn't have a circular shape");
      }
      return uLib.pdc(0, 0, (arg.x - x) / arg.scale.x, (arg.y - y) / arg.scale.y) < arg.shape.r;
    },
    /**
     * Converts the position of a point in UI coordinates
     * to its position in HTML page in CSS pixels.
     */
    uiToCssCoord(x, y) {
      const cpos = canvasCssPosition;
      return new PIXI.Point(
        x / camera_default.width * cpos.width + cpos.x,
        y / camera_default.height * cpos.height + cpos.y
      );
    },
    /**
     * Converts the position of a point in gameplay coordinates
     * to its position in HTML page in CSS pixels.
     */
    gameToCssCoord(x, y) {
      const ui = camera_default.gameToUiCoord(x, y);
      return uLib.uiToCssCoord(ui.x, ui.y);
    },
    /**
     * Converts UI pixels into CSS pixels, but ignores canvas shift
     * that usually happens due to letterboxing.
     */
    uiToCssScalar(val) {
      return val / camera_default.width * canvasCssPosition.width;
    },
    /**
     * Converts UI pixels into CSS pixels, but ignores canvas shift
     * that usually happens due to letterboxing.
     */
    gameToCssScalar(val) {
      return val / (camera_default.width * camera_default.scale.x) * canvasCssPosition.width;
    },
    gameToUiCoord(x, y) {
      return camera_default.gameToUiCoord(x, y);
    },
    uiToGameCoord(x, y) {
      return camera_default.uiToGameCoord(x, y);
    },
    /**
     * Returns a Promise that resolves after the given time.
     * This timer is run in gameplay time scale, meaning that it is affected by time stretching.
     * @param {number} time Time to wait, in milliseconds
     * @returns {CtTimer} The timer, which you can call `.then()` to
     */
    wait(time) {
      return timer_default.add(time);
    },
    /**
     * Returns a Promise that resolves after the given time.
     * This timer runs in UI time scale and is not sensitive to time stretching.
     * @param {number} time Time to wait, in milliseconds
     * @returns {CtTimer} The timer, which you can call `.then()` to
     */
    waitUi(time) {
      return timer_default.addUi(time);
    },
    /**
     * Creates a new function that returns a promise, based
     * on a function with a regular (err, result) => {...} callback.
     * @param {Function} f The function that needs to be promisified
     * @see https://javascript.info/promisify
     */
    promisify(f) {
      return function(...args2) {
        return new Promise((resolve, reject) => {
          const callback = function callback2(err, result) {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          };
          args2.push(callback);
          f.call(this, ...args2);
        });
      };
    },
    required,
    /**
     * Takes a prefix and a number to make a string in format Prefix_XX,
     * mainly used to get nice names for assets.
     */
    numberedString(prefix, input) {
      return prefix + "_" + input.toString().padStart(2, "0");
    },
    /**
     * Gets the number of a string with pattern Prefix_XX,
     * generally used to work with asset names.
     */
    getStringNumber(str) {
      return Number(str.split("_").pop());
    }
  };
  Object.assign(uLib, {
    // make aliases
    getOs: uLib.getOS,
    lengthDirX: uLib.ldx,
    lengthDirY: uLib.ldy,
    pointDirection: uLib.pdn,
    pointDistance: uLib.pdc,
    pointRectangle: uLib.prect,
    pointCircle: uLib.pcircle
  });
  var u_default = uLib;

  // src/ct.release/rooms.ts
  var _Room = class extends PIXI.Container {
    // eslint-disable-next-line max-lines-per-function
    constructor(template, isRoot) {
      super();
      this.alignElements = [];
      this.kill = false;
      this.tileLayers = [];
      this.backgrounds = [];
      this.bindings = /* @__PURE__ */ new Set();
      this.tickerSet = /* @__PURE__ */ new Set();
      /** Time for the next run of the 1st timer, in seconds. */
      this.timer1 = 0;
      /** Time for the next run of the 2nd timer, in seconds. */
      this.timer2 = 0;
      /** Time for the next run of the 3rd timer, in seconds. */
      this.timer3 = 0;
      /** Time for the next run of the 4th timer, in seconds. */
      this.timer4 = 0;
      /** Time for the next run of the 5th timer, in seconds. */
      this.timer5 = 0;
      /** Time for the next run of the 6th timer, in seconds. */
      this.timer6 = 0;
      this.x = this.y = 0;
      this.sortableChildren = true;
      this.uid = _Room.getNewId();
      if (template) {
        this.onCreate = template.onCreate;
        this.onStep = template.onStep;
        this.onDraw = template.onDraw;
        this.onLeave = template.onLeave;
        this.template = template;
        this.name = template.name;
        this.isUi = template.isUi;
        this.follow = template.follow;
        this.viewWidth = template.width;
        this.viewHeight = template.height;
        this.behaviors = [...template.behaviors];
        if (template.extends) {
          Object.assign(this, template.extends);
        }
        if (isRoot) {
          roomsLib.current = this;
          pixiApp.renderer.background.color = u_default.hexToPixi(this.template.backgroundColor);
        }
        if (this === rooms.current) {
    place.tileGrid = {};
}
if (this === rooms.current) {
    rooms.current.matterEngine = Matter.Engine.create();
    rooms.current.matterWorld = rooms.current.matterEngine.world;
    rooms.current.matterGravity = rooms.current.matterGravity || [0, 9.8];
    [
        rooms.current.matterWorld.gravity.x,
        rooms.current.matterWorld.gravity.y
    ] = rooms.current.matterGravity;
    matter.rulebookStart = [];
    matter.rulebookActive = [];
    matter.rulebookEnd = [];
}

        for (let i = 0, li = template.bgs.length; i < li; i++) {
          const bg = new Background(
            template.bgs[i].texture,
            null,
            template.bgs[i].depth,
            template.bgs[i].exts
          );
          this.addChild(bg);
        }
        for (let i = 0, li = template.tiles.length; i < li; i++) {
          const tl = new Tilemap(template.tiles[i]);
          this.tileLayers.push(tl);
          this.addChild(tl);
        }
        for (let i = 0, li = template.objects.length; i < li; i++) {
          const copy = template.objects[i];
          const exts = copy.exts || {};
          const customProperties = copy.customProperties || {};
          const ctCopy = templates_default.copyIntoRoom(
            copy.template,
            copy.x,
            copy.y,
            this,
            __spreadProps(__spreadValues(__spreadValues({}, exts), customProperties), {
              scaleX: copy.scale.x,
              scaleY: copy.scale.y,
              rotation: copy.rotation,
              alpha: copy.opacity,
              tint: copy.tint,
              customSize: copy.customSize,
              customWordWrap: copy.customWordWrap,
              customText: copy.customText,
              customAnchor: copy.customAnchor,
              align: copy.align
            })
          );
          if (copy.align) {
            this.alignElements.push(ctCopy);
          }
          if (template.bindings[i]) {
            this.bindings.add(template.bindings[i].bind(ctCopy));
          }
        }
        if (this.alignElements.length) {
          this.realignElements(
            template.width,
            template.height,
            camera_default.width,
            camera_default.height
          );
        }
      } else {
        this.behaviors = [];
      }
      return this;
    }
    static getNewId() {
      this.roomId++;
      return this.roomId;
    }
    realignElements(oldWidth, oldHeight, newWidth, newHeight) {
      for (const copy of this.alignElements) {
        if (!copy.align) {
          continue;
        }
        const { padding, frame } = copy.align;
        const xref = oldWidth * frame.x1 / 100 + padding.left, yref = oldHeight * frame.y1 / 100 + padding.top;
        const wref = oldWidth * (frame.x2 - frame.x1) / 100 - padding.left - padding.right, href = oldHeight * (frame.y2 - frame.y1) / 100 - padding.top - padding.bottom;
        const xnew = newWidth * frame.x1 / 100 + padding.left, ynew = newHeight * frame.y1 / 100 + padding.top;
        const wnew = newWidth * (frame.x2 - frame.x1) / 100 - padding.left - padding.right, hnew = newHeight * (frame.y2 - frame.y1) / 100 - padding.top - padding.bottom;
        if (oldWidth !== newWidth) {
          switch (copy.align.alignX) {
            case "start":
              copy.x += xnew - xref;
              break;
            case "both":
              copy.x += xnew - xref;
              copy.width += wnew - wref;
              break;
            case "end":
              copy.x += wnew - wref + xnew - xref;
              break;
            case "center":
              copy.x += (wnew - wref) / 2 + xnew - xref;
              break;
            case "scale":
              {
                const k = wnew / wref || 1;
                copy.width *= k;
                copy.x = (copy.x - xref) * k + xnew;
              }
              break;
            default:
          }
        }
        if (oldHeight !== newHeight) {
          switch (copy.align.alignY) {
            case "start":
              copy.y += ynew - yref;
              break;
            case "both":
              copy.y += ynew - yref;
              copy.height += hnew - href;
              break;
            case "end":
              copy.y += hnew - href + ynew - yref;
              break;
            case "center":
              copy.y += (hnew - href) / 2 + ynew - yref;
              break;
            case "scale":
              {
                const k = hnew / href || 1;
                copy.height *= k;
                copy.y = (copy.y - yref) * k + ynew;
              }
              break;
            default:
          }
        }
      }
    }
    get x() {
      return -this.position.x;
    }
    set x(value) {
      this.position.x = -value;
    }
    get y() {
      return -this.position.y;
    }
    set y(value) {
      this.position.y = -value;
    }
  };
  var Room = _Room;
  Room.roomId = 0;
  Room.roomId = 0;
  var nextRoom;
  var roomsLib = {
    /**
     * All the existing room templates that can be used in the game.
     * It is usually prefilled by ct.IDE.
     */
    templates: {},
    Room,
    /** The current top-level room in the game. */
    current: null,
    /**
     * An object that contains arrays of currently present rooms.
     * These include the current room (`rooms.current`), as well as any rooms
     * appended or prepended through `rooms.append` and `rooms.prepend`.
     */
    list: {},
    /**
     * Creates and adds a background to the current room, at the given depth.
     * @param {string} texture The name of the texture to use
     * @param {number} depth The depth of the new background
     * @returns {Background} The created background
     */
    addBg(texture, depth) {
      const bg = new Background(texture, null, depth);
      roomsLib.current.addChild(bg);
      return bg;
    },
    /**
     * Clears the current stage, removing all rooms with copies, tile layers, backgrounds,
     * and other potential entities.
     * @returns {void}
     */
    clear() {
      pixiApp.stage.children.length = 0;
      stack.length = 0;
      for (const i in templates_default.list) {
        templates_default.list[i] = [];
      }
      for (const i in backgrounds_default.list) {
        backgrounds_default.list[i] = [];
      }
      roomsLib.list = {};
      for (const name in roomsLib.templates) {
        roomsLib.list[name] = [];
      }
    },
    /**
     * This method safely removes a previously appended/prepended room from the stage.
     * It will trigger "On Leave" for a room and "On Destroy" event
     * for all the copies of the removed room.
     * The room will also have `this.kill` set to `true` in its event, if it comes in handy.
     * This method cannot remove `rooms.current`, the main room.
     * @param {Room} room The `room` argument must be a reference
     * to the previously created room.
     * @returns {void}
     */
    remove(room) {
      if (!(room instanceof Room)) {
        if (typeof room === "string") {
          console.error("[rooms.remove] To remove a room, you should provide a reference to it (to an object), not its name. Provided value:", room);
          throw new Error("[rooms.remove] Invalid argument type");
        }
        throw new Error("[rooms] An attempt to remove a room that is not actually a room! Provided value:" + room);
      }
      const ind = roomsLib.list[room.name].indexOf(room);
      if (ind !== -1) {
        roomsLib.list[room.name].splice(ind, 1);
      } else {
        console.warn("[rooms] Removing a room that was not found in rooms.list. This is strange\u2026");
      }
      room.kill = true;
      pixiApp.stage.removeChild(room);
      for (const copy of room.children) {
        if (copyTypeSymbol in copy) {
          copy.kill = true;
        }
      }
      room.onLeave();
      roomsLib.onLeave.apply(room);
    },
    /**
     * Switches to the given room. Note that this transition happens at the end
     * of the frame, so the name of a new room may be overridden.
     */
    "switch"(roomName) {
      if (roomsLib.templates[roomName]) {
        nextRoom = roomName;
        roomsLib.switching = true;
      } else {
        console.error('[rooms] The room "' + roomName + '" does not exist!');
      }
    },
    switching: false,
    /**
     * Restarts the current room.
     * @returns {void}
     */
    restart() {
      roomsLib.switch(roomsLib.current.name);
    },
    /**
     * Creates a new room and adds it to the stage, separating its draw stack
     * from existing ones.
     * This room is added to `ct.stage` after all the other rooms.
     * @param {string} roomName The name of the room to be appended
     * @param {object} [exts] Any additional parameters applied to the new room.
     * Useful for passing settings and data to new widgets and prefabs.
     * @returns {Room} A newly created room
     */
    append(roomName, exts) {
      if (!(roomName in roomsLib.templates)) {
        throw new Error(`[rooms.append] append failed: the room ${roomName} does not exist!`);
      }
      const room = new Room(roomsLib.templates[roomName], false);
      if (exts) {
        Object.assign(room, exts);
      }
      pixiApp.stage.addChild(room);
      room.onCreate.apply(room);
      roomsLib.onCreate.apply(room);
      roomsLib.list[roomName].push(room);
      return room;
    },
    /**
     * Creates a new room and adds it to the stage, separating its draw stack
     * from existing ones.
     * This room is added to `ct.stage` before all the other rooms.
     * @param {string} roomName The name of the room to be prepended
     * @param {object} [exts] Any additional parameters applied to the new room.
     * Useful for passing settings and data to new widgets and prefabs.
     * @returns {Room} A newly created room
     */
    prepend(roomName, exts) {
      if (!(roomName in roomsLib.templates)) {
        throw new Error(`[rooms] prepend failed: the room ${roomName} does not exist!`);
      }
      const room = new Room(roomsLib.templates[roomName], false);
      if (exts) {
        Object.assign(room, exts);
      }
      pixiApp.stage.addChildAt(room, 0);
      room.onCreate.apply(room);
      roomsLib.onCreate.apply(room);
      roomsLib.list[roomName].push(room);
      return room;
    },
    /**
     * Merges a given room into the current one. Skips room's OnCreate event.
     *
     * @param roomName The name of the room that needs to be merged
     * @returns Arrays of created copies, backgrounds, tile layers,
     * added to the current room (`rooms.current`). Note: it does not get updated,
     * so beware of memory leaks if you keep a reference to this array for a long time!
     */
    merge(roomName) {
      var _a2, _b;
      if (!(roomName in roomsLib.templates)) {
        console.error(`[rooms] merge failed: the room ${roomName} does not exist!`);
        return false;
      }
      const generated = {
        copies: [],
        tileLayers: [],
        backgrounds: []
      };
      const template = roomsLib.templates[roomName];
      const target = roomsLib.current;
      for (const t of template.bgs) {
        const bg = new Background(t.texture, null, t.depth, t.exts);
        target.backgrounds.push(bg);
        target.addChild(bg);
        generated.backgrounds.push(bg);
      }
      for (const t of template.tiles) {
        const tl = new Tilemap(t);
        target.tileLayers.push(tl);
        target.addChild(tl);
        generated.tileLayers.push(tl);
      }
      for (const t of template.objects) {
        const c = templates_default.copyIntoRoom(t.template, t.x, t.y, target, __spreadValues({
          tx: t.scale.x || 1,
          ty: t.scale.y || 1,
          tr: t.rotation || 0,
          scaleX: (_a2 = t.scale) == null ? void 0 : _a2.x,
          scaleY: (_b = t.scale) == null ? void 0 : _b.y,
          rotation: t.rotation,
          alpha: t.opacity
        }, t.customProperties));
        generated.copies.push(c);
      }
      return generated;
    },
    forceSwitch(roomName) {
      if (nextRoom) {
        roomName = nextRoom;
      }
      if (roomsLib.current) {
        roomsLib.rootRoomOnLeave.apply(roomsLib.current);
        roomsLib.current.onLeave();
        roomsLib.onLeave.apply(roomsLib.current);
        roomsLib.current = void 0;
      }
      roomsLib.clear();
      deadPool.length = 0;
      var template = roomsLib.templates[roomName];
      camera_default.reset(
        template.width / 2,
        template.height / 2,
        template.width,
        template.height
      );
      if (template.cameraConstraints) {
        camera_default.minX = template.cameraConstraints.x1;
        camera_default.maxX = template.cameraConstraints.x2;
        camera_default.minY = template.cameraConstraints.y1;
        camera_default.maxY = template.cameraConstraints.y2;
      }
      roomsLib.current = new Room(template, true);
      pixiApp.stage.addChild(roomsLib.current);
      updateViewport();
      roomsLib.rootRoomOnCreate.apply(roomsLib.current);
      roomsLib.current.onCreate();
      roomsLib.onCreate.apply(roomsLib.current);
      roomsLib.list[roomName].push(roomsLib.current);
      
      camera_default.manageStage();
      roomsLib.switching = false;
      nextRoom = void 0;
    },
    onCreate() {
      if (this === rooms.current) {
    const debugTraceGraphics = new PIXI.Graphics();
    debugTraceGraphics.depth = 10000000; // Why not. Overlap everything.
    rooms.current.addChild(debugTraceGraphics);
    place.debugTraceGraphics = debugTraceGraphics;
}
for (const layer of this.tileLayers) {
    if (this.children.indexOf(layer) === -1) {
        continue;
    }
    place.enableTilemapCollisions(layer);
}
if (this === rooms.current) {
    matter.on('collisionStart', e => {
        const {pairs} = e;
        matter.walkOverWithRulebook(matter.rulebookStart, pairs);
    });
    matter.on('collisionActive', e => {
        const {pairs} = e;
        matter.walkOverWithRulebook(matter.rulebookActive, pairs);
    });
    matter.on('collisionEnd', e => {
        const {pairs} = e;
        matter.walkOverWithRulebook(matter.rulebookEnd, pairs);
    });
}

for (const layer of this.tileLayers) {
    if (!layer.matterMakeStatic) {
        continue;
    }
    if (this.children.indexOf(layer) === -1) {
        continue;
    }
    matter.createStaticTilemap(layer);
}

      if (this.behaviors.length) {
        runBehaviors(this, "rooms", "thisOnCreate");
      }
    },
    onLeave() {
      if (this === rooms.current) {
    place.grid = {};
}
if (!this.kill) {
    for (const twoon of tween.tweens) {
        twoon.reject({
            info: 'Room switch',
            code: 1,
            from: 'tween'
        });
    }
    tween.tweens = [];
}

      if (this.behaviors.length) {
        runBehaviors(this, "rooms", "thisOnDestroy");
      }
    },
    beforeStep() {
      pointer.updateGestures();
{
    const positionGame = camera.uiToGameCoord(pointer.xui, pointer.yui);
    pointer.x = positionGame.x;
    pointer.y = positionGame.y;
}
{
    let i = 0;
    while (i < tween.tweens.length) {
        const twoon = tween.tweens[i];
        if (twoon.obj.kill) {
            twoon.reject({
                code: 2,
                info: 'Copy is killed'
            });
            tween.tweens.splice(i, 1);
            continue;
        }
        let a = twoon.timer.time * 1000 / twoon.duration;
        if (a > 1) {
            a = 1;
        }
        for (const field in twoon.fields) {
            const s = twoon.starting[field],
                  d = twoon.fields[field] - twoon.starting[field];
            twoon.obj[field] = twoon.curve(s, d, a);
        }
        if (a === 1) {
            twoon.resolve(twoon.fields);
            tween.tweens.splice(i, 1);
            continue;
        }
        i++;
    }
}

    },
    afterStep() {
      
      if (this.behaviors.length) {
        runBehaviors(this, "rooms", "thisOnStep");
      }
      for (const c of this.tickerSet) {
        c.tick();
      }
    },
    beforeDraw() {
      if (this === rooms.current) {
    if ([true][0] === false) {
        Matter.Engine.update(rooms.current.matterEngine, u.time);
    } else {
        Matter.Engine.update(rooms.current.matterEngine, 1000 / settings.maxFPS);
    }
}

    },
    afterDraw() {
      for (const p of pointer.down) {
    p.xprev = p.x;
    p.yprev = p.y;
    p.xuiprev = p.x;
    p.yuiprev = p.y;
}
for (const p of pointer.hover) {
    p.xprev = p.x;
    p.yprev = p.y;
    p.xuiprev = p.x;
    p.yuiprev = p.y;
}
inputs.registry['pointer.Wheel'] = 0;
pointer.clearReleased();
pointer.xmovement = pointer.ymovement = 0;
keyboard.clear();

      if (this.behaviors.length) {
        runBehaviors(this, "rooms", "thisOnDraw");
      }
      for (const fn of this.bindings) {
        fn();
      }
    },
    rootRoomOnCreate() {
      

    },
    rootRoomOnStep() {
      

    },
    rootRoomOnDraw() {
      

    },
    rootRoomOnLeave() {
      

    },
    /**
     * The name of the starting room, as it was set in ct.IDE.
     * @type {string}
     */
    starting: "Mechanics"
  };
  var rooms_default = roomsLib;

  // src/ct.release/fittoscreen.ts
  document.body.style.overflow = "hidden";
  var canvasCssPosition = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  };
  var positionCanvas = function positionCanvas2(mode, scale) {
    const canv = pixiApp.view;
    if (mode === "fastScale" || mode === "fastScaleInteger") {
      canv.style.transform = `translate(-50%, -50%) scale(${scale})`;
      canv.style.position = "absolute";
      canv.style.top = "50%";
      canv.style.left = "50%";
    } else if (mode === "expand" || mode === "scaleFill") {
      canv.style.transform = "";
      canv.style.position = "static";
      canv.style.top = "unset";
      canv.style.left = "unset";
    } else if (mode === "scaleFit") {
      canv.style.transform = "translate(-50%, -50%)";
      canv.style.position = "absolute";
      canv.style.top = "50%";
      canv.style.left = "50%";
    } else {
      canv.style.transform = canv.style.position = canv.style.top = canv.style.left = "";
    }
    const bbox = canv.getBoundingClientRect();
    canvasCssPosition.x = bbox.left;
    canvasCssPosition.y = bbox.top;
    canvasCssPosition.width = bbox.width;
    canvasCssPosition.height = bbox.height;
  };
  var updateViewport = () => {
    const mode = settings.viewMode;
    let pixelScaleModifier = settings.highDensity ? window.devicePixelRatio || 1 : 1;
    if (mode === "fastScale" || mode === "fastScaleInteger") {
      pixelScaleModifier = 1;
    }
    const kw = window.innerWidth / rooms_default.current.viewWidth, kh = window.innerHeight / rooms_default.current.viewHeight;
    let k = Math.min(kw, kh);
    if (mode === "fastScaleInteger") {
      k = k < 1 ? k : Math.floor(k);
    }
    var canvasWidth, canvasHeight, cameraWidth, cameraHeight;
    if (mode === "expand") {
      canvasWidth = Math.ceil(window.innerWidth * pixelScaleModifier);
      canvasHeight = Math.ceil(window.innerHeight * pixelScaleModifier);
      cameraWidth = window.innerWidth;
      cameraHeight = window.innerHeight;
    } else if (mode === "scaleFit" || mode === "scaleFill") {
      if (mode === "scaleFill") {
        canvasWidth = Math.ceil(rooms_default.current.viewWidth * kw * pixelScaleModifier);
        canvasHeight = Math.ceil(rooms_default.current.viewHeight * kh * pixelScaleModifier);
        cameraWidth = window.innerWidth / k;
        cameraHeight = window.innerHeight / k;
      } else {
        canvasWidth = Math.ceil(rooms_default.current.viewWidth * k * pixelScaleModifier);
        canvasHeight = Math.ceil(rooms_default.current.viewHeight * k * pixelScaleModifier);
        cameraWidth = rooms_default.current.viewWidth;
        cameraHeight = rooms_default.current.viewHeight;
      }
    } else {
      canvasWidth = rooms_default.current.viewWidth;
      canvasHeight = rooms_default.current.viewHeight;
      cameraWidth = canvasWidth;
      cameraHeight = canvasHeight;
    }
    pixiApp.renderer.resize(canvasWidth, canvasHeight);
    if (mode !== "scaleFill" && mode !== "scaleFit") {
      if (mode === "fastScale" || mode === "fastScaleInteger") {
        pixiApp.stage.scale.x = pixiApp.stage.scale.y = 1;
      } else {
        pixiApp.stage.scale.x = pixiApp.stage.scale.y = pixelScaleModifier;
      }
    } else {
      pixiApp.stage.scale.x = pixiApp.stage.scale.y = pixelScaleModifier * k;
    }
    pixiApp.view.style.width = Math.ceil(canvasWidth / pixelScaleModifier) + "px";
    pixiApp.view.style.height = Math.ceil(canvasHeight / pixelScaleModifier) + "px";
    if (camera_default) {
      const oldWidth = camera_default.width, oldHeight = camera_default.height;
      camera_default.width = cameraWidth;
      camera_default.height = cameraHeight;
      for (const item of pixiApp.stage.children) {
        if (!(item instanceof Room)) {
          continue;
        }
        item.realignElements(oldWidth, oldHeight, cameraWidth, cameraHeight);
      }
    }
    positionCanvas(mode, k);
  };
  window.addEventListener("resize", updateViewport);
  var toggleFullscreen = function() {
    try {
      const win = __require("electron").remote.BrowserWindow.getFocusedWindow();
      win.setFullScreen(!win.isFullScreen());
      return;
    } catch (e) {
    }
    const canvas = document.fullscreenElement;
    const requester = document.getElementById("ct");
    if (!canvas) {
      var promise = requester.requestFullscreen();
      if (promise) {
        promise.catch(function fullscreenError(err) {
          console.error("[fittoscreen]", err);
        });
      }
    } else {
      document.exitFullscreen();
    }
  };
  var getIsFullscreen = function getIsFullscreen2() {
    try {
      const win = __require("electron").remote.BrowserWindow.getFocusedWindow;
      return win.isFullScreen;
    } catch (e) {
    }
    return Boolean(document.fullscreenElement);
  };

  // src/ct.release/inputs.ts
  var inputRegistry = {};
  var CtAction = class {
    /**
     * This is a custom action defined in the Settings tab → Edit actions section.
     * Actions are used to abstract different input methods into one gameplay-related interface:
     * for example, joystick movement, WASD keys and arrows can be turned into two actions:
     * `MoveHorizontally` and `MoveVertically`.
     * @param {string} name The name of the new action.
     */
    constructor(name) {
      this.methodCodes = [];
      this.methodMultipliers = [];
      this.prevValue = 0;
      this.value = 0;
      this.name = name;
      return this;
    }
    /**
     * Checks whether the current action listens to a given input method.
     * This *does not* check whether this input method is supported by ct.
     *
     * @param {string} code The code to look up.
     * @returns {boolean} `true` if it exists, `false` otherwise.
     */
    methodExists(code) {
      return this.methodCodes.indexOf(code) !== -1;
    }
    /**
     * Adds a new input method to listen.
     *
     * @param {string} code The input method's code to listen to. Must be unique per action.
     * @param {number} multiplier An optional multiplier, e.g. to flip its value.
     * Often used with two buttons to combine them into a scalar input identical to joysticks.
     * @returns {void}
     */
    addMethod(code, multiplier) {
      if (this.methodCodes.indexOf(code) === -1) {
        this.methodCodes.push(code);
        this.methodMultipliers.push(multiplier !== void 0 ? multiplier : 1);
      } else {
        throw new Error(`[ct.inputs] An attempt to add an already added input "${code}" to an action "${this.name}".`);
      }
    }
    /**
     * Removes the provided input method for an action.
     *
     * @param {string} code The input method to remove.
     * @returns {void}
     */
    removeMethod(code) {
      const ind = this.methodCodes.indexOf(code);
      if (ind !== -1) {
        this.methodCodes.splice(ind, 1);
        this.methodMultipliers.splice(ind, 1);
      }
    }
    /**
     * Changes the multiplier for an input method with the provided code.
     * This method will produce a warning if one is trying to change an input method
     * that is not listened by this action.
     *
     * @param {string} code The input method's code to change
     * @param {number} multiplier The new value
     * @returns {void}
     */
    setMultiplier(code, multiplier) {
      const ind = this.methodCodes.indexOf(code);
      if (ind !== -1) {
        this.methodMultipliers[ind] = multiplier;
      } else {
        console.warn(`[ct.inputs] An attempt to change multiplier of a non-existent method "${code}" at event ${this.name}`);
        console.trace();
      }
    }
    /**
     * Recalculates the digital value of an action.
     *
     * @returns {number} A scalar value between -1 and 1.
     */
    update() {
      this.prevValue = this.value;
      this.value = 0;
      for (let i = 0, l = this.methodCodes.length; i < l; i++) {
        const rawValue = inputRegistry[this.methodCodes[i]] || 0;
        this.value += rawValue * this.methodMultipliers[i];
      }
      this.value = Math.max(-1, Math.min(this.value, 1));
      return this.value;
    }
    /**
     * Resets the state of this action, setting its value to `0`
     * and its pressed, down, released states to `false`.
     *
     * @returns {void}
     */
    reset() {
      this.prevValue = this.value = 0;
    }
    /**
     * Returns whether the action became active in the current frame,
     * either by a button just pressed or by using a scalar input.
     *
     * `true` for being pressed and `false` otherwise
     */
    get pressed() {
      return this.prevValue === 0 && this.value !== 0;
    }
    /**
     * Returns whether the action became inactive in the current frame,
     * either by releasing all buttons or by resting all scalar inputs.
     *
     * `true` for being released and `false` otherwise
     */
    get released() {
      return this.prevValue !== 0 && this.value === 0;
    }
    /**
     * Returns whether the action is active, e.g. by a pressed button
     * or a currently used scalar input.
     *
     * `true` for being active and `false` otherwise
     */
    get down() {
      return this.value !== 0;
    }
    /* In case you need to be hated for the rest of your life, uncomment this */
    /*
    valueOf() {
        return this.value;
    }
    */
  };
  var actionsLib = {};
  var inputsLib = {
    registry: inputRegistry,
    /**
     * Adds a new action and puts it into `ct.actions`.
     *
     * @param name The name of an action, as it will be used in `ct.actions`.
     * @param methods A list of input methods. This list can be changed later.
     * @returns {CtAction} The created action
     */
    addAction(name, methods) {
      if (name in actionsLib) {
        throw new Error(`[ct.inputs] An action "${name}" already exists, can't add a new one with the same name.`);
      }
      const action = new CtAction(name);
      for (const method of methods) {
        action.addMethod(method.code, method.multiplier);
      }
      actionsLib[name] = action;
      return action;
    },
    /**
     * Removes an action with a given name.
     * @param {string} name The name of an action
     * @returns {void}
     */
    removeAction(name) {
      delete actionsLib[name];
    },
    /**
     * Recalculates values for every action in a game.
     * @returns {void}
     */
    updateActions() {
      for (const i in actionsLib) {
        actionsLib[i].update();
      }
    }
  };

  // src/ct.release/content.ts
  var contentLib = JSON.parse([
    "{}"
  ][0] || "{}");
  var content_default = contentLib;

  // src/ct.release/emitters.ts
  PIXI.particles.Particle.prototype.isInteractive = () => false;
  {
    const hexToRGB = (color, output) => {
      if (!output) {
        output = {};
      }
      if (color.charAt(0) === "#") {
        color = color.substr(1);
      } else if (color.indexOf("0x") === 0) {
        color = color.substr(2);
      }
      let alpha;
      if (color.length === 8) {
        alpha = color.substr(0, 2);
        color = color.substr(2);
      }
      output.r = parseInt(color.substr(0, 2), 16);
      output.g = parseInt(color.substr(2, 2), 16);
      output.b = parseInt(color.substr(4, 2), 16);
      if (alpha) {
        output.a = parseInt(alpha, 16);
      }
      return output;
    };
    PIXI.particles.PropertyNode.createList = (data) => {
      const array = data.list;
      let node;
      const { value, time } = array[0];
      const first = node = new PIXI.particles.PropertyNode(typeof value === "string" ? hexToRGB(value) : value, time, data.ease);
      if (array.length > 1) {
        for (let i = 1; i < array.length; ++i) {
          const { value: value2, time: time2 } = array[i];
          node.next = new PIXI.particles.PropertyNode(typeof value2 === "string" ? hexToRGB(value2) : value2, time2);
          node = node.next;
        }
      }
      first.isStepped = Boolean(data.isStepped);
      return first;
    };
  }
  var EmitterTandem = class extends PIXI.Container {
    /**
     * Creates a new emitter tandem. This method should not be called directly;
     * better use the methods of `emittersLib`.
     * @param tandemData The template object of the tandem, as it was exported from ct.IDE.
     * @param opts Additional settings applied to the tandem
     * @constructor
     */
    // eslint-disable-next-line max-lines-per-function
    constructor(tandemData, opts) {
      super();
      /** If set to true, the tandem will stop updating its emitters */
      this.frozen = false;
      this.stopped = false;
      this.kill = false;
      this.isUi = false;
      this.emitters = [];
      this.delayed = [];
      for (const emt of tandemData) {
        let { settings: settings2 } = emt;
        settings2 = __spreadProps(__spreadValues({}, settings2), {
          behaviors: structuredClone(settings2.behaviors)
        });
        if (opts.tint) {
          const tintColor = new PIXI.Color(opts.tint);
          const colorList = settings2.behaviors[1].config.color.list;
          colorList.forEach((item) => {
            item.value = new PIXI.Color(item.value).multiply(tintColor).toHex().slice(1);
          });
        }
        const textures = res_default.getTexture(emt.texture);
        if (emt.textureBehavior === "textureRandom") {
          settings2.behaviors.push({
            type: "textureRandom",
            config: {
              textures
            }
          });
        } else {
          settings2.behaviors.push({
            type: "animatedSingle",
            config: {
              anim: {
                framerate: emt.animatedSingleFramerate,
                loop: true,
                textures
              }
            }
          });
        }
        const inst = new PIXI.particles.Emitter(this, settings2);
        const d = emt.settings.delay + opts.prewarmDelay;
        if (d > 0) {
          inst.emit = false;
          this.delayed.push({
            value: d,
            emitter: inst
          });
        } else if (d < 0) {
          inst.emit = true;
          inst.update(-d);
        } else {
          inst.emit = true;
        }
        inst.initialDeltaPos = {
          x: emt.settings.pos.x,
          y: emt.settings.pos.y
        };
        this.emitters.push(inst);
        inst.playOnce(() => {
          this.emitters.splice(this.emitters.indexOf(inst), 1);
        });
      }
      this.isUi = opts.isUi;
      this.scale.x = opts.scale.x;
      this.scale.y = opts.scale.y;
      if (opts.rotation) {
        this.rotation = opts.rotation;
      } else if (opts.angle) {
        this.angle = opts.angle;
      }
      this.deltaPosition = opts.position;
      this.zIndex = opts.depth;
      this.frozen = false;
      if (this.isUi) {
        emittersLib.uiTandems.push(this);
      } else {
        emittersLib.tandems.push(this);
      }
    }
    /**
     * A method for internal use; advances the particle simulation further
     * according to either a UI ticker or ct.delta.
     * @returns {void}
     */
    update() {
      if (this.stopped) {
        for (const emitter of this.emitters) {
          if (!emitter.particleCount) {
            this.emitters.splice(this.emitters.indexOf(emitter), 1);
          }
        }
      }
      if (this.appendant && this.appendant.destroyed || this.kill || !this.emitters.length) {
        this.emit("done");
        if (this.isUi) {
          emittersLib.uiTandems.splice(emittersLib.uiTandems.indexOf(this), 1);
        } else {
          emittersLib.tandems.splice(emittersLib.tandems.indexOf(this), 1);
        }
        this.destroy();
        return;
      }
      if (this.frozen) {
        return;
      }
      const s = (this.isUi ? PIXI.Ticker.shared.elapsedMS : PIXI.Ticker.shared.deltaMS) / 1e3;
      for (const delayed of this.delayed) {
        delayed.value -= s;
        if (delayed.value <= 0) {
          delayed.emitter.emit = true;
          this.delayed.splice(this.delayed.indexOf(delayed), 1);
        }
      }
      for (const emt of this.emitters) {
        if (this.delayed.find((delayed) => delayed.emitter === emt)) {
          continue;
        }
        emt.update(s);
      }
      if (this.follow) {
        this.updateFollow();
      }
    }
    /**
     * Stops spawning new particles, then destroys itself.
     * Can be fired only once, otherwise it will log a warning.
     * @returns {void}
     */
    stop() {
      if (this.stopped) {
        console.trace("[emitters] An attempt to stop an already stopped emitter tandem. Continuing\u2026");
        return;
      }
      this.stopped = true;
      for (const emt of this.emitters) {
        emt.emit = false;
      }
      this.delayed = [];
    }
    /**
     * Stops spawning new particles, but continues simulation and allows to resume
     * the effect later with `emitter.resume();`
     * @returns {void}
     */
    pause() {
      for (const emt of this.emitters) {
        if (emt.maxParticles !== 0) {
          emt.oldMaxParticles = emt.maxParticles;
          emt.maxParticles = 0;
        }
      }
    }
    /**
     * Resumes previously paused effect.
     * @returns {void}
     */
    resume() {
      for (const emt of this.emitters) {
        emt.maxParticles = emt.oldMaxParticles || emt.maxParticles;
      }
    }
    /**
     * Removes all the particles from the tandem, but continues spawning new ones.
     * @returns {void}
     */
    clear() {
      for (const emt of this.emitters) {
        emt.cleanup();
      }
    }
    updateFollow() {
      if (!this.follow) {
        return;
      }
      if ("kill" in this.follow && this.follow.kill || !this.follow.scale) {
        this.follow = null;
        this.stop();
        return;
      }
      const delta = u_default.rotate(
        this.deltaPosition.x * this.follow.scale.x,
        this.deltaPosition.y * this.follow.scale.y,
        this.follow.angle
      );
      for (const emitter of this.emitters) {
        emitter.updateOwnerPos(this.follow.x + delta.x, this.follow.y + delta.y);
        const ownDelta = u_default.rotate(
          emitter.initialDeltaPos.x * this.follow.scale.x,
          emitter.initialDeltaPos.y * this.follow.scale.y,
          this.follow.angle
        );
        emitter.updateSpawnPos(ownDelta.x, ownDelta.y);
      }
    }
  };
  var defaultSettings = {
    prewarmDelay: 0,
    scale: {
      x: 1,
      y: 1
    },
    tint: 16777215,
    alpha: 1,
    position: {
      x: 0,
      y: 0
    },
    isUi: false,
    depth: Infinity
  };
  var emittersLib = {
    /**
     * A map of existing emitter templates.
     * @type Array<object>
     */
    templates: [
      {}
    ][0] || {},
    /**
     * A list of all the emitters that are simulated in UI time scale.
     * @type Array<EmitterTandem>
     */
    uiTandems: [],
    /**
     * A list of all the emitters that are simulated in a regular game loop.
     * @type Array<EmitterTandem>
     */
    tandems: [],
    /**
     * Creates a new emitter tandem in the world at the given position.
     * @param {string} name The name of the tandem template, as it was named in ct.IDE.
     * @param {number} x The x coordinate of the new tandem.
     * @param {number} y The y coordinate of the new tandem.
     * @param {ITandemSettings} [settings] Additional configs for the created tandem.
     * @return {EmitterTandem} The newly created tandem.
     */
    fire(name, x, y, settings2) {
      if (!(name in emittersLib.templates)) {
        throw new Error(`[emitters] An attempt to create a non-existent emitter ${name}.`);
      }
      const opts = Object.assign({}, defaultSettings, settings2);
      const tandem = new EmitterTandem(emittersLib.templates[name], opts);
      tandem.x = x;
      tandem.y = y;
      if (!opts.room) {
        rooms_default.current.addChild(tandem);
        tandem.isUi = rooms_default.current.isUi;
      } else {
        opts.room.addChild(tandem);
        tandem.isUi = opts.room.isUi;
      }
      return tandem;
    },
    /**
     * Creates a new emitter tandem and attaches it to the given copy
     * (or to any other DisplayObject).
     * @param parent The parent of the created tandem.
     * @param name The name of the tandem template.
     * @param [settings] Additional options for the created tandem.
     * @returns {EmitterTandem} The newly created emitter tandem.
     */
    append(parent, name, settings2) {
      if (!(name in emittersLib.templates)) {
        throw new Error(`[emitters] An attempt to create a non-existent emitter ${name}.`);
      }
      if (!(parent instanceof PIXI.Container)) {
        throw new Error("[emitters] Cannot attach an emitter as the specified parent cannot have child elements.");
      }
      const opts = Object.assign({}, defaultSettings, settings2);
      const tandem = new EmitterTandem(emittersLib.templates[name], opts);
      if (opts.position) {
        tandem.x = opts.position.x;
        tandem.y = opts.position.y;
      }
      tandem.appendant = parent;
      if (!("addChild" in parent)) {
        console.error(parent);
        throw new Error("[emitters] An attempt to append an emitter to an entity that doesn't support children.");
      }
      parent.addChild(tandem);
      return tandem;
    },
    /**
     * Creates a new emitter tandem in the world, and configs it so it will follow a given copy.
     * This includes handling position, scale, and rotation.
     * @param parent The copy to follow.
     * @param name The name of the tandem template.
     * @param [settings] Additional options for the created tandem.
     * @returns The newly created emitter tandem.
     */
    follow(parent, name, settings2) {
      if (!(name in emittersLib.templates)) {
        throw new Error(`[emitters] An attempt to create a non-existent emitter ${name}.`);
      }
      const opts = Object.assign({}, defaultSettings, settings2);
      const tandem = new EmitterTandem(emittersLib.templates[name], opts);
      tandem.follow = parent;
      tandem.updateFollow();
      if (!("getRoom" in parent)) {
        rooms_default.current.addChild(tandem);
      } else {
        parent.getRoom().addChild(tandem);
      }
      return tandem;
    }
  };
  PIXI.Ticker.shared.add(() => {
    for (const tandem of emittersLib.uiTandems) {
      tandem.update();
    }
    for (const tandem of emittersLib.tandems) {
      tandem.update();
    }
  });
  var emitters_default = emittersLib;

  // src/ct.release/scripts.ts
  var scriptsLib = {
    
  };

  // src/ct.release/index.ts
  /*! Made with ct.js http://ctjs.rocks/ */
  console.log(
    "%c \u{1F63A} %c ct.js game editor %c v4.0.2 %c https://ctjs.rocks/ ",
    "background: #446adb; color: #fff; padding: 0.5em 0;",
    "background: #5144db; color: #fff; padding: 0.5em 0;",
    "background: #446adb; color: #fff; padding: 0.5em 0;",
    "background: #5144db; color: #fff; padding: 0.5em 0;"
  );
  try {
    __require("electron");
  } catch (e) {
    try {
      __require("electron/main");
    } catch (e2) {
      if (location.protocol === "file:") {
        alert("Your game won't work like this because\nWeb \u{1F44F} builds \u{1F44F} require \u{1F44F} a web \u{1F44F} server!\n\nConsider using a desktop build, or upload your web build to itch.io, GameJolt or your own website.\n\nIf you haven't created this game, please contact the developer about this issue.\n\n Also note that ct.js games do not work inside the itch app; you will need to open the game with your browser of choice.");
      }
    }
  }
  if ("NL_OS" in window) {
    Neutralino.init();
    if ([
      true
    ][0]) {
      Neutralino.events.on("windowClose", () => {
        Neutralino.app.exit();
      });
    }
  }
  var deadPool = [];
  var copyTypeSymbol = Symbol("I am a ct.js copy");
  setInterval(function cleanDeadPool() {
    deadPool.length = 0;
  }, 1e3 * 60);
  var meta = [
    {"name":"NAN","author":"PrimatePlay Studio","site":"","version":"0.0.0"}
  ][0];
  var currentViewMode = "scaleFill";
  var currentHighDPIMode = Boolean([
    true
  ][0]);
  var settings = {
    /** If set to true, enables retina (high-pixel density) rendering. */
    get highDensity() {
      return currentHighDPIMode;
    },
    set highDensity(value) {
      currentHighDPIMode = value;
      if (currentHighDPIMode) {
        PIXI.settings.RESOLUTION = window.devicePixelRatio;
      } else {
        PIXI.settings.RESOLUTION = 1;
      }
      if (rooms_default.current) {
        updateViewport();
      }
    },
    /** A target number of frames per second. */
    get targetFps() {
      return pixiApp.ticker.maxFPS;
    },
    set targetFps(value) {
      pixiApp.ticker.maxFPS = value;
    },
    /**
     * A string that indicates the current scaling approach (can be changed).
     * Possible options:
     *
     * * `asIs` — disables any viewport management; the rendered canvas
     * will be placed as is in the top-left corner.
     * * `fastScale` — the viewport will proportionally fill the screen
     * without changing the resolution.
     * * `fastScaleInteger` — the viewport will be positioned at the middle
     * of the screen, and will be scaled by whole numbers (x2, x3, x4 and so on).
     * * `expand` — the viewport will fill the whole screen. The camera will
     * expand to accommodate the new area.
     * * `scaleFit` — the viewport will proportionally fill the screen, leaving letterboxes
     * around the base viewport. The resolution is changed to match the screen.
     * * `scaleFill` — the viewport fills the screen, expanding the camera to avoid letterboxing.
     * The resolution is changed to match the screen.
     */
    get viewMode() {
      return currentViewMode;
    },
    set viewMode(value) {
      currentViewMode = value;
      updateViewport();
    },
    /**
     * A boolean property that can be changed to exit or enter fullscreen mode.
     * In web builds, you can only change this value in pointer events of your templates.
     */
    get fullscreen() {
      return getIsFullscreen();
    },
    set fullscreen(value) {
      if (getIsFullscreen() !== value) {
        toggleFullscreen();
      }
    },
    get pixelart() {
      return [
        false
      ][0];
    },
    /**
     * Sets whether ct.js should prevent default behavior of pointer and keyboard events.
     * This is usually needed to prevent accidental zooming in page or scrolling.
     */
    preventDefault: true
  };
  var stack = [];
  var pixiApp;
  {
    const pixiAppSettings = {
      width: [
        720
      ][0],
      height: [
        1280
      ][0],
      antialias: ![
        false
      ][0],
      powerPreference: "high-performance",
      autoDensity: false,
      sharedTicker: false,
      backgroundAlpha: [
        false
      ][0] ? 0 : 1
    };
    PIXI.settings.RESOLUTION = 1;
    try {
      pixiApp = new PIXI.Application(pixiAppSettings);
    } catch (e) {
      console.error(e);
      console.warn("[ct.js] Something bad has just happened. This is usually due to hardware problems. I'll try to fix them now, but if the game still doesn't run, try including a legacy renderer in the project's settings.");
      PIXI.settings.SPRITE_MAX_TEXTURES = Math.min(PIXI.settings.SPRITE_MAX_TEXTURES, 16);
      pixiApp = new PIXI.Application(pixiAppSettings);
    }
    PIXI.settings.ROUND_PIXELS = [
      false
    ][0];
    if (!pixiApp.renderer.options.antialias) {
      PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
    }
    settings.targetFps = [
      60
    ][0] || 60;
    document.getElementById("ct").appendChild(pixiApp.view);
  }
  var loading;
  {
    const killRecursive = (copy) => {
      copy.kill = true;
      if (templates_default.isCopy(copy) && copy.onDestroy) {
        templates_default.onDestroy.apply(copy);
        copy.onDestroy.apply(copy);
      }
      for (const child of copy.children) {
        if (templates_default.isCopy(child)) {
          killRecursive(child);
        }
      }
      const stackIndex = stack.indexOf(copy);
      if (stackIndex !== -1) {
        stack.splice(stackIndex, 1);
      }
      if (templates_default.isCopy(copy) && copy.template) {
        const templatelistIndex = templates_default.list[copy.template].indexOf(copy);
        if (templatelistIndex !== -1) {
          templates_default.list[copy.template].splice(templatelistIndex, 1);
        }
      }
      deadPool.push(copy);
    };
    const manageCamera = () => {
      camera_default.update(u_default.timeUi);
      camera_default.manageStage();
    };
    const loop = () => {
      const { ticker } = pixiApp;
      u_default.delta = ticker.deltaMS / (1e3 / (settings.targetFps || 60));
      u_default.deltaUi = ticker.elapsedMS / (1e3 / (settings.targetFps || 60));
      u_default.time = ticker.deltaMS / 1e3;
      u_default.timeUi = u_default.timeUI = ticker.elapsedMS / 1e3;
      inputsLib.updateActions();
      timer_default.updateTimers();
      place.debugTraceGraphics.clear();

      rooms_default.rootRoomOnStep.apply(rooms_default.current);
      for (let i = 0, li = stack.length; i < li; i++) {
        templates_default.isCopy(stack[i]) && templates_default.beforeStep.apply(stack[i]);
        stack[i].onStep.apply(stack[i]);
        templates_default.isCopy(stack[i]) && templates_default.afterStep.apply(stack[i]);
      }
      for (const item of pixiApp.stage.children) {
        if (!(item instanceof Room)) {
          continue;
        }
        rooms_default.beforeStep.apply(item);
        item.onStep.apply(item);
        rooms_default.afterStep.apply(item);
      }
      for (const copy of stack) {
        if (copy.kill && !copy._destroyed) {
          killRecursive(copy);
          copy.destroy({
            children: true
          });
        }
      }
      manageCamera();
      for (let i = 0, li = stack.length; i < li; i++) {
        templates_default.isCopy(stack[i]) && templates_default.beforeDraw.apply(stack[i]);
        stack[i].onDraw.apply(stack[i]);
        templates_default.isCopy(stack[i]) && templates_default.afterDraw.apply(stack[i]);
        stack[i].xprev = stack[i].x;
        stack[i].yprev = stack[i].y;
      }
      for (const item of pixiApp.stage.children) {
        if (!(item instanceof Room)) {
          continue;
        }
        rooms_default.beforeDraw.apply(item);
        item.onDraw.apply(item);
        rooms_default.afterDraw.apply(item);
      }
      rooms_default.rootRoomOnDraw.apply(rooms_default.current);
      /*!%afterframe%*/
      if (rooms_default.switching) {
        rooms_default.forceSwitch();
      }
    };
    loading = res_default.loadGame();
    loading.then(() => {
      setTimeout(() => {
        pixiApp.ticker.add(loop);
        rooms_default.forceSwitch(rooms_default.starting);
      }, 0);
    });
  }
  window.PIXI = PIXI;
  {
    const actions = actionsLib;
    const backgrounds = backgrounds_default;
    const behaviors = behaviors_default;
    const camera2 = camera_default;
    const content = content_default;
    const emitters = emitters_default;
    const inputs = inputsLib;
    const res = res_default;
    const rooms = rooms_default;
    const scripts = scriptsLib;
    const sounds = sounds_default;
    const styles = styles_default;
    const templates = templates_default;
    const tilemaps = tilemaps_default;
    const timer = timer_default;
    const u = u_default;
    Object.assign(window, {
      actions,
      backgrounds,
      behaviors,
      Camera,
      camera: camera2,
      CtAction,
      content,
      emitters,
      inputs,
      res,
      rooms,
      scripts,
      sounds,
      styles,
      templates,
      Tilemap,
      tilemaps,
      timer,
      u,
      meta,
      settings,
      pixiApp
    });
    loading.then(() => {
      pointer.setupListeners();

    });
    
    
styles.new(
    "Geist-Regular",
    {
    "fontFamily": "\"CTPROJFONTGeist-Regular\", \"Geist-Regular\", sans-serif",
    "fontSize": 24,
    "fontStyle": "normal",
    "fontWeight": "400",
    "lineJoin": "round",
    "lineHeight": 32.400000000000006
});

styles.new(
    "Geist-Regular_Blue",
    {
    "fontFamily": "\"CTPROJFONTGeist-Regular\", \"Geist-Regular\", sans-serif",
    "fontSize": 40,
    "fontStyle": "normal",
    "fontWeight": "400",
    "align": "center",
    "lineJoin": "round",
    "lineHeight": 54,
    "fill": "#153B90"
});

styles.new(
    "RG-Bold",
    {
    "fontFamily": "\"CTPROJFONTRidley Grotesk Bold\", \"Ridley Grotesk Bold\", sans-serif",
    "fontSize": 24,
    "fontStyle": "normal",
    "fontWeight": "400",
    "align": "center",
    "lineJoin": "round",
    "lineHeight": 32.400000000000006,
    "fill": "#FFFFFF"
});

styles.new(
    "RG-Bold_Big",
    {
    "fontFamily": "\"CTPROJFONTRidley Grotesk Bold\", \"Ridley Grotesk Bold\", sans-serif",
    "fontSize": 72,
    "fontStyle": "normal",
    "fontWeight": "400",
    "align": "center",
    "lineJoin": "round",
    "lineHeight": 97.2,
    "fill": "#FFFFFF"
});

styles.new(
    "RG-Bold_BigBlue",
    {
    "fontFamily": "\"CTPROJFONTRidley Grotesk Bold\", \"Ridley Grotesk Bold\", sans-serif",
    "fontSize": 72,
    "fontStyle": "normal",
    "fontWeight": "400",
    "align": "center",
    "lineJoin": "round",
    "lineHeight": 97.2,
    "fill": "#153B90"
});

styles.new(
    "RG-Bold_BigGreen",
    {
    "fontFamily": "\"CTPROJFONTRidley Grotesk Bold\", \"Ridley Grotesk Bold\", sans-serif",
    "fontSize": 72,
    "fontStyle": "normal",
    "fontWeight": "400",
    "align": "center",
    "lineJoin": "round",
    "lineHeight": 97.2,
    "fill": "#46AF5F"
});

styles.new(
    "RG-Bold_Blue",
    {
    "fontFamily": "\"CTPROJFONTRidley Grotesk Bold\", \"Ridley Grotesk Bold\", sans-serif",
    "fontSize": 24,
    "fontStyle": "normal",
    "fontWeight": "400",
    "align": "center",
    "lineJoin": "round",
    "lineHeight": 32.400000000000006,
    "fill": "#153B90"
});

styles.new(
    "RG-Bold_Green",
    {
    "fontFamily": "\"CTPROJFONTRidley Grotesk Bold\", \"Ridley Grotesk Bold\", sans-serif",
    "fontSize": 24,
    "fontStyle": "normal",
    "fontWeight": "400",
    "align": "center",
    "lineJoin": "round",
    "lineHeight": 32.400000000000006,
    "fill": "#46AF5F"
});

styles.new(
    "TD-Bold",
    {
    "fontFamily": "\"CTPROJFONTTrade Gothic LT Bold\", \"Trade Gothic LT Bold\", sans-serif",
    "fontSize": 24,
    "fontStyle": "normal",
    "fontWeight": "400",
    "lineJoin": "round",
    "lineHeight": 32.400000000000006,
    "fill": "#FFFFFF"
});

    
    
templates.templates["Logo"] = {
    name: "Logo",
    depth: 60,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NNI_HEADER-NAN_ACTIVITY-MSN_RESIDENTS_WORKSHOP",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Logo'] = [];
        
templates.templates["Placeholder"] = {
    name: "Placeholder",
    depth: 0,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Placeholder",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Placeholder'] = [];
        
templates.templates["Detailer"] = {
    name: "Detailer",
    depth: 0,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_OPTIPRO_DETAILER_CARD_MOCKUP",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Detailer'] = [];
        
templates.templates["Background"] = {
    name: "Background",
    depth: 1,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_GAME_BACKGROUND",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Background'] = [];
        
templates.templates["Top"] = {
    name: "Top",
    depth: 1,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_GAME_ASSET–TOP_LINE",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Top'] = [];
        
templates.templates["Ground"] = {
    name: "Ground",
    depth: 1,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Detailer",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": true,
    "matterStatic": true,
    "matterConstraint": "none"
}
};
templates.list['Ground'] = [];
        
templates.templates["HMO"] = {
    name: "HMO",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "5HMO_COMPLEX_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template HMO — core_OnDraw (On frame end event) */
{
if(this.position.y < 290 && !rooms.current.win && this.passed)
{
    rooms.current.timer1 = 0;
    rooms.current.win = true;
    rooms.current.timerLabel.text = '00:00';
    rooms.current.timer1 = 0;
    pointer.clear();
    rooms.append('Try Again');
    this.kill = true;
}

if(this.position.y > 300)
{
    this.passed = true;
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        /* template HMO — core_OnCreate (On create event) */
{
this.passed = false;
}

    },
    extends: {
    "matterEnable": true,
    "matterFriction": 2,
    "matterFrictionAir": 0.05
}
};
templates.list['HMO'] = [];
        
templates.templates["BLactis"] = {
    name: "BLactis",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "B.LACTIS_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template BLactis — core_OnDraw (On frame end event) */
{
if(this.position.y < 290 && !rooms.current.win && this.passed)
{
    rooms.current.timer1 = 0;
    rooms.current.win = true;
    rooms.current.timerLabel.text = '00:00';
    rooms.current.timer1 = 0;
    pointer.clear();
    rooms.append('Try Again');
    this.kill = true;
}

if(this.position.y > 300)
{
    this.passed = true;
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        /* template BLactis — core_OnCreate (On create event) */
{
this.passed = false;
}

    },
    extends: {
    "matterEnable": true,
    "matterFriction": 2,
    "matterFrictionAir": 0.05
}
};
templates.list['BLactis'] = [];
        
templates.templates["Protein"] = {
    name: "Protein",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "OPTIMIZED_PROTEIN_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template Protein — core_OnDraw (On frame end event) */
{
if(this.position.y < 290 && !rooms.current.win && this.passed)
{
    rooms.current.timer1 = 0;
    rooms.current.win = true;
    rooms.current.timerLabel.text = '00:00';
    rooms.current.timer1 = 0;
    pointer.clear();
    rooms.append('Try Again');
    this.kill = true;
}

if(this.position.y > 300)
{
    this.passed = true;
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        /* template Protein — core_OnCreate (On create event) */
{
this.passed = false;
}

    },
    extends: {
    "matterEnable": true,
    "matterFriction": 2,
    "matterFrictionAir": 0.05
}
};
templates.list['Protein'] = [];
        
templates.templates["Sucrose"] = {
    name: "Sucrose",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "ZERO_SUCROSE_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template Sucrose — core_OnDraw (On frame end event) */
{
if(this.position.y < 290 && !rooms.current.win && this.passed)
{
    rooms.current.timer1 = 0;
    rooms.current.win = true;
    rooms.current.timerLabel.text = '00:00';
    rooms.current.timer1 = 0;
    pointer.clear();
    rooms.append('Try Again');
    this.kill = true;
}

if(this.position.y > 300)
{
    this.passed = true;
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        /* template Sucrose — core_OnCreate (On create event) */
{
this.passed = false;
}

    },
    extends: {
    "matterEnable": true,
    "matterFriction": 2,
    "matterFrictionAir": 0.05
}
};
templates.list['Sucrose'] = [];
        
templates.templates["Brain"] = {
    name: "Brain",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Brain",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFrictionAir": 0.05,
    "cgroup": "Core"
}
};
templates.list['Brain'] = [];
        
templates.templates["Digestion"] = {
    name: "Digestion",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Digestion",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFrictionAir": 0.05,
    "cgroup": "Core"
}
};
templates.list['Digestion'] = [];
        
templates.templates["Growth"] = {
    name: "Growth",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Growth",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFrictionAir": 0.05,
    "cgroup": "Core"
}
};
templates.list['Growth'] = [];
        
templates.templates["Immunity"] = {
    name: "Immunity",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Immunity",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFrictionAir": 0.05,
    "cgroup": "Core"
}
};
templates.list['Immunity'] = [];
        
templates.templates["Protection"] = {
    name: "Protection",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Protection",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFrictionAir": 0.05,
    "cgroup": "Core"
}
};
templates.list['Protection'] = [];
        
templates.templates["Core"] = {
    name: "Core",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Core",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template Core — core_OnDraw (On frame end event) */
{
if(this.position.y < 290 && !rooms.current.win && this.passed)
{
    rooms.current.timer1 = 0;
    rooms.current.win = true;
    rooms.current.timerLabel.text = '00:00';
    rooms.current.timer1 = 0;
    pointer.clear();
    rooms.append('Try Again');
    this.kill = true;
}

if(this.position.y > 300)
{
    this.passed = true;
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        /* template Core — core_OnCreate (On create event) */
{
this.current;
this.passed = false;

this.brain = null;
this.digestion = null;
this.growth = null;
this.immunity = null;
this.protection = null;
}

    },
    extends: {
    "matterEnable": true,
    "matterFrictionAir": 0.05,
    "matterSensor": false,
    "matterStatic": false,
    "cgroup": "Core",
    "matterFriction": 5
}
};
templates.list['Core'] = [];
        
templates.templates["Cursor"] = {
    name: "Cursor",
    depth: 5,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_GAME-HAND_ICON",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Cursor'] = [];
        
templates.templates["BLactis_"] = {
    name: "BLactis_",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "B.LACTIS_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFriction": 2,
    "matterFrictionAir": 0.05
}
};
templates.list['BLactis_'] = [];
        
templates.templates["HMO_"] = {
    name: "HMO_",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "5HMO_COMPLEX_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFriction": 2,
    "matterFrictionAir": 0.05
}
};
templates.list['HMO_'] = [];
        
templates.templates["Protein_"] = {
    name: "Protein_",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "OPTIMIZED_PROTEIN_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFriction": 2,
    "matterFrictionAir": 0.05
}
};
templates.list['Protein_'] = [];
        
templates.templates["Sucrose_"] = {
    name: "Sucrose_",
    depth: 2,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "ZERO_SUCROSE_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": false,
    "matterFriction": 2,
    "matterFrictionAir": 0.05
}
};
templates.list['Sucrose_'] = [];
        
templates.templates["Pro"] = {
    name: "Pro",
    depth: 5,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_GAME_5HMO_ORB",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {
    "matterEnable": true,
    "matterFrictionAir": 0.005
}
};
templates.list['Pro'] = [];
        
templates.templates["Instruction"] = {
    name: "Instruction",
    depth: 10,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "ORB_MECHANICS",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Instruction'] = [];
        
templates.templates["Mechanics1"] = {
    name: "Mechanics1",
    depth: 5,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_MECHANICS_LIGHTBOX",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template Mechanics1 — core_OnDraw (On frame end event) */
{
if (pointer.collides(this) && !this.pressed) {
    this.pressed = true;
    
}
if(pointer.released[0] && this.pressed)
{
    var m = templates.copy('Mechanics2',this.position.x, this.position.y);
    rooms.current.addChild(m);
    m.scale.x = m.scale.y = 1;
    this.kill = true;
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        /* template Mechanics1 — core_OnCreate (On create event) */
{
this.pressed = false;
}

    },
    extends: {}
};
templates.list['Mechanics1'] = [];
        
templates.templates["Mechanics2"] = {
    name: "Mechanics2",
    depth: 4,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_GAME_MECHANICS_LIGHTBOX_PART_2",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template Mechanics2 — core_OnDraw (On frame end event) */
{
if (pointer.collides(this) && !this.pressed) {
    this.pressed = true;
}
if(pointer.released[0] && this.pressed)
{
    pointer.clear();
    rooms.switch('Game');
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        /* template Mechanics2 — core_OnCreate (On create event) */
{
this.pressed = false;
}

    },
    extends: {}
};
templates.list['Mechanics2'] = [];
        
templates.templates["Lightbox"] = {
    name: "Lightbox",
    depth: 10,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Lightbox",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template Lightbox — core_OnDraw (On frame end event) */
{
if(pointer.collides(this))
{
    if(this.offset == 0)
    {
        this.offset = this.getRoom().scrollParent.position.y - pointer.y;
        this.getRoom().scrolling = true;
    }

    this.getRoom().scrollParent.position.y = Math.min(Math.max(pointer.y + this.offset, this.getRoom().minY), this.getRoom().maxY);
}

if(pointer.released[0])
{
    this.offset = 0;
    this.getRoom().scrolling = false;
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        /* template Lightbox — core_OnCreate (On create event) */
{
this.offset = 0;
}

    },
    extends: {}
};
templates.list['Lightbox'] = [];
        
templates.templates["ScrollParent"] = {
    name: "ScrollParent",
    depth: 11,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: -1,
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['ScrollParent'] = [];
        
templates.templates["CutBG"] = {
    name: "CutBG",
    depth: 13,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "CutBG",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['CutBG'] = [];
        
templates.templates["Detailer1"] = {
    name: "Detailer1",
    depth: 0,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_DETAILER_VISUAL_1",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Detailer1'] = [];
        
templates.templates["Detailer2"] = {
    name: "Detailer2",
    depth: 0,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NAN_DETAILER_VISUAL_2",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Detailer2'] = [];
        
templates.templates["NANKIDLogo"] = {
    name: "NANKIDLogo",
    depth: 0,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "NANKID_LOGO_NAN_DETAILER_EDIT",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['NANKIDLogo'] = [];
        
templates.templates["Black"] = {
    name: "Black",
    depth: 15,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "Black",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        /* template Black — core_OnDraw (On frame end event) */
{
if(pointer.collides(this) && !this.getRoom().pressed && !this.getRoom().scrolling)
{
    this.getRoom().pressed = true;
    tween.add({
        obj: rooms.current,
        fields: {
            alpha: 0
        },
        duration: 250,
        silent: true
    })
    .then(() => {
       rooms.switch('Game');

    });
}
}

    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Black'] = [];
        
templates.templates["Div"] = {
    name: "Div",
    depth: 0,
    blendMode: PIXI.BLEND_MODES.NORMAL,
    visible: true,
    baseClass: "AnimatedSprite",
    
            texture: "DETAILER_DIVIDER_LINE",
        animationFPS: 30,
        playAnimationOnStart: false,
        loopAnimation: true,
    behaviors: JSON.parse('[]'),
    onStep: function () {
        
    },
    onDraw: function () {
        
    },
    onDestroy: function () {
        
    },
    onCreate: function () {
        
    },
    extends: {}
};
templates.list['Div'] = [];
        
    
    
rooms.templates['Detailer'] = {
    name: 'Detailer',
    width: 720,
    height: 1280,
    behaviors: JSON.parse('[]'),
    objects: JSON.parse('[{"x":360,"y":640,"opacity":1,"tint":16777215,"scale":{"x":0.2285,"y":0.2285},"rotation":0,"exts":{},"customProperties":{},"template":"CutBG"},{"x":363,"y":708,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Lightbox"},{"x":360,"y":96,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Logo"},{"x":683.5625,"y":0,"opacity":0,"tint":16777215,"scale":{"x":1.31933594,"y":19},"rotation":0,"exts":{},"customProperties":{},"template":"Black"},{"x":-10.1875,"y":-97.5,"opacity":0,"tint":16777215,"scale":{"x":11.35253906,"y":4.8828125},"rotation":0,"exts":{},"customProperties":{},"template":"Black"},{"x":-64,"y":0,"opacity":0,"tint":16777215,"scale":{"x":1.67089844,"y":19},"rotation":0,"exts":{},"customProperties":{},"template":"Black"},{"x":-64,"y":1204.0625,"opacity":0,"tint":16777215,"scale":{"x":13,"y":3.18652344},"rotation":0,"exts":{},"customProperties":{},"template":"Black"}]'),
    bgs: JSON.parse('[]'),
    tiles: JSON.parse('[]'),
    backgroundColor: '#212121',
    
    onStep() {
        
    },
    onDraw() {
        
    },
    onLeave() {
        
    },
    onCreate() {
        /* room Detailer — core_OnRoomStart (On room start event) */
{
pointer.clear();

this.pressed = false;

this.scrolling = false;

this.minY = -130;
this.maxY = 640;

// MAIN SCROLL OBJECT
this.scrollParent = templates.copy('ScrollParent', 360, 640);
this.addChild(this.scrollParent);

// LOGO
this.logo = templates.copy('Logo', 0, -350);
this.scrollParent.addChild(this.logo);
this.logo.scale.x = this.logo.scale.y = 1;

// NANKID LOGO
this.nankid = templates.copy('NANKIDLogo', 0, -200);
this.scrollParent.addChild(this.nankid);
this.nankid.scale.x = this.nankid.scale.y = 1;

// HEAD
this.head = new PIXI.Text('CONGRATULATIONS!', styles.get('RG-Bold_BigBlue'));
this.scrollParent.addChild(this.head);
this.head.anchor.x = this.head.anchor.y = 0.5;
this.head.scale.x = this.head.scale.y = .6;
this.head.y = -50;

// DIVIDER
this.divider = templates.copy('Div', 0, -15);
this.scrollParent.addChild(this.divider);
this.divider.anchor.x = this.divider.anchor.y = 0.5;
this.divider.scale.x = this.divider.scale.y = 0.25;

// DESCRIPTION
this.description = new PIXI.Text('We believe that a well-brought up child can grow up\nto be the best person they can be with the right support\nand nutrition from the start.\n\nWith each orb, you have combined the nutrients that help\ndoctors and parents nourish all key areas of a child\'s\ndevelopment, opening them up to infinite possibilities\nfor the future!\n\nFor more than 155 years, Nestlé has been relentlessly\npioneering scientific research in early childhood nutrition.\nSo, with our most scientifically advanced formula with the\nexclusive nutrients of NANKID OPTIPRO, B.Lactis Probiotic,\nOptimized Protein, and clinically provem 5 HMO Complex.\n we continue to pursue the nex scientific breakthroughs\nto give children the 5 Pro Edge!', styles.get('Geist-Regular_Blue'));
this.scrollParent.addChild(this.description);
this.description.anchor.x = 0.5;
this.description.anchor.y = 0;
this.description.scale.x = this.description.scale.y = 0.525;
this.description.y = 0;

// DETAIL 1
this.d1 = templates.copy('Detailer1', 5, 650);
this.scrollParent.addChild(this.d1);
this.d1.anchor.x = this.d1.anchor.y = 0.5;
this.d1.scale.x = this.d1.scale.y = 1;

// DETAIL 2
this.d2 = templates.copy('Detailer2', 0, 1080);
this.scrollParent.addChild(this.d2);
this.d2.anchor.x = this.d2.anchor.y = 0.5;
this.d2.scale.x = this.d2.scale.y = 1;
}

    },
    isUi: false,
    follow: false,
    extends: {},
    bindings: {
    
    }
}
        
rooms.templates['Mechanics'] = {
    name: 'Mechanics',
    width: 720,
    height: 1280,
    behaviors: JSON.parse('[]'),
    objects: JSON.parse('[{"x":360,"y":640,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Mechanics1"}]'),
    bgs: JSON.parse('[]'),
    tiles: JSON.parse('[]'),
    backgroundColor: '#212121',
    
    onStep() {
        
    },
    onDraw() {
        
    },
    onLeave() {
        
    },
    onCreate() {
        
    },
    isUi: false,
    follow: false,
    extends: {},
    bindings: {
    
    }
}
        
rooms.templates['Game'] = {
    name: 'Game',
    width: 720,
    height: 1280,
    behaviors: JSON.parse('[]'),
    objects: JSON.parse('[{"x":360,"y":725,"opacity":1,"tint":13424096,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Background"},{"x":798,"y":864,"opacity":0,"tint":16777215,"scale":{"x":5.0625,"y":19},"rotation":0,"exts":{},"customProperties":{},"template":"Ground"},{"x":360,"y":1285,"opacity":0,"tint":16777215,"scale":{"x":10.5,"y":5.84375},"rotation":0,"exts":{},"customProperties":{},"template":"Ground"},{"x":-87,"y":864,"opacity":0,"tint":16777215,"scale":{"x":5.28125,"y":19},"rotation":0,"exts":{},"customProperties":{},"template":"Ground"},{"x":358,"y":425,"opacity":1,"tint":16777215,"scale":{"x":0.225,"y":0.1},"rotation":0,"exts":{},"customProperties":{},"template":"Top"},{"x":360,"y":96,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Logo"},{"x":360,"y":1168,"opacity":1,"tint":16777215,"scale":{"x":1,"y":1},"rotation":0,"exts":{},"customProperties":{},"template":"Instruction"}]'),
    bgs: JSON.parse('[{"texture":"BG","depth":0,"exts":{"movementX":0,"movementY":0,"parallaxX":1,"parallaxY":1,"repeat":"no-repeat","scaleX":0.46,"scaleY":0.46,"shiftX":0,"shiftY":0}}]'),
    tiles: JSON.parse('[]'),
    backgroundColor: '#212121',
    
    onStep() {
        /* room Game — core_Timer1 (Timer 1 event) */

if (this.timer1 > 0 && this.timer1 <= (false ? u.timeUi : u.time)) {
    this.timer1 = 0;
    
this.remainingTime--;
if(this.remainingTime >= 10 && this.remainingTime < 60)
{
    this.timerLabel.text = '00:'+this.remainingTime;
    this.timer1 = 1;
}
else if(this.remainingTime < 10 && this.remainingTime > 0)
{
    this.timerLabel.text = '00:0'+this.remainingTime;
    this.timer1 = 1;
}
else if(this.remainingTime >= 60)
{
    this.timerLabel.text = '0'+ Math.floor(this.remainingTime / 60) + ':' + ((this.remainingTime >= 70) ? this.remainingTime - 60 : '0'+(this.remainingTime - 60));
    this.timer1 = 1;
}
else if(this.remainingTime == 0)
{
    this.win = true;
    console.log(this.remainingTime);
    this.timerLabel.text = '00:00';
    this.timer1 = 0;
    pointer.clear();
    var end = rooms.append('Try Again');
    end.alpha = 0;
    tween.add({
        obj: end,
        fields:{
            alpha: 1
        },
        duration: 250
    });
}

} else {
    this.timer1 -= false ? u.timeUi : u.time;
}
/* room Game — core_OnStep (On frame start event) */
{
if(pointer.down[0] && !this.win)
{
    let targetX = Math.min(Math.max(pointer.x, this.currentOrb != null ? this.minX + (this.currentOrb.width/2) : this.minX), this.currentOrb != null ? this.maxX - (this.currentOrb.width / 2) : this.maxX);

    this.c.position.x = targetX;
    if(this.currentOrb != null)
        this.currentOrb.x = this.c.x;
}

if(pointer.released[0] && this.currentOrb != null && !this.win)
{
    this.previousOrb = this.currentOrb;
    this.currentOrb.kill = true;
    this.currentOrb = null;
    var selected = this.previousOrb.template.slice(0,-1);
    var orb = templates.copy(selected, this.c.position.x, this.c.position.y);
    this.ingredients.push(orb);

    u.wait(500).then(() =>{
        if(!this.win)
        {
            this.currentOrb = templates.copy(GetOrb(), this.c.x,this.c.y);

            let targetX = Math.min(Math.max(this.c.x, this.currentOrb != null ? this.minX + (this.currentOrb.width/2) : this.minX), this.currentOrb != null ? this.maxX - (this.currentOrb.width / 2) : this.maxX);
            this.c.x = targetX;
            this.currentOrb.x = this.c.x;
        }
    });
}
}

    },
    onDraw() {
        
    },
    onLeave() {
        
    },
    onCreate() {
        /* room Game — core_OnRoomStart (On room start event) */
{
this.ingredients = [];
this.ingCount = 0;
this.finalVariant = [];
this.variantCount = 0;
this.coreOrbs = [];
this.remainingTime = 120;

this.minX = 75;
this.maxX = 645;

this.dropping = false;
this.c = templates.copy('Cursor', 360, 300);
this.c.scale.x = this.c.scale.y = 0.25;

this.previousOrb = null;
this.currentOrb = templates.copy(GetOrb(), this.c.x,this.c.y);

this.win = false;
this.runningSequence = false;

matter.on('collisionStart', e => {
    // Loop over every collision in a frame
    if(!this.win)
    {
        for (var pair of e.pairs) 
        {
            // INGREDIENT ORBS
            if((pair.bodyA.copy.template === 'Protein' && pair.bodyB.copy.template === 'Sucrose') || (pair.bodyA.copy.template === 'Sucrose' && pair.bodyB.copy.template === 'Protein'))
            {
                var posX = (pair.bodyA.copy.position.x + pair.bodyB.copy.position.x) / 2;
                var posY = (pair.bodyB.copy.position.y + pair.bodyB.copy.position.y) / 2;

                this.ingredients.slice(this.ingredients.indexOf(pair.bodyA),1);
                this.ingredients.slice(this.ingredients.indexOf(pair.bodyB),1);
                pair.bodyA.copy.kill = true;
                pair.bodyB.copy.kill = true;

                var core = templates.copy('Core', posX, posY);
                this.orb = templates.copy('Protection', 0, 0);
                core.current = 'Protection';
                core.protection = core;
                core.addChild(this.orb);
                this.coreOrbs.push('Protection');
                this.finalVariant.push(core);
            }
            if(pair.bodyA.copy.template === 'HMO' && pair.bodyB.copy.template === 'HMO')
            {
                var posX = (pair.bodyA.copy.position.x + pair.bodyB.copy.position.x) / 2;
                var posY = (pair.bodyB.copy.position.y + pair.bodyB.copy.position.y) / 2;

                this.ingredients.slice(this.ingredients.indexOf(pair.bodyA),1);
                this.ingredients.slice(this.ingredients.indexOf(pair.bodyB),1);
                pair.bodyA.copy.kill = true;
                pair.bodyB.copy.kill = true;

                var core = templates.copy('Core', posX, posY);
                this.orb = templates.copy('Brain', 0, 0);
                core.current = 'Brain';
                core.brain = core;
                core.addChild(this.orb);
                this.coreOrbs.push('Brain');
                this.finalVariant.push(core);
            }
            if((pair.bodyA.copy.template === 'Protein' && pair.bodyB.copy.template === 'HMO') || (pair.bodyA.copy.template === 'HMO' && pair.bodyB.copy.template === 'Protein'))
            {
                var posX = (pair.bodyA.copy.position.x + pair.bodyB.copy.position.x) / 2;
                var posY = (pair.bodyB.copy.position.y + pair.bodyB.copy.position.y) / 2;

                this.ingredients.slice(this.ingredients.indexOf(pair.bodyA),1);
                this.ingredients.slice(this.ingredients.indexOf(pair.bodyB),1);
                pair.bodyA.copy.kill = true;
                pair.bodyB.copy.kill = true;

                var core = templates.copy('Core', posX, posY);
                this.orb = templates.copy('Growth', 0, 0);
                core.current = 'Growth';
                core.growth = true;
                core.addChild(this.orb);
                this.coreOrbs.push('Growth');
                this.finalVariant.push(core);
            }
            if((pair.bodyA.copy.template === 'BLactis' && pair.bodyB.copy.template === 'HMO') || (pair.bodyA.copy.template === 'HMO' && pair.bodyB.copy.template === 'BLactis'))
            {
                var posX = (pair.bodyA.copy.position.x + pair.bodyB.copy.position.x) / 2;
                var posY = (pair.bodyB.copy.position.y + pair.bodyB.copy.position.y) / 2;

                this.ingredients.slice(this.ingredients.indexOf(pair.bodyA),1);
                this.ingredients.slice(this.ingredients.indexOf(pair.bodyB),1);
                pair.bodyA.copy.kill = true;
                pair.bodyB.copy.kill = true;

                var r = Math.random() <= .5 ? 'Immunity' : 'Digestion';

                var core = templates.copy('Core', posX, posY);
                this.orb = templates.copy(r, 0, 0);
                r=='Immunity' ? core.immunity = core : core.digestion = core;
                core.current = r;
                core.addChild(this.orb);
                core.alpha = 1;
                this.coreOrbs.push(r);
                this.finalVariant.push(core);
            }

            // CORE ORBS
            if(pair.bodyA.copy.template === 'Core' && pair.bodyB.copy.template === 'Core')
            {
                SetData(pair.bodyA.copy, pair.bodyB.copy.current, pair.bodyB.copy);
                SetData(pair.bodyB.copy, pair.bodyA.copy.current, pair.bodyA.copy);
            }

            // WIN CONDITION CHECK
            if(this.coreOrbs.includes('Brain') && this.coreOrbs.includes('Digestion') && this.coreOrbs.includes('Growth') && this.coreOrbs.includes('Immunity') && this.coreOrbs.includes('Protection'))
            {
                this.win = true;
                this.timer1 = 0;

                if(!this.runningSequence)
                {
                    this.runningSequence = true;
                    FirstInterval();
                }
            }
        }
    }
});

matter.on('collisionEnd', e => {
    // Loop over every collision in a frame
    if(!this.win)
    {
        for (var pair of e.pairs) 
        {
            if(pair.bodyA.copy.template === 'Core' && pair.bodyB.copy.template === 'Core')
            {
                SetData(pair.bodyA.copy, pair.bodyB.copy.current, null);
                SetData(pair.bodyB.copy, pair.bodyA.copy.current, null);
            }    
        }
    }
});

function FirstInterval()
{
    let newArr = [];
    for(let i = 0;i < rooms.current.ingredients.length;i++)
    {
        if(!rooms.current.ingredients[i].kill)
            newArr.push(rooms.current.ingredients[i]);
    }
    let leftOvers = [];
    let leftOverOrb = [];
    for(let i = 0;i < rooms.current.finalVariant.length;i++)
    {
        if(!leftOvers.includes(rooms.current.finalVariant[i].current))
        {
            leftOvers.push(rooms.current.finalVariant[i].current);
        }
        else
        {
            leftOverOrb.push(rooms.current.finalVariant[i]);
        }
    }
    console.log(leftOvers);

    for(let i = 0;i < newArr.length;i++)
    {
        newArr[i].kill = true;
    }
    for(let i = 0;i < leftOverOrb.length;i++)
    {
        leftOverOrb[i].kill = true;
    } 
    u.wait(4000).then(() =>{
        SecondInterval();
    });
}
function SecondInterval()
{
    let newArr = [];
    let c = 0;
    for(let i = 0;i < rooms.current.finalVariant.length;i++)
    {
        if(!rooms.current.finalVariant[i].kill || (rooms.current.finalVariant[i] != null && !rooms.current.finalVariant[i].kill))
            newArr.push(rooms.current.finalVariant[i]);
    }

    for(let i = 0;i < newArr.length;i++)
    {
        newArr[i].kill = true;
    }   
    this.p = templates.copy('Pro',360,920);
    rooms.current.addChild(this.p);
    this.p.scale.x = this.p.scale.y = 1;

    u.wait(2000).then(() =>{
        let detailer = rooms.append('Detailer');
        detailer.alpha = 0;
        tween.add({
            obj: detailer,
            fields:{
                alpha: 1
            },
            duration: 250,
            silent: true
        }).then(() =>{
            pointer.clear();
        });
    });
}

// TIMER LABEL
this.timerLabel = new PIXI.Text('02:00', styles.get('RG-Bold')); 
this.addChild(this.timerLabel);
this.timerLabel.x = 360;
this.timerLabel.y = 160;
this.timerLabel.anchor.x = 0.5;

this.timer1 = 1;


}

    },
    isUi: false,
    follow: false,
    extends: {},
    bindings: {
    
    }
}
        
rooms.templates['Try Again'] = {
    name: 'Try Again',
    width: 720,
    height: 1280,
    behaviors: JSON.parse('[]'),
    objects: JSON.parse('[{"x":-96.8125,"y":-64,"opacity":0.9,"tint":"#000000","scale":{"x":14,"y":23},"rotation":0,"exts":{},"customProperties":{"newProperty1":"","newProperty2":""},"template":"Placeholder"}]'),
    bgs: JSON.parse('[]'),
    tiles: JSON.parse('[]'),
    backgroundColor: '#212121',
    
    onStep() {
        
    },
    onDraw() {
        /* room Try Again — core_OnDraw (On frame end event) */
{
if (pointer.down[0] && !this.pressed) {
    this.pressed = true;
    finished = 0;
    selected = null;
    tween.add({
        obj: this,
        fields:{
            alpha: 0
        },
        duration: 250,
        silent: true
    }).then(() =>{
        rooms.switch('Game');
    });
}
}

    },
    onLeave() {
        
    },
    onCreate() {
        /* room Try Again — core_OnRoomStart (On room start event) */
{
pointer.clear();

this.timerLabel = new PIXI.Text('TRY AGAIN', styles.get('RG-Bold_BigGreen')); 
this.addChild(this.timerLabel);
this.timerLabel.x = 150;
this.timerLabel.y = 400;
this.timerLabel.depth = 100;
}

    },
    isUi: false,
    follow: false,
    extends: {},
    bindings: {
    
    }
}
        
    
  }
  /**
 * @typedef ICtPlaceRectangle
 * @property {number} [x1] The left side of the rectangle.
 * @property {number} [y1] The upper side of the rectangle.
 * @property {number} [x2] The right side of the rectangle.
 * @property {number} [y2] The bottom side of the rectangle.
 * @property {number} [x] The left side of the rectangle.
 * @property {number} [y] The upper side of the rectangle.
 * @property {number} [width] The right side of the rectangle.
 * @property {number} [height] The bottom side of the rectangle.
 */
/**
 * @typedef ICtPlaceLineSegment
 * @property {number} x1 The horizontal coordinate of the starting point of the ray.
 * @property {number} y1 The vertical coordinate of the starting point of the ray.
 * @property {number} x2 The horizontal coordinate of the ending point of the ray.
 * @property {number} y2 The vertical coordinate of the ending point of the ray.
 */
/**
 * @typedef ICtPlaceCircle
 * @property {number} x The horizontal coordinate of the circle's center.
 * @property {number} y The vertical coordinate of the circle's center.
 * @property {number} radius The radius of the circle.
 */
/* eslint-disable no-underscore-dangle */
/* global SSCD */
/* eslint prefer-destructuring: 0 */
const place = (function ctPlace() {
    const circlePrecision = 16;
    const debugMode = [false][0];

    const getSSCDShapeFromRect = function (obj) {
        const {shape} = obj,
              position = new SSCD.Vector(obj.x, obj.y);
        const scaleX = obj instanceof PIXI.NineSlicePlane ? 1 : obj.scale.x,
              scaleY = obj instanceof PIXI.NineSlicePlane ? 1 : obj.scale.y;
        if (obj.angle === 0) {
            position.x -= scaleX > 0 ?
                (shape.left * scaleX) :
                (-scaleX * shape.right);
            position.y -= scaleY > 0 ?
                (shape.top * scaleY) :
                (-shape.bottom * scaleY);
            return new SSCD.Rectangle(
                position,
                new SSCD.Vector(
                    Math.abs((shape.left + shape.right) * scaleX),
                    Math.abs((shape.bottom + shape.top) * scaleY)
                )
            );
        }
        const upperLeft = u.rotate(
            -shape.left * scaleX,
            -shape.top * scaleY, obj.angle
        );
        const bottomLeft = u.rotate(
            -shape.left * scaleX,
            shape.bottom * scaleY, obj.angle
        );
        const bottomRight = u.rotate(
            shape.right * scaleX,
            shape.bottom * scaleY, obj.angle
        );
        const upperRight = u.rotate(
            shape.right * scaleX,
            -shape.top * scaleY, obj.angle
        );
        return new SSCD.LineStrip(position, [
            new SSCD.Vector(upperLeft.x, upperLeft.y),
            new SSCD.Vector(bottomLeft.x, bottomLeft.y),
            new SSCD.Vector(bottomRight.x, bottomRight.y),
            new SSCD.Vector(upperRight.x, upperRight.y)
        ], true);
    };

    const getSSCDShapeFromCircle = function (obj) {
        const {shape} = obj,
              position = new SSCD.Vector(obj.x, obj.y);
        if (Math.abs(obj.scale.x) === Math.abs(obj.scale.y)) {
            return new SSCD.Circle(position, shape.r * Math.abs(obj.scale.x));
        }
        const vertices = [];
        for (let i = 0; i < circlePrecision; i++) {
            const point = [
                u.ldx(shape.r * obj.scale.x, 360 / circlePrecision * i),
                u.ldy(shape.r * obj.scale.y, 360 / circlePrecision * i)
            ];
            if (obj.angle !== 0) {
                const {x, y} = u.rotate(point[0], point[1], obj.angle);
                vertices.push(new SSCD.Vector(x, y));
            } else {
                vertices.push(new SSCD.Vector(point[0], point[1]));
            }
        }
        return new SSCD.LineStrip(position, vertices, true);
    };

    const getSSCDShapeFromStrip = function (obj) {
        const {shape} = obj,
              position = new SSCD.Vector(obj.x, obj.y);
        const scaleX = obj instanceof PIXI.NineSlicePlane ? 1 : obj.scale.x,
              scaleY = obj instanceof PIXI.NineSlicePlane ? 1 : obj.scale.y;
        const vertices = [];
        if (obj.angle !== 0) {
            for (const point of shape.points) {
                const {x, y} = u.rotate(
                    point.x * scaleX,
                    point.y * scaleY, obj.angle
                );
                vertices.push(new SSCD.Vector(x, y));
            }
        } else {
            for (const point of shape.points) {
                vertices.push(new SSCD.Vector(point.x * scaleX, point.y * scaleY));
            }
        }
        return new SSCD.LineStrip(position, vertices, Boolean(shape.closedStrip));
    };

    const getSSCDShapeFromLine = function (obj) {
        const {shape} = obj;
        if (obj.angle !== 0) {
            const {x: x1, y: y1} = u.rotate(
                shape.x1 * obj.scale.x,
                shape.y1 * obj.scale.y,
                obj.angle
            );
            const {x: x2, y: y2} = u.rotate(
                shape.x2 * obj.scale.x,
                shape.y2 * obj.scale.y,
                obj.angle
            );
            return new SSCD.Line(
                new SSCD.Vector(
                    obj.x + x1,
                    obj.y + y1
                ),
                new SSCD.Vector(
                    x2 - x1,
                    y2 - y1
                )
            );
        }
        return new SSCD.Line(
            new SSCD.Vector(
                obj.x + shape.x1 * obj.scale.x,
                obj.y + shape.y1 * obj.scale.y
            ),
            new SSCD.Vector(
                (shape.x2 - shape.x1) * obj.scale.x,
                (shape.y2 - shape.y1) * obj.scale.y
            )
        );
    };

    /**
     * Gets SSCD shapes from object's shape field and its transforms.
     */
    var getSSCDShape = function (obj) {
        switch (obj.shape.type) {
        case 'rect':
            return getSSCDShapeFromRect(obj);
        case 'circle':
            return getSSCDShapeFromCircle(obj);
        case 'strip':
            return getSSCDShapeFromStrip(obj);
        case 'line':
            return getSSCDShapeFromLine(obj);
        default:
            return new SSCD.Circle(new SSCD.Vector(obj.x, obj.y), 0);
        }
    };

    // Premade filter predicates to avoid function creation and memory bloat during the game loop.
    const templateNameFilter = (target, other, template) => other.template === template;
    const cgroupFilter = (target, other, cgroup) => !cgroup || cgroup === other.cgroup;

    // Core collision-checking method that accepts various filtering predicates
    // and a variable partitioning grid.

    // eslint-disable-next-line max-params
    const genericCollisionQuery = function (
        target,
        customX,
        customY,
        partitioningGrid,
        queryAll,
        filterPredicate,
        filterVariable
    ) {
        const oldx = target.x,
              oldy = target.y;
        const shapeCashed = target._shape;
        let hashes, results;
        // Apply arbitrary location to the checked object
        if (customX !== void 0 && (oldx !== customX || oldy !== customY)) {
            target.x = customX;
            target.y = customY;
            target._shape = getSSCDShape(target);
            hashes = place.getHashes(target);
        } else {
            hashes = target.$chashes || place.getHashes(target);
            target._shape = target._shape || getSSCDShape(target);
        }
        if (queryAll) {
            results = [];
        }
        // Get all the known objects in close proximity to the tested object,
        // sourcing from the passed partitioning grid.
        for (const hash of hashes) {
            const array = partitioningGrid[hash];
            // Such partition cell is absent
            if (!array) {
                continue;
            }
            for (const obj of array) {
                // Skip checks against the tested object itself.
                if (obj === target) {
                    continue;
                }
                // Filter out objects
                if (!filterPredicate(target, obj, filterVariable)) {
                    continue;
                }
                // Check for collision between two objects
                if (place.collide(target, obj)) {
                    // Singular pick; return the collided object immediately.
                    if (!queryAll) {
                        // Return the object back to its old position.
                        // Skip SSCD shape re-calculation.
                        if (oldx !== target.x || oldy !== target.y) {
                            target.x = oldx;
                            target.y = oldy;
                            target._shape = shapeCashed;
                        }
                        return obj;
                    }
                    // Multiple pick; push the collided object into an array.
                    if (!results.includes(obj)) {
                        results.push(obj);
                    }
                }
            }
        }
        // Return the object back to its old position.
        // Skip SSCD shape re-calculation.
        if (oldx !== target.x || oldy !== target.y) {
            target.x = oldx;
            target.y = oldy;
            target._shape = shapeCashed;
        }
        if (!queryAll) {
            return false;
        }
        return results;
    };

    const place = {
        m: 1, // direction modifier in place.go,
        gridX: [1024][0] || 512,
        gridY: [1024][0] || 512,
        grid: {},
        tileGrid: {},
        getHashes(copy) {
            var hashes = [];
            var x = Math.round(copy.x / place.gridX),
                y = Math.round(copy.y / place.gridY),
                dx = Math.sign(copy.x - place.gridX * x),
                dy = Math.sign(copy.y - place.gridY * y);
            hashes.push(`${x}:${y}`);
            if (dx) {
                hashes.push(`${x + dx}:${y}`);
                if (dy) {
                    hashes.push(`${x + dx}:${y + dy}`);
                }
            }
            if (dy) {
                hashes.push(`${x}:${y + dy}`);
            }
            return hashes;
        },
        /**
         * Applied to copies in the debug mode. Draws a collision shape
         * @this Copy
         * @param {boolean} [absolute] Whether to use room coordinates
         * instead of coordinates relative to the copy.
         * @returns {void}
         */
        drawDebugGraphic(absolute) {
            const shape = this._shape || getSSCDShape(this);
            const g = this.$cDebugCollision;
            const inverse = this.transform.localTransform.clone().invert();
            this.$cDebugCollision.transform.setFromMatrix(inverse);
            this.$cDebugCollision.position.set(0, 0);
            let color = 0x00ffff;
            if (this instanceof Copy) {
                color = 0x0066ff;
            } else if (this instanceof PIXI.Sprite) {
                color = 0x6600ff;
            }
            if (this.$cHadCollision) {
                color = 0x00ff00;
            }
            g.lineStyle(2, color);
            if (shape instanceof SSCD.Rectangle) {
                const pos = shape.get_position(),
                      size = shape.get_size();
                g.beginFill(color, 0.1);
                if (!absolute) {
                    g.drawRect(pos.x - this.x, pos.y - this.y, size.x, size.y);
                } else {
                    g.drawRect(pos.x, pos.y, size.x, size.y);
                }
                g.endFill();
            } else if (shape instanceof SSCD.LineStrip) {
                if (!absolute) {
                    g.moveTo(shape.__points[0].x, shape.__points[0].y);
                    for (let i = 1; i < shape.__points.length; i++) {
                        g.lineTo(shape.__points[i].x, shape.__points[i].y);
                    }
                } else {
                    g.moveTo(shape.__points[0].x + this.x, shape.__points[0].y + this.y);
                    for (let i = 1; i < shape.__points.length; i++) {
                        g.lineTo(shape.__points[i].x + this.x, shape.__points[i].y + this.y);
                    }
                }
            } else if (shape instanceof SSCD.Circle && shape.get_radius() > 0) {
                g.beginFill(color, 0.1);
                if (!absolute) {
                    g.drawCircle(0, 0, shape.get_radius());
                } else {
                    g.drawCircle(this.x, this.y, shape.get_radius());
                }
                g.endFill();
            } else if (shape instanceof SSCD.Line) {
                if (!absolute) {
                    g.moveTo(
                        shape.__position.x,
                        shape.__position.y
                    ).lineTo(
                        shape.__position.x + shape.__dest.x,
                        shape.__position.y + shape.__dest.y
                    );
                } else {
                    const p1 = shape.get_p1();
                    const p2 = shape.get_p2();
                    g.moveTo(p1.x, p1.y)
                    .lineTo(p2.x, p2.y);
                }
            } else if (!absolute) { // Treat as a point
                g.moveTo(-16, -16)
                .lineTo(16, 16)
                .moveTo(-16, 16)
                .lineTo(16, -16);
            } else {
                g.moveTo(-16 + this.x, -16 + this.y)
                .lineTo(16 + this.x, 16 + this.y)
                .moveTo(-16 + this.x, 16 + this.y)
                .lineTo(16 + this.x, -16 + this.y);
            }
        },
        collide(c1, c2) {
            // place.collide(<c1: Copy, c2: Copy>)
            // Test collision between two copies
            c1._shape = c1._shape || getSSCDShape(c1);
            c2._shape = c2._shape || getSSCDShape(c2);
            if (c1._shape.__type === 'strip' ||
                c2._shape.__type === 'strip' ||
                c1._shape.__type === 'complex' ||
                c2._shape.__type === 'complex'
            ) {
                const aabb1 = c1._shape.get_aabb(),
                      aabb2 = c2._shape.get_aabb();
                if (!aabb1.intersects(aabb2)) {
                    return false;
                }
            }
            if (SSCD.CollisionManager.test_collision(c1._shape, c2._shape)) {
                if ([false][0]) {
                    c1.$cHadCollision = true;
                    c2.$cHadCollision = true;
                }
                return true;
            }
            return false;
        },
        /**
         * Determines if the place in (x,y) is occupied by any copies or tiles.
         * Optionally can take 'cgroup' as a filter for obstacles'
         * collision group (not shape type).
         *
         * @param {Copy} me The object to check collisions on.
         * @param {number} [x] The x coordinate to check, as if `me` was placed there.
         * @param {number} [y] The y coordinate to check, as if `me` was placed there.
         * @param {String} [cgroup] The collision group to check against
         * @returns {Copy|Array<Copy>} The collided copy, or an array of all the detected collisions
         * (if `multiple` is `true`)
         */
        occupied(target, x, y, cgroup) {
            if (typeof y !== 'number') {
                // No arbitrary location was passed, rewrite arguments w/o them.
                cgroup = x;
                x = void 0;
                y = void 0;
            }
            const copies = genericCollisionQuery(
                target, x, y,
                place.grid,
                false,
                cgroupFilter, cgroup
            );
            // Was any suitable copy found? Return it immediately and skip the query for tiles.
            if (copies) {
                return copies;
            }
            // Return query result for tiles.
            return genericCollisionQuery(
                target, x, y,
                place.tileGrid,
                false,
                cgroupFilter, cgroup
            );
        },
        occupiedMultiple(target, x, y, cgroup) {
            if (typeof y !== 'number') {
                // No arbitrary location was passed, rewrite arguments w/o them.
                cgroup = x;
                x = void 0;
                y = void 0;
            }
            const copies = genericCollisionQuery(
                target, x, y,
                place.grid,
                true,
                cgroupFilter, cgroup
            );
            const tiles = genericCollisionQuery(
                target, x, y,
                place.tileGrid,
                true,
                cgroupFilter, cgroup
            );
            return copies.concat(tiles);
        },
        free(me, x, y, cgroup) {
            return !place.occupied(me, x, y, cgroup);
        },
        meet(target, x, y, templateName) {
            if (typeof y !== 'number') {
                // No arbitrary location was passed, rewrite arguments w/o them.
                templateName = x;
                x = void 0;
                y = void 0;
            }
            return genericCollisionQuery(
                target, x, y,
                place.grid,
                false,
                templateNameFilter, templateName
            );
        },
        meetMultiple(target, x, y, templateName) {
            if (typeof y !== 'number') {
                // No arbitrary location was passed, rewrite arguments w/o them.
                templateName = x;
                x = void 0;
                y = void 0;
            }
            return genericCollisionQuery(
                target, x, y,
                place.grid,
                true,
                templateNameFilter, templateName
            );
        },
        copies(target, x, y, cgroup) {
            if (typeof y !== 'number') {
                // No arbitrary location was passed, rewrite arguments w/o them.
                cgroup = x;
                x = void 0;
                y = void 0;
            }
            return genericCollisionQuery(
                target, x, y,
                place.grid,
                false,
                cgroupFilter, cgroup
            );
        },
        copiesMultiple(target, x, y, cgroup) {
            if (typeof y !== 'number') {
                // No arbitrary location was passed, rewrite arguments w/o them.
                cgroup = x;
                x = void 0;
                y = void 0;
            }
            return genericCollisionQuery(
                target, x, y,
                place.grid,
                true,
                cgroupFilter, cgroup
            );
        },
        tiles(target, x, y, cgroup) {
            if (typeof y !== 'number') {
                // No arbitrary location was passed, rewrite arguments w/o them.
                cgroup = x;
                x = void 0;
                y = void 0;
            }
            return genericCollisionQuery(
                target, x, y,
                place.tileGrid,
                false,
                cgroupFilter, cgroup
            );
        },
        tilesMultiple(target, x, y, cgroup) {
            if (typeof y !== 'number') {
                // No arbitrary location was passed, rewrite arguments w/o them.
                cgroup = x;
                x = void 0;
                y = void 0;
            }
            return genericCollisionQuery(
                target, x, y,
                place.tileGrid,
                true,
                cgroupFilter, cgroup
            );
        },
        lastdist: null,
        nearest(x, y, templateName) {
            // place.nearest(x: number, y: number, templateName: string)
            const copies = templates.list[templateName];
            if (copies.length > 0) {
                var dist = Math.hypot(x - copies[0].x, y - copies[0].y);
                var inst = copies[0];
                for (const copy of copies) {
                    if (Math.hypot(x - copy.x, y - copy.y) < dist) {
                        dist = Math.hypot(x - copy.x, y - copy.y);
                        inst = copy;
                    }
                }
                place.lastdist = dist;
                return inst;
            }
            return false;
        },
        furthest(x, y, template) {
            // place.furthest(<x: number, y: number, template: Template>)
            const templates = templates.list[template];
            if (templates.length > 0) {
                var dist = Math.hypot(x - templates[0].x, y - templates[0].y);
                var inst = templates[0];
                for (const copy of templates) {
                    if (Math.hypot(x - copy.x, y - copy.y) > dist) {
                        dist = Math.hypot(x - copy.x, y - copy.y);
                        inst = copy;
                    }
                }
                place.lastdist = dist;
                return inst;
            }
            return false;
        },
        enableTilemapCollisions(tilemap, exactCgroup) {
            const cgroup = exactCgroup || tilemap.cgroup;
            if (tilemap.addedCollisions) {
                throw new Error('[place] The tilemap already has collisions enabled.');
            }
            tilemap.cgroup = cgroup;
            // Prebake hashes and SSCD shapes for all the tiles
            for (const pixiSprite of tilemap.pixiTiles) {
                // eslint-disable-next-line no-underscore-dangle
                pixiSprite._shape = getSSCDShape(pixiSprite);
                pixiSprite.cgroup = cgroup;
                pixiSprite.$chashes = place.getHashes(pixiSprite);
                /* eslint max-depth: 0 */
                for (const hash of pixiSprite.$chashes) {
                    if (!(hash in place.tileGrid)) {
                        place.tileGrid[hash] = [pixiSprite];
                    } else {
                        place.tileGrid[hash].push(pixiSprite);
                    }
                }
                pixiSprite.depth = tilemap.depth;
            }
            if (debugMode) {
                for (const pixiSprite of tilemap.pixiTiles) {
                    pixiSprite.$cDebugCollision = new PIXI.Graphics();
                    place.drawDebugGraphic.apply(pixiSprite, [false]);
                    pixiSprite.addChild(pixiSprite.$cDebugCollision);
                }
            }
            tilemap.addedCollisions = true;
        },
        moveAlong(me, dir, length, cgroup, precision) {
            if (!length) {
                return false;
            }
            if (typeof cgroup === 'number') {
                precision = cgroup;
                cgroup = void 0;
            }
            precision = Math.abs(precision || 1);
            if (length < 0) {
                length *= -1;
                dir += 180;
            }
            var dx = Math.cos(dir * Math.PI / 180) * precision,
                dy = Math.sin(dir * Math.PI / 180) * precision;
            while (length > 0) {
                if (length < 1) {
                    dx *= length;
                    dy *= length;
                }
                const occupied = place.occupied(me, me.x + dx, me.y + dy, cgroup);
                if (!occupied) {
                    me.x += dx;
                    me.y += dy;
                    delete me._shape;
                } else {
                    return occupied;
                }
                length--;
            }
            return false;
        },
        moveByAxes(me, dx, dy, cgroup, precision) {
            if (dx === dy === 0) {
                return false;
            }
            if (typeof cgroup === 'number') {
                precision = cgroup;
                cgroup = void 0;
            }
            const obstacles = {
                x: false,
                y: false
            };
            precision = Math.abs(precision || 1);
            while (Math.abs(dx) > precision) {
                const occupied =
                    place.occupied(me, me.x + Math.sign(dx) * precision, me.y, cgroup);
                if (!occupied) {
                    me.x += Math.sign(dx) * precision;
                    dx -= Math.sign(dx) * precision;
                } else {
                    obstacles.x = occupied;
                    break;
                }
            }
            while (Math.abs(dy) > precision) {
                const occupied =
                    place.occupied(me, me.x, me.y + Math.sign(dy) * precision, cgroup);
                if (!occupied) {
                    me.y += Math.sign(dy) * precision;
                    dy -= Math.sign(dy) * precision;
                } else {
                    obstacles.y = occupied;
                    break;
                }
            }
            // A fraction of precision may be left but completely reachable; jump to this point.
            if (Math.abs(dx) < precision) {
                if (place.free(me, me.x + dx, me.y, cgroup)) {
                    me.x += dx;
                }
            }
            if (Math.abs(dy) < precision) {
                if (place.free(me, me.x, me.y + dy, cgroup)) {
                    me.y += dy;
                }
            }
            if (!obstacles.x && !obstacles.y) {
                return false;
            }
            return obstacles;
        },
        go(me, x, y, length, cgroup) {
            // place.go(<me: Copy, x: number, y: number, length: number>[, cgroup: String])
            // tries to reach the target with a simple obstacle avoidance algorithm

            // if we are too close to the destination, exit
            if (u.pdc(me.x, me.y, x, y) < length) {
                if (place.free(me, x, y, cgroup)) {
                    me.x = x;
                    me.y = y;
                    delete me._shape;
                }
                return;
            }
            var dir = u.pdn(me.x, me.y, x, y);

            //if there are no obstackles in front of us, go forward
            let projectedX = me.x + u.ldx(length, dir),
                projectedY = me.y + u.ldy(length, dir);
            if (place.free(me, projectedX, projectedY, cgroup)) {
                me.x = projectedX;
                me.y = projectedY;
                delete me._shape;
                me.dir = dir;
            // otherwise, try to change direction by 30...60...90 degrees.
            // Direction changes over time (place.m).
            } else {
                for (var i = -1; i <= 1; i += 2) {
                    for (var j = 30; j < 150; j += 30) {
                        projectedX = me.x + u.ldx(length, dir + j * place.m * i);
                        projectedY = me.y + u.ldy(length, dir + j * place.m * i);
                        if (place.free(me, projectedX, projectedY, cgroup)) {
                            me.x = projectedX;
                            me.y = projectedY;
                            delete me._shape;
                            me.dir = dir + j * place.m * i;
                            return;
                        }
                    }
                }
            }
        },
        traceCustom(shape, oversized, cgroup, getAll) {
            const results = [];
            if (debugMode) {
                shape.$cDebugCollision = place.debugTraceGraphics;
                place.drawDebugGraphic.apply(shape, [true]);
            }
            // Oversized tracing shapes won't work with partitioning table, and thus
            // will need to loop over all the copies and tiles in the room.
            // Non-oversized shapes can use plain place.occupied.
            if (!oversized) {
                if (getAll) {
                    return place.occupiedMultiple(shape, cgroup);
                }
                return place.occupied(shape, cgroup);
            }
            // Oversized shapes.
            // Loop over all the copies in the room.
            for (const copy of stack) {
                if (!cgroup || copy.cgroup === cgroup) {
                    if (place.collide(shape, copy)) {
                        if (getAll) {
                            results.push(copy);
                        } else {
                            return copy;
                        }
                    }
                }
            }
            // Additionally, loop over all the tilesets and their tiles.
            for (const tilemap of templates.list.TILEMAP) {
                if (!tilemap.addedCollisions) {
                    continue;
                }
                if (cgroup && tilemap.cgroup !== cgroup) {
                    continue;
                }
                for (const tile of tilemap.pixiTiles) {
                    if (place.collide(shape, tile)) {
                        if (getAll) {
                            results.push(tile);
                        } else {
                            return tile;
                        }
                    }
                }
            }
            if (!getAll) {
                return false;
            }
            return results;
        },
        /**
         * Tests for intersections with a line segment.
         * If `getAll` is set to `true`, returns all the copies that intersect
         * the line segment; otherwise, returns the first one that fits the conditions.
         *
         * @param {ICtPlaceLineSegment} line An object that describes the line segment.
         * @param {string} [cgroup] An optional collision group to trace against.
         * If omitted, will trace through all the copies in the current room.
         * @param {boolean} [getAll] Whether to return all the intersections (true),
         * or return the first one.
         * @returns {Copy|Array<Copy>}
         */
        traceLine(line, cgroup, getAll) {
            let oversized = false;
            if (Math.abs(line.x1 - line.x2) > place.gridX) {
                oversized = true;
            } else if (Math.abs(line.y1 - line.y2) > place.gridY) {
                oversized = true;
            }
            const shape = {
                x: line.x1,
                y: line.y1,
                scale: {
                    x: 1, y: 1
                },
                rotation: 0,
                angle: 0,
                shape: {
                    type: 'line',
                    x1: 0,
                    y1: 0,
                    x2: line.x2 - line.x1,
                    y2: line.y2 - line.y1
                }
            };
            const result = place.traceCustom(shape, oversized, cgroup, getAll);
            if (getAll) {
                // An approximate sorting by distance
                result.sort(function sortCopies(a, b) {
                    var dist1, dist2;
                    dist1 = u.pdc(line.x1, line.y1, a.x, a.y);
                    dist2 = u.pdc(line.x1, line.y1, b.x, b.y);
                    return dist1 - dist2;
                });
            }
            return result;
        },
        /**
         * Tests for intersections with a filled rectangle.
         * If `getAll` is set to `true`, returns all the copies that intersect
         * the rectangle; otherwise, returns the first one that fits the conditions.
         *
         * @param {ICtPlaceRectangle} rect An object that describes the line segment.
         * @param {string} [cgroup] An optional collision group to trace against.
         * If omitted, will trace through all the copies in the current room.
         * @param {boolean} [getAll] Whether to return all the intersections (true),
         * or return the first one.
         * @returns {Copy|Array<Copy>}
         */
        traceRect(rect, cgroup, getAll) {
            let oversized = false;
            rect = { // Copy the object
                ...rect
            };
            // Turn x1, x2, y1, y2 into x, y, width, and height
            if ('x1' in rect) {
                rect.x = rect.x1;
                rect.y = rect.y1;
                rect.width = rect.x2 - rect.x1;
                rect.height = rect.y2 - rect.y1;
            }
            if (Math.abs(rect.width) > place.gridX || Math.abs(rect.height) > place.gridY) {
                oversized = true;
            }
            const shape = {
                x: rect.x,
                y: rect.y,
                scale: {
                    x: 1, y: 1
                },
                rotation: 0,
                angle: 0,
                shape: {
                    type: 'rect',
                    left: 0,
                    top: 0,
                    right: rect.width,
                    bottom: rect.height
                }
            };
            return place.traceCustom(shape, oversized, cgroup, getAll);
        },
        /**
         * Tests for intersections with a filled circle.
         * If `getAll` is set to `true`, returns all the copies that intersect
         * the circle; otherwise, returns the first one that fits the conditions.
         *
         * @param {ICtPlaceCircle} rect An object that describes the line segment.
         * @param {string} [cgroup] An optional collision group to trace against.
         * If omitted, will trace through all the copies in the current room.
         * @param {boolean} [getAll] Whether to return all the intersections (true),
         * or return the first one.
         * @returns {Copy|Array<Copy>}
         */
        traceCircle(circle, cgroup, getAll) {
            let oversized = false;
            if (circle.radius * 2 > place.gridX || circle.radius * 2 > place.gridY) {
                oversized = true;
            }
            const shape = {
                x: circle.x,
                y: circle.y,
                scale: {
                    x: 1, y: 1
                },
                rotation: 0,
                angle: 0,
                shape: {
                    type: 'circle',
                    r: circle.radius
                }
            };
            return place.traceCustom(shape, oversized, cgroup, getAll);
        },
        /**
         * Tests for intersections with a polyline. It is a hollow shape made
         * of connected line segments. The shape is not closed unless you add
         * the closing point by yourself.
         * If `getAll` is set to `true`, returns all the copies that intersect
         * the polyline; otherwise, returns the first one that fits the conditions.
         *
         * @param {Array<IPoint>} polyline An array of objects with `x` and `y` properties.
         * @param {string} [cgroup] An optional collision group to trace against.
         * If omitted, will trace through all the copies in the current room.
         * @param {boolean} [getAll] Whether to return all the intersections (true),
         * or return the first one.
         * @returns {Copy|Array<Copy>}
         */
        tracePolyline(polyline, cgroup, getAll) {
            const shape = {
                x: 0,
                y: 0,
                scale: {
                    x: 1, y: 1
                },
                rotation: 0,
                angle: 0,
                shape: {
                    type: 'strip',
                    points: polyline
                }
            };
            return place.traceCustom(shape, true, cgroup, getAll);
        },
        /**
         * Tests for intersections with a point.
         * If `getAll` is set to `true`, returns all the copies that intersect
         * the point; otherwise, returns the first one that fits the conditions.
         *
         * @param {object} point An object with `x` and `y` properties.
         * @param {string} [cgroup] An optional collision group to trace against.
         * If omitted, will trace through all the copies in the current room.
         * @param {boolean} [getAll] Whether to return all the intersections (true),
         * or return the first one.
         * @returns {Copy|Array<Copy>}
         */
        tracePoint(point, cgroup, getAll) {
            const shape = {
                x: point.x,
                y: point.y,
                scale: {
                    x: 1, y: 1
                },
                rotation: 0,
                angle: 0,
                shape: {
                    type: 'point'
                }
            };
            return place.traceCustom(shape, false, cgroup, getAll);
        }
    };

    // Aliases
    place.traceRectange = place.traceRect;
    // a magic procedure which tells 'go' function to change its direction
    setInterval(function switchCtPlaceGoDirection() {
        place.m *= -1;
    }, 789);
    Object.defineProperty(templates.CopyProto, 'moveContinuous', {
        value: function (cgroup, precision) {
            if (this.gravity) {
                this.hspeed += this.gravity * u.time * Math.cos(this.gravityDir * Math.PI / 180);
                this.vspeed += this.gravity * u.time * Math.sin(this.gravityDir * Math.PI / 180);
            }
            return place.moveAlong(this, this.direction, this.speed * u.time, cgroup, precision);
        }
    });
    Object.defineProperty(templates.CopyProto, 'moveBullet', {
        value: function (cgroup, precision) {
            return this.moveContinuous(cgroup, precision);
        }
    });
    Object.defineProperty(templates.CopyProto, 'moveContinuousByAxes', {
        value: function (cgroup, precision) {
            if (this.gravity) {
                this.hspeed += this.gravity * u.time * Math.cos(this.gravityDir * Math.PI / 180);
                this.vspeed += this.gravity * u.time * Math.sin(this.gravityDir * Math.PI / 180);
            }
            return place.moveByAxes(
                this,
                this.hspeed * u.time,
                this.vspeed * u.time,
                cgroup,
                precision
            );
        }
    });
    Object.defineProperty(templates.CopyProto, 'moveSmart', {
        value: function (cgroup, precision) {
            return this.moveContinuousByAxes(cgroup, precision);
        }
    });
    Object.defineProperty(templates.Tilemap.prototype, 'enableCollisions', {
        value: function (cgroup) {
            place.enableTilemapCollisions(this, cgroup);
        }
    });

    window.place = place;
    return place;
})();

const pointer = (function mountCtPointer() {
    const keyPrefix = 'pointer.';
    const setKey = function (key, value) {
        inputs.registry[keyPrefix + key] = value;
    };
    const getKey = function (key) {
        return inputs.registry[keyPrefix + key];
    };
    const buttonMappings = {
        Primary: 1,
        Middle: 4,
        Secondary: 2,
        ExtraOne: 8,
        ExtraTwo: 16,
        Eraser: 32
    };
    var lastPanNum = 0,
        lastPanX = 0,
        lastPanY = 0,
        lastScaleDistance = 0,
        lastAngle = 0;

    // updates Action system's input methods for singular, double and triple pointers
    var countPointers = () => {
        setKey('Any', pointer.down.length > 0 ? 1 : 0);
        setKey('Double', pointer.down.length > 1 ? 1 : 0);
        setKey('Triple', pointer.down.length > 2 ? 1 : 0);
    };
    // returns a new object with the necessary information about a pointer event
    var copyPointer = e => {
        const rect = pixiApp.view.getBoundingClientRect();
        const xui = (e.clientX - rect.left) / rect.width * camera.width,
              yui = (e.clientY - rect.top) / rect.height * camera.height;
        const positionGame = camera.uiToGameCoord(xui, yui);
        const p = {
            id: e.pointerId,
            x: positionGame.x,
            y: positionGame.y,
            clientX: e.clientX,
            clientY: e.clientY,
            xui: xui,
            yui: yui,
            xprev: positionGame.x,
            yprev: positionGame.y,
            buttons: e.buttons,
            xuiprev: xui,
            yuiprev: yui,
            pressure: e.pressure,
            tiltX: e.tiltX,
            tiltY: e.tiltY,
            twist: e.twist,
            type: e.pointerType,
            width: e.width / rect.width * camera.width,
            height: e.height / rect.height * camera.height
        };
        return p;
    };
    var updatePointer = (p, e) => {
        const rect = pixiApp.view.getBoundingClientRect();
        const xui = (e.clientX - rect.left) / rect.width * camera.width,
              yui = (e.clientY - rect.top) / rect.height * camera.height;
        const positionGame = camera.uiToGameCoord(xui, yui);
        Object.assign(p, {
            x: positionGame.x,
            y: positionGame.y,
            xui: xui,
            yui: yui,
            clientX: e.clientX,
            clientY: e.clientY,
            pressure: e.pressure,
            buttons: e.buttons,
            tiltX: e.tiltX,
            tiltY: e.tiltY,
            twist: e.twist,
            width: e.width / rect.width * camera.width,
            height: e.height / rect.height * camera.height
        });
    };
    var writePrimary = function (p) {
        Object.assign(pointer, {
            x: p.x,
            y: p.y,
            xui: p.xui,
            yui: p.yui,
            pressure: p.pressure,
            buttons: p.buttons,
            tiltX: p.tiltX,
            tiltY: p.tiltY,
            twist: p.twist
        });
    };

    var handleHoverStart = function (e) {
        window.focus();
        const p = copyPointer(e);
        pointer.hover.push(p);
        if (e.isPrimary) {
            writePrimary(p);
        }
    };
    var handleHoverEnd = function (e) {
        const p = pointer.hover.find(p => p.id === e.pointerId);
        if (p) {
            p.invalid = true;
            pointer.hover.splice(pointer.hover.indexOf(p), 1);
        }
        // Handles mouse pointers that were dragged out of the js frame while pressing,
        // as they don't trigger pointercancel or such
        const downId = pointer.down.findIndex(p => p.id === e.pointerId);
        if (downId !== -1) {
            pointer.down.splice(downId, 1);
        }
    };
    var handleMove = function (e) {
        if (settings.preventDefault) {
            e.preventDefault();
        }
        let pointerHover = pointer.hover.find(p => p.id === e.pointerId);
        if (!pointerHover) {
            // Catches hover events that started before the game has loaded
            handleHoverStart(e);
            pointerHover = pointer.hover.find(p => p.id === e.pointerId);
        }
        const pointerDown = pointer.down.find(p => p.id === e.pointerId);
        if (!pointerHover && !pointerDown) {
            return;
        }
        if (pointerHover) {
            updatePointer(pointerHover, e);
        }
        if (pointerDown) {
            updatePointer(pointerDown, e);
        }
        if (e.isPrimary) {
            writePrimary(pointerHover || pointerDown);
        }
    };
    var handleDown = function (e) {
        if (settings.preventDefault) {
            e.preventDefault();
        }
        pointer.type = e.pointerType;
        const p = copyPointer(e);
        pointer.down.push(p);
        countPointers();
        if (e.isPrimary) {
            writePrimary(p);
        }
    };
    var handleUp = function (e) {
        if (settings.preventDefault) {
            e.preventDefault();
        }
        const p = pointer.down.find(p => p.id === e.pointerId);
        if (p) {
            pointer.released.push(p);
        }
        if (pointer.down.indexOf(p) !== -1) {
            pointer.down.splice(pointer.down.indexOf(p), 1);
        }
        countPointers();
    };
    var handleWheel = function handleWheel(e) {
        setKey('Wheel', ((e.wheelDelta || -e.detail) < 0) ? -1 : 1);
        if (settings.preventDefault) {
            e.preventDefault();
        }
    };

    let locking = false;
    const genericCollisionCheck = function genericCollisionCheck(
        copy,
        specificPointer,
        set,
        uiSpace
    ) {
        if (locking) {
            return false;
        }
        for (const p of set) {
            if (specificPointer && p.id !== specificPointer.id) {
                continue;
            }
            if (place.collide(copy, {
                x: uiSpace ? p.xui : p.x,
                y: uiSpace ? p.yui : p.y,
                scale: {
                    x: 1,
                    y: 1
                },
                angle: 0,
                shape: {
                    type: 'rect',
                    top: p.height / 2,
                    bottom: p.height / 2,
                    left: p.width / 2,
                    right: p.width / 2
                }
            })) {
                return p;
            }
        }
        return false;
    };
    // Triggers on every mouse press event to capture pointer after it was released by a user,
    // e.g. after the window was blurred
    const pointerCapturer = function pointerCapturer() {
        if (!document.pointerLockElement && !document.mozPointerLockElement) {
            const request = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            request.apply(document.body);
        }
    };
    const capturedPointerMove = function capturedPointerMove(e) {
        const rect = pixiApp.view.getBoundingClientRect();
        const dx = e.movementX / rect.width * camera.width,
              dy = e.movementY / rect.height * camera.height;
        pointer.xlocked += dx;
        pointer.ylocked += dy;
        pointer.xmovement = dx;
        pointer.ymovement = dy;
    };

    const pointer = {
        setupListeners() {
            document.addEventListener('pointerenter', handleHoverStart, {
                capture: true
            });
            document.addEventListener('pointerout', handleHoverEnd, {
                capture: true
            });
            document.addEventListener('pointerleave', handleHoverEnd, {
                capture: true
            });
            document.addEventListener('pointerdown', handleDown, {
                capture: true
            });
            document.addEventListener('pointerup', handleUp, {
                capture: true
            });
            document.addEventListener('pointercancel', handleUp, {
                capture: true
            });
            document.addEventListener('pointermove', handleMove, {
                capture: true
            });
            document.addEventListener('wheel', handleWheel, {
                passive: false
            });
            document.addEventListener('DOMMouseScroll', handleWheel, {
                passive: false
            });
            document.addEventListener('contextmenu', e => {
                if (settings.preventDefault) {
                    e.preventDefault();
                }
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
            pointer.down.length = 0;
            pointer.hover.length = 0;
            pointer.clearReleased();
            countPointers();
        },
        clearReleased() {
            pointer.released.length = 0;
        },
        collides(copy, p, checkReleased) {
            var set = checkReleased ? pointer.released : pointer.down;
            return genericCollisionCheck(copy, p, set, false);
        },
        collidesUi(copy, p, checkReleased) {
            var set = checkReleased ? pointer.released : pointer.down;
            return genericCollisionCheck(copy, p, set, true);
        },
        hovers(copy, p) {
            return genericCollisionCheck(copy, p, pointer.hover, false);
        },
        hoversUi(copy, p) {
            return genericCollisionCheck(copy, p, pointer.hover, true);
        },
        isButtonPressed(button, p) {
            if (!p) {
                return Boolean(getKey(button));
            }
            // eslint-disable-next-line no-bitwise
            return (p.buttons & buttonMappings[button]) === button ? 1 : 0;
        },
        updateGestures() {
            let x = 0,
                y = 0;
            const rect = pixiApp.view.getBoundingClientRect();
            // Get the middle point of all the pointers
            for (const event of pointer.down) {
                x += (event.clientX - rect.left) / rect.width;
                y += (event.clientY - rect.top) / rect.height;
            }
            x /= pointer.down.length;
            y /= pointer.down.length;

            let angle = 0,
                distance = lastScaleDistance;
            if (pointer.down.length > 1) {
                const events = [
                    pointer.down[0],
                    pointer.down[1]
                ].sort((a, b) => a.id - b.id);
                angle = u.pdn(
                    events[0].x,
                    events[0].y,
                    events[1].x,
                    events[1].y
                );
                distance = u.pdc(
                    events[0].x,
                    events[0].y,
                    events[1].x,
                    events[1].y
                );
            }
            if (lastPanNum === pointer.down.length) {
                if (pointer.down.length > 1) {
                    setKey('DeltaRotation', (u.degToRad(u.deltaDir(lastAngle, angle))));
                    setKey('DeltaPinch', distance / lastScaleDistance - 1);
                } else {
                    setKey('DeltaPinch', 0);
                    setKey('DeltaRotation', 0);
                }
                if (!pointer.down.length) {
                    setKey('PanX', 0);
                    setKey('PanY', 0);
                } else {
                    setKey('PanX', x - lastPanX);
                    setKey('PanY', y - lastPanY);
                }
            } else {
                // skip gesture updates to avoid shaking on new presses
                lastPanNum = pointer.down.length;
                setKey('DeltaPinch', 0);
                setKey('DeltaRotation', 0);
                setKey('PanX', 0);
                setKey('PanY', 0);
            }
            lastPanX = x;
            lastPanY = y;
            lastAngle = angle;
            lastScaleDistance = distance;

            for (const button in buttonMappings) {
                setKey(button, 0);
                for (const p of pointer.down) {
                    // eslint-disable-next-line no-bitwise
                    if ((p.buttons & buttonMappings[button]) === buttonMappings[button]) {
                        setKey(button, 1);
                    }
                }
            }
        },
        lock() {
            if (locking) {
                return;
            }
            locking = true;
            pointer.xlocked = pointer.xui;
            pointer.ylocked = pointer.yui;
            const request = document.body.requestPointerLock || document.body.mozRequestPointerLock;
            request.apply(document.body);
            document.addEventListener('click', pointerCapturer, {
                capture: true
            });
            document.addEventListener('pointermove', capturedPointerMove, {
                capture: true
            });
        },
        unlock() {
            if (!locking) {
                return;
            }
            locking = false;
            if (document.pointerLockElement || document.mozPointerLockElement) {
                (document.exitPointerLock || document.mozExitPointerLock)();
            }
            document.removeEventListener('click', pointerCapturer);
            document.removeEventListener('pointermove', capturedPointerMove);
        },
        get locked() {
            // Do not return the Document object
            return Boolean(document.pointerLockElement || document.mozPointerLockElement);
        }
    };
    setKey('Wheel', 0);
    if ([false][0]) {
        pointer.lock();
    }

    window.pointer = pointer;
    return pointer;
})();

const keyboard = (function ctKeyboard() {
    var keyPrefix = 'keyboard.';
    var setKey = function (key, value) {
        inputs.registry[keyPrefix + key] = value;
    };

    const keyboard = {
        string: '',
        lastKey: '',
        lastCode: '',
        alt: false,
        shift: false,
        ctrl: false,
        clear() {
            delete keyboard.lastKey;
            delete keyboard.lastCode;
            keyboard.string = '';
            keyboard.alt = false;
            keyboard.shift = false;
            keyboard.ctrl = false;
        },
        check: [],
        onDown(e) {
            keyboard.shift = e.shiftKey;
            keyboard.alt = e.altKey;
            keyboard.ctrl = e.ctrlKey;
            keyboard.lastKey = e.key;
            keyboard.lastCode = e.code;
            if (e.code) {
                setKey(e.code, 1);
            } else {
                setKey('Unknown', 1);
            }
            if (e.key) {
                if (e.key.length === 1) {
                    keyboard.string += e.key;
                } else if (e.key === 'Backspace') {
                    keyboard.string = keyboard.string.slice(0, -1);
                } else if (e.key === 'Enter') {
                    keyboard.string = '';
                }
            }
            if (settings.preventDefault) {
                e.preventDefault();
            }
        },
        onUp(e) {
            keyboard.shift = e.shiftKey;
            keyboard.alt = e.altKey;
            keyboard.ctrl = e.ctrlKey;
            if (e.code) {
                setKey(e.code, 0);
            } else {
                setKey('Unknown', 0);
            }
            if (settings.preventDefault) {
                e.preventDefault();
            }
        }
    };

    if (document.addEventListener) {
        document.addEventListener('keydown', keyboard.onDown, false);
        document.addEventListener('keyup', keyboard.onUp, false);
    } else {
        document.attachEvent('onkeydown', keyboard.onDown);
        document.attachEvent('onkeyup', keyboard.onUp);
    }

    window.keyboard = keyboard;
    return keyboard;
})();

(function(global) {
    'use strict';
  
    var nativeKeyboardEvent = ('KeyboardEvent' in global);
    if (!nativeKeyboardEvent)
      global.KeyboardEvent = function KeyboardEvent() { throw TypeError('Illegal constructor'); };
  
    [
      ['DOM_KEY_LOCATION_STANDARD', 0x00], // Default or unknown location
      ['DOM_KEY_LOCATION_LEFT', 0x01], // e.g. Left Alt key
      ['DOM_KEY_LOCATION_RIGHT', 0x02], // e.g. Right Alt key
      ['DOM_KEY_LOCATION_NUMPAD', 0x03], // e.g. Numpad 0 or +
    ].forEach(function(p) { if (!(p[0] in global.KeyboardEvent)) global.KeyboardEvent[p[0]] = p[1]; });
  
    var STANDARD = global.KeyboardEvent.DOM_KEY_LOCATION_STANDARD,
        LEFT = global.KeyboardEvent.DOM_KEY_LOCATION_LEFT,
        RIGHT = global.KeyboardEvent.DOM_KEY_LOCATION_RIGHT,
        NUMPAD = global.KeyboardEvent.DOM_KEY_LOCATION_NUMPAD;
  
    //--------------------------------------------------------------------
    //
    // Utilities
    //
    //--------------------------------------------------------------------
  
    function contains(s, ss) { return String(s).indexOf(ss) !== -1; }
  
    var os = (function() {
      if (contains(navigator.platform, 'Win')) { return 'win'; }
      if (contains(navigator.platform, 'Mac')) { return 'mac'; }
      if (contains(navigator.platform, 'CrOS')) { return 'cros'; }
      if (contains(navigator.platform, 'Linux')) { return 'linux'; }
      if (contains(navigator.userAgent, 'iPad') || contains(navigator.platform, 'iPod') || contains(navigator.platform, 'iPhone')) { return 'ios'; }
      return '';
    } ());
  
    var browser = (function() {
      if (contains(navigator.userAgent, 'Chrome/')) { return 'chrome'; }
      if (contains(navigator.vendor, 'Apple')) { return 'safari'; }
      if (contains(navigator.userAgent, 'MSIE')) { return 'ie'; }
      if (contains(navigator.userAgent, 'Gecko/')) { return 'moz'; }
      if (contains(navigator.userAgent, 'Opera/')) { return 'opera'; }
      return '';
    } ());
  
    var browser_os = browser + '-' + os;
  
    function mergeIf(baseTable, select, table) {
      if (browser_os === select || browser === select || os === select) {
        Object.keys(table).forEach(function(keyCode) {
          baseTable[keyCode] = table[keyCode];
        });
      }
    }
  
    function remap(o, key) {
      var r = {};
      Object.keys(o).forEach(function(k) {
        var item = o[k];
        if (key in item) {
          r[item[key]] = item;
        }
      });
      return r;
    }
  
    function invert(o) {
      var r = {};
      Object.keys(o).forEach(function(k) {
        r[o[k]] = k;
      });
      return r;
    }
  
    //--------------------------------------------------------------------
    //
    // Generic Mappings
    //
    //--------------------------------------------------------------------
  
    // "keyInfo" is a dictionary:
    //   code: string - name from UI Events KeyboardEvent code Values
    //     https://w3c.github.io/uievents-code/
    //   location (optional): number - one of the DOM_KEY_LOCATION values
    //   keyCap (optional): string - keyboard label in en-US locale
    // USB code Usage ID from page 0x07 unless otherwise noted (Informative)
  
    // Map of keyCode to keyInfo
    var keyCodeToInfoTable = {
      // 0x01 - VK_LBUTTON
      // 0x02 - VK_RBUTTON
      0x03: { code: 'Cancel' }, // [USB: 0x9b] char \x0018 ??? (Not in D3E)
      // 0x04 - VK_MBUTTON
      // 0x05 - VK_XBUTTON1
      // 0x06 - VK_XBUTTON2
      0x06: { code: 'Help' }, // [USB: 0x75] ???
      // 0x07 - undefined
      0x08: { code: 'Backspace' }, // [USB: 0x2a] Labelled Delete on Macintosh keyboards.
      0x09: { code: 'Tab' }, // [USB: 0x2b]
      // 0x0A-0x0B - reserved
      0X0C: { code: 'Clear' }, // [USB: 0x9c] NumPad Center (Not in D3E)
      0X0D: { code: 'Enter' }, // [USB: 0x28]
      // 0x0E-0x0F - undefined
  
      0x10: { code: 'Shift' },
      0x11: { code: 'Control' },
      0x12: { code: 'Alt' },
      0x13: { code: 'Pause' }, // [USB: 0x48]
      0x14: { code: 'CapsLock' }, // [USB: 0x39]
      0x15: { code: 'KanaMode' }, // [USB: 0x88]
      0x16: { code: 'Lang1' }, // [USB: 0x90]
      // 0x17: VK_JUNJA
      // 0x18: VK_FINAL
      0x19: { code: 'Lang2' }, // [USB: 0x91]
      // 0x1A - undefined
      0x1B: { code: 'Escape' }, // [USB: 0x29]
      0x1C: { code: 'Convert' }, // [USB: 0x8a]
      0x1D: { code: 'NonConvert' }, // [USB: 0x8b]
      0x1E: { code: 'Accept' }, // [USB: ????]
      0x1F: { code: 'ModeChange' }, // [USB: ????]
  
      0x20: { code: 'Space' }, // [USB: 0x2c]
      0x21: { code: 'PageUp' }, // [USB: 0x4b]
      0x22: { code: 'PageDown' }, // [USB: 0x4e]
      0x23: { code: 'End' }, // [USB: 0x4d]
      0x24: { code: 'Home' }, // [USB: 0x4a]
      0x25: { code: 'ArrowLeft' }, // [USB: 0x50]
      0x26: { code: 'ArrowUp' }, // [USB: 0x52]
      0x27: { code: 'ArrowRight' }, // [USB: 0x4f]
      0x28: { code: 'ArrowDown' }, // [USB: 0x51]
      0x29: { code: 'Select' }, // (Not in D3E)
      0x2A: { code: 'Print' }, // (Not in D3E)
      0x2B: { code: 'Execute' }, // [USB: 0x74] (Not in D3E)
      0x2C: { code: 'PrintScreen' }, // [USB: 0x46]
      0x2D: { code: 'Insert' }, // [USB: 0x49]
      0x2E: { code: 'Delete' }, // [USB: 0x4c]
      0x2F: { code: 'Help' }, // [USB: 0x75] ???
  
      0x30: { code: 'Digit0', keyCap: '0' }, // [USB: 0x27] 0)
      0x31: { code: 'Digit1', keyCap: '1' }, // [USB: 0x1e] 1!
      0x32: { code: 'Digit2', keyCap: '2' }, // [USB: 0x1f] 2@
      0x33: { code: 'Digit3', keyCap: '3' }, // [USB: 0x20] 3#
      0x34: { code: 'Digit4', keyCap: '4' }, // [USB: 0x21] 4$
      0x35: { code: 'Digit5', keyCap: '5' }, // [USB: 0x22] 5%
      0x36: { code: 'Digit6', keyCap: '6' }, // [USB: 0x23] 6^
      0x37: { code: 'Digit7', keyCap: '7' }, // [USB: 0x24] 7&
      0x38: { code: 'Digit8', keyCap: '8' }, // [USB: 0x25] 8*
      0x39: { code: 'Digit9', keyCap: '9' }, // [USB: 0x26] 9(
      // 0x3A-0x40 - undefined
  
      0x41: { code: 'KeyA', keyCap: 'a' }, // [USB: 0x04]
      0x42: { code: 'KeyB', keyCap: 'b' }, // [USB: 0x05]
      0x43: { code: 'KeyC', keyCap: 'c' }, // [USB: 0x06]
      0x44: { code: 'KeyD', keyCap: 'd' }, // [USB: 0x07]
      0x45: { code: 'KeyE', keyCap: 'e' }, // [USB: 0x08]
      0x46: { code: 'KeyF', keyCap: 'f' }, // [USB: 0x09]
      0x47: { code: 'KeyG', keyCap: 'g' }, // [USB: 0x0a]
      0x48: { code: 'KeyH', keyCap: 'h' }, // [USB: 0x0b]
      0x49: { code: 'KeyI', keyCap: 'i' }, // [USB: 0x0c]
      0x4A: { code: 'KeyJ', keyCap: 'j' }, // [USB: 0x0d]
      0x4B: { code: 'KeyK', keyCap: 'k' }, // [USB: 0x0e]
      0x4C: { code: 'KeyL', keyCap: 'l' }, // [USB: 0x0f]
      0x4D: { code: 'KeyM', keyCap: 'm' }, // [USB: 0x10]
      0x4E: { code: 'KeyN', keyCap: 'n' }, // [USB: 0x11]
      0x4F: { code: 'KeyO', keyCap: 'o' }, // [USB: 0x12]
  
      0x50: { code: 'KeyP', keyCap: 'p' }, // [USB: 0x13]
      0x51: { code: 'KeyQ', keyCap: 'q' }, // [USB: 0x14]
      0x52: { code: 'KeyR', keyCap: 'r' }, // [USB: 0x15]
      0x53: { code: 'KeyS', keyCap: 's' }, // [USB: 0x16]
      0x54: { code: 'KeyT', keyCap: 't' }, // [USB: 0x17]
      0x55: { code: 'KeyU', keyCap: 'u' }, // [USB: 0x18]
      0x56: { code: 'KeyV', keyCap: 'v' }, // [USB: 0x19]
      0x57: { code: 'KeyW', keyCap: 'w' }, // [USB: 0x1a]
      0x58: { code: 'KeyX', keyCap: 'x' }, // [USB: 0x1b]
      0x59: { code: 'KeyY', keyCap: 'y' }, // [USB: 0x1c]
      0x5A: { code: 'KeyZ', keyCap: 'z' }, // [USB: 0x1d]
      0x5B: { code: 'MetaLeft', location: LEFT }, // [USB: 0xe3]
      0x5C: { code: 'MetaRight', location: RIGHT }, // [USB: 0xe7]
      0x5D: { code: 'ContextMenu' }, // [USB: 0x65] Context Menu
      // 0x5E - reserved
      0x5F: { code: 'Standby' }, // [USB: 0x82] Sleep
  
      0x60: { code: 'Numpad0', keyCap: '0', location: NUMPAD }, // [USB: 0x62]
      0x61: { code: 'Numpad1', keyCap: '1', location: NUMPAD }, // [USB: 0x59]
      0x62: { code: 'Numpad2', keyCap: '2', location: NUMPAD }, // [USB: 0x5a]
      0x63: { code: 'Numpad3', keyCap: '3', location: NUMPAD }, // [USB: 0x5b]
      0x64: { code: 'Numpad4', keyCap: '4', location: NUMPAD }, // [USB: 0x5c]
      0x65: { code: 'Numpad5', keyCap: '5', location: NUMPAD }, // [USB: 0x5d]
      0x66: { code: 'Numpad6', keyCap: '6', location: NUMPAD }, // [USB: 0x5e]
      0x67: { code: 'Numpad7', keyCap: '7', location: NUMPAD }, // [USB: 0x5f]
      0x68: { code: 'Numpad8', keyCap: '8', location: NUMPAD }, // [USB: 0x60]
      0x69: { code: 'Numpad9', keyCap: '9', location: NUMPAD }, // [USB: 0x61]
      0x6A: { code: 'NumpadMultiply', keyCap: '*', location: NUMPAD }, // [USB: 0x55]
      0x6B: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
      0x6C: { code: 'NumpadComma', keyCap: ',', location: NUMPAD }, // [USB: 0x85]
      0x6D: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD }, // [USB: 0x56]
      0x6E: { code: 'NumpadDecimal', keyCap: '.', location: NUMPAD }, // [USB: 0x63]
      0x6F: { code: 'NumpadDivide', keyCap: '/', location: NUMPAD }, // [USB: 0x54]
  
      0x70: { code: 'F1' }, // [USB: 0x3a]
      0x71: { code: 'F2' }, // [USB: 0x3b]
      0x72: { code: 'F3' }, // [USB: 0x3c]
      0x73: { code: 'F4' }, // [USB: 0x3d]
      0x74: { code: 'F5' }, // [USB: 0x3e]
      0x75: { code: 'F6' }, // [USB: 0x3f]
      0x76: { code: 'F7' }, // [USB: 0x40]
      0x77: { code: 'F8' }, // [USB: 0x41]
      0x78: { code: 'F9' }, // [USB: 0x42]
      0x79: { code: 'F10' }, // [USB: 0x43]
      0x7A: { code: 'F11' }, // [USB: 0x44]
      0x7B: { code: 'F12' }, // [USB: 0x45]
      0x7C: { code: 'F13' }, // [USB: 0x68]
      0x7D: { code: 'F14' }, // [USB: 0x69]
      0x7E: { code: 'F15' }, // [USB: 0x6a]
      0x7F: { code: 'F16' }, // [USB: 0x6b]
  
      0x80: { code: 'F17' }, // [USB: 0x6c]
      0x81: { code: 'F18' }, // [USB: 0x6d]
      0x82: { code: 'F19' }, // [USB: 0x6e]
      0x83: { code: 'F20' }, // [USB: 0x6f]
      0x84: { code: 'F21' }, // [USB: 0x70]
      0x85: { code: 'F22' }, // [USB: 0x71]
      0x86: { code: 'F23' }, // [USB: 0x72]
      0x87: { code: 'F24' }, // [USB: 0x73]
      // 0x88-0x8F - unassigned
  
      0x90: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
      0x91: { code: 'ScrollLock' }, // [USB: 0x47]
      // 0x92-0x96 - OEM specific
      // 0x97-0x9F - unassigned
  
      // NOTE: 0xA0-0xA5 usually mapped to 0x10-0x12 in browsers
      0xA0: { code: 'ShiftLeft', location: LEFT }, // [USB: 0xe1]
      0xA1: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
      0xA2: { code: 'ControlLeft', location: LEFT }, // [USB: 0xe0]
      0xA3: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
      0xA4: { code: 'AltLeft', location: LEFT }, // [USB: 0xe2]
      0xA5: { code: 'AltRight', location: RIGHT }, // [USB: 0xe6]
  
      0xA6: { code: 'BrowserBack' }, // [USB: 0x0c/0x0224]
      0xA7: { code: 'BrowserForward' }, // [USB: 0x0c/0x0225]
      0xA8: { code: 'BrowserRefresh' }, // [USB: 0x0c/0x0227]
      0xA9: { code: 'BrowserStop' }, // [USB: 0x0c/0x0226]
      0xAA: { code: 'BrowserSearch' }, // [USB: 0x0c/0x0221]
      0xAB: { code: 'BrowserFavorites' }, // [USB: 0x0c/0x0228]
      0xAC: { code: 'BrowserHome' }, // [USB: 0x0c/0x0222]
      0xAD: { code: 'AudioVolumeMute' }, // [USB: 0x7f]
      0xAE: { code: 'AudioVolumeDown' }, // [USB: 0x81]
      0xAF: { code: 'AudioVolumeUp' }, // [USB: 0x80]
  
      0xB0: { code: 'MediaTrackNext' }, // [USB: 0x0c/0x00b5]
      0xB1: { code: 'MediaTrackPrevious' }, // [USB: 0x0c/0x00b6]
      0xB2: { code: 'MediaStop' }, // [USB: 0x0c/0x00b7]
      0xB3: { code: 'MediaPlayPause' }, // [USB: 0x0c/0x00cd]
      0xB4: { code: 'LaunchMail' }, // [USB: 0x0c/0x018a]
      0xB5: { code: 'MediaSelect' },
      0xB6: { code: 'LaunchApp1' },
      0xB7: { code: 'LaunchApp2' },
      // 0xB8-0xB9 - reserved
      0xBA: { code: 'Semicolon',  keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
      0xBB: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
      0xBC: { code: 'Comma', keyCap: ',' }, // [USB: 0x36] ,<
      0xBD: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
      0xBE: { code: 'Period', keyCap: '.' }, // [USB: 0x37] .>
      0xBF: { code: 'Slash', keyCap: '/' }, // [USB: 0x38] /? (US Standard 101)
  
      0xC0: { code: 'Backquote', keyCap: '`' }, // [USB: 0x35] `~ (US Standard 101)
      // 0xC1-0xCF - reserved
  
      // 0xD0-0xD7 - reserved
      // 0xD8-0xDA - unassigned
      0xDB: { code: 'BracketLeft', keyCap: '[' }, // [USB: 0x2f] [{ (US Standard 101)
      0xDC: { code: 'Backslash',  keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
      0xDD: { code: 'BracketRight', keyCap: ']' }, // [USB: 0x30] ]} (US Standard 101)
      0xDE: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
      // 0xDF - miscellaneous/varies
  
      // 0xE0 - reserved
      // 0xE1 - OEM specific
      0xE2: { code: 'IntlBackslash',  keyCap: '\\' }, // [USB: 0x64] \| (UK Standard 102)
      // 0xE3-0xE4 - OEM specific
      0xE5: { code: 'Process' }, // (Not in D3E)
      // 0xE6 - OEM specific
      // 0xE7 - VK_PACKET
      // 0xE8 - unassigned
      // 0xE9-0xEF - OEM specific
  
      // 0xF0-0xF5 - OEM specific
      0xF6: { code: 'Attn' }, // [USB: 0x9a] (Not in D3E)
      0xF7: { code: 'CrSel' }, // [USB: 0xa3] (Not in D3E)
      0xF8: { code: 'ExSel' }, // [USB: 0xa4] (Not in D3E)
      0xF9: { code: 'EraseEof' }, // (Not in D3E)
      0xFA: { code: 'Play' }, // (Not in D3E)
      0xFB: { code: 'ZoomToggle' }, // (Not in D3E)
      // 0xFC - VK_NONAME - reserved
      // 0xFD - VK_PA1
      0xFE: { code: 'Clear' } // [USB: 0x9c] (Not in D3E)
    };
  
    // No legacy keyCode, but listed in D3E:
  
    // code: usb
    // 'IntlHash': 0x070032,
    // 'IntlRo': 0x070087,
    // 'IntlYen': 0x070089,
    // 'NumpadBackspace': 0x0700bb,
    // 'NumpadClear': 0x0700d8,
    // 'NumpadClearEntry': 0x0700d9,
    // 'NumpadMemoryAdd': 0x0700d3,
    // 'NumpadMemoryClear': 0x0700d2,
    // 'NumpadMemoryRecall': 0x0700d1,
    // 'NumpadMemoryStore': 0x0700d0,
    // 'NumpadMemorySubtract': 0x0700d4,
    // 'NumpadParenLeft': 0x0700b6,
    // 'NumpadParenRight': 0x0700b7,
  
    //--------------------------------------------------------------------
    //
    // Browser/OS Specific Mappings
    //
    //--------------------------------------------------------------------
  
    mergeIf(keyCodeToInfoTable,
            'moz', {
              0x3B: { code: 'Semicolon', keyCap: ';' }, // [USB: 0x33] ;: (US Standard 101)
              0x3D: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
              0x6B: { code: 'Equal', keyCap: '=' }, // [USB: 0x2e] =+
              0x6D: { code: 'Minus', keyCap: '-' }, // [USB: 0x2d] -_
              0xBB: { code: 'NumpadAdd', keyCap: '+', location: NUMPAD }, // [USB: 0x57]
              0xBD: { code: 'NumpadSubtract', keyCap: '-', location: NUMPAD } // [USB: 0x56]
            });
  
    mergeIf(keyCodeToInfoTable,
            'moz-mac', {
              0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
              0xAD: { code: 'Minus', keyCap: '-' } // [USB: 0x2d] -_
            });
  
    mergeIf(keyCodeToInfoTable,
            'moz-win', {
              0xAD: { code: 'Minus', keyCap: '-' } // [USB: 0x2d] -_
            });
  
    mergeIf(keyCodeToInfoTable,
            'chrome-mac', {
              0x5D: { code: 'MetaRight', location: RIGHT } // [USB: 0xe7]
            });
  
    // Windows via Bootcamp (!)
    if (0) {
      mergeIf(keyCodeToInfoTable,
              'chrome-win', {
                0xC0: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
                0xDE: { code: 'Backslash',  keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
                0xDF: { code: 'Backquote', keyCap: '`' } // [USB: 0x35] `~ (US Standard 101)
              });
  
      mergeIf(keyCodeToInfoTable,
              'ie', {
                0xC0: { code: 'Quote', keyCap: '\'' }, // [USB: 0x34] '" (US Standard 101)
                0xDE: { code: 'Backslash',  keyCap: '\\' }, // [USB: 0x31] \| (US Standard 101)
                0xDF: { code: 'Backquote', keyCap: '`' } // [USB: 0x35] `~ (US Standard 101)
              });
    }
  
    mergeIf(keyCodeToInfoTable,
            'safari', {
              0x03: { code: 'Enter' }, // [USB: 0x28] old Safari
              0x19: { code: 'Tab' } // [USB: 0x2b] old Safari for Shift+Tab
            });
  
    mergeIf(keyCodeToInfoTable,
            'ios', {
              0x0A: { code: 'Enter', location: STANDARD } // [USB: 0x28]
            });
  
    mergeIf(keyCodeToInfoTable,
            'safari-mac', {
              0x5B: { code: 'MetaLeft', location: LEFT }, // [USB: 0xe3]
              0x5D: { code: 'MetaRight', location: RIGHT }, // [USB: 0xe7]
              0xE5: { code: 'KeyQ', keyCap: 'Q' } // [USB: 0x14] On alternate presses, Ctrl+Q sends this
            });
  
    //--------------------------------------------------------------------
    //
    // Identifier Mappings
    //
    //--------------------------------------------------------------------
  
    // Cases where newer-ish browsers send keyIdentifier which can be
    // used to disambiguate keys.
  
    // keyIdentifierTable[keyIdentifier] -> keyInfo
  
    var keyIdentifierTable = {};
    if ('cros' === os) {
      keyIdentifierTable['U+00A0'] = { code: 'ShiftLeft', location: LEFT };
      keyIdentifierTable['U+00A1'] = { code: 'ShiftRight', location: RIGHT };
      keyIdentifierTable['U+00A2'] = { code: 'ControlLeft', location: LEFT };
      keyIdentifierTable['U+00A3'] = { code: 'ControlRight', location: RIGHT };
      keyIdentifierTable['U+00A4'] = { code: 'AltLeft', location: LEFT };
      keyIdentifierTable['U+00A5'] = { code: 'AltRight', location: RIGHT };
    }
    if ('chrome-mac' === browser_os) {
      keyIdentifierTable['U+0010'] = { code: 'ContextMenu' };
    }
    if ('safari-mac' === browser_os) {
      keyIdentifierTable['U+0010'] = { code: 'ContextMenu' };
    }
    if ('ios' === os) {
      // These only generate keyup events
      keyIdentifierTable['U+0010'] = { code: 'Function' };
  
      keyIdentifierTable['U+001C'] = { code: 'ArrowLeft' };
      keyIdentifierTable['U+001D'] = { code: 'ArrowRight' };
      keyIdentifierTable['U+001E'] = { code: 'ArrowUp' };
      keyIdentifierTable['U+001F'] = { code: 'ArrowDown' };
  
      keyIdentifierTable['U+0001'] = { code: 'Home' }; // [USB: 0x4a] Fn + ArrowLeft
      keyIdentifierTable['U+0004'] = { code: 'End' }; // [USB: 0x4d] Fn + ArrowRight
      keyIdentifierTable['U+000B'] = { code: 'PageUp' }; // [USB: 0x4b] Fn + ArrowUp
      keyIdentifierTable['U+000C'] = { code: 'PageDown' }; // [USB: 0x4e] Fn + ArrowDown
    }
  
    //--------------------------------------------------------------------
    //
    // Location Mappings
    //
    //--------------------------------------------------------------------
  
    // Cases where newer-ish browsers send location/keyLocation which
    // can be used to disambiguate keys.
  
    // locationTable[location][keyCode] -> keyInfo
    var locationTable = [];
    locationTable[LEFT] = {
      0x10: { code: 'ShiftLeft', location: LEFT }, // [USB: 0xe1]
      0x11: { code: 'ControlLeft', location: LEFT }, // [USB: 0xe0]
      0x12: { code: 'AltLeft', location: LEFT } // [USB: 0xe2]
    };
    locationTable[RIGHT] = {
      0x10: { code: 'ShiftRight', location: RIGHT }, // [USB: 0xe5]
      0x11: { code: 'ControlRight', location: RIGHT }, // [USB: 0xe4]
      0x12: { code: 'AltRight', location: RIGHT } // [USB: 0xe6]
    };
    locationTable[NUMPAD] = {
      0x0D: { code: 'NumpadEnter', location: NUMPAD } // [USB: 0x58]
    };
  
    mergeIf(locationTable[NUMPAD], 'moz', {
      0x6D: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
      0x6B: { code: 'NumpadAdd', location: NUMPAD } // [USB: 0x57]
    });
    mergeIf(locationTable[LEFT], 'moz-mac', {
      0xE0: { code: 'MetaLeft', location: LEFT } // [USB: 0xe3]
    });
    mergeIf(locationTable[RIGHT], 'moz-mac', {
      0xE0: { code: 'MetaRight', location: RIGHT } // [USB: 0xe7]
    });
    mergeIf(locationTable[RIGHT], 'moz-win', {
      0x5B: { code: 'MetaRight', location: RIGHT } // [USB: 0xe7]
    });
  
  
    mergeIf(locationTable[RIGHT], 'mac', {
      0x5D: { code: 'MetaRight', location: RIGHT } // [USB: 0xe7]
    });
  
    mergeIf(locationTable[NUMPAD], 'chrome-mac', {
      0x0C: { code: 'NumLock', location: NUMPAD } // [USB: 0x53]
    });
  
    mergeIf(locationTable[NUMPAD], 'safari-mac', {
      0x0C: { code: 'NumLock', location: NUMPAD }, // [USB: 0x53]
      0xBB: { code: 'NumpadAdd', location: NUMPAD }, // [USB: 0x57]
      0xBD: { code: 'NumpadSubtract', location: NUMPAD }, // [USB: 0x56]
      0xBE: { code: 'NumpadDecimal', location: NUMPAD }, // [USB: 0x63]
      0xBF: { code: 'NumpadDivide', location: NUMPAD } // [USB: 0x54]
    });
  
  
    //--------------------------------------------------------------------
    //
    // Key Values
    //
    //--------------------------------------------------------------------
  
    // Mapping from `code` values to `key` values. Values defined at:
    // https://w3c.github.io/uievents-key/
    // Entries are only provided when `key` differs from `code`. If
    // printable, `shiftKey` has the shifted printable character. This
    // assumes US Standard 101 layout
  
    var codeToKeyTable = {
      // Modifier Keys
      ShiftLeft: { key: 'Shift' },
      ShiftRight: { key: 'Shift' },
      ControlLeft: { key: 'Control' },
      ControlRight: { key: 'Control' },
      AltLeft: { key: 'Alt' },
      AltRight: { key: 'Alt' },
      MetaLeft: { key: 'Meta' },
      MetaRight: { key: 'Meta' },
  
      // Whitespace Keys
      NumpadEnter: { key: 'Enter' },
      Space: { key: ' ' },
  
      // Printable Keys
      Digit0: { key: '0', shiftKey: ')' },
      Digit1: { key: '1', shiftKey: '!' },
      Digit2: { key: '2', shiftKey: '@' },
      Digit3: { key: '3', shiftKey: '#' },
      Digit4: { key: '4', shiftKey: '$' },
      Digit5: { key: '5', shiftKey: '%' },
      Digit6: { key: '6', shiftKey: '^' },
      Digit7: { key: '7', shiftKey: '&' },
      Digit8: { key: '8', shiftKey: '*' },
      Digit9: { key: '9', shiftKey: '(' },
      KeyA: { key: 'a', shiftKey: 'A' },
      KeyB: { key: 'b', shiftKey: 'B' },
      KeyC: { key: 'c', shiftKey: 'C' },
      KeyD: { key: 'd', shiftKey: 'D' },
      KeyE: { key: 'e', shiftKey: 'E' },
      KeyF: { key: 'f', shiftKey: 'F' },
      KeyG: { key: 'g', shiftKey: 'G' },
      KeyH: { key: 'h', shiftKey: 'H' },
      KeyI: { key: 'i', shiftKey: 'I' },
      KeyJ: { key: 'j', shiftKey: 'J' },
      KeyK: { key: 'k', shiftKey: 'K' },
      KeyL: { key: 'l', shiftKey: 'L' },
      KeyM: { key: 'm', shiftKey: 'M' },
      KeyN: { key: 'n', shiftKey: 'N' },
      KeyO: { key: 'o', shiftKey: 'O' },
      KeyP: { key: 'p', shiftKey: 'P' },
      KeyQ: { key: 'q', shiftKey: 'Q' },
      KeyR: { key: 'r', shiftKey: 'R' },
      KeyS: { key: 's', shiftKey: 'S' },
      KeyT: { key: 't', shiftKey: 'T' },
      KeyU: { key: 'u', shiftKey: 'U' },
      KeyV: { key: 'v', shiftKey: 'V' },
      KeyW: { key: 'w', shiftKey: 'W' },
      KeyX: { key: 'x', shiftKey: 'X' },
      KeyY: { key: 'y', shiftKey: 'Y' },
      KeyZ: { key: 'z', shiftKey: 'Z' },
      Numpad0: { key: '0' },
      Numpad1: { key: '1' },
      Numpad2: { key: '2' },
      Numpad3: { key: '3' },
      Numpad4: { key: '4' },
      Numpad5: { key: '5' },
      Numpad6: { key: '6' },
      Numpad7: { key: '7' },
      Numpad8: { key: '8' },
      Numpad9: { key: '9' },
      NumpadMultiply: { key: '*' },
      NumpadAdd: { key: '+' },
      NumpadComma: { key: ',' },
      NumpadSubtract: { key: '-' },
      NumpadDecimal: { key: '.' },
      NumpadDivide: { key: '/' },
      Semicolon: { key: ';', shiftKey: ':' },
      Equal: { key: '=', shiftKey: '+' },
      Comma: { key: ',', shiftKey: '<' },
      Minus: { key: '-', shiftKey: '_' },
      Period: { key: '.', shiftKey: '>' },
      Slash: { key: '/', shiftKey: '?' },
      Backquote: { key: '`', shiftKey: '~' },
      BracketLeft: { key: '[', shiftKey: '{' },
      Backslash: { key: '\\', shiftKey: '|' },
      BracketRight: { key: ']', shiftKey: '}' },
      Quote: { key: '\'', shiftKey: '"' },
      IntlBackslash: { key: '\\', shiftKey: '|' }
    };
  
    mergeIf(codeToKeyTable, 'mac', {
      MetaLeft: { key: 'Meta' },
      MetaRight: { key: 'Meta' }
    });
  
    // Corrections for 'key' names in older browsers (e.g. FF36-, IE9, etc)
    // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.key#Key_values
    var keyFixTable = {
      Add: '+',
      Decimal: '.',
      Divide: '/',
      Subtract: '-',
      Multiply: '*',
      Spacebar: ' ',
      Esc: 'Escape',
      Nonconvert: 'NonConvert',
      Left: 'ArrowLeft',
      Up: 'ArrowUp',
      Right: 'ArrowRight',
      Down: 'ArrowDown',
      Del: 'Delete',
      Menu: 'ContextMenu',
      MediaNextTrack: 'MediaTrackNext',
      MediaPreviousTrack: 'MediaTrackPrevious',
      SelectMedia: 'MediaSelect',
      HalfWidth: 'Hankaku',
      FullWidth: 'Zenkaku',
      RomanCharacters: 'Romaji',
      Crsel: 'CrSel',
      Exsel: 'ExSel',
      Zoom: 'ZoomToggle'
    };
  
    //--------------------------------------------------------------------
    //
    // Exported Functions
    //
    //--------------------------------------------------------------------
  
  
    var codeTable = remap(keyCodeToInfoTable, 'code');
  
    try {
      var nativeLocation = nativeKeyboardEvent && ('location' in new KeyboardEvent(''));
    } catch (_) {}
  
    function keyInfoForEvent(event) {
      var keyCode = 'keyCode' in event ? event.keyCode : 'which' in event ? event.which : 0;
      var keyInfo = (function(){
        if (nativeLocation || 'keyLocation' in event) {
          var location = nativeLocation ? event.location : event.keyLocation;
          if (location && keyCode in locationTable[location]) {
            return locationTable[location][keyCode];
          }
        }
        if ('keyIdentifier' in event && event.keyIdentifier in keyIdentifierTable) {
          return keyIdentifierTable[event.keyIdentifier];
        }
        if (keyCode in keyCodeToInfoTable) {
          return keyCodeToInfoTable[keyCode];
        }
        return null;
      }());
  
      // TODO: Track these down and move to general tables
      if (0) {
        // TODO: Map these for newerish browsers?
        // TODO: iOS only?
        // TODO: Override with more common keyIdentifier name?
        switch (event.keyIdentifier) {
        case 'U+0010': keyInfo = { code: 'Function' }; break;
        case 'U+001C': keyInfo = { code: 'ArrowLeft' }; break;
        case 'U+001D': keyInfo = { code: 'ArrowRight' }; break;
        case 'U+001E': keyInfo = { code: 'ArrowUp' }; break;
        case 'U+001F': keyInfo = { code: 'ArrowDown' }; break;
        }
      }
  
      if (!keyInfo)
        return null;
  
      var key = (function() {
        var entry = codeToKeyTable[keyInfo.code];
        if (!entry) return keyInfo.code;
        return (event.shiftKey && 'shiftKey' in entry) ? entry.shiftKey : entry.key;
      }());
  
      return {
        code: keyInfo.code,
        key: key,
        location: keyInfo.location,
        keyCap: keyInfo.keyCap
      };
    }
  
    function queryKeyCap(code, locale) {
      code = String(code);
      if (!codeTable.hasOwnProperty(code)) return 'Undefined';
      if (locale && String(locale).toLowerCase() !== 'en-us') throw Error('Unsupported locale');
      var keyInfo = codeTable[code];
      return keyInfo.keyCap || keyInfo.code || 'Undefined';
    }
  
    if ('KeyboardEvent' in global && 'defineProperty' in Object) {
      (function() {
        function define(o, p, v) {
          if (p in o) return;
          Object.defineProperty(o, p, v);
        }
  
        define(KeyboardEvent.prototype, 'code', { get: function() {
          var keyInfo = keyInfoForEvent(this);
          return keyInfo ? keyInfo.code : '';
        }});
  
        // Fix for nonstandard `key` values (FF36-)
        if ('key' in KeyboardEvent.prototype) {
          var desc = Object.getOwnPropertyDescriptor(KeyboardEvent.prototype, 'key');
          Object.defineProperty(KeyboardEvent.prototype, 'key', { get: function() {
            var key = desc.get.call(this);
            return keyFixTable.hasOwnProperty(key) ? keyFixTable[key] : key;
          }});
        }
  
        define(KeyboardEvent.prototype, 'key', { get: function() {
          var keyInfo = keyInfoForEvent(this);
          return (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
        }});
  
        define(KeyboardEvent.prototype, 'location', { get: function() {
          var keyInfo = keyInfoForEvent(this);
          return (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
        }});
  
        define(KeyboardEvent.prototype, 'locale', { get: function() {
          return '';
        }});
      }());
    }
  
    if (!('queryKeyCap' in global.KeyboardEvent))
      global.KeyboardEvent.queryKeyCap = queryKeyCap;
  
    // Helper for IE8-
    global.identifyKey = function(event) {
      if ('code' in event)
        return;
  
      var keyInfo = keyInfoForEvent(event);
      event.code = keyInfo ? keyInfo.code : '';
      event.key = (keyInfo && 'key' in keyInfo) ? keyInfo.key : 'Unidentified';
      event.location = ('location' in event) ? event.location :
        ('keyLocation' in event) ? event.keyLocation :
        (keyInfo && 'location' in keyInfo) ? keyInfo.location : STANDARD;
      event.locale = '';
    };
  
  }(self));
  
/* eslint-disable no-nested-ternary */
/* global CtTimer */
{
    const tween = {
    /**
     * Creates a new tween effect and adds it to the game loop
     *
     * @param {Object} options An object with options:
     * @param {Object|Copy} options.obj An object to animate. All objects are supported.
     * @param {Object} options.fields A map with pairs `fieldName: newValue`.
     * Values must be of numerical type.
     * @param {Function} options.curve An interpolating function. You can write your own,
     * or use default ones (see methods in `tween`). The default one is `tween.ease`.
     * @param {Number} options.duration The duration of easing, in milliseconds.
     * @param {Number} options.isUi If true, use `u.timeUi` instead of `u.time`.
     * The default is `false`.
     * @param {boolean} options.silent If true, will not throw errors if the animation
     * was interrupted.
     *
     * @returns {Promise} A promise which is resolved if the effect was fully played,
     * or rejected if it was interrupted manually by code, room switching or instance kill.
     * You can call a `stop()` method on this promise to interrupt it manually.
     */
        add(options) {
            const twoon = {
                obj: options.obj,
                fields: options.fields || {},
                curve: options.curve || tween.ease,
                duration: options.duration || 1000,
                timer: new CtTimer(options.duration, false, options.isUi || false)
            };
            const promise = new Promise((resolve, reject) => {
                twoon.resolve = resolve;
                twoon.reject = reject;
                twoon.starting = {};
                for (const field in twoon.fields) {
                    twoon.starting[field] = twoon.obj[field] || 0;
                }
                tween.tweens.push(twoon);
            });
            if (options.silent) {
                promise.catch(() => void 0);
                twoon.timer.catch(() => void 0);
            }
            promise.stop = function stop() {
                twoon.reject({
                    code: 0,
                    info: 'Stopped by game logic',
                    from: 'tween'
                });
            };
            return promise;
        },
    /**
     * Linear interpolation.
     * Here and below, these parameters are used:
     *
     * @param {Number} s Starting value
     * @param {Number} d The change of value to transition to, the Delta
     * @param {Number} a The current timing state, 0-1
     * @returns {Number} Interpolated value
     */
        linear(s, d, a) {
            return d * a + s;
        },
        ease(s, d, a) {
            a *= 2;
            if (a < 1) {
                return d / 2 * a * a + s;
            }
            a--;
            return -d / 2 * (a * (a - 2) - 1) + s;
        },
        easeInQuad(s, d, a) {
            return d * a * a + s;
        },
        easeOutQuad(s, d, a) {
            return -d * a * (a - 2) + s;
        },
        easeInCubic(s, d, a) {
            return d * a * a * a + s;
        },
        easeOutCubic(s, d, a) {
            a--;
            return d * (a * a * a + 1) + s;
        },
        easeInOutCubic(s, d, a) {
            a *= 2;
            if (a < 1) {
                return d / 2 * a * a * a + s;
            }
            a -= 2;
            return d / 2 * (a * a * a + 2) + s;
        },
        easeInOutQuart(s, d, a) {
            a *= 2;
            if (a < 1) {
                return d / 2 * a * a * a * a + s;
            }
            a -= 2;
            return -d / 2 * (a * a * a * a - 2) + s;
        },
        easeInQuart(s, d, a) {
            return d * a * a * a * a + s;
        },
        easeOutQuart(s, d, a) {
            a--;
            return -d * (a * a * a * a - 1) + s;
        },
        easeInCirc(s, d, a) {
            return -d * (Math.sqrt(1 - a * a) - 1) + s;
        },
        easeOutCirc(s, d, a) {
            a--;
            return d * Math.sqrt(1 - a * a) + s;
        },
        easeInOutCirc(s, d, a) {
            a *= 2;
            if (a < 1) {
                return -d / 2 * (Math.sqrt(1 - a * a) - 1) + s;
            }
            a -= 2;
            return d / 2 * (Math.sqrt(1 - a * a) + 1) + s;
        },
        easeInBack(s, d, a) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const x = c3 * a * a * a - c1 * a * a;
            return d * x + s;
        },
        easeOutBack(s, d, a) {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            const x = 1 + c3 * (a - 1) ** 3 + c1 * (a - 1) ** 2;
            return d * x + s;
        },
        easeInOutBack(s, d, a) {
            const c1 = 1.70158;
            const c2 = c1 * 1.525;
            const x = a < 0.5 ?
                ((2 * a) ** 2 * ((c2 + 1) * 2 * a - c2)) / 2 :
                ((2 * a - 2) ** 2 * ((c2 + 1) * (a * 2 - 2) + c2) + 2) / 2;
            return d * x + s;
        },
        easeInElastic(s, d, a) {
            const c4 = (2 * Math.PI) / 3;
            const x = a === 0 ?
                0 :
                a === 1 ?
                    1 :
                    -(2 ** (10 * a - 10)) * Math.sin((a * 10 - 10.75) * c4);
            return d * x + s;
        },
        easeOutElastic(s, d, a) {
            const c4 = (2 * Math.PI) / 3;
            const x = a === 0 ?
                0 :
                a === 1 ?
                    1 :
                    2 ** (-10 * a) * Math.sin((a * 10 - 0.75) * c4) + 1;
            return d * x + s;
        },
        easeInOutElastic(s, d, a) {
            const c5 = (2 * Math.PI) / 4.5;
            const x = a === 0 ?
                0 :
                a === 1 ?
                    1 :
                    a < 0.5 ?
                        -(2 ** (20 * a - 10) * Math.sin((20 * a - 11.125) * c5)) / 2 :
                        (2 ** (-20 * a + 10) * Math.sin((20 * a - 11.125) * c5)) / 2 + 1;
            return d * x + s;
        },
        easeOutBounce(s, d, a) {
            const n1 = 7.5625;
            const d1 = 2.75;
            let x;
            if (a < 1 / d1) {
                x = n1 * a * a;
            } else if (a < 2 / d1) {
                x = n1 * (a -= 1.5 / d1) * a + 0.75;
            } else if (a < 2.5 / d1) {
                x = n1 * (a -= 2.25 / d1) * a + 0.9375;
            } else {
                x = n1 * (a -= 2.625 / d1) * a + 0.984375;
            }
            return d * x + s;
        },
        easeInBounce(s, d, a) {
            const n1 = 7.5625;
            const d1 = 2.75;
            let x;
            a = 1 - a;
            if (a < 1 / d1) {
                x = n1 * a * a;
            } else if (a < 2 / d1) {
                x = n1 * (a -= 1.5 / d1) * a + 0.75;
            } else if (a < 2.5 / d1) {
                x = n1 * (a -= 2.25 / d1) * a + 0.9375;
            } else {
                x = n1 * (a -= 2.625 / d1) * a + 0.984375;
            }
            return d * (1 - x) + s;
        },
        easeInOutBounce(s, d, a) {
            const n1 = 7.5625;
            const d1 = 2.75;
            let x, b;
            if (a < 0.5) {
                b = 1 - 2 * a;
            } else {
                b = 2 * a - 1;
            }
            if (b < 1 / d1) {
                x = n1 * b * b;
            } else if (b < 2 / d1) {
                x = n1 * (b -= 1.5 / d1) * b + 0.75;
            } else if (b < 2.5 / d1) {
                x = n1 * (b -= 2.25 / d1) * b + 0.9375;
            } else {
                x = n1 * (b -= 2.625 / d1) * b + 0.984375;
            }
            if (a < 0.5) {
                x = (1 - b) / 1;
            } else {
                x = (1 + b) / 1;
            }
            return d * x + s;
        },
        tweens: [],
        wait: u.wait
    };
    tween.easeInOutQuad = tween.ease;
    window.tween = tween;
}

window.matter = {
    on(event, callback) {
        Matter.Events.on(rooms.current.matterEngine, event, callback);
    },
    off(event, callback) {
        Matter.Events.off(rooms.current.matterEngine, event, callback);
    },

    teleport(copy, x, y) {
        Matter.Body.setPosition(copy.matterBody, {
            x,
            y
        });
        copy.x = x;
        copy.y = y;
    },
    push(copy, forceX, forceY, fromX, fromY) {
        if (fromX === void 0) {
            Matter.Body.applyForce(copy.matterBody, copy.matterBody.position, {
                x: forceX,
                y: forceY
            });
        } else {
            Matter.Body.applyForce(copy.matterBody, {
                x: fromX,
                y: fromY
            }, {
                x: forceX,
                y: forceY
            });
        }
    },
    spin(copy, speed) {
        Matter.Body.setAngularVelocity(copy.matterBody, u.degToRad(speed));
    },
    rotate(copy, angle) {
        Matter.Body.setAngle(copy.matterBody, u.degToRad(angle));
    },
    rotateBy(copy, angle) {
        Matter.Body.rotate(copy.matterBody, u.degToRad(angle));
    },
    scale(copy, x, y) {
        Matter.Body.scale(copy, x, y);
        copy.scale.x = x;
        copy.scale.y = y;
    },
    launch(copy, hspeed, vspeed) {
        Matter.Body.setVelocity(copy.matterBody, {
            x: hspeed,
            y: vspeed
        });
    },

    pin(copy) {
        const constraint = Matter.Constraint.create({
            bodyB: copy.matterBody,
            pointA: {
                x: copy.x,
                y: copy.y
            },
            length: 0
        });
        Matter.World.add(rooms.current.matterWorld, constraint);
        return constraint;
    },
    tie(copy, position, stiffness = 0.05, damping = 0.05) {
        const constraint = Matter.Constraint.create({
            bodyB: copy.matterBody,
            pointA: position,
            pointB: {
                x: 0,
                y: 0
            },
            stiffness,
            damping
        });
        Matter.World.add(rooms.current.matterWorld, constraint);
        return constraint;
    },
    rope(copy, length, stiffness = 0.05, damping = 0.05) {
        const constraint = Matter.Constraint.create({
            pointA: copy.position,
            bodyB: copy.matterBody,
            length,
            stiffness,
            damping
        });
        Matter.World.add(rooms.current.matterWorld, constraint);
        return constraint;
    },
    tieTogether(copy1, copy2, stiffness, damping) {
        const constraint = Matter.Constraint.create({
            bodyA: copy1.matterBody,
            bodyB: copy2.matterBody,
            stiffness,
            damping
        });
        Matter.World.add(rooms.current.matterWorld, constraint);
        return constraint;
    },
    onCreate(copy) {
        const options = {
            isStatic: copy.matterStatic,
            isSensor: copy.matterSensor,
            restitution: copy.matterRestitution || 0.1,
            friction: copy.matterFriction === void 0 ? 1 : copy.matterFriction,
            frictionStatic: copy.matterFrictionStatic === void 0 ? 0.1 : copy.matterFrictionStatic,
            frictionAir: copy.matterFrictionAir || 0.01,
            density: copy.matterDensity || 0.001
        };
        if (copy.shape.type === 'rect') {
            copy.matterBody = Matter.Bodies.rectangle(
                copy.x - copy.shape.left,
                copy.y - copy.shape.top,
                copy.shape.left + copy.shape.right,
                copy.shape.top + copy.shape.bottom,
                options
            );
        }
        if (copy.shape.type === 'circle') {
            copy.matterBody = Matter.Bodies.circle(
                copy.x,
                copy.y,
                copy.shape.r,
                options
            );
        }
        if (copy.shape.type === 'strip') {
            const vertices = Matter.Vertices.create(copy.shape.points);
            copy.matterBody = Matter.Bodies.fromVertices(copy.x, copy.y, vertices, options);
        }

        Matter.Body.setCentre(copy.matterBody, {
            x: (copy.texture.defaultAnchor.x - 0.5) * copy.texture.width,
            y: (copy.texture.defaultAnchor.y - 0.5) * copy.texture.height
        }, true);
        Matter.Body.setPosition(copy.matterBody, copy.position);
        Matter.Body.setAngle(copy.matterBody, u.degToRad(copy.angle));
        Matter.Body.scale(copy.matterBody, copy.scale.x, copy.scale.y);

        Matter.World.add(rooms.current.matterWorld, copy.matterBody);
        copy.matterBody.copy = copy;

        if (copy.matterFixPivot && copy.matterFixPivot[0]) {
            [copy.pivot.x] = copy.matterFixPivot;
        }
        if (copy.matterFixPivot && copy.matterFixPivot[1]) {
            [, copy.pivot.y] = copy.matterFixPivot;
        }

        if (copy.matterConstraint === 'pinpoint') {
            copy.constraint = window.matter.pin(copy);
        } else if (copy.matterConstraint === 'rope') {
            copy.constraint = window.matter.rope(
                copy,
                copy.matterRopeLength === 0 ? 64 : copy.matterRopeLength,
                copy.matterRopeStiffness === 0 ? 0.05 : copy.matterRopeStiffness,
                copy.matterRopeDamping === 0 ? 0.05 : copy.matterRopeDamping
            );
        }
    },
    createStaticTilemap(tilemap) {
        const options = {
            isStatic: true,
            isSensor: false,
            restitution: tilemap.matterRestitution || 0.1,
            friction: tilemap.matterFriction === void 0 ? 1 : tilemap.matterFriction
        };
        for (const tile of tilemap.tiles) {
            window.matter.createStaticTile(tile, options);
        }
    },
    createStaticTile(tile, options) {
        const {shape} = tile.sprite;
        if (shape.type === 'rect') {
            tile.matterBody = Matter.Bodies.rectangle(
                tile.x - shape.left,
                tile.y - shape.top,
                shape.left + shape.right,
                shape.top + shape.bottom,
                options
            );
        } else if (shape.type === 'circle') {
            tile.matterBody = Matter.Bodies.circle(
                tile.x,
                tile.y,
                shape.r,
                options
            );
        } else if (shape.type === 'strip') {
            const vertices = Matter.Vertices.create(shape.points);
            tile.matterBody = Matter.Bodies.fromVertices(tile.x, tile.y, vertices, options);
        }
        Matter.Body.setCentre(tile.matterBody, {
            x: (tile.sprite.texture.defaultAnchor.x - 0.5) * tile.sprite.texture.width,
            y: (tile.sprite.texture.defaultAnchor.y - 0.5) * tile.sprite.texture.height
        }, true);
        Matter.Body.setPosition(tile.matterBody, tile.sprite.position);
        Matter.World.add(rooms.current.matterWorld, tile.matterBody);
    },
    getImpact(pair) {
        const {bodyA, bodyB} = pair;
        if (bodyA.isSensor || bodyB.isSensor) {
            return 0;
        }
        // Because static objects are Infinity-ly heavy, and Infinity * 0 returns NaN,
        // We should compute mass for static objects manually.
        const massA = bodyA.mass === Infinity ? 0 : bodyA.mass,
              massB = bodyB.mass === Infinity ? 0 : bodyB.mass;
        const impact = /*(bodyA.mass + bodyB.mass) */ u.pdc(
            // This tells how much objects are moving in opposite directions
            bodyA.velocity.x * massA,
            bodyA.velocity.y * massA,
            bodyB.velocity.x * massB,
            bodyB.velocity.y * massB
        );
        return impact;
    },
    walkOverWithRulebook(rulebook, pairs) {
        if (!pairs.length || !rulebook.length) {
            return;
        }
        for (const pair of pairs) {
            const impact = window.matter.getImpact(pair);
            const bodies = [pair.bodyA, pair.bodyB];
            for (const body of bodies) {
                if (!body.copy) {
                    continue;
                }
                for (const rule of rulebook) {
                    if (body.copy.template === rule.mainTemplate) {
                        const otherBody = pair.bodyA === body ? pair.bodyB : pair.bodyA;
                        // eslint-disable-next-line max-depth
                        if (rule.any ||
                            (otherBody.copy && rule.otherTemplate === otherBody.copy.template)) {
                            rule.func.apply(body.copy, [otherBody.copy || otherBody.tile, impact]);
                        }
                    }
                }
            }
        }
    },
    rulebookStart: [],
    rulebookActive: [],
    rulebookEnd: []
};

  let selected = null;
let finished = 0;;
function SetData(copy, target, value)
{
    switch(target)
    {
        case 'Brain':
            copy.brain = value;
        break;
        case 'Digestion':
            copy.digestion = value;
        break;
        case 'Growth':
            copy.growth = value;
        break;
        case 'Immunity':
            copy.immunity = value;
        break;
        case 'Protection':
            copy.protection = value;
        break;
    }

    // if(value != null)
    //     CheckData(copy);
}

// function CheckData(copy)
// {
//     if(copy.brain != null && copy.digestion != null && copy.growth != null && copy.immunity != null && copy.protection != null)
//     {
//         console.log('Complete Sequence!');
//         copy.brain.kill = true;
//         copy.digestion.kill = true;
//         copy.growth.kill = true;
//         copy.immunity.kill = true;
//         copy.protection.kill = true;
//     }
// }

function GetOrb()
{
    let r = Math.random();
    let val = '';

    if(r > .3)
        val = r <= .65 ? 'HMO_' : 'BLactis_';
    else if(r > .15 && r <= .30)
        val = 'Protein_';
    else if(r <= .15)
        val = 'Sucrose_';

    return val;
};

  
  
})();
