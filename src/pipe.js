"use strict";

import co from 'co';

export default function pipe (functions, data) {

  let fns = [].concat(functions);

  return co(function* () {

    try {

      while (fns.length) {

        let fn = fns.shift();

        if (typeof fn !== 'function') {

          throw new TypeError(`factory expects ${fn} to be a function`);
        }

        let r = fn(data);

        if (typeof r.then === 'function') {

          data = yield r;
        }
        else {
          data = r;
        }
      }
    }
    catch (e) {

      return e;
    }

    return data;
  });
}
