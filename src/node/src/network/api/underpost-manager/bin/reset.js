


import fs from "fs";

var charset = "utf8";
var paths = [
  'C:/dd/underpost.net/src/node/apps/underpost/data/blockchain/generation-0/chain.json',
  'C:/dd/global_data/json/cyberia/koyn/blockchain/generation-0/chain.json',
  'C:/Users/fcove/OneDrive/Escritorio/node_test/underpost-network/data/blockchain/generation-0/chain.json'
];


const chain32 = fs.readFileSync(
    'C:/dd/global_data/json/cyberia/koyn/blockchain/default/32.json',
    charset
);

for(let path of paths){
  fs.writeFileSync(path, chain32, charset);
}











// end
