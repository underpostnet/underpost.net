

const util = {
  timer: ms_ => new Promise(res => setTimeout(res, ms_)),
  jsonSave: obj_ => JSON.stringify(obj_, null, 4),
  clearDir: dir_ => dir_.replace(/\\/g, '/').replace(/\/\//g, "/"),
  uriValidator: uri_ => uri_ == undefined ? '' : util.clearDir(uri_),
  l: arr_ => arr_.length,
  clearSpace: (str_, replace_) => str_.replace(/\s/g, replace_==undefined?'':replace_),
  tl: str_ => str_.toLowerCase(),
  tu: str_ => str_.toUpperCase(),
  range: (ini, fin) => {
  	let list_ = [];
  	for(let i_=ini; i_<=fin; i_++){ list_.push(i_); }
  	return list_;
  },
  getKeys: obj_ => Object.keys(obj_),
  chr4: () => Math.random().toString(16).slice(-4),
  getHash: () => {
  	return util.chr4() + util.chr4() +
  	'-' + util.chr4() +
  	'-' + util.chr4() +
  	'-' + util.chr4() +
  	'-' + util.chr4() + util.chr4() + util.chr4();
  },
  newInstance: obj_ => JSON.parse(JSON.stringify(obj_)),
  changeKeyname: (obj, oldKey, newKey) => {
  	obj[newKey] = util.newInstance(obj[oldKey]);
  	delete obj[oldKey];
  	return obj;
  },
  makeid: (length, num) => {
    let result           = '';
    let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		num ? characters += '0123456789':null;
    let charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       return result;
  },
  reduce: render_ => render_.replace(/\n|\t/g, ''),
  isoDateRegex: () => new RegExp('^[0-9]{4}-((0[13578]|1[02])-(0[1-9]|[12][0-9]|3[01])|(0[469]|11)-(0[1-9]|[12][0-9]|30)|(02)-(0[1-9]|[12][0-9]))T(0[0-9]|1[0-9]|2[0-3]):(0[0-9]|[1-5][0-9]):(0[0-9]|[1-5][0-9])\.[0-9]{3}Z$')
  // getTimeIso: (isso, offTimeFactor) => new Date().getTime() + offTime(),
  // offTime:
  // HTMLS JSON diplay <pre>jsonSave()</pre>
};


export default util;
