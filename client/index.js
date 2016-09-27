var test=require('./test').default;
// var test= new TEST("hola mundo");
test=new test();
console.log("loading");
console.log(test);
var dom=document.body.appendChild(document.createElement("DIV"));
dom.innerHTML='<div>'+test.output()+'</div>';
