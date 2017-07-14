/**
 * 
 * @authors xiezuobing
 * @date    2017-06-28 20:14:54
 * @version v1.0
 */

/**
 * [preLoadImages 预加载图片]
 * @param  {[type]}   images   [图片数组]
 * @param  {[type]}   gPath    [全局的路径，该路径会添加至图片路径前面]
 * @param  {Function} callback [回调函数:{
 *                              回调函数有两个
 * }]
 * @return {[type]}            [description]
 */
function preLoadImages(images, gPath, callback) {
    if (isFunction(gPath)) {
        callback = gPath;
        gPath = "";
    }
    var imagesLength = images.length,
        pencent = 0,
        loadedNum = 0,
        i;
    var getImageMethod = hasBolb() ? getImageBlob : loadImage;
    for (i = 0; i < imagesLength; i++) {
        (function(index) {
            getImageMethod(gPath + images[index], function() {
                if (!callback) return;
                loadedNum++;
                pencent = Math.ceil((loadedNum) / imagesLength * 100);
                if (loadedNum == imagesLength) {
                    callback.call(this, pencent, true);
                } else {
                    callback.call(this, pencent, false);
                }
            });
        }(i));
    }
}

/**
 * [loadImage 加载图片]
 * @param  {[type]}   src      [图片路径]
 * @param  {Function} callback []
 * @return {[type]}            [description]
 */
function loadImage(src, callback) {
    var image = new Image();
    image.src = src;
    image.onload = function() {
        callback.call(this, src);
    }
}

/**
 * [getImageBlob 根据图片URL的Bolb下载图片]
 * @param  {[type]}   src      [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function getImageBlob(src, callback) {
    var Url = window.URL || window.webkitURL;
    var oReq = new XMLHttpRequest();

    oReq.onload = function(e) {
        var arraybuffer = oReq.response; // not responseText
        var blob = new Blob([arraybuffer], { type: "application/octet-binary" });
        var objURL = Url.createObjectURL(blob);
        var image = new Image();
        image.src = objURL;
        // image.addEventListener('load', callback, false);
        image.onload = function() {
            Url.revokeObjectURL(objURL);
            callback.call(this, src);
        }
    }
    oReq.open("GET", src, true);
    oReq.responseType = "arraybuffer";
    oReq.send();
};

function getAniFootBall(parent,count) {
    count = count || 20;
    parent = parent || $('.login-wrap');
    var timer = setInterval(function(){
        var Swidth = document.documentElement.clientWidth;
        (function(){
            var span = $('<span class="bgBall"></span>');
            span.css({
                top: '-20px',
                left: ~~(Math.random() * 1.5 * Swidth) + 'px',
            });
            parent.append(span);
            span.animate({
                top: '100%',
                left: ~~(Math.random() * 1.5 * Swidth) + 'px',
            },~~(Math.random()*500 + 5000),'linear',function(){
                span.remove();
            });
        }());
    },300)
    return timer;
}
/**
 * [hasBolb 是否有二进制对象]
 * @return {Boolean} [description]
 */
function hasBolb() {
    return typeof Blob !== "undefined" && typeof Blob !== undefined && Blob;
}

/**
 * [isFunction 判断对象是否为函数]
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
function isFunction(obj) {
    return Object.prototype.toString.call(obj) === "[object Function]";
}

/**
 * [iSArray 判断对象是否为数组]
 * @param  {[type]} obj [description]
 * @return {[type]}     [description]
 */
function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]"
}

var noop = function() {}; //空函数
