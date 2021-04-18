// +----------------------------------------------------------------------
// | IPTV-EPG
// +----------------------------------------------------------------------
// | IPTV EPG 前端最核心js：包含系列核心通用操作！
// +----------------------------------------------------------------------
// | 说明：
// |    1.  全局唯一根命名空间声明：HCEPG
// |    2.  AJAX(Asynchronous JavaScript+XML)异步请求封装：LMEPG.ajax
// |    3.  通用函数库：HCEPG.Func
// |    4. 自定义按钮控件管理器：HCEPG.ButtonManager
// |    5. CSS样式管理器：HCEPG.CssManager
// |    6. 机顶盒相关操作封装：HCEPG.STBUtil
// +----------------------------------------------------------------------
// | 使用：
// |    1. 必须为首个js引用。
// |        e.g. <head>...<script type="text/javascript" src="__ROOT__/js/HCcommon.js?t={$time}"></script>...</head>
// +----------------------------------------------------------------------
// | 修改规则：
// |    1. 定义Object类名时，请按照“大驼峰命名法”。
// |        e.g. HCEPG.Log/HCEPG.Func/HCEPG.Cookie/HCEPG.ButtonManager/HCEPG.KeyEventManager
// |        >>>>>但注意一下，LMEPG.ajax暂时特殊，为全小写！<<<<<
// |    2. 定义Object类名时，若为简短类名缩写，请按照“首字母”大写。
// |        e.g. HCEPG.UI/HCEPG.BM/HCEPG.KEM
// |    3. 请统一按照功能及相关性，定义类/方法所在合适区域位置！！！
// +----------------------------------------------------------------------
// | 作者: len
// | 日期: 2020/3/17
// +----------------------------------------------------------------------

// 严格模式，开发时使用，上线时把它注释掉，它本身是在盒子上是存在兼容问题的，因此线上不能使用
// 'use strict';


function addEvent(obj,ev,fn){
    //针对IE浏览器
    if(obj.attachEvent){ 
        obj.attachEvent('on'+ev,fn)
    }
    //针对FF与chrome
    else{   
        obj.addEventListener(ev,fn,false)
    }
}


/*****************************************************************
 * 通用快捷函数定义：
 *****************************************************************/
/**
 * 根据控件ID返回控件的引用
 * @param id [string] 控件（元素）id
 * @returns {Element} 返回对象引用
 */
function G(id) {
    return document.getElementById(id);
}
function C(cls,par){
    if(!par){par = document}
    return par.getElementsByClassName(cls);
}
HTMLElement.prototype.C = HTMLElement.prototype.getElementsByClassName;

/**
 * 显示控件（visibility属性）
 * @param id [string|dom object] dom元素id或者dom元素对象
 */
function S(id) {
    var temp = id instanceof HTMLElement ? id : G(id);
    if (temp) {
        temp.style.visibility = "visible";
    }
}

/**
 * 隐藏控件（visibility属性）
 * @param id [string|dom object] dom元素id或者dom元素对象
 */
function H(id) {
    var temp = id instanceof HTMLElement ? id : G(id);
    if (temp) {
        temp.style.visibility = "hidden";
    }
}

/**
 * 显示一个元素，与S不同的是，修改的是display属性<br>
 * 修改visibility的最大缺点是：如果子元素是显示的话，即使父元素隐藏了子元素也不会隐藏
 * @param id [string|dom object] dom元素id或者dom元素对象
 */
function Show(id) {
    var temp = id instanceof HTMLElement ? id : G(id);
    if (temp) {
        temp.style.display = "block";
    }
}

/**
 * 隐藏一个元素，与H不同的是，修改的是display属性<br>
 * add by lxa 20140922
 * 修改visibility的最大缺点是：如果子元素是显示的话，即使父元素隐藏了子元素也不会隐藏
 * @param id [string|dom object] dom元素id或者dom元素对象
 */
function Hide(id) {
    var temp = id instanceof HTMLElement ? id : G(id);
    if (temp) {
        temp.style.display = "none";
    }
}

/**
 * 判断 visibility 属性是否显示
 * @param id [string|dom object] dom元素id或者dom元素对象
 * @return {Element|boolean} null/undefined-不存在 或 boolean[true-显示 false-隐藏]
 */
function isS(id) {
    var temp = id instanceof HTMLElement ? id : G(id);
    var getVisibility = temp.style.visibility;
    return temp && getVisibility && getVisibility !== "hidden";
}

/**
 * 判断 display 属性是否显示
 *
 * @param id [string|dom object] dom元素id或者dom元素对象
 * @return {Element|boolean} null/undefined-不存在 或 boolean[true-显示 false-隐藏]
 */
function isShow(id) {
    var temp = id instanceof HTMLElement ? id : G(id);
    var getVisibility = temp.style.display;
    return temp && getVisibility && getVisibility !== "none";
}

function isShow_v2(id){
    var temp = id instanceof HTMLElement ? id : G(id);
    var getVisibility = getStyle(temp,'display');
    if(getVisibility == 'none'){
        return false;
    }
    else if(temp.tagName == 'BODY'){
        return true;
    }   
    else{
        return isShow_v2(temp.parentNode);
    }
}

function getShow(cls){
    var arr = [];
    for(var i = 0;i<C(cls).length;i++){
        if(isShow_v2(C(cls)[i])){arr.push(C(cls)[i]) }
    }
    return arr;
}
/**
 * 获取节点样式（包含行内样式和非行内样式）
 *
 * @param ele [dom object] dom节点
 * @return {string} 
 */
function getStyle(ele,attr){
    var res = '';
    if(window.getComputedStyle){
        res = getComputedStyle(ele)[attr];
    }
    else if(ele.currentStyle){
        res = ele.currentStyle[attr];
    }
    else{
        res = ele.style[attr];
    }
    // 这里返回的样式做了调整，返回必须为字符串，有盒子的样式获取像margin-left会返回纯数字（不含单位px），这样不好处理，统一变成字符串后再对返回结果用正则匹配
    return res+'';
}




/*****************************************************************
 * （必须：首个声明！）全局唯一根命名空间声明：HCEPG
 *****************************************************************/
var HCEPG = {}
HCEPG.data = {
    baseUrl:'',
    apiUrl:'http://120.236.119.11:63015',
};
/*****************************************************************
 * 通用函数库：LMEPG.Func。
 * 注意：若有内部类，请统一放置末尾定义(按类型区域声明)，且以小写命名。例如，string/array/codec
 *****************************************************************/
HCEPG.Func = {
    /**
     * ajax请求
     * 
     * 例子：
     *  ajax({
            type: 'POST',
            url:'http://202.99.114.152:24005/index.php?m=Home&c=DuduApi&a=authorization',
            dataType: "json",
            data: {
                url:'http://202.99.114.14:10020/ACS/vas/authorization',
                userId:123,
                contentId:'ddwjwg',
                serviceId:'ddwjwg025',
                productId:'ddwjwg025@201',
                UserToken:'sdafsfd',
            },
            success: function (res) {
            },
            error:function(res){
            },
     * })
     * @param str [string] 原字符串，带有{i}占位符的。
     * @param replaces [string] 替换{i}占位符的字符串，有多个必须使用数组，有1个可以只用字符串。
     * @return 被格式化替换后的字符串
     */
    ajax:function(options){
        var _this = this;
        //异步请求对象的完成状态
        this.done = 0;
        this.format = function(){
            var now = new String(new Date().getTime());
            return now.substr(0,now.length-5);
        }
        //格式化参数
        this.formatParams = function(data) {
            //获取地址参数
            var arr = [];
            for (var name in data) {
                arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
            }
            
            arr.push("t="+_this.format());//按分钟刷一次
            return arr.join("&");
        }
        
        //传入设置
        options = options || {};
        //请求方式
        options.type = (options.type || "GET").toUpperCase();
        options.dataType = options.dataType || "json";
        options.async = options.async || true;
        options.contentType = options.contentType || 'application/x-www-form-urlencoded';
        var params;
        if(options.contentType == "application/json;charset=utf-8"){
            params = JSON.stringify(options.data)
        }
        else{
            params = _this.formatParams(options.data)
        }

        //创建异步请求对象 - 第一步
        var xhr;
        //w3c标准
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } 
        //兼容IE6及以下
        else if (window.ActiveObject) { 
            xhr = new ActiveXObject('Microsoft.XMLHTTP');
        }
        
        //连接 和 发送 - 第二步
        //判断是那种类型的请求
        //若是get请求
        if (options.type == "GET") {
            //参数拼接
            if(options.url.indexOf("?")==-1) sp="?" ; else sp="&";
        
            //发送请求
            xhr.open("GET", options.url + sp + params,options.async);
            xhr.send(null);
        } 
        //若是post请求
        else if (options.type == "POST") {
            //发送请求
            xhr.open("POST", options.url,options.async);
            //设置表单提交时的内容类型
            xhr.setRequestHeader("Content-Type", options.contentType);
            //参数配置
            xhr.send(params);
        }

        //接收 - 第三步
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                //状态码
                var status = xhr.status;
                //状态码表示成功时，执行成功回调函数
                if (status >= 200 && status < 300 || status == 304) {
                    //返回数据的格式
                    //json字符串
                    if (options.dataType == "json") {
                        try{
                            options.success && options.success(eval("("+xhr.responseText+")"));
                        }
                        catch(err){
                            options.success && options.success(JSON.parse(xhr.responseText), xhr.responseXML);
                        }
                        
                    
                    } 
                    //普通字符串
                    else {
                        options.success && options.success(xhr.responseText, xhr.responseXML);
                    }
                    // 改变状态为完成
                    _this.done = 1;
                } 
                //如果状态码表示失败时调用错误处理回调函数
                else {
                    options.error && options.error(status);
                    // 改变状态为完成
                    _this.done = 1;
                }
            }
        }
    },
    /**
     * 格式化参数
     *
     * @param data 带转换的对象
     * @returns {string} 转换成字符串拼接的参数
     */
    formatParams:function (data) {
        //获取地址参数
        var arr = [];
        for (var name in data) {
            arr.push(encodeURIComponent(name) + "=" + encodeURIComponent(data[name]));
        }
        return arr.join("&");
    },
    /**
     * 设置cookie
     *
     * @param name 存储cookie节点名
     * @param value 存储cookie对应的值
     * @param t  存储cookie保存的时间
     */
    setCookie:function(name,value,t){
        var hour = t?t:8; 
        var exp = new Date();   
        exp.setTime(exp.getTime() + hour*60*60*1000);   
        document.cookie = name + "="+ escape (value) + ";expires=" + exp.toGMTString()+";path=/";   
    },
    
    /**
     * 根据指定cookie名获取具体cookie值
     *
     * @param name [string] 存储cookie节点名
     * @returns {string} 存储cookie值value。注：返回一定不会为undefined或null，最少返回空字符串""！
     */
    getCookie:function(name){
        var arr, reg = new RegExp("(^| )"+name+"=([^;]*)(;|$)");  
        if(arr=document.cookie.match(reg)){  
            return unescape(arr[2]);   
        }  
        else{  
            return '';   
        }
    },

    /**
     * 获取url字段参数化
     * @param name 字段名
     * @returns {string} 注：返回一定不会为undefined或null，最少返回空字符串""！
     */
    getQueryString:function(name){
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null && decodeURIComponent(r[2]) != "undefined" && decodeURIComponent(r[2]) != "null") return decodeURIComponent(r[2]);
        return ''; 
    },
    /**
     * 返回当前yyyyMMddhhmmss的时间格式
     * @return [string] 当前yyyyMMddhhmmss的时间格式的字符串 
     */
    timeFormat:function(){
        var yyyy = new Date().getFullYear();
        var MM = new Date().getMonth() + 1 ;
        MM = MM >= 10 ? "" + MM : "0" + MM;
        var dd = new Date().getDate();
        dd = dd >= 10 ? "" + dd : "0" + dd;
        var hh = new Date().getHours();
        hh = hh >= 10 ? "" + hh : "0" + hh;
        var mm = new Date().getMinutes();
        mm = mm >= 10 ? "" + mm : "0" + mm;
        var ss = new Date().getSeconds();
        ss = ss >= 10 ? "" + ss : "0" + ss;
        return yyyy + MM + dd + hh + mm + ss;
    },
    //
    /**
     * 时间转化格式
     * @param time [number] 
     * @return [string] 返回hh:mm:ss的时间格式的字符串 
     */
    timestamp:function(time) {
        var h = parseInt(time/3600);
        var m = parseInt(time%3600/60);
        var s = parseInt(time%3600%60);
        h = h<10?'0'+h:h;
        m = m<10?'0'+m:m;
        s = s<10?'0'+s:s;
        return h+":"+m+":"+s;
    },
    /**
     * 判断数据类型
     * @return [string] String-字符串 Number-数字 Object-对象 Array-字符串 Function-函数 Boolean-布尔值
     */
    typeOfData:function(obj){
        return Object.prototype.toString.call(obj).slice(8,-1)
    },
    /**
     * 获取下一个兄弟节点
     * @param node [dom object] dom元素对象
     * @returns [dom object] 返回的下一个兄弟节点
     */
    getNextElement:function(node){
        var res = node.nextSibling;
        while(res.nodeType!==1&&res!==res.parentNode.firstChild){
            res = res.nextSibling;
        }
        return res;
    },
    /**
     * 获取上一个兄弟节点
     * @param node [dom object] dom元素对象
     * @returns [dom object] 返回的上一个兄弟节点
     */
    getPreviousElement:function(node){
        var res = node.nextSibling;
        while(res.nodeType !== 1&&res !== res.parentNode.lastChild){
                res = res.nextSibling;
        }
        return res;
    },
    /**
     * 数组对象深度处理
     * * <pre>
     *  HCEPG.Func.deepDeal({
            data:[{name:'len'},{name:'f'},{name:'z',child:[{name:'a'}]}],//[array] 待处理数组对象数据（必选参数）
            childAttr:'child', //[string] 子代属性（可选参数,默认参数是'child'）
            fn:fn:function(obj,originData,deep,parentLine){
                //obj 待处理数据对象
                //originData 引用数据源
                //deep 当前待处理数据对象的深度
                //parentLine 待处理数据对象的引用链接
                console.log(deep);
            },//[function] 数据处理函数 （可选参数）
     * })
     * </pre>
     */
    deepDeal:function(opt){
        if(!opt.data){return};
        var originData = opt.data;
        var copyData = JSON.parse(JSON.stringify(originData));
        var childAttr = opt.childAttr || 'child';
        var fn = opt.fn || '';
        function nextDeep(data,deep,parentLine,parentGroup){
            data.forEach(function(obj,idx){
                var line = '';
                var group = [];
                if(parentLine){
                    line = parentLine+'["'+childAttr+'"]'+'['+idx+']';
                    group = group.concat(parentGroup,[idx]);
                }
                else{
                    line = '['+idx+']';
                    group = [idx];
                }

                fn && fn(obj,originData,deep,line,group)
                if(obj[childAttr]){
                    nextDeep(obj[childAttr],++deep,line,group)
                }
            })
        }
        nextDeep(copyData,1)
    },
    /***********************************************
     * Func内部类：字符串的工具方法
     ***********************************************/
    string:{
        /**
         * 清除两边空格
         * @param str [string] 
         * @return {string} 
         */
        trim:function(str){
        　　return str.replace(/(^\s*)|(\s*$)/g, "");
        },
        /**
         * 获得输入框中字符的字节长度
         * @param val [string] 输入字符串
         * @return [num]字节长度 
         */
        getLength:function(val){
            var str = new String(val);  
            var bytesCount = 0;  
            for (var i = 0 ,n = str.length; i < n; i++) {  
                var c = str.charCodeAt(i);  
                if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {  
                    bytesCount += 1;  
                } else {  
                    bytesCount += 2;  
                }  
            }  
            return bytesCount;  
        },
        /**
         * 补零方法
         * @param num [string|num] 输入字符串
         * @param digit [num] 返回结果的位数 
         * @return [string] 补全0的字符串 
         */
        zeroPadding:function(num,digit){
            var str = num + '';
            if(str.length >= digit){return str}
            else if(num.length < digit){
                for(var i = 0;i<digit-num.length;i++){
                    str = '0' + str;
                }
                return str;
            }
        },
    },
    /***********************************************
     * Func内部类：对象的工具方法
     ***********************************************/
    object:{
        /*
         * 两个对象进行融合，相同属性，target对象的属性覆盖origin对象的属性
         * @param origin [obj] 源对象
         * @param target [obj] 目标对象
         * @return [obj] 合并后的新对象
         */
        mergeObj:function(origin,target){
            var cloneOrigin = this.deepClone(origin);
            var cloneTarget = this.deepClone(target);

            for(var attr in cloneTarget){
                // 如果同属性出现在起始对象里
                if(attr in cloneOrigin && this.typeOfData(cloneOrigin[attr]) == 'Object'){
                    this.mergeObj(cloneOrigin[attr],cloneTarget[attr])
                }
                // 如果不是同属性则写入
                else{
                    cloneOrigin[attr] = cloneTarget[attr]
                }
            }
            return cloneOrigin;
        },
        /*
         * 对象深复制
         * @param obj [obj] 源对象
         * @return [obj] 复制后的新对象
         */
        deepClone:function(obj){
            var _obj = JSON.stringify(obj),
            objClone = JSON.parse(_obj);
            return objClone;
        }, 
        /*
         * 创建一个对象，并以目标对象的原型对象作为该对象的原型对象
         * @param obj [obj] 构造函数
         * @return [obj] 复制后的新对象
         */
        extend:function(o){
            function F(){};
            F.prototype = o.prototype;
            return new F();
        },
        /*
         * 寄生组合继承
         * @param son [obj] 子类构造函数
         * @param father[obj] 父类构造函数
         */
        inherit:function(son,father){
            son.prototype = this.extend(father);
            son.prototype.constructor = son;
        },
    },
};

