// +----------------------------------------------------------------------
// | IPTV-EPG
// +----------------------------------------------------------------------
// | IPTV EPG 飞咪玩具接口
// +----------------------------------------------------------------------
// | 说明：
// |    1.  使用使用范围飞咪玩具专用接口
// |    2.  全局唯一根命名空间声明：api（减少全局污染）。
// |    3.  该模块所有方法仅作获取数据用，不对获取到的数据做任何处理（保证数据纯净度，也避免无谓的方法嵌套）。
// +----------------------------------------------------------------------
// | 使用：
// |    1.必须依赖核心HCcommon.js
// |        e.g. <head>
// |                <script type="text/javascript" src="__ROOT__/js/HCcommon.js?t={$time}"></script>
// |                <script type="text/javascript" src="__ROOT__/js/HCapi.js?t={$time}"></script>
// |             </head>
// +----------------------------------------------------------------------
// | 修改规则：
// |    1. 定义Object类名时，请按照“大驼峰命名法”。
// |        e.g. LMEPG.Log/LMEPG.Func/LMEPG.Cookie/LMEPG.ButtonManager/LMEPG.KeyEventManager
// |        >>>>>但注意一下，LMEPG.ajax暂时特殊，为全小写！<<<<<
// |    2. 定义Object类名时，若为简短类名缩写，请按照“首字母”大写。
// |        e.g. MEPG.UI/LMEPG.BM/LMEPG.KEM
// |    3. 请统一按照功能及相关性，定义类/方法所在合适区域位置！！！
// +----------------------------------------------------------------------
// | 作者: len
// | 日期: 2020/9/3
// +----------------------------------------------------------------------

var api = {
    data: {
        baseUrl:window.location.href.match(/.*?\/\/.*?\//)[0],
        getIndexPageData:'get_index_page_data',
        getAlbumDetails: "get_album_details",
        addUser: "add_user",
        addWatchRecord: "add_watch_record",
        getWatchHistroy: "get_watch_history",
        addCollection: "add_collection",
        getCollection: "get_collection",
        search: "search",
        getSource: "get_source",
        getSpeakerRecommend: "get_speaker_recommend",
        getAlbumsOfSpeaker: "get_albums_of_speaker",
        creatOrder:"creat_order",
        orderCheck:"order_check",
        notify:"notify",
        delWatchHistory: "del_watch_history",
        delCollectionAll:"del_collection_all",
        addComplaint:"add_complaint",
        getUidNewOrOld:"getUidNewOrOld",
        authorization:"authorization",
        tvTools:'http://202.99.114.152:24005/index.php?m=Home&c=UpUserData&a=tvTools',
    },
    // 鉴权
    authorization:function(opt){
        var _this = this;
        opt = opt || {};
        var userId = opt.userId;
        var contentId = opt.contentId;
        var serviceId = opt.serviceId;
        var productId = opt.productId;
        var UserToken = opt.UserToken;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                type: 'GET',
                url:_this.data.baseUrl + _this.data.authorization,
                dataType: "json",
                data: {
                    url:'http://202.99.114.14:10020/ACS/vas/authorization',
                    userId:userId,
                    contentId:contentId,
                    serviceId:serviceId,
                    productId:productId,
                    UserToken:UserToken,
                },
                success: function (res) {
                    resolve(res);
                }
            })
        })
    },
    // 获取非首页推荐位
    getIndexPageData:function(uid,menu_id,tag_id){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.getIndexPageData,
                type: "GET",
                data: {
                    uid:uid,
                    menu_id:menu_id,
                    tag_id:tag_id,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                },
            });
        })
    },
    // 获取专辑列表
    getAlbumDetails:function(uid,album_id,sort,page,limit){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.getAlbumDetails,
                type: "GET",
                data: {
                    uid:uid,
                    album_id:album_id,
                    sort:sort,
                    page:page,
                    limit:limit,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                },
            });
        })
    },
    // 增加用户
    addUser:function(uid,token){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.addUser,
                type: "GET",
                data: {
                    uid:uid,
                    token:token,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                },
            });
        })
    },
    // 添加观看记录
    addWatchRecord:function(uid,album_id,source_id,play_time,flag){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.addWatchRecord,
                type: "GET",
                data: {
                    uid:uid,
                    album_id:album_id,
                    source_id:source_id,
                    play_time:play_time,
                    flag: flag,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                },
            });
        })
    },
    // 获取观看历史
    getWatchHistroy:function(uid,page,limit){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.getWatchHistroy,
                type: "GET",
                data: {
                    uid:uid,
                    page:page,
                    limit:limit,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                },
            });
        })
    },
    // 添加收藏
    addCollection:function(uid,album_id){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.addCollection,
                type: "GET",
                data: {
                    uid:uid,
                    album_id:album_id,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                },
            });
        })
    },
    // 获取收藏记录
    getCollection:function(uid,page,limit){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.getCollection,
                type: "GET",
                data: {
                    uid:uid,
                    page:page,
                    limit:limit,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                },
            });
        })
    },
    // 搜索
    search:function(uid,keyword,page,limit){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.search,
                type: "GET",
                data: {
                    uid:uid,
                    keyword:keyword,
                    page:page,
                    limit:limit,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                },
            });
        })
    },
    // 获取视频资源
    getSource:function(uid,source_id){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.getSource,
                type: "GET",
                data: {
                    uid:uid,
                    source_id:source_id,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
    // 获取首页底部推荐栏目
    getSpeakerRecommend:function(uid){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.getSpeakerRecommend,
                type: "GET",
                data: {
                    uid:uid,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
    // 获取专辑列表
    getAlbumsOfSpeaker:function(uid,recommend_id,speaker_id){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.getAlbumsOfSpeaker,
                type: "GET",
                data: {
                    uid:uid,
                    recommend_id:recommend_id,
                    speaker_id:speaker_id,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
    // 创建订单
    creatOrder:function(uid){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.creatOrder,
                type: "GET",
                data: {
                    uid: uid,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res)
                }
            });
        })
    },
    // 订单检查
    orderCheck:function(uid){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.orderCheck,
                type: "GET",
                data: {
                    uid:uid,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res)
                }
            });
        })
    },
    // 回调通知
    notify:function(uid,order_id,status){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.notify,
                type: "GET",
                data: {
                    uid:uid,
                    order_id:order_id, 
                    status:status,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
    // 清空观看历史
    delWatchHistory:function(uid){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.delWatchHistory,
                type: "GET",
                data: {
                    uid:uid,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
    // 删除全部收藏记录
    delCollectionAll:function(uid){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.delCollectionAll,
                type: "GET",
                data: {
                    uid:uid,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
    // 轨迹查询
    addComplaint:function(opt){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.addComplaint,
                type: "GET",
                data: opt,
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
    // 判断新老用户
    getUidNewOrOld:function(userId,hc_origin){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.baseUrl + _this.data.getUidNewOrOld,
                type: "GET",
                data:{
                    uid:userId,
                    hc_origin:hc_origin,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
    // 上传tv助手版本号（跨域调用）
    tvTools:function(uid,version_code){
        var _this = this;
        return new MyPromise(function(resolve,reject){
            HCEPG.Func.ajax({
                url: _this.data.tvTools,
                type: "GET",
                data:{
                    uid:uid,
                    version_code:version_code,
                },
                dataType: "json",
                success: function (res) {
                    resolve(res);
                }
            });
        })
    },
}
