
import { Util } from "../../../../util/class/Util.js";
import { Keys } from '../../../../keys/class/Keys.js';
import { ReadLine } from '../../../../read-line/class/ReadLine.js';
import { FileGestor } from '../../../../file-gestor/class/FileGestor.js';
import fs from "fs";
import colors from "colors/safe.js";
import var_dump from 'var_dump';

export class KeysConsole {

  constructor() {}

  async mainProcess(){

    //-----------------------------------------------------------------------
    //-----------------------------------------------------------------------

    console.log('- - - - - - - - - - - - - - - - - - - - - -');
    console.log(colors.yellow(
                '            UNDERpost.net NetWork'));
    console.log(colors.yellow(
                '                MAIN CONSOLE '));
    console.log('- - - - - - - - - - - - - - - - - - - - - -');

    //-----------------------------------------------------------------------
    //-----------------------------------------------------------------------

    new FileGestor().logReadDirectory({
        title: 'current keys',
        path: 'c:/dd/global_data/json/underpostv3/keys',
        recursiveFolder: true,
        displayFolder: true,
        type: 'koyn-keys'
    });

  }

}
