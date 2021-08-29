// pages/postp/postp.js
const km = getApp();
const db = wx.cloud.database();
const _ = db.command;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 0,
    scrollLeft: 0,
    articleContent: '', //文章正文
    formats: {},
    readOnly: false,
    placeholder: '开始输入...',
    editorHeight: 300,
    keyboardHeight: 0,
    isIOS: false,
    img_num: 0, //当前图片数目

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init(options);
  },

  //初始化
  init: function (options) {
    const platform = wx.getSystemInfoSync().platform;
    const isIOS = platform === 'ios';
    const thee = this;
    this.setData({ isIOS: isIOS });
    this.updatePosition(0);
    let keyboardHeight = 0;
    wx.onKeyboardHeightChange(res => {
      if (res.height === keyboardHeight) return
      const duration = res.height > 0 ? res.duration * 1000 : 0
      keyboardHeight = res.height
      setTimeout(() => {
        wx.pageScrollTo({
          scrollTop: 0,
          success() {
            thee.updatePosition(keyboardHeight);
            thee.editorCtx.scrollIntoView();
          }
        })
      }, duration);
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
  onEditorReady() {
    var thee = this;
    wx.createSelectorQuery().select('#editor').context(function (res) {
      thee.editorCtx = res.context;
    }).exec(res => {
      if (thee.data.edit != 0) {
        // console.log('qwq ,', km.globalData.diary[thee.data.idx].content)
        thee.editorCtx.setContents({
          html: km.globalData.diary[thee.data.idx].content,
        });
      }
    }); //.then(res=>{
    // console.log('123')
    //})

  },
  blur() {
    this.editorCtx.blur();
  },
  format(e) {
    let { name, value } = e.target.dataset;
    if (!name) {
      return;
    }
    // console.log('format', name, value)
    this.editorCtx.format(name, value);
  },
  onStatusChange(e) {
    const formats = e.detail;
    this.setData({ formats });
  },
  insertDivider() {
    this.editorCtx.insertDivider({
      success: function () {
        // console.log('insert divider success')
      }
    });
  },
  clear() {
    this.editorCtx.clear({
      success: function (res) {
        // console.log("clear success")
      }
    });
  },
  removeFormat() {
    this.editorCtx.removeFormat();
  },
  insertDate() {
    const date = new Date();
    const formatDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    this.editorCtx.insertText({
      text: formatDate
    });
  },
  insertImage() {
    const that = this
    wx.chooseImage({
      count: 1,
      fail(rws) {
        wx.showToast({
          title: '上传失败！',
          icon: 'none',
        });
      },
      success: function (res) {
        var tempPath = res.tempFilePaths;
        var tempf = tempPath[0].split('.');
        var suffix = tempf[tempf.length - 1];
        var hp = 'postpic/' + String(that.data.now_id) + '_' + String(that.data.img_num) + '.' + suffix;
        var whp = km.globalData.pathc + hp;
        // console.log(tempf, whp)
        if (tempPath.length <= 0) {
          wx.showToast({
            title: '你没有选中图片！',
            icon: 'none',
          });
          return;
        }
        wx.showLoading({
          title: '上传中',
        })
        wx.cloud.uploadFile({
          filePath: res.tempFilePaths[0],
          cloudPath: hp,
          success: function (ret) {
            // console.log('succc', hp)
            that.editorCtx.insertImage({
              src: whp, //res.tempFilePaths[0],
              // data: {
              //   id: 'abcd',
              //   role: 'god'
              // },
              width: '50%',
              success: function () {
                // console.log('insert image success')
                that.setData({
                  img_num: 1 + that.data.img_num,
                })
                wx.hideLoading({
                  success: (res) => { },
                })
              },
              fail(rws) {
                wx.showToast({
                  title: '载入失败！',
                  icon: 'none',
                });
                wx.hideLoading({
                  success: (res) => { },
                });
              },
            })
            wx.hideLoading({
              success: (res) => { },
            });
          },
          fail: function (rwt) {
            wx.showToast({
              title: '上传失败！',
              icon: 'none',
            });
            wx.hideLoading({
              success: (res) => { },
            });
          },
        })
      }
    })
  },
  getEditorValue(e) {
    this.setData({
      articleContent: e.detail.html
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