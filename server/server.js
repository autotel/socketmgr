

//++console.log(__dirname);
//question: is this the best way to go here? with respect to file relative paths

var socketServerManager = require("./socketServerManager").default;
var socketSM=new socketServerManager(9966);
