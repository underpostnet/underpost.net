
import { Util } from "../../../../util/class/Util.js";
import { Keys } from "../../../../keys/class/Keys.js";
import { ReadLine } from "../../../../read-line/class/ReadLine.js";
import { FileGestor } from "../../../../file-gestor/class/FileGestor.js";
import { Navi } from "../../../../navi/class/Navi.js";
import { Paint } from "../../../../paint/class/paint.js";

import fs from "fs";
import colors from "colors/safe.js";
import var_dump from "var_dump";
import path from "path";

export class UnderPostManager {

  constructor(mainDir) {

    this.mainDir = mainDir;
    this.charset = 'utf8';
    this.forceExit = false;

    new Paint().underpostBanner();

  }

  async init(){

    //--------------------------------------------------------------------------
    // BASE
    //--------------------------------------------------------------------------

    const updateDataPaths = data => {

        data.underpostClientPath = this.mainDir+'/underpost/underpost-library/';
        data.underpostServerPath = this.mainDir+'/underpost/underpost.net/src/node/src/';
        data.dataPath = this.mainDir+'/data/';

        data.serverPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/api/';
        data.clientPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/client/';
        data.staticPath = this.mainDir+'/underpost/underpost.net/src/node/src/network/static/';

        fs.writeFileSync(
          this.mainDir+'/app.js',
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

      new Paint().underpostTextBotbar("Set User Settings");

      data.http_port = parseInt(await new ReadLine().r(
        new Paint().underpostInput('http port')));

      data.ws_port = parseInt(await new ReadLine().r(
        new Paint().underpostInput('ws port')));

      data.network_user.username = await new ReadLine().r(
        new Paint().underpostInput('network user username'));

      data.network_user.email = await new ReadLine().r(
        new Paint().underpostInput('network user email'));

      data.network_user.web = await new ReadLine().r(
        new Paint().underpostInput('network user web'));

      data.network_user.bio = await new ReadLine().r(
        new Paint().underpostInput('network user bio'));

      new Paint().underpostBar();

      data.reset = false;
      this.forceExit = true;

      return data;

    };

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    const newTemplate = async () => {

      new Paint().underpostTextBotbar("Install Template ...");

      await this.dataFolderCheck();
      dataTemplate = updateDataPaths(dataTemplate);

      dataTemplate = await initConfig(dataTemplate);
      dataTemplate.secret_session = new Util().getHash();

      fs.writeFileSync(
        this.mainDir+'/data/underpost.json',
        new Util().jsonSave(dataTemplate),
        this.charset);

      mainData = JSON.parse(new Util().JSONstr(dataTemplate));

    };

    const updateTemplate = async () => {

      new Paint().underpostTextBotbar("Update Template ...");

      await this.dataFolderCheck();
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
    // KEYS FUNCTIONS
    //--------------------------------------------------------------------------

    const KEYS = {
      createSymmetric: async () => {

        let tempData = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/underpost.json',
          this.charset
        ));

        let symmetricPass = await new ReadLine().r(
          new Paint().underpostInput('symmetric key password')
        );

        new Paint().underpostOption('yellow', ' ', 'Generating Keys ...');

        new Paint().underpostBar();

        tempData.symmetricKeys.push(await new Keys().generateSymmetricKeys({
          passphrase: symmetricPass,
          path: this.mainDir+'/data/keys'
        }));

        fs.writeFileSync(this.mainDir+'/data/underpost.json',
        new Util().jsonSave(tempData),
        this.charset);

      }
    };

    //--------------------------------------------------------------------------
    // NAVI
    //--------------------------------------------------------------------------

    const symmetricKeysGestor = async () => {
      await new Navi().init({
        preTitle: null,
        title: 'Symmetric Keys Gestor',
        postTitle: async () => {
          await new FileGestor().logReadDirectory({
              path: this.mainDir+'/data/keys/symmetric',
              recursiveFolder: true,
              displayFolder: false,
              type: 'keys'
          });
        },
        options: [
          {
            text: 'Create Key',
            fn: async ()=>{
              await KEYS.createSymmetric();
            }
          },
          {
            text: 'Delete Key',
            fn: async ()=>{

            }
          },
          {
            text: 'View Key',
            fn: async ()=>{

            }
          },
          {
            text: 'Back Keys Manager',
            fn: async ()=>{
              await keysManager();
            }
          },
          {
            text: 'Exit',
            fn: async ()=>{
              this.forceExit = true;
              this.exit();
            }
          }
        ]
      });
    };

    const keysManager = async () => {
      await new Navi().init({
        preTitle: null,
        title: 'Keys Manager',
        postTitle: null,
        options: [
          {
            text: 'Symmetric Keys Gestor',
            fn: async ()=>{
              await symmetricKeysGestor();
            }
          },
          {
            text: 'Asymmetric Keys Gestor',
            fn: async ()=>{

            }
          },
          {
            text: 'Back Main Console Menu',
            fn: async ()=>{
              await this.init();
            }
          },
          {
            text: 'Exit',
            fn: async ()=>{
              this.forceExit = true;
              this.exit();
            }
          }
        ]
      });
    };

    const mainConsoleMenu = async () => {
      await new Navi().init({
        preTitle: async ()=>{
          await this.underpostActiveUserLog();
        },
        title: 'Main Console Menu',
        postTitle: null,
        options: [
          {
            text: 'Set User Settings',
            fn: async ()=>{
              mainData.reset = true;
              await updateTemplate();
            }
          },
          {
            text: 'Keys Manager',
            fn: async ()=>{
              await keysManager();
            }
          },
          {
            text: 'Exit',
            fn: async ()=>{
              this.forceExit = true;
              this.exit();
            }
          }
        ],
        postMsg: null
      });
    };

    //--------------------------------------------------------------------------
    // INIT
    //--------------------------------------------------------------------------

    let mainData = {};
    let dataTemplate = JSON.parse(
      fs.readFileSync(this.mainDir+'/underpost/underpost-data-template/underpost.json')
    );

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    if(
      fs.existsSync(this.mainDir+'/data')
      &&
      fs.existsSync(this.mainDir+'/data/underpost.json')
    ){

        mainData = JSON.parse(
          fs.readFileSync(this.mainDir+'/data/underpost.json')
        );
        await updateTemplate();

    }else{
      await newTemplate();
    }

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

    await mainConsoleMenu();

    this.exit();

    //--------------------------------------------------------------------------
    //--------------------------------------------------------------------------

  }

  async dataFolderCheck(){

    ! fs.existsSync(this.mainDir+'/data') ?
    fs.mkdirSync(this.mainDir+'/data') : null;

    ! fs.existsSync(this.mainDir+'/data/keys') ?
    fs.mkdirSync(this.mainDir+'/data/keys') : null;

  }

  async underpostActiveUserLog(){

    let tempData = JSON.parse(fs.readFileSync(
      this.mainDir+'/data/underpost.json',
      this.charset
    ));

    new Paint().underpostTextBotbar('Active user data');
    new Paint().underpostOption('yellow', 'username  ', tempData.network_user.username);
    new Paint().underpostOption('yellow', 'email     ', tempData.network_user.email);
    new Paint().underpostOption('yellow', 'web       ', tempData.network_user.web);
    new Paint().underpostOption('yellow', 'bio       ', tempData.network_user.bio);
    new Paint().underpostOption('yellow', 'http port ', tempData.http_port);
    new Paint().underpostOption('yellow', 'ws port   ', tempData.ws_port);
    new Paint().underpostBar();

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
