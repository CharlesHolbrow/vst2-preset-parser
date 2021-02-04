/* eslint-env mocha */
require('mocha')
require('should')

const { parse } = require('..')

const fs = require('fs')
const path = require('path')


const fxbkExample = fs.readFileSync(path.join(__dirname, 'rea-comp.FXB'))
const fxckExample = fs.readFileSync(path.join(__dirname, 'rea-comp.FXP'))
const fpchExample = fs.readFileSync(path.join(__dirname, 'massive-test-patch.FXP'))
const fbchExample = fs.readFileSync(path.join(__dirname, 'massive-test-bank.FXB'))

describe('files that store parameters directly', function () {
  it('should correctly parse an FxBk .fxb file ', function () {
    const result = parse(fxbkExample)
    result.fxMagic.should.equal('FxBk')
    should.exist(result.bankPatches, '.bankPatches does not exist')
    should.exist(result.bankPatches[0], '.bankPatches is empty')
    result.bankPatches[0].patchParams.length.should.equal(19) // rea-comp has 19 parameters
  })
  it('should correctly parse an FxCk .fxp file', function () {
    const result = parse(fxckExample)
    result.fxMagic.should.equal('FxCk')
    result.patchParams.length.should.equal(19)
  })
})

describe('files that store chunks', function () {
  it('should parse a FPCh .fxp file', function () {
    const result = parse(fpchExample)
    result.fxMagic.should.equal('FPCh')
    should.exist(result.patchChunk)
    result.patchChunk.length.should.be.greaterThan(0)
  })

  it('should parse a FBCh .fxb file', function () {
    const result = parse(fbchExample)
    result.fxMagic.should.equal('FBCh')
    should.exist(result.bankChunk)
    result.bankChunk.length.should.be.greaterThan(0)
  })
})

describe('the .state64 property', function () {
  it('should be present for .fxp types', function () {
    const fxck = parse(fxckExample)
    fxck.fxMagic.should.equal('FxCk')
    should.exist(fxck.state64)

    const fpch = parse(fpchExample)
    fpch.fxMagic.should.equal('FPCh')
    should.exist(fpch.state64)
  })
})
