
import navDir from './navDir.js';
import fs from 'fs';
import {default as fsWithCallbacks} from 'fs'
const _fs = fsWithCallbacks.promises;

// create/update -> fs.writeFileSync( file-path, data, options )
// read -> fs.readFileSync( file-path, options )
// delete -> fs.unlinkSync( file-path );

// ! fs.existsSync( file-path/folder-path ) ?
// fs.mkdirSync( folder-path ) : null;

/*
options ->
{
      encoding: "utf8",
      flag: "a+",
      mode: 0o666
    }
    */

 const files = {

   readRecursive: (dir, out) =>
     fs.existsSync(navDir(dir)) ?
     fs.readdirSync(navDir(dir)).forEach( async file =>
     fs.lstatSync(navDir(dir)+'/'+file).isDirectory() ?
     files.readRecursive(dir+'/'+file, out) :
     out(navDir()+dir+'/'+file)) :
     console.log(colors.red(' readRecursive: (dir, out) => no directory found:'+navDir(dir))),

   copyDir: async (src, dest, ignore) => {
        await _fs.mkdir(dest, { recursive: true });
        let entries = await _fs.readdir(src, { withFileTypes: true });

        for (let entry of entries) {
            let srcPath = path.join(src, entry.name);
            let destPath = path.join(dest, entry.name);

            ignore.filter(x=>x==entry.name).length === 0 ?
            entry.isDirectory() ?
                await copyDir(srcPath, destPath, ignore)
                .catch( err => console.log(colors.red(err))) :
                await _fs.copyFile(srcPath, destPath)
                .catch( err => console.log(colors.red(err))) :
                null;
        }
     },

   deleteFolderRecursive: path => {
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
      }

 };

 export default files;
