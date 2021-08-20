

const path = require('path');
const dir = toPath => {
	switch (toPath) {
		case undefined:
				return __dirname.replace(/\\/g, '/');
			  break;
		default:
			  return path.join(__dirname, toPath).replace(/\\/g, '/')
			  break;
	}
};


console.log(dir('..'));
console.log(dir());
console.log(dir('asd'));
console.log(dir('/hola/'));
console.log(dir('/hola'));
console.log(dir('hola'));
