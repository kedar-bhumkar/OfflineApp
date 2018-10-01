@RestResource(urlMapping='/SoapOffline/*')
global with sharing class MyRestResource {
    
   class OutBoundPayload {
   
       List<Contact> changedContacts;
       List<Contact> deletedContacts;
   
       public OutBoundPayload (List<Contact> changedContacts, List<Contact> deletedContacts) {
            this.changedContacts = changedContacts;
            this.deletedContacts = deletedContacts;
       }
   
   } 
    
   class ModdedOutboundPayload{
       String id;
       String  SfId;
   } 
        
   
   class InboundPayload{
      String lastSyncTime;
      List<delSF> delSFs;
      List<insertSF> insertSFs;
      List<updateSF> updateSFs;
    }
   
    
    class delSF {
        String Id;
        String sfId;
        String record;
        String lastModifiedDate;
        String isDeleted;
    }
    
    
    class insertSF {
        String id;
        String sfId;
        String record;
        String lastModifiedDate;
        String isDeleted;
    }
    
    
    class updateSF {
        String id;
        String sfId;
        String record;
        String LastModifiedDate;
        String isDeleted;    
    }
    
    
    class record {
        attributes attributes;
        String Id;
        String Name;
        String Phone;
        String Email;
        String LastModifiedDate;
    }
    
    class attributes {
        String type;
        String url;
    }
    
    
    @HttpDelete
    global static void doDelete() {
        System.debug('Inside doDelete');
        
    }
  
    @HttpGet
    global static String doGet() {
        System.debug('Inside doGet');
        String lastSyncTime = System.RestContext.request.params.get('payload');
        System.debug('Received payLoad for GET = ' + lastSyncTime);
         return getChangedData(lastSyncTime);
    }
  
  
  private static String getChangedData( String lastSyncTime) {
      List<Contact> changedContacts;
      List<Contact> deletedContacts;
      
      if(lastSyncTime != 'XXX') {
          System.debug('Inside lastSyncTime!= XXX');
          DateTime dt = (DateTime) JSON.deserialize('"' + lastSyncTime + '"', DateTime.class);   
          DateTime lastDateTime  = DateTime.newInstance( dt.getTime());
          System.debug('Parsed date =' + lastDateTime);
          changedContacts= [Select Id, Name, Phone, Email, LastModifiedDate from Contact where LastModifiedDate >: lastDateTime];
          deletedContacts= [Select Id from Contact where LastModifiedDate >: lastDateTime and isDeleted=true ALL ROWS];
          
      }else{
           changedContacts= [Select Id, Name, Phone, Email, LastModifiedDate from Contact];
      }
      OutBoundPayload  payload = new OutBoundPayload(changedContacts, deletedContacts);  
      System.debug('Matched records = '  + JSON.serialize(payload));
      return JSON.serialize(payload);
  }
  
  
  @HttpPost
    global static String doPost(){
        System.debug('Inside doPost...');
        String data = System.RestContext.request.requestBody.toString();
        data = data.subString(1).subString(0,data.length()-2).replace('\\','');
        System.debug('Received Data = '+ data );
        InboundPayload thePayLoad = (InboundPayload)JSON.deserialize(data, InboundPayload.class);
        System.debug('Received payload = ' + thePayload);
        return JSON.serialize(processPayload(thePayLoad));
    }
    
    
    private static List<ModdedOutboundPayload> processPayload(InboundPayload thePayload){
          List<Contact> lstContacts = new List<Contact>();
          Contact theContact;
            
          for(InsertSF item : thePayload.insertSFs){
              theContact = new Contact();
              theContact.OfflineId__c = Integer.valueOf(item.Id);
              theContact.LastName = item.Id;
              lstContacts.add(theContact);
          }
          
          insert lstContacts;
          
          List<ModdedOutboundPayload> lstModded = new List<ModdedOutboundPayload>(); 
          ModdedOutboundPayload moddedLoad;
          for(Contact updatedContact : lstContacts){
              moddedLoad = new ModdedOutboundPayload();
              moddedLoad.sfId = ''+ updatedContact.Id;
              moddedLoad.Id   = ''+ updatedContact.OfflineId__c;
              lstModded .add(moddedLoad);
          }
          return lstModded;         
    }
}