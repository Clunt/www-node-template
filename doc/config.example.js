/**
 * config
 */
module.exports = {
  environment: 'development', // 运行环境 product, development
  port: 3001, // 运行端口
  site_host: 'www.clantu.com', // 域名
  site_protocol: 'http:', // 协议
  session_name: 'SSID', // session cookie name
  session_path: './sessions', // session file store path
  session_secret: 'HiuoHafNQ32DlAaHDN', // session cookies salt
  cookies_secret: 'HiuoHafNQ32DlAaHDN', // auto login cookies salt
  password_salt: 'HiuoHafNQ32DlAaHDN', // password salt
  // DB配置
  database: {
    host: 'host',
    port: 3306,
    user: 'clantu',
    password: 'clantu',
    database: 'clantu',
    multipleStatements: true
  }
};
