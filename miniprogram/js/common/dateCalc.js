//日期处理专用
//因为存一个Date类到数据库内时计算起来麻烦，所以想要自己手写Date(字符串yyyymmddhhmmss)
let author = 'lr580'; //调试用，以后会删除

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //⽉份
        "d+": this.getDate(), //⽇
        "h+": this.getHours(), //⼩时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.lenngth == 1) ?
                (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

const format = 'yyyyMMddhhmmss';
const formatNum = 10000000000000;

function Date2Str(src) { //假设src一定是Date
    return parseInt(src.format(format));
}

function Str2Date(src) { //假设src为正确格式的number/string
    src = parseInt(src);
    while (src < formatNum) {
        src *= 10;
    }
    let ss = Math.floor(src % 100);
    src = Math.floor(src / 100);
    let mm = Math.floor(src % 100);
    src = Math.floor(src / 100);
    let hh = Math.floor(src % 100);
    src = Math.floor(src / 100);
    let dd = Math.floor(src % 100);
    src = Math.floor(src / 100);
    let MM = Math.floor(src % 100);
    src = Math.floor(src / 100);
    let yy = Math.floor(src % 10000);
    return new Date(yy + '-' + MM + '-' + dd + ' ' + hh + ':' + mm + ':' + ss);
}

export {
    author, //调试用，以后会删除
    Date2Str,
    Str2Date
};

export function get_ymd(v) {
    return {
        yy: v.getFullYear(),
        mm: v.getMonth() + 1,
        dd: v.getDate(),
    };
}

export function get_ymdhms(v) {
    return {
        yy: v.getFullYear(),
        MM: v.getMonth() + 1,
        dd: v.getDate(),
        hh: v.getHours(),
        mm: v.getMinutes(),
        ss: v.getSeconds(),
    };
}

export function print(v, type = 0) {
    if (v == 0) {
        return '未设置';
    }
    v = new Date(v);
    if (type == 0) {
        return v.format('yyyy-MM-dd');
    } else if (type == 1) {
        return v.format('yyyy-MM-dd hh:mm:ss');
    } else {
        return '';
    }
}

export function outMili(timestamp) { //精度100ms，以后有需要再改别的精度
    timestamp = Number(timestamp);
    let mili = Math.floor(timestamp % 1000 / 100 + 0.04);
    let sec = Math.floor(timestamp / 1000 + 0.04);
    return '' + sec + '.' + mili + 's';
}

export function helpTimer(handler, varname = 'timer', interval = 100) {
    let cycler_name = 'set_' + varname;
    handler[cycler_name] = function () {
        let wrap = {};
        wrap[varname] = handler.data[varname] + interval;
        wrap[varname + '_show'] = outMili(wrap[varname]);
        handler.setData(wrap);
    };

    let init_cycler_name = 'init_' + varname;
    handler[init_cycler_name] = function () {
        let wrap = {};
        wrap[varname] = 0;
        wrap[varname + '_show'] = outMili(0);
        handler.setData(wrap);
        let cycler_id_name = 'id_' + varname;
        handler[cycler_id_name] = setInterval(handler[cycler_name], interval);
    }

    let stop_cycler_name = 'stop_' + varname;
    handler[stop_cycler_name] = function () {
        clearInterval(handler['id_' + varname]);
    }
}