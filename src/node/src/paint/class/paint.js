
import { Util } from "../../util/class/Util.js";
import colors from "colors/safe.js";

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
    this.underpostBar();
  }

  underpostView(title){
    this.underpostReset();
    this.underpostOption('yellow', ' ', title);
    this.underpostBar();
  }

}
