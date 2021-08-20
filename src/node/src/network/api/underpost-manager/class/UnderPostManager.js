
import { Util } from "../../../../util/class/Util.js";
import { Keys } from "../../../../keys/class/Keys.js";
import { ReadLine } from "../../../../read-line/class/ReadLine.js";
import { FileGestor } from "../../../../file-gestor/class/FileGestor.js";

import fs from "fs";
import colors from "colors/safe.js";
import var_dump from "var_dump";
import path from "path";

export class UnderPostManager {

  constructor(mainDir) {
    this.mainDir = mainDir;
    this.charset = 'utf8';
    this.forceExit = false;
  }

  async init(){

    const updateDataPaths = data => {

        data.underpostClientPath = this.mainDir+'/underpost/underpost-library/';
        data.underpostServerPath = this.mainDir+'/underpost/underpost.net/src/node/src/';
        data.dataPath = this.mainDir+'/data/';

        data.serverPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/api/';
        data.clientPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/client/';
        data.staticPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/static/';

        fs.writeFileSync(
          this.mainDir+'/src/app.js',
          fs.readFileSync(
              this.mainDir+'/underpost/underpost.net/src/node/src/network/api/appServer.js',
              this.charset
          ).replace('{{path}}', this.mainDir),
          this.charset);

        for(let module_ of [
        'microdata.json',
        'serverMods.json',
        'underpostMods.json',
        'robots.txt'
         ]){

           let originPath = fs.readFileSync(
               this.mainDir+'/underpost/underpost-data-template/'+module_,
               this.charset
           );

           let type = module_.split('.').reverse()[0];

           switch (type) {
             case 'json':
                 originPath = JSON.parse(originPath);
                 fs.writeFileSync(
                   this.mainDir+'/data/'+module_,
                   new Util().jsonSave(originPath),
                   this.charset);
               break;
             default:
                 fs.writeFileSync(
                   this.mainDir+'/data/'+module_,
                   originPath,
                   this.charset);

           }
        }

        return data;

    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    const initConfig = async data => {

      data.http_port = parseInt(await new ReadLine().r('http port: '));
      data.ws_port = parseInt(await new ReadLine().r('ws port: '));

      data.network_user.username = await new ReadLine().r('network user username: ');
      data.network_user.email = await new ReadLine().r('network user email: ');
      data.network_user.web = await new ReadLine().r('network user web: ');
      data.network_user.bio = await new ReadLine().r('network user bio: ');

      data.secret_session = new Util().getHash();

      data.reset = false;
      this.forceExit = true;

      return data;

    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    const newTemplate = async () => {

      console.log("newTemplate  ->");

      fs.mkdirSync(this.mainDir+'/data');

      dataTemplate = updateDataPaths(dataTemplate);
      dataTemplate = await initConfig(dataTemplate);

      fs.writeFileSync(
        this.mainDir+'/data/underpost.json',
        new Util().jsonSave(dataTemplate),
        this.charset);

    };

    const updateTemplate = async () => {

      console.log("updateTemplate  ->");

      mainData = updateDataPaths(mainData);
      mainData = new Util().fusionObj([
        dataTemplate, mainData
      ]);

      mainData.reset ?
      mainData = await initConfig(mainData) : null ;

      fs.writeFileSync(
        this.mainDir+'/data/underpost.json',
        new Util().jsonSave(mainData),
        this.charset);

    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    let mainData = {};
    let dataTemplate = JSON.parse(
      fs.readFileSync(this.mainDir+'/underpost/underpost-data-template/underpost.json')
    );

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    if(fs.existsSync(this.mainDir+'/data')){
      mainData = JSON.parse(
        fs.readFileSync(this.mainDir+'/data/underpost.json')
      );
      await updateTemplate();
    }else{
      await newTemplate();
    }

    this.exit();

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

  }

  async keysGestor(){

    // await !fs.existsSync(data.dataPath+'keys') ?
    // fs.mkdirSync(data.dataPath+'keys'):null;

    console.log(colors.yellow
               ("---------------------------"));
    console.log("       KEY GESTOR");
    console.log(colors.yellow
               ("---------------------------"));
    console.log("1 > Create symmetric Key");
    console.log("2 > Create asymmetric Key");
    console.log("3 > exit");
    console.log(colors.yellow
               ("---------------------------"));

    /* never save real password */

    /* let option = new ReadLine().r("Enter option: ");

    switch (option) {
      case 1:
          let symmetricPass = await new ReadLine().h('symmetric key password: ');
          data.symmetricKeys.push(await new Keys().generateSymmetricKeys({
            passphrase: symmetricPass,
            path: data.dataPath+'keys'
          }));
        break;
      case 2:
        let asymmetricPass = await new ReadLine().h('asymmetric key password: ');
        data.asymmetricKeys.push(await new Keys().generateAsymmetricKeys({
          passphrase: asymmetricPass,
          path: data.dataPath+'keys'
        }));
        break;
      default:
        console.log("invalid option");
    } */


  }


  exit(){
    if(this.forceExit){
      try {
        process.exit();
      }catch(err){
        console.log(err);
      }
    }
  }

}
