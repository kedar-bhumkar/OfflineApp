const express = require('express');
const dbApp = require('./SqliteConnector');
const mbDao = require('./MemberDAO');
const syncDao = require('./SyncTableDAO');
const SF = require('./SFConnector');
const app = express();
var mb,syncTbl,sfConn, lastSyncTime;
var isOnline = true;


app.get('/', (req, res) =>  {
		
});

app.get('/api/contact/add', (req, res) => {
     mb.create(getRandomId(), '', new Date().toISOString(), 1);
});

app.get('/api/contact/edit/:id', (req, res) => {
    mb.update(req.params.id).then(()=>console.log('Item updated successfully'));
});

app.get('/api/contact/all', (req, res) => {
    mb.getAll().then((rows)=>console.log(rows));
});

app.get('/api/contact/delete/:id', (req, res) => {
	console.log('Offline item to be deleled = ' + req.params.id);
	mb.softDelete(req.params.id).then(()=>console.log('Item soft deleted successfully'));
});

app.listen(3000, () => {
  console.log('Server is up on port 3000');
  const db = new dbApp('./offline.db');
  mb = new mbDao(db);
  syncTbl = new syncDao(db);
  //Check if online
  if(isConnected()){
		sync();
  } else {
	   
	   readOffline();
  } 
});

function sync(){
	
	sfConn = new SF();
	sfConn.login('kedar@personalorg.com', 'chatter20104x1hWIJvUVI8PMoQDdGBBISy1')
   //.then(()=>sfConn.get('Select Id, Name, Phone, Email, LastModifiedDate from Contact'))
   .then(()=>readLastSyncTime())
   .then((lastSyncTime)=>sfConn.getFromSF(lastSyncTime))
   .then((res)=> {
	   console.log('GET Response =' + JSON.stringify(res));
	   reconcile(res);
	   syncTbl.update();
	});
}


function readLastSyncTime() {
	return new Promise((resolve, reject) =>{ 
		 syncTbl.createTable()
		 .then(()=>syncTbl.get())
		 .then((row)=>{				
			if(row ==  null || row == '' || row.length <=0) {
				lastSyncTime = 'XXX';
				syncTbl.insert();
				console.log('Offline storage is empty');
			}else {
				lastSyncTime = row.LastSyncTime;
				//console.log('Offline storage is present... lastSyncTime = ' + JSON.stringify(lastSyncTime));
			}
			resolve(lastSyncTime); 		
		 })
	})
}

function reconcile(sfData){
	sfData = sfData.replace("\\", '');
	//console.log('Cleaned SF data = ' + sfData);
	sfChanged = JSON.parse(sfData);
	console.log('SFPayload = ' + JSON.stringify(sfChanged));
	
	readOffline().then((offlineMbs)=>{	
		updateOfflineDB(sfChanged);
		if(offlineMbs != null ){
				console.log('Performing offline DB refill');
				updateSF(offlineMbs);
		 } 
	}
  )
}

function updateSF(offlineMbs){

	offlinePayload = {};
	offlinePayload.lastSyncTime = lastSyncTime;
	offlinePayload.delSFs = getOfflineDeletedItems(offlineMbs);
	offlinePayload.insertSFs = getOfflineCreatedItems(offlineMbs);
	offlinePayload.updateSFs = getOfflineUpdatedItems(offlineMbs); ;
	console.log('offlinePayload = \n' + JSON.stringify(offlinePayload));
	
	//Make SF webservice call and send following
	sfConn.sendToSF(JSON.stringify(offlinePayload)).then((res)=>processSFUpdate(res));
}

function processSFUpdate(res){
	//console.log('SF modded response successful ... response = ' + res);
	sfUpdate = JSON.parse(res.replace('\\', ''));
	//console.log('SF modded response successful ... response = ' + sfUpdate);
	for(i in sfUpdate){
		console.log('SF id = ' + sfUpdate[i].SfId + ' Offline Id = ' + sfUpdate[i].id);
		mb.updateSfId(sfUpdate[i].SfId, sfUpdate[i].id);
	}
	
}

function getOfflineDeletedItems(offlineMbs){
	return offlineMbs.filter(offMb=>offMb.isDeleted == 1);//.map(item=>item.sfId);
}

function getOfflineCreatedItems(offlineMbs){
	return offlineMbs.filter(offMb=>offMb.isInsertedOffline == 1);
				 
}

function getOfflineUpdatedItems(offlineMbs){
	return offlineMbs.filter(offMb=> offMb.isDeleted != 1 && offMb.isInsertedOffline != 1 && new Date(offMb.LastModifiedDate) > new Date(lastSyncTime));
}

function updateOfflineDB(sfChanged){
	  console.log('Deleting offline records matched by SF keys...'); 	
	  deletedContacts = sfChanged.deletedContacts;
	  for (i in deletedContacts){
		  mb.deleteUsingSfId(deletedContacts[i].Id);
	  }
	  
	  console.log('Inserting/upserting into offline records which dont have a SF record ID...');
	  changedContacts = sfChanged.changedContacts; 	
	  for (i in changedContacts){
		  mb.upsert(changedContacts[i].Id, '', changedContacts[i].LastModifiedDate);
	  }	  
}

function readOffline(){
	return new Promise((resolve, reject) =>{ 

	 mb.createTable()
	 .then(()=>mb.getAll())
	 .then((rows)=>{
		//console.log(rows)
        if(rows ==  null || rows == '' || rows.length <=0) {
			rows = null;
			console.log('Offline storage is empty');
		}else if (rows.length > 0){
		    console.log('Offline storage is present');
			console.log('Printing data from the offline repo');
			//console.log(JSON.stringify(rows));
		}
        resolve(rows); 		
	 })
	});
}
	 

function isConnected(){
	if(isOnline) 
		 return true;
	 else 
		 return false;
}

function getRandomId(){
	return Math.floor(Math.random() * 899999 + 100000);
}
