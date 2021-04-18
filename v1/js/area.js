// +----------------------------------------------------------------------
// | IPTV-EPG
// +----------------------------------------------------------------------
// | IPTV EPG 天津前端epg的linux平台js（仅针对linux平台使用）
// +----------------------------------------------------------------------
// | 说明：
// |    1. 使用范围：该脚本只适用用于天津联通epg的linux平台（不适用于安卓，目前由于不同安卓apk的规范尚未能统一，所以暂时不把安卓方法归纳进来）
// |    2. 使用限制：一个专区只生成唯一一个专区对象（如进入飞咪玩具专区就只生成一个实例，不能生成多个实例，并且生成的实例名称必须是唯一，不与其他专区的实例命名重复。以确保用户在不同专区之间引流时，可以准确获取对应专区的实例，和避免各专区数据冲突）
// |    3.新增setParam方法，用于设置参数值，主要应用场景设置拓展的参数
// |
// +----------------------------------------------------------------------
// | 使用：
// |    1. 依赖公共核心HCcommon.js。
// |        e.g. <head>
// |                ...<script type="text/javascript" src="__ROOT__/js/HCcommon.js?t={$time}"></script>...
// |                ...<script type="text/javascript" src="__ROOT__/js/area.js?t={$time}"></script>...
// |             </head>
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
// | 日期: 2020/9/3
// +----------------------------------------------------------------------




// 专区对象
function Area(opt){
    var _this = this;
    opt = opt? opt : {};
    _this.name = opt.name;//专区名称（专区名称是为了确保专区对象的唯一性，避免存在多个专区存在时不能进行区分）
    _this.baseUrl = opt.baseUrl;//项目基础路径
    _this.projectUrl = opt.projectUrl;//项目前端页面目录路径（项目下html页面所在的目录路径）

    _this.carrierId = '';//省份编号
    _this.userId = '';//用户id
    _this.UserToken = '';//用户令牌（用于用户的鉴权订购）
    _this.origin = '';//专区的入口来源
    _this.exitUrl = '';//退出专区时返回的地址
    _this.enterTime = '';//进入产品的时间
    _this.stack = '';//专区历史栈
} 

// 初始化（获取对象属性值,异步执行）
Area.prototype.init = function(){
    var _this = this;
    //获取存储数据（主要是获取拓展参数）
    if(HCEPG.Func.getCookie(_this.name)){
        var tempObj = JSON.parse(HCEPG.Func.getCookie(_this.name));
        for(var attr in tempObj){
            if( !(attr in _this) ){
                _this[attr] = tempObj[attr];
            }
        }
    }
    var promiseAll = [new MyPromise(function(resolve,reject){resolve()})];
    _this.carrierId = _this.getCarrierID();
    _this.userId = _this.getUserID();//用户id获取要放在获取carrierId之后，保证用户后缀正常
    _this.UserToken = _this.getUserToken();
    _this.origin = _this.getOrigin();
    _this.exitUrl = _this.getExitUrl();
    _this.stack = _this.getStack();


    return MyPromise.all(promiseAll)
    .then(function(){
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.setCookie(_this.name,JSON.stringify(_this));
            resolve();
        })
    })
}

//获取carrierId
Area.prototype.getCarrierID = function(){
    var _this = this;

    var carrierId;

    var urlCarrierId = HCEPG.Func.getQueryString('carrierId') || HCEPG.Func.getQueryString('CarrierID') || '';

    // 优先获取url上的carrierId
    if(urlCarrierId){carrierId = urlCarrierId;}
    // 其次在cookie上寻找
    else if(
        HCEPG.Func.getCookie(_this.name)
        && JSON.parse(HCEPG.Func.getCookie(_this.name)).carrierId
    ){
        carrierId = JSON.parse(HCEPG.Func.getCookie(_this.name)).carrierId;
    }
    // 其次用机顶盒内置方法寻找
    else if(HCEPG.STBUtil.getSTBKey("carrierId")){
        carrierId = HCEPG.STBUtil.getSTBKey("carrierId");
    }
    // 如果以上方法都找不到，则使用默认carrierId
    else{
        carrierId = "201";
    }

    return carrierId;
}

//获取userId 
Area.prototype.getUserID = function(){
    var _this = this;
    
    var userId;
    //获取url上用户id
    var urlUsesrId = HCEPG.Func.getQueryString('userId') || HCEPG.Func.getQueryString('UserID')|| HCEPG.Func.getQueryString('uid') || '';

    //优先获取epg在url上携带的userId
    if(urlUsesrId){userId = urlUsesrId;}
    //如果url上没有UserID就在cookie上寻找
    else if(
        HCEPG.Func.getCookie(_this.name)
        && JSON.parse(HCEPG.Func.getCookie(_this.name)).userId
    ){
        userId = JSON.parse(HCEPG.Func.getCookie(_this.name)).userId;
    }
    // 最后再获取机顶盒的userid
    else if(HCEPG.STBUtil.getUserId()){userId = HCEPG.STBUtil.getUserId();}
    //如果机顶盒上也没有，就是用pc访问的话
    else{userId = 'pc201711272010101';}

    return userId;
}

