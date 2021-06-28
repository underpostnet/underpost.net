
import fs from 'fs';
import { generateKeyPairSync } from 'crypto';

export class Keys {

  constructor(){}

  async generateKeys(path, passphrase) {
      try {
        const { publicKey, privateKey } = generateKeyPairSync('rsa',
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

        console.log('.generateKeys(path, passphrase) success');

        return true;

      }catch(err){

        console.log('.generateKeys(path, passphrase) error ->');
        console.log(err);

        return false;

      }
  }

}
