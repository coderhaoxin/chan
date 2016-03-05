/* jshint loopfunc: true */
/* global describe:true, beforeEach:true, it:true */

var chan   = require('..')
var expect = require('expect.js')

describe('A unbuffered channel', function () {

  it(
    'should not call the added callback until the value is removed',
    function (done) {
      var ch = chan(0) // unbuffered
      var cbCalled = false
      ch('foo').then((function () {
        cbCalled = true
      }))
      setImmediate(function () {
        expect(cbCalled).to.not.be.ok()
        ch(function (err, val) {
          setTimeout(function () {
            expect(cbCalled).to.be.ok()
            done()
          }, 100)
        })
      })
    }
  )

})

describe('A buffered channel', function () {

  it(
    'should pull values from the buffer when yielded',
    function (done) {
      var ch = chan(1)
      var cbCalled = false
      var testValue = 'foo'
      ch(testValue)
      ch(function (err, val) {
        cbCalled = true
        expect(val).to.be(testValue)
      })
      setImmediate(function () {
        expect(cbCalled).to.be.ok()
        done()
      })
    }
  )

  describe('with a non-full buffer', function () {

    it(
      'should call added callback as soon as it is given to the returned thunk',
      function (done) {
        var buffer = 3
        var ch = chan(buffer)
        var called = 0
        var added = 0
        while (++added <= buffer + 10) {
          ch(added).then(function () {
            called++
          })
        }
        setTimeout(function () {
          expect(called).to.be(buffer)
          done()
        }, 100)
      }
    )

  })

  describe('with a full buffer', function () {

    it(
      'should not add another value untill a value has been removed',
      function (done) {
        var ch = chan(1)
        var cbCalled = false
        ch('foo')
        ch('bar').then(function () {
          cbCalled = true
        })
        setImmediate(function () {
          expect(cbCalled).to.not.be.ok()
          ch(function (err, val) {
            setTimeout(function () {
              expect(cbCalled).to.be.ok()
              done()
            }, 100)
          })
        })
      }
    )

    it(
      'should call cb with an error when the channel is closed before adding',
      function (done) {
        var ch = chan(0)
        ch('foo').catch(function (err) {
          expect(err).to.be.an(Error)
          done()
        })
        ch.close()
      }
    )

  })

})
