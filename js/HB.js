/**
 * Created by 殿麒 on 2016/6/28.
 */

/**
 *  HB.obj
 *      HB.obj.toEquals
 *      HB.obj.isEmpty
 *  HB.resource
 *      HB.resource.query()
 *      HB.resource.save()
 *  HB.valid
 *      HB.valid.toPhoneNum
 *  HB.ui
 *      HB.ui.scrollToTheBottom
 *  HB.url
 *      HB.url.getBaseUrl
 *      HB.url.getKey
 *      HB.url.history
 *  HB.save
 *      HB.save.storage
 *  HB.CSS3
 *  HB.slide
 *      HB.slide.left
 *  HB.design
 *      HB.design.chain
 */

var $ = require('jquery');

window.HB = window.HB || {};

HB.obj = (function(){

    //  判断obj1中是否有obj2中的所有属性
    var toEquals = function(obj1,obj2){
        var flag = true;
        for(var prop in obj2){

            if(obj1[prop] != obj2[prop]){
                flag = false;
                break;
            }
        }
        return flag;

    };

    //  用途：是否为空对象
    var isEmpty = function(obj){
        if(typeof obj == "object"){
            var proparr = [];

            for(var prop in obj){
                proparr.push(prop);
            }

            if(proparr.length == 0){
                return true;
            }else{
                return false;
            }
        }else{
            if(obj == ''){
                return true;
            }else{
                return false;
            }
        }

    };
    let isArray = function isArray(o) {
        return Object.prototype.toString.call(o) === "[object Array]";
    };

    return {
        toEquals:toEquals,
        isEmpty:isEmpty,
        isArray:isArray
    }

})();
HB.ajax = function(){
    //  创建请求的模板类
    class AbstractSendAjax{
        constructor(url,config){
            this.urlFactory = new UrlFactory(url);
            this.config = config.ajaxConfig;
        }
        getUrl(replaceUrlObj){
            this.url = this.config.baseUrl + this.urlFactory.getUrl(replaceUrlObj)
        }
        createXHR(){
            this.xhr = new XMLHttpRequest();
        }
        setAsync(){
            this.async = this.config.async;
        }
        getHeader(){
            this.header = this.config.requestHeader.header;
        }
        getHeaderValue(){
            this.value = this.config.requestHeader.value;
        }

        openXHR(){
            return new Error('请重写openXHR');
        }
        isSetRequestHeader(){
            return true;
        }
        setRequestHeader(){
            return new Error('请重写setRequestHeader');
        }
        setResponseType(){
            this.xhr.responseType = this.config.responseType;
        }
        isSend(){
            return true;
        }
        send(data){
            this.xhr.send(JSON.stringify(data));
        }
        success(resolve){
            if(this.xhr.readyState === 4 && this.xhr.status === 200){
                return resolve(this.xhr.response);
            }
            return "nextSuccessor";

        }
        fail(reject){
            if(this.xhr.readyState === 4 && this.xhr.status !== 200){
                return reject(this.xhr.response);
            }
            return "nextSuccessor";

        }
        waitStateChange(){
            if(this.xhr.readyState !== 4){
                return "nextSuccessor";
            }
        }
        getResponse(){
            let self = this;
            return new Promise((resolve, reject)=>{
                this.xhr.onreadystatechange = function(){
                    if (self.xhr.readyState === 4 && self.xhr.status === 200) {
                        resolve(self.xhr.response);
                    }else if(self.xhr.readyState === 4 && self.xhr.status !== 200){
                        reject(self.xhr.response);
                    }
                }
            })
        }

        initAjax(replaceUrlObj, data){
            this.getUrl(replaceUrlObj);
            this.setAsync();
            this.createXHR();
            this.getHeader();
            this.getHeaderValue();
            this.openXHR();
            if(this.isSetRequestHeader()){
                this.setRequestHeader();
            }
            this.setResponseType();
            if(this.isSend() && data){
                this.send(data);
            }
            return this.getResponse()
        }
    }
    class Post extends AbstractSendAjax{
        constructor(url,config){
            super(url,config);
        }
        openXHR(){
            this.xhr.open("post",this.url,this.async);
        }
        setRequestHeader(){
            this.xhr.setRequestHeader(this.header,this.value);
        }

    }
    class Query extends AbstractSendAjax{
        constructor(url,config){
            super(url,config);
        }
        openXHR(){
            this.xhr.open("get",this.url,this.async);
        }
        isSetRequestHeader(){
            return false;
        }
    }

    //  url加工厂
    class UrlFactory{
        constructor(templateUrl) {
            this.templateUrl = templateUrl + "/";
        }
        getUrl(replaceUrlObj) {
            let url = this.templateUrl;
            for (let p in replaceUrlObj) {
                url = url.replace("/:" + p + "/", "/" + replaceUrlObj[p] + "/");
            }
            return url.substr(0, url.length - 1);
        }
    }


    //  请求方式
    class Resource{
        constructor(url,config) {
            this.url = url;
            this.config = config;
        }
        query(replaceUrlObj,data={}) {
            let query = new Query(this.url,this.config);
            return query.initAjax(replaceUrlObj,data);
        }
        save(replaceUrlObj, data) {
            let post = new Post(this.url,this.config);
            return post.initAjax(replaceUrlObj, data);
        }
    }

    /**
     * 配置
     * baseURL:string 基础url 被加在所有请求地址前
     * ansyn:bool 是否异步（由于使用promise接收返回值是否异步已经不在有影响）
     * requestHeader:object 设置请求头
     * responseType:string 返回值类型json text html arraybuffer
     */
    class Config{
        constructor(ajaxConfig){
            this.ajaxConfig = Object.assign({baseUrl:"",async:true,requestHeader:{
                    header:"Content-type",
                    value:"application/json; charset=utf-8"
                },responseType:"json"},ajaxConfig);
        }
    }
    class Ajax{
        constructor(){
            this.config = new Config({});
        }
        setConfig(ajaxConfig){
            this.config = new Config(ajaxConfig)
        }
        resource(url){
            return new Resource(url,this.config);
        }
    }

    return new Ajax();
};

