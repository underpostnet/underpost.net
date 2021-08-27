
import fileGetContents from "file-get-contents";
import colors from "colors/safe.js";
import fetch from 'node-fetch';
// const fileGetContents = require('file-get-contents');

export class RestService {

  constructor(){}

  async getJSON(url){
    return await new Promise((resolve)=>{
      fileGetContents(url).then(json => {
          // console.log(colors.blue("getJSON( "+url+" ) success ->"));
          resolve(JSON.parse(json));
      }).catch(error => {
          // console.log(colors.blue("getJSON( "+url+" ) error ->"));
          // console.log(error);
          resolve(error);
      });
    });
  }

  async getRawContent(path){
    return await new Promise((resolve)=>{
      fileGetContents(path).then(content => {
          // console.log(colors.blue("getJSON( "+url+" ) success ->"));
          resolve(content);
      }).catch(error => {
          // console.log(colors.blue("getJSON( "+url+" ) error ->"));
          // console.log(error);
          resolve(error);
      });
    });
  }

  async postJSON(url, data){
    return await new Promise((resolve)=>{
      fetch(url, {
              method: 'post',
              body:    JSON.stringify(data),
              headers: { 'Content-Type': 'application/json' },
      }).then(res => res.json()).then(json => {
        resolve(json);
      });
    });
  }

}
