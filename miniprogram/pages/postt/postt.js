// pages/postt/postt.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',//自己的id
    types: [],//类别
    id: '',//主贴id
    info: {},//主贴对象
    uid: '',//主贴贴主id
    uinfo: {},//主贴人对象
    ptime: '',//主贴最后编辑时间字符
    rid: [], //跟帖id数组
    rinfo: [], //跟帖信息数组
    ruid: [], //跟帖用户id数组
    ruinfo: [], //跟帖用户信息数组
    rtime: [],//跟帖最后编辑时间字符数组
    rruinfo: [],//被回帖用户信息数组
    rrfloor: [],//被回帖楼层信息数组
    rfloor: [],//跟帖楼层数组
    sort_reverse: false,//跟帖楼层是否降序显示
    pctx: null,//主贴富文本框对象 (事实上不在data内，在this直系，在这里写一遍只是声明格式，此处变量不可用，rctx同)
    rctx: [],//回帖富文本框对象数组
    rseq: [],//按显示顺序的回帖显示下标顺序数组
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
    });//onshow会处理初始化的
    // this.init_post(this.data.id);
  },

  //初始化
  init_post: function (opt) {
    let pid = opt;
    let pinfo = km.globalData.info_post[pid];
    let puid = pinfo.user;
    let puinfo = km.globalData.info_users[puid];
    let ptime = km.date2str(pinfo.time_publish);
    let rid = [];
    let rinfo = [];
    let ruid = [];
    let ruinfo = [];
    let rtime = [];
    let rruinfo = [];
    let rfloor = [];
    let rrfloor = [];
    let rseq = [];
    let bin = []; //楼层：帖子id桶排(/map)数组优化
    rid = pinfo.reply;
    for (let i = 0; i < pinfo.reply.length; ++i) {
      rseq.push(i);
      rinfo.push(km.globalData.info_post[rid[i]]);//修拼写错误……
      ruid.push(rinfo[i].user);
      ruinfo.push(km.globalData.info_users[ruid[i]]);
      rtime.push(km.date2str(rinfo[i].time_active));
      rruinfo.push(rinfo[i].replyto ? km.globalData.info_users[km.globalData.info_post[rinfo[i].replyto].user] : '');
      rrfloor.push(rinfo[i].replyto ? bin[rinfo[i].replyto] : -1); //不能回复比自己高的楼层(即不能回复未来的帖子)
      rfloor.push(i + 1);
      bin[rid[i]] = i + 1;
    }
    this.setData({
      openid: km.globalData.openid,
      id: pid,
      info: pinfo,
      uid: puid,
      uinfo: puinfo,
      ptime: ptime,
      rid: rid,
      rinfo: rinfo,
      ruid: ruid,
      ruinfo: ruinfo,
      rruinfo: rruinfo,
      rtime: rtime,
      rfloor: rfloor,
      rrfloor: rrfloor,
      rseq: rseq,
      types: km.globalData.type_p,
    });
    const thee = this;
    if (thee.pctx) {
      thee.pctx.setContents({ html: thee.data.info.content });
    }
    this.update_editor();
  },

  //更新回帖区的富文本编辑框
  update_editor: function () {
    const thee = this;
    if (thee.rctx) {
      for (let i = 0; i < thee.rctx.length; ++i) {
        if (thee.rctx[i]) {
          thee.rctx[i].setContents({ html: thee.data.rinfo[thee.data.rseq[i]].content });
        }
      }
    }
  },

  //更改跟帖排序
  sele_rev: function (e) {
    let v = Number(e.currentTarget.id);
    if (v == this.data.sort_reverse) {
      return;
    }
    let arr = this.data.rseq;
    arr.reverse();
    this.setData({
      sort_reverse: v,
      rseq: arr,
    });
    this.update_editor();
  },

  //主贴富文本框准备就绪
  pct_ready: function () {
    const thee = this;
    wx.createSelectorQuery().select('#pcontent').context(res => {
      thee.pctx = res.context;
      thee.pctx.setContents({ html: thee.data.info.content });
    }).exec();
  },

  //第e个跟帖富文本框准备就绪
  rct_ready: function (e) {
    let v = Number(e.currentTarget.id.match(/rcontent(\d+)/)[1]);//分组
    const thee = this;
    if (!thee.rctx) {
      thee.rctx = [];
    }
    wx.createSelectorQuery().select('#rcontent' + v).context(res => {
      thee.rctx[v] = res.context;
      thee.rctx[v].setContents({ html: thee.data.rinfo[v].content });
    }).exec();
  },

  //编辑主帖子
  goto_pedit: function () {
    let id = this.data.id;
    wx.navigateTo({
      url: '../postp/postp?id=' + id + '&edit=1',
    });
  },

  //检测跟帖id是否是回帖，如果是的话加上url信息，否则什么也不加(可以强制回复自己，参数是sudo)
  checkadd_rr: function (ri, sudo = false) {
    if (km.globalData.info_post[ri].replyto || sudo) {
      let rid = km.globalData.info_post[ri].replyto;
      if (sudo) {
        rid = ri;
      }
      console.log(rid, 'awa?');
      let rname = km.globalData.info_users[km.globalData.info_post[rid].user].name;
      let rfloor = -1;
      for (let i = 0; i < this.data.rinfo.length; ++i) {
        if (this.data.rid[i] == rid) {
          rfloor = this.data.rfloor[i];
          break;
        }
      }
      return '&rid=' + rid + '&rname=' + rname + '&rfloor=' + rfloor;
    }
    return '';
  },

  //编辑跟帖，跟帖id是v
  goto_redit: function (v) {
    let ri = v.currentTarget.id;
    let fid = this.data.id;
    let title = this.data.info.title;
    let uurl = '../postp/postp?id=' + ri + '&edit=1&fid=' + fid + '&ftitle=' + title;
    uurl += this.checkadd_rr(ri);
    wx.navigateTo({
      url: uurl,
    });
  },

  //回帖主帖子
  goto_preply: function () {
    let id = this.data.id;
    let title = this.data.info.title;
    wx.navigateTo({
      url: '../postp/postp?fid=' + id + '&ftitle=' + title,
    });
  },

  //回帖跟帖
  goto_rreply: function (v) {
    let ri = v.currentTarget.id;
    let id = this.data.id;
    let title = this.data.info.title;
    let uurl = '../postp/postp?fid=' + id + '&ftitle=' + title + this.checkadd_rr(ri, true);
    console.log(uurl);
    wx.navigateTo({
      url: uurl,
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
    if (this.data.id) {
      this.init_post(this.data.id);
    }
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