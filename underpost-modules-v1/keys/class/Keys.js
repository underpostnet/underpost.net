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


  getKeyHash(){
    return new Util().tu(new Util().getHash().split('-').pop())
  }

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

        let keyID = this.getKeyHash();
        !fs.existsSync(path+keyID) ? fs.mkdirSync(path+keyID):null;
        fs.writeFileSync(path+keyID+'/private.pem', privateKey);
        fs.writeFileSync(path+keyID+'/public.pem', publicKey);

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

      let { key, iv } = new Keys().generateKeyIv({ passphrase: passphrase });
      let testKSymInstance = new Keys();
      testKSymInstance.symmetric_config = {
        key: key.toString(),
        iv: iv.toString(),
        algorithm: tempData.symmetricAlgorithm
      };

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
    try {

    let dataKey = this.generateKeyIv(obj);

    let keyID = this.getKeyHash();

    !fs.existsSync(obj.path+'/symmetric') ?
    fs.mkdirSync(obj.path+'/symmetric'):null;

    !fs.existsSync(obj.path+'/symmetric/'+keyID) ?
    fs.mkdirSync(obj.path+'/symmetric/'+keyID):null;

    fs.writeFileSync(
      obj.path+'/symmetric/'+keyID+'/key.json',
      new Util().JSONstr(dataKey.key.toString()));

    fs.writeFileSync(
      obj.path+'/symmetric/'+keyID+'/iv.json',
      new Util().JSONstr(dataKey.iv.toString()));

    return keyID;

    }catch(err){

      return null;

    }

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

        let keyID = this.getKeyHash();

        !fs.existsSync(obj.path+'/asymmetric') ?
        fs.mkdirSync(obj.path+'/asymmetric'):null;

        !fs.existsSync(obj.path+'/asymmetric/'+keyID) ?
        fs.mkdirSync(obj.path+'/asymmetric/'+keyID):null;

        fs.writeFileSync(obj.path+'/asymmetric/'+keyID+'/private.pem'
        , privateKey);

        fs.writeFileSync(obj.path+'/asymmetric/'+keyID+'/public.pem'
        , publicKey);

        return keyID;

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
         B64PUKSHA256: SHA256(publicBase64).toString(),
         timestamp: (+ new Date())
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
    let publicDirPem;
    if(fs.existsSync(new Util().clearDir(mainDir+'/'+nameDataFolder+'/network/temp/test-key'))){
      publicDirPem = new Util().clearDir(mainDir+'/'+nameDataFolder+'/network/temp/test-key/'+id_file_key+'.pem');
    }else{
      publicDirPem = new Util().clearDir(mainDir+'/'+nameDataFolder+'/temp/test-key/'+id_file_key+'.pem');
    }
    publicDirPem = publicDirPem.replace('data/data', 'data');
    if(publicDirPem[0]==':')publicDirPem = 'c'+publicDirPem;
    console.log(' test publicDirPem ->');
    console.log(publicDirPem);
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

  }

}