/*****************************************************************
 * CSS样式管理器
 *****************************************************************/
HCEPG.CssManager = HCEPG.CSS = {
    
    /**
     * 判断样式是否存在。
     * @param obj [dom object] dom元素对象
     * @param cls
     * @return {string} 非空字符串-存在样式 空字符串-不存在样式
     */
    hasClass:function(obj, cls){
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'))
    },
    /**
     * 增加样式。
     * @param obj [dom object] dom元素对象
     * @param cls
     */
    addClass:function(obj, cls){
        if (!this.hasClass(obj, cls)) obj.className = obj.className.replace(/(\s*$)/g, "") + " " + cls
    },
    /**
     * 删除样式
     * @param obj [dom object] dom元素对象
     * @param cls
     */
    removeClass:function(obj, cls){
        if (this.hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ')
        }
    },
    /**
     * 获取节点的宽高偏移量(对隐藏元素也有效)
     * @param id [dom object] dom元素对象
     * @param cls
     */
    getSize:function(id){
        var width;
        var height;
        var elem = id instanceof HTMLElement ? id : document.getElementById(id);
        var noneNodes = [];
        var nodeStyle = [];
        getNoneNode(elem); //获取多层display：none;的元素
        setNodeStyle();
        width = elem.offsetWidth;
        height = elem.offsetHeight;
        left = elem.offsetLeft;
        top = elem.offsetTop;

        resumeNodeStyle();
       
        return {
            width : width,
            height : height,
            left : left,
            top : top,
        }
     
        function getNoneNode(node){
            var display = getStyle(node,'display');
            var tagName = node.nodeName.toLowerCase();
            if(display != 'none'&& tagName != 'body'){
                getNoneNode(node.parentNode);
            } 
            else {
                noneNodes.push(node);
                if(tagName != 'body') getNoneNode(node.parentNode);
            }
        }
       
       
        function setNodeStyle(){
            for(var i = 0; i < noneNodes.length; i++){

                var visibility = getStyle(noneNodes[i],'visibility');
                var display = getStyle(noneNodes[i],'display');
                var style = noneNodes[i].getAttribute("style");
                //覆盖其他display样式
                noneNodes[i].setAttribute("style", "visibility:hidden;display:block !important;" + style);
                nodeStyle[i] = {
                    visibility :visibility,
                    display : display
                }
            }       
        }
       
        function resumeNodeStyle(){
            for(var i = 0; i < noneNodes.length; i++){
                noneNodes[i].style.visibility = nodeStyle[i].visibility;
                noneNodes[i].style.display = nodeStyle[i].display;
            }  
        }
    },
};

/*****************************************************************
 * 机顶盒相关信息操作 JS 工具
 *****************************************************************/
HCEPG.STBUtil = {
    /**
    * 通过键值获取机顶盒对应信息
    * @param  name [参数名] ex:UserToken--用户token,EPGDomain--EPG域名,areaid--地区编码,templateName--当前用户模板
    * @return []
    */
    getSTBKey:function(name){
        var value = '';
        if (typeof (Authentication) === "object") {
            if(Authentication.CTCGetConfig){
                value = Authentication.CTCGetConfig(name);
            }
            else if(Authentication.CUGetConfig){
                value = Authentication.CUGetConfig(name);
            }
            
        }
        return value;
    },
    /**
    * 通过键值设置机顶盒对应信息
    * @param  name [参数名]
    * @param  value [参数值]
    */
    setSTBKey:function(name,value){
        if (typeof (Authentication) === "object") {
            Authentication.CTCSetConfig(name,value);
        } 
    },
    /**
     * 获取机顶盒 用户账号/业务账号
     * @return {string}
     */
    getUserId:function(){
        
        var stbUID = "";
        if (typeof (Authentication) === "object") {
            //此方法经测试目前可以获取到华为，中兴，创维三款机顶盒型号
            stbUID = Authentication.CTCGetConfig("UserID");
            if (!stbUID) {
                stbUID = Authentication.CUGetConfig("UserID");
            }

            if (!stbUID) {
                // 安徽电信 创维盒子需要用username来获取业务帐号
                stbUID = Authentication.CTCGetConfig("username");
            }

            if (!stbUID) {
                stbUID = Authentication.CUGetConfig("username");
            }

            // 烽火的机顶盒
            if (!stbUID) {
                stbUID = Authentication.CTCGetConfig("device.userid");
            }
        }

        // 中兴老的盒子获取机顶盒型号的方法
        if (!stbUID && typeof (ztebw) == "object") {
            stbModel = ztebw.ioctlRead("infoZTEHWType");
            if (!stbModel) {
                stbModel = ztebw.ioctlRead("infoHWProduct");
            }
        }

        // 长虹机顶盒获取账号（四川广电：智能卡号）方法
        if (!stbUID && typeof (CAManager) === "object") {
            stbUID = CAManager.cardSerialNumber;
        }

        return stbUID;
    },

    /**
     * 获取机顶盒 设备ID
     * @return {string}
     */
    getSTBId:function(){
        var stbId = "";
        if (typeof (Authentication) == "object") {
            stbId = Authentication.CTCGetConfig("STBID");
            if (!stbId) {
                stbId = Authentication.CUGetConfig("STBID");
            }
            if (!stbId) {
                stbId = Authentication.CTCGetConfig("device.stbid"); // 烽火的机顶盒
            }
        }

        // 广西广电获取stbId
        if (!stbId && typeof (guangxi) === "object") {
            stbId = guangxi.getStbNum();
        }

        return stbId;
    },

    /**
     * 获取机顶盒型号
     * @return {string}
     */
    getSTBModel:function(){
        var stbModel = "";
        if (typeof (Authentication) == "object") {
            // 此方法经测试目前可以获取到华为，中兴，创维三款机顶盒型号
            stbModel = Authentication.CTCGetConfig("STBType");
            if (!stbModel) {
                stbModel = Authentication.CUGetConfig("STBType");
            }
            if (!stbModel) {
                stbModel = Authentication.CTCGetConfig("device.stbmodel"); // 烽火的机顶盒
            }
        }

        // 中兴老的盒子获取机顶盒型号的方法
        if (!stbModel && typeof (ztebw) == "object") {
            stbModel = ztebw.ioctlRead("infoZTEHWType");
            if (!stbModel) {
                stbModel = ztebw.ioctlRead("infoHWProduct");
            }
        }

        // 长虹机顶盒获取型号（四川广电）
        if (!stbModel && typeof (HardwareInfo) === "object" && typeof (HardwareInfo.STB) === "object") {
            stbModel = HardwareInfo.STB.model;
        }

        return stbModel;
    },

    /**
     * 获取机顶盒mac地址
     * @return {string}
     */
    getSTBMac:function(){
        if (window.isWinOS) { //Windows操作系统
            return "00-00-00-00-00-00";
        }

        var mac = "";
        if (typeof (Authentication) == "object") {
            try {
                mac = Authentication.CUGetConfig("mac");
                if (!mac && typeof (ztebw) == "object") {
                    var stbId = ztebw.ioctlRead("infoHWSN");
                    mac = stbId.substring(stbId.length - 12);
                }

                if (!mac) {
                    mac = Authentication.CTCGetLocalMAC();
                }
            } catch (e) {
            }
        }

        // 广西广电获取mac
        if (!mac && typeof iPanel === "object") {
            mac = iPanel.getGlobalVar("MAC_ETH0");
        }

        // 长虹机顶盒获取mac（四川广电）
        if (!mac && typeof (Ethernet) === "object") {
            mac = Ethernet.MACAddress;
        }

        if (mac) {
            while (mac.indexOf(":") !== -1) {
                mac = mac.replace(":", "");
            }
        } else {
            mac = "00-00-00-00-00-00";
        }
        return mac;
    },

    /**
     * 获取 EPG大厅地址
     * @return {string}
     */
    getEPGDomain:function(){
        var epgDomain = "";
        if (typeof (Authentication) == "object") {
            epgDomain = Authentication.CTCGetConfig("EPGDomain");
            if (!epgDomain) {
                epgDomain = Authentication.CUGetConfig("EPGDomain");
            }
            if (typeof epgDomain === "undefined" || epgDomain == null) {
                epgDomain = "";
            }
        }
        return epgDomain;
    },

    /**
     * 获取 UserToken
     * @return {string}
     */
    getUserToken:function(){
        var userToken = "";
        if (typeof (Authentication) == "object") {
            userToken = Authentication.CTCGetConfig("UserToken");
            if (!userToken) {
                userToken = Authentication.CUGetConfig("UserToken");
            }
            if (!userToken) {
                userToken = Authentication.CTCGetConfig("device.usertoken");
            }
        }
        return userToken;
    },
};

