
import { Util } from "../../../../util/class/Util.js";
import { Keys } from "../../../../keys/class/Keys.js";
import { ReadLine } from "../../../../read-line/class/ReadLine.js";
import { FileGestor } from "../../../../file-gestor/class/FileGestor.js";
import { RestService } from "../../../../rest/class/restService.js";
import { Navi } from "../../../../navi/class/Navi.js";
import { Paint } from "../../../../paint/class/paint.js";
import { WSclient } from "../../../../network/api/koyn/class/wsClient.js";
import { BlockChain } from "../../../../network/api/koyn/class/blockChain.js"

import fs from "fs";
import colors from "colors/safe.js";
import var_dump from "var_dump";
import path from "path";

export class UnderPostManager {

  constructor(mainDir) {

    this.mainDir = mainDir;
    this.charset = 'utf8';


    new Paint().underpostBanner();

  }

  async init(){

    // test area
    // await new RestService().getIP();
    // return;

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
        'blockchain-config.json',
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

      // check network_user obj
      if(!new Util().objEq(dataTemplate.network_user, mainData.network_user)){
        mainData.network_user = new Util().fusionObj([
          dataTemplate.network_user,
          mainData.network_user
        ]);
      }

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
      create: async (type) => {

        let tempData = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/underpost.json',
          this.charset
        ));

        let keyPass = await new ReadLine().r(
          new Paint().underpostInput('key password')
        );

        new Paint().underpostBar();

        new Paint().underpostOption('yellow', ' ', 'Generating Keys ...');

        new Paint().underpostBar();

        switch (type) {
          case 'symmetricKeys':
            tempData[type].push(await new Keys().generateSymmetricKeys({
              passphrase: keyPass,
              path: this.mainDir+'/data/keys'
            }));
            break;
          case 'asymmetricKeys':
            tempData[type].push(await new Keys().generateAsymmetricKeys({
              passphrase: keyPass,
              path: this.mainDir+'/data/keys'
            }));
            break;
          default:
            return async () => {
              new Paint().underpostOption('red', 'error', 'not valid key type');
              new Paint().underpostBar();
            }
        }

        fs.writeFileSync(this.mainDir+'/data/underpost.json',
        new Util().jsonSave(tempData),
        this.charset);

