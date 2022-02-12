


import fs from "fs";
const charset = "utf-8";
const { pathApi, pathDataClient } = JSON.parse(fs.readFileSync('./config.json', charset));

function deleteFolderRecursive(path) {
 if( fs.existsSync(path) ) {
     fs.readdirSync(path).forEach( file => {
       const curPath = path + "/" + file;
         if(fs.lstatSync(curPath).isDirectory()) { // recurse
             deleteFolderRecursive(curPath);
         } else { // delete file
             fs.unlinkSync(curPath);
         }
     });
     fs.rmdirSync(path);
   }
 };

[
  pathApi+'/chain.json',
  pathApi+'/signHistory.json',
  pathApi+'/koyn-nodes.json',
  pathApi+'/public-key-pull.json',
  pathApi+'/temp-items-link.json'
].map( path =>
  fs.writeFileSync(path,
  JSON.stringify([]), charset)
);

fs.existsSync(pathDataClient) ?
deleteFolderRecursive(pathDataClient) :
console.log(' not found '+pathDataClient);

fs.writeFileSync(
  pathApi+'/temp-pool-transactions.json',
  JSON.stringify({
    index: 0,
    pool: []
  }, null, 4)
);












// end
