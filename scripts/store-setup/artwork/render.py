#!/usr/bin/env python3
"""
Front-print artwork for the editorial series (designs N° 21-394).

The original files set each statement in a hairline Bodoni at about a third
of the chest width, with a tiny caption. On a shirt it read faint, and the
hairlines were too thin to print cleanly by DTG. This renders the same layout
(statement, rule, "SCHMUCKS · N°. 394") heavy, large and print-safe:

  - statement: Playfair Display Black — a high-contrast editorial serif
    (the same family of look as the Bodoni) whose thin strokes are still
    thick enough to print. Balanced line breaks, sized to fill up to
    78% of the print width, capped so a one-word joke doesn't become a
    billboard.
  - rule and caption: weights and sizes chosen so the thinnest stroke is
    at least ~0.8 mm at print size (4500 px = 15 in at 300 dpi).

Canvas 4500x5100, transparent, content centred where the old files put it,
so the chest-hit position on the shirt doesn't move.

  python3 render.py --fonts DIR --out DIR --text "I'm Stupid" --number 41
"""
import argparse
import math
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 4500, 5100
CENTER_Y = 2550          # where the old files centred their content
MAX_TEXT_W = 3300        # ~73% of the print width
MAX_SIZE = 600           # cap for short statements
MIN_SIZE = 260
MAX_BLOCK_H = 1700
INKS = {
    # name in the old filenames -> ink colour. "cream" files are the dark ink
    # printed on Natural/Gold shirts; "black" files are cream ink for Black.
    'cream': (26, 23, 20, 255),
    'black': (250, 243, 227, 255),
}
HEART = '❤'


def statement_font(fonts, size, style):
    if style == 'playfair':
        f = ImageFont.truetype(os.path.join(fonts, 'PlayfairDisplay.ttf'), size)
        f.set_variation_by_name('Black')
        return f
    f = ImageFont.truetype(os.path.join(fonts, 'BodoniModa.ttf'), size)
    # axes: opsz (6-96), wght (400-900). Low optical size = sturdier hairlines.
    f.set_variation_by_axes([11, 900])
    return f


def caption_font(fonts, size):
    f = ImageFont.truetype(os.path.join(fonts, 'Inter.ttf'), size)
    f.set_variation_by_axes([32, 800])
    return f


def segments(text):
    """Split on the heart so it can be drawn as a shape (fonts lack it)."""
    out, buf = [], ''
    for ch in text:
        if ch in (HEART, '♥'):
            if buf:
                out.append(('t', buf))
            out.append(('h', ''))
            buf = ''
        else:
            buf += ch
    if buf:
        out.append(('t', buf))
    return out


def line_width(font, line):
    w = 0
    for kind, s in segments(line):
        w += heart_size(font)[0] if kind == 'h' else font.getlength(s)
    return w


def heart_size(font):
    asc, _ = font.getmetrics()
    h = asc * 0.62
    return h * 1.15, h


def draw_heart(draw, x, baseline, font, ink):
    w, h = heart_size(font)
    pts = []
    for i in range(240):
        t = 2 * math.pi * i / 240
        px = 16 * math.sin(t) ** 3
        py = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((x + w / 2 + px / 17 * w / 2, baseline - h / 2 - py / 17 * h / 2 - h * 0.06))
    draw.polygon(pts, fill=ink)


def balanced_breaks(words, k, measure):
    """Split words into k lines: the widest line as short as possible, then,
    among splits within 6% of that, the most even (no orphan first line)."""
    n = len(words)
    if k == 1:
        return [' '.join(words)]
    options = []
    def rec(start, left, acc):
        if left == 1:
            lines = acc + [' '.join(words[start:])]
            widths = [measure(l) for l in lines]
            options.append((max(widths), max(widths) - min(widths), lines))
            return
        for end in range(start + 1, n - left + 2):
            rec(end, left - 1, acc + [' '.join(words[start:end])])
    rec(0, k, [])
    floor = min(o[0] for o in options)
    near = [o for o in options if o[0] <= floor * 1.06]
    return min(near, key=lambda o: o[1])[2]


SMALL_WORDS = {'a', 'an', 'the', 'and', 'but', 'or', 'nor', 'at', 'of', 'in',
               'to', 'for', 'by', 'with', 'as', 'per', 'via', 'vs'}
KEEP_CAPS = {'I', 'IDK', 'BDSM', 'HR', "HR's", 'MVP', 'FDA', 'DMs', 'RN', 'FW',
             'TRAF', 'ChatGPT', 'DM', 'I-95', 'US', 'UK'}


