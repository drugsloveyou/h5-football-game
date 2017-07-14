/**
 * 
 * @authors xiezuobing
 * @date    2017-07-11 11:42:52
 * @version v1.0
 */

function FootBallGame(options) {
    // var can = document.getElementById('can');
    // var context = can.getContext('2d');
    // can.width = document.documentElement.clientWidth;
    // can.height = document.documentElement.clientHeight;

    for (var key in options)
        if (options[key] !== undefined && key in this.options) this.options[key] = options[key];

    this.init();
    return this;
}

$.extend(FootBallGame.prototype, {
    timer: getAniFootBall(),
    socket: io('http://192.168.238.22:8360'),
    animation: new Animation(),
    options: { //参数
        path: 'img/player/', //球员图片路径
        onClickPower: noop, //当被点击时
    },
    hadJoinplayer: { //已经参加过得运动员
        blueTeam: [],
        redTeam: []
    },
    currentPlayer: { //当前参加运动员
        redTeamClass: '',
        blueTeamClass: '',
        redTeam: null,
        blueTeam: null
    },
    power: { //蓄力
        maxPower: 30,//最大蓄力值
        minPower: 20,//最小蓄力值
        left: 0,
        max: 0,
        speed: 0.7,
        timer: null,
        derection: 1
    },
    pkProcess: [], //pk的日志进程
    dom: {
        //登录相关
        loginWrap: '.login-wrap', //登录层
        loginTeam: '.login-team', //选择的队伍
        loginMatchBtn: '.login-match-btn', //进入比赛按钮
        loginUsernameText: '.login-username-text', //用户名

        //蓄力
        powerWrap: '.power-wrap', //蓄力
        storagePower: '.storage-power', //滚动区域
        powerBall: '#powerBall', //球
        storageNumber:'#storage-number',//蓄力值显示

        //比赛主界面元素
        matchMain: '.match-main', //比赛主界面
        matchBall: '.match-ball', //比赛用球
        matchStatus: '.match-status', //比赛状态
        playerWrap: '.player-wrap', //比赛场地
        playersLeft: '.player-list.left>li>img', //左边球员
        playersRight: '.player-list.right>li>img', //右边球员
        playerListLeft: '.player-list.left', //左边球员
        playerListRight: '.player-list.right', //左边球员
        winnnerWrap: '.winnner-wrap', //赢球展示
        countWrap: '.count-wrap', //计分板
        rateCountWrap: '.rate-count-wrap',//最终显示的计分板

        liveProcessWrap: '.live-process-wrap' //日志容器
    },
    getRadios: function() {
        width = width || 750;
        return document.documentElement.clientWidth / width
    },
    compatible: function() { //兼容处理
        window.requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
        window.cancelAnimationFrame = window.cancelAnimationFrame ||
            window.mozCancelAnimationFrame;
    },
    init: function() {
        this.compatible();
        // this.storagePower();
        this.bindEvent();
    },
    resize: function(width) {

    },
    storagePower: function(reset) {
        var self = this;
        var ball = $(self.dom.powerBall),
            parent = ball.parent(),
            PWidth = parent.width(),
            BWidth = ball.width();
        if (reset) {
            self.power.left = 0;
            self.power.derection = 1;
        }
        self.power.max = PWidth - BWidth;

        function count() {
            self.power.derection = (self.power.left > self.power.max && self.power.derection == 1) ? -1 : (self.power.left < 0 && self.power.derection == -1) ? 1 : self.power.derection;
            ball.css({
                left: (self.power.left += self.power.derection * 10 * self.power.speed) + 'px',
            });
            $(self.dom.storageNumber).html(Math.ceil((self.power.minPower + (self.power.maxPower - self.power.minPower) * self.power.left / self.power.max)))
            self.power.timer = requestAnimationFrame(count);
        }
        self.power.timer = requestAnimationFrame(count);
    },
    clearTimer: function(timer) {
        clearInterval(timer);
        clearTimeout(timer);
        cancelAnimationFrame(timer);
        timer = null;
    },
    //时间绑定
    bindEvent: function() {
        var self = this;
        $(self.dom.storagePower).click(function() {
            self.clearTimer(self.power.timer);
            self.power.timer = null;
            self.adduserpower(Math.ceil(self.power.left / self.power.max * 100));
        });
        window.addEventListener('resize', self.resize, false);
        $(self.dom.loginMatchBtn).click(self.login.bind(self)); //登录
        self.socket.on('login', self.onlogin.bind(self)); //登录回调
        self.socket.on('rest', self.onRest.bind(self)); //比赛未开始
        self.socket.on('start', self.onStart.bind(self)); //当比赛开始
        self.socket.on('select', self.onSelect.bind(self)); //选择队员
        self.socket.on('pk', self.onPk.bind(self)); //单局比赛结束
        self.socket.on('pk-end', self.onPkEnd.bind(self)); //单局比赛结束
        self.socket.on('end', self.onMatchEnd.bind(self)); //整局比赛结束
        self.socket.on('userpower', self.onAddUserpower.bind(self)); //用户收到蓄力值
        self.socket.on('userjoin', self.onUserjoin.bind(self)); //用户加入
        self.socket.on('userleft', self.onUserleft.bind(self)); //用户离开
    },
    pop: function(msg, callback) {
        var self = this;
        var span = $('<span class="msg-pop ani-pop">' + msg + '</span>');
        self.animation.addAnimEvent(span[0], function() {
            span.remove();
            callback && callback();
        });
        $(document.body).append(span);
    },
    //一下是游戏开始相关的
    onRest: function(data) {
        $(this.dom.mathcStatus).html('比赛尚未开始,请耐心等待...').removeClass('hide');
    },
    login: function() {
        var self = this;
        if(!$(self.dom.loginUsernameText).val().trim()) {
            return alert('请输入用户名');
        }
        loginData = {
            userName: $(self.dom.loginUsernameText).val(),
            userTeam: $(self.dom.loginTeam).val(),
        }
        self.socket.emit('adduser', loginData);
        $(self.dom.loginWrap).addClass('hide');
        $(self.dom.powerWrap).removeClass('hide');
        self.storagePower(); //开始蓄力值得动画
        clearInterval(self.timer);
    },
    onlogin: function(data) { //登录回调
        var self = this;
        self.updateView(data);
        self.updateProceeView(data.userData.userName,'进入了游戏');
        self.updateProceeView(data.userData.userName,'支持了' + (data.userData.userTeam == 'red' ? "<span class=\"fcolorred\">红队</span>" : "<span class=\"fcolorblue\">蓝队</span>"));
        //初始化界面
    },
    adduserpower: function(pencent) {
        var self = this;
        var max = self.power.maxPower,
            min = self.power.minPower;
        var power =  Math.ceil((min + (max - min) * pencent / 100));
        self.socket.emit('adduserpower', power);
        $(self.dom.powerWrap).addClass('hide');

    },
    onStart: function(data) {
        var self = this;
        this.pop('比赛开始！');
        self.updateProceeView('比赛开始！');
        $(self.dom.matchStatus).addClass('hide');

        //以下重置
        $(self.dom.rateCountWrap).removeClass('animated fadeIn').addClass('hide');
        $(self.dom.winnnerWrap).removeClass('animated fadeIn').addClass('hide');
        $(self.dom.matchStatus).removeClass('hide')
        $(self.dom.playerWrap).addClass('hide');
        //更新界面
        self.updateView(data.data);
    },
    onSelect: function(data) {
        var self = this;
        self.updateProceeView('<span class="fcolorred">红队：' + data.data.pkData.redTeam + '号队员</span> vs <span class="fcolorblue">蓝队：' + data.data.pkData.blueTeam + '号队员</span>');
        var redTeam = self.cacheRandom(self.hadJoinplayer.redTeam, 5);
        var blueTeam = self.cacheRandom(self.hadJoinplayer.blueTeam, 5);
        self.currentPlayer.redTeam = $(self.dom.playersLeft).eq(redTeam - 1);
        self.currentPlayer.blueTeam = $(self.dom.playersRight).eq(blueTeam - 1);
        self.currentPlayer.redTeamClass = 'ply' + redTeam;
        self.currentPlayer.blueTeamClass = 'ply' + blueTeam;
        $(self.dom.playerWrap).addClass('pking');
        $(self.dom.playerListLeft).addClass(self.currentPlayer.redTeamClass);
        $(self.dom.playerListRight).addClass(self.currentPlayer.blueTeamClass);
    },
    onPk: function(data) {
        var self = this;
        self.pop('开始PK');
        self.updateProceeView('开始PK~');
        $(self.dom.playerWrap).removeClass('pking');
        var flag = $(self.dom.matchBall).hasClass('right');

        var redParent;
        if (flag) {
            redParent = self.currentPlayer.blueTeam.parent().addClass('ani-play-right');
            self.currentPlayer.redTeam.parent().addClass('ani-around');
        } else {

            redParent = self.currentPlayer.redTeam.parent().addClass('ani-play');
            self.currentPlayer.blueTeam.parent().addClass('ani-around');
        }
        $(self.dom.matchBall).removeClass('hide');

        self.animation.addAnimEvent(redParent[0], function() {

            var endClass;
            if (flag) {
                endClass = data.data.pkData.pkResult == 'blue' ? 'ani-ballIn' : 'ani-ballOut';
            } else {
                endClass = data.data.pkData.pkResult == 'red' ? 'ani-ballIn' : 'ani-ballOut';
            }
            $(self.dom.matchBall).addClass(endClass.split(/\-/)[1]);
            $(self.dom.matchBall).addClass(endClass);
            var matchBall = $(self.dom.matchBall)[0];

            self.animation.addAnimEvent(matchBall, function() {
                if (flag) {
                    self.currentPlayer.redTeam.parent().removeClass('ani-around');
                } else {
                    self.currentPlayer.blueTeam.parent().removeClass('ani-around');
                }
                if (data.data.pkData.pkResult == 'red') {
                    $(self.dom.winnnerWrap).html('红队 <img src="' + self.currentPlayer.redTeam.attr('src') + '"> 胜利').addClass('animated fadeIn').removeClass('hide').removeClass('blue');
                } else {
                    $(self.dom.winnnerWrap).html('蓝队 <img src="' + self.currentPlayer.blueTeam.attr('src') + '"> 胜利').addClass('animated fadeIn').removeClass('hide').addClass('blue');
                }
            });
        })
    },
    onPkEnd: function(data) {
        var self = this;
        self.updateProceeView('单局PK结束~' + (data.data.pkResult == "red" ? " <span class=\"fcolorred\">红队胜利</span>" : " <span class=\"fcolorblue\">蓝队胜利</span>"));
        var flag = $(self.dom.matchBall).hasClass('right');
        $(self.dom.winnnerWrap).removeClass('animated fadeIn').addClass('hide');
        self.pkProcess.push(data);
        $(self.dom.matchBall).addClass('hide').removeClass('ballIn ballOut ani-ballOut ani-ballIn');
        if (flag) {
            self.currentPlayer.blueTeam && self.currentPlayer.blueTeam.parent().removeClass('ani-play-right');
        } else {
            self.currentPlayer.redTeam && self.currentPlayer.redTeam.parent().removeClass('ani-play');
        }
        $(self.dom.playerListLeft).removeClass(self.currentPlayer.redTeamClass);
        $(self.dom.playerListRight).removeClass(self.currentPlayer.blueTeamClass);
        if ($(self.dom.matchBall).hasClass('right')) {
            $(self.dom.matchBall).removeClass('right');
        } else {
            $(self.dom.matchBall).addClass('right');
        }
        $(self.dom.countWrap).html('<span  class="fcolorred">红队 ' + data.data.gameResult.redWinTime + ' </span> : <span class="fcolorblue"> ' + data.data.gameResult.blueWinTime + ' 蓝队</span>');
    },
    onMatchEnd: function(data) {
        var self = this;
        self.pop('比赛结束~');
        self.updateProceeView('比赛结束~');
        $(self.dom.rateCountWrap).html('<span class="fcolorred">红队 '+data.data.gameResult.redWinTime+' </span><span class="fcolorblack">:</span> <span class="fcolorblue"> '+data.data.gameResult.blueWinTime+' 蓝队</span>').addClass('animated fadeIn').removeClass('hide');
        $(self.dom.winnnerWrap).removeClass('blue').html(data.data.gameResult.redWinTime > data.data.gameResult.blueWinTime ? "<span class=\"fcolorred\">红队胜利</span>" : "<span class=\"fcolorblue\">蓝队胜利</span>").addClass('animated fadeIn').removeClass('hide');
        $(self.dom.countWrap).addClass('hide').html('<span  class="fcolorred">红队 0 </span> : <span class="fcolorblue"> 0 蓝队</span>');
        setTimeout(function(){
            $(self.dom.rateCountWrap).removeClass('animated fadeIn').addClass('hide');
            $(self.dom.winnnerWrap).removeClass('animated fadeIn').addClass('hide');
            $(self.dom.matchStatus).removeClass('hide')
            $(self.dom.playerWrap).addClass('hide');
        },4000);
    },

    onAddUserpower: function(data) {
        //蓄力值操作
        var self = this;
        self.updateProceeView(data.userData.userName,'提交蓄力值' + data.userData.userPower);
    },
    onUserjoin: function(data) { //当用户加入
        var self = this;
        self.updateProceeView(data.userData.userName,'进入了游戏');
        self.updateProceeView(data.userData.userName,'支持了' + (data.userData.userTeam == 'red' ? "<span class=\"fcolorred\">红队</span>" : "<span class=\"fcolorblue\">蓝队</span>"));
    },
    onUserleft: function(data) { //当用户离开
        var self = this;
        if(data.userData.userName) self.updateProceeView(data.userData.userName,'离开了游戏');
    },
    //球员视图相关
    updateView: function(data) {
        var self = this;
        var gData = data.gameData;
        if (gData.blueTeam.length != 0 && gData.redTeam.length != 0) {
            $(self.dom.playerWrap).removeClass('hide');
            this.setPlayerIcon();
            $(self.dom.matchStatus).addClass('hide');
            $(self.dom.countWrap).removeClass('hide');
        } else {

        }
    },
    setPlayerIcon: function() { //设置球员头像
        var self = this;
        var player = [];
        $(self.dom.playersLeft).each(function(index) {
            $(this).attr('src', self.options.path + 'player' + self.cacheRandom(player, 30) + '.png');
            $(self.dom.playersRight).eq(index).attr('src', self.options.path + 'player' + self.cacheRandom(player, 30) + '.png');
        });
    },
    cacheRandom: function(array, max, extend) {
        extend = extend || '';
        var number = Math.ceil(Math.random() * max);
        if (array.length == max) array = [];
        if (array.indexOf(extend + number) > -1) {
            return arguments.callee.apply(this, arguments);
        } else {
            array.push(extend + number);
            return number;
        }
    },
    updateProceeView: function(username, content) {
        if(!content) {
            content = username;
            username = undefined;
        }
        username = username || '';
        content = content || '';
        var self = this;
        var ani = ['bounceIn', 'fadeInUp', 'flipInX', 'fadeIn', 'jackInTheBox','rollIn', 'zoomIn', 'slideInUp','slideInDown','bounce','flash','pulse','rubberBand','shake','swing','tada','wobble','jello'];
        var number = Math.floor(Math.random() * (ani.length-1));
        var p;
        if(username) p = $('<p class="animated ' + ani[number] + '">用户<span class="user">[' + username + ']</span><span class="content">' + content + '</span></p>');
        else {
            p = $('<p class="animated ' + ani[number] + '"><span class="content">' + content + '</span></p>');
        }
        $(self.dom.liveProcessWrap).append(p);
        $(self.dom.liveProcessWrap).animate({
            scrollTop: $(self.dom.liveProcessWrap)[0].scrollHeight
        });
    }
})

var game = new FootBallGame();
