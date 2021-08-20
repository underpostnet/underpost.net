
//------------------------------------------------------------------------------
//
//      UNDERpost.net NetworK System
//
//      Developed By Francisco Verdugo <fcoverdugoa@underpost.net>
//      https://underpost.net/
//
//------------------------------------------------------------------------------


const shell = require('shelljs');
const colors = require("colors/safe.js");
const fs = require("fs");

var charset = 'utf8';
const dir = path => {
	switch (path) {
		case undefined:
				return __dirname.replace(/\\/g, '/');
			break;
		default:
			return __dirname.replace(/\\/g, '/')+path;
			break;
	}
};

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

eval(fs.readFileSync(dir('/underpost/underpost-library/util.js'), charset));

console.log(colors.yellow('update underpost.net'));

const underpostPaths =
[
  'underpost-library',
  'underpost.net',
  'underpost-data-template'
];

shell.cd('underpost');

for(let path of underpostPaths){
  shell.cd(path);
  shell.exec('git pull origin master');
  shell.cd('..');
}


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

let templateData = JSON.parse(fs.readFileSync(dir('/underpost/underpost-data-template/underpost.json')));
let mainData = JSON.parse(fs.readFileSync(dir('/data/underpost.json')));
mainData = fusionObj([templateData, mainData]);
fs.writeFileSync(dir('/data/underpost.json'), jsonSave(mainData), charset);

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
