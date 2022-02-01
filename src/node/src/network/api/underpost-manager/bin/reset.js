


import fs from "fs";
const charset = "utf8";
const { pathApi, pathClient } = JSON.parse(fs.readFileSync('./config.json', charset));

const pathsEmptyArray = [
  pathClient+'/chain.json',
  pathApi+'/chain.json',
  pathApi+'/signHistory.json',
  pathApi+'/koyn-nodes.json',
  pathApi+'/public-key-pull.json'
];
const pathsDeleteArray = [
  pathApi+'/doc.json',
  pathClient+'/hash',
  pathClient+'/public-key-pool.json',
  pathClient+'/rewardConfig.json'
];

pathsEmptyArray.map( path => fs.writeFileSync(path,
  JSON.stringify([]), charset));

pathsDeleteArray.map( path => fs.unlinkSync(path));

fs.writeFileSync(
  pathApi+'/temp-pool-transactions.json',
  JSON.stringify({
    index: 0,
    pool: []
  }, null, 4)
);












// end
