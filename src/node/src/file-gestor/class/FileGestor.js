
import { Util } from "../../util/class/Util.js";
import fs from "fs";
import colors from "colors/safe.js";
import readline from 'readline';

export class FileGestor {

  constructor() {

  }


  async logReadDirectory(obj){
    let table = [];
    const readerFiles = (path, toInitReader) => {

      switch (obj.type) {







        //- symmetricKeys -----------
        case 'asymmetricKeys':
          function rowKoynKey(file, pathKoyn) {

            this.name = file;
            this.type = file.split('.')[1] ? file.split('.')[1] : 'folder';
            this.path = pathKoyn.split(obj.path)[1]+'/'+file;

            if(this.type=='pem'){
              let date = pathKoyn.split('/').reverse()[0];
              this.date = new Date(parseInt(date)).toLocaleString();
              this.timestamp = date;
            }else{
              this.date = new Date(parseInt(file.split('.')[0])).toLocaleString();
              this.timestamp = file.split('.')[0];
            }


          }

          toInitReader.forEach(file => {
            let currentFile = new rowKoynKey(file.name, path);
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

    readerFiles(
      obj.path,
      fs.readdirSync(obj.path, { withFileTypes: true })
    );

    console.log(colors.yellow("\n > "+new Util().tu(obj.title)+' | '+obj.path));
    // table.push({});
    new Util().l(table) > 0 ?
    console.table(table):
    consle.log('Empty Directory');
  }

}
