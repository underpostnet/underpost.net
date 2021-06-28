
import fileGetContents from "file-get-contents";
// const fileGetContents = require('file-get-contents');

export class RestService {

  constructor(){}

  async getContent(url, fn, err){
    await fileGetContents(url).then(json => {
        fn(JSON.parse(json));
    }).catch(error => {
        err(error);
    });
  }

}
