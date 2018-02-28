const sqlstring = require('sqlstring');


/**
 * option.table
 *   1. 'table'
 *   2. [table1, table2]
 *   3. {table1: 'as1', table2: 'as2'}
 *   4. [table1, {table1: 'as1'}]
 *
 * option.tableRaw
 */
function makeTable(tableOption, tableRaw) {
  let table = [];
  let tables;
  switch (typeof tableOption) {
    case 'object':
      tables = Array.isArray(tableOption) ? tableOption : [tableOption];
      break;
    case 'string':
      tables = [tableOption]
      break;
  }
  tables && tables.forEach(function(item) {
    if (!item) return;
    switch (typeof item) {
      case 'object':
        for (let key in item) {
          if (typeof item[key] === 'string' && item[key]) {
            table.push(sqlstring.escapeId(key) + ' AS ' + sqlstring.escapeId(item[key]));
          } else {
            table.push(sqlstring.escapeId(key));
          }
        }
        break;
      case 'string':
        table.push(sqlstring.escapeId(item));
        break;
    }
  });

  (typeof tableRaw === 'string' && tableRaw) && table.push(tableRaw);

  return table.join(', ') || null;
}


function makeOn(whereOption) {
  function makeOperator(whereOption) {
    const operator = String(whereOption[1]).toUpperCase();
    let value;
    switch (operator) {
      case '=':
      case '!=':
      case '<':
      case '<=':
      case '>':
      case '>=':
      case 'LIKE':
        if (whereOption.length === 3) {
          value = sqlstring.escape(whereOption[2]);
        }
        break;
      case 'IN':
        if (whereOption.length === 3 && Array.isArray(whereOption[2]) && whereOption[2].length > 0) {
          value = '( ' + sqlstring.escape(whereOption[2]) + ' )';
        }
        break;
      case 'BETWEEN':
        if (whereOption.length === 3 && Array.isArray(whereOption[2]) && whereOption[2].length === 2) {
          value = sqlstring.escape(whereOption[2][0]) + ' AND ' + sqlstring.escape(whereOption[2][1]);
        }
        break;
    }
    return typeof value !== 'undefined' ? sqlstring.escapeId(whereOption[0]) + ' ' + operator + ' ' + value : null;
  }

  function make(whereOption, whereChildren) {
    if (!whereOption) return whereOption;
    if (!Array.isArray(whereOption)) return typeof whereOption === 'string' ? whereOption : null;
    const whereOptionLength = whereOption.length;
    if (typeof whereOption[0] === 'boolean') {
      const connector = ' ' + (whereOption[0] === true ? 'AND' : 'OR') + ' ';
      const conditions = [];
      for (let i = 1; i < whereOptionLength; i++) {
        const condition = make(whereOption[i], true);
        if (condition === null) return null;
        if (!condition) continue;
        conditions.push(condition);
      }
      return whereChildren && conditions.length > 1 ? '( ' + conditions.join(connector) + ' )' : conditions.join(connector);
    } else if (whereOptionLength === 1) {
      return typeof whereOption[0] === 'string' ? whereOption[0] : null;
    } else if (whereOptionLength === 2) {
      return sqlstring.escapeId(whereOption[0]) + ' = ' + sqlstring.escape(whereOption[1]);
    } else {
      return makeOperator(whereOption);
    }
  }
  return whereOption ? make(whereOption) : '';
}

/**
 * ['table', onOption]
 * ['table', 'table as', onOption]
 * [['table', onOption], ['table', 'table as', onOption]]
 */
function makeLeftJoin(joinOption) {
  const joins = [];
  function make(option) {
    if (!Array.isArray(option)) return null;
    const on = makeOn(option.length === 3 ? option[2] : option[1]);
    if (!on) return null;
    return sqlstring.escapeId(option[0])
      + (option.length === 3 ? (' AS ' + sqlstring.escapeId(option[1])) : '')
      + ' ON ' + on;
  }

  if (Array.isArray(joinOption)) {
    if (typeof joinOption[0] === 'string') {
      const join = make(joinOption);
      if (join) {
        joins.push(join);
      } else {
        return null;
      }
    } else {
      for (let i = 0; i < joinOption.length; i++) {
        const join = make(joinOption[i]);
        if (join) {
          joins.push(join);
        } else {
          return null;
        }
      }
    }
  } else {
    return '';
  }
  if (joins.length === 0) return null;
  return 'LEFT JOIN ' + joins.join(' LEFT JOIN ');
}

/**
 * option.where
 *   1. condition
 *     1. '`column` = "value"' // raw
 *     2. [condition_raw] // raw
 *     2. ['column', 'value'] // equal
 *     3. ['column', 'operator', 'value'] // !=, like, in, between, ...
 *   2. conditions
 *     1. [true, condition1, condition2, condition3, ...] // and
 *     2. [false, condition1, condition2, condition3, ...] // or
 */
