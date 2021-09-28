import { Util } from "../../../../util/class/Util.js";
import { ReadLine } from "../../../../read-line/class/ReadLine.js";
import { Keys } from "../../../../keys/class/Keys.js";
import { RestService } from "../../../../rest/class/restService.js";
import { Paint } from "../../../../paint/class/paint.js";
import { BlockChain } from "../../../../network/api/koyn/class/blockChain.js";

import fs from "fs";
import colors from "colors/safe.js";


export class PublicKeyManager {


  constructor(mainDir, charset, KEYS){

    this.mainDir = mainDir;
    this.charset = charset;
    this.pool = [];
    this.bridge = {
      lastUpdate: null,
      pool: []
    };
    this.pathPool = "";
    this.modules = {
      KEYS: KEYS
    }

  }

  async init(){

    let blockChainConfig = JSON.parse(fs.readFileSync(
        this.mainDir+'/data/blockchain-config.json',
        this.charset
    ));

    this.pathPool =
    this.mainDir+'/data/blockchain/generation-'
    + blockChainConfig.constructor.generation
    +'/public-key-pool.json';

     if(!fs.existsSync(this.pathPool)){

       fs.writeFileSync(
         this.pathPool,
         new Util().jsonSave(this.pool),
         this.charset);

     }else{

       this.pool = JSON.parse(fs.readFileSync(
           this.pathPool,
           this.charset
       ));

     }

  }

  async updatePoolWithBridge(){

    let blockChainConfig = JSON.parse(fs.readFileSync(
        this.mainDir+'/data/blockchain-config.json',
        this.charset
    ));

    // IMPORTANTE PARA ESCALAR: se puede pedir por ultima cantidad desde tal fecha

    this.bridge.pool = await this.getPoolPublicKey();
    if(new Util().l(this.bridge.pool) == 0 ){
      return;
    }
    this.bridge.lastUpdate = (+ new Date());

    let news_keys = [];
    let updates_keys = [];


    let ind_a = 0;
    for(let bridgeObj of this.bridge.pool){



      let ind_b = 0;
      let foundKey = false;
      for(let poolObj of this.pool){
        if(poolObj.data.base64PublicKey == bridgeObj.data.base64PublicKey){
          foundKey = true;
          if(poolObj.data.lastUpdate < bridgeObj.data.lastUpdate){
            updates_keys.push({
              index: ind_b,
              data: bridgeObj
            });
          }
          break;
        }
        ind_b++;
      }
      if(!foundKey){
        news_keys.push(bridgeObj);
      }


      ind_a++;
    }

    console.log(" original -> "+new Util().l(this.pool));
    console.log(" total bridge -> "+new Util().l(this.bridge.pool));
    console.log(" new keys -> "+new Util().l(news_keys));
    console.log(" updates keys -> "+new Util().l(updates_keys));

    let validate_sign_key = true;
    try{
      for(let test_key of this.bridge.pool){
          let test_validate_sign_key = await new Keys()
          .validateTempAsymmetricSignKey(
            test_key,
            blockChainConfig,
            this.charset,
            this.mainDir);
          if(test_validate_sign_key == false){
            validate_sign_key = false;
            this.bridge.pool = [];
            this.bridge.lastUpdate = null;
          }
      }
      if(!validate_sign_key){
        new Paint().underpostOption('red', 'error', 'pool public key validator');
        return;
      }else{
        new Paint().underpostOption('yellow', 'success', 'pool public key validator');
      }
    }catch(err){
      console.log(err);
      new Paint().underpostOption('red', 'error', 'pool public key validator');
      return;
    }

    for(let public_key of updates_keys){
      this.pool[public_key.index] = public_key.data;
    }
    this.pool = this.pool.concat(news_keys);

    fs.writeFileSync(
      this.pathPool,
      new Util().jsonSave(this.pool),
      this.charset);

    new Paint().underpostOption('yellow', 'success', 'get bridge public keys');
    if(new Util().l(updates_keys)>0){
      new Paint().underpostOption('yellow', ' ', 'updated keys:');
      await this.viewPool(updates_keys.map(x=>x.data));
    }
    if(new Util().l(news_keys)>0){
      new Paint().underpostOption('yellow', ' ', 'new keys:');
      await this.viewPool(news_keys);
    }

  }

