
import { Util } from "../../util/class/Util.js";
import colors from "colors/safe.js";

export class Paint {

  constructor(){}

  underpostBanner(){

    console.log(colors.yellow(`

    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
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
    @@@@@@@(                                 @@@@@@@@@
    @@@@@@@(  (@@@*                   @@@@   @@@@@@@@@
    @@@@@@@(  (@@@*                   @@@@   @@@@@@@@@
    @@@@@@@(  (@@@*                   @@@@   @@@@@@@@@
    @@@@@@@(  (@@@*                   @@@@   @@@@@@@@@
    @@@@@@@(  (@@@*                   @@@@   @@@@@@@@@
    @@@@/     (@@@*                   @@@@     .@@@@@@
    @@@@/     (@@@*                   @@@@     .@@@@@@
    @@@@(..   (@@@/                  .@@@@   ..,@@@@@@
    @@@@@@@(  (@@@@@@@@@@@@@@@@@@@@@@@@@@@. .@@@@@@@@@
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

      `));

  }

  underpostBar(){

    console.log(colors.yellow('----------------------------------------------------------'));

  }

  underpostOption(color, ind, content){

    console.log(colors[color](' '+ind+' > '+content));

  }

  underpostTitle(title){

    this.underpostBar();
    console.log(colors.yellow(' '+title));
    this.underpostBar();

  }

  underpostError(msg){

    console.log(colors.red(' error > '+msg));

  }

  underpostInput(text){

    return '   > '+text+': ';

  }

}
