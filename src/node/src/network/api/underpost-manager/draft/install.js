
//------------------------------------------------------------------------------
//
//      UNDERpost.net NetworK System
//
//      Developed By Francisco Verdugo <fcoverdugoa@underpost.net>
//      https://underpost.net/
//
//------------------------------------------------------------------------------

const fs = require('fs');
const colors = require('colors/safe.js');
const shell = require('shelljs');
const path = require('path');

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

var charset = 'utf8';

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


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

console.log(colors.yellow('INSTALL PATH > '+dir('..')));
! fs.existsSync(dir('../underpost')) ? fs.mkdirSync(dir('../underpost')) : null;

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

shell.cd('..');
shell.cd('underpost');
shell.exec('git clone https://github.com/underpostnet/underpost-library');
shell.exec('git clone https://github.com/underpostnet/underpost.net');
shell.exec('git clone https://github.com/underpostnet/underpost-data-template');

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

var consoleContent =
fs.readFileSync(
	dir('../underpost/underpost.net/src/node/src/network/client/template/console.mjs'),
	charset)
.replace(/{{path}}/g, dir('..'));

! fs.existsSync(dir('../src')) ? fs.mkdirSync(dir('../src')) : null;

fs.writeFileSync(
				 dir('../src/console.mjs'),
				 consoleContent, charset);

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

var appContent =
fs.readFileSync(dir('/app.js'), charset)
.replace('{{path}}', dir());

fs.writeFileSync(
				 dir('/app.js'),
				 appContent, charset);

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

var mainData = JSON.parse(
	fs.readFileSync(dir('/underpost/underpost-data-template/underpost.json')
	, charset));

mainData.underpostClientPath = dir('/underpost/underpost-library/');
mainData.underpostServerPath = dir('/underpost/underpost.net/src/node/src/');
mainData.dataPath = dir('/data/');

mainData.serverPath = dir('/underpost/underpost.net/src/node/src/network/api/');
mainData.clientPath = dir('/underpost/underpost.net/src/node/src/network/client/');
mainData.staticPath = dir('/underpost/underpost.net/src/node/src/network/static/');

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

! fs.existsSync(dir('/data')) ? fs.mkdirSync(dir('/data')) : null;
fs.writeFileSync(
				 dir('/data/underpost.json'),
				 JSON.stringify(mainData, null, 4), charset);

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

fs.writeFileSync(
				 dir('/data/microdata.json'),
				 JSON.stringify(
					 JSON.parse(fs.readFileSync(dir('/underpost/underpost-data-template/microdata.json')))
					 , null, 4), charset);

fs.writeFileSync(
				 dir('/data/serverMods.json'),
				 JSON.stringify(
					 JSON.parse(fs.readFileSync(dir('/underpost/underpost-data-template/serverMods.json')))
					 , null, 4), charset);

fs.writeFileSync(
				 dir('/data/underpostMods.json'),
				 JSON.stringify(
					 JSON.parse(fs.readFileSync(dir('/underpost/underpost-data-template/underpostMods.json')))
					 , null, 4), charset);

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

fs.writeFileSync(
				 dir('/data/robots.txt'),
				 fs.readFileSync(dir('/underpost/underpost-data-template/robots.txt'),
				 charset));

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------






// end
