/**
 * Shared lightweight sound effect engine for the game/ app.
 * Synthesizes short tones via Web Audio API instead of shipping audio
 * files, so there is no asset/licensing overhead for simple UI cues.
 */
(function () {
    'use strict';

    const STORAGE_KEY = 'ipse_game_muted';
    let ctx = null;
    let muted = localStorage.getItem(STORAGE_KEY) === '1';

    function getCtx() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return null;
        if (!ctx) ctx = new AudioContextClass();
        if (ctx.state === 'suspended') ctx.resume();
        return ctx;
    }

    // iOS/모바일은 사용자 제스처 없이는 오디오가 재생되지 않으므로
    // 첫 클릭/터치 시점에 미리 컨텍스트를 열어둔다.
    function unlock() {
        getCtx();
        window.removeEventListener('pointerdown', unlock);
        window.removeEventListener('keydown', unlock);
    }
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });

    function tone(c, freq, startTime, duration, opts) {
        opts = opts || {};
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = opts.type || 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        if (opts.slideTo) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(opts.slideTo, 1), startTime + duration);
        }
        const peak = opts.volume != null ? opts.volume : 0.2;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(peak, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        osc.connect(gain).connect(c.destination);
        osc.start(startTime);
        osc.stop(startTime + duration + 0.02);
    }

    const PRESETS = {
        click: (c, t0) => tone(c, 880, t0, 0.05, { type: 'square', volume: 0.12 }),
        reelStop: (c, t0, note) => tone(c, note || 440, t0, 0.09, { type: 'triangle', volume: 0.22 }),
        spinStart: (c, t0) => tone(c, 220, t0, 0.25, { type: 'sawtooth', slideTo: 660, volume: 0.15 }),
        winSmall: (c, t0) => {
            [523.25, 659.25, 783.99].forEach((f, i) => tone(c, f, t0 + i * 0.08, 0.18, { type: 'sine', volume: 0.2 }));
        },
        jackpot: (c, t0) => {
            [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => tone(c, f, t0 + i * 0.09, 0.3, { type: 'triangle', volume: 0.24 }));
        },
        lose: (c, t0) => tone(c, 180, t0, 0.35, { type: 'sawtooth', slideTo: 90, volume: 0.18 }),
        tap: (c, t0) => tone(c, 700, t0, 0.045, { type: 'square', volume: 0.1 }),
        success: (c, t0) => {
            [660, 880].forEach((f, i) => tone(c, f, t0 + i * 0.06, 0.12, { type: 'sine', volume: 0.18 }));
        },
        error: (c, t0) => tone(c, 220, t0, 0.14, { type: 'square', slideTo: 110, volume: 0.16 }),
        pop: (c, t0) => tone(c, 500, t0, 0.09, { type: 'sine', slideTo: 120, volume: 0.2 }),
    };

    // AudioContext가 아직 suspended 상태일 때 예약한 소리는, 이후 context가
    // running으로 전환돼도 재생되지 않고 그냥 버려지는 경우가 있다(특히 사용자
    // 제스처 직후 곧바로 스케줄한 소리). running 상태가 확정된 뒤에만 재생한다.
    function whenRunning(c, fn) {
        if (c.state === 'running') {
            fn();
        } else {
            c.resume().then(fn);
        }
    }

    function play(name, arg) {
        if (muted) return;
        const c = getCtx();
        if (!c) return;
        const preset = PRESETS[name];
        if (!preset) return;
        whenRunning(c, () => { if (!muted) preset(c, c.currentTime, arg); });
    }

    let noiseBuffer = null;
    function getNoiseBuffer(c) {
        if (noiseBuffer) return noiseBuffer;
        const length = c.sampleRate * 2;
        noiseBuffer = c.createBuffer(1, length, c.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
        return noiseBuffer;
    }

    // 릴이 돌아가는 동안 재생되는 사운드. 지속되는 화이트노이즈 대신,
    // 릴 눈금이 빠르게 스쳐 지나가는 "촤라락" 느낌을 내기 위해 아주 짧은
    // 노이즈 클릭을 빠른 간격으로 반복 재생한다(리듬감 있는 클릭 트레인).
    // startLoop()가 반환한 핸들을 stopLoop()에 넘기면 다음 예약을 멈춘다.
    const LOOP_PRESETS = {
        reelSpin: (c, handle) => {
            function scheduleTick() {
                if (handle.stopped) return;
                const t0 = c.currentTime;

                const src = c.createBufferSource();
                src.buffer = getNoiseBuffer(c);

                const hp = c.createBiquadFilter();
                hp.type = 'highpass';
                hp.frequency.value = 1500 + Math.random() * 900;

                const gain = c.createGain();
                gain.gain.setValueAtTime(0.0001, t0);
                gain.gain.exponentialRampToValueAtTime(0.35, t0 + 0.004);
                gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.035);

                src.connect(hp).connect(gain).connect(c.destination);
                src.start(t0);
                src.stop(t0 + 0.05);

                handle.timer = setTimeout(scheduleTick, 40 + Math.random() * 16);
            }
            scheduleTick();
        },
    };

    function startLoop(name) {
        if (muted) return null;
        const c = getCtx();
        if (!c) return null;
        const preset = LOOP_PRESETS[name];
        if (!preset) return null;

        // stopLoop()가 실제 재생 시작 전에 먼저 호출될 수 있으므로(예: resume()이
        // 늦게 끝나는 사이 릴이 이미 멈춘 경우), stopped 플래그로 이를 처리한다.
        const handle = { stopped: false, timer: null };
        whenRunning(c, () => {
            if (muted || handle.stopped) return;
            preset(c, handle);
        });
        return handle;
    }

    function stopLoop(handle) {
        if (!handle) return;
        handle.stopped = true;
        if (handle.timer) clearTimeout(handle.timer);
    }

    function toggleMute() {
        muted = !muted;
        localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
        return muted;
    }

    function isMuted() {
        return muted;
    }

    window.GameSound = { play, startLoop, stopLoop, toggleMute, isMuted };
})();
