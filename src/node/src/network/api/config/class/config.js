import { Util } from "../../../../util/class/Util.js";
import { Keys } from '../../../../keys/class/Keys.js';
import { ReadLine } from '../../../../read-line/class/ReadLine.js';
import { FileGestor } from '../../../../file-gestor/class/FileGestor.js';
import fs from "fs";
import colors from "colors/safe.js";
import var_dump from 'var_dump';


export class Config {

  constructor() {}

  async mainProcess(obj){

    /*
    {
      dataPathTemplate: './template.json',
      dataPathSave: './underpost.json'
    }
    */

    var data = JSON.parse(fs.readFileSync(obj.dataPathTemplate));

    console.log('config init');

    data.http_port = parseInt(await new ReadLine().r('http port: '));
    data.ws_port = parseInt(await new ReadLine().r('ws port: '));

    data.network_user.username = await new ReadLine().r('network user username: ');
    data.network_user.email = await new ReadLine().r('network user email: ');
    data.network_user.web = await new ReadLine().r('network user web: ');
    data.network_user.bio = await new ReadLine().r('network user bio: ');

    /* await !fs.existsSync(data.dataPath+'keys') ?
    fs.mkdirSync(data.dataPath+'keys'):null;

    let symmetricPass = await new ReadLine().h('symmetric key password: ');
    data.symmetricKeys.push(await new Keys().generateSymmetricKeys({
      passphrase: symmetricPass,
      path: data.dataPath+'keys'
    }));

    let asymmetricPass = await new ReadLine().h('asymmetric key password: ');
    data.asymmetricKeys.push(await new Keys().generateAsymmetricKeys({
      passphrase: asymmetricPass,
      path: data.dataPath+'keys'
    })); */

    /*

    TODO:

    Toda interaccion con passphrase debe pedirse in input
    ( no se alamcena la passphrase )

    Habilitar ServerMods ->
    "api-test.js"
    "koyn/eval/service.js"

    */

    data.secret_session = new Util().getHash();

    data.reset = false;

    await fs.writeFileSync(
      obj.dataPathSave,
      new Util().jsonSave(data)
    );

  }

}
