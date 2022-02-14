

import path from 'path';
import util from './util.js';

const __dirname =
util.clearDir(process.argv[1]).split('/')
.slice(0, -1).join('/');

const navDir = toPath => {
	switch (toPath) {
		case undefined:
				return __dirname
		default:
			  return util.clearDir(path.join(__dirname, toPath))
	}
};

export default navDir;
