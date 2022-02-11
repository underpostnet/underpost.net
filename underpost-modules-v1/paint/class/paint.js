
import { Util } from "../../util/class/Util.js";
import colors from "colors/safe.js";

/*

black
red
green
yellow
blue
magenta
cyan
white
gray
grey

*/

export class Paint {

  constructor(){}

  underpostBanner(){

    console.log(colors.yellow(`

    UNDERpost.net Manager Console v1.0.0

    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@*  #@@@@@@@@@@@@@   @@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@@&&%##%@@@@@@&###&&&@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@@@@/   @@@@@@#   @@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@(                    .@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@(                    .@@@@@@@@@@@@@@@
    @@@@@@@@@@&..                      ..*@@@@@@@@@@@@
    @@@@@@@@@@&      @@@@@,     @@@.     ,@@@@@@@@@@@@
    @@@@@@@@@@&      @@@@@,     @@@      ,@@@@@@@@@@@@
    @@@@@@@@@@@@@@,                   %@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@,                   %@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@@@@@(          .@@@@@@@@@@@@@@@@@@@@
    @@@@@@@(                                 @@@@@@@@@
    @@@@@@@(                                 @@@@@@@@@


      `));

    this.underpostBar();

  }

  underpostBar(){

    console.log(colors.yellow('----------------------------------------------------------'));

  }

  underpostOption(color, ind, content){

    console.log(colors[color](' '+ind+' > '+content));

  }

  underpostError(msg){

    console.log(colors.red(' error > '+msg));

  }

  underpostInput(text){

    return '   > '+text+': ';

  }

  underpostReset(){
    // console.clear();
    // this.underpostBar();
    // this.underpostBanner();
    // this.underpostBar();
  }

  underpostTextBotbar(title){
    this.underpostOption('yellow', ' ', title);
    this.underpostBar();
  }

}
