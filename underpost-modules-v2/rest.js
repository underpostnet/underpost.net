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
  })
};

export default rest;
