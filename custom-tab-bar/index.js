

Component({
  
	data: {
		active: 0,
		list: [
			{
				icon: 'home-o',
				text: '首页',
        url: '/pages/index/index',
        hint: ""
			},
			{
				icon: 'apps-o',
				text: '分类',
        url: '/pages/topic/topic',
        hint: ""
      },
      {
        icon: 'user-o',
				text: '我的',
        url: '/pages/readlog/readlog',
        hint: "1"
      }
		]
	},

  
	methods: {
    //处理跳转，图标变色
		onChange(event) {
      // console.log(event)
      // console.log(this.data.list[event.detail].url)
			this.setData({ active: event.detail });
			wx.switchTab({
				url: this.data.list[event.detail].url
			});
		},

    //初始化加载本组件代码
		init() {
      
			const page = getCurrentPages().pop();
			this.setData({
				active: this.data.list.findIndex(item => item.url === `/${page.route}`)
			});
		}
	}
});