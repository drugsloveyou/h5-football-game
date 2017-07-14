/**
 * game.js
 * @authors xiezuobing
 * @date    2017-07-12 15:38:40
 * @version v1.0
 */

/**
 * football-game demo logic
 * @author panni(199160)
 * @date    2017-07-05
 * @version v0.1.0
 */

var $redTeam = $("#redTeam");
var $blueTeam = $("#blueTeam");
var $spectator = $("#spectator");
var $random = $("#random");
var $pageLogin = $("#pageLogin");
var $btnLogin = $("#btnLogin");
var $userTeam = $("#userTeam");
var $userName = $("#userName");
var $userPower = $("#userPower");
var $userPowerBtn = $("#userPowerBtn");
var $gameBoard = $("#gameBoard");

var loginData = {};

var socket = io('http://192.168.238.22:8360');

// 登录操作 发送用户名和选队
$btnLogin.on("click", function () {
  var userName = $.trim($userName.val());
  var userTeam = $userTeam.find("input:radio:checked").val();

  loginData = {
    userName: userName,
    userTeam: userTeam
  }
  
  socket.emit('adduser', loginData);
  $pageLogin.hide();
});

// 发送蓄力值
$userPowerBtn.on("click", function() {
  console.log("powerbtn");
  var userPower = $userPower.val();
  socket.emit('adduserpower',userPower);
})

// Sokect events
socket.on('login', function(data) {
  console.log(data);
  var html = template("spectatorTemp", data);
  $spectator.html(html);
  var htmlBlue = template("blueTeamTemp", data.gameData);
  $blueTeam.html(htmlBlue);
  var htmlRed = template("redTeamTemp", data.gameData);
  $redTeam.html(htmlRed);
});

// 其他用户加入
socket.on('userjoin', function(data) {
  console.log(data);
  var html = template("spectatorTemp", data);
  $spectator.html(html);
  var htmlBlue = template("blueTeamTemp", data.gameData);
  $blueTeam.html(htmlBlue);
  var htmlRed = template("redTeamTemp", data.gameData);
  $redTeam.html(htmlRed);
});

// 用户离开
socket.on('userleft', function (data) {
  console.log('用户离开');
  console.log(data);
  var html = template("spectatorTemp", data);
  $spectator.html(html);
  var htmlBlue = template("blueTeamTemp", data.gameData);
  $blueTeam.html(htmlBlue);
  var htmlRed = template("redTeamTemp", data.gameData);
  $redTeam.html(htmlRed);
});

// 用户提交蓄力值
socket.on('userpower', function(data) {
  console.log(data);
  var html = template("spectatorTemp", data);
  $spectator.html(html);
  var htmlBlue = template("blueTeamTemp", data.gameData);
  $blueTeam.html(htmlBlue);
  var htmlRed = template("redTeamTemp", data.gameData);
  $redTeam.html(htmlRed);
});

// 游戏尚未开始
socket.on('rest', function(data) {
  console.log("比赛尚未开始");
  console.log(data);
  var html = template("gameBoardTemp", data);
  $gameBoard.append(html);
});

// 开局
socket.on('start', function(data) {
  console.log("开局");
  console.log(data);
  console.log(data.data.gameData);
  var htmlBlue = template("blueTeamTemp", data.data.gameData);
  $blueTeam.html(htmlBlue);
  var htmlRed = template("redTeamTemp", data.data.gameData);
  $redTeam.html(htmlRed);
  var html = template("gameBoardTemp", data);
  $gameBoard.append(html);
});

//挑选球员
socket.on('select', function(data) {
  console.log("--------------");
  console.log("挑选球员");
  console.log(data);
  data.data.msg += ('   红队：' + data.data.pkData.redTeam + '号队员   蓝队：' + data.data.pkData.blueTeam + '号队员');
  var html = template("gameBoardTemp", data);
  $gameBoard.append(html);
});

// 对抗
socket.on('pk', function(data) {
  console.log("对抗");
  console.log(data);
  var winTeamStr = "";
  if(data.data.pkData.pkResult == 'red') {
    winTeamStr = '红队';
  } else {
    winTeamStr = '蓝队';
  }
  data.data.msg += '   '+ winTeamStr + '胜利';
  var html = template("gameBoardTemp", data);
  $gameBoard.append(html);
});

// 对抗结果
socket.on('pk-end', function(data) {
  console.log("对抗结果");
  console.log(data);
  data.data.msg += ('   红队:' + data.data.gameResult.redWinTime + '   蓝队：'+ data.data.gameResult.blueWinTime);
  var html = template("gameBoardTemp", data);
  $gameBoard.append(html);
});

socket.on('end', function(data) {
  console.log("游戏结束");
  console.log(data);
  data.data.msg += ('   红队:' + data.data.gameResult.redWinTime + '   蓝队：'+ data.data.gameResult.blueWinTime);
  var html = template("gameBoardTemp", data);
  $gameBoard.append(html);
});
