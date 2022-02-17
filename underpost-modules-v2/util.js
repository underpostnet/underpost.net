

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
  }
};


export default util;
