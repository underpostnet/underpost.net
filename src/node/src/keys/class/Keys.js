import { Util } from "../../util/class/Util.js";
import { ReadLine } from "../../read-line/class/ReadLine.js";
import { Paint } from "../../paint/class/paint.js";

import SHA256 from "crypto-js/sha256.js";

import fs from "fs";
import crypto from "crypto";
import path from "path";
import colors from "colors/safe.js";
import cryptoJs from "crypto-js";

export class Keys {

  constructor(){}

  async generateKeys(path, passphrase) {
      try {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa',
        {
                modulusLength: 4096,
                namedCurve: 'secp256k1',
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                    cipher: 'aes-256-cbc',
                    passphrase: passphrase
                }
        });

        let time = (+ new Date());
        !fs.existsSync(path+time) ? fs.mkdirSync(path+time):null;
        fs.writeFileSync(path+time+'/private.pem', privateKey);
        fs.writeFileSync(path+time+'/public.pem', publicKey);

        console.log(colors.yellow('.generateKeys(path, passphrase)  -> success'));

        return true;

      }catch(err){

        console.log(colors.red('.generateKeys(path, passphrase)  -> error'));
        console.log(err);

        return false;

      }

  }

  generateKeyIv(obj){

    let genSize = 64; // 32
    let password = obj.passphrase;
    let salt = cryptoJs.lib.WordArray.random(64 / 8);
    let keySize = 256 / genSize;
    let ivSize = 128 / genSize;
    let key = cryptoJs.algo.EvpKDF.create({ keySize: keySize + ivSize, hasher: cryptoJs.algo.SHA1 }).compute(password, salt);
    let iv = cryptoJs.lib.WordArray.create(key.words.slice(keySize), ivSize * 4);
    key.sigBytes = keySize * 4;


    return { key, iv };

  }

  symmetricEncr(text, secretKey, iv, algorithm){

      const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

      const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

      return {
          iv: iv.toString('hex'),
          content: encrypted.toString('hex')
      };
  };

  symmetricDecr(hash, secretKey, algorithm){

      const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

      const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

      return decrpyted.toString();
  };

  //--------------------------------------------
  //--------------------------------------------

  	Ksym_encr(content){
  		return this.symmetricEncr(
        content,
        this.symmetric_config.key,
        Buffer.from(this.symmetric_config.iv, "utf8"),
        this.symmetric_config.algorithm
      ).content;
  	}

  	Ksym_decr(content){
  		return this.symmetricDecr(
        {
    			content: content,
    			iv: Buffer.from(this.symmetric_config.iv, "utf8").toString('hex')
  		  },
        this.symmetric_config.key,
        this.symmetric_config.algorithm
      );
  	}

  	Ksym_info(){
  		log('info', 'Symmetric Gestor Test ->');
  		log('info', 'buffer iv ->');
  		console.log(Buffer.from(this.symmetric_config.iv, "utf8"));
  		log('info','key char str length -> '+l(this.symmetric_config.key));
  		log('info','iv char str length -> '+l(this.symmetric_config.iv));
  	}

    Ksym_test(){
      log('info', 'K test ->');
      log('info', this.Ksym_decr(this.Ksym_encr(
        new Util().JSONstr({content:"test"})
      )));
      /*
    	let test = 'asda';
    	console.log(k.encr(test));
    	console.log(k.encr(test));
    	console.log(k.decr(k.encr(test)));
    	console.log(k.decr(k.encr(test)));
    	*/
    }

  //--------------------------------------------
  //--------------------------------------------



  async generateSymmetricKeys(obj){


    let dataKey = this.generateKeyIv(obj);

    let time = (+ new Date());

    !fs.existsSync(obj.path+'/symmetric') ?
    fs.mkdirSync(obj.path+'/symmetric'):null;

    !fs.existsSync(obj.path+'/symmetric/'+time) ?
    fs.mkdirSync(obj.path+'/symmetric/'+time):null;

    fs.writeFileSync(
      obj.path+'/symmetric/'+time+'/key.json',
      new Util().JSONstr(dataKey.key.toString()));

    fs.writeFileSync(
      obj.path+'/symmetric/'+time+'/iv.json',
      new Util().JSONstr(dataKey.iv.toString()));

    return time;

  }

  async generateAsymmetricKeys(obj) {
      try {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa',
        {
                modulusLength: 4096/4,
                namedCurve: 'secp256k1',
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs8',
                    format: 'pem',
                    cipher: 'aes-256-cbc',
                    passphrase: obj.passphrase
                }
        });

        let time = (+ new Date());

        !fs.existsSync(obj.path+'/asymmetric') ?
        fs.mkdirSync(obj.path+'/asymmetric'):null;

        !fs.existsSync(obj.path+'/asymmetric/'+time) ?
        fs.mkdirSync(obj.path+'/asymmetric/'+time):null;

        fs.writeFileSync(obj.path+'/asymmetric/'+time+'/private.pem'
        , privateKey);

        fs.writeFileSync(obj.path+'/asymmetric/'+time+'/public.pem'
        , publicKey);

        return time;

      }catch(err){

        return null;

      }

  }

  encryptStringWithRsaPrivateKey(toEncrypt, relativeOrAbsolutePathToPrivateKey, passphrase) {
      let absolutePath = path.resolve(relativeOrAbsolutePathToPrivateKey);
      let privateKey = fs.readFileSync(absolutePath, "utf8");
      let buffer = Buffer.from(toEncrypt);
      let encrypted = crypto.privateEncrypt({
          key: privateKey.toString(),
          passphrase: passphrase,
      }, buffer);
      return encrypted.toString("base64");
  }

  decryptStringWithRsaPublicKey(toDecrypt, relativeOrAbsolutePathtoPublicKey) {
      let absolutePath = path.resolve(relativeOrAbsolutePathtoPublicKey);
      let publicKey = fs.readFileSync(absolutePath, "utf8");
      let buffer = Buffer.from(toDecrypt, "base64");
      const decrypted = crypto.publicDecrypt(publicKey, buffer);
      return decrypted.toString("utf8");
  }

  generateDataAsymetricSign(privateDirPem, publicBase64, passphrase, enableID, data){
    console.log(colors.magenta("generateDataAsymetricSign ..."));
    // este metodo genera una llave individual firmada para
    // hacerla portable y usarla para en pool o en una transaccion
    let idSign = null;
    let dataSign = {};
    if(data !== undefined){
      dataSign = data;
    }
    if(enableID === true){
      idSign  = {
         base64PublicKey: publicBase64,
         B64PUKSHA256: SHA256(publicBase64).toString()
      };
      dataSign = new Util().fusionObj([
        idSign,
        dataSign
      ]);
    }
    if(new Util().objEq(dataSign, {})){
      return console.log(colors.error("generateAsymetricFromSign() -> invalid data"));
    }
    return {
      data: dataSign,
      sign: this.encryptStringWithRsaPrivateKey(
        SHA256(
        new Util().JSONstr(dataSign)
        ).toString(),
        privateDirPem,
        passphrase
      )
    }


    /*
    let dataContent = {};
    if(setPublicKey == true){
      dataContent = new Util().fusionObj([
        data,
        {
          base64PublicKey: publicBase64,
          B64PUKSHA256: SHA256(publicBase64).toString()
        }
      ]);
    }else{
      dataContent = data;
    }
    return {
      data: dataContent,
      sign: this.encryptStringWithRsaPrivateKey(
        SHA256(
        new Util().JSONstr(dataContent)
        ).toString(),
        privateDirPem,
        passphrase
      )
    }

    */
  }



  getBase64AsymmetricPublicKeySignFromJSON(data){
    return Buffer.from(new Util().JSONstr(data)).toString('base64');
  }

  getJSONAsymmetricPublicKeySignFromBase64(data){
    return JSON.parse(Buffer.from(data, 'base64').toString());
  }

  validateDataTempKeyAsymmetricSign(
    base64PublicKey,
    test_key,
    blockChainConfig,
    charset,
    mainDir,
    nameDataFolder
  ){
    console.log(colors.magenta("validateDataTempKeyAsymmetricSign ..."));
    nameDataFolder==undefined ? nameDataFolder = 'data': null;
    const id_file_key = new Util().getHash();
    const publicDirPem = mainDir+'/'+nameDataFolder+'/temp/test-key/'+id_file_key+'.pem';
    fs.writeFileSync(
      publicDirPem,
      Buffer.from(base64PublicKey, 'base64').toString(),
      charset
    );
    const result = (
      SHA256(new Util().JSONstr(test_key.data)).toString()
      ===
      this.decryptStringWithRsaPublicKey(test_key.sign, publicDirPem)
    );
    fs.unlinkSync(publicDirPem);
    return result;


    /*
      nameDataFolder==undefined ? nameDataFolder = 'data': null;

      let id_file_key = new Util().getHash();
      let result = true;
      fs.writeFileSync(
        mainDir+'/'+nameDataFolder+'/temp/test-key/'+id_file_key+'.pem',
        new Util().existAttr(test_key.data, "sender") ?
        Buffer.from(test_key.data.sender.data.base64PublicKey, 'base64').toString()
        : Buffer.from(test_key.data.base64PublicKey, 'base64').toString(),
        charset
      );
      if(
        ! this.validateAsymmetricFromSign(
        test_key,
        blockChainConfig.keys.publicLen,
        mainDir+'/'+nameDataFolder+'/temp/test-key/'+id_file_key+'.pem')
      ){
        result = false;
      }
      fs.unlinkSync(mainDir+'/'+nameDataFolder+'/temp/test-key/'+id_file_key+'.pem');
      return result;

      */

  }

}
