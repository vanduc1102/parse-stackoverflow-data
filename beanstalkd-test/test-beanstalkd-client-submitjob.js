'use strict';

let config = require('./../config');
const tubeName = 'stackoverflow';
const client = require('./../src/queue/beanClient');

client.use(tubeName, function (err, tubename) {
  if (err) {
    console.log(err);
  } else {
    console.log(tubename + ' is ready to use.');
  }
});

setInterval(createJob, 1000);

function createJob() {
  client.put(1, 1, 1, JSON.stringify({ username: 'ducnguyen : ' + Date.now() }), function (err, jobid) {
    if (err) {
      console.log(err);
    } else {
      console.log('submitted jobid : ' + jobid);
    }
  });
}
