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
    video_upname: '未知UP主',//当前up主名字(未实现)
    video_upavatar: 'cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896/avatar/unknown_user.jpg',//当前up主头像(未实现)
    video_type: '未知',//当前视频类型
    video_click: 0,//视频点击次数
    video_time: '时间字符串',//视频最后编辑时间
    avail_choice_name: [], //可选选项名字
    avail_choice_id: [], //可选后继点id
    state: 0,//未开始：0；正常节点：1；无选项节点：2；结局：3
    now_node: 0,//当前节点
    saves: [],//存档(每个元素下标0是id,1是名字)
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({ vid: options.id });
    this.video_init();
    // console.log(km.globalData.info_video);

    //尚未修复的小bugs：偶尔会显示渲染层网络层错误，有小概率影响视频加载，产生原因未知

    //尚未做：
    //视频发布者信息(名称)读取
    //用户浏览历史更新
    //如果第一次点击，用户积分增加
    //用户点击收藏
  },

  //初始化视频信息
  video_init: function () {
    let vid = this.data.vid;
    let obj = km.globalData.info_video[vid];
    this.setData({
      now_node: 0,
      video_title: obj.title,
      video_clipname: obj.clipname[0],
      /*video_upname: ,*/
      video_type: km.globalData.type_p[obj.type],
      video_time: km.date2str(obj.time),
      video_click: obj.click,
      state: obj.edge[0].length > 1 ? 1 : 3,
      saves: [[0, obj.clipname[0]]],
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