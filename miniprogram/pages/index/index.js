// pages/index/index.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loaded: false,//加载完毕
    longtimed: false,//是否经过了足够长时间(10s)
    cardCur: 0,//前端调试参数
    arr_rec: [], //推荐视频(元素为数组[0:标题, 1:类别下标, 2:浏览次数, 3:封面, 4:视频id])
    types: km.globalData.type_p,//类别
    arr_pla: [],//海报图片
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://636c-cloud1-5gb77mtq8dcc1698-1307133896.tcb.qcloud.la/hb_cover/hb1.jpg?sign=6b6bc03bc7265fa4c471bd606c6709e6&t=1650382442'
    }, {
      id: 1,
      type: 'image',
      url: 'https://636c-cloud1-5gb77mtq8dcc1698-1307133896.tcb.qcloud.la/hb_cover/hb2.jpg?sign=aac8eb8c5585dd2b3edce5bcd04d090b&t=1650382454',
    }, {
      id: 2,
      type: 'image',
      url: 'https://636c-cloud1-5gb77mtq8dcc1698-1307133896.tcb.qcloud.la/hb_cover/hb3.jpg?sign=964e656b7a9445c102b628bc43522729&t=1650382464'
    }, {
      id: 3,
      type: 'image',
      url: 'https://636c-cloud1-5gb77mtq8dcc1698-1307133896.tcb.qcloud.la/hb_cover/hb4.jpg?sign=7f6857dea76e2a71cc01d261fa94e671&t=1650382473'
    }, {
      id: 4,
      type: 'image',
      url: 'https://636c-cloud1-5gb77mtq8dcc1698-1307133896.tcb.qcloud.la/hb_cover/hb5.jpg?sign=7882b8ca44bc3261b2f8bf822bdbe4f9&t=1650382493'
    }, {
      id: 5,
      type: 'image',
      url: 'https://636c-cloud1-5gb77mtq8dcc1698-1307133896.tcb.qcloud.la/hb_cover/hb6.jpg?sign=6d23e712b662e34b6cc2a2c3b26a0475&t=1650382502'
    }, {
      id: 6,
      type: 'image',
      url: 'https://636c-cloud1-5gb77mtq8dcc1698-1307133896.tcb.qcloud.la/hb_cover/hb7.jpg?sign=b1a9b0c304b65a7aa89545fc517d9ace&t=1650382509'
    }],
  },

  onLoad: function (options) {
    // console.log("!");
    this.update_index();
    this.towerSwiper('swiperList');
    this.setData({
      DotStyle: true
      
    })
  },

  update_index: function () {
    let thee = this;
    // console.log("qwq");
    km.indexpage_reload = function () {
      thee.init_index();
    } //云开发数据库全部读完后重新加载一次本页面
    if (!this.data.loaded) { //防止全局没读出来(多跑一遍也没坏处)
      km.indexpage_reload();
    }
    this.towerSwiper('swiperList');
    setTimeout(() => {
      thee.setData({
        longtimed: true,
      });
    }, 10000);
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
      loaded: true,
    });

    // km.coverpage_reload();
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
    if (!km.logined()) {
      wx.showToast({
        title: '您尚未登录，无法预约！',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: '../talk/talk',
    });
  },

  //前往VR预约页面
  goto_vr: function () {
    if (!km.logined()) {
      wx.showToast({
        title: '您尚未登录，无法预约！',
        icon: 'none',
      });
      return;
    }
    wx.navigateTo({
      url: '../vr/vr',
    });
  },

  //前往积分商城预约页面
  goto_shop: function () {
    if (!km.logined()) {
      wx.showToast({
        title: '您尚未登录，无法使用商城！',
        icon: 'none',
      });
      return;
    }
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
    // this.update_index();
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