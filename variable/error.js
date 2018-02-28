// 系统错误
exports.SYSTEM_ERROR = 10000; // 系统错误

// 客户端错误
exports.NOT_FOUND = 20000; // 资源不存在
exports.NOT_AUTH = 20001; // 未登录
exports.ILLEGAL_REQUEST = 20002; // 非法请求

// 应用错误
exports.CODE_INVALID = 30000; // 验证码错误
exports.USER_DISABLED = 30001; // 账户被禁用
exports.EMAIL_REGISTERED = 30002; // 邮箱已注册
exports.EMAIL_UNREGISTERED = 30003; // 邮箱未注册
exports.PASSWORD_INCORRECT = 30004; // 登录密码错误

// 业务错误
exports.ADMIN = {};
exports.ADMIN.MERCHANT_EXIST = 43000;
