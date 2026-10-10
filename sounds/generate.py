import sys, wave, struct, math
out = sys.argv[1]
SR = 22050
VOL = 0.18  # quiet

def sq(f, t): return 1.0 if math.sin(2*math.pi*f*t) >= 0 else -1.0

def tone(f0, dur, f1=None, duty_sq=True, decay=6.0):
    n = int(SR*dur); s = []; ph = 0.0
    for i in range(n):
        t = i/SR; f = f0 if f1 is None else f0 + (f1-f0)*(i/n)
        ph += f/SR
        v = 1.0 if (ph % 1) < 0.5 else -1.0
        env = math.exp(-decay*t) * min(1, i/40) * min(1, (n-i)/120)
        s.append(v*env)
    return s

def silence(d): return [0.0]*int(SR*d)

def write(name, s):
    with wave.open(f"{out}/{name}.wav", "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1,min(1,x))*VOL*32767)) for x in s))

B5, E6 = 987.8, 1318.5
write("coin", tone(B5, 0.06, decay=2) + tone(E6, 0.22, decay=9))
write("powerdown", tone(440, 0.14, 330, decay=3) + tone(330, 0.24, 165, decay=5))
write("blip", tone(880, 0.05, decay=10))
notes = [523.3, 659.3, 784.0, 1046.5]
write("oneup", sum([tone(f, 0.07, decay=4) for f in notes[:3]], []) + tone(notes[3], 0.25, decay=7))