// 获取用户令牌
Area.prototype.getUserToken = function(){
    var _this = this;
    // 如果usertoken在url上优先获取Url的UserToken
    var UserToken;

    var urlUserToken = HCEPG.Func.getQueryString('UserToken') || '';
    //优先获取url上的UserToken
    if(urlUserToken){UserToken = urlUserToken;}
    // 其次在cookie上寻找
    else if(
        HCEPG.Func.getCookie(_this.name)
        && JSON.parse(HCEPG.Func.getCookie(_this.name)).UserToken
    ){
        UserToken = JSON.parse(HCEPG.Func.getCookie(_this.name)).UserToken;
    }
    // 其次用机顶盒内置方法获取
    else if(HCEPG.STBUtil.getUserToken()){
       UserToken = HCEPG.STBUtil.getUserToken();
    }
    return UserToken;
}

// 获取用户来源
Area.prototype.getOrigin = function(){
    var _this = this;
    var origin;
    // 获取url上的来源
    var urlOrigin = HCEPG.Func.getQueryString('origin') || HCEPG.Func.getQueryString('entrance') || '';
    // 如果origin在url上优先获取Url的origin
    if(urlOrigin){origin = urlOrigin;}
    //否则在cookie上寻找
    else if(
        HCEPG.Func.getCookie(_this.name)
        && JSON.parse(HCEPG.Func.getCookie(_this.name)).origin
    ){
        origin = JSON.parse(HCEPG.Func.getCookie(_this.name)).origin;
    }
    // 如果以上方法都无法得到origin,则使用默认的用户来源
    else{origin = 'applicationMall';}

    return origin;
}

//获取返回epg的地址
Area.prototype.getExitUrl = function(){
    var _this = this;
    var exitUrl;

    var urlExitUrl = HCEPG.Func.getQueryString('ReturnURL') || HCEPG.Func.getQueryString('ReturnUrl') || HCEPG.Func.getQueryString("returnUrl") || '';
    // e910从epg进入携带的返回路径参数独特处理
    if(HCEPG.Func.getQueryString('epg_info')){
        exitUrl = decodeURIComponent(HCEPG.Func.getQueryString('epg_info')).split('<page_url>')[1]
    }
    // 其次从url上获取
    else if(urlExitUrl){exitUrl = urlExitUrl}
    // 如果url上没有从cookie上查找
    else if(
        HCEPG.Func.getCookie(_this.name)
        && JSON.parse(HCEPG.Func.getCookie(_this.name)).exitUrl
    ){
        exitUrl = JSON.parse(HCEPG.Func.getCookie(_this.name)).exitUrl
    }
    // 如果cookie上没有，就把上一页路径做为返回路径
    else{exitUrl = document.referrer;}

    return exitUrl;
}

//获取历史栈
Area.prototype.getStack = function(){
    var _this = this;
    var stack;
    if(HCEPG.Func.getQueryString('stack')){
        stack = JSON.parse(HCEPG.Func.getQueryString('stack')) ;
    }
    else if(
        HCEPG.Func.getCookie(_this.name)
        && JSON.parse(HCEPG.Func.getCookie(_this.name)).stack
    ){
        stack = JSON.parse(HCEPG.Func.getCookie(_this.name)).stack
    }
    // 如果cookie上没有，就把上一页路径做为返回路径
    else{stack = [];}

    return stack;
}

// 添加历史栈
Area.prototype.pushStack = function(url){
    var _this = this;
    var stack;
    stack = _this.getStack();
    stack.push(url);
    _this.stack = stack;
    HCEPG.Func.setCookie(_this.name,JSON.stringify(_this));
}

// 删除历史栈
Area.prototype.popStack = function(){
    var _this = this;
    var stack;
    var delTop;
    stack = _this.getStack();
    delTop = stack.pop();
    _this.stack = stack;
    HCEPG.Func.setCookie(_this.name,JSON.stringify(_this));
    return delTop;
}

// 清空历史栈
Area.prototype.clearStack = function(){
    var _this = this;
    var stack;
    _this.stack = [];
    HCEPG.Func.setCookie(_this.name,JSON.stringify(_this));
}

// 设置参数（主要是设置拓展参数）
Area.prototype.setParam = function(name,value){
    var _this = this;
    _this[name] = value;
    HCEPG.Func.setCookie(_this.name,JSON.stringify(_this));
}