HB.valid = (function(){
    /*
    *   用途：按一定规则分割字符串
    *   第1个参数是分割哪个字符串 比如：18801233565
    *   第2个参数是每隔多少个字符分割 比如：18801233565 分成 188 0123 3565 就传[3,4,4]
    *   第3个参数是用什么来分割 比如：18801233565 分成 188-0123-3565 就传'-'
    * */

    function validNum(num,arr,str){
        let myNum = num.split(str).join("");
        let newPhoneNum = [];
        for(let i = 0;i < arr.length;i++){
            let newNum = myNum.slice(0,arr[i]);
            newPhoneNum.push(newNum);
            myNum = myNum.substr(arr[i]);
        }
        return newPhoneNum.join(str).trim();
    }
    function validPhoneNum(phoneNum){
        return phoneNum.length === 11;
    }


    //  用途：将字符串中所有空格删除
    function trimAllBlank(str){
        return str.replace(/\s/g, "");
    }

    //  用途：将数字转换成字符串
    function parseString(i){
        return i+"";
    }

    //  用途：将字符串转换为数组
    function parseArr(str){
        return str.split('');
    }

    //  用途：将阿拉伯数子转换为汉字
    function parseChinese(number){
        let chinese = ['零','一','二','三','四','五','六','日','八','九'];
        let arrNumber = parseArr(parseString(number));
        let chineseNumber = "";

        return arrNumber.map((item,index)=>{
            chineseNumber += chinese[item];
            return chineseNumber;
        });
    }

    //  将星期几转换成汉字的
    function parseDay(day){
        let myDay = day;
        if(day === 0){
            myDay = 7;
        }
        return parseChinese(myDay);

    }
    function addTimeToDay(day,time,format){
        if(checkFormatTime(format,day)){
            return day + time;
        }
        return null;
    }
    //  todo 临时校验 改为正则校验规则
    function checkFormatTime(format,day){
        return day.length === 10;
    }

    return {
        validNum:validNum,
        trimAllBlank:trimAllBlank,
        parseString:parseString,
        parseArr:parseArr,
        parseChinese:parseChinese,
        parseDay:parseDay,
        validPhoneNum:validPhoneNum,
        addTimeToDay:addTimeToDay
    }

})();