function makeWhere(whereOption) {
  function makeOperator(whereOption) {
    let operator = String(whereOption[1]).toUpperCase();
    let value;
    switch (operator) {
      case '=':
      case '!=':
      case '<':
      case '<=':
      case '>':
      case '>=':
      case 'LIKE':
        if (whereOption.length === 3) {
          value = sqlstring.escape(whereOption[2]);
        }
        break;
      case 'IN':
        if (whereOption.length === 3 && Array.isArray(whereOption[2]) && whereOption[2].length > 0) {
          if (whereOption[2].length === 1) {
            operator = '=';
            value = sqlstring.escape(whereOption[2][0]);
          } else {
            operator = 'IN';
            value = '( ' + sqlstring.escape(whereOption[2]) + ' )';
          }
        }
        break;
      case 'BETWEEN':
        if (whereOption.length === 3 && Array.isArray(whereOption[2]) && whereOption[2].length === 2) {
          value = sqlstring.escape(whereOption[2][0]) + ' AND ' + sqlstring.escape(whereOption[2][1]);
        }
        break;
    }
    return typeof value !== 'undefined' ? sqlstring.escapeId(whereOption[0]) + ' ' + operator + ' ' + value : null;
  }

  function make(whereOption, whereChildren) {
    if (!whereOption) return whereOption;
    if (!Array.isArray(whereOption)) return typeof whereOption === 'string' ? whereOption : null;
    const whereOptionLength = whereOption.length;
    if (typeof whereOption[0] === 'boolean') {
      const connector = ' ' + (whereOption[0] === true ? 'AND' : 'OR') + ' ';
      const conditions = [];
      for (let i = 1; i < whereOptionLength; i++) {
        const condition = make(whereOption[i], true);
        if (condition === null) return null;
        if (!condition) continue;
        conditions.push(condition);
      }
      return whereChildren && conditions.length > 1 ? '( ' + conditions.join(connector) + ' )' : conditions.join(connector);
    } else if (whereOptionLength === 1) {
      return typeof whereOption[0] === 'string' ? whereOption[0] : null;
    } else if (whereOptionLength === 2) {
      return sqlstring.escapeId(whereOption[0]) + ' = ' + sqlstring.escape(whereOption[1]);
    } else {
      return makeOperator(whereOption);
    }
  }
  const where = whereOption ? make(whereOption) : '';
  return where ? 'WHERE ' + where : where;
}

/**
 * option.group
 *   1. 'column'
 *   2. ['column1', 'column2']
 *
 * option.groupRaw
 */
function makeGroup(groupOption, groupRaw) {
  const groups = [];
  if (Array.isArray(groupOption)) {
    for (let i = 0; i < groupOption.length; i++) {
      if (typeof groupOption[i] === 'string' && groupOption[i]) {
        groups.push(sqlstring.escapeId(groupOption[i]));
      }
    }
  } else if (typeof groupOption === 'string' && groupOption) {
    groups.push(sqlstring.escapeId(groupOption));
  }

  (typeof groupRaw === 'string' && groupRaw) && groups.push(groupRaw);
  return groups.length > 0 ? 'GROUP BY ' + groups.join(', ') : '';
}

/**
 * option.order
 *   1. 'column' // `column` ASC
 *   2. [null, 'raw'] // raw
 *   2. [true, 'column'] // `column` DESC
 *   3. [condition1, condition2, ...]
 *
 * option.orderRaw
 */
function makeOrder(orderOption, orderRaw) {
  const orders = [];
  if (typeof orderOption === 'string') {
    orders.push(sqlstring.escapeId(orderOption) + ' ASC');
  } else if (Array.isArray(orderOption)) {
    if (typeof orderOption[0] === 'boolean') {
      orders.push(sqlstring.escapeId(orderOption[1]) + ' ' + (orderOption[0] === true ? 'DESC' : 'ASC'));
    } else if (orderOption[0] === null) {
      orders.push(orderOption[1]);
    } else {
      for (var i = 0; i < orderOption.length; i++) {
        if (typeof orderOption[i] === 'string') {
          orders.push(sqlstring.escapeId(orderOption[i]) + ' ASC');
        } else if (Array.isArray(orderOption[i])) {
          if (orderOption[i][0] === null) {
            orders.push(orderOption[i][1]);
          } else {
            orders.push(sqlstring.escapeId(orderOption[i][1]) + ' ' + (orderOption[i][0] === true ? 'DESC' : 'ASC'));
          }
        }
      }
    }
  }

  (typeof orderRaw === 'string' && orderRaw) && orders.push(orderRaw);

  return orders.length > 0 ? 'ORDER BY ' + orders.join(', ') : '';
}

