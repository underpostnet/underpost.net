
import fileGetContents from "file-get-contents";
import colors from "colors/safe.js";
import fetch from "node-fetch";
import { Util } from "../../util/class/Util.js";
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
      }).then(res => {
            res.json().then(json => {
                  resolve(json);
            }).catch(error => {
                  resolve(error);
            });
      }).catch(error => {
            resolve(error);
      });
    });
  }

  async getIP(indexIP){

    const sourceIP = [
      ['http://ipecho.net/plain',false],
      ['https://ident.me/',false],
      ['https://v4.ident.me/',false],
      ['https://api.ip.sb/ip',false],
      ['https://api-ipv4.ip.sb/ip',false],
      ['https://api.ipify.org/?format=json',true],
      ['https://api64.ipify.org/?format=json',true]
    ];

    const newAttempIP = async (resolve, error) => {
      indexIP++;
      console.log('timer 1.5s ...');
      await new Util().timer(1500);
      if(indexIP<sourceIP.length){
        console.log(colors.red('error ip url: '+sourceIP[indexIP-1][0]));
        console.log(error);
        console.log(colors.yellow("getIP new attemp: "+sourceIP[indexIP][0]));
        resolve(await this.getIP(indexIP));
      }else {
        resolve(await this.getIP(0));
      }
    };

    return await new Promise((resolve)=>{

      indexIP == undefined ? indexIP = 0 : null;

      fileGetContents(sourceIP[indexIP][0]).then(async content => {

          sourceIP[indexIP][1] == true ? content = JSON.parse(content)['ip'] : null;

          if(new Util().validateIP(content)){
            console.log(colors.yellow('new ip:'+content+' date:'+new Date().toLocaleString()));
            resolve(content);
          }else{
            await newAttempIP(resolve, 'not valid ip content');
          }

      }).catch(async error => {

        await newAttempIP(resolve, error);

      });

    });
  }

  infoReq(req){
    return {
      ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress),
      host: req.headers.host,
      lang: req.acceptsLanguages(),
      browser: req.useragent.browser,
      version: req.useragent.version,
      os: req.useragent.os,
      platform: req.useragent.platform,
      geoIp: new Util().jsonSave(req.useragent.geoIp),
      source: req.useragent.source
    }
  }

}
