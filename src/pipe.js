"use strict";

import co from 'co';

export default function pipe (functions, data) {

  let fns = [].concat(functions);

  return co(function* () {

    try {

      while (fns.length) {

        let r = fns.shift()(data);

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