/**
 * option.limit
 *   1. 1 // limit(Number)
 *   2. [0, 2] // [offset(Number), limit(Number)]
 */
function makeLimit(limitOption) {
  const reg = /^\d+$/;
  if (Array.isArray(limitOption)) {
    if (reg.test(limitOption[0])) {
      return limit = 'LIMIT ' + Number(limitOption[0]) + (
        typeof reg.test(limitOption[1]) ? (', ' + Number(limitOption[1])) : ''
      );
    }
  } else if (reg.test(limitOption)) {
    return 'LIMIT ' + Number(limitOption);
  }
  return '';
}

/**
 * option.select
 *   1. *
 *   2. 'column' || 'table.column'
 *   3. [column1, column2]
 *   4. {column1: 'as1', column2: 'as2'}
 *   5. [column1, {column1: 'as1'}]
 *
 * option.selectRaw
 */
function makeSelect(option) {
  let column = [];

  let columns;
  switch (typeof option.select) {
    case 'object':
      columns = Array.isArray(option.select) ? option.select : [option.select];
      break;
    case 'string':
      option.select === '*' ? column.push('*') : (columns = [option.select]);
      break;
  }
  columns && columns.forEach(function(item) {
    if (!item) return;
    switch (typeof item) {
      case 'object':
        for (let key in item) {
          if (typeof item[key] === 'string' && item[key]) {
            column.push(sqlstring.escapeId(key) + ' AS ' + sqlstring.escapeId(item[key]));
          } else {
            column.push(sqlstring.escapeId(key));
          }
        }
        break;
      case 'string':
        column.push(sqlstring.escapeId(item));
        break;
    }
  });

  typeof option.selectRaw === 'string' && option.selectRaw && column.push(option.selectRaw);


  return [
    'SELECT',
    option.FOUND_ROWS ? 'SQL_CALC_FOUND_ROWS' : '',
    column.join(', ') || '*',
    'FROM',
    makeTable(option.table, option.tableRaw),
    makeLeftJoin(option.leftJoin),
    makeWhere(option.where),
    makeGroup(option.group, option.groupRaw),
    makeOrder(option.order, option.orderRaw),
    makeLimit(option.limit),
    option.FOUND_ROWS
      ? ';SELECT FOUND_ROWS() AS ' + (
        typeof option.FOUND_ROWS === 'string'
          ? sqlstring.escapeId(option.FOUND_ROWS)
          : '`count`'
      )
      : ''
  ];
}

function makeUpdate(option) {
  const update = [];
  for (let key in option.update) {
    update.push(sqlstring.escapeId(key) + ' = ' + sqlstring.escape(option.update[key]));
  }
  if (option.updateRaw) {
    for (let key in option.updateRaw) {
      update.push(sqlstring.escapeId(key) + ' = ' + option.updateRaw[key]);
    }
  }
  if (update.length === 0) return '';
  return [
    'UPDATE',
    makeTable(option.table, option.tableRaw),
    makeLeftJoin(option.leftJoin),
    'SET',
    update.join(', '),
    makeWhere(option.where),
    makeGroup(option.group, option.groupRaw),
    makeLimit(option.limit)
  ];
}

function makeInsert(option) {
  const insert = ['INSERT INTO', makeTable(option.table, option.tableRaw)];
  if (Array.isArray(option.insert)) {
    const columns = [];
    const values = [];
    // 填充字段
    option.insert.forEach((value) => {
      if (typeof value !== 'object') return;
      Object.keys(value).forEach((column) => columns.indexOf(column) < 0 && columns.push(column));
    });
    // 填充数据
    option.insert.forEach((value) => {
      if (typeof value !== 'object') return;
      values.push(columns.map((column) => (value[column] || '')))
    });
    if (columns.length === 0 || values.length === 0) return '';
    insert.push( '(', sqlstring.escapeId(columns), ')', 'values', sqlstring.escape(values) );
  } else {
    insert.push('SET', sqlstring.escape(option.insert));
  }
  return insert;
}

function makeDelete() {
  // 暂不支持
  return null;
}

function make(option) {
  if (typeof option !== 'object') return '';
  const sql_parts = option.insert ? makeInsert(option) : (
    option.update ? makeUpdate(option) : (
      option.delete ? makeDelete(option) : makeSelect(option)
    )
  );
  if (!Array.isArray(sql_parts)) return '';

  const sql_parts_length = sql_parts.length;
  let sql = '';
  for (let i = 0; i < sql_parts_length; i++) {
    if (sql_parts[i] === null) return '';
    if (!sql_parts[i]) continue;
    sql += sql_parts[i] + ' ';
  }
  return sql.replace(/\s+$/, '');
}

make.where = makeWhere;
make.order = makeOrder;
make.limit = makeLimit;

exports = module.exports = make;
