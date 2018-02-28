const sqlstring = require('sqlstring');
const mysql = require('mysql');
const SQL = require('./SQL');
const make = require('./libs/make');


/**
 * SQL语句生产
 * 直接生成
 *   sql({})
 *   sql.make({})
 *
 * 链式调用
 *   sql.select().where()
 *   sql('table').select().where()
 *   sql('table2', 'table2').select().where()
 *   sql(['table1', 'table1-alias'], ['table1', 'table2-alias']).where().select()
 */
function sql(option) {
  return typeof option === 'object' && !Array.isArray(option) ? make(option) : SQL.apply(this, arguments);
}

sql.make = make;
sql.sqlstring = sqlstring;

exports = module.exports = sql;
