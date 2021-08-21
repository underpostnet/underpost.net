
import { Util } from "../../util/class/Util.js";
import { Paint } from "../../paint/class/Paint.js";
import fs from "fs";
import colors from "colors/safe.js";
import readline from 'readline';
import path from 'path';

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

          function rowKey(file, pathKoyn) {

            this.name = file;
            this.type = file.split('.')[1] ? file.split('.')[1] : 'folder';
            this.path = pathKoyn.split(obj.path)[1]+'/'+file;

            if(this.type=='pem' || this.type=='json'){
              let date = pathKoyn.split('/').reverse()[0];
              this.date = new Date(parseInt(date)).toLocaleString();
              this.timestamp = date;
            }else{
              this.date = new Date(parseInt(file.split('.')[0])).toLocaleString();
              this.timestamp = file.split('.')[0];
            }


          }

          toInitReader.forEach(file => {
            let currentFile = new rowKey(file.name, path);
            // obj.displayFolder
            if(currentFile.type == 'folder'){
              if(obj.displayFolder){
                // table.push({});
                table.push(currentFile);
              }
            }else{
              table.push(currentFile);
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
      new Paint().underpostOption('white', '', obj.path);
      new Util().l(table) > 0 ?
      console.table(table) :
      empty = true ;
    }

    empty ? console.log('Empty Directory') : null;

  }

}
