"""
Office Wahala: generate studio-quality voice clips with Microsoft's Nigerian
neural voices (en-NG-AbeoNeural, male; en-NG-EzinneNeural, female).

Run this on your own computer (it needs internet):
    Windows: double-click tools\\generate-voices.bat
    Mac/Linux: python3 tools/generate_voices.py

It reads every line from voice.js, writes MP3s into voices/en and voices/pcm,
and writes voices/voices.json. The game uses these clips automatically once
the voices/ folder is deployed with the rest of the site.

Note: this uses the free `edge-tts` package, which talks to the same
read-aloud service Microsoft Edge uses. It is not an official Microsoft API,
so it may change or stop working. If it does, the game still speaks using
each player's device voice.
"""
import asyncio, json, os, re, sys

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts is not installed. Run:  python -m pip install edge-tts")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "voice.js")
OUT = os.path.join(ROOT, "voices")

# speaker -> (voice, pitch, rate)
CAST = {
    "narrator":  ("en-NG-EzinneNeural", "+0Hz",  "+5%"),
    "oga":       ("en-NG-AbeoNeural",   "-12Hz", "-5%"),
    "driver":    ("en-NG-AbeoNeural",   "+0Hz",  "+18%"),
    "agbero":    ("en-NG-AbeoNeural",   "-6Hz",  "+8%"),
    "hr":        ("en-NG-EzinneNeural", "+4Hz",  "+0%"),
    "aunty":     ("en-NG-EzinneNeural", "+10Hz", "-4%"),
    "colleague": ("en-NG-AbeoNeural",   "+6Hz",  "+6%"),
}

def load_lines():
    text = open(SRC, encoding="utf-8").read()
    m = re.search(r"/\*LINES_START\*/\s*const LINES = (\{.*?\});\s*/\*LINES_END\*/", text, re.S)
    if not m:
        sys.exit("Could not find the LINES block in voice.js")
    return json.loads(m.group(1))

async def make(text, who, path):
    voice, pitch, rate = CAST.get(who, CAST["narrator"])
    com = edge_tts.Communicate(text, voice, pitch=pitch, rate=rate)
    await com.save(path)

async def main():
    lines = load_lines()
    manifest = {"lines": {"en": {}, "pcm": {}}, "voices": "Microsoft en-NG Abeo / Ezinne (edge-tts)"}
    jobs = [(i, lang, line) for i, line in lines.items() if not line.get("ttsOnly") for lang in ("en", "pcm")]
    for n, (i, lang, line) in enumerate(jobs, 1):
        os.makedirs(os.path.join(OUT, lang), exist_ok=True)
        fname = f"{i}.mp3"
        path = os.path.join(OUT, lang, fname)
        text = line.get(lang) or line["en"]
        for attempt in range(3):
            try:
                await make(text, line["who"], path)
                break
            except Exception as e:  # network hiccup: retry
                if attempt == 2:
                    sys.exit(f"Failed on '{i}' ({lang}): {e}")
                await asyncio.sleep(2)
        manifest["lines"][lang][i] = fname
        print(f"[{n}/{len(jobs)}] {lang}/{fname}  {text}")
    with open(os.path.join(OUT, "voices.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=1, ensure_ascii=False)
    print(f"\nDone. {len(jobs)} clips in {OUT}. Deploy the voices folder with the game.")

if __name__ == "__main__":
    asyncio.run(main())
