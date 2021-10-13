
import { Util } from "../../util/class/Util.js";
import { Paint } from "../../paint/class/Paint.js";
import colors from "colors/safe.js";
import path from 'path';

export class UnderpostRadio {

  constructor(){}

  async getNonRecursiveMp3SingleDirV1(app, uri, mainDir, genre){
      let mainPathMp3 = mainDir+'single/'+genre;
      let singlesDataRadio = [];
      // console.log(mainPathMp3);
      for(let mp3File of new FileGestor().getAllFilesPath(mainPathMp3)[0].files){

        let mp3PathAbs = mainPathMp3+'/'+mp3File;
        let dataFileMp3 = await new FileGestor().getDataFile(mp3PathAbs, 'mp3');



              app.get((uri+'/'+mp3File), (req, res) => {
                // console.log("load ->"+mp3PathAbs);
                res.sendFile(mp3PathAbs);
              });

              // console.log(uri+'/'+mp3File);
              // console.log(mp3PathAbs);


              let file_dir = (mp3PathAbs);
              let file_name = mp3File;
              let file_size = dataFileMp3.size.SI.MB;
              let file_ext = path.extname(mp3File);
              if(file_ext==''){
                file_ext = 'folder';
              }else{
                file_ext = file_ext.split('.')[1];
              }
              let duration = dataFileMp3.secondsDuration;

              let file_time;
              let hour = parseInt(duration/3600);
              let min = parseInt(((duration/3600)-hour)*60);
              let sec = aprox((duration - (min*60)) ,0);
              if(l((''+min))==1){
                min = '0'+min;
              }
              if(l((''+sec))==1){
                sec = '0'+sec;
              }
              if(l((''+sec))>2){
                sec = ''+sec[0]+sec[1];
              }
              file_time = (hour+':'+min+':'+sec);

              singlesDataRadio.push(
                [file_dir,file_name,file_ext,file_time,file_size]
              );

      }

      console.log("singlesDataRadio radio "+genre+" ->");
      // console.log(singlesDataRadio);

      app.post(('/stream/single/'+genre), (req, res) => {
        console.log("post radio "+genre+" ->");
        res.send(JSONstr(singlesDataRadio));
      });

  }

}
