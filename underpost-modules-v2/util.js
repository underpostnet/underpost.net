

const util = {
  timer: ms => new Promise(res => setTimeout(res, ms)),
  jsonSave: obj => JSON.stringify(obj, null, 4),
  clearDir: dir_ => dir_.replace(/\\/g, '/').replace(/\/\//g, "/"),
  uriValidator: uri => uri == undefined ? '' : util.clearDir(uri),
  l: arr_ => arr_.length,
  clearSpace: (str_, replace_) => str_.replace(/\s/g, replace_==undefined?'':replace_)
};


export default util;
