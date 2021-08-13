
import { Util } from "../../../../../src/util/class/Util.js";
import { ReadLine } from "../../../../../src/read-line/class/ReadLine.js";
import fs from "fs";
import colors from "colors/safe.js";
import var_dump from 'var_dump';
import WebSocket from 'ws';
import readline from 'readline';
import fetch from 'node-fetch';

export class Cyberia {

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

    // https://www.npmjs.com/package/node-fetch

    const email = await new ReadLine().r("email: ");
    console.log(email);

    const password = await new ReadLine().h("password: ");
    console.log(password);



    const body = { email: email, pass: password };

    fetch('http://localhost:3001/log_in', {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
        .then(res => res.json())
        .then(json => {
          console.log("fetch response ->");
          console.log(json);
          // console.clear();
        });




    //-----------------------------------------------------------------------
    //-----------------------------------------------------------------------




   //-----------------------------------------------------------------------
   //-----------------------------------------------------------------------


















   //-----------------------------------------------------------------------
   //-----------------------------------------------------------------------

  }

}
