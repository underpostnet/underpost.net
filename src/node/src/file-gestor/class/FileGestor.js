
import { Util } from "../../util/class/Util.js";
import { Paint } from "../../paint/class/Paint.js";
import fs from "fs";
import colors from "colors/safe.js";
import readline from 'readline';
import path from 'path';
import mime from 'mime';
import sizeof from "file-sizeof";
import mp3Duration from 'mp3-duration';

export class FileGestor {

  constructor() {

  }

  dir(dirname, toPath){
  	switch (toPath) {
  		case undefined:
  				return dirname.replace(/\\/g, '/');
  			  break;
  		default:
  			  return path.join(dirname, toPath).replace(/\\/g, '/')
  			  break;
  	}
  }

 deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach( file => {
        var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              this.deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
    }
  }

  getAllFilesPath(pathDir, recursive){
    let dataFiles = [];
    const readFiles = async path => {
      if( fs.existsSync(path) ) {
            let objDir = {
              path: path,
              files: []
            };
          fs.readdirSync(path).forEach( file => {
              let curPath = path + "/" + file;
              if(fs.lstatSync(curPath).isDirectory()) {
                  recursive ? readFiles(curPath) : null;
              } else {
                  objDir.files.push(file);
              }
          });
          dataFiles.push(objDir);
        }
    };
    readFiles(pathDir);
    return dataFiles;
  }

   async getDataFile(dir, typeFile){
     return await new Promise( async resolve => {
       if(! fs.existsSync(dir) ){
         return { error: "ENOENT, no such file or directory" };
       }
       let bufferFile = fs.readFileSync(dir);
       try{
          switch (typeFile) {
            case true:
              resolve({
                name: dir.split('/').pop(),
                mimeType: mime.getType(dir),
                buffer: bufferFile,
                base64: bufferFile.toString('base64'),
                json: Buffer.from(bufferFile.toString('base64'), 'base64').toString(),
                obj: JSON.parse(bufferFile.toString()),
                genesis_dir: dir,
                size: {
                  SI: sizeof.SI(dir),
                  IEC: sizeof.IEC(dir)
                },
                stats: fs.statSync(dir)
              });
              break;
            case 'mp3':
              let duration = await new Promise( resolve => {
                mp3Duration(dir, (err, duration) => {
                  resolve(duration);
                });
              });
              resolve({
                name: dir.split('/').pop(),
                mimeType: mime.getType(dir),
                buffer: bufferFile,
                base64: bufferFile.toString('base64'),
                source: 'data:'+mime.getType(dir)+';base64,'+bufferFile.toString('base64'),
                raw: bufferFile.toString(),
                genesis_dir: dir,
                secondsDuration: duration,
                size: {
                  SI: sizeof.sizeof.SI(bufferFile),
                  IEC: sizeof.sizeof.IEC(bufferFile)
                },
                stats: fs.statSync(dir)
              });
              break;
            default:
              resolve({
                name: dir.split('/').pop(),
                mimeType: mime.getType(dir),
                buffer: bufferFile,
                base64: bufferFile.toString('base64'),
                source: 'data:'+mime.getType(dir)+';base64,'+bufferFile.toString('base64'),
                raw: bufferFile.toString(),
                genesis_dir: dir,
                size: {
                  SI: sizeof.sizeof.SI(bufferFile),
                  IEC: sizeof.sizeof.IEC(bufferFile)
                },
                stats: fs.statSync(dir)
              });
              break;
          }
       }catch(err){
         return { error: err }
       }
     });
   }

}
