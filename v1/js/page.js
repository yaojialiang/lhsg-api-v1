// +----------------------------------------------------------------------
// | IPTV-EPG
// +----------------------------------------------------------------------
// | IPTV EPG 天津前端页面配置js（针对专区使用）
// +----------------------------------------------------------------------
// | 说明：
// |    1.  一个专区只生成唯一一个专区对象，
// +----------------------------------------------------------------------
// | 使用：
// |    1. 依赖公共核心js引用。
// |        e.g. <head>
// |                ...<script type="text/javascript" src="__ROOT__/js/HCcommon.js?t={$time}"></script>...
// |                ...<script type="text/javascript" src="__ROOT__/js/api.js?t={$time}"></script>...
// |                ...<script type="text/javascript" src="__ROOT__/js/area.js?t={$time}"></script>...
// |                ...<script type="text/javascript" src="__ROOT__/js/page.js?t={$time}"></script>...
// |            </head>
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



var area = new Area({
    name:'lhsg',
    baseUrl:window.location.href.match(/.*?\/\/.*?\//)[0],//这里不使用window.location.host的原因是部分盒子，没有host这个属性
    projectUrl:'http://202.99.114.152:24007/v1/',//页面基础地址
});

// 路由参数（存储当前页面的路由参数）
var store = {};
// 鉴权返回的信息（由于鉴权返回的信息较多，因此单独一个变量进行接收）
var authInfo = null;
// 乐活时光产品信息（包含鉴权订购用的参数）
var productInfo = null;

// 获取产品信息（不同省份可能不一样）
function getProductInfo(carrierId){
    var obj = {
        contentId : "lhsg",
        serviceId : "lhsgby25",
        productId : 'lhsgby25@'+carrierId,
        goodsid : '',
        productName : '乐活时光', 
    }
    if(carrierId == '201'){
        obj.goodsid = 'V321300000073'
    }
    else if(carrierId == '211'){
        obj.serviceId = 'lhsg30t30';
        obj.productId = 'lhsg30t30@211';
    }
    
    return obj;
}

// 默认确定键规则
function defSureRules(btnDom,btnCls,btnIdx){
    // 菜单id
    var menu_id = btnDom.getAttribute('menu_id') || '';
    // 跳转地址
    var url = btnDom.getAttribute('url') || btnDom.getAttribute('source_url') ||  '';
    // 跳转类型
    var type = btnDom.getAttribute('type_id') || btnDom.getAttribute('type') || btnDom.getAttribute('jump_type') || '';
    // 专辑id
    var album_id = btnDom.getAttribute('album_id') || '';
    // 资源id
    var source_id = btnDom.getAttribute('source_id') || btnDom.getAttribute('id') || '';
    // 标签id
    var tag_id = btnDom.getAttribute('return_tag_id') || btnDom.getAttribute('tag_id') ||  '';
    // 是否免费
    var is_free = btnDom.getAttribute('is_free') || '1';
    // 标题
    var source_name = btnDom.getAttribute('source_name') || btnDom.getAttribute('display_disc') || '';
    // 头部按钮组
    if(btnCls == 'headerBtn'){
        if(menu_id == '18'){
            window.location.href = area.projectUrl + 'html/myhouse.html';
        }
        else if(btnDom.getAttribute('menu_id') == '19'){
            window.location.href = area.projectUrl + 'html/recommend.html';
        }
        else if(
            btnDom.getAttribute('menu_id') == '20' 
            ||
            btnDom.getAttribute('menu_id') == '21'
            ||
            btnDom.getAttribute('menu_id') == '22'
            ||
            btnDom.getAttribute('menu_id') == '23'
        ){
            window.location.href = area.projectUrl + 'html/secondary.html?menu_id='+menu_id;
        } 
    }
    // 导航按钮组
    else if(btnCls == 'navBtn'){
        // 搜索按钮
        if(btnDom.className.indexOf('search') != -1){
            jumpIntoStack(area.projectUrl + 'html/search.html');
        }
        else if(btnDom.className.indexOf('vip') != -1){
            // 会员
            if(authInfo && authInfo.result==0){
                HCEPG.UI.tips('您已经订购该产品')
            }
            // 非会员拉起订购
            else{
                order(productInfo.contentId,productInfo.serviceId,productInfo.productId,productInfo.UserToken,encodeURIComponent(window.location.href.split('?')[0]+'?'+HCEPG.Func.formatParams(store)))
            }
        }
    }
    // 专辑
    else if(type == '2' && (album_id&&album_id>0)){
        jumpIntoStack(area.projectUrl + 'html/details.html?album_id='+album_id)
    }
    //单视频
    else if(type == '1' && (source_id&&source_id>0)){
        // 会员直接观看
        if(
            (authInfo && authInfo.result==0)
            || is_free == '0'
        ){
            // 如果获取到专辑id则添加收藏
            if(album_id && source_id){
                api.addWatchRecord(area.userId,album_id,source_id,0,'')
            }
            
            window.location.href = area.projectUrl + 'html/video.html?video_url='+encodeURIComponent(url)+"&video_ReturnURL="+encodeURIComponent(window.location.href.split('?')[0]+'?'+HCEPG.Func.formatParams(store));
        }
        // 非会员拉起订购
        else{
            order(productInfo.contentId,productInfo.serviceId,productInfo.productId,productInfo.UserToken,encodeURIComponent(window.location.href.split('?')[0]+'?'+HCEPG.Func.formatParams(store)))
        }
        
    }
}

// 进栈跳转
function jumpIntoStack(url){
    historyUrl = window.location.href.split('?')[0]+'?'+HCEPG.Func.formatParams(store)
    area.pushStack(historyUrl);
    window.location.href = url;
}

// 联通统一支付页
function order(contentId,serviceId,productId,UserToken,returnUrl){
    window.location.href = "http://202.99.114.14:10020/"
    +"ACS/vas/serviceorder?SPID=96596"
    +"&UserID="+area.userId
    +"&ContentID="+contentId
    +"&ServiceID="+serviceId
    +"&ProductID="+productId
    +"&UserToken="+UserToken
    +"&Action=1&OrderMode=1&ReturnURL="+encodeURIComponent(area.projectUrl+"html/orderBack.html?orderBackUrl="+encodeURIComponent(returnUrl))
    +"&ContinueType=1&Lang=zh&notificationURL="
    +"&unsubNotificationURL=";
}

// 头部导航渲染
function headerRender(data){
    for(var i = 0;i<data.length;i++){
        if(data[i].menu_id == '24'){
            data.splice(i,1);
        }
    }
    data = data.reverse()

    // 页码渲染
    HCEPG.UI.rect({
        box:C("header_scroll")[0],
        data:data,
        cols:1000,
        child:function(unit,obj,idx){
            unit.className = 'headerBtn headerBtn-'+idx+' menu_id-'+obj.menu_id;
            return '';
        },
    })
}

// 头部选中效果
function headerBtnSel(menu_id){
    if(C('headerBtn').length>0){
        for(var i = 0;i<C('headerBtn').length;i++){
            if(C('headerBtn')[i].getAttribute('menu_id') == menu_id){
                HCEPG.CSS.addClass(C('headerBtn')[i],'selected')
            }
        }
    }
}

// 获取当前对应头部导航的索引
function getHeaderBtnIdx(){
    var tarIdx = '0'
    for(var i = 0;i<C('headerBtn').length;i++){
        if(C('headerBtn')[i].getAttribute('menu_id') == store.menu_id){
            tarIdx = i;
        }
    }
    return tarIdx+'';
}

function getMenuTagBtnIdx(){
    var tarIdx = '0'
    for(var i = 0;i<C('menuTagBtn').length;i++){
        if(C('menuTagBtn')[i].getAttribute('tag_id') == store.tag_id){
            tarIdx = i;
        }
    }
    return tarIdx+'';
}

// 页面初始化
function pageInit(){
    var pagePromiseAll = [new MyPromise(function(resolve,reject){resolve()})];

    pagePromiseAll.push(
        area.init()
        .then(function(){
            // 获取产品信息
            productInfo = getProductInfo(area.carrierId);
            var promiseAll = [new MyPromise(function(resolve,reject){resolve()})]

            promiseAll.push(
                api.authorization({
                    userId:area.userId,
                    contentId:productInfo.contentId,
                    serviceId:productInfo.serviceId,
                    productId:'',
                    UserToken:area.UserToken,
                })
                .then(function(res){
                    return new MyPromise(function(resolve,reject){
                        authInfo = res;
                        resolve();
                    })
                })
            )
            
            return MyPromise.all(promiseAll)
        })
    )

    return MyPromise.all(pagePromiseAll);
}