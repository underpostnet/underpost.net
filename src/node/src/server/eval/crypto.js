// var crypto = require('crypto');
// var cryptoJs = require('crypto-js');

function generateK(){

  let genSize = 64; // 32
  let password = data.db.password;
  let salt = cryptoJs.lib.WordArray.random(64 / 8);
  let keySize = 256 / genSize;
  let ivSize = 128 / genSize;
  let key = cryptoJs.algo.EvpKDF.create({ keySize: keySize + ivSize, hasher: cryptoJs.algo.SHA1 }).compute(password, salt);
  let iv = cryptoJs.lib.WordArray.create(key.words.slice(keySize), ivSize * 4);
  key.sigBytes = keySize * 4;

  log('progress', 'K key -> ');
  log('warn', key.toString());
  log('progress', 'K iv -> ');
  log('warn', iv.toString());

  // data.db.key = key.toString();
  // data.db.iv = iv.toString();

}

var algorithm = 'aes-256-ctr';

var encrypt = (text, secretKey, iv) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

var decrypt = (hash, secretKey) => {

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

//--------------------------------------------
//--------------------------------------------

var k = {
	encr: function(content){
		return encrypt(content, data.db.key, Buffer.from(data.db.iv, "utf8")).content;
	},
	decr: function(content){
		return decrypt({
			content: content,
			iv: Buffer.from(data.db.iv, "utf8").toString('hex')
		}, data.db.key);
	},
	info: function(){
		log('info', 'DB ENCRYPT INFO ->');
		log('info', 'buffer iv ->');
		console.log(Buffer.from(data.db.iv, "utf8"));
		log('info','key char str length -> '+l(data.db.key));
		log('info','iv char str length -> '+l(data.db.iv));
	},
  test: function(){
    log('info', 'K test ->');
    log('info', k.decr(k.encr(JSONstr({content:"test"}))));
  }
	/*
	let test = 'asda';
	console.log(k.encr(test));
	console.log(k.encr(test));
	console.log(k.decr(k.encr(test)));
	console.log(k.decr(k.encr(test)));
	*/
};

k.test();
