
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

class UnderPost {

  constructor(){
  }

  setUp(){

    console.log(colors.yellow('install underpost.net modules:'));
    console.log(colors.yellow(' > '+dir('../underpost')));
    ! fs.existsSync(dir('../underpost')) ? fs.mkdirSync(dir('../underpost')) : null;

    shell.cd('..');
    shell.cd('underpost');
    shell.exec('git clone https://github.com/underpostnet/underpost-library');
    shell.exec('git clone https://github.com/underpostnet/underpost.net');
    shell.exec('git clone https://github.com/underpostnet/underpost-data-template');

  };

  upDate(){

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

  }

}

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------




















//------------------------------------------------------------------------------
//------------------------------------------------------------------------------




















//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
