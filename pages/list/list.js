/*
 * 
 
 */

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');

// var wxApi = require('../../utils/wxApi.js')
// const Adapter = require('../../utils/adapter.js')
var wxRequest = require('../../utils/wxRequest.js')

import config from '../../utils/config.js'
// var pageCount = config.getPostCount;
var webSiteName= config.getWebsiteName;
var blog =config.getBlog;

Page({
  data: {
    title: '帖子列表',
    postsList: [],
    pagesList: {},
    categoriesList: {},
    postsShowSwiperList: {},
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,    //这个就是分类ID，写的跟个狗屎一样
    categoriesName:'',
    categoriesImage:"", 
    showerror:"none",
    isCategoryPage:"none",
    isSearchPage:"none",
    showallDisplay: "block",
    displaySwiper: "block",
    floatDisplay: "none",
    searchKey:"",
    webSiteName:webSiteName,
    blog:blog,
    // listAdsuccess:true,
    isLoading: false
  },

  //似乎没用
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
    var title = "分享“"+webSiteName+"”";
    var path =""
    if (this.data.categories && this.data.categories != 0)
  {
      title += "墙贴类别：" + this.data.categoriesList.name;
      path = 'pages/list/list?categoryID=' + this.data.categoriesList.id;

  }
  else
  {
      title += "的搜索内容：" + this.data.searchKey;
      path = 'pages/list/list?search=' + this.data.searchKey;
  }


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
//分享到朋友圈
  onShareTimeline: function() {

    var query={};
    var title="";
    if (this.data.categories && this.data.categories != 0)
      {
          title += this.data.categoriesList.name+"-"+this.data.categoriesList.description;
          query = {categoryID:this.data.categoriesList.id};

      }
      else
      {
          title += webSiteName +"的搜索内容：" + this.data.searchKey;          
          query = {search:this.data.searchKey};
      }
    
    return {
      title: title,
      path : 'pages/list/list',
      query: query,
      imageUrl:this.data.categoriesImage
     
    }
  },
  // mark: 上拉刷新
  onReachBottom: function () {
      var self = this;
      if (!self.data.isLastPage) {
          self.setData({
              page: self.data.page + 1
          });
          console.log('当前页' + self.data.page);
          this.fetchPostsData(self.data);
      }
      else {

          console.log('最后一页');
          wx.showToast({
            title: '加载完毕 🎉',
            mask: false,
            duration: 1666
          });
      }
     
  },
 // mark: 重载按钮
  reload:function(e)
  {
    var self = this;
    if (self.data.categories && self.data.categories != 0) {
      
      self.setData({
        isCategoryPage: "block",
        showallDisplay: "none",
        showerror: "none",

      });
      self.fetchCategoriesData(self.data.categories);
    }
    if (self.data.search && self.data.search != '') {
      self.setData({
        isSearchPage: "block",
        showallDisplay: "none",
        showerror: "none",
        searchKey: self.data.search
      })
    }
    self.fetchPostsData(self.data);
  },
  //加载分页，似乎没用
  loadMore: function (e) {
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    }
    else {
      wx.showToast({
        title: '加载完毕 🎉',
        mask: false,
        duration: 1000
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
    // 设置插屏广告
    // Adapter.setInterstitialAd("enable_list_interstitial_ad");

    // mark: 获取分类ID调用查询分类帖子函数
    if (options.categoryID && options.categoryID != 0) {
      self.setData({
        categories: options.categoryID,    // mark: categories 即 categoryID传过来的分类ID
        isCategoryPage:"block"        
       
      });
      self.fetchCategoriesData(options.categoryID);
    }

    // mark: 搜索功能实现
    if (options.search && options.search != '') {
      wx.setNavigationBarTitle({
        title: "搜索"
      });
      self.setData({
        search: options.search,
        isSearchPage:"block",
        searchKey: options.search
      })

      this.fetchPostsData(self.data);
       
    
    }    
  },

  // mark: 根据某分类数据查询所有某分类下的所有帖子
  fetchPostsData: function (data) {   //data 传过来的是本页data数据
    var self = this;  
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';

    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };
    self.setData({ isLoading: true })
    var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));
    getPostsRequest.then(response =>{

      var pageList=response.data.records;   //单个分页页面列表
      var pageSize=response.data.size;    //后端设置的列表每页多少元素
        if (response.statusCode === 200) {
            if (pageList.length < pageSize) {   //判断最后一页
                self.setData({
                    isLastPage: true,
                    isLoading: false
                });
            }
            
            self.setData({
                floatDisplay: "block",
                showallDisplay: "block",
                postsList: self.data.postsList.concat(pageList.map(function (item) {
                    // var strdate = ;
                    item.date = util.cutstr(item.date, 10, 1);

                    if (item.postImage0 == null || item.postImage0 == '') {
                        item.postImage0 = '../../images/error.jpg';
                    }
                    //判断校园墙服务器图片
                    if(!(item.postImage0.indexOf("http")==0 || item.postImage0.indexOf("../")==0)){
                      let url= Api.imagesDownLoad(item.date,item.postImage0
                        );

                        item.postImage0=url;
                    }

                    
                    return item;
                }))

            });
            // setTimeout(function () {
            //     wx.hideLoading();

            // }, 1500);



        }
        else {    // mark: 似乎是无用代码 
            if (response.data.code == "rest_post_invalid_page_number") {

                self.setData({
                    isLastPage: true,
                    isLoading: false
                });

            }
            else {
                wx.showToast({
                    title: response.data.message,
                    duration: 1500
                })
            }
        }   

    })
    .catch(function(){        
        if (data.page == 1) {

          // console.log("请求失败~~~~~~~~~~~~~~~");
            self.setData({
                showerror: "block",
                floatDisplay: "none"
            });

        }
        else {
            wx.showModal({
                title: '加载失败',
                content: '我们之间最遥远的距离原来是断网~~',
                showCancel: false,
            });


            self.setData({
                page: data.page - 1
            });
        }

    })
        .finally(function () {
            wx.hideLoading();
            self.setData({ isLoading: false })

        })  
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

  // mark: 分类ID获取某个分类的函数
  fetchCategoriesData: function (id) {
    var self = this;
    self.setData({
      categoriesList: []
    });

    var getCategoryRequest = wxRequest.getRequest(Api.getCategoryByID(id));

    getCategoryRequest.then(response =>{

        var catImage = "";
        if (typeof (response.data.categoryThumbnailImage) == "undefined" || response.data.categoryThumbnailImage == "") {
            catImage = "../../images/error.jpg";
        }
        else {
            catImage = response.data.categoryThumbnailImage;
        }

        self.setData({
            categoriesList: response.data,    //分类的某个模块全部数据
            categoriesImage: catImage,    //分类模块图片
            categoriesName: response.data.name  //分类名称
        });

        wx.setNavigationBarTitle({    //标题栏 文字
            title: response.data.name,
            success: function (res) {
                // success
            }
        });

        self.fetchPostsData(self.data); 

    })
  }
  //,
  // adbinderror:function(e)
  // {
  //   var self=this;
  //   console.log(e.detail.errCode);
  //   console.log(e.detail.errMsg);    
  //   if (e.detail.errCode) {
  //     self.setData({
  //       listAdsuccess: false
  //     })
  //   }

  // }
  

})



