import fileGetContents from 'file-get-contents';
import colors from 'colors/safe.js';

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


  zipDownloader: () => {
    // defual url -> https://underpost.net/download/
    // request
    //   .get('https://underpost.net/download/fontawesome-free-5.3.1.zip')
    //   .on('error', function(error) {
    //     console.log(error);
    //   })
    //   .pipe(fs.createWriteStream(navDir('../fontawesome-5.3.1.zip')))
    //   .on('finish', function() {
    //     console.log('finished dowloading');
    //     const zip = new admZip(navDir('../fontawesome-5.3.1.zip'));
    //     console.log('start unzip');
    //     zip.extractAllTo(navDir('../'), true);
    //     console.log('finished unzip');
    //     fs.unlinkSync(navDir('../fontawesome-5.3.1.zip'));
    //     fs.renameSync(navDir('../fontawesome-free-5.3.1-web'), navDir('../fontawesome'));
    //   });
  }

};

export default rest;