/*****************************************************************
 * 自定义按钮控件管理器
 *****************************************************************/
HCEPG.ButtonManager = HCEPG.BM = {
    
    /**
     * 管理器初始化
     * @param {[obj][array]} opt.rule [方向按键规则数组对象(可选)]例子：{0：[0,1,2,3],2:[1,2,3,4]}
     * @param {[obj][function]} opt.sureRules [确定按键规则数组函数(可选)]例子：{0：function(){},2:function(){}}
     * @param {[string]} opt.area [焦点所在区域（可选，默认page）]
     * @param {[string]} opt.keyName [热键的类名，（可选，默认hotButton）]
     * @param {[string]} opt.hoverOn [焦点的类名，（可选，默认on）]
     * @param {[function]} opt.otherRules [其他案件规则（可选，默认空函数）]
     */

    init:function(opt){
        opt = opt ? opt : {};
       
        // 方向键规则
        // 注入默认方向规则
        this.moveRules = this.defMoveRules ? opt.defMoveRules : {};
        this.leftKeyCode = opt.leftKeyCode || 37;
        this.upKeyCode = opt.upKeyCode || 38;
        this.rightKeyCode = opt.rightKeyCode || 39;
        this.downKeyCode = opt.downKeyCode || 40;
        this.sureKeyCode = opt.sureKeyCode || 13;
        this.backKeyCode = opt.backKeyCode || 8;
        this.num0KeyCode = opt.num0KeyCode || 48;
        this.num1KeyCode = opt.num1KeyCode || 49;
        this.num2KeyCode = opt.num2KeyCode || 50;
        this.num3KeyCode = opt.num3KeyCode || 51;
        this.num4KeyCode = opt.num4KeyCode || 52;
        this.num5KeyCode = opt.num5KeyCode || 53;
        this.num6KeyCode = opt.num6KeyCode || 54;
        this.num7KeyCode = opt.num7KeyCode || 55;
        this.num8KeyCode = opt.num8KeyCode || 56;
        this.num9KeyCode = opt.num9KeyCode || 57;


        // 特殊规则假值处理
        this.moveRules = opt.moveRules || {};
        // 特殊按键规则
        this.otherRules = opt.otherRules ? opt.otherRules : function(){};
        // 按键回调函数
        this.callbackRules = opt.callbackRules ? opt.callbackRules : function(){};

        // 特殊函数绑定事件（传函数名）
        this.keyLeftFn = opt.keyLeftFn;
        this.keyUpFn = opt.keyUpFn;
        this.keyRightFn = opt.keyRightFn;
        this.keyDownFn = opt.keyDownFn;
        this.keyEnterFn = opt.keyEnterFn;
        this.keyBackFn = opt.keyBackFn;


        // 悬浮类名
        this.hoverOn = opt.hoverOn ? opt.hoverOn : "hoverOn";

        // 按钮节点
        this.btnDom;
        // 按钮所在按钮组的索引值
        this.btnIdx;
        // 按钮组类名
        this.btnCls;
       
        // 下一个按钮节点
        this.nextBtnDom
        // 下一个按钮所在按钮组的索引值
        this.nextBtnIdx;
        // 下一个按钮组类名
        this.nextBtnCls;

        // 历史焦点
        this.historyFocus = opt.historyFocus || this.historyFocus || {}; 
    },
    // 移动动作
    moveAction:function(key){
        var _this = this;
        // 当前按下的方向键
        var dir = '';
        // 当前热键所在边缘
        var borDir = '';
        if(key == 37){
            dir = 'left';
            borDir = 'borderLeft';
        }
        else if(key == 38){
            dir = 'up';
            borDir = 'borderUp';
        }
        else if(key == 39){
            dir = 'right';
            borDir = 'borderRight';
        }
        else if(key == 40){
            dir = 'down';
            borDir = 'borderDown';
        }

        // 当前所用按钮组规则
        var btnClsRules = _this.moveRules[_this.btnCls] || {};
        // 矩形按钮组列数
        var cols = btnClsRules['cols'] || '';
        if(cols == 'auto'){cols = getShow(_this.btnCls).length;}
        // 如果列数是函数则返回函数执行结果（针对列数动态变化的情况）
        if(cols instanceof Function){cols = cols();}
        // 矩形按钮组行数
        var rows = cols ? Math.ceil(document.getElementsByClassName(_this.btnCls).length/ cols): '';
        // 当前单元在第几列（从1开始）
        var unitCol = cols ? (_this.btnIdx*1%cols)+1 : '';
        // 当前单元在第几行（从1开始）
        var unitRow = cols ? Math.ceil((_this.btnIdx*1+1)/cols) : '';
        // 当前节点规则
        var domRule = _this.btnDom.getAttribute("unit-"+dir);
        // 目标值（数字 或 ‘类名+数字’ 或 函数）
        var des;

        // 如果目标值是数值0，得做特殊处理，把它转成字符串。否则0会被当做假值判断
        if(btnClsRules[_this.btnIdx] && btnClsRules[_this.btnIdx][dir] == 0){
            btnClsRules[_this.btnIdx][dir] = btnClsRules[_this.btnIdx][dir] + '';
        }
        else if(btnClsRules[borDir] && btnClsRules[borDir] == 0){
            btnClsRules[borDir] = btnClsRules[borDir] + '';
        }
        else if(btnClsRules[dir] && btnClsRules[dir] == 0){
            btnClsRules[dir] = btnClsRules[dir] + '';
        }

        // 针对单个按钮
        if(
            btnClsRules[_this.btnIdx] 
            && btnClsRules[_this.btnIdx][dir]
        ){
            des = btnClsRules[_this.btnIdx][dir];
        }
        // 针对矩形按钮组的边缘按钮
        else if(
            unitCol == 1 && borDir == 'borderLeft' && btnClsRules[borDir]
            || unitCol == cols && borDir == 'borderRight' && btnClsRules[borDir]
            || unitRow == 1 && borDir == 'borderUp' && btnClsRules[borDir]
            || unitRow == rows && borDir == 'borderDown' && btnClsRules[borDir]
            || _this.btnIdx == (document.getElementsByClassName(_this.btnCls).length -1) && borDir == 'borderRight' && btnClsRules[borDir]
        ){
            des = btnClsRules[borDir]
        }
        // 针对整个按钮组
        else if(btnClsRules[dir]){
            des = btnClsRules[dir]
        }
        // 节点按钮规则
        else if(domRule){
            des = domRule;
        } 
        // 矩形按钮组的默认规则
        else if(cols){
            if(unitCol > 1 && dir == 'left') des = '--'
            else if(unitCol < cols && dir == 'right') des = '++'
            else if(unitRow > 1 && dir == 'up') des = '--'+cols 
            else if(unitRow < rows && dir == 'down') des = '++'+cols
        }
        // 一般默认规则
        // else{
        //     if(dir == 'left') des = '--'
        //     else if(dir == 'right') des = '++' 
        // }
        
        // 目标值是函数，执行该函数返回新目标值
        if(des instanceof Function){
            des = des(key,_this.btnDom,_this.btnCls,_this.btnIdx)+'' ? des(key,_this.btnDom,_this.btnCls,_this.btnIdx) : domRule ;
        }
        //数值转换成字符串方便接下来的操作
        if(typeof des == 'number'){
            des = String(des)
        }
        
        // 目标按钮组
        var doms
        
        // 如果存在目标值
        if(des){
            // 如果目标值存在多个,按顺序优先获取存在的目标值
            var desArr = des.split('|');
            while(desArr.length>0){
                var cur = desArr.shift();
                // 如果是数字
                if(typeof (cur*1) == 'number' && !isNaN(cur*1)){
                    // 按钮所在按钮组的索引值
                    _this.nextBtnIdx = cur;
                    _this.nextBtnCls = _this.btnCls;
                }
                // 如果是' "++num" 或 “--num"  '
                else if(cur.indexOf('--') != -1){
                    _this.nextBtnCls = _this.btnCls;
                    _this.nextBtnIdx = _this.btnIdx*1 - (cur.split('--')[1]?cur.split('--')[1]:1)*1 + '';
                }
                else if(cur.indexOf('++') != -1){
                    _this.nextBtnCls = _this.btnCls;
                    _this.nextBtnIdx = _this.btnIdx*1 + (cur.split('++')[1]?cur.split('++')[1]:1)*1 + '';
                }
                // 如果是'类名-数字'
                else if(cur.indexOf("-")!=-1){
                    _this.nextBtnCls = cur.split('-')[0];
                    _this.nextBtnIdx = cur.split('-')[1];
                }
                // 如果是'~类名'
                else if(
                    cur.indexOf("~")!=-1 
                    && cur.split('~')[1] 
                    && _this.historyFocus[_this.btnCls +'-'+ dir]
                    && _this.historyFocus[_this.btnCls +'-'+ dir][cur.split('~')[1]]
                ){

                    _this.nextBtnCls = _this.historyFocus[_this.btnCls +'-'+ dir][cur.split('~')[1]]['cls'];
                    _this.nextBtnIdx = _this.historyFocus[_this.btnCls +'-'+ dir][cur.split('~')[1]]['idx'];
                }
                // 如果是'!函数名'（注意，函数的返回值格式规定'类名-数字'）
                else if(cur.indexOf("!")!=-1){
                    var fn = cur.split('!')[1];
                    var res = eval(fn+'()') ;
                    if(res.split('-')[0] && res.split('-')[1]){
                        _this.nextBtnCls = res.split('-')[0];
                        _this.nextBtnIdx = res.split('-')[1];
                    }
                    else{
                        _this.nextBtnCls = '';
                        _this.nextBtnIdx = '';
                    }
                }
                doms = [];
                // for(var i = 0;i<document.getElementsByClassName(_this.nextBtnCls).length;i++){
                //     if(isShow_v2(document.getElementsByClassName(_this.nextBtnCls)[i])){
                //         doms.push(document.getElementsByClassName(_this.nextBtnCls)[i])
                //     }
                // }
                doms = getShow(_this.nextBtnCls)
                if(_this.nextBtnCls && _this.nextBtnIdx && doms[_this.nextBtnIdx]&&isShow_v2(doms[_this.nextBtnIdx])){break;}
            }



            // 如果目标热键类名和当前热键类名不一致，把当前热键类名索引记录下来 
            if(_this.nextBtnCls && _this.btnCls != _this.nextBtnCls && doms.length>0){
                if(key == 38){
                    if(!_this.historyFocus[_this.nextBtnCls+'-down']){
                        _this.historyFocus[_this.nextBtnCls+'-down']={}
                    }
                    if(!_this.historyFocus[_this.nextBtnCls+'-down'][_this.btnCls]){
                        _this.historyFocus[_this.nextBtnCls+'-down'][_this.btnCls] = {}
                    }
                    _this.historyFocus[_this.nextBtnCls+'-down'][_this.btnCls]['idx'] = _this.btnIdx;
                    _this.historyFocus[_this.nextBtnCls+'-down'][_this.btnCls]['cls'] = _this.btnCls;
                }
                else if(key == 39){
                    if(!_this.historyFocus[_this.nextBtnCls+'-left']){
                        _this.historyFocus[_this.nextBtnCls+'-left']={}
                    }
                    if(!_this.historyFocus[_this.nextBtnCls+'-left'][_this.btnCls]){
                        _this.historyFocus[_this.nextBtnCls+'-left'][_this.btnCls] = {}
                    }
                    _this.historyFocus[_this.nextBtnCls+'-left'][_this.btnCls]['idx'] = _this.btnIdx;
                    _this.historyFocus[_this.nextBtnCls+'-left'][_this.btnCls]['cls'] = _this.btnCls;
                }
                else if(key == 40){
                    if(!_this.historyFocus[_this.nextBtnCls+'-up']){
                        _this.historyFocus[_this.nextBtnCls+'-up']={}
                    }
                    if(!_this.historyFocus[_this.nextBtnCls+'-up'][_this.btnCls]){
                        _this.historyFocus[_this.nextBtnCls+'-up'][_this.btnCls]={}
                    }
                    _this.historyFocus[_this.nextBtnCls+'-up'][_this.btnCls]['idx'] = _this.btnIdx;
                    _this.historyFocus[_this.nextBtnCls+'-up'][_this.btnCls]['cls'] = _this.btnCls;
                }
                else if(key == 37){
                    if(!_this.historyFocus[_this.nextBtnCls+'-right']){
                        _this.historyFocus[_this.nextBtnCls+'-right']={}
                    }
                    if(!_this.historyFocus[_this.nextBtnCls+'-right'][_this.btnCls]){
                        _this.historyFocus[_this.nextBtnCls+'-right'][_this.btnCls]={}
                    }
                    _this.historyFocus[_this.nextBtnCls+'-right'][_this.btnCls]['idx'] = _this.btnIdx;
                    _this.historyFocus[_this.nextBtnCls+'-right'][_this.btnCls]['cls'] = _this.btnCls;
                }

            }
            // 如果不存在目标值对应的按钮
            if(doms.length==0 || !getShow(_this.nextBtnCls)[_this.nextBtnIdx]){
                _this.nextBtnCls = _this.btnCls;
                _this.nextBtnIdx = _this.btnIdx;
                doms = getShow(_this.nextBtnCls)
            }
        }
        // 如果不存在目标值
        else{
            _this.nextBtnCls = _this.btnCls;
            _this.nextBtnIdx = _this.btnIdx;
            doms = [];
            doms = getShow(_this.nextBtnCls)
        }
        _this.nextBtnDom = doms[_this.nextBtnIdx];
        

        // 如果存在视窗滑动则执行滑动
        if(
            _this.nextBtnDom
            &&_this.nextBtnDom.parentNode
            && _this.nextBtnDom.parentNode.parentNode
            && _this.nextBtnDom.parentNode.hasAttribute('isbox') 
            && _this.nextBtnDom.parentNode.parentNode.hasAttribute('isview')
        ){
            var view = _this.nextBtnDom.parentNode.parentNode;
            var scroll = _this.nextBtnDom.parentNode;
            _this.xScroll(view,scroll);
            _this.yScroll(view,scroll);
        }


        _this.handleAction(key,_this.btnDom,_this.btnCls,_this.btnIdx,_this.nextBtnDom,_this.nextBtnCls,_this.nextBtnIdx)
        

    },
    // 除方向键以外的其他动作
    otherAction:function(key){
        var _this = this;
        // 执行按键回调函数
        _this.callbackRules(key,_this.btnDom,_this.btnCls,_this.btnIdx,_this.nextBtnDom,_this.nextBtnCls,_this.nextBtnIdx);
    },
    // 按键关闭
    btnClose:function(){
        var _this = this;
        document.onkeydown = null;
        if(window[_this.keyLeftFn]){
            window[_this.keyLeftFn] = null;
        }
        if(window[_this.keyUpFn]){
            window[_this.keyUpFn] = null;
        }
        if(window[_this.keyRightFn]){
            window[_this.keyRightFn] = null;
        }
        if(window[_this.keyDownFn]){
            window[_this.keyDownFn] = null;
        }
        if(window[_this.keyEnterFn]){
            window[_this.keyEnterFn] = null;
        }
        if(window[_this.keyBackFn]){
            window[_this.keyBackFn] = null;
        }
    },
    // 按键打开
    btnOpen:function(){
        var _this = this;
        // 键盘绑定事件
        document.onkeydown = function(e){
            // 兼容
            var e = e || window.event;
            // 阻止默认行为（防止类似整屏移动的情况发生）
            if(e.preventDefault){e.preventDefault();}
            else{e.returnValue = false;}
            var key = e.keyCode || e.which;
            // 兼容EC6108V9盒子
            // if(key<0 || key>255){key = e.charCode;}
            // 方向键处理
            if(key == _this.leftKeyCode){_this.moveAction(37);}
            else if(key == _this.upKeyCode){_this.moveAction(38);}
            else if(key == _this.rightKeyCode){_this.moveAction(39);}
            else if(key == _this.downKeyCode){_this.moveAction(40);}
            // 其他键（如确定键，返回键和数字键）
            else{_this.otherAction(key);}
        }  
        // 特定函数绑定事件
        if(_this.keyLeftFn){window[_this.keyLeftFn] = function(){_this.moveAction(37);}}
        if(_this.keyUpFn){window[_this.keyUpFn] = function(){_this.moveAction(38);}}
        if(_this.keyRightFn){window[_this.keyRightFn] = function(){_this.moveAction(39);}}
        if(_this.keyDownFn){window[_this.keyDownFn] = function(){_this.moveAction(40);}}
        if(_this.keyEnterFn){window[_this.keyEnterFn] = function(){_this.otherAction(13);}}
        if(_this.keyBackFn){window[_this.keyBackFn] = function(){_this.otherAction(8);}}
    },
    // 处理行为
    handleAction:function(key,btnDom,btnCls,btnIdx,nextBtnDom,nextBtnCls,nextBtnIdx){
        var _this = this;
        
        _this.callbackRules(key,btnDom,btnCls,btnIdx,nextBtnDom,nextBtnCls,nextBtnIdx);
        _this.nextBtnDom = null;
        _this.nextBtnCls = null;
        _this.nextBtnIdx = null;
    },
    // 改变悬浮焦点
    changehover:function(nextBtnCls,nextBtnIdx){
        var _this = this;
        _this.nextBtnCls = nextBtnCls;
        _this.nextBtnIdx = nextBtnIdx;        

        // 焦点改变
        // 如果当前没有焦点，则无需去除类名
        if(_this.btnDom){HCEPG.CssManager.removeClass(_this.btnDom,_this.hoverOn);}
        var doms = getShow(_this.nextBtnCls);

        // 如果下一个悬浮焦点存在才移动
        if(doms[_this.nextBtnIdx]){
            HCEPG.CssManager.addClass(doms[_this.nextBtnIdx],_this.hoverOn);
            _this.nextBtnDom = doms[_this.nextBtnIdx];
            // 重置当前按钮
            _this.btnDom = _this.nextBtnDom;
            _this.btnCls = _this.nextBtnCls;
            _this.btnIdx = _this.nextBtnIdx;

            _this.nextBtnCls = '';
            _this.nextBtnIdx = '';
            _this.nextBtnDom = '';
        }
    },
    // 水平滑动
    xScroll:function(view,scroll){
        var _this = this;
        if(view && scroll && _this.nextBtnDom){
            if( _this.nextBtnDom.offsetLeft + _this.nextBtnDom.offsetWidth > scroll.offsetLeft*-1 + view.offsetWidth ){
                scroll.style.left = scroll.offsetLeft - ((_this.nextBtnDom.offsetLeft + _this.nextBtnDom.offsetWidth) - (scroll.offsetLeft*-1 + view.offsetWidth)) + 'px';
            }
            else if( _this.nextBtnDom.offsetLeft < scroll.offsetLeft*-1 ){
                scroll.style.left = scroll.offsetLeft + (scroll.offsetLeft*-1 - _this.nextBtnDom.offsetLeft) + "px";
            }
        }
    },
    // 垂直滑动
    yScroll:function(view,scroll){
        var _this = this;
        if(view && scroll && _this.nextBtnDom){
            if( _this.nextBtnDom.offsetTop + _this.nextBtnDom.offsetHeight > scroll.offsetTop*-1 + view.offsetHeight ){
                scroll.style.top = scroll.offsetTop - ((_this.nextBtnDom.offsetTop + _this.nextBtnDom.offsetHeight) - (scroll.offsetTop*-1 + view.offsetHeight)) + 'px';
            }
            else if( _this.nextBtnDom.offsetTop < scroll.offsetTop*-1 ){
                scroll.style.top = scroll.offsetTop + (scroll.offsetTop*-1 - _this.nextBtnDom.offsetTop) + "px";
            }
        }
    },
};

