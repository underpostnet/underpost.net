

import { Util } from "../../util/class/Util.js";
import { Paint } from "../../paint/class/paint.js";
import { ReadLine } from "../../read-line/class/ReadLine.js";

import fs from "fs";
import colors from "colors/safe.js";
import readline from 'readline';
import path from 'path';


export class Menu {

  constructor() {

  }

  async numOption(obj){

    console.clear();

    new Paint().underpostBar();
    new Paint().underpostBanner();
    new Paint().underpostTitle(obj.title);

    let index = 1;
    for(let option of obj.options){
      new Paint().underpostOption(index, option);
      index ++;
    }

    new Paint().underpostBar();

    try {

      let input = new ReadLine().r(' option: ');

    } catch(err){
      console.log(err);
    }


  }

}
