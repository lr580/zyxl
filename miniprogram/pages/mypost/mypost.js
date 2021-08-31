// pages/mypost/mypost.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [],
    openid: '',
    sort_reverse: false, //是否由远到近显示
    sort_key: 0, //排序依据(当下版本锁定为0)
    arr: [],//所有符合要求的有序视频列表，每个元素是列表，该列表每个下标意义为：0 标题 ； 1 简介； 2 最后活跃时间(文本)； 3 类型； 4 回帖数； 5 点击次数； 6 帖子ID； 7 最后活跃时间(对象)； 8 是否是跟帖
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //初始化
  init: function () {
    let arro = km.globalData.info_user.post;
    let arr = [];
    for (let i = 0; i < arro.length; ++i) {
      let w = km.globalData.info_post[arro[i]];
      let pa = w.parent ? km.globalData.info_post[w.parent] : w; //主贴对象
      let v;
      if (!pa) { //被删除了
        v = [];
      } else {
        v = km.make_postinfoabbr(pa);
      }
      v.push(arro[i]);
      if (v[6] != v[8]) {//主贴不等于自己
        v[2] = km.date2str(w.time_active);
      }
      arr.push(v);
    }
    if (this.data.sort_reverse) {
      arr.reverse();
    }
    this.setData({
      types: km.globalData.type_p,
      openid: km.globalData.openid,
      arr: arr,
    });
  },

  //按下排序逆序按钮
  switch_reverse: function (v) {
    let newv = Number(v.currentTarget.id);
    let arrnew = this.data.arr;
    arrnew.reverse();
    this.setData({
      sort_reverse: newv,
      arr: arrnew,
    });
  },

  //前往帖子
  goto_post: function (v) {
    km.goto_post(Number(v.currentTarget.id));
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
    this.init();
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