class Member { 
 
  constructor(dao) {
    this.dao = dao
  }

  createTable() {
    const sql = `
    CREATE TABLE IF NOT EXISTS member (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
	  sfId INTEGER, 
      record TEXT,
	  LastModifiedDate TEXT,
	  isDeleted INTEGER DEFAULT 0,
	  isInsertedOffline INTEGER DEFAULT 0,
	  CONSTRAINT sfId_unique UNIQUE (sfId)
	  )`
    return this.dao.run(sql)
  }
  
  
  create(sfId, record, LastModifiedDate,isInsertedOffline) {
	//console.log('Record = ' + record);  
    return this.dao.run(
      `INSERT INTO member (sfId, record, LastModifiedDate, isInsertedOffline)
        VALUES (?, ?, ?, ?)`,
      [sfId, record, LastModifiedDate, isInsertedOffline])
	}

	softDelete(id) {
		console.log('Record to be soft deleted = ' + id);  
		return this.dao.run(
		  `UPDATE member set isDeleted = ?, LastModifiedDate = ?  where Id = ?`,
		  [1, new Date().toISOString(), id])
	 }

	update(id) {
		console.log('Record to be updated  = ' + id);  
		return this.dao.run(
		  `UPDATE member set LastModifiedDate = ?  where Id = ?`,
		  [new Date().toISOString(), id])
	 }
	 
	updateSfId(sfId, id) {
		console.log('Record to be updated  = ' + id);  
		return this.dao.run(
		  `UPDATE member set sfId = ?, isInsertedOffline =?   where Id = ?`,
		  [sfId, 0, id])
	 }
  
  delete(id) {
    return this.dao.run(
      `DELETE FROM member WHERE id = ?`,
      [id]
    )
  }
  
  deleteUsingSfId(id) {
    return this.dao.run(
      `DELETE FROM member WHERE sfId = ?`,
      [id]
    )
  }
  
  getById(id) {
    return this.dao.get(
      `SELECT * FROM member WHERE id = ?`,
      [id])
  }
  
  
  getAll() {
    return this.dao.all(`SELECT * FROM member`)
  }
  
  
  upsert(sfId, record, LastModifiedDate){
	console.log('Record to be upserted = ' + record);  
    return this.dao.run(
      `INSERT INTO member (sfId, record, LastModifiedDate)
        VALUES (?, ?, ?) ON CONFLICT(sfId) DO UPDATE set LastModifiedDate = ?  where SfId = ?`,
      [sfId, record, LastModifiedDate, LastModifiedDate, sfId])
	  
  }
  
}

module.exports = Member