/*****************************************************************
 * UI管理器
 *****************************************************************/
HCEPG.UI = {
    /**
     * 弹窗提示
     * @param text [string] 需要展示的文本
     * @param time [num] 时间秒为单位 
     */
    tips:function(text, time){
        time = time ? time : 1.5;
        time*=1000;

        var para = document.createElement("p"); //创建新的<p> 元素
        para.innerHTML = text;
        para.className = 'tips'
        para.style.display = 'inline-block';
        para.style.textAlign = 'center';
        para.style.backgroundColor = '#000000';
        para.style.color = '#ffffff';
        para.style.fontSize = '24px';
        para.style.borderRadius = '9px';
        para.style.padding = '10px 40px';
        para.style.zIndex = 10000;
        para.style.width = '300px';
        para.style.wordBreak = 'break-word';
        para.style.position = 'absolute';

        document.body.appendChild(para);
        para.style.left = (1280 - para.offsetWidth)/2 + 'px';
        para.style.top = (720 - para.offsetHeight)/2 + 'px';
        para.timer = setTimeout(function() {
            clearInterval(para.timer);
            document.body.removeChild(para);
        }, time);   
    },
    /**
     * 同类名元素只展示一个元素,其他隐藏
     * @param cls [string|arr dom] dom元素类名
     * @param idx [num] 需要展示的dom元素索引
     */
    sOne:function(cls,idx){
        var doms;
        if(typeof cls == 'string'){
            doms = document.getElementsByClassName(cls);
        }
        else{
            doms = cls;
        }
        doms[idx*1].style.visibility = 'visible';
        for(var i = 1; i<doms.length ; i++){
            doms[(idx*1+i)%doms.length].style.visibility = 'hidden';
        }
    },
    showOne:function(cls,idx){
        var doms;
        if(typeof cls == 'string'){
            doms = document.getElementsByClassName(cls);
        }
        else{
            doms = cls;
        }
        doms[idx*1].style.display = 'block';
        for(var i = 1; i<doms.length ; i++){
            doms[(idx*1+i)%doms.length].style.display = 'none';
        }
    },
    /**
     * 缓冲运动
     * @param ele [dom object] dom元素对象
     * @opt [obj] dom节点各css属性的目标值
     * @callback [function] 回调函数
     */
    animate:function(ele,opt,callback){
        //设置一个变量用于判断动画数量
        var timerLen = 0;
        for(var attr in opt){
            creatTimer(attr);
            //每加一个定时器，动画数加一
            timerLen++;
        }
        function creatTimer(attr){
            var timerName = attr + 'timer';console.log(timerName)
            var target = opt[attr];
            clearInterval(ele[timerName]);
            ele[timerName] = setInterval(function(){
                // 先获取当前值
                var current = getComputedStyle(ele)[attr];

                // 提取数值：单位
                // 根据当前值提取单位(单位在current最后面)
                var unit = current.match(/[a-z]+$/);
                if(unit){
                    current = current.substring(0,unit.index)*1;
                    unit = unit[0]
                }else{
                    unit = '';
                    current *= 1;
                }

                // 计算速度
                var speed = (target - current)/10;

                // 处理speed值，防止speed为小数而造成定时器无法完成的情况
                // 0.3=>1,-0.3=>-1
                speed = speed>0 ? Math.ceil(speed) : Math.floor(speed);

                //对于没有单位的属性单独处理
                if(attr == 'opacity'){
                    speed = speed>0?0.05:-0.05;
                }
                

                if(current === target){
                    clearInterval(ele[timerName]);
                    current = target - speed;
                    //每完成一个动画，timerLen减一
                    timerLen--
                    //最后若timerLen数量为零，则所有动画已经执行完再执行回调函数
                    if(typeof callback ==='function'&&timerLen==0){
                        callback();
                    }
                    
                }
                ele.style[attr] = current + speed + unit;
            },30)
        };
    },
    /**
     * 元素淡入淡出效果
     * @param ele: 元素
     * @param tar：目标透明度
     * @param gap：定时器间隔
     * @param fn：回调
     */
    fade:function(ele,tar,gap,fn){
        if(!ele){return};
        if(HCEPG.Func.typeOfData(tar) != 'Number'){return};
        gap = gap ? gap : 50;

        tar = tar.toString();
        tar = tar ? tar : 1; 
        
        ele['timer'] = setInterval(function(){
            var next
            if(getStyle(ele,'opacity')*1<tar){
                next = getStyle(ele,'opacity')*1 + 0.1 > tar ? tar : getStyle(ele,'opacity')*1 + 0.1
                ele.style.opacity = next;
                if(next>=tar){
                    clearInterval(ele['timer'])
                    fn && fn();
                }
            }
            else{
                next = getStyle(ele,'opacity')*1 - 0.1 < tar ? tar : getStyle(ele,'opacity')*1 - 0.1
                ele.style.opacity = next;
                if(next<=tar){
                    clearInterval(ele['timer'])
                    fn && fn();
                }
            }
        }, gap)
    },
    /**
     * 视窗滑动
     * @param view: 视窗节点
     * @param scroll：滑动栏节点
     * @param nextBtn：焦点对应节点
     * @param dir：滑动方向
     * @param offsetValue:偏移值
     */
    scroll:function(view,scroll,nextBtn,dir,offsetValue){
        offsetValue = offsetValue || 0;
        if(view && scroll && nextBtn && dir){
            var styleAttr;
            var offset1Attr;
            var offset2Attr;
            if(dir == 'x'){
                styleAttr = 'left';
                offset1Attr = 'offsetLeft';
                offset2Attr = 'offsetWidth'
            }
            else{
                styleAttr = 'top';
                offset1Attr = 'offsetTop';
                offset2Attr = 'offsetHeight'
            }

            if(
                   this.getTarDomOffset(nextBtn,scroll,offset1Attr) + nextBtn[offset2Attr]
                >  this.getTarDomOffset(scroll,view,offset1Attr)*-1 + view[offset2Attr]
            ){
                scroll.style[styleAttr] = this.getTarDomOffset(scroll,view,offset1Attr) - ((this.getTarDomOffset(nextBtn,scroll,offset1Attr) +
                nextBtn[offset2Attr] ) - (this.getTarDomOffset(scroll,view,offset1Attr)*-1 + view[offset2Attr])) + offsetValue*-1 + 'px';
            }
            else if(this.getTarDomOffset(nextBtn,scroll,offset1Attr)  < this.getTarDomOffset(scroll,view,offset1Attr)*-1  ){
                scroll.style[styleAttr] = this.getTarDomOffset(scroll,view,offset1Attr) + (this.getTarDomOffset(scroll,view,offset1Attr)*-1 -  this.getTarDomOffset(nextBtn,scroll,offset1Attr) ) + offsetValue*1 + "px";
            }
        }
    },
    /**
     * 获取子元素和目标元素的相对偏移移
     * @param dom: 子节点
     * @param tarDom：目标节点
     * @param offset：offsetLeft|offsetTop
     */
    getTarDomOffset:function(dom,tarDom,offset){
        if(dom.parentNode == tarDom){
            return dom[offset]
        }
        else{
            if(getStyle(dom.parentNode,'position') == 'static'){
                return this.getTarDomOffset(dom.parentNode,tarDom,offset)
            }
            else{
                return dom[offset] + this.getTarDomOffset(dom.parentNode,tarDom,offset)
            }
        }
    },
    /**
     * 矩形节点组渲染
     * @param opt [obj] 渲染所需参数
     *  HCEPG.UI.rectangleRender({
            realArea:document.getElementById('test'),//[dom object] 渲染数据所在的真实区域（必选参数）
            data:[{name:'len'},{name:'f'},{name:'z'}],//[array] 待渲染数据（必选参数）
            cols:1000, //[num] 列数（必选参数）
            unitStyle:function(opt){
                var temp = document.createElement("div");
                temp.className = "pageBtn pageBtn-"+obj.idx;
                temp.innerText = obj.content;
                return temp;
            },//[function] 节点样式自定义（必选参数）
            realAreaOffsetLeft:'0px',//[string] 真实区域水平偏移量 （可选参数）
            realAreaOffsetTop:'0px',//[string] 真实区域垂直偏移量 （可选参数）
            upNeighbor:document.getElementById('upNeighbor'),//[string] 上邻域类名 (可选参数)
            downNeighbor:document.getElementById('downNeighbor'),//[string] 下邻域类名 (可选参数)
            leftNeighbor:document.getElementById('leftNeighbor'),//[string] 左邻域类名 (可选参数)
            rightNeighbor:document.getElementById('rightNeighbor'),//[string] 右邻域类名 (可选参数)
            isClear:true,//[boolean] 渲染前是否清空真实区域(可选参数,不传默认不清空)
     * })
     * </pre>
     */
    rect:function(opt){
        // 必传参数
        var data = opt.data;
       
        // 矩形容器
        var temp = opt.box;

        // 可选参数
        // 特殊单元宽高
        var speBtn = opt.speBtn || {};
        // 矩形子节点的类名
        var cls = opt.cls || '';
        // 矩形列数
        var cols = opt.cols || data.length;
        if(cols > data.length){cols = data.length;}
        // 矩形行数
        var rows = Math.ceil(data.length/cols); 

        // 矩形宽高
        var boxWidth = 0;
        var boxHeight = 0;

        // 预留空间,渲染时需要留足够的宽度插入节点，节点插入完成后再调节宽度大小
        temp.style.width = '90000px';


        // 矩形邻域
        var neighbor = opt.neighbor || {};
        neighbor['up'] = neighbor['up'] || '';
        neighbor['left'] = neighbor['left'] || '';
        neighbor['right'] = neighbor['right'] || '';
        neighbor['down'] = neighbor['down'] || '';

        // 单元处理
        data.forEach(function(obj,idx){
            // 光标逻辑渲染
            var unitUp = '';
            var unitLeft = '';
            var unitRight = '';
            var unitDown = '';
            var unitWidth = 0;
            var unitHeight = 0;
            if(idx%cols == 0){unitLeft = neighbor['left']}
            else{unitLeft = '--'}
            if((idx+1)%cols == 0 || (idx+1) == data.length){unitRight = neighbor['right']}
            else{unitRight = '++'}
            if(Math.floor((idx)/cols) == 0){unitUp = neighbor['up']}
            else{unitUp = '--'+cols}
            if(Math.floor((idx)/cols) == Math.floor(data.length-1/cols) || (idx+1)+cols>data.length){unitDown = neighbor['down']}
            else{unitDown = '++'+cols}
            
            // 单元节点
            var unit = document.createElement('div');
            unit.style.position = 'relative';
            unit.style.left = '0px';
            unit.style.top = '0px';
            unit.style.float = 'left';
            
            if(unitUp){unit.setAttribute("unit-up",unitUp)}
            if(unitLeft){unit.setAttribute("unit-left",unitLeft)}
            if(unitRight){unit.setAttribute("unit-right",unitRight)}
            if(unitDown){unit.setAttribute("unit-down",unitDown)}
            // 矩形中节点的子节点
            var child = opt.child(unit,obj,idx) || '';

            if(child){unit.innerHTML = child}

            for(var attr in obj){
                unit.setAttribute(attr,obj[attr])
            }

            temp.appendChild(unit)

            if(idx%cols == cols - 1 && unit.offsetLeft + unit.offsetWidth > boxWidth){
                boxWidth = unit.offsetLeft + unit.offsetWidth + getStyle(unit,'margin-right').match(/\d*/)[0]*1
                temp.style.width = boxWidth+'px';
            }
            if(Math.ceil((idx+1)/cols) == rows && unit.offsetTop + unit.offsetHeight > boxHeight){
                boxHeight = unit.offsetTop + unit.offsetHeight + getStyle(unit,'margin-bottom').match(/\d*/)[0]*1
                temp.style.height = boxHeight+'px';
            }
        })    
    },
    /**
     * 瀑布流节点组渲染
     * @param opt [obj] 渲染所需参数
     *  HCEPG.UI.rectangleRender({
            realArea:document.getElementById('test'),//[dom object] 渲染数据所在的真实区域（必选参数）
            data:[{name:'len'},{name:'f'},{name:'z'}],//[array] 待渲染数据（必选参数）
            cols:1000, //[num] 列数（必选参数）
            unitStyle:function(opt){
                var temp = document.createElement("div");
                temp.className = "pageBtn pageBtn-"+obj.idx;
                temp.innerText = obj.content;
                return temp;
            },//[function] 节点样式自定义（必选参数）
            realAreaOffsetLeft:'0px',//[string] 真实区域水平偏移量 （可选参数）
            realAreaOffsetTop:'0px',//[string] 真实区域垂直偏移量 （可选参数）
            upNeighbor:document.getElementById('upNeighbor'),//[string] 上邻域类名 (可选参数)
            downNeighbor:document.getElementById('downNeighbor'),//[string] 下邻域类名 (可选参数)
            leftNeighbor:document.getElementById('leftNeighbor'),//[string] 左邻域类名 (可选参数)
            rightNeighbor:document.getElementById('rightNeighbor'),//[string] 右邻域类名 (可选参数)
            isClear:true,//[boolean] 渲染前是否清空真实区域(可选参数,不传默认不清空)
     * })
     * </pre>
     */
    waterfall:function(opt){
        var opt = opt || {};
        // 矩形容器
        var temp = opt.box;
        // 必传参数
        var data = opt.data;
        // 每一列的长度
        var lineWidth = opt.lineWidth;

        // 可选参数
        // 自适应参数
        var selfAdaption = opt.selfAdaption || false
        // 回调函数
        var callback = opt.callback || function(){};

        // 瀑布流的方向
        var dir = opt.dir || 'y';
 

        // 邻域
        var neighbor = opt.neighbor || {};
        neighbor['up'] = neighbor['up'] || '';
        neighbor['left'] = neighbor['left'] || '';
        neighbor['right'] = neighbor['right'] || '';
        neighbor['down'] = neighbor['down'] || '';

        
        // 单元属性处理
        data.forEach(function(obj,idx){
            var childBox = document.createElement('div');
            if(typeof obj == 'object'){
                for(var attr in obj){
                    childBox.setAttribute(attr,obj[attr])
                }
            }
            
            var child = opt.child(childBox,obj,idx) || '';
            if(child){childBox.innerHTML = child;}
            temp.appendChild(childBox);
        })

        if(dir == 'x'){temp.style.width = lineWidth+"px";}
        else{temp.style.height = lineWidth+"px";}
        
        

        function arrangement(){
            // 下一列水平距离
            var nextLeft = 0;
            // 下一列垂直距离
            var nextTop = 0;
            // 垂直瀑布流列信息集合
            var cols = [];
            // 列指针
            var colsPointer = 0;
            // 有数据才渲染
            if(data.length>0){
                // 技术偏移值插入节点
                data.forEach(function(obj,i){
                   
                    // 水平填充
                    if(dir == 'x'){
                        temp.children[i].style.position = 'absolute';
                        // 如果存在上一按钮
                        if(i-1>-1){
                            
                            // 目标垂直距离
                            var tarTop = temp.children[i-1].offsetTop + temp.children[i-1].offsetHeight + getStyle(temp.children[i-1],'margin-top').match(/\d*/)[0]*1 + getStyle(temp.children[i-1],'margin-bottom').match(/\d*/)[0]*1
                            // 目标水平距离
                            var tarLeft = temp.children[i-1].offsetLeft + temp.children[i-1].offsetWidth + getStyle(temp.children[i-1],'margin-left').match(/\d*/)[0]*1 + getStyle(temp.children[i-1],'margin-right').match(/\d*/)[0]*1
                            if(tarTop>nextTop){nextTop = tarTop;}
                            //如果超出了列深度，则从下列开始插入
                            if(tarLeft + temp.children[i].offsetWidth + getStyle(temp.children[i],'margin-left').match(/\d*/)[0]*1 + getStyle(temp.children[i],'margin-right').match(/\d*/)[0]*1 >lineWidth){
                                temp.children[i].style.top = nextTop +'px';
                                temp.children[i].style.left = '0px';
                                colsPointer++;
                                
                            }
                            else{
                                temp.children[i].style.top = temp.children[i-1].offsetTop+'px';
                                temp.children[i].style.left = tarLeft+'px';
                            }
                        }
                        else{
                            temp.children[i].style.left = '0px';
                            temp.children[i].style.top = '0px';
                        }
                        

                        if(!cols[colsPointer]){cols[colsPointer] = []}
                        cols[colsPointer].push({
                            idx:i,
                            el:temp.children[i],
                            curCol:colsPointer,
                            top:temp.children[i].offsetTop,
                            left:temp.children[i].offsetLeft,
                            width:temp.children[i].offsetWidth + getStyle(temp.children[i],'margin-left').match(/\d*/)[0]*1 + getStyle(temp.children[i],'margin-right').match(/\d*/)[0]*1,
                            height:temp.children[i].offsetHeight + getStyle(temp.children[i],'margin-top').match(/\d*/)[0]*1 + getStyle(temp.children[i],'margin-bottom').match(/\d*/)[0]*1,
                        })
                    }
                    //垂直填充
                    else{
                        
                        temp.children[i].style.position = 'absolute';
                        
                        // 如果存在上一按钮
                        if(i-1>-1){
                            
                            
                            // 目标垂直距离
                            var tarTop = temp.children[i-1].offsetTop + temp.children[i-1].offsetHeight + getStyle(temp.children[i-1],'margin-top').match(/\d*/)[0]*1 + getStyle(temp.children[i-1],'margin-bottom').match(/\d*/)[0]*1
                            // 目标水平距离
                            var tarLeft = temp.children[i-1].offsetLeft + temp.children[i-1].offsetWidth + getStyle(temp.children[i-1],'margin-left').match(/\d*/)[0]*1 + getStyle(temp.children[i-1],'margin-right').match(/\d*/)[0]*1


                            if(tarLeft>nextLeft){nextLeft = tarLeft;}
                            if(tarTop + temp.children[i].offsetHeight + getStyle(temp.children[i],'margin-top').match(/\d*/)[0]*1 + getStyle(temp.children[i],'margin-bottom').match(/\d*/)[0]*1 >lineWidth){
                                temp.children[i].style.top = '0px';
                                temp.children[i].style.left = nextLeft+'px';
                                colsPointer++;
                                
                            }
                            else{
                                temp.children[i].style.top = tarTop+'px';
                                temp.children[i].style.left = temp.children[i-1].offsetLeft+'px';
                            }
                        }
                        else{
                            temp.children[i].style.left = '0px';
                            temp.children[i].style.top = '0px';
                        }
                        

                        if(!cols[colsPointer]){cols[colsPointer] = []}
                        cols[colsPointer].push({
                            idx:i,
                            el:temp.children[i],
                            curCol:colsPointer,
                            top:temp.children[i].offsetTop,
                            left:temp.children[i].offsetLeft,
                            width:temp.children[i].offsetWidth + getStyle(temp.children[i],'margin-left').match(/\d*/)[0]*1 + getStyle(temp.children[i],'margin-right').match(/\d*/)[0]*1,
                            height:temp.children[i].offsetHeight + getStyle(temp.children[i],'margin-top').match(/\d*/)[0]*1 + getStyle(temp.children[i],'margin-bottom').match(/\d*/)[0]*1,
                        })
                    }
                })

                // 默认按键规则
                for(var k = 0;k<cols.length;k++){
                    for(var l=0;l<cols[k].length;l++){
                        // 水平填充
                        if(dir == 'x'){
                            // 默认左右规则
                            cols[k][l].el.setAttribute('unit-left', '--');
                            cols[k][l].el.setAttribute('unit-right', '++');
                            // 每一行第一个
                            if(l == 0){cols[k][l].el.setAttribute('unit-left', neighbor['left']);}
                            // 每一行最后一个
                            if(l == cols[k].length-1){cols[k][l].el.setAttribute('unit-right', neighbor['right']);}
                            
                            // 默认上下规则
                            if(k>0){
                                for(var o = 0;o<cols[k-1].length;o++){
                                    if(cols[k-1][o].left + cols[k-1][o].width>cols[k][l].left){
                                        cols[k][l].el.setAttribute('unit-up', cols[k-1][o].idx);
                                        break;
                                    }
                                }
                            }
                            if(k<cols.length-1){
                                for(var o = 0;o<cols[k+1].length;o++){
                                    if(cols[k+1][o].left + cols[k+1][o].width>cols[k][l].left){
                                        cols[k][l].el.setAttribute('unit-down', cols[k+1][o].idx);
                                        break;
                                    }
                                }
                            }
                            
                            // 第一行
                            if(k == 0){cols[k][l].el.setAttribute('unit-up', neighbor['up']);}
                            // 最后一行
                            if(k == cols.length-1){cols[k][l].el.setAttribute('unit-down', neighbor['down']);}
                            
                            
                        }
                        // 垂直填充
                        else{
                            // 默认上下规则
                            cols[k][l].el.setAttribute('unit-up', '--');
                            cols[k][l].el.setAttribute('unit-down', '++');
                            // 每一列第一个
                            if(l == 0){cols[k][l].el.setAttribute('unit-up', neighbor['up']);}
                            // 每一列最后一个
                            if(l == cols[k].length-1){cols[k][l].el.setAttribute('unit-down', neighbor['down']);}

                            // 默认左右规则
                            if(k>0){
                                for(var o = 0;o<cols[k-1].length;o++){
                                    if(cols[k-1][o].top + cols[k-1][o].height>cols[k][l].top){
                                        cols[k][l].el.setAttribute('unit-left', cols[k-1][o].idx);
                                        break;
                                    }
                                }
                            }
                            if(k<cols.length-1){
                                for(var o = 0;o<cols[k+1].length;o++){
                                    if(cols[k+1][o].top + cols[k+1][o].height>cols[k][l].top){
                                        cols[k][l].el.setAttribute('unit-right', cols[k+1][o].idx);
                                        break;
                                    }
                                }
                            }
                            
                            // 第一列
                            if(k == 0){
                                cols[k][l].el.setAttribute('unit-left', neighbor['left']);
                            }
                            // 最后一列
                            if(k == cols.length-1){
                                cols[k][l].el.setAttribute('unit-right', neighbor['right']);
                            }
                        }
                        
                    }
                }
                // 水平
                if(dir == 'x'){
                    console.log(temp);
                    temp.style.height = temp.children[temp.children.length-1].offsetHeight + temp.children[temp.children.length-1].offsetTop + getStyle(temp.children[temp.children.length-1],'margin-bottom').match(/\d*/)[0]*1 + 'px'
                }
                // 垂直
                else{
                    temp.style.width = temp.children[temp.children.length-1].offsetWidth + temp.children[temp.children.length-1].offsetLeft + getStyle(temp.children[temp.children.length-1],'margin-right').match(/\d*/)[0]*1 + 'px'
                }
            }
            
        }
        // 是否根据单元图片进行自适应
        if(selfAdaption){
            
                if(temp.getElementsByTagName('img').length>0){
                    var promiseAll = [];
                    for(var u = 0 ;u<temp.getElementsByTagName('img').length;u++){
                        promiseAll.push(new MyPromise(function(resolve,reject){
                            temp.getElementsByTagName('img')[u].onload = function(){
                                resolve()
                            }
                        }))
                    }
                    MyPromise.all(promiseAll)
                    .then(function(){
                        arrangement()
                        callback && callback();
                    })
                }
                else{
                    arrangement()
                }
            
        }
        else{

            arrangement()
        }
        
    },
    /**
     * 矩形节点组渲染
     * @param opt [obj] 渲染所需参数
     *  HCEPG.UI.rectangleRender({
            realArea:document.getElementById('test'),//[dom object] 渲染数据所在的真实区域（必选参数）
            data:[{name:'len'},{name:'f'},{name:'z'}],//[array] 待渲染数据（必选参数）
            childAttr:'child',// [string]（可选参数，默认参数为child）
            boxCls:'navBox',// [string]（可选参数，默认参数navBox）
     * })
     * </pre>
     */
    treeRender:function(opt){
        var _this = this;
        // 承载单元的容器（真实区域，它可能只有部分显示，部分隐藏）
        if(!opt.realArea && opt.realArea.nodeType!=1){return};
        _this.realArea = opt.realArea;
        if(!opt.data && HCEPG.Func.typeOfData(opt.data) != 'Array'){return}
        _this.data = opt.data;
        _this.childAttr = opt.childAttr || 'child';
        _this.boxCls = opt.boxCls || 'navBox';

        function generate(data,childAttr,par,deep,parIdx){
            parIdx = parIdx || 'par';
            data.forEach(function(obj,idx){
                nowDeep = deep;

                var nowDom = '';
                var childBoxDom = '';
                if(par.getElementsByClassName('unit-y-'+deep) && par.getElementsByClassName('unit-y-'+deep)[idx]){
                    nowDom = par.getElementsByClassName('unit-y-'+deep)[idx];
                }
                
                if(par.getElementsByClassName('childBox-y-'+deep) && par.getElementsByClassName('childBox-y-'+deep)[idx]){
                    childBoxDom = par.getElementsByClassName('childBox-y-'+deep)[idx];
                }
                
                if(nowDom){
                    for(var i = 0; i<nowDom.attributes.length ; i++){
                        var attr = nowDom.attributes[i]['name'];
                        //如果说老的属性和新属性不一样。一种是值改变 ，一种是属性被删除 了
                        if (
                            nowDom.getAttribute(attr) != obj[attr]
                        ) {
                            if(attr != 'class' && attr != 'style'){
                                nowDom.setAttribute(attr, obj[attr])
                            }
                            
                        }
                        if(!(attr in obj)){
                            if(attr != 'class' && attr != 'style'){
                                nowDom.removeAttribute(attr) 
                            }
                            
                        }
                    }

                    // 对比旧节点新增的属性
                    for (var attr in obj) {
                        if (!nowDom.hasAttribute(attr) && attr != childAttr) {
                            nowDom.setAttribute(attr, obj[attr])
                        }
                    }
                    if(childBoxDom && obj[childAttr]){
                        generate(obj[childAttr],childAttr,childBoxDom,++nowDeep,parIdx+'.'+idx);
                    }
                }
                else{
                    if(!obj[childAttr]){
                        var temp = document.createElement("div");
                        for(var attr in obj){
                            temp.setAttribute(attr,obj[attr]);
                        }
                        temp.setAttribute('parIdx',parIdx);
                        temp.setAttribute('idx',idx);
                        temp.className = 'unit unit-x-'+idx+' unit-y-'+nowDeep+' '+parIdx;
                        if(opt.unitStyle){
                            temp.innerHTML = opt.unitStyle(temp,obj,idx) || '';
                        }
                        
                        par.appendChild(temp)
                    }
                    else{
                        var temp = document.createElement("div");
                        for(var attr in obj){
                            if(attr != childAttr){
                                temp.setAttribute(attr,obj[attr]);
                            }
                        }
                        temp.setAttribute('parIdx',parIdx);
                        temp.setAttribute('idx',idx);
                        temp.className = 'unit unit-x-'+idx+' unit-y-'+nowDeep+' '+parIdx;
                        if(opt.unitStyle){
                            temp.innerHTML = opt.unitStyle(temp,obj,idx) || '';
                        }

                        par.appendChild(temp);

                        var nextpar=document.createElement('div');
                        nextpar.setAttribute('parIdx',parIdx);
                        nextpar.setAttribute('idx',idx);
                        nextpar.className = 'childBox childBox-x-'+idx+' childBox-y-'+nowDeep+' '+parIdx;
                        par.appendChild(nextpar);
                        generate(obj[childAttr],childAttr,nextpar,++nowDeep,parIdx+'.'+idx);
                    }
                }
                

                
            })
            //如果虚拟节点对象数组比真实对象数组长度短，则删掉多出来的部分
            var unitDomArr = [];
            for(var i = 0;i<par.children.length;i++){
                if(HCEPG.CssManager.hasClass(par.children[i],'unit')){
                    unitDomArr.push(par.children[i]);
                }
            }
            if(unitDomArr.length>data.length){
                for(var j = 0;j<(unitDomArr.length-data.length);j++){
                    par.removeChild(unitDomArr[unitDomArr.length-1])
                }
            }
        }
        generate(_this.data,_this.childAttr,_this.realArea,0)
    },
    treeTraversal:function(dom,fn){
        if(dom.children){
            Array.prototype.forEach.call(dom.children,function(obj,idx){
                fn && fn(obj,idx);
                if(obj.children){HCEPG.UI.treeTraversal(obj,fn)} 
            });
        }
    },
    //遍历
    walk:function(oldNode, newNode, index, patches){
        var currentPatches = []; //这个数组里记录了所有的oldNode的变化
        if (oldNode && !newNode) { //如果新节点没有了，则认为此节点被删除了
            currentPatches.push({type: "REMOVE", index:index});
            oldNode.parentNode.removeChild(oldNode);
        } 
        //如果说老节点的新的节点都是文本节点的话
        else if (typeof(oldNode) == 'string' && typeof(newNode) == 'string') {
            //如果新的字符符值和旧的不一样
            if (oldNode != newNode) {
                ///文本改变
                currentPatches.push({type:"TEXT",content:newNode,index:index});
            }
        } 
        //
        else if (
            newNode.TAGNAME && oldNode.tagName == newNode.TAGNAME
            || !newNode.TAGNAME && oldNode.tagName == 'DIV'
        ) {
            //比较新旧元素的属性对象
            var newNodeAttrs = {};
            for(var attr in newNode){
                if(attr != 'child'&&attr != 'TEXT'&&attr != 'TAGNAME'){
                    newNodeAttrs[attr] = newNode[attr];
                }
            }
            
            var attrsPatch = {};
            for(var i = 0; i<oldNode.attributes.length ; i++){
                //如果说老的属性和新属性不一样。一种是值改变 ，一种是属性被删除 了
                if ( oldNode[oldNode.attributes[i]] != newNodeAttrs[oldNode.attributes[i]]) {
                    attrsPatch[oldNode.attributes[i]] = newNodeAttrs[oldNode.attributes[i]];
                    oldNode.setAttribute(oldNode.attributes[i], newNodeAttrs[oldNode.attributes[i]])
                }
                if(!(oldNode.attributes[i] in newNode)){
                    oldNode.removeAttribute(oldNode.attributes[i]) 
                }
            }
            // for (var attr in oldNode.attributes) {
            //     //如果说老的属性和新属性不一样。一种是值改变 ，一种是属性被删除 了
            //     if (oldNode.attributes[attr] != newNodeAttrs[attr]) {
            //         attrsPatch[attr] = newNodeAttrs[attr];
            //         oldNode.setAttribute(attr, newNodeAttrs[attr])
            //     }
            //     if(!(attr in newNode)){
            //         oldNode.removeAttribute(attr) 
            //     }
            // }

            // 对比旧节点新增的属性
            for (var attr in newNodeAttrs) {
                if (!oldNode.attributes[attr]) {
                    attrsPatch[attr] = newNodeAttrs[attr];
                    oldNode.setAttribute(attr, newNodeAttrs[attr])
                }
            }

            //如果新旧元素有差异的属性的话
            if (JSON.stringify(attrsPatch) != "{}") {
                //添加到差异数组中去
                currentPatches.push({type: "ATTRS", attrs: attrsPatch,index:index});
            }
            //自己比完后再比自己的儿子们
            // diffChildren(oldNode.children, newNode.children, index, patches, currentPatches);

            Array.prototype.forEach.call(oldNode.children,function(child, idx){
                var nextChild = ''
                if(newNode.child && newNode.child[idx]){
                    nextChild = newNode.child[idx]
                }

                HCEPG.UI.walk(child, nextChild, index+'.'+idx, patches);
            })
            // oldNode.children.forEach(function(child, idx){
            //     HCEPG.UI.walk(child, newNode.child[idx], index+'.'+idx, patches);
            // });
        } 
        else{
            currentPatches.push({type: "REPLACE", node: newNode,index:index});
            var temp = document.createElement('div');
            for(var attr in newNode){
                temp.setAttribute(attr, newNode[attr]);
            }
            oldNode.parentNode.insertBefore(temp,oldNode);
            oldNode.parentNode.removeChild(oldNode);

            // oldNode.children.forEach(function(child, idx){
            //     HCEPG.UI.walk(child, newNode.child[idx], index+'.'+idx, patches);
            // });
            Array.prototype.forEach.call(oldNode.children,function(child, idx){
                HCEPG.UI.walk(child, newNode.child[idx], index+'.'+idx, patches);
            })
        }
        if (currentPatches.length > 0) {
            patches[index] = currentPatches;
        }
    },
};


