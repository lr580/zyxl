// pages/video/video.js

const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    choice_showing: false, //是否显示互动选项
    vid: 0,
    video_src: "cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896/video/fail1.mp4",//当前视频片段url
    video_poster: 'cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896/videoposter/unknown_poster.jpg', //视频封面(当下版本已经删除该功能)
    video_title: '未知视频',//当前视频标题
    video_clipname: '未知片段',//当前片段名字
    video_upname: '知音心流管理员',//当前up主名字
    video_upavatar: 'cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896/avatar/unknown_user.jpg',//当前up主头像
    video_upid: 0, //当前up主ID
    video_type: '未知',//当前视频类型
    video_click: 0,//视频点击次数
    video_time: '时间字符串',//视频最后编辑时间
    avail_choice_name: [], //可选选项名字
    avail_choice_id: [], //可选后继点id
    state: 0,//未开始：0；正常节点：1；无选项节点：2；结局：3
    now_node: 0,//当前节点
    saves: [],//存档(每个元素下标0是id,1是名字)
    starred: false,//是否已经收藏本视频
    busy: false,//是否处于防止频繁点击状态
    logined: false,//是否登陆
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ vid: options.id });
    this.video_init();
    //尚未修复的小bugs：偶尔会显示渲染层网络层错误，有小概率影响视频加载，产生原因未知
  },

  //初始化视频信息
  video_init: function () {
    let vid = this.data.vid;
    let obj = km.globalData.info_video[vid];
    this.setData({
      now_node: 0,
      video_title: obj.title,
      video_clipname: obj.clipname[0],
      video_type: km.globalData.type_p[obj.type],
      video_time: km.date2str(obj.time),
      video_click: obj.click,
      state: obj.edge[0].length > 1 ? 1 : 3,
      saves: [[0, obj.clipname[0]]],
      video_upid: Number(obj.up),
      video_upname: km.globalData.info_up[Number(obj.up)][0],
      video_upavatar: km.globalData.info_up[Number(obj.up)][1],
      starred: km.logined() ? km.find_in_pair(km.globalData.info_user.star_video, vid) != -1 : false,
      logined: km.logined(),
    })
    this.video_update(0);
    this.get_next(0);
  },

  //更新当前视频片段为id
  video_update: function (id) {
    let thee = this;
    let nr = km.globalData.cloudpath + '/video/v' + thee.data.vid + '-' + id + '.mp4';
    // console.log(nr);
    this.setData({
      video_src: nr,
    });
  },

  //获取now的下一次的可选项
  get_next: function (now) {
    let vid = this.data.vid;
    let obj = km.globalData.info_video[vid];
    let len = obj.edge[now].length;
    let stt = 0;
    if (len == 0) { stt = 3; }
    else if (len == 1) { stt = 2; }
    else { stt = 1; }
    let avn = [], avi = [];
    for (let i = 0; i < len; ++i) {
      avn.push(obj.edge[now][i].info);
      avi.push(obj.edge[now][i].id);
    }
    // console.log(obj.edge[now]);
    // console.log(stt);
    this.setData({
      state: stt,
      avail_choice_id: avi,
      avail_choice_name: avn,
    })
  },

  //视频加载失败时执行(事实上没有执行)
  video_error: function (e) {
    console.error('视频加载失败', e);
  },

  //点击选项v
  goto_clip: function (v) {
    let idx = Number(v.currentTarget.id);
    this.choice_clip(idx);
  },

  //选择选项x
  choice_clip: function (x) {
    let hist = [];
    for (let i = 0; i < this.data.saves.length; ++i) {
      if (this.data.saves[i][0] == x) {
        break;
      }
      hist.push(this.data.saves[i]);
    }
    let xname = km.globalData.info_video[this.data.vid].clipname[x];
    hist.push([x, xname]);
    this.setData({
      now_node: x,
      saves: hist,
      video_clipname: xname,
    });
    this.video_update(x);
    this.hide_choice();
    this.get_next(x);
  },

  //弹出互动选项
  show_choice: function () {
    if (this.data.state == 2) {
      this.choice_clip(this.data.avail_choice_id[0]);
    } else {
      this.setData({
        choice_showing: true,
      });
    }
  },

  //隐藏互动选项
  hide_choice: function () {
    this.setData({
      choice_showing: false,
    });
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
    if (!km.logined()) {
      wx.showToast({
        title: '您尚未登录，无法收藏！',
        icon: 'none',
      });
      return;
    }
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
    km.add_record('star_video', this.data.vid, new Date, callback_suc, callback_fail);
  },

  //取消收藏本视频
  unstar_video: function () {
    if (!km.logined()) {
      wx.showToast({
        title: '您尚未登录，无法收藏！',
        icon: 'none',
      });
      return;
    }
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
    km.del_record('star_video', this.data.vid, callback_suc, callback_fail);
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