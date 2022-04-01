

import config from 'config.js';
var domain = config.getDomain;
var pageCount = config.getPostCount;
var categoriesID = config.getCategoriesID;

var HOST_URI = 'http://' + domain+'/schoolwall/'; //   https://' + domain+'/wp-json/wp/v2/
// var HOST_URI = 'http://' + domain + '/schoolwall/'; //   https://' + domain + '/wp-json/watch-life-net/v1/
   //https://www.watch-life.net/wp-json/watch-life-net/v1/
   //https://www.watch-life.net/wp-json/wp/v2/


module.exports = {  
  // mark: 获取帖子列表数据(已实现)
  getPosts: function (obj) {
    // http://0.0.0.0:3000/schoolwall/posts/page={}
    // https://www.watch-life.net/wp-json/watch-life-net/v1/posts?per_page=10&orderby=date&order=desc&page=1
    //'per_page=' + pageCount   &orderby=date&order=desc
      var url = HOST_URI + 'posts/page=' + obj.page;
    
      // mark: 根据分类ID查询ID下的帖子列表(已实现)
    if (obj.categories != 0) {
      //https://www.watch-life.net/wp-json/watch-life-net/v1/posts?per_page=10&orderby=date&order=desc&page=1&categories=1
      //http://0.0.0.0:3000/schoolwall/posts/page=2/categorieid=3
      url += '/categorieid=' + obj.categories;
    }

    else if (obj.search != '') {
      url += '/search=' + encodeURIComponent(obj.search);
    }
        
    return url;

  },

  // 获取多个分类帖子列表数据
  getPostsByCategories: function (categories) {
      var url = HOST_URI + 'posts?per_page=20&orderby=date&order=desc&page=1&categories=' + categories;
      return url;
  },
  
  // 获取置顶的帖子
  getStickyPosts: function () {
    var url = HOST_URI + 'posts?sticky=true&per_page=5&page=1';
    return url;

  },
 
  
  //获取首页滑动帖子
  getSwiperPosts: function () {
      var url = HOST_URI;
      url +='post/swipe';
      return url;
  },

  // mark: 获取是否开启评论的设置(没用)
  // getEnableComment: function () {
  //     var url = HOST_URI;
  //     url += 'options/enableComment';
  //     return url;
  // },

   // 获取各种广告禁用或者开启设置项
//    getOptions: function () {
//    // http://0.0.0.0:3000/schoolwall/
//     var url = HOST_URI;
//     url += 'options';
//     return url;
// },



  // 获取tag相关的帖子列表
  // getPostsByTags: function (id,tags) {

    
  //   // https://www.watch-life.net/wp-json/watch-life-net/v1/
  //     var url = HOST_URI + 'posts?per_page=5&&page=1&exclude=' + id + "&tags=" + tags;

  //     return url;

  // },


  // 获取特定id的帖子列表
  getPostsByIDs: function (obj) {
    var url = HOST_URI + 'posts?include=' + obj;

    return url;

  },
  // 获取特定slug的帖子内容
  getPostBySlug: function (obj) {
      var url = HOST_URI + 'posts?slug=' + obj;

      return url;

  },

   // mark: 获取帖子详细数据（已实现）
  getPostByID: function (id) {

    // http://0.0.0.0:3000/schoolwall/posts/id={}
    // https://www.watch-life.net/wp-json/watch-life-net/v1/posts/<id>
    return HOST_URI + 'getpost/id=' + id;
  },
  // 获取页面列表数据
  getPages: function () {
    
    return HOST_URI + 'pages';
  },

  // 获取页面列表数据
  getPageByID: function (id, obj) {
    return HOST_URI + 'pages/' + id;
  },

  // mark: 获取分类列表（部分实现）
  getCategories: function (ids,openid) {
      var url ='';
      if (ids ==''){
        //未登录获取墙贴分类
        url = HOST_URI + 'categories'

        //http://0.0.0.0:3000/schoolwall/categories
        //https://www.watch-life.net/wp-json/wp/v2/categories?per_page=100&orderby=count&order=desc&openid=
        
      }
      else
      {
        //登录获取墙贴分类并且显示点亮订阅按钮
          url = HOST_URI + 'categories?include=' + ids+'&orderby=count&order=desc&openid='+openid;
 
      }
   
    return url
  },

  // mark: 根据ID获取某个分类信息(已实现)
  getCategoryByID: function (id) {
    //https://www.watch-life.net/wp-json/wp/v2/categories/1
    //http://0.0.0.0:3000/schoolwall/getcategorie/id=1
    var dd = HOST_URI + 'getcategorie/id=' + id;
    return dd;
  },
  //获取某帖子评论
  // getComments: function (obj) {
    
  //   var url = HOST_URI + 'comments?per_page=100&orderby=date&order=asc&post=' + obj.postID + '&page=' + obj.page;
  //   return url;
  // },

  // mark: 获取帖子评论及其回复（已实现）
  getCommentsReplay: function (obj) {
    //https://www.watch-life.net/wp-json/watch-life-net/v1/comment/getcomments?postid=1959&limit=10&page=1&order=desc

    // http://0.0.0.0:3000/schoolwall/getcomments/postid=123/commentspage=1
      var url = HOST_URI;
      url += 'getcomments/postid=' + obj.postId + '/commentspage=' + obj.page;
      return url;
  },
  //获取网站的最新20条评论
  getNewComments: function () {
      return HOST_URI + 'comments?parent=0&per_page=20&orderby=date&order=desc';
  },

  //获取回复
  getChildrenComments: function (obj) {
    var url= HOST_URI + 'comments?parent_exclude=0&per_page=100&orderby=date&order=desc&post=' + obj.postID
     return url;
  },


  //获取最近的30个评论
  getRecentfiftyComments:function(){
    return HOST_URI + 'comments?per_page=30&orderby=date&order=desc'
  },

  //提交评论
  postComment: function () {
    return HOST_URI + 'comments'
  }, 

  //提交微信评论
  postWeixinComment: function () {
    var url = HOST_URI;
    return url + 'comment/add'
  }, 

  //获取微信评论
  getWeixinComment: function (openid) {
      var url = HOST_URI;
      return url + 'comment/get?openid=' + openid;
  },    

  //获取帖子的第一个图片地址,如果没有给出默认图片
  getContentFirstImage: function (content){
    var regex = /<img.*?src=[\'"](.*?)[\'"].*?>/i;
    var arrReg = regex.exec(content);
    var src ="../../images/logo700.png";
    if(arrReg){   
      src=arrReg[1];
    }
    return src;  
  },

 //获取热点帖子
  getTopHotPosts(flag){      
      var url = HOST_URI;
      if(flag ==1)
      {
          url +="post/hotpostthisyear"
      }
      else if(flag==2)
      {
          url += "post/pageviewsthisyear"
      }
      else if (flag == 3) {
          url += "post/likethisyear"
      }
      else if (flag == 4) {
          url += "post/praisethisyear"
      }

      return url;
  },

  //更新帖子浏览数
  updatePageviews(id) {
      var url = HOST_URI;
      url += "post/addpageview/"+id;
      return url;
  },
  //获取用户openid
  getOpenidUrl() {
    var url = HOST_URI;
    url += "weixin/userlogin";
    return url;
  },

   //获取用户信息
   getUpdateUserInfo() {
    var url = HOST_URI;
    url += "weixin/updateuserinfo";
    return url;
  },

  //点赞
  postLikeUrl() {
    var url = HOST_URI;
    url += "post/like";
    return url;
  },

  //判断当前用户是否点赞
  postIsLikeUrl() {
    var url = HOST_URI;
    url += "post/islike";
    return url;
  },

  //获取我的点赞
  getMyLikeUrl(openid) {
      var url = HOST_URI;
      url += "post/mylike?openid=" + openid;
      return url;
  },

  //鼓励,获取支付密钥
  postPraiseUrl() { 
    var url = HOST_URI;  
    url += "payment";
    return url;
  },

  //更新鼓励数据
  updatePraiseUrl() {
    var url = HOST_URI;
    url += "post/praise";
    return url;
  },

  //获取我的鼓励数据
  getMyPraiseUrl(openid) {
      var url = HOST_URI;
      url += "post/mypraise?openid=" + openid;
      return url;
  },

  //获取所有的鼓励数据
  getAllPraiseUrl() {
      var url = HOST_URI;
      url += "post/allpraise";
      return url;
  },

  //发送模版消息
  sendMessagesUrl() {
      var url = HOST_URI;
      url += "weixin/sendmessage";
      return url;
  },
  //获取订阅的分类
  getSubscription() {
      var url = HOST_URI;
      url += "category/getsubscription";
      return url;
  },

  //订阅的分类
  postSubscription() {
      var url = HOST_URI;
      url += "category/postsubscription";
      return url;
  },

  //删除订阅的分类
  delSubscription() {
      var url = HOST_URI;
      url += "category/delSubscription";
      return url;
  },

  //生成海报
  creatPoster() {
      var url = HOST_URI;
      url += "weixin/qrcodeimg";
      return url;
  },
  //获取海报
  getPosterUrl() {
      var url = 'https://' + domain + "/wp-content/plugins/rest-api-to-miniprogram/poster/";
      return url;
  },
  //获取二维码
  getPosterQrcodeUrl() {
      var url = 'https://' + domain + "/wp-content/plugins/rest-api-to-miniprogram/qrcode/";
      return url;
  },
  getAboutPage(){
    var url = HOST_URI;
      url += "post/about";
      return url;

  },

  // mark: 获取分类
  getCategoriesIds(){

    // https://www.watch-life.net/wp-json/watch-life-net/v1/category/ids
    var url = HOST_URI;
      url += "category/ids";
      return url;

  },
  getliveinfo(){
    var url = HOST_URI;
      url += "live/getliveinfo";
      return url;

  },
  refreshliveinfo(openid){
    var url = HOST_URI;
      url += "live/refreshliveinfo?openid="+openid;
      return url;

  },

  // mark: 轮播图，精选（已实现）
  get_homeconfig()
  {
    // http://0.0.0.0:3000/schoolwall/options/homeconfig
    // https://www.watch-life.net/wp-json/watch-life-net/v1/options/homeconfig
    var url = HOST_URI;
    url += "options/homeconfig";
    return url;
  },
  scanQrcode()
  {
    var url = HOST_URI;
    url += "users/scanqrcode";
    return url;

  }
};