/**
 * 兼容旧环境
 * 参考: http://es5.github.com/#x15.4.4.19
 * 针对浏览器不支持ES 2015 引用类型Array: forEach、map、filter、some、every
 * */
(function () {
    if(!Function.prototype.apply){ 
        Function.prototype.apply = function(obj, args){ 
            obj = obj == undefined ? window : Object(obj);//obj可以是js基本类型 
            var i = 0, ary = [], str; 
            if(args){ 
                for( len=args.length; i<len; i++ ){ 
                    ary[i] = "args[" + i + "]"; 
                } 
            } 
            obj._apply = this; 
            str = 'obj._apply(' + ary.join(',') + ')'; 
            try{ 
                return eval(str); 
            }catch(e){ 
            }finally{ 
                delete obj._apply; 
            }    
        }; 
    } 
    if(!Function.prototype.call){ 
        Function.prototype.call = function(obj){ 
            var i = 1, args = []; 
            for( len=arguments.length; i<len; i++ ){ 
                args[i-1] = arguments[i]; 
            } 
            return this.apply(obj, args); 
        }; 
    } 
    if(typeof Object.assign != 'function') {
        (function() {
            Object.assign = function(target) {
                'use strict';
                if(target === undefined || target === null) {
                    throw new TypeError('Cannot convert undefined or null to object');
                }

                var output = Object(target);
                for(var index = 1; index < arguments.length; index++) {
                    var source = arguments[index];
                    if(source !== undefined && source !== null) {
                        for(var nextKey in source) {
                            if(source.hasOwnProperty(nextKey)) {
                                output[nextKey] = source[nextKey];
                            }
                        }
                    }
                }
                return output;
            };
        })();
    }
    if (!Array.isArray) {
      Array.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
      };
    }
    // Array.forEach
    if (!Array.prototype.forEach) {
        Array.prototype.forEach = function (callback, thisArg) {
            thisArg = thisArg || window;
            for (var i = 0; i < this.length; i++) {
                callback.call(thisArg, this[i], i, this);
            }
        };
    }

    // Array.filter
    if (!Array.prototype.filter) {
        Array.prototype.filter = function (func, thisArg) {
            'use strict';
            if (!((typeof func === 'Function' || typeof func === 'function') && this)) {
                throw new TypeError();
            }

            var len = this.length >>> 0,
                res = new Array(len), // preallocate array
                t = this, c = 0, i = -1;
            if (thisArg === undefined) {
                while (++i !== len) {
                    // checks to see if the key was set
                    if (i in this) {
                        if (func(t[i], i, t)) {
                            res[c++] = t[i];
                        }
                    }
                }
            } else {
                while (++i !== len) {
                    if (i in this) {
                        if (func.call(thisArg, t[i], i, t)) {
                            res[c++] = t[i];
                        }
                    }
                }
            }

            res.length = c;
            return res;
        };
    }

    // Array.map
    if (!Array.prototype.map) {
        Array.prototype.map = function (callback, thisArg) {
            var T, A, k;
            if (this == null) {
                throw new TypeError(' this is null or not defined');
            }

            // 1. 将O赋值为调用map方法的数组.
            var O = Object(this);

            // 2.将len赋值为数组O的长度.
            var len = O.length >>> 0;
            if (Object.prototype.toString.call(callback) !== '[object Function]') {
                throw new TypeError(callback + ' is not a function');
            }
            if (thisArg) {
                T = thisArg;
            }
            A = new Array(len);
            k = 0;
            while (k < len) {
                var kValue, mappedValue;
                if (k in O) {
                    kValue = O[k];
                    mappedValue = callback.call(T, kValue, k, O);
                    A[k] = mappedValue;
                }
                k++;
            }
            return A;
        };
    }

    // Array.some
    if (!Array.prototype.some) {
        Array.prototype.some = function (fun/*, thisArg*/) {
            'use strict';
            if (this == null) {
                throw new TypeError('Array.prototype.some called on null or undefined');
            }
            if (typeof fun !== 'function') {
                throw new TypeError();
            }
            var t = Object(this);
            var len = t.length >>> 0;
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t && fun.call(thisArg, t[i], i, t)) {
                    return true;
                }
            }
            return false;
        };
    }

    // Array.every
    if (!Array.prototype.every) {
        Array.prototype.every = function (callbackfn, thisArg) {
            'use strict';
            var T, k;
            if (this == null) {
                throw new TypeError('this is null or not defined');
            }
            var O = Object(this);
            var len = O.length >>> 0;
            if (typeof callbackfn !== 'function') {
                throw new TypeError();
            }
            if (arguments.length > 1) {
                T = thisArg;
            }
            k = 0;
            while (k < len) {
                var kValue;
                if (k in O) {
                    kValue = O[k];
                    var testResult = callbackfn.call(T, kValue, k, O);
                    if (!testResult) {
                        return false;
                    }
                }
                k++;
            }
            return true;
        };
    }
})();