def editorial_case(text):
    """Store titles are Title Case (or ALL CAPS for N° 21-40); the prints use
    editorial case — small words lowercase, acronyms kept."""
    words = text.split(' ')
    upper = text.upper() == text
    out = []
    for i, w in enumerate(words):
        core = w.strip('()"“”,.:;!?')
        if core in KEEP_CAPS or core.isdigit():
            out.append(w)
            continue
        if upper:
            w = w.lower()
            w = w[:1].upper() + w[1:] if w[:1].isalpha() else w[:1] + w[1:2].upper() + w[2:]
            w = w.replace("i'm", "I'm").replace("I'M", "I'm")
            w = '-'.join(part[:1].upper() + part[1:] for part in w.split('-'))
            core = w.strip('()"“”,.:;!?')
        first = i == 0 or words[i - 1].endswith((':', '(', '—'))
        last = i == len(words) - 1
        if not first and not last and core.lower() in SMALL_WORDS and not w.startswith('('):
            w = w.replace(core, core.lower(), 1)
        out.append(w)
    return ' '.join(out)


def tokens(text):
    """Words, with a lone separator ("·", "—", "&") glued to the word before
    it so a line never starts with one."""
    out = []
    for w in text.split():
        if out and w in ('\u00b7', '\u2014', '-', '&', '+'):
            out[-1] += ' ' + w
        else:
            out.append(w)
    return out


def layout(text, fonts, style):
    words = tokens(text)
    probe = statement_font(fonts, 100, style)
    best = None
    for k in range(1, min(4, len(words)) + 1):
        lines = balanced_breaks(words, k, lambda l: line_width(probe, l))
        widest = max(line_width(probe, l) for l in lines)
        size = min(MAX_SIZE, int(100 * MAX_TEXT_W / widest))
        lead = 1.08
        block_h = size * lead * k
        if block_h > MAX_BLOCK_H:
            size = int(MAX_BLOCK_H / (lead * k))
        # Prefer fewer lines unless more lines buys a clearly larger size.
        score = size - (k - 1) * 40
        if best is None or score > best[0]:
            best = (score, size, lines)
    _, size, lines = best
    return max(size, MIN_SIZE), lines


def render(text, number, ink, fonts, style='playfair'):
    size, lines = layout(text, fonts, style)
    font = statement_font(fonts, size, style)
    cap = caption_font(fonts, max(96, int(size * 0.2)))
    asc, desc = font.getmetrics()
    lead = int(size * 1.08)

    caption = f'SCHMUCKS · N°. {number:03d}'
    tracking = cap.size * 0.32
    cap_w = sum(cap.getlength(c) for c in caption) + tracking * (len(caption) - 1)
    cap_asc, _ = cap.getmetrics()

    rule_gap = int(size * 0.42)
    rule_h = max(14, int(size * 0.035))
    cap_gap = int(size * 0.32)
    text_h = lead * (len(lines) - 1) + asc + int(desc * 0.4)
    block_h = text_h + rule_gap + rule_h + cap_gap + cap_asc
    top = CENTER_Y - block_h // 2

    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, line in enumerate(lines):
        baseline = top + asc + i * lead
        x = (W - line_width(font, line)) / 2
        for kind, s in segments(line):
            if kind == 'h':
                draw_heart(d, x, baseline, font, ink)
                x += heart_size(font)[0]
            else:
                d.text((x, baseline), s, font=font, fill=ink, anchor='ls')
                x += font.getlength(s)

    y = top + text_h + rule_gap
    widest = max(line_width(font, l) for l in lines)
    rule_w = max(cap_w * 1.1, min(widest * 0.45, 1500))
    d.rectangle([(W - rule_w) / 2, y, (W + rule_w) / 2, y + rule_h], fill=ink)

    y += rule_h + cap_gap + cap_asc
    x = (W - cap_w) / 2
    for c in caption:
        d.text((x, y), c, font=cap, fill=ink, anchor='ls')
        x += cap.getlength(c) + tracking
    return img


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--fonts', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--text', required=True)
    ap.add_argument('--number', type=int, required=True)
    ap.add_argument('--style', default='playfair', choices=['bodoni', 'playfair'])
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for name, ink in INKS.items():
        render(a.text, a.number, ink, a.fonts, a.style).save(
            os.path.join(a.out, f'schmucks-bold-{a.number:03d}-{name}.png'), optimize=True)
