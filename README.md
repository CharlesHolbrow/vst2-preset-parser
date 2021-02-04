# Vst2 preset parser (.fxb/.fxp)

```javascript
const { readFileSync } = require('fs')
const { parse } = require('vst2-preset-parser')

const buffer = readFileSync('your-preset-file.fxp')
const result = parse(buffer) // result will have the following properties:

/**
 * A Vst2 Patch or Bank.
 * `.fxp` files will have a `.state64` string
 * `.fxp` files will have one of: `.patchParams` or `.patchChunk`
 * `.fxb` files will have one of: `.bankPatches` or `.bankChunk`
 * @typedef {Object} Vst2Preset
 * @property {string} fxMagic - one of: 'FxCk', 'FPCh', 'FxBk', 'FBCh'
 * @property {number} version - format version (typically 1)
 * @property {number} idUint - unique plugin id Number
 * @property {number} idString - unique plugin id as a string
 * @property {number} fxVersion -
 * @property {number} count - number of parameters (for FxCk patches). Number of programs (for FxBk banks)
 * @property {number[]} [patchParams] - all parameter values (for FxCk .fxp files)
 * @property {Buffer} [patchChunk] - binary state (for FPCh .fxp files)
 * @property {Vst2Preset[]} [bankPatches] - all patches in the bank (for FxBk .fxb files)
 * @property {Buffer} [bankChunk] - binary state (for FBCh .fxb files)
 * @property {string} [state64] - base64 encoded state (for all .fxp files)
 */
```
