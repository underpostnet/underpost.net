// https://www.npmjs.com/package/file-get-contents


var data = {
  ws_koyn_port: 3004,
  data_base_http_host: 'http://localhost',
  data_base_http_port: 3001,
  data_base_http_path: '/koyn'
};

const fileGetContents = require('file-get-contents');

let url_path = data.data_base_http_host+
':'+data.data_base_http_port+
data.data_base_http_path;

async function test(){
  try {
      let data = await fileGetContents('./data/test');
      console.log('file data ->');
      console.log(data);
  } catch (err) {
      console.log('Unable to load file data');
  }

  try {
      let data = await fileGetContents(url_path);
      console.log('httph get data -> '+url_path);
      console.log(data);
  } catch (err) {
      console.log('Unable to load http get data -> '+url_path);
      console.log(err);
  }

};

test();


fileGetContents(url_path).then(json => {
    const data_ = JSON.parse(json);
    console.log('http get data json -> '+url_path);
    console.log(data_);
}).catch(err => {
    console.err('Unable to get http get data json ->');
    console.log(err);
});

fileGetContents('./data/test').then(data_file => {
    console.log('http get data file ->');
    console.log(data_file);
}).catch(err => {
    console.err('Unable to get http get data file ->');
    console.log(err);
});





//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
