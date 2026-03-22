# Mock product slug normalization (`/` → `-`)

## What

- File: `src/modules/product/mock-products.ts`
- Every `"slug": "..."` value that contained `/` was updated so `/` is replaced with `-`.

## Why

- Avoid path-like characters in URL slugs (routing, SEO, copy/paste).

## Count

- **25** slug rows updated (patterns like `L/R`, `Q85/95`, `LN4/H7`, etc.).

## Edge case

- `ac-quy-bosch-105d31l-/r-bhd-12v-90ah` → `ac-quy-bosch-105d31l--r-bhd-12v-90ah` (double hyphen where the original had `l-/r`).

## Verify

```bash
rg '"slug": "[^"]*\/[^"]*"' src/modules/product/mock-products.ts
# (no matches)
```
