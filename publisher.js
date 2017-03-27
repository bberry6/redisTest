const redis = require('redis');
const readline = require('readline');
const pub = redis.createClient();
const sub = redis.createClient();

let printResponse = false;
sub.on('message', (channel, message)=>{
   if(printResponse){
      console.log(`received message of length ${message.length}, ${message}\n`);
   }
   console.log(`received message of length ${message.length}\n`);
});

sub.subscribe('someChannel');

const randStr = (Math.random().toString(36)+'0000000000').slice(2,10);
const rl = readline.createInterface({
   input: process.stdin,
   output: process.stdout
});
const sizes = {
   kb: 1024,
   mb: 1024*1024,
   b: 1
}

function makeString(size){
   let endStr = randStr.slice(0, size % randStr.length );
   return (new Array(Math.floor(size / randStr.length))).fill(randStr).concat(endStr).join('');
}

rl.question("Print data to be sent (y/n)?", (answer)=>{
   if(answer.match(/y+/g)){
      printResponse = true;
   }
   ask();
});

function ask(){
   rl.question("Amount of data to send (up to 10mb, examples -> 1kb or 1024)? ", (answer)=>{
      let num = answer.match(/\d+/g);
      let dataToSend;
      let totalSize;

      if(num === null){
         console.log(new Error('Invalid input received.\n'));
         return ask();
      }
      num = num[0];

      let size = answer.match(/[a-zA-Z]+/g);
      if(size === null){
         totalSize = num;
         dataToSend = makeString(num);
      } else {
         totalSize = sizes[size[0].toLowerCase()]*num;

         if(totalSize >= 10*1024*1024){
            console.log('Size too large. Must be less than 10 mb\n');
            return ask();
         }
         dataToSend = makeString(totalSize);
      }

      console.log(`Sending totalSize bytes of data, repeated copies of ${randStr}`);
      pub.publish('someChannel', dataToSend);

      ask();
   });
}
