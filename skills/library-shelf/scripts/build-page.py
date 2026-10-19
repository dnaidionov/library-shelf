#!/usr/bin/env python3
"""Merge the scan results and write a self-contained library-shelf.html.

Usage: build-page.py <data-dir> [--snapshot "19 Oct 2026"]
<data-dir> holds config.json, shelf.json, libby.json and (optional) hoopla.json.
Output: <data-dir>/dist/library-shelf.html (standalone) and library-shelf.artifact.html (for the Artifact tool)
"""
import argparse, datetime, json, pathlib

ap = argparse.ArgumentParser()
ap.add_argument("data_dir")
ap.add_argument("--snapshot", default=datetime.date.today().strftime("%-d %b %Y"))
args = ap.parse_args()

d = pathlib.Path(args.data_dir)
here = pathlib.Path(__file__).resolve().parent
cfg = json.loads((d / "config.json").read_text())
shelf = json.loads((d / "shelf.json").read_text())
libby = json.loads((d / "libby.json").read_text())
hoopla_path = d / "hoopla.json"
hoopla = json.loads(hoopla_path.read_text()) if hoopla_path.exists() else {}

rows = []
for b in shelf:
    lib = libby.get(b["id"], {})
    libs = {k: v for k, v in lib.items() if k != "dur"}
    h = hoopla.get(b["id"], "")
    if not libs and not h:
        continue  # on no library's shelf: not shown
    stats = [b.get("pages", 0), b.get("rating", 0)] + ([lib["dur"]] if lib.get("dur") else [])
    rows.append([b["id"], b["t"], b["a"], libs, h, b.get("added", ""), stats])

page_cfg = {"libraries": cfg["libraries"], "hoopla": bool(cfg.get("hoopla"))}
html = (here.parent / "ui" / "template.html").read_text()
html = (html.replace('/*SNAPSHOT*/""', json.dumps(args.snapshot))
            .replace("/*DATA*/[]", json.dumps(rows, ensure_ascii=False, separators=(",", ":")))
            .replace("/*CONFIG*/{ libraries: [], hoopla: false }", json.dumps(page_cfg)))
out = d / "dist" / "library-shelf.html"
out.parent.mkdir(exist_ok=True)
# Standalone page: opens in any browser, offline included.
out.write_text('<!doctype html><html lang="en"><head><meta charset="utf-8">'
               '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
               '<style>:root{color-scheme:light}body{margin:0}</style></head><body>' + html + '</body></html>')
# Fragment for the Artifact tool, which adds its own document skeleton.
art = d / "dist" / "library-shelf.artifact.html"
art.write_text(html)
print(f"{out}: {len(rows)} of {len(shelf)} shelf books found in at least one library")
print(f"{art}: same page without the document wrapper, for publishing as an artifact")
