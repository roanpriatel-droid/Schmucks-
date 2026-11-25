#!/usr/bin/env python3
"""
Replace the front print of the editorial designs (N° 21-394) with the bold
artwork from render.py, in Printify, and push the new mockups to Shopify.

DRY-RUN BY DEFAULT: renders previews into --out and changes nothing.

  python3 scripts/store-setup/artwork/rollout.py --fonts DIR --out DIR
  python3 scripts/store-setup/artwork/rollout.py --fonts DIR --out DIR --apply [--only 394] [--limit 10]

Per product: render both inks -> upload to Printify -> swap only the front
image ids in print_areas (placement, neck label and every other layer kept)
-> publish IMAGES ONLY, so the Shopify title, tags, SEO and handle are not
touched. Idempotent: a product whose front art is already "schmucks-bold-*"
is skipped, so a run can be stopped and resumed.
"""
import argparse
import base64
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from render import INKS, editorial_case, render  # noqa: E402

SHOP = 28354424
API = 'https://api.printify.com/v1'


def load_token():
    env = os.path.join(HERE, '..', '.env')
    for line in open(env):
        m = re.match(r'\s*PRINTIFY_TOKEN\s*=\s*(.*)', line)
        if m:
            return re.sub(r'\s+', '', m.group(1).strip().strip('\'"'))
    return os.environ['PRINTIFY_TOKEN']


TOKEN = load_token()


def call(method, path, body=None, attempt=0):
    req = urllib.request.Request(
        API + path,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json',
                 'User-Agent': 'store-setup-script'},
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            text = r.read().decode()
            return json.loads(text) if text else None
    except urllib.error.HTTPError as e:
        if e.code == 429 and attempt < 10:
            wait = min(60 * 2 ** attempt, 600)
            print(f'  rate limited, waiting {wait // 60} min', flush=True)
            time.sleep(wait)
            return call(method, path, body, attempt + 1)
        if e.code >= 500 and attempt < 5:
            time.sleep(3 * 2 ** attempt)
            return call(method, path, body, attempt + 1)
        raise RuntimeError(f'{method} {path} -> {e.code}: {e.read().decode()[:400]}')


def all_products():
    out, page = [], 1
    while True:
        d = call('GET', f'/shops/{SHOP}/products.json?limit=50&page={page}')
        out += d['data']
        if page >= d['last_page']:
            return out
        page += 1


def number_and_statement(title):
    m = re.search(r'^(.*?)\s+[—–-]\s+Schmucks\s+·\s+N°\.\s*(\d+)', title)
    return (int(m.group(2)), m.group(1).strip()) if m else (None, None)


def front_images(product):
    for pa in product['print_areas']:
        for ph in pa['placeholders']:
            if ph['position'] == 'front':
                yield from ph['images']


def png_bytes(img):
    buf = io.BytesIO()
    img.save(buf, 'PNG', optimize=True)
    return buf.getvalue()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--fonts', required=True)
    ap.add_argument('--out', required=True)
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--only', type=int)
    ap.add_argument('--limit', type=int, default=10 ** 6)
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    products = all_products()
    todo = []
    for p in products:
        n, statement = number_and_statement(p['title'])
        if n is None or n < 21 or (a.only and n != a.only):
            continue
        names = [im['name'] for im in front_images(p)]
        if all(name.startswith('schmucks-bold-') for name in names):
            continue
        todo.append((n, statement, p))
    todo.sort(key=lambda t: t[0])
    print(f'{len(todo)} products to update ({"APPLY" if a.apply else "dry run"})', flush=True)

    done = 0
    for n, statement, p in todo[: a.limit]:
        text = editorial_case(statement)
        new_ids = {}
        for ink_name, ink in INKS.items():
            img = render(text, n, ink, a.fonts)
            data = png_bytes(img)
            fname = f'schmucks-bold-{n:03d}-{ink_name}.png'
            if not a.apply:
                img.convert('RGBA').resize((450, 510)).save(os.path.join(a.out, fname))
                continue
            up = call('POST', '/uploads/images.json',
                      {'file_name': fname, 'contents': base64.b64encode(data).decode()})
            new_ids[ink_name] = up['id']
        if not a.apply:
            print(f'  N°{n:03d} {text}', flush=True)
            continue

        areas = []
        for pa in p['print_areas']:
            phs = []
            for ph in pa['placeholders']:
                imgs = []
                for im in ph['images']:
                    # The neck carries an empty 100x100 text layer (no src,
                    # no text): it prints nothing and Printify can't resolve
                    # its id on update, so it's left out.
                    if im.get('type') == 'text/plain' and not im.get('src'):
                        continue
                    keep ={k: im[k] for k in ('id', 'x', 'y', 'scale', 'angle')}
                    if ph['position'] == 'front':
                        ink_name = 'cream' if '-cream' in im['name'] else 'black'
                        keep['id'] = new_ids[ink_name]
                    imgs.append(keep)
                if imgs:  # Printify rejects empty placeholders (back, sleeves)
                    phs.append({'position': ph['position'], 'images': imgs})
            areas.append({'variant_ids': pa['variant_ids'], 'placeholders': phs})
        call('PUT', f'/shops/{SHOP}/products/{p["id"]}.json', {'print_areas': areas})
        call('POST', f'/shops/{SHOP}/products/{p["id"]}/publish.json',
             {'title': False, 'description': False, 'images': True, 'variants': False,
              'tags': False, 'keyFeatures': False, 'shipping_template': False})
        done += 1
        print(f'  ✓ N°{n:03d} {text}', flush=True)
    print(f'done: {done}', flush=True)


if __name__ == '__main__':
    main()
