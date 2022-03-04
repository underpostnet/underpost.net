import { Util } from "../../util/class/Util.js";
import { ReadLine } from "../../read-line/class/ReadLine.js";
import { Keys } from "../../keys/class/Keys.js";
import { RestService } from "../../rest/class/restService.js";
import { Paint } from "../../paint/class/paint.js";
import { BlockChain } from "./blockChain.js";

import fs from "fs";
import colors from "colors/safe.js";


export class PublicKeyManager {


  constructor(mainDir, charset, KEYS, BCmanager){

    this.mainDir = mainDir;
    this.charset = charset;
    this.pool = [];
    this.bridge = {
      pool: []
    };
    this.pathPool = "";
    this.modules = { KEYS, BCmanager };

  }

  async init(){

    let blockChainConfig = JSON.parse(fs.readFileSync(
        this.mainDir+'/data/blockchain-config.json',
        this.charset
    ));

    this.pathPool =
    this.mainDir+'/data/blockchain/generation-'
    + blockChainConfig.constructor.generation;

    ! fs.existsSync(this.pathPool) ?
    fs.mkdirSync(this.pathPool) : null;

    if(! fs.existsSync(this.pathPool+'/chain.json')){
      fs.writeFileSync(
        this.pathPool+'/chain.json',
        new Util().jsonSave([]),
        this.charset);
    }

    this.pathPool += '/public-key-pool.json';

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

    let news_keys = [];
    let updates_keys = [];


    let ind_a = 0;
    for(let bridgeObj of this.bridge.pool){



      let ind_b = 0;
      let foundKey = false;
      for(let poolObj of this.pool){
        if(poolObj.signKey.data.base64PublicKey == bridgeObj.signKey.data.base64PublicKey){
          foundKey = true;
          updates_keys.push({
            index: ind_b,
            data: bridgeObj
          });
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

          let test_validate_sign_key = new Keys().validateDataTempKeyAsymmetricSign(
            test_key.signKey.data.base64PublicKey,
            test_key.signKey,
            blockChainConfig,
            this.charset,
            this.mainDir);

          if(test_validate_sign_key == false){
            validate_sign_key = false;
            this.bridge.pool = [];
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
      new Paint().underpostOption('cyan', ' \n', new Util().tu('updated keys:')+'\n');
      await this.viewPool(updates_keys.map(x=>x.data));
    }
    if(new Util().l(news_keys)>0){
      new Paint().underpostOption('cyan', ' \n', new Util().tu('new keys:')+'\n');
      await this.viewPool(news_keys);
    }

  }

  async viewPool(pool){

    let blockChainConfig = JSON.parse(fs.readFileSync(
        this.mainDir+'/data/blockchain-config.json',
        this.charset
    ));

    let tempData = JSON.parse(fs.readFileSync(
      this.mainDir+'/data/underpost.json',
      this.charset
    ));

    let BCobj = await this.modules.
    BCmanager.instanceStaticChainObj(blockChainConfig);
    let chainObj = BCobj.chainObj;
    let chain = BCobj.chain;
    let validateChain = BCobj.validateChain;

    let tempDataTransactions = await new RestService().getJSON(
      blockChainConfig.constructor.userConfig.bridgeUrl
      +'/transactions/'
      +blockChainConfig.constructor.generation
    );

    await chainObj.currentAmountCalculator(
      "",
      false,
      tempDataTransactions.pool
    );

    let tableLocalPool = await new Promise(async resolve => {
       let dataTable = new Util().newInstance(pool);
       for(let x of dataTable){

         if(validateChain.global == true){
           let amountData = await chainObj.currentAmountCalculator(
             x.signKey.data.base64PublicKey,
             false
           );
           x.signKey.data.amount = amountData.amount;
         }else{
           x.signKey.data.amount = "invalid chain";
         }

         let foundLocal = null;
         for(let localKey of tempData.asymmetricKeys){
           let localBase64PublicKey = fs.readFileSync(
             this.mainDir+'/data/keys/asymmetric/'+localKey+'/public.pem')
             .toString('base64');
             if(x.signKey.data.base64PublicKey==localBase64PublicKey){
               foundLocal = localKey;
               break;
             }
         }
         x.local = foundLocal;

       }
      resolve(dataTable.map(x=>{
        return {
          comment: x.comment,
          amount: x.signKey.data.amount,
          B64PUKSHA256: x.signKey.data.B64PUKSHA256,
          created: new Date(x.signKey.data.timestamp).toISOString(),
          local: x.local
        };
      }));
    });

    console.table(tableLocalPool);

    let viewUserData = await new ReadLine().yn("View user data ?");

    if(viewUserData === "y"){

      let idViewUser = await new ReadLine().r(
        new Paint().underpostInput("Index user data ?")
      );
      console.table({
        ...tableLocalPool[idViewUser],
        ...pool[idViewUser].user
      });
    }

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

     new Paint().underpostOption("yellow", " ", "current asymmetric public key");
     console.log(asymmetricKeyData.public.raw);

     let passphrase = await new ReadLine().h(
       new Paint().underpostInput("Enter passphrase current asymmetric public key")
     );

     let resp = {success: false};
     try {
       resp = await new RestService().postJSON(
         blockChainConfig.constructor.userConfig.bridgeUrl+'/node/public-key/'+
         blockChainConfig.constructor.generation,
         {
           comment: await new ReadLine().r(
             new Paint().underpostInput('comment state ? <enter> skip')),
           user: tempData.network.user,
           signKey:  new Keys().generateDataAsymetricSign(
             this.mainDir+'/data/keys/asymmetric/'+tempData.active_asymmetric_public_key+'/private.pem',
             asymmetricKeyData.public.base64,
             passphrase,
             true
           )
         }
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

   async getExternalPublicKey(){

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
       console.log(new Util().jsonSave(test_key));

      let validate_sign_key = new Keys().validateDataTempKeyAsymmetricSign(
          test_key.data.base64PublicKey,
          test_key,
          blockChainConfig,
          this.charset,
          this.mainDir);
      if(validate_sign_key == true){
        return test_key
      }else{
        return { error: "invalid public sign key ", data: test_key }
      }

   }

   async addPublicKey(){
    try{

      let blockChainConfig = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/blockchain-config.json',
          this.charset
      ));

      let externalPublicKey = await this.getExternalPublicKey();
      externalPublicKey = {
        comment: await new ReadLine().r(
          new Paint().underpostInput('comment state ? <enter> skip')),
        signKey: externalPublicKey
      };

      if(!new Util().existAttr(externalPublicKey, "error")){

        let tempData = JSON.parse(fs.readFileSync(
          this.mainDir+'/data/underpost.json',
          this.charset
        ));
        let userData = new Util().newInstance(tempData.network.user);
        await new Util().iterateKeysAsync(userData, async (key, value) =>
            userData[key] = await new ReadLine().r(
              new Paint().underpostInput('add user data '+key+' ? <enter> skip'))
        );
        externalPublicKey.user = userData;

        let foundKey = false;
        let ind_ = 0;
        for(let key of this.pool){
          if(key.signKey.data.base64PublicKey==externalPublicKey.signKey.data.base64PublicKey){
            foundKey = true;
            this.pool[ind_]=externalPublicKey;
            new Paint().underpostOption('cyan', 'success', 'updated sign public key');
            break;
          }
          ind_++;
        }
        if(!foundKey){
          this.pool.push(externalPublicKey);
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
