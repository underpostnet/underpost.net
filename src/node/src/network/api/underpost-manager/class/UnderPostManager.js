
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
  }

  async init(){

    await this.setDataTemplate();

  }

  async setDataTemplate(){

    const updateDataPaths = data => {

        data.underpostClientPath = this.mainDir+'/underpost/underpost-library/';
        data.underpostServerPath = this.mainDir+'/underpost/underpost.net/src/node/src/';
        data.dataPath = this.mainDir+'/data/';

        data.serverPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/api/';
        data.clientPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/client/';
        data.staticPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/static/';

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

    const newTemplate = () => {

      fs.mkdirSync(this.mainDir+'/data');
      dataTemplate = updateDataPaths(dataTemplate);
      console.log('init config');

    };

    const updateTemplate = () => {

      let mainData = JSON.parse(
        fs.readFileSync(this.mainDir+'/data/underpost.json')
      );
      mainData = updateDataPaths(mainData);
      mainData = new Util().fusionObj([
        mainData, dataTemplate
      ]);

      mainData.reset ?
      console.log('init config') :
      console.log('update success') ;

    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    let dataTemplate = JSON.parse(
      fs.readFileSync(this.mainDir+'/underpost/underpost-data-template/underpost.json')
    );

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    ! fs.existsSync(this.mainDir+'/data') ?
    newTemplate() :
    null ;

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

  }

  async initConfig(){

    var dataSave = JSON.parse(fs.readFileSync(
      this.mainDir+'/data/underpost.json'
    ));

    console.log('config init');

    dataSave.http_port = parseInt(await new ReadLine().r('http port: '));
    dataSave.ws_port = parseInt(await new ReadLine().r('ws port: '));

    dataSave.network_user.username = await new ReadLine().r('network user username: ');
    dataSave.network_user.email = await new ReadLine().r('network user email: ');
    dataSave.network_user.web = await new ReadLine().r('network user web: ');
    dataSave.network_user.bio = await new ReadLine().r('network user bio: ');

    dataSave.secret_session = new Util().getHash();

    dataSave.reset = false;

    await fs.writeFileSync(
      this.mainDir+'/data/underpost.json',
      new Util().jsonSave(dataSave)
    );

  }

  keysGestor(){

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

}
