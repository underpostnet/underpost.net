import colors from 'colors/safe.js';
import util from './util.js';


const info = {
  reqData: (req, path, logGroups) => {
      const reqInfo = {
        ip: req.connection.remoteAddress || req.headers['x-forwarded-for'],
        date: new Date().toISOString(),
        host: req.headers.host,
        lang: req.acceptsLanguages().join('|'),
        browser: req.useragent.browser,
        version: req.useragent.version,
        os: req.useragent.os,
        platform: req.useragent.platform,
        geoIp: util.jsonSave(req.useragent.geoIp)
      };
      if(logGroups===true){
        console.log('');
        console.log(colors.bgBrightYellow(colors.black(util.tu(' path info '))));
        console.table(path);
        console.log(colors.bgBrightYellow(colors.black(util.tu(' req info '))));
        console.table(reqInfo);
        console.log(colors.bgBrightYellow(colors.black(util.tu(' source info '))));
        console.table(req.useragent.source);
        console.log(colors.bgBrightYellow(colors.black(util.tu(' resume '))));
      }
      return {
        ...path,
        ...reqInfo,
        ...{source: req.useragent.source}
      }
  },
  req: (req, path, logGroups) => {
    const display_ = info.reqData(req, path, logGroups);
    const source_ = display_.source;
    delete display_.source;
    console.log(
      ' \n > '
     + colors.bgYellow(colors.black(' '
     + req.method
     + ' ') )+ colors.green(' .'+path.uri)
     + '\n  '+colors.yellow(display_.date));
    console.table(display_);
    console.log(' source: '+colors.green(source_));
  }
};

export default info;
