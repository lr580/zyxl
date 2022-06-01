import * as io from '../common/io';
import * as randoms from '../common/randoms'; //要import一下不然不会加载重载函数
export function fitOptions(handler, options) {
    // io.out(options);
    let problems = getApp().globalData.problems;
    let filted = []
    if (options.vid) {
        for (let i = 0; i < problems.length; ++i) {
            if (problems[i][2] == Number(options.vid)) {
                filted.push(JSON.parse(JSON.stringify(problems[i]))); //数组深复制
            }
        }
    }
    filted.shuffle();
    handler.setData({
        problems: filted,
        nowIndex: 0,
        nowAnswers: [],
        ac: 0,
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