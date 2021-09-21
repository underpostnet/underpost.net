
import { Util } from "../../util/class/Util.js";
import fs from "fs";
import colors from "colors/safe.js";
import readline from 'readline';
import read from 'read';

export class ReadLine {

  constructor() {}

   /*async h(query){
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
 }*/

  /*

  Every option is optional.

  https://www.npmjs.com/package/read

prompt -> What to write to stdout before reading input.
silent -> Don't echo the output as the user types it.
replace -> Replace silenced characters with the supplied character value.
timeout -> Number of ms to wait for user input before giving up.
default -> The default value if the user enters nothing.
edit -> Allow the user to edit the default value.
terminal -> Treat the output as a TTY, whether it is or not.
input -> Readable stream to get input data from. (default process.stdin)
output -> Writeable stream to write prompts to. (default: process.stdout)

*/
  async h(query){
    return new Promise(resolve => {
      read({ prompt: query, silent: true, replace: "*" }, async (err, password) => {
        resolve(password);
      });
    })
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
