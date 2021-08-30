// pages/index/index.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardCur:0,//前端调试参数
    arr_rec: [], //推荐视频(元素为数组[0:标题, 1:类别下标, 2:浏览次数, 3:封面, 4:视频id])
    types: km.globalData.type_p,//类别
    arr_pla: [],//海报图片
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84000.jpg'
    }, {
      id: 1,
        type: 'image',
        url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84001.jpg',
    }, {
      id: 2,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big39000.jpg'
    }, {
      id: 3,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'
    }, {
      id: 4,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big25011.jpg'
    }, {
      id: 5,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big21016.jpg'
    }, {
      id: 6,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big99008.jpg'
    }],
  },

  onLoad: function (options) {
    let thee = this;
    km.indexpage_reload = function () {
      thee.init_index();
    } //云开发数据库全部读完后重新加载一次本页面
    this.towerSwiper('swiperList');
  },



  DotStyle(e) {
    this.setData({
      DotStyle: e.detail.value
    })
  },

   // cardSwiper
   cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  // towerSwiper
  // 初始化towerSwiper
  towerSwiper(name) {
    let list = this.data[name];
    for (let i = 0; i < list.length; i++) {
      list[i].zIndex = parseInt(list.length / 2) + 1 - Math.abs(i - parseInt(list.length / 2))
      list[i].mLeft = i - parseInt(list.length / 2)
    }
    this.setData({
      swiperList: list
    })
  },
  // towerSwiper触摸开始
  towerStart(e) {
    this.setData({
      towerStart: e.touches[0].pageX
    })
  },
  // towerSwiper计算方向
  towerMove(e) {
    this.setData({
      direction: e.touches[0].pageX - this.data.towerStart > 0 ? 'right' : 'left'
    })
  },
  // towerSwiper计算滚动
  towerEnd(e) {
    let direction = this.data.direction;
    let list = this.data.swiperList;
    if (direction == 'right') {
      let mLeft = list[0].mLeft;
      let zIndex = list[0].zIndex;
      for (let i = 1; i < list.length; i++) {
        list[i - 1].mLeft = list[i].mLeft
        list[i - 1].zIndex = list[i].zIndex
      }
      list[list.length - 1].mLeft = mLeft;
      list[list.length - 1].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    } else {
      let mLeft = list[list.length - 1].mLeft;
      let zIndex = list[list.length - 1].zIndex;
      for (let i = list.length - 1; i > 0; i--) {
        list[i].mLeft = list[i - 1].mLeft
        list[i].zIndex = list[i - 1].zIndex
      }
      list[0].mLeft = mLeft;
      list[0].zIndex = zIndex;
      this.setData({
        swiperList: list
      })
    }
  },

  //初始化
  init_index: function () {
    let arr = [];
    for (let i = 0; i < km.globalData.info_recommend.length; ++i) {
      let x = km.globalData.info_video[km.globalData.info_recommend[i]];
      arr.push([x.title, x.type, x.click, km.globalData.cloudpath + '/videoposter/' + x.poster, x.id]);
    }
    this.setData({
      arr_rec: arr,
      arr_pla: km.globalData.info_placard,
    });
  },

  //视频跳转
  goto_video: function (v) {
    let vid = v.currentTarget.id;
    km.goto_video(vid);
  },

  //海报跳转
  goto_placard: function (v) {
    let vid = v.currentTarget.id;
    wx.navigateTo({
      url: '../placard/placard?id=' + vid,
    });
  },

  //前往悄悄话预约页面
  goto_talk: function () {
    wx.navigateTo({
      url: '../talk/talk',
    });
  },

  //前往VR预约页面
  goto_vr: function () {
    wx.navigateTo({
      url: '../vr/vr',
    });
  },

  //前往积分商城预约页面
  goto_shop: function () {
    wx.navigateTo({
      url: '../shop/shop',
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})