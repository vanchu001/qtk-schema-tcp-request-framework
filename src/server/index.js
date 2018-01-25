const Server = require('@qtk/schema-tcp-framework').Server;
const Validator = require('../validator');
const EventEmitter = require('events').EventEmitter;

module.exports = class extends EventEmitter {
    constructor({host, port, handlerDir, schemaDir}) {
        super();
        this._server = new Server({host, port, validator: new Validator(schemaDir, Validator.Type.SERVER)});
        this._handlerDir = handlerDir;
        
        this._server.on("data", async (socket, {uuid, data:{command, payload:request}}) => {
            let response = await require(`${this._handlerDir}/${command}`)({request, socket});
            if (response === undefined) {
                response = null;
            }
            this._server.send(socket, {uuid, data:{command, payload:response}});
        });

        this._server.on("started", () => {this.emit("started");});
        this._server.on("stopped", () => {this.emit("stopped");});
        this._server.on("connected", (socket) => {this.emit("connected", socket);});
        this._server.on("closed", (socket) => {this.emit("closed", socket);});
        this._server.on("exception", (socket, error) => {this.emit('exception', socket, error);});
    }
    
    start() {
        this._server.start();
    }

    stop() {
		this._server.stop();
	}
}