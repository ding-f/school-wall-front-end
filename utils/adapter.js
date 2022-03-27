var wxRequest = require('wxRequest.js')
var Api = require('api.js');
// 获取小程序插屏广告设置
function setInterstitialAd(pagetype) {
    var getOptionsRequest = wxRequest.getRequest(Api.getOptions());
    getOptionsRequest.then(res => {

      // 获取广告id，创建插屏广告组件
      var adUnitId=res.data.interstitialAdId;

      var enableAd=false;

       // mark: 13 请求各类广告的是否开启情况，1开启，0关闭
      var enable_index_interstitial_ad=res.data.enable_index_interstitial_ad;
      var enable_detail_interstitial_ad=res.data.enable_detail_interstitial_ad;
      var enable_topic_interstitial_ad=res.data.enable_topic_interstitial_ad;
      var enable_list_interstitial_ad=res.data.enable_list_interstitial_ad;
      var enable_hot_interstitial_ad=res.data.enable_hot_interstitial_ad;
      var enable_comments_interstitial_ad=res.data.enable_comments_interstitial_ad;
      var enable_live_interstitial_ad=res.data.enable_live_interstitial_ad;
      if(!adUnitId) return;   //广告ID如果为null，就会停止这个程序
      let interstitialAd = wx.createInterstitialAd({
        adUnitId: adUnitId
      })
      // 监听插屏错误事件
      interstitialAd.onError((err) => {
        console.error(err)
      })
      // 显示广告
      if (interstitialAd) {   //查询广告的开启情况，比如enable_detail_interstitial_ad，就是查询详情页面广告，详情页就会传过来enable_detail_interstitial_ad，来查找设置是否开启此页面广告。
        switch(pagetype)
        {
          case 'enable_index_interstitial_ad':
            if(enable_index_interstitial_ad=="1")
            {
              enableAd=true;
            }
            break;

            case 'enable_detail_interstitial_ad':
            if(enable_detail_interstitial_ad=="1")
            {
              enableAd=true;
            }
            break;

            case 'enable_topic_interstitial_ad':
            if(enable_topic_interstitial_ad=="1")
            {
              enableAd=true;
            }
            break;

            case 'enable_list_interstitial_ad':
            if(enable_list_interstitial_ad=="1")
            {
              enableAd=true;
            }
            break;

            case 'enable_hot_interstitial_ad':
            if(enable_hot_interstitial_ad=="1")
            {
              enableAd=true;
            }
            break;

            case 'enable_comments_interstitial_ad':
            if(enable_comments_interstitial_ad=="1")
            {
              enableAd=true;
            }
            break;

            case 'enable_live_interstitial_ad':
            if(enable_live_interstitial_ad=="1")
            {
              enableAd=true;
            }
            break;

        }
        if(enableAd)    //如果设置项为true，也就是说获取的Api.getOptions()设置值为1，就会执行以下
        {
          interstitialAd.show().catch((err) => {    //调用在调用次代码的地方显示广告
            console.error(err)
          })
        }
        
      }
    })
  }

module.exports = {
    setInterstitialAd: setInterstitialAd,
}
