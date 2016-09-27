
export default class SocketController {
    constructor() {
      this.io = require('../node_modules/socket.io-client/lib/index')();
      console.log

      console.log("Socket controller constructed!")
    }
    init() {
        this.socket = this.io('localhost:3000');
        return this.socket;
    }
    emit(message, args) {
        console.log("Sending message ", message);
        this.socket.emit(message, args);
    }
    on(message, func) {
        this.socket.on(message, func);
    }
}