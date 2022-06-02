import * as io from '../common/io';
import * as randoms from '../common/randoms'; //要import一下不然不会加载重载函数

function history_map(history, index_map) {
    let map = [];
    for (let i = 0; i < history.length; ++i) {
        map[index_map[history[i][0]]] = history[i][1];
    }
    return map;
}

export function fitOptions(handler, options = {}) {
    if (!options) {
        options = {};
    }

    let problems = getApp().globalData.problems;
    let videos = getApp().globalData.info_video;
    let history = getApp().globalData.info_user.answers;

    let filted = [];
    let index_map = []; //题库index对应到页面index
    let index_cnt = 0;
    for (let i = 0; i < problems.length; ++i) {
        if (options.vid && problems[i][2] != Number(options.vid)) {
            continue;
        }
        if (options.type && videos[problems[i][2]].type != Number(options.type)) {
            continue;
        }
        filted.push(JSON.parse(JSON.stringify(problems[i]))); //数组深复制
        filted[filted.length - 1][6] = videos[problems[i][2]].type;
        filted[filted.length - 1][7] = i; //存储数据库用的主键(即index)
        filted[filted.length - 1][8] = [];
        for (let j = 0; j < problems[i][5].length; ++j) { //选项打乱
            filted[filted.length - 1][8].push(j);
        }
        index_map[i] = index_cnt++;
    }
    if (options.vid || options.combat) {
        filted.shuffle();
    }
    for (let i = 0; i < filted.length; ++i) { //目前设计恒打乱选项
        filted[i][8].shuffle();
        let temp = JSON.parse(JSON.stringify(filted[i][5]));
        for (let j = 0; j < filted[i][8].length; ++j) {
            filted[i][5][j] = temp[filted[i][8][j]];
        }
    }

    if (options.combat) {
        filted = filted.slice(0, 5);
    }
    let nowIndex = 0;
    if (options.index) {
        nowIndex = index_map[Number(options.index)];
    }
    let nowAnswers = [];
    let keepMemory = false;
    let ac = 0;
    if (!options.vid && !options.combat) {
        nowAnswers = history_map(history, index_map);
        keepMemory = true;
        for (let i = 0; i < filted.length; ++i) {
            ac += filted[i][3] == nowAnswers[i];
        }
    }

    handler.setData({
        problems: filted,
        nowIndex: nowIndex,
        nowAnswers: nowAnswers,
        ac: ac,
        types: getApp().globalData.type_p,
        keepMemory: keepMemory,
        topIndex: nowIndex, //控制是否显示下一题按钮
    });
}

var col = null;
var _ = null;
var db = null;

function get_col() {
    if (!col) {
        col = wx.cloud.database().collection('user');
        _ = wx.cloud.database().command;
        db = wx.cloud.database();
    }
}

export function bindNextProblem(handler) { //绑定题目提交和上下题切换
    handler.submit = async function () {
        let answers = handler.data.input.answer;
        let problems = handler.data.problems;
        let nowIndex = handler.data.nowIndex;
        let ans = 0;
        for (let i = 0; i < answers.length; ++i) {
            ans += 1 << (problems[nowIndex][8][answers[i]]);
            // ans += 1 << (Number(answers[i]));//选项未打乱前
        }
        let nowAnswers = handler.data.nowAnswers;

        if (handler.data.keepMemory) {
            get_col();
            let openid = getApp().globalData.openid;
            try {
                let userAnswers = getApp().globalData.info_user.answers;
                userAnswers.push([problems[nowIndex][7], ans]);
                await col.doc(openid).update({
                    data: {
                        answers: userAnswers,
                        // _.push({
                        //     each: [handler.data.problems[nowIndex][7], ans]
                        // }),
                    }
                });
                getApp().globalData.info_user.answers = userAnswers;
            } catch (err) {
                io.err(err);
            }
        }

        nowAnswers[nowIndex] = ans;
        let input = handler.data.input;
        input.answer = []; //清空输入，防止跳题变成用上一次的记忆选项
        handler.setData({
            nowAnswers: nowAnswers,
            nowIndex: nowIndex + 1,
            topIndex: Math.max(nowIndex + 1, handler.data.topIndex),
            problems: problems, //强制刷新下拉列表
            ac: handler.data.ac + (ans == problems[nowIndex][3]),
            input: input,
        });
    };
    handler.rollback = function () {
        handler.setData({
            nowIndex: handler.data.nowIndex - 1,
        });
    };
    handler.rollnext = function () {
        handler.setData({
            nowIndex: handler.data.nowIndex + 1,
        });
    };
}

export function helpClearall(handler) {
    handler.clearAll = async function () {
        let res = await wx.showModal({
            title: '警告',
            content: '这将会删除您的全部做题记录，确认删除吗？'
        });
        if (res.confirm) {
            get_col();
            let openid = getApp().globalData.openid;
            try {
                await col.doc(openid).update({
                    data: {
                        answers: [],
                    }
                });
                getApp().globalData.info_user.answers = [];
                fitOptions(handler);
            } catch (err) {
                io.err(err);
            }
        }
    };
}