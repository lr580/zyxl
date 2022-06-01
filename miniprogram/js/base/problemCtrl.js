import * as io from '../common/io';
import * as randoms from '../common/randoms'; //要import一下不然不会加载重载函数

function history_map(history, index_map) {
    let map = [];
    for (let i = 0; i < history.length; ++i) {
        map[index_map[history[i][0]]] = history[i][1];
    }
    return map;
}

export function fitOptions(handler, options) {
    // io.out(options);
    let problems = getApp().globalData.problems;
    let videos = getApp().globalData.info_video;
    let history = getApp().globalData.info_user.answers;
    // io.out(history);

    // io.out(videos);
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
        index_map[i] = index_cnt++;
    }
    if (options.vid) {
        filted.shuffle();
    }
    let nowIndex = 0;
    if (options.index) {
        nowIndex = index_map[Number(options.index)];
    }
    let nowAnswers = [];
    let keepMemory = false;
    if (options.type) {
        nowAnswers = history_map(history, index_map);
        keepMemory = true;
    }

    // io.out(filted);
    handler.setData({
        problems: filted,
        nowIndex: nowIndex,
        nowAnswers: nowAnswers,
        ac: 0,
        types: getApp().globalData.type_p,
        keepMemory: keepMemory,
    });
}

export function bindNextProblem(handler) {
    handler.submit = function () {
        let answers = handler.data.input.answer;
        let ans = 0;
        for (let i = 0; i < answers.length; ++i) {
            ans += 1 << (Number(answers[i]));
        }
        let nowAnswers = handler.data.nowAnswers;
        let nowIndex = handler.data.nowIndex;
        nowAnswers[nowIndex] = ans;
        let input = handler.data.input;
        input.answer = [];
        handler.setData({
            nowAnswers: nowAnswers,
            nowIndex: nowIndex + 1,
            problems: handler.data.problems, //强制刷新下拉列表
            ac: handler.data.ac + (ans == handler.data.problems[nowIndex][3]),
            input: input,
        });
    }
}