// promise插件
(function(window){

    // 参考Joe-Xie：https://www.cnblogs.com/XieJunBao/p/9156134.html
    // 原生封装promise为了应对低版本浏览器不兼容问题
    

    // 异步串行思路：promise执行then是注册回调函数，then有多个就可以注册多个回调函数，但是若多个回调都是异步执行的，那我们要等上一个异步结束后才执行下一个异步，这是时候就需要上一个异步操作完成后，把这个完成状态告诉下一个回调，这样才可以异步串行。为了解决这个问题我们把异步完成状态托管给promise去管理
    // 流程：第一步注册：链式调用then函数，每执行一个then函数，返回一个桥梁promise(then函数中的成功回调和失败回调是写入这个promise的回调列表中的，注意成功回调的功能除了执行本身函数外还要更新下一个promise的状态)
    // 第二步执行：第一个promise的异步执行完，开始执行第一个promise的回调函数（回调函数又分两步走：第一步：resolvePromise解析回调返回值（如果是promise则说明是异步，就需要继续解析直到不是promise而是一个具体的值），第二步：当回调返回的值是一个具体值而不是promise时，调用第二个proomise的reslove方法将第二个proomise的状态更新为fulfilled，并将第一个promise的回调的值传入p2的回调函数中去执行）

    function MyPromise(fn) {

        var self = this;
        // 成功回调传的参数
        self.value = null;
        // 失败回调传的参数
        self.error = null;
        // 当前promise对象的状态
        self.status = "pending";
        // 存储成功回调列表
        self.onFulfilledCallbacks = [];
        // 存储失败回调列表
        self.onRejectedCallbacks = [];

        // 状态改变并执行回调
        // 成功
        function resolve(value) {
            // 判断传入参数是否由MyPromise构造的对象，若是，注册该函数
            if (value instanceof MyPromise) {
                return value.then(resolve, reject);
            }
            // 判断
            if (self.status === "pending") {
                setTimeout(function(){
                    self.status = "fulfilled";
                    self.value = value;
                    // 执行成功回调
                    // self.onFulfilledCallbacks.forEach(function(callback){callback(self.value)});
                    // 向下兼容forEach
                    for(var i=0;i<self.onFulfilledCallbacks.length;i++){
                        self.onFulfilledCallbacks[i](self.value);
                    }
                }, 0)
            }
        }
        // 失败
        function reject(error) {
            if (self.status === "pending") {
                setTimeout(function() {
                    self.status = "rejected";
                    self.error = error;
                    // self.onRejectedCallbacks.forEach(function(callback){callback(self.error)});
                    for(var i=0;i<self.onRejectedCallbacks.length;i++){
                        self.onRejectedCallbacks[i](self.error);
                    }
                }, 0)
            }
        }

        try {
            fn(resolve, reject);
        } 
        catch (e) {
            reject(e);
        }
    }

    // 解析放回值
    // 用来解析回调函数的返回值x，x可能是普通值也可能是个promise对象
    // 因为回调函数既可能会返回一个异步的promise也可能会返回一个同步结果，所以我们把直接把回调函数的结果托管给bridgePromise，使用resolvePromise方法来解析回调函数的结果，如果回调函数返回一个promise并且状态还是pending，就在这个promise的then方法中继续解析这个promise reslove传过来的值，如果值还是pending状态的promise就继续解析，直到不是一个异步promise，而是一个正常值就使用bridgePromise的reslove方法将bridgePromise的状态改为fulfilled，并调用onFulfilledCallbacks回调数组中的方法，将该值传入，到此异步操作就衔接上了。
    function resolvePromise(bridgepromise, x, resolve, reject) {
        // bridgepromise是桥梁promise，x是桥梁promise中注册的成功回调的返回值，resolve和reject是桥梁promise的状态改变函数
        // 2.3.1规范，避免循环引用
        // 如果成功回调的值又是桥梁promise就返回循环传参的错误（死循环）
        if (bridgepromise === x) {
            return reject(new TypeError('Circular reference'));
        }
        var called = false;
        // // 如果x是一个promise，则通过递归
        // if (x instanceof MyPromise) {
        //     //如果这个promise是pending状态，就在它的then方法里继续执行resolvePromise解析它的结果，直到返回值不是一个pending状态的promise为止（这里使用了递归的方法）
        //     if (x.status === "pending") {
        //         x.then(
        //             function(y){
        //                 resolvePromise(bridgepromise, y, resolve, reject);
        //             }, 
        //             function(error){
        //                 reject(error);
        //             }
        //         );
        //     } 
        //     else {
        //         x.then(resolve, reject);
        //     }
        // } 
        // else 
        // // 如果x是一个promise，则继续解析它的状态
        if (x != null && ((typeof x === 'object') || (typeof x === 'function'))) {
            try {
                var then = x.then;
                if (typeof then === 'function') {
                    // then方法的指向传入的桥梁promise，也就是说该桥梁promise调用了then方法并传入了成功回调和失败回调
                    then.call(
                        x,
                        // 传入then的成功回调
                        function(y){
                            if (called) return;
                            called = true;
                            // 这里重新解析当前的桥梁promise，至于成功回调的返回值传空（这里目的是通过递归持续判断当前桥梁promise的状态）
                            resolvePromise(bridgepromise, y, resolve, reject);
                        },
                        //传入then的失败回调
                        function(error){
                            if (called) return;
                            called = true;
                            reject(error);
                        }
                    )
                } 
                // 如果then不是一个函数，则以x为值改变promise状态并延长成功回调列表
                else {
                    resolve(x);
                }
            } 
             // 如果在取x.then值时抛出了异常，则以这个异常做为原因将promise拒绝。
            catch (e) {
                if (called) return;
                called = true;
                reject(e);
            }
        } 
        // 如过x不是一个promise，则改变bridgePromise的状态改为fulfilled，并调用onFulfilledCallbacks回调数组中的方法，将该值传入
        else {
            resolve(x);
        }
    }

    // 注册回调函数
    MyPromise.prototype.then = function(onFulfilled, onRejected) {
        var self = this;
        // 搭建桥梁promise（即调用为then方法后重新返回一个新的promise对象）
        var bridgePromise;
        // 防止使用者不传成功或失败回调函数，所以成功失败回调都给了默认回调函数
        onFulfilled = typeof onFulfilled === "function" ? onFulfilled : function(value){return value};
        onRejected = typeof onRejected === "function" ? onRejected : function(error){throw error};
        // 如果当前的promise对象是完成状态
        // 返回一个新的桥梁promise
        if (self.status === "fulfilled") {
            return bridgePromise = new MyPromise(function(resolve, reject){
                setTimeout(function(){
                    try {
                        // 获取成功回调函数的返回值
                        var x = onFulfilled(self.value);
                        // 解析桥梁promise函数
                        resolvePromise(bridgePromise, x, resolve, reject);
                    } 
                    catch (e) {
                        reject(e);
                    }
                }, 0);
            })
        }
        // 如果当前的promise对象是拒绝状态
        if (self.status === "rejected") {
            return bridgePromise = new MyPromise(function(resolve, reject){
                setTimeout(function(){
                    try {
                        var x = onRejected(self.error);
                        resolvePromise(bridgePromise, x, resolve, reject);
                    } 
                    catch (e) {
                        reject(e);
                    }
                }, 0);
            });
        }
        // 如果当前的promise对象是听候状态，则在当前promise对象的成功回调列表和失败回调列表中注入
        if (self.status === "pending") {
            return bridgePromise = new MyPromise(function(resolve, reject){
                // 注意回调列表是把整个回调函数和回调解析函数一起注入的！！！！！，所以在执行回调时除运行回调函数还要，解析桥梁promise的状态（有可能桥梁promise中也有promise），解析中改变当前promise的状态，若当前promise的状态为完成状态才继续执行下一个注册好的回调
                self.onFulfilledCallbacks.push(function(value){
                    try {
                        var x = onFulfilled(value);
                        resolvePromise(bridgePromise, x, resolve, reject);
                    } 
                    catch (e) {
                        reject(e);
                    }
                });
                self.onRejectedCallbacks.push(function(error){
                    try {
                        var x = onRejected(error);
                        resolvePromise(bridgePromise, x, resolve, reject);
                    } 
                    catch (e) {
                        reject(e);
                    }
                });
            });
        }
    }

    MyPromise.prototype.MyCatch = function(onRejected) {

        return this.then(null, onRejected);    
    }
    
    MyPromise.all = function(promises) {
        return new MyPromise(function(resolve, reject) {
            var result = [];
            var count = 0;
            for (var i = 0; i < promises.length; i++) {
                // (function(i){
                //     return promises[i].then(function(data) {
                //         result[i] = data;
                //         if (++count == promises.length) {
                //             resolve(result);
                //         }
                //     }, function(error) {
                //         reject(error);
                //     });
                // })(i)

                function closeTemp(i){
                    return promises[i].then(function(data) {
                        result[i] = data;
                        if (++count == promises.length) {
                            resolve(result);
                        }
                    }, function(error) {
                        reject(error);
                    });
                }
                closeTemp(i)
                
            }
        });
    }

    MyPromise.race = function(promises) {
        return new MyPromise(function(resolve, reject) {
            for (var i = 0; i < promises.length; i++) {
                promises[i].then(function(data) {
                    resolve(data);
                }, function(error) {
                    reject(error);
                });
            }
        });
    }

    MyPromise.resolve = function(value) {
        return new MyPromise(function(resolve){
            resolve(value);
        });
    }

    MyPromise.reject = function(error) {
        return new MyPromise(function(resolve, reject){
            reject(error);
        });
    }
    MyPromise.promisify = function(fn) {
        return function() {
            var args = Array.from(arguments);
            return new MyPromise(function(resolve, reject) {
                fn.apply(null, args.concat(function(err) {
                    err ? reject(err) : resolve(arguments[1])
                }));
            })
        }
    }

    window.MyPromise = MyPromise;
})(window);

