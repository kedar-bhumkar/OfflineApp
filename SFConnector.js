var jsforce = require('jsforce');
//const Promise = require('bluebird');


class SFConn {
	
	constructor() {

   }
   
   login(username, passwd){
	    	return new Promise((resolve, reject) => {
			this.conn = new jsforce.Connection();
			this.conn.login(username, passwd, function(err, res) {
			if (err) { 
				return console.error(err); 
			} else {
				console.log('Connected to Salesforce successfully...');
				resolve();
			}	
		  });
		}
	  )		
   }
   
   
   get(soql, params = []){
     return new Promise((resolve, reject) => { 	   
	   	console.log('Query to be executed = ' + soql);
		this.conn.query(soql, function(err, res) {
		if (err) { 
			console.log('Error executing soql =' + soql)
			console.log('Error details = ' + err);
			reject(err);
			 
		 } else {
		   console.log('Query successfully executed = ' + soql);
		   resolve(res);
		 }
		});
	  }
    )
  }
  
  
  sendToSF(payload){
     return new Promise((resolve, reject) => { 	   
	   	console.log('Hitting Salesforce post webservice = ' + payload);
		this.conn.apex.post('/SoapOffline/', payload, function(err, res) {
		if (err) { 
			console.log('Error executing post request =' + err);
		 } else {
		   console.log('Post request  successful = ' + JSON.stringify(res));
		   resolve(res);
		 }
		});
	  }
    )
  }



  
  getFromSF(payload){
     return new Promise((resolve, reject) => { 	   
	   	console.log('Hitting Salesforce get webservice = ' + JSON.stringify(payload));
		this.conn.apex.get('/SoapOffline?payload=' + payload , function(err, res) {
		if (err) { 
			console.log('Error executing get request =' + err);
		 } else {
		   //console.log('GET request  successful = ' + JSON.stringify(res));
		   resolve(res);
		 }
		});
	  }
    )
  }
}


module.exports = SFConn


