var sq = require('sequelize');
const Promise = require('bluebird');
var db;
var member;




function initORM(){
	//define sqlite connection
	return new Promise ((resolve, reject) =>{
	console.log('Creating connection...');
	db = new sq('null', 'null', 'null', {
		dialect: 'sqlite',
		storage: 'offline.db'
	    });
		
	resolve();	
	
	}
   );
}


function createTable() {
	//define member table within sqlite
	return new Promise ((resolve, reject) =>{
		console.log('Creating member Table...');
		member = db.define('Member', {
			Name 	: sq.STRING,
			mId      : sq.INTEGER,
			Age     : sq.INTEGER,
			Active  : sq.BOOLEAN			
	})
	resolve();	
	});	
}

function insert(){
	return new Promise ((resolve, reject) =>{
    	console.log('Inserting static data..');

	//insert data into member table
	db.sync().then(()=> member.create({Name : 'Ked Jones', mId : 322, Age: 34, Active : true }))
	resolve();	
	});
}

function getAll(){
	//insert data into member table
	return new Promise ((resolve, reject) =>{
		console.log('Reading data back...');

	db.sync().then(()=>member.findAll().then((members)=>{
			console.log(members)
		}
	))
	resolve();	
	});
}

module.exports = { initORM:initORM, insert:insert, getAll:getAll, createMemberTable:createMemberTable};