  async viewPool(pool){

    let blockChainConfig = JSON.parse(fs.readFileSync(
        this.mainDir+'/data/blockchain-config.json',
        this.charset
    ));
    let chainObj = new BlockChain({
      generation: blockChainConfig.constructor.generation,
      userConfig: {
        maxErrorAttempts: 5,
        RESTdelay: 1000
      },
      validatorMode: true
    });

    let chain = JSON.parse(fs.readFileSync(
        this.mainDir
        +'/data/blockchain/generation-'
        +blockChainConfig.constructor.generation
        +'/chain.json',
        this.charset
    ));

    let validateChain = await chainObj.globalValidateChain(chain);
    let tableLocalPool = await new Promise(async resolve => {
       let dataTable = new Util().newInstance(pool);
       for(let x of dataTable){
         x.data.lastUpdate = new Date(x.data.lastUpdate).toLocaleString();
         if(validateChain.global == true){
           let amountData = await chainObj.currentAmountCalculator(
             x.data.base64PublicKey,
             false
           );
           x.data.amount = amountData.amount;
         }else{
           x.data.amount = "invalid chain";
         }
         x.data.base64PublicKey = "..."+x.data.base64PublicKey.slice(250, 256)+"...";
       }
      resolve(dataTable.map(x=>x.data));
    });

    console.table(tableLocalPool);
  }

  async getPoolPublicKey(){

      let tempData = JSON.parse(fs.readFileSync(
        this.mainDir+'/data/underpost.json',
        this.charset
      ));

      let asymmetricKeyData = await this.modules.KEYS.getKeyContent(
        "asymmetricKeys",
         tempData.active_asymmetric_public_key
      );

      let blockChainConfig = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/blockchain-config.json',
          this.charset
      ));

      let errorPublic = new Util().existAttr(asymmetricKeyData.public, "error");
      // console.log(errorPublic);
      let errorPrivate = new Util().existAttr(asymmetricKeyData.private, "error");
      // console.log(errorPrivate);

     if(errorPrivate ||  errorPublic){
       new Paint().underpostOption('red','error', 'invalid assymetric key active: '
       +tempData.active_asymmetric_public_key);
       return [];
     }

     let dataPost = new Util().fusionObj([
       {
         generation: parseInt(blockChainConfig.constructor.generation),
         lastUpdate: (+ new Date())
       },
       tempData.network_user
     ]);

     new Paint().underpostOption("yellow", " ", "current asymmetric public key");
     console.log(asymmetricKeyData.public.raw);

     let passphrase = await new ReadLine().h(
       new Paint().underpostInput("Enter passphrase current asymmetric public key")
     );

     let resp = {success: false};
     try {
       resp = await new RestService().postJSON(
         blockChainConfig.constructor.userConfig.bridgeUrl+'/node/public-key',
         new Keys().generateAsymetricFromSign(
           asymmetricKeyData.private.genesis_dir,
           asymmetricKeyData.public.base64,
           passphrase,
           dataPost,
           true
         )
       );
     }catch(err){
       console.log(err);
       new Paint().underpostOption('red', 'error', 'invalid assymetric passphrase');
       return [];
     }

     if(resp.success == true){
       new Paint().underpostOption('yellow', 'success', 'koyn pool public key response');
       return resp.data;
     }else{
       new Paint().underpostOption('red', 'error', resp.data);
       return [];
     }

   }

   async addPublicKey(){
    try{

      let blockChainConfig = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/blockchain-config.json',
          this.charset
      ));

      let inputBase64PublicKey = null;
      let paste_key = await new ReadLine().yn("paste key ?");

      switch (paste_key) {
        case "y":
          inputBase64PublicKey = new Util().paste();
          break;
        case "n":
          inputBase64PublicKey = await new ReadLine().r(
            new Paint().underpostInput("Enter Base64 Sign Public Key")
          );
          break;
        default:
         new Paint().underpostOption('red', 'error', "invalid option");
         return;
      }


      new Paint().underpostOption('yellow', ' ', 'Base64 decode Obj:');

      let test_key = new Keys()
        .getJSONAsymmetricPublicKeySignFromBase64(inputBase64PublicKey);

      console.log(test_key);

      let validate_sign_key = new Keys()
      .validateTempAsymmetricSignKey(
        test_key,
        blockChainConfig,
        this.charset,
        this.mainDir);

      if(validate_sign_key){

        let foundKey = false;
        let ind_ = 0;
        for(let key of this.pool){
          if(key.data.base64PublicKey==test_key.data.base64PublicKey){
            foundKey = true;
            this.pool[ind_]=test_key;
            new Paint().underpostOption('cyan', 'success', 'updated sign public key');
            break;
          }
          ind_++;
        }
        if(!foundKey){
          this.pool.push(test_key);
          new Paint().underpostOption('cyan', 'success', 'add sign public key');
        }

        fs.writeFileSync(
          this.pathPool,
          new Util().jsonSave(this.pool),
          this.charset);

      }else{
        new Paint().underpostOption('red', 'error', 'failed validate sign key');
      }

    }catch(err){
      console.log(err);
      new Paint().underpostOption('red', 'error', 'failed add Public Key');
    }



   }


}
