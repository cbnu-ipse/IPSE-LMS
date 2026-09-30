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

    // iOS Safari는 무음 스위치가 켜져 있으면 Web Audio API 출력을
    // 벨소리 채널로 취급해 차단한다(<audio> 태그 재생은 예외). 무음 오디오
    // 태그를 함께 재생해 미디어 채널로 강제 전환시키는 것이 알려진 우회법.
    // 0.5초 분량의 무음 PCM(8kHz/8bit/mono) — data 청크 길이가 0이면
    // loop=true일 때 브라우저가 즉시 재시작을 반복해 메인 스레드를 계속
    // 점유하므로(회전 시 리사이즈 처리와 겹치면 랙/멈춤 유발), 실제 길이가
    // 있는 무음 버퍼를 사용해야 한다.
    const SILENT_WAV = 'data:audio/wav;base64,' + (function () {
        const sampleRate = 8000, seconds = 0.5, n = sampleRate * seconds;
        const buf = new Uint8Array(44 + n);
        const view = new DataView(buf.buffer);
        const writeStr = (off, str) => { for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i)); };
        writeStr(0, 'RIFF');
        view.setUint32(4, 36 + n, true);
        writeStr(8, 'WAVE');
        writeStr(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate, true);
        view.setUint16(32, 1, true);
        view.setUint16(34, 8, true);
        writeStr(36, 'data');
        view.setUint32(40, n, true);
        buf.fill(128, 44);
        let binary = '';
        for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]);
        return btoa(binary);
    })();
    function unlockIOSMuteSwitch() {
        const audio = new Audio(SILENT_WAV);
        audio.loop = true;
        audio.volume = 0.001;
        audio.play().catch(function () {});
    }

    // iOS/모바일은 사용자 제스처 없이는 오디오가 재생되지 않으므로
    // 첫 클릭/터치 시점에 미리 컨텍스트를 열어둔다.
    function unlock() {
        getCtx();
        unlockIOSMuteSwitch();
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
        osc.connect(gain).connect(opts.dest || c.destination);
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
        // 고스톱 족보(홍단·청단·초단): 가야금 글리산도로 올라가 화음으로 마무리
        fanfare: (c, t0) => {
            [293.66, 349.23, 392.0, 440.0, 523.25, 587.33, 698.46, 783.99].forEach((f, i) =>
                pluck(c, f, t0 + i * 0.045, 0.5, 0.22));
            [587.33, 739.99, 880.0].forEach(f => tone(c, f, t0 + 0.42, 0.9, { type: 'triangle', volume: 0.16 }));
        },
        // 고도리: 새 세 마리가 짹짹
        birds: (c, t0) => {
            for (let i = 0; i < 6; i++) {
                const f = 2400 + (i % 3) * 350;
                tone(c, f, t0 + i * 0.12, 0.07, { type: 'sine', slideTo: f * 1.6, volume: 0.14 });
                tone(c, f * 1.3, t0 + i * 0.12 + 0.05, 0.05, { type: 'sine', slideTo: f * .9, volume: 0.1 });
            }
            [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(c, f, t0 + 0.75 + i * 0.07, 0.35, { type: 'triangle', volume: 0.16 }));
        },
    };

    // 현을 튕긴 듯한 소리 (가야금 느낌): 빠른 어택 + 긴 감쇠, 배음을 살짝 섞는다
    function pluck(c, freq, t, dur, vol, dest) {
        tone(c, freq, t, dur, { type: 'triangle', volume: vol, dest });
        tone(c, freq * 2, t, dur * .5, { type: 'sine', volume: vol * .25, dest });
    }

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
        // 음소거는 배경음악도 멈추고, 풀면 틀던 곡을 다시 튼다
        if (muted) stopBgm();
        else if (lastBgm) startBgm(lastBgm);
        return muted;
    }

    function isMuted() {
        return muted;
    }

    // ── 배경음악 (합성, 음원 파일 없음) ─────────────────────────────────────
    // 곡은 8분음표 단위 스텝 배열. 100ms마다 0.4초 앞까지 미리 예약하는 방식이라
    // 탭 전환 등으로 타이머가 늦어도 박자가 흐트러지지 않는다.
    const BGM_KEY = 'ipse_game_bgm_off';
    const N = { A2: 110, C3: 130.81, D3: 146.83, F3: 174.61, G3: 196, A3: 220, C4: 261.63, D4: 293.66,
        F4: 349.23, G4: 392, A4: 440, C5: 523.25, D5: 587.33, F5: 698.46 };
    const BGM_SONGS = {
        // 고스톱: D 계면조 느낌의 5음계 가야금 멜로디 + 장구(덩·쿵·덕) — 64스텝(약 23초) 반복
        gostop: {
            bpm: 84,
            volume: 0.35,
            melody: [
                'A4', 0, 'C5', 0, 'D5', 0, 'C5', 'A4', 'G4', 0, 'A4', 0, 0, 0, 0, 0,
                'F4', 0, 'G4', 0, 'A4', 0, 'C5', 0, 'A4', 'G4', 'F4', 0, 'D4', 0, 0, 0,
                'D5', 0, 'C5', 'A4', 'G4', 0, 'A4', 0, 'C5', 0, 'D5', 0, 'F5', 0, 'D5', 0,
                'C5', 'A4', 'G4', 0, 'F4', 0, 'G4', 0, 'A4', 0, 0, 0, 0, 0, 0, 0,
            ],
            bass: ['D3', 'D3', 'F3', 'A2', 'D3', 'C3', 'A2', 'D3'],
            drum: ['deong', 0, 0, 'deok', 'kung', 0, 'deok', 0],
        },
    };
    let bgm = null;
    let lastBgm = null;  // 음소거를 풀 때 다시 틀 곡

    function drum(c, kind, t, dest) {
        if (kind === 'deong' || kind === 'kung') {  // 북편: 낮은 울림
            tone(c, kind === 'deong' ? 90 : 120, t, 0.25, { type: 'sine', slideTo: 60, volume: kind === 'deong' ? .5 : .32, dest });
        }
        if (kind === 'deong' || kind === 'deok') {  // 채편: 짧은 딱
            const src = c.createBufferSource();
            src.buffer = getNoiseBuffer(c);
            const bp = c.createBiquadFilter();
            bp.type = 'bandpass';
            bp.frequency.value = 1800;
            const g = c.createGain();
            g.gain.setValueAtTime(0.0001, t);
            g.gain.exponentialRampToValueAtTime(kind === 'deok' ? .35 : .22, t + 0.003);
            g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
            src.connect(bp).connect(g).connect(dest);
            src.start(t);
            src.stop(t + 0.08);
        }
    }

    function scheduleBgm() {
        if (!bgm) return;
        const { c, song, master } = bgm;
        const step = 60 / song.bpm / 2;
        while (bgm.next < c.currentTime + 0.4) {
            const i = bgm.step % song.melody.length;
            const note = song.melody[i];
            if (note) pluck(c, N[note], bgm.next, step * 2.6, .5, master);
            if (i % 8 === 0) tone(c, N[song.bass[(i / 8) % song.bass.length]], bgm.next, step * 7, { type: 'sine', volume: .35, dest: master });
            const d = song.drum[i % song.drum.length];
            if (d) drum(c, d, bgm.next, master);
            bgm.next += step;
            bgm.step++;
        }
    }

    function isBgmOn() {
        return localStorage.getItem(BGM_KEY) !== '1';
    }

    function startBgm(name) {
        lastBgm = name;
        if (muted || bgm || !isBgmOn()) return;
        const song = BGM_SONGS[name];
        const c = getCtx();
        if (!song || !c) return;
        whenRunning(c, () => {
            if (muted || bgm || !isBgmOn()) return;
            const master = c.createGain();
            master.gain.setValueAtTime(0.0001, c.currentTime);
            master.gain.exponentialRampToValueAtTime(song.volume, c.currentTime + 1.5);
            master.connect(c.destination);
            bgm = { c, song, master, name, step: 0, next: c.currentTime + 0.1 };
            bgm.timer = setInterval(scheduleBgm, 100);
            scheduleBgm();
        });
    }

    function stopBgm() {
        if (!bgm) return;
        const { c, master, timer } = bgm;
        clearInterval(timer);
        master.gain.cancelScheduledValues(c.currentTime);
        master.gain.setTargetAtTime(0.0001, c.currentTime, 0.15);
        setTimeout(() => master.disconnect(), 800);
        bgm = null;
    }

    // 효과음이 잘 들리게 잠깐 배경음악을 줄였다가 되돌린다
    function duckBgm(ms) {
        if (!bgm) return;
        const { c, master, song } = bgm;
        master.gain.cancelScheduledValues(c.currentTime);
        master.gain.setTargetAtTime(song.volume * 0.2, c.currentTime, 0.05);
        master.gain.setTargetAtTime(song.volume, c.currentTime + ms / 1000, 0.3);
    }

    function setBgmOn(on, name) {
        localStorage.setItem(BGM_KEY, on ? '0' : '1');
        if (on) startBgm(name);
        else stopBgm();
    }

    window.GameSound = { play, startLoop, stopLoop, toggleMute, isMuted, startBgm, stopBgm, duckBgm, isBgmOn, setBgmOn };
})();
