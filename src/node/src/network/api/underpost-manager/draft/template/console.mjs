//  Developed By Francisco Verdugo <fcoverdugoa@underpost.net>
//  https://github.com/underpostnet/underpost-network

import { MainConsole } from
"file://{{path}}/underpost/underpost.net/src/node/src/network/api/main-console/class/MainConsole.js";
import { Util } from
"file://{{path}}/underpost/underpost.net/src/node/src/util/class/util.js";
import { FileGestor } from
"file://{{path}}/underpost/underpost.net/src/node/src/file-gestor/class/FileGestor.js";


let dir = "{{path}}";


import fs from "fs";

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

var charset = 'utf8';
var data = JSON.parse(fs.readFileSync(dataPath));

//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

const MainConsole = new MainConsole(dir);

data.reset ?

((()=>{

  fs.mkdirSync(dir+'/data/keys');
  fs.mkdirSync(dir+'/data/keys/symmetrict');
  fs.mkdirSync(dir+'/data/keys/asymmetrict');

  MainConsole.initConfig();

})()):

((()=>{

  new FileGestor().logReadDirectory({
    title: 'Asymmetric Keys Directory',
    path: (dir+'/data/keys/asymmetrict'),
    recursiveFolder: true,
    displayFolder: true,
    type: 'asymmetricKeys'
  });

  MainConsole.keysGestor();

})());





//------------------------------------------------------------------------------
//------------------------------------------------------------------------------

















//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
