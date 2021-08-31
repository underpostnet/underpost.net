

//  Developed By Francisco Verdugo <fcoverdugoa@underpost.net>
//  https://github.com/underpostnet/underpost-network

// KOYN BLOCKCHAIN SYSTEM

import { BlockChain } from "../class/blockChain.js";

new BlockChain({
  generation: '0',
  version: '0.0.0',
  hashGeneration: null,
  // pathPreviousHashGeneration: '../data/blockchain/generation-0/hash',
  pathPreviousHashGeneration: null,
  dataGenesisHashGeneration: 'khrónos',
  userConfig: {
    blocksToUndermine: null,
    bridgeUrl: 'http://localhost:3001/koyn/chain',
    // bridgeUrl: null,
    zerosConstDifficulty: null,
    rewardAddress: "APOJA7S8ASNA9S8WE",
    blockChainDataPath: 'c:/dd/underpost.net/src/node/apps/underpost/data/blockchain',
    // blockChainDataPath: '../data/blockchain',
    // blockChainDataPath: null,
    maxErrorAttempts: 5,
    delayErrorAttempts: 1000,
    charset: 'utf8'
  },
  rewardConfig: {
    intervalChangeEraBlock: 1, /* 1 - 210000 - 300000 */
    totalEra: 9,
    hashesPerCurrency: 10,
    upTruncFactor: 15
  },
  difficultyConfig: {
    hashRateSeconds: 6000,
    intervalSecondsTime: 10,
    intervalCalculateDifficulty: 10
  }
}).mainProcess({
  paths: [
    {
      url: 'http://localhost:3001/koyn',
      type: 'App'
    },
    {
      url: 'http://localhost:3001/koyn',
      type: 'Transaction'
    }
  ]
});









// end
