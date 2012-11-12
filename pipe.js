/**
  @module  async sequence pipeline based upon promises
*/

var async   = require("async"),
    func    = require("func"),
    is      = require("is"),
    iter    = require("iter"),
    Promise = async.Promise,
    when    = async.when,
    bind    = func.bind,
    partial = func.partial,
    forEach = iter.forEach,
    enforce = is.enforce;

/**
  @description  Binds incoming and outgoing parameters from an
                array of functions onto a sequence of promises
  @param        {function} unit
  @param        {promise} output
  @param        {array} functions
  @param        {any} input
*/
function step(unit, output, functions, input) {

  unit(input).then(

    function (value) {

      if (functions.length) {
        step(unit, output, functions, functions.shift()(value));
      }
      else {
        output.resolve(value);
      }

    },
    bind(output, output.reject)
  );

}



/**
  @description  Composes a function from unit & step (bind) functions
                and an array of functions.
  @param        {function} step
  @param        {function} unit
  @param        {array} functions
  @return       {promise}
*/
function pipeline(step, unit, functions) {

  forEach(functions, partial(enforce, "function"));

  return function (value) {

    var output = Promise.spawn(),
        funcs = [].concat(functions);

    step(unit, output, funcs, funcs.shift()(value));

    return output;

  }

}


exports.pipe     = partial(pipeline, step, when);
exports.step     = step;
exports.pipeline = pipeline;
