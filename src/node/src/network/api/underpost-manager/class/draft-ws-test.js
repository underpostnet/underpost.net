this.wsBridge.onOpen(async data => {

  new Paint().underpostOption('yellow', ' ', 'success bridge ws connection');
  new Paint().underpostOption('yellow', ' ', 'init mine block process');

  this.wsBridge.onMsg(data => {
    console.log(" wsBridge.onMsg ->");
    try{
      // console.log(JSON.parse(data));
      let newBlock = JSON.parse(data);
      if( (newBlock.state == 'new-block') ){
        if(newBlock.data.node.rewardAddress!=publicKey){
          new Paint().underpostOption('red','error', 'wsBridge: other new Block success');
          exceptionProcess = {
            status: false,
            block: newBlock.data
          };
        }else{
          // console.log('auto send block');
          new Paint().underpostOption('cyan','success', 'wsBridge: propagate Block');
        }

      }
    }catch(err){
      // console.log(err);
      new Paint().underpostOption('red','error', 'wsBridge: corrupt ws Object');

    }

  });

  let statusBlockChainProcess = await blockChainProcess.mainProcess({
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
  }, async () => {
    return await new Promise(async resolve => {
     resolve((exceptionProcess==null));
    });
  });

  exceptionProcess != null ?
  resolve(exceptionProcess) :
  resolve({
    status: statusBlockChainProcess,
    block:
    blockChainProcess.latestBlock() == undefined ?
    null : blockChainProcess.latestBlock()
  });

});
