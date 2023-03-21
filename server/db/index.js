const mysql = require('mysql')

// 创建数据库链接对象
const db = mysql.createPool({
  host: '1.15.103.152',
  user: 'my_db_01',
  password: 'DLRjAZ2PyB42Fz6L',
  database: 'my_db_01',
})

// 向外共享 db 数据库连接对象
module.exports = db
