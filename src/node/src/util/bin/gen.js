


const path = require('path');
var fs = require('fs');

const utilPath = 'c:/dd/deploy_area/client/util.js';

var util = fs.readFileSync(utilPath, {encoding:'utf8', flag:'r'});

util = util.replace(/function/g, '');

util = util.replace("const timer = ms => new Promise(res => setTimeout(res, ms));",`

    async timer(ms){
      return  new Promise(res => setTimeout(res, ms))
    }

`);


util = util.replace(`(''+rut).replaceAll('.','');`, `(''+rut).replace(/./g,'');`);

util = util.replace("chr4(){", "function chr4(){");

util = util.replace('p.every(i => { return objEq(x[i], y[i]); });',
'p.every(i => { return this.objEq(x[i], y[i]); });');

util = util.replace('obj.hasOwnProperty(attr);',
`Object.prototype.hasOwnProperty.call(obj, attr)`);

util = util + `

copy(data) {
  clipboardy.writeSync(data);
}

paste(data) {
  return clipboardy.readSync();
}

`;

const str_fix = `str_test(str, type) {
  if(type=='charLength') {
      if( str.length >= 8 ) {
          return true;
      }else{
				return false;
			}
  }
  if(type=='lowercase') {
      var regex = /^(?=.*[a-z]).+$/;

      if( regex.test(str) ) {
          return true;
      }else{
				return false;
			}
  }
  if(type=='uppercase') {
      var regex = /^(?=.*[A-Z]).+$/;

      if( regex.test(str) ) {
          return true;
      }else{
				return false;
			}
  }
  if(type=='special')  {
      var regex = /^(?=.*[0-9_\W]).+$/;

      if( regex.test(str) ) {
          return true;
      }else{
				return false;
			}
  }
}


clearLastLine(){
	process.stdout.moveCursor(0, -1) // up one line
	process.stdout.clearLine(1) // from cursor to end
}



`;

util = util.split('/* fix */')[0]+str_fix+util.split('/* fix */')[2]

util = `

        import clipboardy from 'clipboardy';

        export class Util {

          constructor(){}

          `+util+`

        }

`;

 fs.writeFileSync(
   (path.join(__dirname, '../class/Util.js')),
   util,
   'utf-8'
 );
