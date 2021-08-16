
import fs from "fs";
import crypto from "crypto";
import path from "path";
import colors from "colors/safe.js";
import cryptoJs from "crypto-js";
import { Util } from "../../util/class/Util.js"

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
        await !fs.existsSync(path+time) ? fs.mkdirSync(path+time):null;
        await fs.writeFileSync(path+time+'/private.pem', privateKey);
        await fs.writeFileSync(path+time+'/public.pem', publicKey);

        console.log(colors.yellow('.generateKeys(path, passphrase)  -> success'));

        return true;

      }catch(err){

        console.log(colors.red('.generateKeys(path, passphrase)  -> error'));
        console.log(err);

        return false;

      }

  }

  async generateSymmetricKeys(obj){

    let genSize = 64; // 32
    let password = obj.passphrase;
    let salt = cryptoJs.lib.WordArray.random(64 / 8);
    let keySize = 256 / genSize;
    let ivSize = 128 / genSize;
    let key = cryptoJs.algo.EvpKDF.create({ keySize: keySize + ivSize, hasher: cryptoJs.algo.SHA1 }).compute(password, salt);
    let iv = cryptoJs.lib.WordArray.create(key.words.slice(keySize), ivSize * 4);
    key.sigBytes = keySize * 4;

    let time = (+ new Date());

    await !fs.existsSync(obj.path+'/symmetrict') ?
    fs.mkdirSync(obj.path+'/symmetrict'):null;

    await !fs.existsSync(obj.path+'/symmetrict/'+time) ?
    fs.mkdirSync(obj.path+'/symmetrict/'+time):null;

    await fs.writeFileSync(
      obj.path+'/symmetrict/'+time+'/key.json', new Util().JSONstr(key.toString()));

    await fs.writeFileSync(
      obj.path+'/symmetrict/'+time+'/iv.json', new Util().JSONstr(iv.toString()));

    return time;

  }

  async generateAsymmetricKeys(obj) {
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
                    passphrase: obj.passphrase
                }
        });

        let time = (+ new Date());

        await !fs.existsSync(obj.path+'/asymmetrict') ?
        fs.mkdirSync(obj.path+'/asymmetrict'):null;

        await !fs.existsSync(obj.path+'/asymmetrict/'+time) ?
        fs.mkdirSync(obj.path+'/asymmetrict/'+time):null;

        await fs.writeFileSync(obj.path+'/asymmetrict/'+time+'/private.pem'
        , privateKey);

        await fs.writeFileSync(obj.path+'/asymmetrict/'+time+'/public.pem'
        , publicKey);

        return time;

      }catch(err){

        return null;

      }

  }



}
