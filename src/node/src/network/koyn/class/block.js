import SHA256 from "crypto-js/sha256.js";
import { RestService } from "../../../../../src/rest/class/RestService.js";
import colors from "colors/safe.js";
import { Util } from "../../../../../src/util/class/Util.js";


export class Block {

    constructor() {

      this.node = {};
      this.block = {};
      this.hash = "";
      this.nonce = 0;

    }

    calculateHash() {
      switch (this.block.index) {
        case 0:
          return SHA256(
            new Util().JSONstr({
              node: this.node,
              block: this.block,
              dataGenesis: this.dataGenesis,
              nonce: this.nonce
            })
          ).toString();
        default:
          return SHA256(
            new Util().JSONstr({
              node: this.node,
              block: this.block,
              nonce: this.nonce
            })
          ).toString();
      }
    }

    async mineBlock(obj) {

      this.node = Object.assign(
        {
          dataApp: await this.setData(
            obj.paths.filter((el)=>{
              return (el.type=='App')
            })
          )
        },
        {
          dataTransaction: await this.setData(
            obj.paths.filter((el)=>{
              return (el.type=='Transaction')
            })
          )
        },
        {
          rewardAddress: obj.rewardAddress
        }
      );

      this.block = Object.assign(this.block, obj.blockConfig);
      obj.blockConfig.index == 0 ? this.dataGenesis = obj.dataGenesis: null;

      console.log(colors.magenta('Mining Block '+this.block.index+' ...'));

      let timer_= (+ new Date());
      let start_ = (+ new Date());
      let size_ = 2;
      let h_ = 0;
      let m_ = 0;
      let s_ = 0;

      console.log(colors.magenta('time:00:00:00 nonce:0 hash/s:0'));

      const logStat = (force)=>{
        let current_ = (+ new Date());
        if((current_-timer_>1000)||force){

          (current_-timer_>1000) ? s_++ : null;
          if(s_==60){
            s_ = 0;
            m_++;
          }
          if(m_==60){
            m_ = 0;
            h_++;
          }
          timer_ = current_;

          new Util().clearLastLine();
          console.log(colors.magenta(
            'time:'+
            new Util().pad(h_, size_)+':'+
            new Util().pad(m_, size_)+':'+
            new Util().pad(s_, size_)+' nonce:'+
            this.nonce+' hash/s:'+
            ((this.nonce/  (((+ new Date())-start_)/1000)  ).toFixed(2))
          ));
        }
      };

    	while(!this.hash.startsWith(this.block.difficulty.zeros)) {
    		this.nonce++;
    		this.hash = this.calculateHash();
        // console.log(this.hash);
        logStat(false);
    	}
      logStat(true);

      console.log(this);

    }

    async setData(paths){
      let storage = [];
      for(let path of paths){
        console.log(colors.green('GET DATA  | '+new Date().toLocaleString()+' | url:'+path.url));
        storage.push({
          type: path.type,
          url: path.url,
          data: await new RestService().getJSON(path.url)
        });
      }
      return storage;
    }


}
