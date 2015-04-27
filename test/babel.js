var babel = require("babel/lib/babel/api/register/node");
babel({
  blacklist: 'regenerator,es6.forOf'
});

