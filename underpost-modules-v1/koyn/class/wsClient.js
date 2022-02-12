
import WebSocket from 'ws';

export class WSclient {

  constructor(obj){
    this.host_name = ('w'+(obj.ssl ? 'ss': 's')+'://'+obj.ws_host+':'+obj.ws_port);
    this.connection = new WebSocket(this.host_name);
    // console.log(this);
  }

  async onMsg(fn){
    this.connection.on('message',async data => {
      await fn(data);
    });
  }

  async onConnection(fn){
    this.connection.on('connection', async data => {
      await fn(data);
    });
  }

  async onOpen(fn){
    this.connection.on('open', async data => {
      await fn(data);
    });
  }

  async onClose(fn){
    this.connection.on('close', async data => {
      await fn(data);
    });
  }

  async send(msg){
    this.connection.send(msg);
  }

  async reset(){
    this.connection.close();
    this.connection = new WebSocket(this.host_name);
  }

  async clearEvent(type){
    /*
      handleSocket Types ->
    "message"
    "close"
    "open"
    "connection"
    */
    this.connection.removeEventListener(type, this.connection);
  }

  close(){
    return this.connection.close();
  }

}
