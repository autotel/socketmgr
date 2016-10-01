/*
this module contains the data for each client in a pool of websocket connections.
the idea is to be able to obtain the last state of each client side without
having necessarily to poll.
It also allows each client to have an unique client ID, and know the client ID
of all the other clients that are connected to the server.
*/
var clients={};
var nextClientId=0;
var nextClientIdSearch=function(startingFrom){
  //you can either try to be economic with the client id, or just allocate one entry per connection
/*  var currentClientN=startingFrom;
  while(clients[currentClientN]){
    currentClientN++;
  }
  return currentClientN;*/
  nextClientId++;
  return nextClientId;
}
//new Client ID creates a space for a new client.
//custom data can be provided, such as the websocket handle
exports.newClientId=function(append){
  var append=append||{};
  //question: if timestamp is provided in append parameter, it will get overwritten. Is that ok?
  append.timestamp={created:Date.now()};
  if(!append.currentState){
    append.currentState={};
  }
  this.clientId=nextClientIdSearch();
  clients[this.clientId]=append;
  console.log("kk"+this.clientId);
  return this.clientId;
}
//when a client emits data, you want to register it, so the registry will contain
//the latest state of each client
exports.clientEmitted=function(clientId,data){
  //update the client's current state from the data
  //it overwrites data with the same name, which gives sense to keeping track
  if(clients[clientId]){
    for(var a in data){
      clients[clientId].currentState[a]=data[a];
    }
    clients[clientId].timestamp.lastEmit=Date.now();
  }else{
    console.warn("ClientRegistry at clientEmitted(): tried to access clients["+clientId+"], which does not exist");
  }
}
exports.forEach=function(callback){
  for(var a in clients){
    callback(clients[a]);
  }
}
exports.getAllStates=function(){
  var statuses={};
  for(var a in clients){
    statuses[a]=clients[a].currentState;
  }
  return statuses;
}
exports.removeClient=function(clientId){
  return delete clients[clientId];
}