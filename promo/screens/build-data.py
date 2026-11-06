#!/usr/bin/env python3
"""Builds sample-data.js: invented bookmarks (text, voice note, PDF, image) for store screenshots. No real data."""
import base64, io, json, math, struct, wave
from pathlib import Path
from PIL import Image, ImageDraw

OUT = Path(__file__).parent

def data_url(mime, raw): return f"data:{mime};base64,{base64.b64encode(raw).decode()}"

def make_wav():
    rate, secs = 8000, 12
    buf = io.BytesIO()
    with wave.open(buf, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate)
        frames = bytearray()
        for i in range(rate * secs):
            t = i / rate
            env = 0.5 * (1 + math.sin(2 * math.pi * 1.7 * t)) * (0.6 + 0.4 * math.sin(2 * math.pi * 0.3 * t))
            v = env * (math.sin(2 * math.pi * (180 + 40 * math.sin(t * 2)) * t) + .4 * math.sin(2 * math.pi * 360 * t))
            frames += struct.pack('<h', int(max(-1, min(1, v * .35)) * 32767))
        w.writeframes(bytes(frames))
    return buf.getvalue()

def make_pdf():
    text = ['Q3 Report', 'Revenue grew 12% quarter over quarter.', 'Top priorities: onboarding, retention, mobile.']
    stream = 'BT /F1 28 Tf 72 720 Td (%s) Tj ET\n' % text[0]
    y = 670
    for line in text[1:]:
        stream += 'BT /F1 14 Tf 72 %d Td (%s) Tj ET\n' % (y, line); y -= 28
    objs = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
            b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
            b'<< /Length %d >>\nstream\n' % len(stream) + stream.encode() + b'endstream',
            b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
    out = b'%PDF-1.4\n'; offsets = []
    for i, o in enumerate(objs, 1):
        offsets.append(len(out)); out += b'%d 0 obj\n' % i + o + b'\nendobj\n'
    xref = len(out)
    out += b'xref\n0 %d\n0000000000 65535 f \n' % (len(objs) + 1) + b''.join(b'%010d 00000 n \n' % o for o in offsets)
    out += b'trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (len(objs) + 1, xref)
    return out

def make_image():
    w, h = 640, 400
    img = Image.new('RGB', (w, h)); d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=(int(255 - 70 * t), int(150 + 20 * t - 110 * t * t), int(90 + 110 * t)))
    d.ellipse((410, 90, 530, 210), fill=(255, 226, 150))
    d.polygon([(0, 300), (140, 210), (260, 290), (380, 200), (520, 300), (640, 240), (640, 400), (0, 400)], fill=(40, 70, 100))
    d.rectangle((0, 330, w, h), fill=(24, 48, 72))
    buf = io.BytesIO(); img.save(buf, 'PNG'); return buf.getvalue()

DAY = 86400000
NOW = 1793000000000  # fixed so the data is deterministic
def item(i, chat, text, meta_time, date, collection, kind=None, media=None, note='', ago=0, outgoing=False):
    return {'id': f'sample-{i}', 'messageId': f"{'true' if outgoing else 'false'}_{1000+i}@c.us_ABC{i}", 'chat': chat, 'chatId': f'{1000+i}@c.us',
            'text': text, 'meta': f'[{meta_time}, {date}] {chat}: ', 'collection': collection, 'note': note,
            'mediaKind': kind or '', 'media': media or [], 'mediaNote': '', 'savedAt': NOW - ago}

items = [
    item(1, 'Mum', "Layer noodles, ricotta, spinach and lots of sauce. Bake at 180° for 45 minutes. 🍝", '10:42', '11/5/2026', 'Recipes', note="Grandma's lasagna", ago=0),
    item(2, 'Sara', '', '16:05', '11/4/2026', 'Work', 'audio', [{'kind': 'audio', 'data': data_url('audio/wav', make_wav())}], note='Client feedback', ago=DAY),
    item(3, 'Team Alpha', '', '09:12', '11/3/2026', 'Work', 'document', [{'kind': 'document', 'name': 'Q3-report.pdf', 'data': data_url('application/pdf', make_pdf())}], note='Numbers for the board', ago=2 * DAY),
    item(4, 'Dad', 'Hotel booking is confirmed: https://stay.example/booking Check-in is at 3 pm, room 204.', '18:30', '11/2/2026', 'Travel', ago=3 * DAY),
    item(5, 'Priya', 'Sunset from the balcony 🌅', '19:48', '11/1/2026', 'Travel', 'image', [{'kind': 'image', 'data': data_url('image/png', make_image())}], ago=4 * DAY),
    item(6, 'Alex', 'Idea: a monthly photo walk with the whole team. Pick a theme, share the best shots in the group.', '12:20', '10/30/2026', 'Ideas', ago=5 * DAY),
]
(OUT / 'sample-data.js').write_text('window.__SAMPLE_ITEMS = ' + json.dumps(items) + ';\n')
print('wrote', OUT / 'sample-data.js', len(json.dumps(items)) // 1024, 'KB')
