var assert   = require("assert"),
    sinon    = require("sinon"),
    pipes    = require("../pipe"),
    async    = require("async"),
    pipe     = pipes.pipe,
    step     = pipes.step,
    sequence = pipes.pipeline,
    Promise  = async.Promise,
    fakes;


function makeResolver() {
  return sinon.spy(function (v) {
    var p = Promise.spawn();
    setTimeout(function(){
      p.resolve(v);
    }, 10);
    return p;
  });
}

function makeRejector() {
  return sinon.spy(function (v) {
    var p = Promise.spawn();
    setTimeout(function(){
      p.reject(v);
    }, 10);
    return p;
  });
}


describe("test pipe module: ", function() {


  beforeEach(function() {

    fakes = sinon.sandbox.create();

  });

  afterEach(function() {

    fakes.restore();

  });


  describe("function pipe", function() {


    it("should run an async pipeline where everything resolves", function(done) {

      var p, logUserIn;

      p = [
            makeResolver(),
            makeResolver(),
            makeResolver(),
            makeResolver(),
            makeResolver()
          ];

      logUserIn = pipe(p);

      logUserIn("simon").then(function(value) {

        assert.equal("simon", value);
        assert.equal(1, p[0].callCount);
        assert.equal(1, p[1].callCount);
        assert.equal(1, p[2].callCount);
        assert.equal(1, p[3].callCount);
        assert.equal(1, p[4].callCount);

        done();
      });

    });


    it("should run a pipeline composed of both synchronous and async functions", function(done) {

      var p, logUserIn;

      p = [
            makeResolver(),
            sinon.stub().returns("simon"),
            makeResolver(),
            sinon.stub().returns("simon"),
            makeResolver()
          ];

      logUserIn = pipe(p);

      logUserIn("simon").then(function(value) {

        assert.equal("simon", value);
        assert.equal(1, p[0].callCount);
        assert.equal(1, p[1].callCount);
        assert.equal(1, p[2].callCount);
        assert.equal(1, p[3].callCount);
        assert.equal(1, p[4].callCount);

        done();
      });

    });


    it("should reject it's output if any of the functions reject", function(done) {

      var p, logUserIn;

      p = [
            makeResolver(),
            makeResolver(),
            makeRejector(),
            makeResolver(),
            makeResolver()
          ];

      logUserIn = pipe(p);

      logUserIn("simon").then(
        function() {},
        function(value) {

          assert.equal("simon", value);
          assert.equal(1, p[0].callCount);
          assert.equal(1, p[1].callCount);
          assert.equal(1, p[2].callCount);
          assert.equal(0, p[3].callCount);
          assert.equal(0, p[4].callCount);

          done();
        }
      );

    });


  });

});
