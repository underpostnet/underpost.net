import SHA256 from "crypto-js/sha256.js";
import { RestService } from "../../../../rest/class/RestService.js";
import { Paint } from "../../../../paint/class/paint.js";
import colors from "colors/safe.js";
import { Util } from "../../../../util/class/Util.js";


export class Block {

    constructor() {

      this.node = {};
      this.block = {};
      this.hash = "";
      this.nonce = 0;

    }

    async setValues(obj){

      this.node = obj.node;
      this.block = obj.block;
      this.hash = obj.hash;
      this.nonce = obj.nonce;

      obj.dataGenesis ?
      this.dataGenesis = obj.dataGenesis :
      null;

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

    async mineBlock(obj, ws, interval) {
      new Paint().underpostOption('yellow', ' ', 'init mine block process');
      return await new Promise(async resolve => {

            this.block = Object.assign(this.block, obj.blockConfig);
            obj.blockConfig.index == 0 ? this.dataGenesis = obj.dataGenesis: null;

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

            console.log(colors.magenta('Mining Block '+this.block.index+' ...'));


            let current_ = (+ new Date());

            let timer_= (+ new Date());
            let timer_monitoring_ = (+ new Date());

            let start_ = (+ new Date());
            let size_ = 2;
            let h_ = 0;
            let m_ = 0;
            let s_ = 0;

            console.log(colors.magenta('time:00:00:00 nonce:0 hash/s:0'));

            const logStat =  force => {
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
                timer_ = new Util().newInstance(current_);
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

            //var onWsMsgController = 0;
            const monitoringBridge = async () => {
              if(current_-timer_monitoring_>interval){
                timer_monitoring_ = new Util().newInstance(current_);
                return await new Promise( async wsResolve => {
                  let fromHash = new Util().getHash();
                  ws.send(new Util().JSONstr({
                    // change to global update detect new transactions ?
                    // ir agregando las transaccione spendiente que no esten 
                    state: "get-last-block",
                    to: "server",
                    from: fromHash,
                    data: {
                      generation: this.block.generation
                    }
                  }));
                  //const idOnMsg = new Util().newInstance(onWsMsgController);
                  try {
                  ws.onMsg(async data => {
                    //console.log(" wsBridge.onMsg ->");
                    // new Paint().underpostOption('yellow', ' ', 'wsBridge on Monitoring status');
                    // console.log(idOnMsg);
                    // console.log(onWsMsgController);
                    //if(idOnMsg==onWsMsgController){


                                          let responseWsObj = JSON.parse(data);
                                          // console.log(responseWsObj);
                                          // console.log(" test ->");
                                          if(
                                            (responseWsObj.state == "get-last-block")
                                            &&
                                            (responseWsObj.to == fromHash)
                                            &&
                                            (responseWsObj.from == "server")
                                          ){
                                            // onWsMsgController++;


                                            ws.clearEvent("message");
                                            if(

                                              (responseWsObj.data.block.index >= this.block.index)
                                              &&
                                              (responseWsObj.data.node.rewardAddress != this.node.rewardAddress)

                                            ){
                                              /*await ws.reset();
                                              await ws.onOpen(async data => {
                                              });*/
                                              wsResolve({
                                                status: false,
                                                block: responseWsObj.data
                                              });
                                              return;
                                            }else {
                                              /*await ws.reset();
                                              await ws.onOpen(async data => {
                                              });*/
                                              wsResolve({
                                                status: true,
                                                block: null
                                              });
                                              return;
                                            }
                                          }
                    /*}else{
                      wsResolve({
                        status: true,
                        block: null
                      });
                    }*/


                  });
                  }catch(err){
                    console.log(colors.red("error > Corrupt wsBridge monitoring Object"));
                    console.log();
                    wsResolve({
                      status: true,
                      block: null
                    });
                    await ws.clearEvent("message");
                    return;

                  }


                });
              };
              return {
                status: true
              };
            };


          	while(!this.hash.startsWith(this.block.difficulty.zeros)) {
          		this.nonce++;
          		this.hash = this.calculateHash();
              current_ = (+ new Date());
              logStat(false);
              if(this.block.index!=0){ // fix -> return data only new block exist
                let monitoringBridgeStatus = await monitoringBridge();
                if(monitoringBridgeStatus.status == false){
                  resolve(monitoringBridgeStatus);
                  logStat(true);
                  return;
                }
              }
          	}
            logStat(true);
            resolve({
              status: true,
              block: this
            });

      });


    }

    async setData(paths){
      let storage = [];
      for(let path of paths){
        console.log(colors.green('GET DATA  | '+new Date().toLocaleString()+' | url:'+path.url));
        switch (path.type) {
          case "App":
            storage.push({
              type: path.type,
              url: path.url,
              sign: await new RestService().getRawContent(path.url+'/sign/'+this.block.generation)
            });
            break;
          case "Transaction":
            storage.push({
              type: path.type,
              url: path.url,
              data: await new RestService().getJSON(path.url+'/transactions/'+this.block.generation)
            });
            break;
          default:
            storage.push({
              error: "not valid type:"+path.type
            });
        }
      }
      return storage;
    }


}
