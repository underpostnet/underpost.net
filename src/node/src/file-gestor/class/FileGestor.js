
import { Util } from "../../util/class/Util.js";
import { Paint } from "../../paint/class/Paint.js";
import fs from "fs";
import colors from "colors/safe.js";
import readline from 'readline';
import path from 'path';
import mime from 'mime';

export class FileGestor {

  constructor() {

  }

  dir(toPath, dirname){
  	switch (toPath) {
  		case undefined:
  				return dirname.replace(/\\/g, '/');
  			  break;
  		default:
  			  return path.join(dirname, toPath).replace(/\\/g, '/')
  			  break;
  	}
  }


    async logReadDirectoryKeys(mainDir, charset, type, BCmanager, KEYS, blockChainConfig){

      let tempData = JSON.parse(fs.readFileSync(
        mainDir+'/data/underpost.json',
        charset
      ));

      let pathKeys = mainDir+'/data/keys/'+type;
      console.log(this.getAllFilesPath(pathKeys, true));

      console.log("path: "+pathKeys);
      let tableKeys = KEYS.getFixKeyArr(tempData[(type+'Keys')]);

      switch (type) {
        case "symmetric":
          console.table(tableKeys);
          break;
        case "asymmetric":

          let BCobj = await BCmanager.instanceStaticChainObj(blockChainConfig);
          let chainObj = BCobj.chainObj;
          let chain = BCobj.chain;
          let validateChain = BCobj.validateChain;

          let tableAsymmetricKeys = [];

          for(let rowKey of tableKeys){
            if(validateChain.global == true){
              let amountData = await chainObj.currentAmountCalculator(
                fs.readFileSync(
                  mainDir+'/data/keys/asymmetric/'+rowKey.timestamp+'/public.pem')
                  .toString('base64'),
                false
              );
              rowKey.amount = amountData.amount;
            }else{
              rowKey.amount = "invalid chain";
            }
            tableAsymmetricKeys.push(rowKey);
          }

          console.table(tableAsymmetricKeys);
          break;
        default:
          new Paint().underpostOption('red', 'error', 'invalid type key');
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

   getDataFile(dir, json){
     if(! fs.existsSync(dir) ){
       return { error: "ENOENT, no such file or directory" };
     }
     let bufferFile = fs.readFileSync(dir);
     try{
       if(!json){
         return {
           name: dir.split('/').pop(),
           mimeType: mime.getType(dir),
           buffer: bufferFile,
           base64: bufferFile.toString('base64'),
           source: 'data:'+mime.getType(dir)+';base64,'+bufferFile.toString('base64'),
           raw: bufferFile.toString(),
           genesis_dir: dir
         }
       }else{
         return {
           name: dir.split('/').pop(),
           mimeType: mime.getType(dir),
           buffer: bufferFile,
           base64: bufferFile.toString('base64'),
           json: Buffer.from(bufferFile.toString('base64'), 'base64').toString(),
           obj: JSON.parse(bufferFile.toString()),
           genesis_dir: dir
         }
       }
     }catch(err){
       return { error: err }
     }
   }

}
