
import { Util } from "../../../../util/class/Util.js";
import { Keys } from "../../../../keys/class/Keys.js";
import { ReadLine } from "../../../../read-line/class/ReadLine.js";
import { FileGestor } from "../../../../file-gestor/class/FileGestor.js";
import { RestService } from "../../../../rest/class/restService.js";
import { Navi } from "../../../../navi/class/Navi.js";
import { Paint } from "../../../../paint/class/paint.js";
import { WSclient } from "../../../../network/api/koyn/class/wsClient.js";
import { BlockChain } from "../../../../network/api/koyn/class/blockChain.js";
import { PublicKeyManager } from "../../../../network/api/koyn/class/publicKeyManager.js";
import SHA256 from "crypto-js/sha256.js";

import fs from "fs";
import colors from "colors/safe.js";
import var_dump from "var_dump";
import path from "path";

export class UnderPostManager {

  constructor(mainDir) {

    let charset = 'utf8';

    this.mainDir = mainDir;
    this.charset = charset;
    this.poolPublickey = null;

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

      let max_chars = 100;
      new Paint().underpostOption('yellow', 'warning', 'input max characters: '+max_chars);

      data.http_port = parseInt(await new ReadLine().r(
        new Paint().underpostInput('http port')));
      data.http_port > 9999999 ? data.http_port = null : null;

      data.ws_port = parseInt(await new ReadLine().r(
        new Paint().underpostInput('ws port')));
      data.ws_port > 9999999 ? data.ws_port = null : null;

      data.network_user.username = await new ReadLine().r(
        new Paint().underpostInput('network user username'));
      new Util().l(data.network_user.username) > max_chars ?
      data.network_user.username = "" : null;

      data.network_user.email = await new ReadLine().r(
        new Paint().underpostInput('network user email'));
      new Util().l(data.network_user.email) > max_chars ?
      data.network_user.email = "" : null;

      data.network_user.web = await new ReadLine().r(
        new Paint().underpostInput('network user web'));
      new Util().l(data.network_user.web) > max_chars ?
      data.network_user.web = "" : null;

      data.network_user.bio = await new ReadLine().r(
        new Paint().underpostInput('network user bio'));
      new Util().l(data.network_user.bio) > max_chars ?
      data.network_user.bio = "" : null;

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

        let keyPass = await new ReadLine().h(
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

        let fixKeysArr = KEYS.getFixKeyArr(tempData[type]);

        console.log('delete -> ');
        console.log(fixKeysArr[indexKey]);

        if(fixKeysArr[indexKey]!=undefined){
          //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
          let timeStampDel = fixKeysArr[indexKey].timestamp;

          tempData[type].splice(indexKey, 1);

          fs.writeFileSync(this.mainDir+'/data/underpost.json',
          new Util().jsonSave(tempData),
          this.charset);

          new FileGestor().deleteFolderRecursive(
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

        let blockChainConfig = JSON.parse(fs.readFileSync(
            this.mainDir+'/data/blockchain-config.json',
            this.charset
        ));

        let indexKey =
        parseInt(await new ReadLine().r(
          new Paint().underpostInput('index key')
        ));

        new Paint().underpostBar();

        let fixKeysArr = KEYS.getFixKeyArr(tempData[type]);

        // console.log('delete -> ');
        // console.log(fixKeysArr[indexKey]);

        if(fixKeysArr[indexKey]!=undefined){
          //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
          let timeStampKey = fixKeysArr[indexKey].timestamp;

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
                // console.log('\n'+colors.green(publicKey));
                // console.log(colors.green(privateKey));
                // new Paint().underpostOption('white', ' ', 'Base64 Public Key:');
                let fileKeyContent = await KEYS.getKeyContent(
                  type,
                  timeStampKey
                );
                console.log(fileKeyContent);
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

                let sign_public_key = await new Keys()
                .getAsymmetricSignPublicObj(
                  KEYS,
                  tempData,
                  timeStampKey,
                  blockChainConfig
                );

                console.log("sign_public_key ->");
                console.log(sign_public_key);

                if(sign_public_key!=null){
                  new Util().copy(new Keys().
                    getBase64AsymmetricPublicKeySignFromJSON(sign_public_key)
                  );
                  new Paint().underpostOption('cyan', 'success', 'Base64 Sign Public Key Copy to Clipboard');
                  new Paint().underpostBar();
                }else{
                  new Paint().underpostOption('red', 'error', 'Base64 Sign Public Key generator failed');
                  new Paint().underpostBar();
                }
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

      },
      activate: async type => {

        let tempData = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/underpost.json',
          this.charset
        ));

        let blockChainConfig = JSON.parse(fs.readFileSync(
            this.mainDir+'/data/blockchain-config.json',
            this.charset
        ));

        let indexKey =
        parseInt(await new ReadLine().r(
          new Paint().underpostInput('index key')
        ));

        new Paint().underpostBar();

        let fixKeysArr = KEYS.getFixKeyArr(tempData[type]);

        if(fixKeysArr[indexKey]!=undefined){

          let timeStampKey = fixKeysArr[indexKey].timestamp;
          const activateKey = () => {
            tempData[('active_'+type.split('Keys')[0]+'_public_key')]
            =
            timeStampKey;
            fs.writeFileSync(this.mainDir+'/data/underpost.json',
            new Util().jsonSave(tempData),
            this.charset);
            return async () => {
              new Paint().underpostOption(
                'yellow', 'success', 'Activate key:'+timeStampKey+
                ' index:'+indexKey
              );
              new Paint().underpostBar();
            }
          };

          switch (type) {
            case "symmetricKeys":
                  return activateKey();
              break;
            case "asymmetricKeys":
                  let signKey = await new Keys().
                  getAsymmetricSignPublicObj(
                    KEYS,
                    tempData,
                    timeStampKey,
                    blockChainConfig
                  );
                  if(signKey!=null){
                    fs.writeFileSync(this.mainDir+'/data/keys/asymmetric/active.json',
                    new Util().jsonSave(signKey),
                    this.charset);
                    return activateKey();
                  }else{
                    return async () => {
                      new Paint().underpostOption('red', 'error', 'failer sign key');
                      new Paint().underpostBar();
                    }
                  }
              break;
            default:
              return async () => {
                new Paint().underpostOption('red', 'error', 'invalid type key');
                new Paint().underpostBar();
              }
          }
        }else{
          return async () => {
            new Paint().underpostOption('red', 'error', 'invalid index key');
            new Paint().underpostBar();
          }
        }


      },
      getKeyContent: async (type, timestamp) => {
        type = type.split('Keys')[0];
        switch (type) {
          case "symmetric":
            return {
              iv: new FileGestor().getDataFile(
              this.mainDir+'/data/keys/'
              +type+
              '/'+timestamp+'/iv.json', true),
              key: new FileGestor().getDataFile(
              this.mainDir+'/data/keys/'
              +type+
              '/'+timestamp+'/key.json', true)
            }
          case "asymmetric":
            return {
              public: new FileGestor().getDataFile(
              this.mainDir+'/data/keys/'
              +type+
              '/'+timestamp+'/public.pem'),
              private: new FileGestor().getDataFile(
              this.mainDir+'/data/keys/'
              +type+
              '/'+timestamp+'/private.pem')
            }
          default:
            new Paint().underpostOption('red', 'error', 'invalid type key');
            new Paint().underpostBar();
            return undefined;

        }



      },
      getFixKeyArr: arrKey => {
        let fixKeysArr = [];
        let indexKeyReal = 0;
        for(let key_time of arrKey){
          fixKeysArr.push({
            date: new Date(key_time).toLocaleString(),
            timestamp: key_time
          });
          indexKeyReal++;
        }
        return fixKeysArr;
      },
      viewAll: async type => {

        let tempData = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/underpost.json',
          this.charset
        ));

        let blockChainConfig = JSON.parse(fs.readFileSync(
            this.mainDir+'/data/blockchain-config.json',
            this.charset
        ));

        let tempDataTransactions = await new RestService().getJSON(
          blockChainConfig.constructor.userConfig.bridgeUrl
          +'/transactions/'
          +blockChainConfig.constructor.generation
        );

        let pathKeys = this.mainDir+'/data/keys/'+type;
        console.log(new FileGestor().getAllFilesPath(pathKeys, true));

        console.log("path: "+pathKeys);
        let tableKeys = KEYS.getFixKeyArr(tempData[(type+'Keys')]);

        switch (type) {
          case "symmetric":
            console.table(tableKeys);
            break;
          case "asymmetric":

            let BCobj = await BCmanager.instanceStaticChainObj(blockChainConfig);
            let chainObj = BCobj.chainObj;
            let chain = BCobj.chain;
            let validateChain = BCobj.validateChain;

            await chainObj.currentAmountCalculator(
              "",
              false,
              tempDataTransactions.pool
            );

            let tableAsymmetricKeys = [];

            for(let rowKey of tableKeys){
              if(validateChain.global == true){
                let amountData = await chainObj.currentAmountCalculator(
                  fs.readFileSync(
                    this.mainDir+'/data/keys/asymmetric/'+rowKey.timestamp+'/public.pem')
                    .toString('base64'),
                  false
                );
                rowKey.amount = amountData.amount;
              }else{
                rowKey.amount = "invalid chain";
              }
              tableAsymmetricKeys.push(rowKey);
            }

            console.table(tableAsymmetricKeys);
            break;
          default:
            new Paint().underpostOption('red', 'error', 'invalid type key');
        }

      }
    };

    const BCmanager = {
       initMineBlock: async ()=>{
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
               ws_port: tempData.ws_port,
               http_port: tempData.http_port
             },
             tempData.network_user
           ])
         );
         new Paint().underpostOption('yellow', ' ', 'bridge rest connection');
         console.log(resp);

         if( resp.status == true ){

           // var publicKey = await new ReadLine().r('public key:');

           let asymmetricKeyData = await KEYS.getKeyContent(
             "asymmetricKeys",
              tempData.active_asymmetric_public_key
            );
            // console.log("asymmetricKeyData ->");
            // console.log(asymmetricKeyData);
            let errorPublic = new Util().existAttr(asymmetricKeyData.public, "error");
            // console.log(errorPublic);
            let errorPrivate = new Util().existAttr(asymmetricKeyData.private, "error");
            // console.log(errorPrivate);

           if(errorPrivate ||  errorPublic){
             new Paint().underpostOption('red','error', 'invalid assymetric key active: '
             +tempData.active_asymmetric_public_key);
             return;
           }


           // input difficultyConfig
           let input_hash_rate_seconds = 6000;
           let input_interval_seconds_time = 10;
           // let input_hash_rate_seconds = 400000;
           // let input_interval_seconds_time = 10;
           /*let new_hrs = await new ReadLine().r('Hash Rate Seconds: ');
           let new_ist = await new ReadLine().r('Interval Seconds Time: ');
           if(!isNaN(new_hrs)){
             input_hash_rate_seconds = parseInt(new_hrs);
           }
           if(!isNaN(new_ist)){
             input_interval_seconds_time = parseInt(new_ist);
           }*/


           var publicKey = asymmetricKeyData.public.base64;

           new Paint().underpostOption('yellow', ' ', 'starting bridge ws connection...');

           this.wsBridge != undefined ? this.wsBridge.close() : null;
           this.wsBridge = new WSclient(blockChainConfig.network.wsBridgeServer);

           new Paint().underpostOption('yellow', 'ws host', this.wsBridge.host_name);


           //-------------------------------------------------------------------
           //-------------------------------------------------------------------

           let BCP = await new Promise(async resolve => {

             var blockChainProcess = new BlockChain({
               generation: blockChainConfig.constructor.generation,
               version: '0.0.0',
               hashGeneration: null,
               // pathPreviousHashGeneration: '../data/blockchain/generation-0/hash',
               pathPreviousHashGeneration: null,
               dataGenesisHashGeneration: 'khrónos',
               userConfig: {
                 blocksToUndermine: 1,
                 propagateBlock: true,
                 bridgeUrl: blockChainConfig.constructor.userConfig.bridgeUrl,
                 intervalBridgeMonitoring: 10000,
                 zerosConstDifficulty: null,
                 rewardAddress: publicKey,
                 blockChainDataPath: this.mainDir+'/data/blockchain',
                 // blockChainDataPath: '../data/blockchain',
                 // blockChainDataPath: null,
                 maxErrorAttempts: 5,
                 RESTdelay: 1000,
                 charset: 'utf8',
                 transactionTemplate: blockChainConfig.network.transactionTemplate
               },
               rewardConfig: {
                 intervalChangeEraBlock: 1, /* 1 - 210000 - 300000 */
                 totalEra: 9,
                 hashesPerCurrency: 10,
                 upTruncFactor: 15
               },
               difficultyConfig: {
                 hashRateSeconds: input_hash_rate_seconds,
                 intervalSecondsTime: input_interval_seconds_time,
                 intervalCalculateDifficulty: 10
               }
             });

             //-------------------------------------------------------------------
             // INIT BlockChain Process -> resolve(status, block)
             //-------------------------------------------------------------------

             this.wsBridge.onOpen(async data => {

               new Paint().underpostOption('yellow', ' ', 'success bridge ws connection');

               resolve(await blockChainProcess.mainProcess({
                 paths: [
                   {
                     url: 'http://localhost:3001/koyn',
                     type: 'App'
                   }/*,
                   {
                     url: 'http://localhost:3001/koyn',
                     type: 'Transaction'
                   }*/
                 ]
               }, this.wsBridge));

             });

             //-------------------------------------------------------------------
             //-------------------------------------------------------------------

           });

           //-------------------------------------------------------------------
           //-------------------------------------------------------------------

           new Paint().underpostOption('yellow', ' ', 'End Mine Process Result:');
           console.log(BCP);
           new Paint().underpostOption('yellow', ' ', 'Reward Address:');
           console.log(
             Buffer.from(
               BCP.block.node.rewardAddress, 'base64'
             ).toString()
           );

         } else {

           new Paint().underpostOption('red', ' ', 'Failed bridge rest connection');

         }


       },
       clearChain: async ()=>{
         fs.writeFileSync(
           this.mainDir+'/data/blockchain/generation-0/chain.json',
           "[]",
           this.charset);
          new Paint().underpostOption('yellow', 'success', 'Clear Chain Generation 0');
          new Paint().underpostBar();
       },
       instanceStaticChainObj: async blockChainConfig => {

         let chainObj = new BlockChain({
           generation: blockChainConfig.constructor.generation,
           userConfig: {
             blocksToUndermine: 1,
             propagateBlock: true,
             bridgeUrl: blockChainConfig.constructor.userConfig.bridgeUrl,
             intervalBridgeMonitoring: 1000,
             zerosConstDifficulty: null,
             rewardAddress: "",
             blockChainDataPath: this.mainDir+'/data/blockchain',
             // blockChainDataPath: '../data/blockchain',
             // blockChainDataPath: null,
             maxErrorAttempts: 5,
             RESTdelay: 1000,
             charset: 'utf8'
           },
           validatorMode: true
         });

         /*let chain = JSON.parse(fs.readFileSync(
             this.mainDir
             +'/data/blockchain/generation-'
             +blockChainConfig.constructor.generation
             +'/chain.json',
             this.charset
         ));*/


         // UPDATE CHAIN WITH BRIDGE

         await chainObj.setCurrentChain();

         let chain = chainObj.chain;



         let validateChain = await chainObj.globalValidateChain(chain);

         return { chainObj, chain, validateChain };
       }
    };

    const WALLET = {
     createTransaction: async () => {

       //  BlockChain  -> Immutable Time Consistency

       const signSaveTransaction = async (sender, receiver, blockChainConfig, timestamp_key) => {

          console.log(" key receiver selected ->");
          console.log(receiver);

          console.log(" key sender selected ->");
          console.log(sender);

          let senderValidator =  await new Keys()
          .validateAsymmetricFromSign(
            sender,
            blockChainConfig.keys.publicLen,
            this.mainDir+'/data/keys/asymmetric/'+timestamp_key+'/public.pem');

          console.log(" sender validator ->");
          console.log(senderValidator);

        let receiverValidator =  await new Keys()
        .validateTempAsymmetricSignKey(
          receiver,
          blockChainConfig,
          this.charset,
          this.mainDir);

        console.log(" receiver validator ->");
        console.log( receiverValidator);

        if( (!receiverValidator) || (!senderValidator) ){
          new Paint().underpostOption('red', 'error', 'invalid sender or receiver sign');
          return;
        }

        let BCobj = await BCmanager.instanceStaticChainObj(blockChainConfig);
        let chainObj = BCobj.chainObj;
        let chain = BCobj.chain;
        let validateChain = BCobj.validateChain;

         if(validateChain.global == true){

           let tempDataTransactions = await new RestService().getJSON(
             blockChainConfig.constructor.userConfig.bridgeUrl
             +'/transactions/'
             +blockChainConfig.constructor.generation
           );

           let objAmount = await chainObj.currentAmountCalculator(
             sender.data.base64PublicKey,
             false,
             tempDataTransactions.pool
           );

           console.log(
             colors.cyan(" > current total amount sender: "+objAmount.amount)
           );

           if(objAmount.amount > 0){

             let sender_amount = parseInt(await new ReadLine().r(
               new Paint().underpostInput("enter sender amount to transaction")
             ));

             if(!isNaN(sender_amount)){

               if(sender_amount<=objAmount.amount){

                 console.log("generate transaction");

                 let hashsTransaction =
                 objAmount.hashs.splice((sender_amount*-1));

                 let dataTransaction = {
                   sender: sender,
                   receiver: receiver,
                   amount: {
                     totalValue: sender_amount,
                     hashs: hashsTransaction
                   },
                   createdDate: (+ new Date())
                 };

                 console.log(" data transaction ->");
                 console.log(" value length:"+ new Util().l(hashsTransaction));
                 console.log(dataTransaction);

                 let passphrase = await new ReadLine().h(
                   new Paint().underpostInput(
                     "Enter passphrase current asymmetric public key for sign data transaction")
                 );

                 let endObjTransaction = new Keys().generateAsymetricFromSign(
                   this.mainDir+'/data/keys/asymmetric/'+timestamp_key+'/private.pem',
                   sender.data.base64PublicKey,
                   passphrase,
                   dataTransaction,
                   false);

                   console.log('endObjTransaction ->');
                   console.log(endObjTransaction);

                   console.log('from sign validator ->');
                   let validatorTransaction = await new Keys()
                   .validateAsymmetricFromSign(
                     endObjTransaction,
                     blockChainConfig.keys.publicLen,
                     this.mainDir+'/data/keys/asymmetric/'+timestamp_key+'/public.pem');
                   console.log(validatorTransaction);
                   if(validatorTransaction == true){

                     /*let pathDataTransactions =
                     this.mainDir+'/data/blockchain/generation-'
                     +blockChainConfig.constructor.generation+'/pending-transactions.json';

                     let pendingTransactions = JSON.parse(fs.readFileSync(
                       pathDataTransactions,
                       this.charset
                     ));

                     pendingTransactions.push(endObjTransaction);

                     fs.writeFileSync(
                       pathDataTransactions,
                       new Util().jsonSave(pendingTransactions),
                       this.charset);

                       new Paint().underpostOption('cyan', 'success', 'transaction moved to pending');*/

                       let postTransactionStatus = await new RestService().postJSON(
                         blockChainConfig.constructor.userConfig.bridgeUrl+'/transactions/'
                         +blockChainConfig.constructor.generation,
                         endObjTransaction
                       );

                       console.log("postTransactionStatus ->");
                       console.log(postTransactionStatus);

                   }else{

                     new Paint().underpostOption('red', 'error', 'invalid sign transaction');
                     return;

                   }

               }else{
                 new Paint().underpostOption('red', 'error', 'insufficient current amount');
                 return;
               }

             }else{
               new Paint().underpostOption('red', 'error', 'invalid input');
               return;
             }

           }else{
             new Paint().underpostOption('red', 'error', 'insufficient current amount');
             return;
           }

         }else{
           new Paint().underpostOption('red', 'error', 'invalid chain');
           return;
         }

       };

       try {

         let tempData = JSON.parse(fs.readFileSync(
           this.mainDir+'/data/underpost.json',
           this.charset
         ));

         let asymmetricKeyData = await KEYS.getKeyContent(
           "asymmetricKeys",
           tempData.active_asymmetric_public_key
         );

         let blockChainConfig = JSON.parse(fs.readFileSync(
             this.mainDir+'/data/blockchain-config.json',
             this.charset
         ));

         let keyPool = await new ReadLine()
         .yn("Use a key receiver from the public key pool ?");

         let sender = JSON.parse(fs.readFileSync(
             this.mainDir+'/data/keys/asymmetric/active.json',
             this.charset
         ));
         let receiver = null;

         switch (keyPool) {
           case "y":
             await this.poolPublickey.viewPool(this.poolPublickey.pool);

             let indexKey = parseInt(await new ReadLine().r(
               new Paint().underpostInput("index pool key ?")
             ));

             receiver = this.poolPublickey.pool[indexKey];

             if(this.poolPublickey.pool[indexKey].data.base64PublicKey
               !=
               asymmetricKeyData.public.base64
             ){

              await signSaveTransaction(
                sender,
                receiver,
                blockChainConfig,
                tempData.active_asymmetric_public_key
              );

             }else{
               new Paint().underpostOption('red', 'error', "invalid auto-transaction");
             }

             break;
           case "n":

             receiver = await
             this.poolPublickey.getExternalPublicKey();

             if(!new Util().existAttr(receiver, "error")){

               if(receiver.data.base64PublicKey
                 !=
                 asymmetricKeyData.public.base64
               ){

                await signSaveTransaction(
                  sender,
                  receiver,
                  blockChainConfig,
                  tempData.active_asymmetric_public_key
                );

               }else{
                 new Paint().underpostOption('red', 'error', "invalid auto-transaction");
               }


             }else{
               new Paint().underpostOption('red', 'error', 'failed validate sign key');
             }

             break;
           default:
              new Paint().underpostOption('red', 'error', "invalid option");
         }
       }catch(err){
         console.log(err);
         new Paint().underpostOption('red', 'error', "createTransaction failed");
       }
     },
     getCurrentAmountActiveAsymmetricKey: async () => {


       let tempData = JSON.parse(fs.readFileSync(
         this.mainDir+'/data/underpost.json',
         this.charset
       ));

       let fileKeyContent = await KEYS.getKeyContent(
         "asymmetricKeys",
         tempData.active_asymmetric_public_key
       );

       let blockChainConfig = JSON.parse(fs.readFileSync(
           this.mainDir+'/data/blockchain-config.json',
           this.charset
       ));

       let BCobj = await BCmanager.instanceStaticChainObj(blockChainConfig);
       let chainObj = BCobj.chainObj;
       let chain = BCobj.chain;
       let validateChain = BCobj.validateChain;

       if(validateChain.global == true){
         let tempDataTransactions = await new RestService().getJSON(
           blockChainConfig.constructor.userConfig.bridgeUrl
           +'/transactions/'
           +blockChainConfig.constructor.generation
         );
         console.log([await chainObj.currentAmountCalculator(
           fileKeyContent.public.base64,
           true,
           tempDataTransactions.pool
         )]);

       }else{

         new Paint().underpostOption('red', 'error', 'invalid chain');

       }

     }
   };

    //--------------------------------------------------------------------------
    // NAVI
    //--------------------------------------------------------------------------

    const koynWallet = async () => {
      await new Navi().init({
        preTitle: null,
        title: 'Koλn Wallet',
        postTitle: null,
        options: [
          {
            text: 'Share Current Asymmetric Public Key and get Bridge Public Key Pool',
            fn: async () => {
              await this.poolPublickey.updatePoolWithBridge();
            }
          },
          {
            text: 'Create Transaction',
            fn: async () => {
              await WALLET.createTransaction();
            }
          },
          {
            text: 'Calculate Current Amount active Asymetric Key',
            fn: async () => {
              await WALLET.getCurrentAmountActiveAsymmetricKey();
            }
          },
          {
            text: 'View Local Public Key Pool',
            fn: async () => {
              await this.poolPublickey.viewPool(this.poolPublickey.pool);
            }
          },
          {
            text: 'Add base64 to Local Public Key Pool',
            fn: async ()=>{
              await this.poolPublickey.addPublicKey();
            }
          },
          {
            text: 'Back Koλn BlockChain Manager',
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
        ]
      });
    };

    const koynBlockChain = async () => {
      await new Navi().init({
        preTitle: null,
        title: 'Koλn BlockChain Manager',
        postTitle: null,
        options: [
          {
            text: 'Start Mining Processes',
            fn: async ()=>{
              let blocks = await new ReadLine().r(
                new Paint().underpostInput('Number of Blocks to Mine'));
              if(!isNaN(blocks)){
                for(let i_=0; i_<blocks;i_++){
                  await BCmanager.initMineBlock();
                }
              }else{
                  new Paint().underpostOption('red', 'error', 'not valid number')
              }
            }
          },
          {
            text: 'Wallet',
            fn: async ()=>{
              await koynWallet();
            }
          },
          {
            text: 'Clear Chain',
            fn: async ()=>{
              await BCmanager.clearChain();
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

    const symmetricKeysGestor = async (postTitleFn) => {
      await new Navi().init({
        preTitle: null,
        title: 'Symmetric Keys Gestor',
        postTitle: async () => {
          await KEYS.viewAll("symmetric");
          if(postTitleFn!=null){
            await postTitleFn();
          }
        },
        options: [
          {
            text: 'Activate Current Symmetric Public Key',
            fn: async ()=>{
              await symmetricKeysGestor(
                await KEYS.activate('symmetricKeys')
              );
            }
          },
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
          await KEYS.viewAll("asymmetric");
          if(postTitleFn!=null){
            await postTitleFn();
          }
        },
        options: [
          {
            text: 'Activate Current Asymmetric Public Key',
            fn: async ()=>{
              await asymmetricKeysGestor(
                await KEYS.activate('asymmetricKeys')
              );
            }
          },
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
            text: 'View Key and Get base64 sign Public Key',
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

    //--------------------------------------------------------------------------
    // TEST AREA

    // await new RestService().getIP();

    // let symmetricKeyData = await KEYS.getKeyContent("symmetricKeys", 1629759130448);
    // console.log("symmetricKeyData ->");
    // console.log(symmetricKeyData);

    // let asymmetricKeyData = await KEYS.getKeyContent("asymmetricKeys", 1629659881247);
    // console.log("asymmetricKeyData ->");
    // console.log(asymmetricKeyData);

    // console.log("test ->");
    // console.log(new FileGestor().dir(this.mainDir));
    // console.log(new FileGestor().dir(this.mainDir, '../'));
    // console.log(new FileGestor().dir(this.mainDir, '../../'));
    // console.log(new FileGestor().dir(this.mainDir, '../../src'));

    // fs.unlinkSync(this.mainDir+'/test');

    // return;
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

    this.poolPublickey = new PublicKeyManager(
      this.mainDir,
      this.charset,
      KEYS,
      BCmanager
    );
    await this.poolPublickey.init();

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

    ! fs.existsSync(this.mainDir+'/data/blockchain') ?
    fs.mkdirSync(this.mainDir+'/data/blockchain') : null;

    ! fs.existsSync(this.mainDir+'/data/temp') ?
    fs.mkdirSync(this.mainDir+'/data/temp') : null;

    ! fs.existsSync(this.mainDir+'/data/temp/test-key') ?
    fs.mkdirSync(this.mainDir+'/data/temp/test-key') : null;

  }

  async underpostActiveUserLog(){

    await this.networkUpdateStatus();

    let tempData = JSON.parse(fs.readFileSync(
      this.mainDir+'/data/underpost.json',
      this.charset
    ));

    new Paint().underpostTextBotbar('Active user data');
    new Paint().underpostOption('yellow', 'username              ', tempData.network_user.username);
    new Paint().underpostOption('yellow', 'email                 ', tempData.network_user.email);
    new Paint().underpostOption('yellow', 'web                   ', tempData.network_user.web);
    new Paint().underpostOption('yellow', 'bio                   ', tempData.network_user.bio);
    new Paint().underpostOption('yellow', 'Symmetric Key Active  ', tempData.active_symmetric_public_key);
    new Paint().underpostOption('yellow', 'Asymmetric Key Active ', tempData.active_asymmetric_public_key);
    new Paint().underpostOption('yellow', 'ip                    ', tempData.network_user.ip);
    new Paint().underpostOption('yellow', 'http port             ', tempData.http_port);
    new Paint().underpostOption('yellow', 'ws port               ', tempData.ws_port);
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
