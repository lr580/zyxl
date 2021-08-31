// pages/mymessage/mymessage.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    types: [],
    sort_reverse: false,
    show_all: false,//true显示全部 false仅显示未读
    arr: [],//消息，元素格式：0 标题 ； 1 简介； 2 最后活跃时间(文本)； 3 类型； 4 回帖数； 5 点击次数； 6 帖子ID； 7 最后活跃时间(对象)； 8 被回复的真实ID；  9 回复你的人昵称；  10 是否未读
    arr_seq: [],//当前显示的消息下标列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  //初始化
  init: function () {
    let arr = [];
    let arr_seq = [];
    let arro = km.globalData.info_user.message;
    for (let i = 0; i < arro.length; ++i) {
      let w = km.globalData.info_post[arro[i][2]];
      let pa = w.parent ? km.globalData.info_post[w.parent] : w; //主贴对象
      let v;
      if (!pa) {
        v = [];
      } else {
        v = km.make_postinfoabbr(pa);
      }
      v.push(arro[i][2]);
      if (v[6] != v[8]) {
        v[2] = km.date2str(w.time_active);
      }
      v.push(km.globalData.info_users[arro[i][1]].name);
      v.push(arro[i][0]);
      arr.push(v);
    }
    for (let i = 0; i < arr.length; ++i) {//写成this.data.arr暴死；wxml对应len==10而不是11暴死
      if (this.data.show_all || (!this.data.show_all && arr[i][10])) {
        arr_seq.push(i);
      }
    }
    if (this.data.sort_reverse) {
      arr_seq.reverse();
    }
    this.setData({
      arr_seq: arr_seq,
      arr: arr,
      types: km.globalData.type_p,
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

  //按下选择范围按钮(全选/新消息)
  switch_range: function (v) {
    let newv = Number(v.currentTarget.id);
    this.setData({
      show_all: newv,
    });
    this.init();
  },

  //设置消息下标为mid的消息已读
  read_message: function (mid) {
    let thee = this;
    let nwmsg = km.globalData.info_user.message;
    let nwarr = thee.data.arr;
    if (nwarr[mid][10] == false) {
      return;
    }
    nwarr[mid][10] = false;
    nwmsg[mid][0] = false;
    km.globalData.info_user.message = nwmsg;

    db.collection('user').doc(km.globalData.openid).update({
      data: {
        message: nwmsg,
      }
    }).then(res => {
      --km.globalData.num_newmessage;
      thee.setData({
        arr: nwarr,
      });
    }).catch(rws => {
      console.error('更新信息已读状态失败！')
    });
  },

  //前往帖子
  goto_post: function (v) {
    let tx = v.currentTarget.id.match(/(\d+)\|(\d+)/);
    let pid = Number(tx[1]);
    let mid = Number(tx[2]);
    this.read_message(mid);
    km.goto_post(pid);
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