// md5加密
!function(n){
    "use strict";
    function t(n, t) {
        var r = (65535 & n) + (65535 & t);
        return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r
    }
    function r(n, t) {
        return n << t | n >>> 32 - t
    }
    function e(n, e, o, u, c, f) {
        return t(r(t(t(e, n), t(u, f)), c), o)
    }
    function o(n, t, r, o, u, c, f) {
        return e(t & r | ~t & o, n, t, u, c, f)
    }
    function u(n, t, r, o, u, c, f) {
        return e(t & o | r & ~o, n, t, u, c, f)
    }
    function c(n, t, r, o, u, c, f) {
        return e(t ^ r ^ o, n, t, u, c, f)
    }
    function f(n, t, r, o, u, c, f) {
        return e(r ^ (t | ~o), n, t, u, c, f)
    }
    function i(n, r) {
        n[r >> 5] |= 128 << r % 32,
        n[14 + (r + 64 >>> 9 << 4)] = r;
        var e, i, a, d, h, l = 1732584193, g = -271733879, v = -1732584194, m = 271733878;
        for (e = 0; e < n.length; e += 16)
            i = l,
            a = g,
            d = v,
            h = m,
            g = f(g = f(g = f(g = f(g = c(g = c(g = c(g = c(g = u(g = u(g = u(g = u(g = o(g = o(g = o(g = o(g, v = o(v, m = o(m, l = o(l, g, v, m, n[e], 7, -680876936), g, v, n[e + 1], 12, -389564586), l, g, n[e + 2], 17, 606105819), m, l, n[e + 3], 22, -1044525330), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 4], 7, -176418897), g, v, n[e + 5], 12, 1200080426), l, g, n[e + 6], 17, -1473231341), m, l, n[e + 7], 22, -45705983), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 8], 7, 1770035416), g, v, n[e + 9], 12, -1958414417), l, g, n[e + 10], 17, -42063), m, l, n[e + 11], 22, -1990404162), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 12], 7, 1804603682), g, v, n[e + 13], 12, -40341101), l, g, n[e + 14], 17, -1502002290), m, l, n[e + 15], 22, 1236535329), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 1], 5, -165796510), g, v, n[e + 6], 9, -1069501632), l, g, n[e + 11], 14, 643717713), m, l, n[e], 20, -373897302), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 5], 5, -701558691), g, v, n[e + 10], 9, 38016083), l, g, n[e + 15], 14, -660478335), m, l, n[e + 4], 20, -405537848), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 9], 5, 568446438), g, v, n[e + 14], 9, -1019803690), l, g, n[e + 3], 14, -187363961), m, l, n[e + 8], 20, 1163531501), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 13], 5, -1444681467), g, v, n[e + 2], 9, -51403784), l, g, n[e + 7], 14, 1735328473), m, l, n[e + 12], 20, -1926607734), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 5], 4, -378558), g, v, n[e + 8], 11, -2022574463), l, g, n[e + 11], 16, 1839030562), m, l, n[e + 14], 23, -35309556), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 1], 4, -1530992060), g, v, n[e + 4], 11, 1272893353), l, g, n[e + 7], 16, -155497632), m, l, n[e + 10], 23, -1094730640), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 13], 4, 681279174), g, v, n[e], 11, -358537222), l, g, n[e + 3], 16, -722521979), m, l, n[e + 6], 23, 76029189), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 9], 4, -640364487), g, v, n[e + 12], 11, -421815835), l, g, n[e + 15], 16, 530742520), m, l, n[e + 2], 23, -995338651), v = f(v, m = f(m, l = f(l, g, v, m, n[e], 6, -198630844), g, v, n[e + 7], 10, 1126891415), l, g, n[e + 14], 15, -1416354905), m, l, n[e + 5], 21, -57434055), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 12], 6, 1700485571), g, v, n[e + 3], 10, -1894986606), l, g, n[e + 10], 15, -1051523), m, l, n[e + 1], 21, -2054922799), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 8], 6, 1873313359), g, v, n[e + 15], 10, -30611744), l, g, n[e + 6], 15, -1560198380), m, l, n[e + 13], 21, 1309151649), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 4], 6, -145523070), g, v, n[e + 11], 10, -1120210379), l, g, n[e + 2], 15, 718787259), m, l, n[e + 9], 21, -343485551),
            l = t(l, i),
            g = t(g, a),
            v = t(v, d),
            m = t(m, h);
        return [l, g, v, m]
    }
    function a(n) {
        var t, r = "", e = 32 * n.length;
        for (t = 0; t < e; t += 8)
            r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255);
        return r
    }
    function d(n) {
        var t, r = [];
        for (r[(n.length >> 2) - 1] = void 0,
        t = 0; t < r.length; t += 1)
            r[t] = 0;
        var e = 8 * n.length;
        for (t = 0; t < e; t += 8)
            r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32;
        return r
    }
    function h(n) {
        return a(i(d(n), 8 * n.length))
    }
    function l(n, t) {
        var r, e, o = d(n), u = [], c = [];
        for (u[15] = c[15] = void 0,
        o.length > 16 && (o = i(o, 8 * n.length)),
        r = 0; r < 16; r += 1)
            u[r] = 909522486 ^ o[r],
            c[r] = 1549556828 ^ o[r];
        return e = i(u.concat(d(t)), 512 + 8 * t.length),
        a(i(c.concat(e), 640))
    }
    function g(n) {
        var t, r, e = "";
        for (r = 0; r < n.length; r += 1)
            t = n.charCodeAt(r),
            e += "0123456789abcdef".charAt(t >>> 4 & 15) + "0123456789abcdef".charAt(15 & t);
        return e
    }
    function v(n) {
        return unescape(encodeURIComponent(n))
    }
    function m(n) {
        return h(v(n))
    }
    function p(n) {
        return g(m(n))
    }
    function s(n, t) {
        return l(v(n), v(t))
    }
    function C(n, t) {
        return g(s(n, t))
    }
    function A(n, t, r) {
        return t ? r ? s(t, n) : C(t, n) : r ? m(n) : p(n)
    }
    "function" == typeof define && define.amd ? define(function() {return A}) : "object" == typeof module && module.exports ? module.exports = A : n.md5 = A
}(this);

