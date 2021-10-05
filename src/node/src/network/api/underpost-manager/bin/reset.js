


import fs from "fs";
var generation = 0;
var charset = "utf8";
var paths = [
  'C:/dd/underpost.net/src/node/apps/underpost/data/blockchain/generation-'+generation+'/chain.json',
  'C:/dd/global_data/json/cyberia/koyn/blockchain/generation-'+generation+'/chain.json',
  'C:/Users/fcove/OneDrive/Escritorio/node_test/underpost-network/data/blockchain/generation-'+generation+'/chain.json'
];


/*const chain = fs.readFileSync(
    'C:/dd/global_data/json/cyberia/koyn/blockchain/default/10.json',
    charset
);*/

const chain = JSON.stringify([]);

for(let path of paths){
  fs.writeFileSync(path, chain, charset);
}



  fs.writeFileSync(
      'C:/dd/global_data/json/cyberia/koyn/blockchain/generation-'+generation+'/temp-pool-transactions.json',
  fs.readFileSync(
      'C:/dd/global_data/json/cyberia/koyn/blockchain/default/temp-pool-transactions.json',
      charset
  ), charset);












// end