HB.ui = (function(){
    //  是否移动到底部
    var scrollToTheBottom = function(func){
        $(window).bind("scroll",function(){
            var $_scrollTop = $(this).scrollTop();
            var $_scrollHeight = $(document).height();
            var $_windowHeight = $(this).height();
            if($_scrollTop + $_windowHeight === $_scrollHeight){
                func();
            }
        });
    };

    const setBaseFontSize = function(designWidth,rem2px){
        var d = window.document.createElement('div');
        d.style.width = '1rem';
        d.style.display = "none";
        var head = window.document.getElementsByTagName('head')[0];
        head.appendChild(d);
        var defaultFontSize = parseFloat(window.getComputedStyle(d, null).getPropertyValue('width'));
        d.remove();
        document.documentElement.style.fontSize = window.innerWidth / designWidth * rem2px / defaultFontSize * 100 + '%';
        var st = document.createElement('style');
        var portrait = "@media screen and (min-width: "+window.innerWidth+"px) {html{font-size:"+ ((window.innerWidth/(designWidth/rem2px)/defaultFontSize)*100) +"%;}}";
        var landscape = "@media screen and (min-width: "+window.innerHeight+"px) {html{font-size:"+ ((window.innerHeight/(designWidth/rem2px)/defaultFontSize)*100) +"%;}}"
        st.innerHTML = portrait + landscape;
        head.appendChild(st);
        return defaultFontSize
    };
    const parsePx = function(){
        let d = window.document.createElement('div');
        d.style.width = '1rem';
        d.style.display = "none";
        let head = window.document.getElementsByTagName('head')[0];
        head.appendChild(d);
        let rate = parseFloat(window.getComputedStyle(d, null).getPropertyValue('width'));
        d.remove();
        return rate;
    };
    return {
        scrollToTheBottom:scrollToTheBottom,
        setBaseFontSize:setBaseFontSize,
        parsePx:parsePx
    }
})();

