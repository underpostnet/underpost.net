
import fileGetContents from "file-get-contents";
// const fileGetContents = require('file-get-contents');

export class RestService {

  constructor(){}

  async getContent(url, storage, fn, err){
    await fileGetContents(url).then(json => {
        fn(JSON.parse(json), storage);
    }).catch(error => {
        err(error);
    });
  }

}
