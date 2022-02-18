import colors from 'colors/safe.js';
import util from './util.js';


const info = {
  reqData: (req, data) => true ? {
    ...data,
    ...{
      ip: req.connection.remoteAddress || req.headers['x-forwarded-for'],
      date: new Date().toISOString(),
      host: req.headers.host,
      lang: req.acceptsLanguages().join('|'),
      browser: req.useragent.browser,
      version: req.useragent.version,
      os: req.useragent.os,
      platform: req.useragent.platform,
      geoIp: util.jsonSave(req.useragent.geoIp)
    },
    ...{source: req.useragent.source}
  }:null,
  log: (req, info_) => {
    const source_ = info_.source;
    const date_ = info_.date;
    delete info_.source;
    delete info_.date;
    console.log(
      ' \n > '
     + colors.bgYellow(colors.black(' '
     + req.method
     + ' ') )+ colors.green(' .'+info_.uri)
     + '\n  '+colors.yellow(date_));
    console.table(info_);
    console.log(' source: '+colors.green(source_));
  },
  view: (req, data) => {
    const info_ = info.reqData(req, data);
    info.log(req, info_);
  },
  api: (req, data) => {
    const info_ = info.reqData(req, data);
    info.log(req, info_);
  }

};

export default info;
