/*
 * 
 
 */

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');

var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/wxRequest.js')
const Adapter = require('../../utils/adapter.js')
var webSiteName= config.getWebsiteName;
var domain =config.getDomain

import config from '../../utils/config.js'


Page({
  data: {
    title: '帖子列表',
    postsList: {},
    pagesList: {},
    categoriesList: {},
    postsShowSwiperList: {},
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    categoriesName:'',
    categoriesImage:"",
    showerror:"none",
    isCategoryPage:"none",
    isSearchPage:"none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    searchKey:"",
    topBarItems: [
        // id name selected 选中状态
        { id: '1', name: '评论数', selected: true },
        { id: '2', name: '浏览数', selected: false },        
        { id: '3', name: '点赞数', selected: false },
        // { id: '4', name: '鼓励数', selected: false }
    ],
    tab: '1',
    webSiteName:webSiteName,
    domain:domain

  },
  formSubmit: function (e) {
    var url = '../list/list'
    if (e.detail.value.input != '') {
      url = url + '?search=' + e.detail.value.input;
    }
    wx.navigateTo({
      url: url
    })
  },
  onShareAppMessage: function () {
    var title = "分享“"+ webSiteName +"”的帖子排行。";
    var path ="pages/hot/hot";
    return {
      title: title,
      path: path,
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
      title:  "“"+ webSiteName +"”的帖子排行",
      path: 'pages/hot/hot' ,
      
    }
  },
  reload:function(e)
  {
    var self = this;   
    self.fetchPostsData(self.data);
  },

  onTapTag: function (e) {
    var self = this;
    var tab = e.currentTarget.id;
    var topBarItems = self.data.topBarItems;
    // 切换topBarItem 
    for (var i = 0; i < topBarItems.length; i++) {
      if (tab == topBarItems[i].id) {
        topBarItems[i].selected = true;
      } else {
        topBarItems[i].selected = false;
      }
    }
    self.setData({
        topBarItems: topBarItems, 
        tab: tab

    })
    if (tab !== 0) {
      this.fetchPostsData(tab);
    } else {
      this.fetchPostsData("1");
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
    this.fetchPostsData("1");
    Adapter.setInterstitialAd("enable_hot_interstitial_ad");
        
  },
  //获取帖子列表数据
  fetchPostsData: function (tab) {
    var self = this;  
    self.setData({
        postsList: []
    });
    
    wx.showLoading({
      title: '正在加载',
      mask:true
    });
    var getTopHotPostsRequest = wxRequest.getRequest(Api.getTopHotPosts(tab));
    getTopHotPostsRequest.then(response =>{
        if (response.statusCode === 200) {
            self.setData({
                showallDisplay: "block",
                floatDisplay: "block",
                postsList: self.data.postsList.concat(response.data.map(function (item) {
                    var strdate = item.post_date
                    if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
                        item.post_thumbnail_image = '../../images/logo700.png';
                    }
                    item.post_date = util.cutstr(strdate, 10, 1);
                    return item;
                })),

            });

        } else if (response.statusCode === 404) { 

            // wx.showModal({
            //     title: '加载失败',
            //     content: '加载数据失败,可能缺少相应的数据',
            //     showCancel: false,
            // });

            console.log('加载数据失败,可能缺少相应的数据'); 
        }
    })
    .catch(function () {
        wx.hideLoading();
        if (data.page == 1) {

            self.setData({
                showerror: "block",
                floatDisplay: "block"
            });

        }
        else {
            // wx.showModal({
            //     title: '加载失败',
            //     content: '加载数据失败,请重试.',
            //     showCancel: false,
            // });
        }
    })
    .finally(function () {

        setTimeout(function () {
            wx.hideLoading();

        }, 1500);

        });    
  }, 
  // 跳转至查看帖子详情
  redictDetail: function (e) {
    // console.log('查看帖子');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },


})



