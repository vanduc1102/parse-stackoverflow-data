'use strict';

let config = require('./../config');
const tubeName = 'stackoverflow';

const client = require('./../src/queue/beanClient');

client.watch(tubeName, function (err, numwatched) {
  if (err) {
    console.log('Can not watch');
  } else {
    console.log('numwatched : ', numwatched);
  }
});

function loop() {
  consumeJob().then(response => loop());
}

function consumeJob() {
  return new Promise((_response, _reject) =>{
    client.reserve(function (err, jobid, payload) {
      if (err) {
        console.log('I dont know the reason.');
        return _reject(err);
      }
      console.log('Ready to reserve jobid : ' + jobid + ' ; payload : ', payload.toString());
      client.destroy(jobid, function (err) {
        console.log('destroyed : ' + jobid);
        if (err) {
          return _reject(err);
        }
        return _response(jobid);
      });
    });
  });
}

loop();
