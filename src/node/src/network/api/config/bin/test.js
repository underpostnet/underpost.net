
//  Developed By Francisco Verdugo <fcoverdugoa@underpost.net>
//  https://github.com/underpostnet/underpost-network


import { Config } from "../class/config.js";

new Config().mainProcess(
  {
    dataPathTemplate: 'c:/dd/underpost.net/src/node/apps/underpost/data/underpost.json',
    dataPathSave: './underpost.json'
  }
);
