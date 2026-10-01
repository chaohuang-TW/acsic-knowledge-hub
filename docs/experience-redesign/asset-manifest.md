# Experience asset manifest

## Existing mascot

- Asset: `public/assets/mascot/meng-ge-guide.webp`
- Original file: WebP, 250×465, 14,868 bytes.
- SHA-256: `004be82ab2487e1e1b9866a54a84438921e91a5d40505ce13e25432bd9c5adf9`.
- No redraw, recolouring, face editing, limb animation or replacement is permitted in this rebuild. Only whole-asset placement, scaling, translation and a separate shadow are used.

## Map presentation geometry

- Dataset: Natural Earth 1:50m land, from the official project's `geojson/ne_50m_land.geojson`.
- [Dataset description](https://www.naturalearthdata.com/downloads/50m-physical-vectors/50m-land/).
- [Official project](https://github.com/nvkelso/natural-earth-vector).
- [Terms of use](https://www.naturalearthdata.com/about/terms-of-use/): public domain, including modification and redistribution.
- Retrieval/terms verification: 2026-10-01.
- Raw input SHA-256: `e874b27a51d146452be360cafb3cc50c86001074a67d534113e6534682f9826b`.
- Local output: `src/features/network-explorer/mapCoastline.json`.
- Build process: `scripts/build-map-coastline.mjs`, crop 55°E to 155°E and 13°S to 58°N, Douglas-Peucker tolerance 0.075°, remove tiny islands below 0.1 square degree, round coordinates to 0.001°. 82 land contours, 3,430 vertices.
- No administrative borders, map tiles, geopolitical classifications or external runtime API are added.
- SVG and 3D views use the same existing equirectangular presentation projection and governed economy anchors. Anchors are approximate economy-level positions, not institution offices or research measurements.
- The coastlines are presentation provenance only and are not added to the research source registry.

## Typography and iconography

- System sans-serif font stack, with existing platform/CJK fallbacks. No downloaded fonts, web font calls, font license dependencies or external translation services.
- Brand atlas mark is repository-native inline SVG, not a new institution logo.
- Navigation arrows are text glyphs with nonessential decorative semantics.

## Artifact handling

Screenshots, traces, raw performance reports and HTML concepts remain in local/CI artifact storage rather than the repository. Reports in this folder use repository-relative paths and do not publish user home paths or personal files.