// json对象兼容
if (!window.JSON) {
    window.JSON = {
        parse: function(jsonStr) {
            return eval('(' + jsonStr + ')');
        },
        stringify: function(jsonObj) {
            var result = '',
                curVal;
            if (jsonObj === null) {
                return String(jsonObj);
            }
            switch (typeof jsonObj) {
                case 'number':
                case 'boolean':
                    return String(jsonObj);
                case 'string':
                    return '"' + jsonObj + '"';
                case 'undefined':
                case 'function':
                    return undefined;
            }

            switch (Object.prototype.toString.call(jsonObj)) {
                case '[object Array]':
                    result += '[';
                    for (var i = 0, len = jsonObj.length; i < len; i++) {
                        curVal = JSON.stringify(jsonObj[i]);
                        result += (curVal === undefined ? null : curVal) + ",";
                    }
                    if (result !== '[') {
                        result = result.slice(0, -1);
                    }
                    result += ']';
                    return result;
                case '[object Date]':
                    return '"' + (jsonObj.toJSON ? jsonObj.toJSON() : jsonObj.toString()) + '"';
                case '[object RegExp]':
                    return "{}";
                case '[object Object]':
                    result += '{';
                    for (i in jsonObj) {
                        if (jsonObj.hasOwnProperty(i)) {
                            curVal = JSON.stringify(jsonObj[i]);
                            if (curVal !== undefined) {
                                result += '"' + i + '":' +curVal + ',';
                            }
                        }
                    }
                    if (result !== '{') {
                        result = result.slice(0, -1);
                    }
                    result += '}';
                    return result;

                case '[object String]':
                    return '"' + jsonObj.toString() + '"';
                case '[object Number]':
                case '[object Boolean]':
                    return jsonObj.toString();
            }
        }
    };
}