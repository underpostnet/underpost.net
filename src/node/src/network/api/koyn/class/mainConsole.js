
import { Util } from "../../../../util/class/Util.js";
import fs from "fs";
import colors from "colors/safe.js";
import var_dump from 'var_dump';
import WebSocket from 'ws';
import readline from 'readline';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

export class MainConsole {

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


    this.portNode = await new Promise((resolve)=>{
       rl.question('Port Node? ', (res) => {
         rl.close();
         resolve(res);
       });
    });
    this.serverUrl = 'localhost:'+this.portNode;

    console.log('ws url sever:');
    console.log(this.serverUrl);


    //-----------------------------------------------------------------------
    //-----------------------------------------------------------------------

    // https://github.com/websockets/ws

    // FULL NODE REQUIRE OPEN PUBLIC WS PORT

    this.pullNodes = JSON.parse(fs.readFileSync('../data/nodes.json', {encoding:'utf8'}));
    this.statusNodes = [];
    this.wsNodes = [];

    let ind_ = 0;
    for(let node of this.pullNodes){

      this.statusNodes[ind_] = null;

      if(node!=this.serverUrl){

        this.statusNodes[ind_] = false;

        this.wsNodes[ind_] = new WebSocket(('ws://'+node));
        this.wsNodes[ind_].on('open', function open() {
          // wsKoynClient.send('');

          this.statusNodes[ind_] = true;

        });
        this.wsNodes[ind_].on('message', function incoming(data) {
        });

        this.wsNodes[ind_].onerror = (err)=>{
          console.log('ws error:'+node);
        };
      }else{

        // yo creo serverUrl

      }

      ind_++;
    }

    console.log(this.pullNodes);
    console.log(this.statusNodes);



   //-----------------------------------------------------------------------
   //-----------------------------------------------------------------------


















   //-----------------------------------------------------------------------
   //-----------------------------------------------------------------------

  }

}
