//app.js
// const km = getApp() //即this, app.js外均可这么使用
var db = '';
var _;
import * as io from '/js/common/io';

var now_loading = 0; //需要batch_read等所有数据库读取异步多少次
var total_loading = 4;
/* total_loading 分别如下：
 * 读取自己的信息， 读取剧场列表， 读取树洞列表， 读取树洞用户列表
 */

var click_busy = false; //是否处于禁止频繁点击状态
var cloudfx_done = false; //已经getOpenId
var loaduser_done = false; //是否加载用户完毕

App({
    onLaunch: function () {
        const thee = this;

        //若load_video等函数是局部函数，即var load_video = function(){...} 可用thee
        //如果load_video换成与onLaunch并列的函数，会导致thee不可用，但是可以用getApp()替代

        // wx.setEnableDebug({
        //   enableDebug: false,
        // }).then(res => { }).catch(rws => { console.error('调试开启失败(lr580:真机模式外请忽略该条报错)', rws) });//真机模式外请忽略该条报错

        wx.showLoading({
            title: '加载中……',
            mask: true,
            success: (res) => {},
            fail: (res) => {},
            complete: (res) => {},
        });

        if (!wx.cloud) {
            console.error('请使用 2.2.3 或以上的基础库以使用云能力')
        } else {
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                env: 'cloud1-5gb77mtq8dcc1698',
                traceUser: true,
            }).then(rea => {
                db = wx.cloud.database();
                _ = db.command;
                thee.load_global();
            }).catch(rwa => {
                console.error('读取数据失败，请检查网络。', rwa)
            });
        }

        wx.cloud.callFunction({
            name: 'getOpenId',
        }).then(res => {
            let openid = res.result.userInfo.openId;
            getApp().globalData.openid = openid;
            cloudfx_done = true; //修复了又一个bugs
            if (db && !loaduser_done) {
                this.load_user(openid);
            }
        }).catch(rws => {
            console.error('获取用户openid失败', rws);
        });

        this.globalData = {
            cloudpath: 'cloud://cloud1-5gb77mtq8dcc1698.636c-cloud1-5gb77mtq8dcc1698-1307133896',
            type_p: ['心理', '生活', '青春', '卫生', '安全', '全部'],
            info_video: [],
            num_video: 0,
            batch: 20, //每次向数据库的最大读取批次
            openid: '',
            info_user: null,
            info_up: [],
            info_recommend: [],
            num_recommend: 4,
            info_placard: [],
            info_post: [],
            info_users: [],
            num_post: 0,
            num_user: 0,
            num_newmessage: 0,
            info_goods: [],
            problems: [],
            // cover_loaded: false,
        }
    },

    //用户信息获取和自动登录尝试
    load_user(openid) {
        loaduser_done = true;
        let km = getApp();
        db.collection('user').doc(openid).get().then(res => {
            if (res.data._openid == openid) {
                km.globalData.info_user = res.data;
                let cnt = 0;
                for (let i = 0; i < res.data.message.length; ++i) {
                    if (res.data.message[i][0]) {
                        ++cnt;
                    }
                }
                km.globalData.num_newmessage = cnt;
            }
            if (++now_loading == total_loading) {
                km.init_finish();
            }
        }).catch(rws => {
            if (++now_loading == total_loading) {
                km.init_finish();
            }
        });
    },

    //通用函数：批量获取某集合编号id从0到n-1的数据对象，存在全局变量key上
    batch_read(setname, n, key) {
        let km = getApp();
        let epoch = km.globalData.batch;
        let inq_time = Math.ceil(n / epoch);
        let now_time = 0;
        var all_obj = [];

        const cmp = function () {
            return function (a, b) {
                return Number(a['_id']) - Number(b['_id']);
            }
        }

        var final_operation = function () {
            all_obj.sort(cmp());
            km.globalData[key] = all_obj;
            if (++now_loading == total_loading) {
                km.init_finish();
            }
        };
        if (n == 0) {
            final_operation();
        }

        for (let i = 0; i < inq_time; ++i) {
            var this_batch = []; //这次要读的下标编号
            for (let j = i * epoch; j < Math.min(n, (i + 1) * epoch); ++j) {
                this_batch.push(String(j));
            }
            db.collection(setname).where({
                _id: _.in(this_batch)
            }).get().then(rea => {
                for (let k = 0; k < rea.data.length; ++k) {
                    all_obj.push(rea.data[k]);
                }
                if (++now_time == inq_time) {
                    final_operation();
                }
            }).catch(rwa => {
                console.error('批量读取失败：', setname, n, key, j);
            })
        }
    },

    //通用函数：批量读取某集合数据，数目为n，并以map<_id, 记录>形式存在全局变量key上，集合内排序依据是skey
    set_read(setname, n, key, skey = '_id') {
        let km = getApp();
        let epoch = km.globalData.batch;
        let inq_time = Math.ceil(n / epoch);
        let now_time = 0;
        var all_obj = {};

        var final_operation = function () {
            km.globalData[key] = all_obj;
            if (++now_loading == total_loading) {
                km.init_finish();
            }
        };
        if (n == 0) {
            final_operation();
        }

        for (let i = 0; i < inq_time; ++i) {
            let lf = i * epoch; //从多少开始读
            db.collection(setname).orderBy(skey, 'desc').skip(lf).get().then(rea => {
                for (let k = 0; k < rea.data.length; ++k) {
                    all_obj[rea.data[k]._id] = rea.data[k];
                }
                if (++now_time == inq_time) {
                    final_operation();
                }
            }).catch(rwa => {
                console.error('批量读取失败：', setname, n, key, lf, skey);
            })
        }
    },

    //读取全局数据
    load_global: function () {
        let km = getApp();

        // if (cloudfx_done && !loaduser_done) {
        //   this.load_user(km.globalData.userid);
        // } 这一条异步可能会出错，干脆舍弃优化删掉这个异步了

        db.collection('global').doc('default').get().then(res => {
            km.globalData.num_video = res.data.num_video;
            km.globalData.info_up = res.data.up;
            km.globalData.info_recommend = res.data.recommend;
            km.globalData.num_post = res.data.num_post;
            km.globalData.num_user = res.data.num_user;
            km.globalData.info_goods = res.data.goods;
            km.globalData.problems = res.data.problems;
            km.globalData.forge = res.data.forge;
            km.globalData.type_p = res.data.type_p;
            io.out(km.globalData.forge);
            io.getGlobal('forge', km.handler); 
            let arr_pla = [];
            for (let i = 0; i < res.data.placard.length; ++i) {
                arr_pla.push(km.globalData.cloudpath + '/placard/' + res.data.placard[i]);
            }
            km.globalData.info_placard = arr_pla;

            km.load_video();
            km.set_read('post', km.globalData.num_post, 'info_post');
            km.set_read('user', km.globalData.num_user, 'info_users');
        }).catch(rws => {
            console.error('全局数据获取失败。')
        });
    },

    //全局初始化后让首页做的事情 (让index页面重新赋值该函数)
    indexpage_reload: function () {
        return;
    },

    //全局初始化后让封面做的事情
    coverpage_reload: function () {

    },

    //读取全局数据完毕
    init_finish: function () {
        let km = getApp();
        wx.hideLoading({
            success: (res) => {},
        });
        km.indexpage_reload();
        // km.coverpage_reload();
        // setTimeout(() => {
        //   km.coverpage_reload();
        // }, 1500);
    },

    //读取所有小剧场互动视频文本信息(视频信息不读取)
    load_video: function () {
        this.batch_read('video', getApp().globalData.num_video, 'info_video');
    },

    //通用函数：点击跳转到视频vid (vid是string)
    goto_video: function (vid) {
        let km = getApp();
        wx.navigateTo({
            url: '../video/video?id=' + vid,
        });
        km.add_click('video', vid);
        km.isfirst_browse(vid);
        km.add_record('history_video', vid);
    },

    //通用函数：点击跳转到帖子pid (pid是number)
    goto_post: function (pid) {
        let km = getApp();
        wx.navigateTo({
            url: '../postt/postt?id=' + pid,
        });
        km.add_click('post', pid);
        km.add_record('history_post', pid);
    },

    //通用函数：为用户记录内的s数组添加一则内容[x,time](重复则覆盖),按时间从近到远排序 (不触发加载弹框) 成败回调函数是suc, fail
    add_record: function (s, x, time = new Date, suc = () => {}, fail = () => {}) {
        //因为跟add_click有可能同时操作，所以不在这里触发click_busy了
        let km = getApp();
        if (!km.logined()) {
            return;
        }
        let arr = km.globalData.info_user[s];
        let newarr = [];
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i][0] != x) {
                newarr.push(arr[i]);
            }
        }
        newarr.unshift([x, time]);
        let fix_obj = {};
        fix_obj[s] = newarr;
        km.globalData.info_user[s] = newarr; //修复了bugs
        db.collection('user').doc(km.globalData.openid).update({
            data: fix_obj
        }).then(res => {
            suc();
        }).catch(rws => {
            console.error('用户信息修改失败', s, x, time, rws);
            fail();
        })
    },

    //通用函数：为用户记录内的s数组删除内容[x,time](重复则覆盖),按时间从近到远排序 (不触发加载弹框) 成败回调函数是suc, fail
    del_record: function (s, x, suc = () => {}, fail = () => {}) {
        //因为跟add_click有可能同时操作，所以不在这里触发click_busy了
        let km = getApp();
        let arr = km.globalData.info_user[s];
        let newarr = [];
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i][0] != x) {
                newarr.push(arr[i]);
            }
        }
        let fix_obj = {};
        fix_obj[s] = newarr;
        km.globalData.info_user[s] = newarr;
        db.collection('user').doc(km.globalData.openid).update({
            data: fix_obj
        }).then(res => {
            suc();
        }).catch(rws => {
            console.error('用户信息修改失败', s, x, time, rws);
            fail();
        })
    },

    //通用函数：首次浏览视频时，为用户增加x点积分
    isfirst_browse(vid, x = 1) {
        //因为跟add_click有可能同时操作，所以不在这里触发click_busy了
        let km = getApp();
        if (!km.logined()) {
            return false;
        }
        let arr = km.globalData.info_user.history_video;
        let first = true;
        for (let i = 0; i < arr.length; ++i) {
            if (arr[i][0] == vid) {
                first = false;
                break;
            }
        }
        if (first) {
            db.collection('user').doc(km.globalData.openid).update({
                data: {
                    point: _.inc(x)
                }
            }).then(res => { //该功能在该版本不显示
                km.globalData.info_user.point++; //修复bugs
                // wx.showToast({
                //     title: '首次浏览本视频，获得1点积分！',
                //     icon: 'none', //不然title字显示不完
                //     duration: 3000,
                // });
            }).catch(rws => {
                console.error('增加积分失败：', rws);
            });
        }
    },

    //通用函数：加载用户的x pair数组，保存在页面thee的变量v里，若reverse=true逆序 (目前废置，未来删除)
    load_pair(x, thee, v, reverse = false) {
        let km = getApp();
        let arro = km.globalData.info_user[x];
        let arr = []; //数组强复制，而不是指针指向
        for (let i = 0; i < arro.length; ++i) {
            arr.push(arro[i]);
        }
        if (reverse) {
            arr.reverse();
        }
        let obj = {};
        obj[v] = arr;
        thee.setdata(obj);
    },

    //通用函数：根据帖子对象生成显示文本数组 创建关于主题对象x的部分信息列表(格式同postlist元素)
    make_postinfoabbr(x) {
        let km = getApp();
        let valid_replynum = 0;
        for (let i = 0; i < x.reply.length; ++i) {
            if (km.globalData.info_post[x.reply[i]]) {
                ++valid_replynum;
            }
        }
        return [x.title, x.abbr, km.date2str(x.time_active), x.type, valid_replynum, x.click, x._id, x.time_active];
    },

    //通用函数：配置一个显示pair的thee页面js代码(参数意义见注释)
    init_pair_pagejs(thee, keyname, keych, pfirst = 'video', psecond = 'post') {
        let km = getApp();
        thee.setData({
            sele_bar: 0, //0是pfirst(即互动视频), 1是psecond(即帖子) 
            reverse: false, //若false，按时间从近到远显示，否则从远到近
            arr: [],
            /*当前展示的每一项数组，当sele_bar=0时，元素为[0:标题, 1:分类下标, 2:浏览次数, 3:封面url, 4:最后编辑时间, 5:视频id]*/
            keyname: keyname, //关键字名称
            keych: keych, //关键字中文名
            types: km.globalData.type_p, //分类列表
        });

        //初始化互动视频
        thee.init_pfirst = function () {
            let keyword = keyname + '_' + pfirst;
            let arro = km.globalData.info_user[keyword];
            let arr = [];
            for (let i = 0; i < arro.length; ++i) {
                let x = km.globalData.info_video[arro[i][0]];
                arr.push([x.title, x.type, x.click, km.globalData.cloudpath + '/videoposter/' + x.poster, arro[i][1], Number(x.id)]);
            }
            //理论上arr本身是有序的，不需要特别排序一次了
            if (thee.data.reverse) {
                arr.reverse();
            }
            thee.setData({
                arr: arr,
            });
        };

        //初始化帖子
        thee.init_psecond = function () {
            let keyword = keyname + '_' + psecond;
            let arro = km.globalData.info_user[keyword];
            let arr = [];
            for (let i = 0; i < arro.length; ++i) {
                let x = km.globalData.info_post[arro[i][0]];
                if (!x || x.parent) { //修复bugs：回帖或错误帖子不能单独出现在浏览记录和收藏页面内
                    continue;
                }
                arr.push(km.make_postinfoabbr(x));
            }
            if (thee.data.reverse) {
                arr.reverse();
            }
            thee.setData({
                arr: arr,
            });
        };

        thee.init_pfirst();

        //按照当前sele_bar选择初始化
        thee.init = function () {
            if (thee.data.sele_bar == 0) {
                thee.init_pfirst();
            } else {
                thee.init_psecond();
            }
        };

        //重新进入该页面触发
        thee.onShow = function () {
            thee.init();
        };

        //点击跳转到对应的视频页面
        thee.goto_video = function (v) {
            let vid = v.currentTarget.id;
            km.goto_video(vid);
        };

        //点击跳转到对应的帖子页面
        thee.goto_post = function (v) {
            let vid = Number(v.currentTarget.id);
            km.goto_post(vid);
        };

        //点击切换sele_bar
        thee.switch_bar = function (v) {
            let newv = Number(v.currentTarget.id);

            thee.setData({
                sele_bar: newv,
            });
            if (newv == 0) {
                thee.init_pfirst();
            } else {
                thee.init_psecond();
            }
        };

        //点击切换排序顺序
        thee.switch_reverse = function (v) {
            let newv = Number(v.currentTarget.id);
            let arrnew = thee.data.arr;
            arrnew.reverse();
            thee.setData({
                reverse: newv,
                arr: arrnew,
            });
        };
    },

    //通用函数：配置一个预约页面js代码(参数意义见注释)
    init_appointmentjs(thee, aname, ach, kfirst = 'appointment') {
        let km = getApp();
        let key = kfirst + '_' + aname;
        let openid = km.globalData.openid;

        //将date x转换为picker要求的时间格式
        thee.date2str = function (x = new Date) {
            return km.date2str(x, 2);
        };

        thee.init = function () {
            let ma = km.globalData.info_user[key].map(x => {
                return new Date(x);
            });
            thee.setData({
                my_appointment: ma, //由已经预约的时间戳数组转换的日期对象数组
                my_timestr: ma.map(x => {
                    return km.date2str(x, 1);
                }), //由日期对象数组转换的字符串日期(年月日星期)数组
                aname: aname, //数组库字段后半段名
                ach: ach, //字段的显示名字
                busy: false, //禁止频繁点击
                nowdate: thee.date2str(), //当前选择时间 yyyy-mm-dd 字符串
                nowdatestr: km.date2str(new Date, 1), //当前选择时间 yyyy:mm:dd 星期 字符串
                //上一行thee改成km修复了bugs
                today: thee.date2str(), //今天的 yyyy-mm-dd 字符串
            });
            // console.log(thee.data.nowdate, thee.data.nowdatestr, thee.date2str(new Date, 1));
        };
        thee.init();

        thee.cancel = function (e) {
            if (thee.data.busy) {
                wx.showToast({
                    title: '请勿频繁点击！',
                    icon: 'none',
                });
                return;
            }
            let id = Number(e.currentTarget.id);
            let v = Number(thee.data.my_appointment[id]);
            let obj = {};
            obj[key] = _.pull(v);
            wx.showLoading({
                title: '取消中……',
            });
            let debusy = function () {
                wx.hideLoading({
                    success: (res) => {},
                });
                thee.setData({
                    busy: false,
                });
            };
            db.collection('user').doc(openid).update({
                data: obj,
            }).then(res => {
                km.globalData.info_user[key].splice(km.globalData.info_user[key].indexOf(v), 1);
                debusy();
                thee.init();
            }).catch(rws => {
                console.error('取消失败！', rws);
                debusy();
            });
        };

        //选择日期
        thee.sele_date = function (e) {
            // console.log(e);
            thee.setData({
                nowdate: e.detail.value,
                nowdatestr: km.date2str(km.str2date(e.detail.value), 1),
            })
        };

        //确认预约
        thee.appoint = function () {
            let vobj = km.str2date(thee.data.nowdate);
            let v = Number(vobj);
            let na = km.globalData.info_user[key];
            let week = vobj.getDay();
            if (week <= 0 || week >= 6) {
                wx.showToast({
                    title: '不可以预约周六周日！',
                    icon: 'none',
                });
                return;
            }
            if (na.indexOf(v) != -1) {
                wx.showToast({
                    title: '您已预约该日期，不可重复预约！',
                    icon: 'none',
                });
                return;
            }
            if (thee.data.busy) {
                wx.showToast({
                    title: '请勿频繁点击！',
                    icon: 'none',
                });
                return;
            }
            let obj = {};
            obj[key] = _.unshift(v);
            wx.showLoading({
                title: '预约中……',
            });
            let debusy = function () {
                wx.hideLoading({
                    success: (res) => {},
                });
                thee.setData({
                    busy: false,
                });
            };
            db.collection('user').doc(openid).update({
                data: obj,
            }).then(res => {
                km.globalData.info_user[key].unshift(v);
                debusy();
                thee.init();
            }).catch(rws => {
                console.error('预约失败！', rws);
                debusy();
            });
        };
    },

    //通用函数：检查频繁点击并返回状态
    check_busy: function () {
        if (click_busy) {
            wx.showToast({
                title: '请勿频繁点击！',
                duration: 1500,
                icon: 'none',
            });
        }
        return click_busy;
    },

    //通用函数：触发频繁点击(当可触发时返回true，否则返回false)
    triggle_busy: function () {
        if (this.check_busy()) {
            return false;
        }
        click_busy = true;
        return true;
    },

    //通用函数，为集合setname的记录x的字段click增加y，若tb触发频繁点击警报
    add_click: function (setname, x, y = 1, tb = true) {
        if (tb) {
            if (!this.triggle_busy()) {
                return;
            }
        }
        //理论上这个操作是极快的，会快于用户频繁点击的频率，但还是要保险起见
        db.collection(setname).doc(x).update({
            data: {
                click: _.inc(y)
            }
        }).then(res => {
            if (tb) {
                click_busy = false;
            }
        }).catch(rws => {
            console.error('增加次数失败：', setname, x);
            if (tb) {
                click_busy = false;
            }
        });
    },

    //通用函数：在元素为[x,y]的数组a(x不重复)内查找是否存在x，返回下标或-1(查不到)
    find_in_pair: function (a, x) {
        for (let i = 0; i < a.length; ++i) {
            if (a[i][0] == x) {
                return i;
            }
        }
        return -1;
    },

    //通用函数：监测用户是否已经登录
    logined: function () {
        let km = getApp();
        return km.globalData.info_user != null;
    },

    //通用函数，传入date，返回年月日(type=1 +星期)(+时分 type=0) (年月日- type=2)的格式化文本
    date2str: function (x, type = 0) {
        let s = '',
            t = '';
        s += String(x.getFullYear());
        s += type == 2 ? '-' : '/';
        t = String(x.getMonth() + 1);
        if (t.length <= 1) {
            s += '0' + t;
        } else {
            s += t;
        }
        s += type == 2 ? '-' : '/';
        t = String(x.getDate());
        if (t.length <= 1) {
            s += '0' + t;
        } else {
            s += t;
        }
        if (type != 0) {
            if (type == 1) {
                let weekch = '日一二三四五六日';
                s += ' 星期' + weekch[x.getDay()];
            }
            return s;
        }
        s += ' ';
        t = String(x.getHours());
        if (t.length <= 1) {
            s += '0' + t;
        } else {
            s += t;
        }
        s += ':';
        t = String(x.getMinutes());
        if (t.length <= 1) {
            s += '0' + t;
        } else {
            s += t;
        }
        return s;
    },

    //通用函数：将picker格式string x转换为date
    str2date: function (x) {
        let tx = x.match(/(\d+)\-(\d+)-(\d+)/);
        let yy = Number(tx[1]);
        let mm = Number(tx[2]) - 1;
        let dd = Number(tx[3]);
        return new Date(yy, mm, dd);
    },
})