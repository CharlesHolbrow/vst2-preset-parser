const Parser = require('binary-parser').Parser

const FX_MAGIC = {
  'FxCk': 0, // FXP params
  'FPCh': 1, // FXP chunk
  'FxBk': 2, // FXB (regular)
  'FBCh': 3, // FXB chunk
}

const parser = new Parser()
  .namely('self')
  .endianess('big')
  .string('chunkMagic', { length: 4, assert: 'CcnK' })
  .uint32('firstChunkByteSize') // size of this chunk (excluding magic+byteSize)
  .string('fxMagic', { length: 4 , assert: function(v) { return FX_MAGIC.hasOwnProperty(v) } })
  .seek(-4) // store fx magic in two different ways
  .string('fxMagicInt', { length: 4, formatter: (str) => FX_MAGIC[str] })
  .uint32('version')
  .uint32('fxID')
  .uint32('fxVersion')
  .uint32('count')
  .choice({
    tag: 'fxMagicInt',
    choices: {
      0: new Parser().string('programName', { length: 28, stripNull: true }).array('patchParams', { length: 'count', type: 'floatbe' }),
      1: new Parser().string('programName', { length: 28, stripNull: true }).uint32('byteSize').buffer('patchChunk', { length: 'byteSize' }),
      2: new Parser().buffer('future', { length: 128 }).array('bankPatches', { length: 'count', type: 'self' }),
      3: new Parser().buffer('future', { length: 128 }).uint32('byteSize').buffer('bankChunk', { length: 'byteSize' }),
    }
  })

/**
 * A Vst2 Patch or Bank.
 * `.fxp` files will have one of: `.patchParams` or `.patchChunk`
 * `.fxb` files will have one of: `.bankPatches` or `.bankChunk`
 * @typedef {Object} Vst2Preset
 * @property {string} fxMagic one of: 'FxCk', 'FPCh', 'FxBk', 'FBCh'
 * @property {number} version format version (typically 1)
 * @property {number} fxID unique plugin id Number
 * @property {number} fxVersion
 * @property {number} count number of parameters (for FxCk patches). Number of programs (for FxBk banks)
 * @property {number[]} [patchParams] all parameter values (for FxCk .fxp files)
 * @property {Buffer} [patchChunk] binary state (for FPCh .fxp files)
 * @property {Vst2Preset[]} [bankPatches] all patches in the bank (for FxBk .fxb files)
 * @property {Buffer} [bankChunk] binary state (for FBCh .fxb files)
 */

/**
 * @param {Buffer} Buffer binary contents of a vst2 .fxb or .fxp file
 * @returns {Vst2Preset}
 */
const parse = (buffer) => parser.parse(buffer)


module.exports = {
  parse,
}
