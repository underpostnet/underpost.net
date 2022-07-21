import SHA256 from "crypto-js/sha256.js";
import { RestService } from "../../rest/class/RestService.js";
import { Paint } from "../../paint/class/paint.js";
import colors from "colors/safe.js";
import { Util } from "../../util/class/Util.js";
import Ajv from "ajv";


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

    async mineBlock(obj, ws) {
      new Paint().underpostOption('yellow', ' ', 'init mine block process');
      return await new Promise(async resolve => {

            this.block = Object.assign(this.block, obj.blockConfig);
            obj.blockConfig.index == 0 ?
            this.dataGenesis = obj.dataGenesis : null;

            this.node = {
              dataTransaction: [],
              dataApp: await this.setData(obj),
              rewardAddress: obj.userConfig.rewardAddress
            };

            console.log(colors.magenta('Mining Block '+this.block.index+' ...'));

            let current_ = (+ new Date());

            let timer_= (+ new Date());
            let timer_monitoring_ = (+ new Date());

            let start_ = (+ new Date());
            let size_ = 2;
            let h_ = 0;
            let m_ = 0;
            let s_ = 0;

            let limitSizeActive = false;
            let limitMbBlock = obj.dataGenesis.limitMbBlock;
            let roundDigitSize = 3;
            // let unitSizeLog = "megaBytes";
            let unitSizeLog = "kiloBytes";

            console.log(colors.magenta('time:00:00:00 nonce:0 hash/s:0 size:'
              +new Util().aprox(new Util().getSizeJSON(this)[unitSizeLog], roundDigitSize)
              +'['+unitSizeLog+']'
            ));

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
                  ((this.nonce/  (((+ new Date())-start_)/1000)  ).toFixed(2))+' size:'
                    +new Util().aprox(new Util().getSizeJSON(this)[unitSizeLog], roundDigitSize)
                    +'['+unitSizeLog+']'
                ));
              }
            };

            const checkDataTransactionStatus = async bridgeDataTransactions => {

              // console.log("checkDataTransactionStatus ->");
              // console.log(bridgeDataTransactions);
              // let auxDataTransactions = new Util().newInstance(this.node.dataTransaction);
              let logs = false;
              if(new Util().l(bridgeDataTransactions)>0){
                console.log(colors.cyan("set news transactions count:"+
                  new Util().l(bridgeDataTransactions)
                ));
                // this.node.dataTransaction = this.node.dataTransaction.concat(bridgeDataTransactions);

                let stop_ = false;
                for(let _transaction of bridgeDataTransactions){
                  if(!stop_){
                    this.node.dataTransaction.push(_transaction);
                    if(new Util().getSizeJSON(this)>limitMbBlock){

                      this.node.dataTransaction.pop();
                      console.log(colors.red("already maximum block weight"))
                      console.log(new Util().getSizeJSON(this));
                      limitSizeActive = true;      
                      logs = true;
                      stop_ = true;

                    }
                  }
                }

                logs = true;
              }

              // console.log(new Util().getSizeJSON(this));
              /*
              if(new Util().getSizeJSON(this).megaBytes > limitMbBlock){
                console.log(colors.red("maximum block weight exceeded"))
                this.node.dataTransaction = auxDataTransactions;
                console.log(new Util().getSizeJSON(this));
                limitSizeActive = true;

                logs = true;
              }
              */
              logs ? console.log() : null;

            };

            //var onWsMsgController = 0;
            const monitoringBridge = async force => {
              if( (current_-timer_monitoring_>obj.userConfig.intervalBridgeMonitoring) || (force==true) ){
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
                      generation: this.block.generation,
                      lastIndexTransaction: new Util().l(this.node.dataTransaction)
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
                                              // await checkDataTransactionStatus(responseWsObj.dataTransaction.pool);
                                              wsResolve({
                                                status: false,
                                                block: responseWsObj.data
                                              });
                                              return;
                                            }else {
                                              /*await ws.reset();
                                              await ws.onOpen(async data => {
                                              });*/
                                              limitSizeActive == true ? null :
                                              await checkDataTransactionStatus(responseWsObj.dataTransaction.pool);
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

            let first_mine = true;
          	while(!this.hash.startsWith(this.block.difficulty.zeros)) {
          		this.nonce++;
          		this.hash = this.calculateHash();
              current_ = (+ new Date());
              logStat(false);
              if(this.block.index!=0){ // fix -> return data only new block exist
                let monitoringBridgeStatus = await monitoringBridge(first_mine);
                first_mine = false;
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

    async setData(obj){
      let dataApp = [];
      for(let path of obj.paths){
        console.log(colors.green('GET DATA  | '+new Date().toLocaleString()+' | url:'+path));

        const dataItemsApp = await new RestService().getRawContent(
          'http'+(obj.userConfig.dev?'':'s')+'://'+path+'/koyn/data-items/'+this.block.generation
        );

        // const ajv = new Ajv({schemas: schemasBlockchain});
        // const validate = ajv.getSchema("transaction");

        // los emit el SHA256 debe ser unico por el tlmestamp

        dataApp.push({
          path,
          ...JSON.parse(dataItemsApp)
        });

      }
      return dataApp;
    }


}
