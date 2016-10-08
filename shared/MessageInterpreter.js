/*this contains functions to encode and decode messages into and from websocket
communications. It is necessary because we want to send the smallest payloads possible.
this script is shared between server and client, and makes the task of compressing
adn decompressing the data */
// function VectorND(buffer){
//   switch(buffer.length){
//     case 4:
//     return {x:buffer[1],y:buffer[2],z:buffer[3]}
//     break;
//     case 3:
//     return {x:buffer[1],y:buffer[2]}
//     break;
//     case 2:
//     return {x:buffer[1]}
//     break;
//     default:
//     console.warn("MessageInterpreter: Message had a vector header, but it's length was out of rule",buffer);
//     return {};
//   }
// }
// function intArrayEncode(arr){
//   return new Uint32Array(arr);
// }
// function intArrayDecode(data){
//   return new Uint32Array(data);
// }
// function Raw(buffer){
//   return buffer;
// }
// let headerToReturnType={
//   0:Raw,
//   1:VectorND
// }

//to get quoted array you can type jsut the chars and process it with the regex
//[^,\n] -> "$&"
let charLookup=""+
  "0123456789abcdef"+
  "ghijklmnopqrstuv"+
  "wxyzABCDEFGHIJKL"+
  "MNOPQRSTUVWXYZ<>"+
  "?"
//https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String

// function ab2str(buf) {
//   return String.fromCharCode.apply(null, new Uint16Array(buf));
// }
// function str2ab(str) {
//   let buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
//   let bufView = new Uint16Array(buf);
//   for (let i=0, strLen=str.length; i < strLen; i++) {
//     bufView[i] = str.charCodeAt(i);
//   }
//   return buf;
// }


function decode(bufferArray){
  try{
    let retArr={
      header:""
    };

    // let =new ArrayBuffer(20);

    let inComing={
      //bytes 0,1,2,3 will contain message type name
      header:new Uint8Array(bufferArray,0,4),
      //bytes 4-7, quartets 1 will contain object pointer
      pointer:new Uint32Array(bufferArray,4,1),
      //bytes 8-19, quartets 2,3,4 will contain payload
      data:new Float32Array(bufferArray,8)
    }

    for(let a=0;a<4;a++){
      retArr.header+=charLookup[inComing.header.buffer[a]];
    }
    console.log(retArr.header);
    // your browser must support for..of loop
    // and let-scoped variables in for loops
    retArr.pointer=inComing.pointer[0];
    // console.log(inComing.pointer[0]);
    retArr.data=inComing.data;

    // console.log();
    return(retArr);
  }catch(e){
    console.log("error while decoding data from a socket",e);
    console.log("the recieved data was:",bufferArray);
  }
}
export {decode}
// encode({type:"vector",pointer:32,coords}

function encode(data){
  try{
    let bufferArray=new ArrayBuffer(20);
    let outGoing={
      //bytes 0,1,2,3 will contain message type name
      header:new Uint8Array(bufferArray,0,4),
      //bytes 4-7, quartets 1 will contain object pointer
      pointer:new Uint32Array(bufferArray,4,1),
      //bytes 8-19, quartets 2,3,4 will contain payload
      data:new Float32Array(bufferArray,8)
    }
    //encode header as four characters
    // data[0]=new Float32Array(str2ab(data[0]));
    // console.log(data[0]);
    for(let a=0;a<4;a++){
      let charNum=charLookup.indexOf(data.header[a]);
      if(charNum==-1)charNum=charLookup.length-1;
      outGoing.header.buffer[a]=charNum;
      console.log(outGoing.header.buffer[a]);
    }
    outGoing.pointer[0]=data.pointer;
    for(let a=0;a<outGoing.data.length;a++){
      outGoing.data[a]=data.data[a];
    }
    //encode reference as uint32
    outGoing.pointer=data.pointer;

    // console.log(data[1].length);
    return bufferArray;
  }
  catch(e){
    console.log("exception while trying to encode the data into the socket.",e);
    console.log("the expected data looks like this:",{header:"vect",pointer:18,data:[-1,2,-3]});
    return false;
  }
}
export {encode}
