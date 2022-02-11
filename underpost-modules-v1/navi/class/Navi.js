

import { Util } from "../../util/class/Util.js";
import { Paint } from "../../paint/class/paint.js";
import { ReadLine } from "../../read-line/class/ReadLine.js";

import fs from "fs";
import colors from "colors/safe.js";
import readline from 'readline';
import path from 'path';

// agregar arriba en el banenr undeprost.net v1.0.0
// acambar nomnre a navi

export class Navi {

  constructor() {

  }

  async init(obj){

    if(obj.preTitle != null){
      await obj.preTitle();
    }

    new Paint().underpostTextBotbar(obj.title);

    if(obj.postTitle != null){
      await obj.postTitle();
    }

    let input = null;
    let index = 1;
    for(let option of obj.options){
      new Paint().underpostOption('yellow' , index, option.text);
      index ++;
    }
    new Paint().underpostBar();

    if(obj.postMsg != null){
      new Paint().underpostOption(
        obj.postMsg.color,
        obj.postMsg.index,
        obj.postMsg.msg);
      new Paint().underpostBar();
    }

    input = parseInt(await new ReadLine().r(
      new Paint().underpostInput('select option')
    ));

    new Paint().underpostBar();

    for(let i of new Util().range(1, new Util().l(obj.options))){
      if(parseInt(input)==i){
        await obj.options[i-1].fn();
        obj.postMsg = null;
        await this.init(obj);
        break;
      }
    }

    obj.postMsg ={
      color: 'red',
      index: 'error',
      msg: 'option not valid'
    };
    await this.init(obj);

  }

}
