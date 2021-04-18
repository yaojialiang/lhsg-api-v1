/* 
* @Author: Marte
* @Date:   2020-05-23 16:13:13
* @Last Modified by:   Marte
* @Last Modified time: 2020-05-29 11:11:16
*/

// 观察者类
function Watcher(opt){
    var _this = this;
    opt = opt? opt : {};
    opt.state = opt.state ? opt.state : {};
    opt.render = opt.render ? opt.render:null;
    opt.handleKeydown = opt.handleKeydown ? opt.handleKeydown : null;

    // 私有属性的默认值
    this.state = {
        id:null,//弹窗id
        type:null,//组件类型
        btnCls:null,//按键类名
        btnIdx:null,//按键索引
        show:null,//组件展示与否
        insert:null,//插入节点
        refresh:null,//更新数据（该状态不会保留，更新后复原）
        focus:null,//是否聚焦
        patch:null,//补丁，需要更新的值
        popupArr:null,//弹窗组
    };
    // 设置初始私有属性值
    for(var attr in opt.state){
        this.state[attr] = opt.state[attr]
    }
    // 映射规则
    this.render = opt.render;
    // 创建实例集合，方便引用
    if(!Watcher.instances){Watcher.instances = {};}
    Watcher.instances[this.state.id] = this;
}

// 设置状态值
Watcher.prototype.setState = function(newState){ 
    this.state.patch = [];
    for(var attr in newState){
        if(attr in this.state && this.state[attr] != newState[attr]){
            this.state[attr] = newState[attr];
            this.state.patch.push(attr);
        }
    }
    if(this.render){return this.render(this.state);}
}

// 轨迹上传
Watcher.prototype.footprint = function(){
    var footprint
    if(!Watcher.footprint){
        footprint = [];
    }
    else{
        footprint = JSON.parse(JSON.stringify(Watcher.footprint));
    }
    
    if(this.state.type == 'page'){
        var recentFootprint = this.state;
        footprint.push(recentFootprint);
    }
    else if(this.state.type == 'popup'){
        var recentFootprint = footprint[footprint.length-1];
        if(!recentFootprint.popupArr){
           recentFootprint.popupArr = [];
        }
        var recentPopup = this.state;
        recentFootprint.popupArr.push(recentPopup);
    }
    Watcher.footprint = footprint; 
}

// 追踪
Watcher.track = function(){
    var _this = this;
    if(!Watcher.footprint){
        return;
    }
    var footprint = JSON.parse(JSON.stringify(Watcher.footprint));
    // 最近的足迹
    var recentFootprint = footprint[footprint.length-1];
    var promiseAll = [new MyPromise(function(resolve,reject){resolve()})];

    // 页面组件
    if(recentFootprint.type == 'page'){
        recentFootprint.focus = true;
        promiseAll.push(Watcher.instances[recentFootprint.id].setState(recentFootprint))
    }
    // 弹窗组存在
    if(recentFootprint.popupArr && recentFootprint.popupArr.length>0){
        // 最近弹窗
        var recentPopup = recentFootprint.popupArr[recentFootprint.popupArr.length-1]
        recentFootprint.popupArr = recentFootprint.popupArr.slice(0,-1);
        Watcher.footprint[Watcher.footprint.length-1].popupArr = recentFootprint.popupArr;
        if(recentPopup.type == 'popup'){
            recentPopup.focus = true;
            promiseAll.push(Watcher.instances[recentPopup.id].setState(recentPopup));
        }
    }
    // 不存在弹窗组
    else{
        Watcher.footprint = Watcher.footprint.slice(0,-1);
    }
    
    return MyPromise.all(promiseAll)
}
// 获取落焦观察者实例
Watcher.getFocus = function(){
    for(var obj in Watcher.instances){
        if(Watcher.instances[obj].state.focus){
            return Watcher.instances[obj]
        }
    }
}

