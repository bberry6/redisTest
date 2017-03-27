const redis = require('redis');
const sub = redis.createClient();

sub.on('message', (channel, message)=>{
   console.log(`received message of length ${message.length}\n`);
});

sub.subscribe('someChannel');
