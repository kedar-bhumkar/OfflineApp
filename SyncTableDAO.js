class SyncTable { 
 
  constructor(dao) {
    this.dao = dao
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS SyncTable (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
	  LastSyncTime INTEGER 
	  )`
    return this.dao.run(sql)
  }
  
  insert() {
    return this.dao.run(
      `INSERT INTO SyncTable (LastSyncTime)
        VALUES (?)`,
      [new Date().toISOString()])
   }
  
  update() {
    return this.dao.run(
      `UPDATE  SyncTable Set LastSyncTime =?`,
      [new Date().toISOString()])
  }
  
   get() {
    return this.dao.get(`SELECT LastSyncTime FROM SyncTable`)
  }
}

module.exports = SyncTable