        return async () => {
          new Paint().underpostOption('yellow', 'success', 'create key '+
          tempData[type][new Util().l(tempData[type])-1]);
          new Paint().underpostBar();
        }

      },
      delete: async (type) => {

        let tempData = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/underpost.json',
          this.charset
        ));

        let indexKey =
        parseInt(await new ReadLine().r(
          new Paint().underpostInput('index key')
        ));

        new Paint().underpostBar();

        let fixKeysArr = [];
        let indexKeyReal = 0;
        for(let key_time of tempData[type]){
          fixKeysArr.push({date: key_time, index: indexKeyReal});
          fixKeysArr.push({date: key_time, index: indexKeyReal});
          indexKeyReal++;
        }

        // console.log('delete -> ');
        // console.log(fixKeysArr[indexKey]);

        if(fixKeysArr[indexKey]!=undefined){
          //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
          let timeStampDel = JSON.parse(new Util().JSONstr(
            fixKeysArr[indexKey].date
          ));

          tempData[type].splice(fixKeysArr[indexKey].index, 1);

          fs.writeFileSync(this.mainDir+'/data/underpost.json',
          new Util().jsonSave(tempData),
          this.charset);

          await new FileGestor().deleteFolderRecursive(
            this.mainDir+'/data/keys/'+type.split('Keys')[0]+'/'+timeStampDel
          );

          return async () => {
            new Paint().underpostOption('yellow', 'success', 'Delete key folder '+timeStampDel);
            new Paint().underpostBar();
          }
          //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
        }else{
          return async () => {
            new Paint().underpostOption('red', 'error', 'invalid index key');
            new Paint().underpostBar();
          }
        }


      },
      view: async (type) => {

        let tempData = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/underpost.json',
          this.charset
        ));

        let indexKey =
        parseInt(await new ReadLine().r(
          new Paint().underpostInput('index key')
        ));

        new Paint().underpostBar();

        let fixKeysArr = [];
        let indexKeyReal = 0;
        for(let key_time of tempData[type]){
          fixKeysArr.push({date: key_time, index: indexKeyReal});
          fixKeysArr.push({date: key_time, index: indexKeyReal});
          indexKeyReal++;
        }

        // console.log('delete -> ');
        // console.log(fixKeysArr[indexKey]);

        if(fixKeysArr[indexKey]!=undefined){
          //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
          let timeStampKey = JSON.parse(new Util().JSONstr(
            fixKeysArr[indexKey].date
          ));

          switch (type) {
            case "symmetricKeys":
                let iv = await new RestService().
                getJSON(this.mainDir+'/data/keys/'+type.split('Keys')[0]+'/'
                +timeStampKey+'/iv.json');
                let key = await new RestService().
                getJSON(this.mainDir+'/data/keys/'+type.split('Keys')[0]+'/'
                +timeStampKey+'/key.json');
              return async () => {
                new Paint().underpostOption('white', ' ', 'Symmetric Key Selected');
                function rowKey(obj){
                  this.index = obj.index;
                  this.path = obj.path;
                  this.date = new Date(parseInt(obj.path.split('/')[1])).toLocaleString();
                  this.iv = obj.iv;
                  this.key = obj.key;
                }
                console.table(
                  new rowKey({
                    iv: iv,
                    key: key,
                    path: '/'+timeStampKey,
                    index: indexKey
                  })
                );
                new Paint().underpostBar();
              }
              break;
            case "asymmetricKeys":
              let publicKey = await new RestService().
              getRawContent(this.mainDir+'/data/keys/'+type.split('Keys')[0]+'/'
              +timeStampKey+'/public.pem');
              let privateKey = await new RestService().
              getRawContent(this.mainDir+'/data/keys/'+type.split('Keys')[0]+'/'
              +timeStampKey+'/private.pem');
              return async () => {
                new Paint().underpostOption('white', ' ', 'Asymmetric Key Selected');
                console.log('\n'+colors.green(publicKey));
                console.log(colors.green(privateKey));
                function rowKey(obj){
                  this.index = obj.index;
                  this.path = obj.path;
                  this.date = new Date(parseInt(obj.path.split('/')[1])).toLocaleString();
                }
                console.table(
                  new rowKey({
                    path: '/'+timeStampKey,
                    index: indexKey
                  })
                );
                new Paint().underpostBar();
              }
              break;
            default:
              return async () => {
                new Paint().underpostOption('red', 'error', 'invalid type key');
                new Paint().underpostBar();
              }

          }
          //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
        }else{
          return async () => {
            new Paint().underpostOption('red', 'error', 'invalid index key');
            new Paint().underpostBar();
          }
        }

      }
    };

    //--------------------------------------------------------------------------
    // NAVI
    //--------------------------------------------------------------------------

    const koynBlockChain = async () => {
      await new Navi().init({
        preTitle: null,
        title: 'Koλn BlockChain Manager',
        postTitle: null,
        options: [
          {
            text: 'test',
            fn: async ()=>{

                await this.networkUpdateStatus();

                let blockChainConfig = JSON.parse(fs.readFileSync(
                    this.mainDir+'/data/blockchain-config.json',
                    this.charset
                ));

                let tempData = JSON.parse(fs.readFileSync(
                  this.mainDir+'/data/underpost.json',
                  this.charset
                ));

                let resp = await new RestService().postJSON(
                  blockChainConfig.constructor.userConfig.bridgeUrl+'/node/ip',
                  new Util().fusionObj([
                    {
                      generation: parseInt(blockChainConfig.constructor.generation),
                      ip: tempData.network_user.ip,
                      ws_port: tempData.ws_port,
                      http_port: tempData.http_port
                    },
                    tempData.network_user
                  ])
                );


                console.log("resp");
                console.log(resp);

                this.wsBridge != undefined ? this.wsBridge.close() : null;
                this.wsBridge = new WSclient(blockChainConfig.network.wsBridgeServer);
                this.wsBridge.onMsg(async data => {

                  console.log(" wsBridge.onMsg ->");
                  console.log(JSON.parse(data));

                });
            }
          }
        ]
      });
    };

    const symmetricKeysGestor = async (postTitleFn) => {
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
          if(postTitleFn!=null){
            await postTitleFn();
          }
        },
        options: [
          {
            text: 'Create Key',
            fn: async ()=>{
              await symmetricKeysGestor(
                await KEYS.create('symmetricKeys')
              );
            }
          },
          {
            text: 'Delete Key',
            fn: async ()=>{
              await symmetricKeysGestor(
                await KEYS.delete('symmetricKeys')
              );
            }
          },
          {
            text: 'View Key',
            fn: async ()=>{
              await symmetricKeysGestor(
                await KEYS.view('symmetricKeys')
              );
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

              this.exit();
            }
          }
        ]
      });
    };


    const asymmetricKeysGestor = async (postTitleFn) => {
      await new Navi().init({
        preTitle: null,
        title: 'Asymmetric Keys Gestor',
        postTitle: async () => {
          await new FileGestor().logReadDirectory({
              path: this.mainDir+'/data/keys/asymmetric',
              recursiveFolder: true,
              displayFolder: false,
              type: 'keys'
          });
          if(postTitleFn!=null){
            await postTitleFn();
          }
        },
        options: [
          {
            text: 'Create Key',
            fn: async ()=>{
              await asymmetricKeysGestor(
                await KEYS.create('asymmetricKeys')
              );
            }
          },
          {
            text: 'Delete Key',
            fn: async ()=>{
              await asymmetricKeysGestor(
                await KEYS.delete('asymmetricKeys')
              );
            }
          },
          {
            text: 'View Key',
            fn: async ()=>{
              await asymmetricKeysGestor(
                await KEYS.view('asymmetricKeys')
              );
            }
          },
          {
            text: 'Back Keys Manager',
            fn: async ()=>{
              await keysManager();
            }
          },
          {
            text: 'List All Keys',
            fn: async ()=>{
              await asymmetricKeysGestor(null);
            }
          },
          {
            text: 'Exit',
            fn: async ()=>{

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
              await symmetricKeysGestor(null);
            }
          },
          {
            text: 'Asymmetric Keys Gestor',
            fn: async ()=>{
              await asymmetricKeysGestor(null);
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
            text: 'Koλn BlockChain Manager',
            fn: async ()=>{
              await koynBlockChain();
            }
          },
          {
            text: 'Exit',
            fn: async ()=>{

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

    await this.networkUpdateStatus();

    let tempData = JSON.parse(fs.readFileSync(
      this.mainDir+'/data/underpost.json',
      this.charset
    ));

    new Paint().underpostTextBotbar('Active user data');
    new Paint().underpostOption('yellow', 'ip        ', tempData.network_user.ip);
    new Paint().underpostOption('yellow', 'username  ', tempData.network_user.username);
    new Paint().underpostOption('yellow', 'email     ', tempData.network_user.email);
    new Paint().underpostOption('yellow', 'web       ', tempData.network_user.web);
    new Paint().underpostOption('yellow', 'bio       ', tempData.network_user.bio);
    new Paint().underpostOption('yellow', 'http port ', tempData.http_port);
    new Paint().underpostOption('yellow', 'ws port   ', tempData.ws_port);
    new Paint().underpostBar();

  }

  exit(){
    try {
      process.exit();
    }catch(err){
      // console.log(err);
    }
  }

  async networkUpdateStatus(){
    return await new Promise(async resolve => {
      let tempData = JSON.parse(fs.readFileSync(
        this.mainDir+'/data/underpost.json',
        this.charset
      ));
      let current_ip = tempData.network_user.ip;
      let new_ip = await new RestService().getIP();
      if( (current_ip!=new_ip) && new Util().validateIP(new_ip) ){
        try{
          tempData.network_user.ip = new_ip;
          fs.writeFileSync(
            this.mainDir+'/data/underpost.json',
            new Util().jsonSave(tempData),
            this.charset);
          new Paint().underpostOption('cyan', ' ', 'ip updated');
          resolve(true);
        }catch(err){
          console.log(err);
          new Paint().underpostOption('red', ' ', 'error ip updated');
          resolve(false);
        }
      }
      resolve(false);
    });
  }

}
