'use strict';

var request = require('request');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
var jsdom = require('jsdom');
const { JSDOM } = jsdom;


main();

function main() {
	var userId = 1659807;
	var folder = 'result/';
	if( fs.existsSync(folder) ){
		rimraf.sync(folder);
	}
	fs.mkdirSync(folder);
	dataToFile('1659807?order=desc&sort=reputation&site=stackoverflow', path.join(folder ,userId + '-profile.json'));
	dataToFile('1659807/tags?order=desc&sort=popular&site=stackoverflow', path.join(folder ,userId + '-tags.json'));
	dataToFile('1659807/reputation-history?site=stackoverflow', path.join(folder ,userId + '-reputation-history.json'));
	dataToFile('1659807/questions?order=desc&sort=activity&site=stackoverflow', path.join(folder ,userId + '-question.json'));
	dataToFile('1659807/answers?order=desc&sort=activity&site=stackoverflow', path.join(folder ,userId + '-answers.json'));
	dataToFile('1659807/comments?order=desc&sort=activity&site=stackoverflow', path.join(folder ,userId + '-comments.json'));
	dataToFile('1659807/posts?order=desc&sort=activity&site=stackoverflow', path.join(folder ,userId + '-posts.json'));
	dataToFile('1659807/network-activity', path.join(folder ,userId + '-network-activity.json'));
	parseData().then(res => saveToFile( path.join(folder ,userId + '-data-parse.json'), JSON.stringify(res, null, 4)));
}

function dataToFile(urlSeg, fileName){
	getData(urlSeg).then(res => {
		saveToFile(fileName, JSON.stringify(res, null, 4)).then(res => console.log(res));
	}, reason => {
		console.log(reason);
	});
}

function getData(segment) {
	var url = `https://api.stackexchange.com/2.2/users/${segment}`;
	return new Promise( (resolve, reject) => {
		request({
			url: url,
			method: 'GET',
			gzip: true,
			json:true
		}, (error, response, body) => {
			if (error) {
				return reject(error);
			}
			return resolve(body);
		});
	});
}

function saveToFile(fileName, data) {
	return new Promise((res, rej) => {
		fs.writeFile(fileName, data , (err) => {
			if (err) {
				console.log(err);
				return rej(err);
			}
			var msg = 'Finish save data to ' + fileName;
			return res(msg);
		});
	});
}

function parseData() {
	var url = 'https://stackoverflow.com/users/1659807/duykhoa';
	var DataParse = {};
	return new Promise( (resolve, reject) => {
		request({
			followRedirect: true,
			url: url,
			method: 'GET',
			contentType: "text/html",
			gzip: true
		}, (error, response, body) => {
			const { document } = (new JSDOM(body)).window;
			DataParse['user-card-name'] = document.querySelector('.user-card-name').firstChild.nodeValue.trim();
			DataParse['current-position'] = document.querySelector('.current-position').firstChild.nodeValue.trim();
			DataParse['bio'] = document.querySelector('.bio').textContent.trim();
			DataParse['social-links'] = [];
			var nodeList = document.querySelectorAll('.user-links li');
			nodeList.forEach(function(element) {
				var link = element.querySelector('a');
				DataParse['social-links'].push({
					'type': element.querySelector('svg').getAttribute('class').replace('svg-icon icon',''),
					'url': link ? link.getAttribute('href') : element.textContent.trim()
				});
			}, this);
			resolve(DataParse);
		});
	});
}
