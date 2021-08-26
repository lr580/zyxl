// miniprogram/pages/Theater/Theater.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [],//类别(5全选)
    now_type: 5,//当前类别下标
    type_seq: [5, 0, 1, 2, 3, 4],//类别展示顺序常量
    sort_key: 0, //0:按最后编辑时间排序(先->后), 1:按浏览次数排序(多->寡) (暂不实现1)
    sort_reverse: false, //是否逆序排序
    num_first_load: 5,//第一次加载多少个视频项
    num_normal_load: 3,//非第一次加载多少个视频项
    videolist: [],//所有符合要求的有序视频列表，每个元素是列表，该列表每个下标意义为：0 标题； 1 分类下标； 2 浏览次数； 3 封面完整url; 4 发布时间date(排序依据); 5 视频id(点击跳转依据)
    num_show: 0,//在所有符合要求的视频列表里，展现前num_show个视频
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.theater_init();
  },

  //初始化
  theater_init: function () {
    let ty = [];
    for (let i = 0; i <= 5; ++i) {
      ty.push(km.globalData.type_p[i]);
    }
    this.setData({
      types: ty,
    });
    this.load_videolist();
  },

  //点击类别下标为v的类别分类
  click_type: function (v) {
    let tid = Number(v.currentTarget.id);
    if (tid == this.data.now_type) {
      return;
    }
    this.sele_type(tid);
  },

  //选择类别x
  sele_type: function (x) {
    this.setData({
      now_type: x,
    });
    this.load_videolist();
  },

  //选择排序依据v
  sele_sorttype: function (v) {
    let nr = v.currentTarget.id;
    let sk = Number(nr[0]);
    let sr = Number(nr[1]);
    this.setData({
      sort_key: sk,
      sort_reverse: sr,
    });
    this.load_videolist();
  },

  //创建关于视频对象x的部分信息列表(格式同videolist元素)
  make_infoabbr: function (x) {
    return [x.title, x.type, x.click, km.globalData.cloudpath + '/videoposter/' + x.poster, x.time, x.id];
  },

  //根据条件加载互动视频列表，若mode=0是首次加载，否则是下拉加载
  load_videolist: function (mode = 0) {

    if (mode == 0) {
      var lt = [];
      var ns = 0;
      var tys = []; //类型
      if (this.data.now_type == 5) {
        for (let i = 0; i < 5; ++i) {
          tys.push(i);
        }
      } else {
        tys.push(this.data.now_type);
      }
      for (let i = 0; i < km.globalData.info_video.length; ++i) {
        if (tys.indexOf(km.globalData.info_video[i].type) != -1) {
          lt.push(this.make_infoabbr(km.globalData.info_video[i]));
        }
      }

      var cmp;
      if (this.data.sort_key == 0) {
        cmp = function () {
          return function (a, b) {
            return Number(b[4]) - Number(a[4]);
          }
        }
      }
      lt.sort(cmp());
      if (this.data.sort_reverse) {
        lt.reverse();
      }

      ns = Math.min(this.data.num_first_load, lt.length);
      this.setData({
        num_show: ns,
        videolist: lt,
      });
    } else {
      let ns = this.data.num_show;
      ns = Math.min(ns + this.data.num_normal_load, this.data.lt.length);
      this.setData({
        num_show: ns,
      });
    }
  },

  //跳转到互动视频页面
  goto_video: function (v) {
    let vid = v.currentTarget.id;
    console.log('awa', vid);
    wx.navigateTo({
      url: '../video/video?id=' + vid,
    });
    km.add_click('video', vid);
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