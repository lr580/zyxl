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
    rexist: [],//跟帖是否存在布尔值数组
    rrexist: [],//被回帖子是否存在布尔值数组
    exist: true,//原帖是否存在
    sort_reverse: false,//跟帖楼层是否降序显示
    pctx: null,//主贴富文本框对象 (事实上不在data内，在this直系，在这里写一遍只是声明格式，此处变量不可用，rctx同)
    rctx: [],//回帖富文本框对象数组
    rseq: [],//按显示顺序的回帖显示下标顺序数组
    busy: false,//是否禁止频繁点击
    starred: false,//是否收藏了主贴
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      id: options.id,
    });//onshow会处理初始化的
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
    let rexist = [];
    let rrexist = [];
    let bin = []; //楼层：帖子id桶排(/map)数组优化
    rid = pinfo.reply;
    for (let i = 0; i < pinfo.reply.length; ++i) {
      rseq.push(i);
      rinfo.push(km.globalData.info_post[rid[i]]);//修拼写错误……
      if (!rinfo[i]) {//跟帖已被删除
        rexist.push(false);
        rrexist.push(false);
        ruid.push(null);
        ruinfo.push(null);
        rtime.push(null);
        rruinfo.push(null);
        rrfloor.push(null);
      } else {
        rexist.push(true);
        ruid.push(rinfo[i].user);
        ruinfo.push(km.globalData.info_users[ruid[i]]);
        rtime.push(km.date2str(rinfo[i].time_active));
        if (rinfo[i].replyto) {//回帖存在
          rrfloor.push(bin[rinfo[i].replyto]);
          if (!km.globalData.info_post[rinfo[i].replyto]) { //被回复的跟帖已被删除
            rrexist.push(false);
            rruinfo.push(null);
          } else {
            rrexist.push(true);
            rruinfo.push(km.globalData.info_users[km.globalData.info_post[rinfo[i].replyto].user]);
          }
        } else {
          rrfloor.push(null);//修bugs
          rrexist.push(false);
          rruinfo.push('');
        }
      }
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
      rexist: rexist,//修bugs
      rrexist, rrexist,
      rseq: rseq,
      types: km.globalData.type_p,
      starred: km.find_in_pair(km.globalData.info_user.star_post, Number(pid)) != -1,
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
        if (thee.rctx[i] && thee.data.rinfo[thee.data.rseq[i]]) { //被删除就不能加载了
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
      if (thee.data.rinfo[v]) { //可能被删帖了
        thee.rctx[v].setContents({ html: thee.data.rinfo[v].content });
      }
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
      // console.log(rid, 'awa?');
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
    // console.log(uurl);
    wx.navigateTo({
      url: uurl,
    });
  },

  //删除询问，如果确认删除，调用函数及参数
  del_query: function (f, x, y = true) {
    wx.showModal({
      title: '提示',
      content: '该操作不可逆，是否确认删除？',
      confirmText: '删除',
      confirmColor: '#aa0000',
    }).then(res => {
      if (res.confirm) {
        f(x, y);
      }
    }).catch(rws => {
      console.error('询问失败', rws);
    });
  },

  //物理删除_id=id的帖子； 若quit，删除完毕后退出本页面
  del_post: function (id, quit = true) {
    if (this.check_busy()) {
      return;
    }
    this.setData({
      busy: true,
    });
    let thee = this;
    wx.showLoading({
      title: '请稍后……',
    });
    let tot = 3;
    let now = 0;
    let fail = function (io, rws) {
      thee.setData({
        busy: false,
      });
      wx.hideLoading({
        success: (res) => { },
      });
      wx.showToast({
        title: '删除失败，请重试！',
      });
      console.error(io, rws);
    };
    let upd = function () {
      if (++now == tot) {
        thee.setData({
          busy: false,
        });
        wx.hideLoading({
          success: (res) => { },
        });
        if (quit) {
          wx.navigateBack({
            delta: 0,
          });
        }else{
          if (thee.data.id) {
            thee.init_post(thee.data.id);
          }
        }
        wx.showToast({
          title: '删除成功！',
          icon: 'none',
          duration: 2000,
        });
      }
    };
    let uid = this.data.openid;//其实就是自己
    db.collection('post').doc(Number(id)).remove({}).then(res => {
      delete km.globalData.info_post[id];
      upd();
    }).catch(rws => {
      fail('删除帖子', rws);
    });

    db.collection('user').doc(uid).update({//如果这里用了_.pop暴毙，因为pop是删掉最后一个元素
      data: {
        post: _.pull(Number(id)),
      }
    }).then(res => {
      let i = km.globalData.info_user.post.indexOf(Number(id));
      km.globalData.info_user.post.pop(i);
      upd();
    }).catch(rws => {
      fail('更新用户', rws);
    });

    db.collection('global').doc('default').update({
      data: {
        num_post: _.inc(-1),
      }
    }).then(res => {
      upd();
    }).catch(rws => {
      fail('帖子数目', rws);
    });
  },

  //删除主贴
  pdel: function () {
    this.del_query(this.del_post, this.data.id);
  },

  //删除帖子id为e的跟帖
  rdel: function (e) {
    let id = e.currentTarget.id;
    this.del_query(this.del_post, id, false);
  },

  //如果正忙，弹出请勿频繁点击且返回true，否则啥也不做且返回false
  check_busy: function () {
    if (this.data.busy) {
      wx.showToast({
        title: '请勿频繁点击！',
        icon: 'none',
      });
      return true;
    }
    return false;
  },

  //收藏本视频
  star_video: function () {
    if (this.check_busy()) {
      return;
    }
    this.setData({
      busy: true,
    });
    let thee = this;
    var callback_suc = function () {
      thee.setData({
        busy: false,
        starred: true,
      });
    };
    var callback_fail = function () {
      thee.setData({
        busy: false,
      });
      wx.showToast({
        title: '收藏失败，请重试！',
        icon: 'none',
        duration: 3000,
      });
    };
    km.add_record('star_post', Number(this.data.id), new Date, callback_suc, callback_fail);
  },

  //取消收藏本视频
  unstar_video: function () {
    if (this.check_busy()) {
      return;
    }
    this.setData({
      busy: true,
    });
    let thee = this;
    var callback_suc = function () {
      thee.setData({
        busy: false,
        starred: false,
      });
    };
    var callback_fail = function () {
      thee.setData({
        busy: false,
      });
      wx.showToast({
        title: '取消收藏失败，请重试！',
        icon: 'none',
        duration: 3000,
      });
    };
    km.del_record('star_post', Number(this.data.id), callback_suc, callback_fail);
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