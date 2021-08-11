
import { Util } from "../../util/class/Util.js";
import fs from "fs";
import colors from "colors/safe.js";
import readline from 'readline';

export class ReadLine {

  constructor() {}

   async h(query){
     return new Promise((resolve, reject) => {
     const rl = readline.createInterface({
       input: process.stdin,
       output: process.stdout
     });
     const stdin = process.openStdin();
     process.stdin.on('data', char => {
       char = char + '';
       switch (char) {
         case '\n':
         case '\r':
         case '\u0004':
           stdin.pause();
           break;
         default:
           process.stdout.clearLine();
           readline.cursorTo(process.stdout, 0);
           process.stdout.write(query + Array(rl.line.length + 1).join('*'));
           break;
       }
     });
     rl.question(query, value => {
       rl.history = rl.history.slice(1);
       resolve(value);
     });
   });
  }

  async r(query){
    return new Promise((resolve)=>{
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
       rl.question(query, (res) => {
         rl.close();
         resolve(res);
       });
    });
  }

}
