

//配置域名,域名只修改此处。
//如果wordpress没有安装在网站根目录请加上目录路径,例如："www.watch-life.net/blog"
var DOMAIN = "0.0.0.0:3000";
var BLOG = "https://ding-f.gitee.io/";
var WEBSITENAME="安康学院校园墙"; 
var PAGECOUNT='10'; //每页文章数目

//是否启用小程序扫描二维码登录网站  true 启用  false  不启用
//未安装微慕登录插件不要启用
const enableScanLogin =false
//////////////////////////////////////////////////////


//
const minapperVersion=4.12
const minapperSource="free"
//////////////////////////////////////////////////////

export default {
  getDomain: DOMAIN,
  getBlog:BLOG,
  getWebsiteName: WEBSITENAME,  
  getPageCount: PAGECOUNT,
  enableScanLogin,
  minapperVersion,
  minapperSource
}