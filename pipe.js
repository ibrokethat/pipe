/**
  @module  async sequence pipeline based upon promises
*/

var async = require('async');
var func = require('func');
var is = require('is');
var iter = require('iter');
var promise = async.promise;
var when = async.when;
var bind = func.bind;
var partial = func.partial;
var forEach = iter.forEach;
var enforce = is.enforce;

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
        try {
          step(unit, output, functions, functions.shift()(value));
        }
        catch (e) {
          output.reject(e);
        }
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

    var output = promise();
    var funcs = [].concat(functions);

    try {
      step(unit, output, funcs, funcs.shift()(value));
    }
    catch (e) {
      output.reject(e);
    }

    return output;

  }

}


exports.pipe     = partial(pipeline, step, when);
exports.step     = step;
exports.pipeline = pipeline;
