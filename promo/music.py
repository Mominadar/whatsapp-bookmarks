#!/usr/bin/env python3
"""Synthesises an original, royalty-free background track for the promo video (31 s) with soft click sounds
timed to the cursor clicks in promo.html. Output: a stereo 44.1 kHz WAV.

Usage: python3 promo/music.py out.wav      (needs numpy)
"""
import sys, wave
import numpy as np

SR, DUR, BPM = 44100, 31.0, 96
N = int(SR * DUR)
beat = 60 / BPM
rng = np.random.default_rng(7)

def midi(n): return 440.0 * 2 ** ((n - 69) / 12)
def env_adsr(length, a, d, s, r, sr=SR):
    t = np.arange(length) / sr
    e = np.where(t < a, t / a, np.where(t < a + d, 1 - (1 - s) * (t - a) / d, s))
    tail = np.clip((length / sr - t) / r, 0, 1)
    return e * tail

def pluck(freq, length, bright=1.0):
    t = np.arange(length) / SR
    tone = sum(a * np.sin(2 * np.pi * freq * k * t) for k, a in ((1, 1), (2, .38 * bright), (3, .16 * bright), (4, .07 * bright)))
    return tone * np.exp(-t * 5.5)

def pad(freq, length):
    t = np.arange(length) / SR
    w = sum(np.sin(2 * np.pi * freq * d * t + p) for d, p in ((1, 0), (1.004, 1.3), (.996, 2.1))) / 3
    w += .3 * np.sin(2 * np.pi * freq * 2 * t)
    return w * env_adsr(length, 1.2, .5, .8, 1.4)

L = np.zeros(N); R = np.zeros(N)
def put(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N: return
    sig = sig[: N - i] * gain
    L[i:i + len(sig)] += sig * (1 - max(0, pan)); R[i:i + len(sig)] += sig * (1 + min(0, pan))

# Chords, one per bar: Cmaj7 - Am7 - Fmaj7 - G6, repeating; the last bar resolves to C major.
prog = [(48, (60, 64, 67, 71)), (45, (57, 60, 64, 67)), (41, (60, 65, 69, 72)), (43, (59, 62, 67, 71))]
bar = 4 * beat
bars = int(np.ceil(DUR / bar))
for b in range(bars):
    t0 = b * bar
    root, chord = prog[b % 4]
    if t0 + bar > DUR - 3: root, chord = 48, (60, 64, 67, 72)
    # section loudness: sparse intro, fuller body, softer privacy section, final ring-out
    section = .55 if t0 < 4 else 1.0 if t0 < 25 else .8
    for m in chord[:3]:
        put(pad(midi(m - 12), int(bar * 1.15 * SR)), t0, .075 * section, pan=((m % 5) - 2) * .12)
    put(pluck(midi(root - 12), int(bar * SR), .4), t0, .24 * section)                      # bass
    if t0 >= 3.9 and t0 < 28.4:                                                            # arpeggio enters with the first scene
        pattern = [0, 1, 2, 3, 2, 1, 2, 3]
        for k, p in enumerate(pattern):
            ts = t0 + k * beat / 2
            if ts < DUR - 2.5:
                put(pluck(midi(chord[p] + 12), int(1.1 * SR)), ts, .13 * section, pan=-.35 if k % 2 else .35)
    if t0 >= 10.9 and t0 < 28.4:                                                           # high sparkle on the off-beats once the app is on screen
        for k in (1, 3, 5, 7):
            put(pluck(midi(chord[(k + 1) % 4] + 24), int(.9 * SR), 1.3), t0 + k * beat / 2, .045 * section, pan=.5 * (-1) ** k)

# End card: one last full chord that rings out.
for m in (48, 60, 64, 67, 72): put(pad(midi(m), int(3.2 * SR)), 28.4, .09)
put(pluck(midi(84), int(3 * SR), 1.2), 28.7, .12)

# Soft "UI" sounds at the cursor clicks (times match promo.html).
def tick(freq, length=.09):
    t = np.arange(int(length * SR)) / SR
    return (np.sin(2 * np.pi * freq * t) + .4 * np.sin(2 * np.pi * freq * 2.01 * t)) * np.exp(-t * 55)
for t_click, f in ((5.95, 880), (6.7, 990), (8.4, 1175), (13.0, 784), (14.5, 784), (15.8, 784), (18.5, 988), (20.7, 880), (23.4, 1047)):
    put(tick(f), t_click, .22)
def chime(start):                                                                          # "Bookmark saved" confirmation
    for k, m in enumerate((79, 84)): put(pluck(midi(m), int(1.2 * SR), 1.1), start + k * .11, .16, pan=.2)
chime(8.75)

# Gentle stereo reverb: a few feedback echoes with a low-passed tail.
def reverb(x, delays=(.047, .083, .131, .197), fb=.33, mix=.28):
    y = x.copy()
    for d in delays:
        k = int(d * SR); echo = np.zeros_like(x); echo[k:] = x[:-k] * fb
        y += echo * mix / len(delays) * 3
    return y
L, R = reverb(L), reverb(np.roll(R, 37))

# Fades, then normalise to a conservative level (headroom for AAC).
fade_in, fade_out = int(1.2 * SR), int(2.4 * SR)
fade = np.ones(N); fade[:fade_in] = np.linspace(0, 1, fade_in); fade[-fade_out:] = np.linspace(1, 0, fade_out) ** 1.5
L *= fade; R *= fade
peak = max(np.abs(L).max(), np.abs(R).max())
scale = .8 / peak
pcm = (np.stack([L, R], 1) * scale * 32767).astype('<i2')
with wave.open(sys.argv[1] if len(sys.argv) > 1 else 'promo-music.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1] if len(sys.argv) > 1 else 'promo-music.wav', f'{DUR}s peak scale {scale:.2f}')
