/*
 * 
 
 */

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');

var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
import config from '../../utils/config.js'
// const Adapter = require('../../utils/adapter.js') //帖子列表间隙广告
// var pageCount = config.getPostCount;

var webSiteName = config.getWebsiteName;  //网站名称：安康学院校园墙
var domain =config.getDomain; //网站域名：
var blog =config.getBlog; //我的博客


Page({
  data: {
    postsList: [],    //*帖子列表数据*
    postsShowSwiperList: [],
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    showerror: "none",
    showCategoryName: "",
    categoryName: "", 
    floatDisplay: "none",  
    listAdsuccess:false,
    webSiteName:webSiteName,
    domain:domain,
    blog:blog,
    isFirst: false, // 是否第一次打开
    isLoading: false,
    swipe_nav:[], //1.轮播图列表
    selected_nav:[] //精选数据列表

  },

  // mark: 搜索条件处理
  formSubmit: function (e) {
    console.log(e);
    var url = '../list/list'
    var key = '';   //搜索关键字
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    } else {

      key = e.detail.value.input;

    }
    if (key != '') {
      url = url + '?search=' + key;
      wx.navigateTo({
        url: url
      })
    } else {
      wx.showModal({
        title: 'tips 💡',
        content: '请输入你要发现的发现 🍀',
        showCancel: false,
      });
    }
  },
  
  //转发给好友
  onShareAppMessage: function () {
    return {
      title: '“' + webSiteName + '”小程序,让我们一起加入AKU的生活圈~',
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
   // 自定义分享朋友圈
   onShareTimeline: function() {   
    return {
      title:   '“' + webSiteName + '”小程序,让我们一起加入AKU的生活圈~',
      path: 'pages/index/index',
      
    }
  },


  // mark: 下拉刷新
  onPullDownRefresh: function () {
    var self = this;
    self.setData({
      showerror: "none",       
      floatDisplay: "none",
      isLastPage: false,
      page: 1,
      postsShowSwiperList: [],
      listAdsuccess:false //不显示广告

    });
    this.getHomeconfig();
    this.fetchPostsData(self.data);
   
  },

  
  // mark: 111 上拉触底事件提醒 <小程序内部函数调用>
  onReachBottom: function () {

    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);   //再次请求获取帖子列表的API
    } else {
      console.log('最后一页');
      wx.showToast({
        title: '加载完毕 🎉',
        mask: false,
        duration: 1666
      });
    }

  },
  
  onLoad: function (options) {
    var self = this;
    wx.showShareMenu({
              withShareTicket:true,
              menus:['shareAppMessage','shareTimeline'],
              success:function(e)
              {
                //console.log(e);
              }
        })
  // 设置页面标题：帖子分类
  wx.setNavigationBarTitle({
    title: webSiteName
  });
   // self.fetchTopFivePosts();
   // mark: 142 开启间隙广告
  //  Adapter.setInterstitialAd("enable_index_interstitial_ad");
    self.fetchPostsData(self.data);  

    // 判断用户是不是第一次打开，弹出添加到我的小程序提示
    var isFirstStorage = wx.getStorageSync('isFirst');
    // console.log(isFirstStorage);
    if (!isFirstStorage) {
      self.setData({
        isFirst: true
      });
      wx.setStorageSync('isFirst', 'no')
      // console.log(wx.getStorageSync('isFirst'));
      setTimeout(function () {
        self.setData({
          isFirst: false
        });
      }, 9000)
    }

    this.getHomeconfig();

  },
  onShow: function () {
    this.getTabBar().init();
    wx.setStorageSync('openLinkCount', 0);

    var nowDate = new Date();
    nowDate = nowDate.getFullYear()+"-"+(nowDate.getMonth() + 1)+'-'+nowDate.getDate();
    nowDate= new Date(nowDate).getTime();   
    var _openAdLogs =wx.getStorageSync('openAdLogs')|| [];
    var openAdLogs=[];
    _openAdLogs.map(function (log) {   
      if(new Date(log["date"]).getTime() >= nowDate)  //广告租期大于现在的时间，表示广告不过期
      {
        openAdLogs.unshift(log);    //写入广告的数组
      }
    
    })
    
    wx.setStorageSync('openAdLogs',openAdLogs); //写入数组到本地
    // console.log(wx.getStorageSync('openAdLogs'));

  },





  // mark: 184 设置首页轮播图 & 精选
  getHomeconfig()
  {
    //获取扩展设置
    var self = this;
    
    var getHomeconfig = wxRequest.getRequest(Api.get_homeconfig());
    getHomeconfig.then(res=> {
        
        // console.log(res.data);
         let expand = res.data;
         let swipe_nav= expand.swipe_nav; //首页滚动图片的列表
         let selected_nav=expand.selected_nav; //精选数据列表
         self.setData({swipe_nav:swipe_nav,selected_nav:selected_nav});

        // 设置本地存储数据，zanImageurl=‘’ 
         let zanImageurl = expand.zanImageurl
        //  let logoImageurl = res.data.logoImageurl
         wx.setStorageSync('zanImageurl',zanImageurl);    //设置赞赏二维码
        //  wx.setStorageSync('logoImageurl',logoImageurl);    //网站logo（没有用）

        //  设置一系列域名
        //  let _d = res.data.downloadfileDomain
        //  let _b = res.data.businessDomain
        //  let downloadfileDomain = _d.length ? _d.split(',') : []
        //  let businessDomain = _b.length ? _b.split(',') : []
        //  wx.setStorageSync('downloadfileDomain',downloadfileDomain);    //作者的文档服务器域名，如果a链接是文档才能下载并打开
        //  wx.setStorageSync('businessDomain',businessDomain);    //判断如果是自己的商业域名就会打开跳转到自己的miniapp

    }
    );
  },  

  ////////////////////////////////////////////////////
  // mark: 218 获取帖子列表数据
  fetchPostsData: function (data) {
    var self = this;
    //下拉刷新if将不会执行赋值，以下没有下拉刷新才会执行
    if (!data) data = {};
    if (!data.page) data.page = 1;  //提交的页面数
    // if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };    
    
    self.setData({ isLoading: true })
    
    // var getCategoriesRequest = wxRequest.getRequest(Api.getCategoriesIds());
    // getCategoriesRequest.then(res=>{
    //     if(!res.data.Ids=="")
    //     {//似乎没有用
    //       data.categories=res.data.Ids;
    //       self.setData({categories:res.data.Ids})

    //     }



        // mark: 254 调用API获取帖子列表数据
        var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));
        getPostsRequest
          .then(response => {
            var DATA=response.data;

            var pageData=DATA.records; //单个页面列表
            var dataLength= pageData.length;  //单个页面几个条目
            

            
            //  console.log(dataLength);
            if (response.errMsg === "request:ok") {
              if (dataLength > 0) {   // *response.data请求的返回数据*    //判断如果有数据列表
                if (dataLength < DATA.size) { //判断加载到了最后一页
                  self.setData({
                    isLastPage: true,
                    isLoading: false
                  });
                }    
                self.setData({
                  floatDisplay: "block",    
                  postsList: self.data.postsList.concat(pageData.map(function (item) {   //concat()连接多个数组;map(Math.sqrt())映射数组的每个元素到内部函数进行计算 *设置帖子列表*/
                    
                    var strdate = item.date   //添加一个变量，为了暂时放置变量
                    if (item.category_name != null) {
    
                      item.categoryImage = "../../images/category.png";   //好像没有用
                    } else {
                      item.categoryImage = "";
                    }
    
                    if (item.postMediumImage == null || item.postMediumImage == '') {
                      item.postMediumImage = "../../images/error.jpg";
                    }
                    //使得文字显示是一个固定的范围
                    item.date = util.cutstr(strdate, 10, 1);    //剪切字符串，为10个，1是不用加"..."
                    return item;
                  }))
                  
                  
                });
                // console.log(postsList);
              } else {  //上次刚刚好加载10个结束，这次还会加载这个函数
                // console.log(dataLength);
                
                  self.setData({
                    isLastPage: true,
                    isLoading: false
                  });
                  wx.showToast({
                    title: '没了别拉了 😂',
                    mask: false,
                    duration: 1666
                  });
                
              }
            }else{
              //加载到本函数突然断网才会发生
                wx.showToast({
                  title: "请求异常！！",
                  duration: 3333
                })
              
            }
          })
          // mark: 309 ---详情查看微信小程序网络教程---
          .catch(function (response) {    
            if (data.page == 1) {   
    
              self.setData({
                showerror: "block",
                floatDisplay: "none"
              });
              
            } else {    
              wx.showModal({
                title: '请检查网络',
                content: '我们之间最遥远的距离原来是断网~',
                showCancel: false,
              });
              self.setData({
                page: data.page - 1
              });
            }
    
          })
          .finally(function (response) {
            wx.hideLoading();
            self.setData({ isLoading: false })
            wx.stopPullDownRefresh();
          });

    // })
   
  },



  // mark: 334 加载分页（没有用）
  // loadMore: function (e) {

  //   var self = this;
  //   if (!self.data.isLastPage) {
  //     self.setData({
  //       page: self.data.page + 1
  //     });
  //     //console.log('当前页' + self.data.page);
  //     this.fetchPostsData(self.data);
  //   } else {
  //     wx.showToast({
  //       title: '没有更多内容，呵呵',
  //       mask: false,
  //       duration: 1000
  //     });
  //   }
  // },


  // mark: 358 跳转至查看帖子详情
  redictDetail: function (e) {
    // console.log('查看帖子');
    // console.log(e.currentTarget.id);
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  
  //首页图标跳转
  onNavRedirect: function (e) {
    var redicttype = e.currentTarget.dataset.redicttype;
    var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
    var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;
    var extraData = e.currentTarget.dataset.extraData == null ? '' : e.currentTarget.dataset.extraData;
    if (redicttype == 'apppage') { //跳转到小程序内部页面         
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'webpage') //跳转到web-view内嵌的页面
    {
      url = '../webpage/webpage?url=' + url;
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'miniapp') //跳转到其他app
    {
      wx.navigateToMiniProgram({
        appId: appid,
        envVersion: 'release',
        path: url,
        extraData: extraData,
        success(res) {
          // 打开成功
        },
        fail: function (res) {
          console.log(res);
        }
      })
    }

  },
  // 跳转至查看小程序列表页面或帖子详情页
  redictAppDetail: function (e) {
    let { type, appid, url, path } = e.currentTarget.dataset

    if (type === 'apppage') { // 小程序页面         
      wx.navigateTo({
        url: path
      })
    }
    if (type === 'webpage') { // web-view页面
      url = '../webpage/webpage?url=' + url
      wx.navigateTo({
        url:url
      })
    }
    if (type === 'miniapp') { // 其他小程序
      wx.navigateToMiniProgram({
        appId: appid,
        path:path
      })
    }
  },
  //返回首页
  redictHome: function (e) {
    //console.log('查看某类别下的帖子');  
    var id = e.currentTarget.dataset.id,
      url = '/pages/index/index';
    wx.switchTab({
      url: url
    });
  },

  adbinderror:function(e)
  {
    var self=this;
    console.log(e.detail.errCode);
    console.log(e.detail.errMsg);    
    if (e.detail.errCode) {
      self.setData({
        listAdsuccess: false
      })
    }

  },
})