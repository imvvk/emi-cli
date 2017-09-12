/**
 * yyyy-MM-dd HH:mm
 * @param {Date| number | str} dataStr
 * @param {Object} pattern
 */
    var d = {
            buildDate: function(str) {
                if (typeof(str) == "number") {
                    return new Date(str);
                } else if (str instanceof Date) {
                    return str;
                }
                if (!str) {
                    return null;
                }
                if (str.indexOf("+") >= 0) {
                    str = str.replace("+0800 ", "");
                }
                str = str.replace(/-/g, "/");
                return new Date(str);
            },
            /**
             * yyyy-MM-dd HH:mm
             * @param {Date| number | str} dataStr
             * @param {Object} pattern
             */
            format: function(dataStr, pattern) {
                var date = this.buildDate(dataStr);
                var hour = date.getHours();
                var o = {
                    "M+": date.getMonth() + 1, //month
                    "d+": date.getDate(), //day
                    "H+": hour, //hour
                    "h+": (hour > 12 ? hour - 12 : hour), //hour
                    "m+": date.getMinutes(), //minute
                    "s+": date.getSeconds(), //second
                    "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
                    "S": date.getMilliseconds() //millisecond
                }
                if (/(y+)/.test(pattern)) {
                    pattern = pattern.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
                }
                for (var k in o)
                    if (new RegExp("(" + k + ")").test(pattern)) {
                        pattern = pattern.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                    }
                return pattern;
            },
            getChineseDate: function(tar, res) {

                if (!res) {
                    res = new Date();
                }
                if (typeof(tar) == "string") {
                    tar = this.buildDate(tar)
                }
                if (!tar || !tar.getTime()) {
                    return "";
                }
                var resTime = res.getTime();
                var tarTime = tar.getTime();
                var between = (resTime - tarTime) / 1000;
                return this.between(between) + "前";
            },
            between: function(bet) {
                bet = Math.abs(parseInt(bet));
                bet = bet == 0 ? 1 : bet;
                if (bet < 60) {
                    return bet + "秒";
                }
                if (bet < 3600) {
                    return parseInt(bet / 60) + "分钟";
                }
                if (bet < 3600 * 24) {
                    return parseInt(bet / 3600) + "小时";
                }
                if (bet < 3600 * 24 * 30) {
                    return parseInt(bet / (3600 * 24)) + "天";
                }
                if (bet < 3600 * 24 * 30 * 12) {
                    return parseInt(bet / (3600 * 24 * 30)) + "月";
                }
                return parseInt(bet / (3600 * 24 * 30 * 12)) + "年"
            },
            /**
             * 剩余多少时间
             * 1天20小时15分20秒
             * @param {Object} second
             */
            liveTime: function(second) {

            },
            /**时间差*/
            differenceTime: function(second, str, flag) {
                var m = parseInt(second / 60);
                var h = parseInt(m / 60);
                var s = second % 60;
                m = m < 10 ? "0" + m : m;
                s = s < 10 ? "0" + s : s;
                if (!/h+/.test(str)) {
                    var o = {
                        'm+': m,
                        's+': s
                    }
                    for (var k in o)
                        if (new RegExp("(" + k + ")").test(str)) {
                            str = str.replace(RegExp.$1, o[k]);
                        }
                } else {
                    h = h < 10 ? "0" + h : h;
                    m = m % 60;
                    m = m < 10 ? "0" + m : m;
                    var o = {
                        'h+': h,
                        'm+': m,
                        's+': s
                    }
                    for (var k in o)
                        if (new RegExp("(" + k + ")").test(str)) {
                            str = str.replace(RegExp.$1, o[k]);
                        }
                }
                if (h == 0 && flag === true) {
                    return str.substr(3, 7);
                }
                return str;
            },
            getUTCDate: function(date) {
                // date = this.buildDate(date);
                // // date = new Date(date)
                // console.log(date)
                // return date

                var dateArr = date.split(' ');
                dates = dateArr[0].split('-')

                if (dateArr[1]) {
                    var times = dateArr[1].split(':')
                    return new Date(
                        dates[0], dates[1]-1, dates[2], times[0], times[1], times[2]
                    );

                }

                return new Date(
                    dates[0], dates[1] - 1, dates[2]
                );
            }
        }
        // console.log(d.getUTCDate('2014-11-20').getMonth())
    module.exports = d;

