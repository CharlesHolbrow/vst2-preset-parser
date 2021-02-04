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
  .uint32('idUint')
  .seek(-4)
  .string('idString', { length: 4 } )
  .uint32('fxVersion')
  .uint32('count')
  .choice({
    tag: 'fxMagicInt',
    choices: {
      0: new Parser().string('programName', { length: 28, stripNull: true }).saveOffset('stateStart').array('patchParams', { length: 'count', type: 'floatbe' }).saveOffset('stateEnd').seek(v=>v.stateStart-v.stateEnd).buffer('state64', { length: v=>v.stateEnd - v.stateStart, formatter: v=>v.toString('base64')}),
      1: new Parser().string('programName', { length: 28, stripNull: true }).uint32('byteSize').saveOffset('stateStart').buffer('patchChunk', { length: 'byteSize' }).saveOffset('stateEnd').seek(v=>v.stateStart-v.stateEnd).buffer('state64', { length: v=>v.stateEnd - v.stateStart, formatter: v=>v.toString('base64')}),
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
 * @property {number} idUint unique plugin id Number
 * @property {number} idString unique plugin id as a string
 * @property {number} fxVersion
 * @property {number} count number of parameters (for FxCk patches). Number of programs (for FxBk banks)
 * @property {number[]} [patchParams] all parameter values (for FxCk .fxp files)
 * @property {Buffer} [patchChunk] binary state (for FPCh .fxp files)
 * @property {Vst2Preset[]} [bankPatches] all patches in the bank (for FxBk .fxb files)
 * @property {Buffer} [bankChunk] binary state (for FBCh .fxb files)
 * @property {string} [state64] base64 encoded state (for all .fxp files)
 */

/**
 * @param {Buffer} Buffer binary contents of a vst2 .fxb or .fxp file
 * @returns {Vst2Preset}
 */
const parse = (buffer) => parser.parse(buffer)

module.exports = {
  parse,
}
