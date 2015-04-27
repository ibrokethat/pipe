"use strict";

import assert from 'assert';
import sinon from 'sinon';
import underTest from '../src/pipe';

import {expect} from 'chai';

let fakes;
let ctx;


function gen (v) {

  return (ctx) => {
    ctx.data[v] = v;
    return ctx;
  }
}


function genThrow (v) {

  return (ctx) => {
    ctx.errors = v;
    throw ctx;
  }
}


function genAsync (v) {

  return (ctx) => {

    return new Promise((resolve) => {
      setTimeout(() => {
        ctx.data[v] = v;
        resolve(ctx);
      }, 10)
    })
  }
}


function genAsyncReject (v) {

  return (ctx) => {

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        ctx.errors = v;
        reject(ctx);
      }, 10)
    });
  }
}



describe("test pipe module: ", () => {

  beforeEach(()  =>  {

    fakes = sinon.sandbox.create();
    ctx = {
      req: 'req',
      res: 'res',
      errors: null,
      data: {}
    }

  });


  it('should call each function in a sync pipeline', (done) => {

    let result = false;

    let pipeline = [
      gen('d'),
      gen('a'),
      gen('t'),
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


  it('should call each function in an async pipeline', (done) => {

    let result = false;

    let pipeline = [
      genAsync('d'),
      genAsync('a'),
      genAsync('t'),
      genAsync('e')
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


  it('should call each function in a sync/async pipeline', (done) => {

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


  it('should throw when an async function rejects', (done) => {

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



  it('should throw when a sync function throws', (done) => {

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


  it('should pass each functions output to the next ones input', (done) => {

    let result = false;

    let pipeline = [
      sinon.spy((x) => x*2),
      sinon.spy((x) => x*2),
      sinon.spy((x) => x*2),
      sinon.spy((x) => x*2)
    ];


    let t = () => {
      expect(pipeline[0].calledWith(1)).to.be.true;
      expect(pipeline[1].calledWith(2)).to.be.true;
      expect(pipeline[2].calledWith(4)).to.be.true;
      expect(pipeline[3].calledWith(8)).to.be.true;
      done();

    }

    let p = underTest(pipeline, 1)
      .then((r) => {result = r; t();})
      .catch((e) => {result = e; t();});

  });



});