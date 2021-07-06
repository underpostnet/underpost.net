
import fileGetContents from "file-get-contents";
import colors from "colors/safe.js";
// const fileGetContents = require('file-get-contents');

export class RestService {

  constructor(){}

  async getJSON(url){
    return await new Promise((resolve)=>{
      fileGetContents(url).then(json => {
          console.log(colors.blue("getJSON( "+url+" ) success ->"));
          resolve(JSON.parse(json));
      }).catch(error => {
          console.log(colors.blue("getJSON( "+url+" ) error ->"));
          console.log(error);
          resolve(error);
      });
    });
  }

}
