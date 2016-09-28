var Wsock=require('./ClientWebSocket').default;
var wsock=new Wsock();
wsock.init();
wsock.onMessage=function(memuse){
  console.log(memuse);
  document.getElementById('rss').innerHTML = memuse.rss;
  document.getElementById('heapTotal').innerHTML = memuse.heapTotal;
  document.getElementById('heapUsed').innerHTML = memuse.heapUsed;
};
