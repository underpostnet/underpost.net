import fileGetContents from 'file-get-contents';
import colors from 'colors/safe.js';
import fetch from 'node-fetch';

const rest = {
   getRaw: async path => new Promise((resolve, reject) => {
    fileGetContents(path).then( content => {
        console.log(colors.blue('getRaw: async path => '+path));
        resolve(content);
    }).catch(error => {
        console.log(colors.red(error));
        console.log(colors.red('getRaw: async path => '+path));
        reject(error);
    });
  }),

  postJSON: (url, data, headers) => new Promise((resolve, reject) =>
  fetch(url, {
    method: 'post',
    body:    JSON.stringify(data),
    headers: headers ? headers : { 'Content-Type': 'application/json' },
  }).then(res => {
    res.json().then(json => {
          resolve(json);
    }).catch(error => {
          reject(error);
    });
  }).catch(error => {
        reject(error);
  })),

  zipDownloader: () => {
    // defual url -> https://underpost.net/download/
    // request
    //   .get('https://underpost.net/download/fontawesome-free-5.3.1.zip')
    //   .on('error', function(error) {
    //     console.log(error);
    //   })
    //   .pipe(fs.createWriteStream(navi('../fontawesome-5.3.1.zip')))
    //   .on('finish', function() {
    //     console.log('finished dowloading');
    //     const zip = new admZip(navi('../fontawesome-5.3.1.zip'));
    //     console.log('start unzip');
    //     zip.extractAllTo(navi('../'), true);
    //     console.log('finished unzip');
    //     fs.unlinkSync(navi('../fontawesome-5.3.1.zip'));
    //     fs.renameSync(navi('../fontawesome-free-5.3.1-web'), navi('../fontawesome'));
    //   });
  }

};

export default rest;
