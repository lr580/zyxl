// pages/postt/postt.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    editorCtx: '', //富文本编辑框API
    formats: {},  //富文本编辑框样式使用
    readOnly: false, //富文本编辑框样式使用
    editorHeight: 300, //富文本编辑框样式使用
    keyboardHeight: 0, //富文本编辑框样式使用
    isIOS: false, //富文本编辑框样式使用

    edit: false, //是否编辑模式
    id: -1, //当前处理的帖子ID
    rep_name: '', //被回复人名称
    rep_floor: -1, //被回复人楼层
    isreplypost: false,//是否是跟帖
    isreplyreply: false,//是否是回帖
    ftitle: '',//被跟帖子标题

    types: [],//分类类别
    busy: false,//防止频繁点击

    s_title: '',//标题框文本
    s_type: 0,//分类框选中类别下标
    fid: -1, //跟帖的被跟帖子id
    rid: -1, //回帖的被回帖子id
  },

  /* options格式要求：
 如果什么都没有，就是发布新帖子
 如果带edit关键字就是编辑模式
 编辑模式下需要带id关键字，带被编辑帖子id
 如果带fid关键字，就是跟帖，且被回的帖子id是fid
 带fid关键字的情况下，必然带ftitle关键字，即被跟帖的标题
 如果带rid关键字，就是回复帖子，且被回复帖子id是rid，rid出现的充分条件是fid出现
 带rid关键字的情况下，必然带rfloor关键字，即被回复楼层
 带rid关键字的情况下，必然带rname关键字，即被回复人昵称
 事实上rfloor,rname,ftitle可以不传入，但是这里传入是考虑到未来可能删去info_user和info_post将不再可以获取信息
 另：假设能够点击进入该页面的人都是已经登陆的用户
 */
  onLoad: function (options) {
    console.log(options);
    this.init(options);
  },

  onUnload: function () {

  },

  //初始化
  init: function (options) {
    this.setData({
      types: km.globalData.type_p,
    });

    if (options.edit != undefined) {
      this.setData({
        edit: true,
        id: Number(id),
      });
    }
    if (options.fid != undefined) {
      this.setData({
        isreplypost: true,
        fid: Number(options.fid),
        ftitle: options.ftitle,
      })
    }
    if (options.rid != undefined) {
      this.setData({
        isreplyreply: true,
        rid: Number(options.rid),
        rep_name: options.rname,
        rep_floor: options.rfloor,
      });
    }

    let thee = this;
    if (false) { //发布新帖(学舟旧方案，现在进行了优化，已废除该方案)
      db.collection('global').doc('default').update({
        data: {
          num_post: _.inc(1),
        }
      }).then(res => {
        km.globalData.num_post++;
        thee.setData({
          id: km.globalData.num_post,
        });
        console.log('num_post', km.globalData.num_post);
      }).catch(rws => {
        console.error('增加帖子失败！', rws);
        wx.navigateBack();
        wx.showToast({
          title: '创建帖子失败，请重试！',
          icon: 'none',
        });
      });
    }

    this.init_editor();
  },

  //初始化富文本编辑框
  init_editor: function () {
    const platform = wx.getSystemInfoSync().platform;
    const isIOS = platform === 'ios';
    this.setData({ isIOS });
    const that = this;
    this.updatePosition(0);
    let keyboardHeight = 0;
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) {
        return;
      }
      const duration = res.height > 0 ? res.duration * 1000 : 0;
      keyboardHeight = res.height;
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            that.updatePosition(keyboardHeight);
            that.editorCtx.scrollIntoView();
          }
        })
      }, duration);

    });
  },

  //富文本编辑框就绪
  mi_ready: function () {
    const thee = this;
    wx.createSelectorQuery().select('#main_input').context(res => {
      thee.editorCtx = res.context;
    }).exec();
  },

  //输入标题
  scanf_title: function (e) {
    let v = e.detail.value;
    this.setData({
      s_title: v,
    });
  },

  //选择类别
  sele_type: function (v) {
    let t = Number(v.currentTarget.id);
    this.setData({
      s_type: t,
    });
  },

  //保存所有内容，发布
  save_all: function () {
    const thee = this;
    thee.editorCtx.getContents({}).then(res => {
      let nr = res.html;
      thee.publish(nr);
    }).catch(rws => {
      console.error('获取富文本内容失败', rws);
    });
  },

  //保存发帖，正文为nr
  publish: function (nr) {
    let obj = {};
    if (this.data.isreplypost == false) { //是主题
      obj.title = this.data.s_title;
      obj.type = Number(this.data.s_type);
    } else {//是跟帖
      obj.title = '';
      obj.type = -1;
    }
    let nowtime = new Date;
    if (this.data.edit == false) { //是新帖
      obj._id = km.globalData.num_post + 1;
      obj.time_publish = nowtime;
      obj.click = 0;
    }
    obj.time_active = nowtime;
    obj.user = km.globalData.openid;
    if (this.data.isreplyreply) { //是回帖
      obj.replyto = this.data.rid;
    }
    if (this.data.isreplypost) {//是跟帖
      obj.parent = this.data.fid;
    }
    obj.content = nr;

    console.log(obj);

    let all_todos = 1;//待做云操作列表 (本帖)
    if (this.data.edit == false) { //用户自己新增帖子
      all_todos++;
    }
    if (this.data.isreplypost) { //跟帖
      all_todos += 2; //给主题人消息，更新主题本帖
    }
    if (this.data.isreplyreply) { //回帖
      if (km.info_post[this.data.rid].user != km.globalData.openid) {//不是我回我自己
        all_todos++; //给被回帖人消息
      }
    }

    console.log(all_todos);
  },

  /*以下内容是富文本编辑框官方模板 */
  readOnlyChange() {
    this.setData({
      readOnly: !this.data.readOnly
    });
  },
  updatePosition(keyboardHeight) {
    const toolbarHeight = 50;
    const { windowHeight, platform } = wx.getSystemInfoSync();
    let editorHeight = keyboardHeight > 0 ? (windowHeight - keyboardHeight - toolbarHeight) : windowHeight;
    this.setData({ editorHeight, keyboardHeight });
  },
  calNavigationBarAndStatusBar() {
    const systemInfo = wx.getSystemInfoSync();
    const { statusBarHeight, platform } = systemInfo;
    const isIOS = platform === 'ios';
    const navigationBarHeight = isIOS ? 44 : 48;
    return statusBarHeight + navigationBarHeight;
  },
  blur() {
    this.editorCtx.blur();
  },
  format(e) {
    let { name, value } = e.target.dataset;
    if (!name) {
      return;
    }
    this.editorCtx.format(name, value);

  },
  onStatusChange(e) {
    const formats = e.detail;
    this.setData({ formats });
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
      }
    });
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
      }
    });
  },
  removeFormat() {
    this.editorCtx.removeFormat();
  },
  /*以上内容是富文本编辑框官方模板 */
  insertImage() {
    const that = this, thee = this
    wx.chooseImage({
      count: 1, //1就行了，多个太费劲了
    }).then(res => {
      if (res.tempFilePaths.length == 0) {
        return;
      }
      let tp = res.tempFilePaths[0];
      let url_relative = tp.substr(tp.lastIndexOf('/') + 1);
      let url_abs = km.globalData.cloudpath + '/postpic/' + url_relative;
      wx.showLoading({
        title: '上传中……',
      });
      wx.cloud.uploadFile({
        filePath: tp,
        cloudPath: 'postpic/' + url_relative, //注意格式不是绝对url地址
      }).then(ret => {
        wx.hideLoading({
          success: (res) => { },
        });
        thee.editorCtx.insertImage({
          src: url_abs,
          width: '50%',
        }).then(reu => {
        }).catch(rwu => {
          console.error('载入图片失败！', rwu);
        });
      }).catch(rwt => {
        wx.hideLoading({
          success: (res) => { },
        });
        wx.showToast({
          title: '保存图片失败！请重试！',
          icon: 'none',
        });
        console.error('保存到云端图片', rwt);
      });

    }).catch(rws => {
      console.error('上传图片', rws);
      wx.showToast({
        title: '上传图片失败，请重试！',
        icon: 'none',
      });
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