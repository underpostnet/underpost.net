


import fs from "fs";
const charset = "utf8";
const { pathApi, pathClient } = JSON.parse(fs.readFileSync('./config.json', charset));

function deleteFolderRecursive(path) {
 if( fs.existsSync(path) ) {
     fs.readdirSync(path).forEach( file => {
       var curPath = path + "/" + file;
         if(fs.lstatSync(curPath).isDirectory()) { // recurse
             deleteFolderRecursive(curPath);
         } else { // delete file
             fs.unlinkSync(curPath);
         }
     });
     fs.rmdirSync(path);
   }
 };

const pathsEmptyArray = [
  pathApi+'/chain.json',
  pathApi+'/signHistory.json',
  pathApi+'/koyn-nodes.json',
  pathApi+'/public-key-pull.json',
  pathApi+'/temp-items-link.json'
];
const pathsDeleteArray = [];

deleteFolderRecursive(pathClient+'/data');

pathsEmptyArray.map( path => fs.writeFileSync(path,
  JSON.stringify([]), charset));

pathsDeleteArray.map( path => fs.unlinkSync(path));

fs.writeFileSync(
  pathApi+'/temp-pool-transactions.json',
  JSON.stringify({
    index: 0,
    pool: []
  }, null, 4)
);












// end
