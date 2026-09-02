# cappellasmc

Website of the *Cappella Musicale del Sacro Monte Calvario* — choir and orchestra.
Static — plain HTML, CSS and a little JavaScript. No build step, no dependencies,
no framework. A modern remake of the old Google Sites site.

## Structure

```
cappellasmc/
├── index.html          # Home (hero, about, ensembles, season, contact)
├── formazioni.html     # The four ensembles, bios loaded from content/formazioni/
├── concerti.html       # Concerts (upcoming + archive), from content/events.json
├── liturgia.html       # Liturgical celebrations, from content/events.json
├── responsabili.html   # The people in charge, bios from content/responsabili/
├── css/style.css       # All styling — theme in the "DESIGN TOKENS" block
├── content/            # EDITABLE CONTENT (fetched at runtime)
│   ├── events.json      # EVENT DATA — add/change events here
│   ├── formazioni/*.txt # one bio per ensemble
│   └── responsabili/*.txt # one bio per person
├── js/
│   ├── events-render.js # builds the agenda from content/events.json
│   ├── copy-render.js   # fills [data-copy] elements from content/*.txt
│   └── main.js          # mobile menu + footer year
├── assets/
│   ├── logo.png, favicon.png
│   ├── img/             # site photos; img/posters/ = concert posters
│   └── programs/        # program PDFs (+ optional cover images)
├── robots.txt
├── sitemap.xml
└── .nojekyll            # serve files as-is (no Jekyll)
```

> Content is loaded via `fetch()`, so pages must be served over **http**
> (GitHub Pages, or an editor live-preview / `python3 -m http.server`).
> Opening an `.html` straight from disk (`file://`) skips the content because
> browsers block `fetch()` there.

## Events (concerts and liturgy)

All events live in **`content/events.json`**, one object per event. Order does
not matter — they are sorted by date at render time and split into upcoming /
past. Concerts show on `concerti.html`, liturgical events on `liturgia.html`.

It is plain JSON: double quotes everywhere, commas between items, **no trailing
comma** after the last field/object. To add an event, copy a block and change
the values:

```json
{ "date": "2026-05-03", "time": "21:00",
  "formations": ["corale", "camerata"],
  "guests": ["Trio SARA"],
  "title": "Concerto di S. Croce",
  "place": "Sala Bozzetti — Sacro Monte Calvario di Domodossola (VB)",
  "people": ["Manfred Nesti: direttore", "Federica Napoletani: soprano"],
  "desc": "Musiche di A. Vivaldi",
  "poster": "2026-05-03.jpg", "program": "2026-05-03.pdf" }
```

| Field | Required | Meaning |
|---|---|---|
| `date` | yes | `"YYYY-MM-DD"` (used for sorting + the day/month/year badge) |
| `title` | yes | event title (no `«»`) |
| `time` | no | e.g. `"21:00"` |
| `place` | no | venue (church, hall, …) |
| `formations` | no | subset of the fixed enum `corale` / `schola` / `convivio` / `camerata` → coloured chips (one or more) |
| `guests` | no | array of other ensembles (e.g. `["Polimnia Arts"]`) → neutral chips |
| `people` | no | array `"Name: role"` (e.g. `"Manfred Nesti: direttore"`) → performers list |
| `desc` | no | free line for repertoire / notes ("Musiche di …") |
| `type` | no | omit for a concert; `"liturgy"` puts it on the Liturgia page (green chips) |
| `poster` | no | poster image in `assets/img/posters/` → click opens a lightbox |
| `photos` | no | array of images in `assets/img/gallery/` → thumbnail gallery |
| `program` | no | programme PDF in `assets/programs/` → click opens the PDF |
| `programCover` | no | cover image for the programme, in `assets/programs/` |

Notes:
- Use double quotes `"..."`. Titles carry no `«»` (added by design elsewhere if ever needed).
- A poster/photo (image) opens enlarged in a lightbox; a program (PDF) opens in a new tab.
- No `programCover`? The event still shows a "Programma di sala (PDF)" button.
  A cover can be generated from the PDF's first page, e.g.
  `pdftoppm -jpeg -r 150 -f 1 -l 1 file.pdf file-cover`.

## Photos

Photos go in `assets/img/`; concert posters in `assets/img/posters/`. Where a
photo is missing, an elegant graphic placeholder shows instead — drop a JPG with
the expected name and it appears, no code changes.

## Bios (ensembles and people)

Each bio is a plain **`.txt`** file under `content/`: ensembles in
`content/formazioni/`, people in `content/responsabili/`. One blank line
separates paragraphs; `<em>…</em>` is allowed for work titles. The matching page
element carries `data-copy="formazioni/corale-di-calice"` (path without `.txt`)
and `copy-render.js` fills it in.

To keep an alternate version around, save it next to the other with a suffix
(e.g. `manfred-nesti-completo.txt`) and point `data-copy` at whichever you want
to show.

## Editing

- **Events:** `content/events.json` (see above).
- **Bios:** the `.txt` files in `content/formazioni/` and `content/responsabili/`.
- **Page copy:** directly in the `.html` files.
- **Theme:** the `DESIGN TOKENS` block at the top of `css/style.css`
  (`--c-wine`, `--c-gold`, `--c-bg` parchment; `--tag--lit` green for liturgy).

## Hosting

GitHub Pages, served from `main` (root). Custom domain `www.cappellasmc.it`
(`CNAME` file + DNS at TopHost pointing to GitHub Pages). Deploys on push to `main`.
