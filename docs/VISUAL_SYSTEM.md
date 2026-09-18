# Jade Porcelain visual system

This visual-only refresh preserves the existing routes, content, research evidence,
membership boundary, search/filter logic and three-destination Explorer scope.

## Audit and direction

The baseline used tightly bordered panels, a sans-only heading hierarchy, boxed
home statistics and orange institution nodes. The refreshed presentation uses a
publication-style heading hierarchy, an unboxed statistical band, softer surfaces
and restrained jade scene materials. Existing CTAs, disclosures and keyboard
controls retain their behavior.

Design variance 4/10, motion intensity 2/10, visual density 3/10. The supplied
reference informed color and material only; its layout and text are not reproduced.

## Tokens and typography

- `src/styles/tokens.css`: colors, type stacks/scale, spacing, radii, shadows and transition timing.
- `src/styles/theme.css`: visual presentation and responsive rules over existing layout hooks.
- `src/styles/sceneTheme.ts`: canvas material palette, imported only by the lazy scene.

Jade `#6F9D91` is an accent. Snow-pear white `#F4EEE7` is the page ground.
Deep jade `#365B53` and warm ink `#51463D` provide readable text. Champagne
`#C9B997` is restricted to the selected node's thin ring.

Display headings use locally available Iowan/Palatino, Noto Serif TC or Songti TC
with Georgia/serif fallback. Body controls use Inter/Noto Sans TC/system sans.
No font downloads, external font service or new image asset is required. Exact
glyph appearance therefore varies with installed fonts.

The requested light porcelain identity is explicit in both OS color preferences.
Controls use approximately 14px radii, cards 24px and large panels 32px. Shadows
are low-opacity jade-tinted shadows. Interactive controls retain a minimum 44px
touch height and a deep-jade visible focus outline. Reduced motion disables CSS
transitions and animations while preserving existing Explorer behavior.

## Responsive and data boundaries

Validation covers 1280, 1024, 768, 390 and 320px. Explorer panels move below the
canvas, filters wrap, directory cards become one column, and mobile navigation
wraps rather than extending beyond the viewport. The canvas has an explicit
height to keep its drawing buffer aligned with its visible frame.

No governed data or mascot asset is changed. Statistics continue to derive from
production data. Research evidence remains in its existing disclosure.
