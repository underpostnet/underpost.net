
import WebSocket from 'ws';

export class WSclient {

  constructor(obj){
    this.host_name = ('w'+(obj.ssl ? 'ss': 's')+'://'+obj.ws_host+':'+obj.ws_port);
    this.connection = new WebSocket(this.host_name);
    // console.log(this);
  }

  onMsg(fn){
    this.connection.on('message', data => {
      fn(data);
    });
  }

  onOpen(fn){
    this.connection.on('open', data => {
      fn(data);
    });
  }

  close(){
    return this.connection.close();
  }

}
