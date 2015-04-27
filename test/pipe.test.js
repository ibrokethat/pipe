"use strict";

import assert from 'assert';
import sinon from 'sinon';
import  underTest from '../src/pipe';

import {expect} from 'chai';

let fakes;
let ctx;


function gen (v) {

  return function (ctx) {
    ctx.data[v] = v;
    return ctx;
  }
}

function genThrow (v) {

  return function (ctx) {
    ctx.errors = v;
    throw ctx;
  }
}

function genAsync (v) {

  return function (ctx) {

    return new Promise((resolve) => {
      setTimeout(() => {
        ctx.data[v] = v;
        resolve(ctx);
      }, 10)
    })
  }
}

function genAsyncReject (v) {

  return function (ctx) {

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        ctx.errors = v;
        reject(ctx);
      }, 10)
    });
  }
}




describe("test iter module: ", () => {

  beforeEach(()  =>  {

    fakes = sinon.sandbox.create();
    ctx = {
      req: 'req',
      res: 'res',
      errors: null,
      data: {}
    }

  });


  it('should call each function in the pipeline', (done) => {

    let result = false;

    let pipeline = [
      genAsync('d'),
      gen('a'),
      genAsync('t'),
      gen('e')
    ];


    let t = () => {

      expect(result).to.deep.equal({
        req: 'req',
        res: 'res',
        errors: null,
        data: {
          d: 'd',
          a: 'a',
          t: 't',
          e: 'e'
        }
      });

      done();

    }

    let p = underTest(pipeline, ctx)
      .then((r) => {result = r; t(); })
      .catch((e) => {result = e; t();});

  });


  it('should throw when a function rejects', (done) => {

    let result = false;

    let pipeline = [
      genAsync('d'),
      gen('a'),
      genAsyncReject('t'),
      gen('e')
    ];


    let t = () => {

      expect(result).to.deep.equal({
        req: 'req',
        res: 'res',
        errors: 't',
        data: {
          d: 'd',
          a: 'a'
        }
      });

      done();

    }

    let p = underTest(pipeline, ctx)
      .then((r) => {result = r; t(); })
      .catch((e) => {result = e; t();});

  });


  it('should throw when a function throws', (done) => {

    let result = false;

    let pipeline = [
      genAsync('d'),
      genThrow('a'),
      genAsync('t'),
      gen('e')
    ];


    let t = () => {

      expect(result).to.deep.equal({
        req: 'req',
        res: 'res',
        errors: 'a',
        data: {
          d: 'd'
        }
      });

      done();

    }

    let p = underTest(pipeline, ctx)
      .then((r) => {result = r; t(); })
      .catch((e) => {result = e; t();});

  });



});