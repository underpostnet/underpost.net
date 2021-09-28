
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

  dir(toPath){
  	switch (toPath) {
  		case undefined:
  				return __dirname.replace(/\\/g, '/');
  			  break;
  		default:
  			  return path.join(__dirname, toPath).replace(/\\/g, '/')
  			  break;
  	}
  }

  async logReadDirectory(obj){
    let table = [];
    const readerFiles = (path, toInitReader) => {

      switch (obj.type) {




        case 'keys':

          let banNames = ["active.json"];

          function rowKey(file, pathKoyn) {

            this.name = file;
            this.type = file.split('.')[1] ? file.split('.')[1] : 'folder';
            this.path = pathKoyn.split(obj.path)[1]+'/'+file;

            if(this.type=='pem' || this.type=='json'){
              let date = pathKoyn.split('/').reverse()[0];
              this.date = new Date(parseInt(date)).toLocaleString();
              // this.timestamp = date;
            }else{
              this.date = new Date(parseInt(file.split('.')[0])).toLocaleString();
              // this.timestamp = file.split('.')[0];
            }


          }

          toInitReader.forEach(file => {
            let currentFile = new rowKey(file.name, path);
            if(!banNames.includes(file.name)){
              // obj.displayFolder
              if(currentFile.type == 'folder'){
                if(obj.displayFolder){
                  // table.push({});
                  table.push(currentFile);
                }
              }else{
                table.push(currentFile);
              }
            }
            currentFile.type == 'folder' && obj.recursiveFolder ?
            readerFiles(
              path+'/'+currentFile.name,
              fs.readdirSync(path+'/'+currentFile.name, { withFileTypes: true })
            ): null;


          });
          break;
          //--------------------------------------------------------------------




        default:
          null;
      }
    }

    let empty = false;
    fs.existsSync(obj.path) ? readerFiles(
      obj.path,
      fs.readdirSync(obj.path, { withFileTypes: true })
    ) : empty = true;

    if(!empty){
      new Paint().underpostOption('white', ' ', obj.path);
      new Util().l(table) > 0 ?
      console.table(table) :
      empty = true ;
    }

    empty ?
    ((()=>{
      // new Paint().underpostBar();
      new Paint().underpostTextBotbar('Empty Directory');
    })()) : null;

  }


  async deleteFolderRecursive(path) {
  if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file) {
        var curPath = path + "/" + file;
          if(fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
      fs.rmdirSync(path);
    }
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
