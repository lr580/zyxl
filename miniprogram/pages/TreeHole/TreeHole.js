// miniprogram/pages/TreeHole/TreeHole.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;
var startPoint
Page({

  /**
   * 页面的初始数据
   */
  data: {
    buttonTop:0,
    buttonLeft:0,
    windowHeight:'',
    windowWidth:'',
    TabCur: 0,
    scrollLeft: 0,//以上为前端参数
    types: [], //类别(注意5是全部)
    type_seq: [5, 0, 1, 2, 3, 4],  //类别顺序
    now_type: 5, //当前类别下标
    sort_key: 0,//当下版本只有0，按最后活跃时间排序
    sort_reverse: false,//是否从远到近
    num_first_load: 5, //第一次加载多少个主题项
    num_normal_load: 3, //非第一次加载多少个主题项
    postlist: [],//所有符合要求的有序视频列表，每个元素是列表，该列表每个下标意义为：0 标题 ； 1 简介； 2 最后活跃时间(文本)； 3 类型； 4 回帖数； 5 点击次数； 6 帖子ID； 7 最后活跃时间(对象)
    num_show: 0, //在所有符合要求的视频列表里，展现前num_show个视频
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        console.log(res);
        // 屏幕宽度、高度
        console.log('height=' + res.windowHeight);
        console.log('width=' + res.windowWidth);
        // 高度,宽度 单位为px
        that.setData({
          windowHeight:  res.windowHeight,
          windowWidth:  res.windowWidth,
          buttonTop:res.windowHeight*0.70,//这里定义按钮的初始位置
          buttonLeft:res.windowWidth*0.70,//这里定义按钮的初始位置
        })
      }
    })
  },

  btn_Suspension_click:function(){
    //这里是点击图标之后将要执行的操作
    if (km.globalData.info_user == null) {
      wx.showToast({
        title: '您未登录，不能发帖！',
        icon: 'none',
        duration: '3000',
      });
      return;
    }
    wx.navigateTo({
      url: '../postp/postp',
    });
  },
  //以下是按钮拖动事件
  buttonStart: function (e) {
    startPoint = e.touches[0]//获取拖动开始点
  },
  buttonMove: function (e) {
    var endPoint = e.touches[e.touches.length - 1]//获取拖动结束点
    //计算在X轴上拖动的距离和在Y轴上拖动的距离
    var translateX = endPoint.clientX - startPoint.clientX
    var translateY = endPoint.clientY - startPoint.clientY
    startPoint = endPoint//重置开始位置
    var buttonTop = this.data.buttonTop + translateY
    var buttonLeft = this.data.buttonLeft + translateX
    //判断是移动否超出屏幕
    if (buttonLeft+50 >= this.data.windowWidth){
      buttonLeft = this.data.windowWidth-50;
    }
    if (buttonLeft<=0){
      buttonLeft=0;
    }
    if (buttonTop<=0){
      buttonTop=0
    }
    if (buttonTop + 50 >= this.data.windowHeight){
      buttonTop = this.data.windowHeight-50;
    }
    this.setData({
      buttonTop: buttonTop,
      buttonLeft: buttonLeft
    })
  },
  buttonEnd: function (e) {
  },

  //页面初始化
  init_postindex: function () {
    this.setData({
      types: km.globalData.type_p,
    });
    this.load_postlist();
  },

  //选择类别
  sele_type: function (e) {
    console.log(e);
    this.setData({
      now_type: Number(e),
    });
    this.load_postlist();
  },

  //选择排序是否逆序
  sele_sortreverse: function (e) {
    let sr = Number(e.detail.value);
    if (sr == this.data.sort_reverse) {
      return;
    }
    this.setData({
      sort_reverse: sr,
    });
    let ar = this.data.postlist;
    ar.reverse();
    this.setData({
      postlist: ar,
    });
  },

  //前往发帖
  goto_postp: function () {
    if (km.globalData.info_user == null) {
      wx.showToast({
        title: '您未登录，不能发帖！',
        icon: 'none',
        duration: '3000',
      });
      return;
    }
    wx.navigateTo({
      url: '../postp/postp',
    });
  },

  //前往帖子页
  goto_post: function (e) {
    km.goto_post(Number(e.currentTarget.id));
  },
  click_type: function (v) {
    
    let tid = Number(v.currentTarget.id);
   
    if (tid == this.data.now_type) {
      return;
    }
    this.sele_type(tid);
    this.setData({
      TabCur: v.currentTarget.dataset.id,
      scrollLeft: (v.currentTarget.dataset.id - 1) * 60
    })

  },

  //创建关于主题对象x的部分信息列表(格式同postlist元素)
  make_infoabbr: function (x) {
    let valid_replynum = 0; //由于存在被删除的帖子，所以需要开for统计(因为早期设计不足所以该数据没有写进post对象)
    for (let i = 0; i < x.reply.length; ++i) { //不过反正这个时间复杂度蛮低的，就这样也挺好
      if (km.globalData.info_post[x.reply[i]]) {
        ++valid_replynum;
      }
    }
    return [x.title, x.abbr, km.date2str(x.time_active), x.type, valid_replynum, x.click, x._id, x.time_active];
  },

  //加载所有符合条件的主题，若mode=0是首次加载，否则是下拉加载
  load_postlist: function (mode = 0) {
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
      let keys = Object.keys(km.globalData.info_post);
      for (let i = 0; i < keys.length; ++i) {
        let x = km.globalData.info_post[keys[i]];
        if (tys.indexOf(x.type) != -1) {
          lt.push(this.make_infoabbr(x));
        }
      }
      var cmp;
      if (this.data.sort_key == 0) {
        cmp = function () {
          return function (a, b) {
            return Number(b[7]) - Number(a[7]);
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
        postlist: lt,
      });
    }
    else {
      let ns = this.data.num_show;
      ns = Math.min(ns + this.data.num_normal_load, this.data.postlist.length);
      this.setData({
        num_show: ns,
      });
    }

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
    this.init_postindex();
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
    if (this.data.num_show < this.data.postlist.length) {
      this.load_postlist(1);
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})