HB.url = (function(){

    var getBaseUrl = function(){
        var host = window.location.host;
        var contextPath = document.location.pathname;
        var index = contextPath.substr(1).indexOf("/");
        contextPath = contextPath.substr(0, index + 1);
        var url = "http://" + host + contextPath;

        return url;
    };

    var getSearchKey = function(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };

    var getHashKey = function(name){
        var reg = new RegExp("(^|&|/?)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.hash.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    };
    //  从哪个URL之前的所有URL都要 （之后的不要）第二个参数就是来标记从哪开始之后的URL都不要（包括第二个参数在内）
    var setBrowserHistoryFromBefore = function(urls,url){
        let urlIndex = urls.indexOf(url);
        let last = urlIndex + 1;
        urls.splice(last);
        for(let i = 0;i < urls.length;i++){
            var setUrl = "#" + urls[i];
            history.pushState({},"", setUrl);
        }
    };

    return {
        getBaseUrl:getBaseUrl,
        getSearchKey:getSearchKey,
        getHashKey:getHashKey,
        setBrowserHistoryFromBefore:setBrowserHistoryFromBefore
    }
})();

HB.save = (function(){

    const setStorage = function(obj){
        for(let prop in obj){
            localStorage[prop] = JSON.stringify(obj[prop]);
        }
    };


    return {
        setStorage:setStorage,
    }
})();

HB.loading = (function(){
    var picLoad = function(picArr,baseUrl=""){
        let successCounter = 0;
        let isSuccess = false;
        for(let i = 0;i < picArr.length;i++){
            var url = baseUrl + picArr[i];
            $.ajax({
                type:'GET',
                url:url,
                async:false
            }).done(function(){
                console.log("加在成功");
                successCounter ++;
            });
        }
        if(successCounter == picArr.length){
            isSuccess = true;
        }
        return isSuccess;
    };

    return {
        picLoad:picLoad
    }
})();
HB.load = function(arr,func){
    for(let i = 0;i < arr.length;i++){
        if(arr[i] == false){
            alert("未连接到网络 请重新尝试");
            return false;
        }
    }
    func();
};


HB.CSS3 = (function () {

    const getCSS3PropsVal = function(name){
        var prop = "";
        for(let i = name.length - 1;i >= 0;i-- ){
            prop += name[i];
            if(name[i] === "("){
                return prop.split("").reverse().join("");
            }
        }
    };
    const toArray = function(name){
        var css3PropsVal = getCSS3PropsVal(name);
        var prop = "";
        var propArrIndex = 0;
        var propArr = [];

        css3PropsVal = css3PropsVal.substr(1);
        css3PropsVal = css3PropsVal.replace(/\)/g, ",");

        for(let i = 0; i < css3PropsVal.length;i++){
            if(css3PropsVal[i] !== ","){
                prop += css3PropsVal[i];
            }else{
                propArr[propArrIndex] = prop;
                prop = "";
                propArrIndex+=1;
            }
        }
        return propArr;
    };

    const replaceProp = function(name,i,replaceVal){
        var propArr = toArray(name);
        var newCSS3 = "";

        propArr[i] = replaceVal;
        var valStr = propArr.join(',');

        for(let i = 0;i < name.length;i++){

            if(name[i] != "("){
                newCSS3 += name[i];
            }else{
                return newCSS3 += ("(" + valStr +")");
            }
        }
    };

    return {
        getCSS3PropsVal:getCSS3PropsVal,
        toArray:toArray,
        replaceProp:replaceProp
    }
})();

HB.slide = function(str,func){
    var touchStart_x = 0,
        touchEnd_x = 0,
        touchStart_y = 0,
        touchEnd_y = 0;

    const left = function(){
        if(str === 'left'&&touchStart_x - touchEnd_x > 0 ){
            console.log('left');
            func();
        }
    };
    const right = function(){
        if(str === 'right'&&touchStart_x - touchEnd_x < 0 ){
            console.log('right');
            // func();
        }
    };

    $('body').bind("touchstart",function(e){
        touchStart_x = e.touches[0].clientX;
        touchStart_y = e.touches[0].clientY;
    });
    $('body').bind("touchend",function(e){
        touchEnd_x = e.changedTouches[0].clientX;
        touchEnd_y = e.changedTouches[0].clientY;
        return {
            left:left(),
            // right:right(),
            // up:up(),
            // down:down()
        };

    });
};

HB.design = (function(){

    class Chain{
        constructor(fn){
            this.fn = fn;
            this.success = null;
        }
        setNextSuccessor( successor ){
            return this.successor = successor;
        };
        passRequest(){
            let ret = this.fn.apply(this,arguments);
            if ( ret === 'nextSuccessor' ){
                return this.successor && this.successor.passRequest.apply( this.successor, arguments );
            }
            return ret;
        }
    }



    return {
        Chain:Chain,
    }

})();

Function.prototype.after = function(fn) {
    let self = this;
    return function() {
        let ret = self.apply(this, arguments);
        if (ret === "nextSuccessor") {
            return fn.apply(this,arguments);
        }
        return ret;
    }
};
Function.prototype.before = function( beforefn ){
    let __self = this;
    return function(){
        beforefn.apply( this, arguments );
        return __self.apply( this, arguments );
    }
};
Date.prototype.toLocaleString = function() {
    return this.getFullYear() + "/" + (this.getMonth() + 1) + "/" + this.getDate() + "/ " + this.getHours() + ":" + this.getMinutes() + ":" + this.getSeconds();
};

module.exports = HB;
