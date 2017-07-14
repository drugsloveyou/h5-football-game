/**
 * [Animation 动画移动结束与动画结束]
 * @authors xiezuobing
 * @date    2017-07-12 09:48:12
 * @version $Id$
 */


var Animation = function() {
    var WN = {},
        body = document.body || document.documentElement,
        style = body.style,
        transition = "transition",
        transitionEnd,
        animationEnd,
        vendorPrefix;

    transition = transition.charAt(0).toUpperCase() + transition.substr(1);

    /**
     * [description 前缀处理]
     * @param  {[type]} ) {                   var i [description]
     * @return {[type]}   [description]
     */
    vendorPrefix = (function() {
        var i = 0,
            vendor = ["Moz", "Webkit", "Khtml", "O", "ms"];
        while (i < vendor.length) {
            if (typeof style[vendor[i] + transition] === "string") {
                return vendor[i];
            }
            i++;
        }
        return false;
    })();

    /**
     * [description 移动结束]
     * @param  {Object} )
     * @return {[type]}   [description]
     */
    transitionEnd = (function() {
        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }
        for (var name in transEndEventNames) {
            if (typeof style[name] === "string") {
                return transEndEventNames[name]
            }
        }
    })();

    /**
     * [description 动画结束]
     * @param  {Object} )
     * @return {[type]}   [description]
     */
    animationEnd = (function() {
        var animEndEventNames = {
            WebkitAnimation: 'webkitAnimationEnd',
            animation: 'animationend'
        }
        for (var name in animEndEventNames) {
            if (typeof style[name] === "string") {
                return animEndEventNames[name]
            }
        }
    })();

    /**
     * [addTranEvent 添加transition结束的绑定，并在移动结束之后自动移除该事件]
     * @param {[type]}   elem     [description]
     * @param {Function} fn       [description]
     * @param {[type]}   duration [description]
     */
    WN.addTranEvent = function(elem, fn, duration) {
        var called = false;
        var fncallback = function() {
            if (!called) {
                fn();
                called = true;
            }
        };

        function hand() {
            elem.addEventListener(transitionEnd, function() {
                elem.removeEventListener(transitionEnd, arguments.callee, false);
                fncallback();
            }, false);
        }
        setTimeout(hand, duration);
    };

    /**
     * [addAnimEvent 添加动画事件结束的绑定]
     * @param {[type]}   elem [description]
     * @param {Function} fn   [description]
     */
    WN.addAnimEvent = function(elem, fn) {
        var cb = function(){
            fn.apply(elem,arguments);
            elem.removeEventListener(animationEnd,cb,false)
        }
        elem.addEventListener(animationEnd, cb, false)
    };

    /**
     * [removeAnimEvent 移除动画事件结束的绑定]
     * @param  {[type]}   elem [description]
     * @param  {Function} fn   [description]
     * @return {[type]}        [description]
     */
    WN.removeAnimEvent = function(elem, fn) {
        elem.removeEventListener(animationEnd, fn, false)
    };

    /**
     * [setStyleAttribute 设置属性]
     * @param {[type]} elem [description]
     * @param {[type]} val  [description]
     */
    WN.setStyleAttribute = function(elem, val) {
        if (Object.prototype.toString.call(val) === "[object Object]") {
            for (var name in val) {
                if (/^transition|animation|transform/.test(name)) {
                    var styleName = name.charAt(0).toUpperCase() + name.substr(1);
                    elem.style[vendorPrefix + styleName] = val[name];
                } else {
                    elem.style[name] = val[name];
                }
            }
        }
    };
    WN.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
    WN.transitionEnd = transitionEnd;
    WN.vendorPrefix = vendorPrefix;
    WN.animationEnd = animationEnd;
    return WN;
}