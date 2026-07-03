# hilsystem.com Homepage — Patch Summary

## File: hilsystem-reordered.html (or equivalent in hilsystem-com repo)

### 5 Changes Required:

**Fix 1 — Tool 02 HIL Hub href**
Find:    `hl-super-tool%20(1).html`
Replace: `hil-hub.html`

**Fix 2 — Tool 05 Sign Studio → Labels & Signs**
Find block:
```
<a class="tool-card" href="https://hlsystem.org/tools/hil-sign-studio.html" target="_blank" style="--card-accent:var(--purple)">
<div class="tool-badge">TOOL 05 — MAKE IT YOURS</div>
<h3>Sign Studio</h3>
<p>Design custom signs for your space. Art Deco, Industrial, Vintage Tin, Workshop, Farmhouse, Kids Room, Space Explorer, and Blueprint themes.</p>
<div class="tool-link">OPEN TOOL →</div></a>
```
Replace with:
```
<a class="tool-card" href="https://hlsystem.org/tools/hil-label-studio.html" target="_blank" style="--card-accent:var(--purple)">
<div class="tool-badge">TOOL 05 — LABELS & SIGNS</div>
<h3>Labels & Signs</h3>
<p>Zone placards, shelf labels, electrical tags, and 8 custom sign themes. Art Deco to Blueprint. QR codes, thermal text, and a printable starter pack.</p>
<div class="tool-link">OPEN TOOL →</div></a>
```

**Fix 3 — Tool 06 HIL Museum href**
Find:    `hl-history-wall.html`
Replace: `hil-museum.html`

**Fix 4 — Library 06 HIL Maintain href (copy-paste bug)**
Find block (second occurrence of hil-supply.html, in LIBRARY section):
```
<a class="tool-card" href="https://hlsystem.org/tools/hil-supply.html" style="--card-accent:var(--green)">
<div class="tool-badge">LIBRARY 06 — SCHEDULED CARE</div>
<h3>HIL Maintain</h3>
```
Replace href with `#` (not built yet)

**Fix 5 — Path 03 Ghost panel offline tools list**
Find:
```
<div class="ph-tool">HL Sign Studio <span class="ph-tool-tag">OFFLINE</span></div>
<div class="ph-tool">Label Generator <span class="ph-tool-tag">OFFLINE</span></div>
```
Replace with:
```
<div class="ph-tool">Labels & Signs <span class="ph-tool-tag">OFFLINE</span></div>
```
