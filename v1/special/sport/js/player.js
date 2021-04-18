/* 
* @Author: Marte
* @Date:   2020-04-15 15:36:34
* @Last Modified by:   Marte
* @Last Modified time: 2020-05-13 17:34:16
*/

(function (w) {
    var HCMP = {
        data:{
            // 播放器引用
            mediaPlayer:'',
            // 播放状态 0是暂停，1是播放中
            status:0,
            // 当前播放时间
            currentPlayTime:0,
            // 视频总时长
            duration:0,
            // 视频监听定时器
            timer:'',
            // 播放结束触发的回调函数
            callback:'',
            // 音量
            volume:'',
            instanceId:'',
        },
        // 初始化参数
        init:function(){
            this.data.mediaPlayer = '';
            this.data.status = 0;
            this.data.currentPlayTime = 0;
            this.data.duration = 0;
            clearInterval(this.data.timer);
            this.data.timer = '';
            this.data.callback = '';
            this.data.volume = '';
        },
        /** 获取播放串 */
        getMediaStr: function(url) {
            var json = '';
            json += '[{mediaUrl:"'+url+'",'; //字符串，媒体的url
            json += 'mediaCode: "jsoncode1",'; //字符串，媒体的唯一标识
            json += 'mediaType:2,'; //媒体的类型, 2: TYPE_VOD
            json += 'audioType:1,'; //音频编码类型, 1: MPEG-1/2 layer 2 (MP2)
            json += 'videoType:1,'; //视频编码类型, 1: MPEG-2
            json += 'streamType:1,'; //流类型, 1: PS
            json += 'drmType:1,'; //DRM类型, 1:DRM_TYPE_CLEAR_TEXT
            json += 'fingerPrint:0,'; //是否支持水印保护, 0: 开启fingerPrint
            json += 'copyProtection:1,'; //防拷贝类型, 1:PROTECTION_MACROVISION
            json += 'allowTrickmode:1,'; // 表示该媒体是否允许任何trick mode操作（包括快进/快退/暂停）, 1: 允许Trickmode (缺省值)
            json += 'startTime:0,'; //表示媒体的起始时间
            json += 'endTime:20000.3,'; //表示媒体的结束时间
            json += 'entryID:"jsonentry1"}]'; //媒体加入Playlist 时，在媒体列表中的唯一标识。
            return json;
        },
        // 播放
        // 注意在河北MG101-U9这款盒子上width值和height值存在阈值，
        play:function(url,left, top, width, height,callback){
            var _this = this;
            _this.init();

            // 以下型号盒子转换成rtsp协议播放
            if(
                _this.getSTBModel().indexOf("E909")!=-1
                || _this.getSTBModel().indexOf("IHO3000S")!=-1
                || _this.getSTBModel().indexOf("EC")!=-1
                || _this.getSTBModel().indexOf("IP") != -1
                || _this.getSTBModel().indexOf("E900")!=-1
                || _this.getSTBModel().indexOf("B700")!=-1
            ){
                url = url.replace("http","rtsp");
            }

            if(typeof MediaPlayer != "undefined"){
                try{
                    _this.data.mediaPlayer.stop();
                    _this.data.mediaPlayer.releaseMediaPlayer(_this.data.instanceId);
                }
                catch(e){}
                
                _this.data.mediaPlayer = new MediaPlayer();
                _this.data.instanceId = _this.data.mediaPlayer.getNativePlayerInstanceID();

                var playListFlag = 0;       //Media Player 的播放模式。 0：单媒体的播放模式 (默认值)，1: 播放列表的播放模式
                var videoDisplayMode = 0;   //MediaPlayer 对象对应的视频窗口的显示模式. 1: 全屏显示2: 按宽度显示，3: 按高度显示
                var height = height;
                var width = width;
                var left = left;
                var top = top;
                var muteFlag = 0;           //0: 设置为有声 (默认值) 1: 设置为静音
                var useNativeUIFlag = 0;    // 0-不使用player的本地UI显示功能,1-使用player的本地UI显示功能(默认)
                var subtitleFlag = 0;       // 0-不显示字幕(默认),1-显示字幕
                var videoAlpha = 0;         // 0-不透明(默认),100-完全透明
                var cycleFlag = 0;          // 0-设置为循环播放（默认值）, 1-设置为单次播放 
                var randomFlag = 0;
                var autoDelFlag = 0;
                //初始化mediaplayer对象
                
                _this.data.mediaPlayer.initMediaPlayer(_this.data.instanceId,playListFlag,videoDisplayMode,height,width,left,top,muteFlag,useNativeUIFlag,subtitleFlag,videoAlpha,cycleFlag,randomFlag,autoDelFlag);
                
                _this.data.mediaPlayer.setAllowTrickmodeFlag(0); //设置是否允许trick操作。 0:允许 1：不允许

                _this.data.mediaPlayer.setVideoDisplayMode(0);

                _this.data.mediaPlayer.setVideoDisplayArea(left, top, width, height);

                _this.data.mediaPlayer.setNativeUIFlag(0);//播放器是否显示缺省的Native UI，  0:允许 1：不允许

                _this.data.mediaPlayer.setAudioTrackUIFlag(1);//设置音轨的本地UI显示标志 0:不允许 1：允许

                _this.data.mediaPlayer.setMuteUIFlag(1);//设置静音的本地UI显示标志 0:不允许 1：允许

                _this.data.mediaPlayer.setAudioVolumeUIFlag(0);//设置音量调节本地UI的显示标志 0:不允许 1：允许

                _this.data.mediaPlayer.setCycleFlag(1); //0:设置为循环播放（默认值）,1：设置为单次播放

                _this.data.mediaPlayer.refreshVideoDisplay();

                _this.data.mediaPlayer.setSingleMedia(_this.getMediaStr(url));//设置媒体播放器播放媒体内容

                

                _this.data.mediaPlayer.playFromStart();
                
                _this.playByTime(0)

                _this.data.callback = callback;

                _this.data.status = 1;
                _this.data.timer = setInterval(function(){
                    _this.data.currentPlayTime = _this.getCurrentPlayTime();
                    // 获取总时长
                    if(_this.data.currentPlayTime>0 && !_this.data.duration){

                        _this.data.duration = _this.getMediaDuration();
                    }
                    // 有的盒子并不能立即获取到当前时长，因此需要等获取到当前时长时才开始调用监听函数
                    if(_this.data.currentPlayTime >0){
                        _this.data.callback && _this.data.callback(_this.data);
                    }
                    
                }, 1000)
            }
            
        },
        /** 停止播放，释放资源 **/
        destroy: function() {
            if(this.data.mediaPlayer) {
                this.data.mediaPlayer.stop();

                this.data.mediaPlayer.releaseMediaPlayer(this.data.instanceId);
                this.init();
            }
        },
        /** 继续播放 **/
        resume:function(){
            if(this.data.mediaPlayer && this.data.currentPlayTime >0) {
                this.data.mediaPlayer.resume();
                this.data.status = 1;
            }
        },
        /** 暂停播放 **/
        pause:function(){
            if(this.data.mediaPlayer && this.data.currentPlayTime >0){
                this.data.mediaPlayer.pause();
                this.data.status = 0;
            }
        },
        /** 获取当前时间 */
        getCurrentPlayTime: function () {
            if(this.data.mediaPlayer ){
                return this.data.mediaPlayer.getCurrentPlayTime();
            }
        },
        /** 获取视频总长 */
        getMediaDuration: function () {
            if(this.data.mediaPlayer){
                return this.data.mediaPlayer.getMediaDuration();
            }
        },
        /**获取机顶盒型号**/
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
        /** 定点播放 */
        playByTime: function(second) {
            // if(
            //     this.getSTBModel().indexOf("B700")!= -1
            //     || this.getSTBModel().indexOf("HG680")!= -1
                
            // ){
            //     this.data.mediaPlayer.playByTime(1,second);
            // }
            // else{
            //     this.data.mediaPlayer.playByTime(1,second,1);
            // }
            this.data.mediaPlayer.playByTime(1,second,1);
        },
        // 快进
        forward:function(second){
            if(this.data.mediaPlayer&& this.data.currentPlayTime >0){
                if(this.getCurrentPlayTime()*1 + second> this.data.duration-2){
                    this.playByTime(this.data.duration-2);
                    this.pause();
                    
                }
                else{
                    this.playByTime(this.getCurrentPlayTime()*1 + second)
                    this.resume();
                }
            }
            
        },
        // 快退
        rewind:function(second){
            if(this.data.mediaPlayer&& this.data.currentPlayTime >0){
                if(this.getCurrentPlayTime()*1 - second< 0){
                    this.playByTime(0);
                }
                else{
                    this.playByTime(this.getCurrentPlayTime()*1 - second)
                }
                this.resume();
            }
            
        },
        // 获取音量
        getVolume:function(){
            if(this.data.mediaPlayer){
                var volume = this.data.mediaPlayer.getVolume()
                
                this.data.volume = volume; 
                return volume;
            }
        },
        // 设置音量
        // 音量设置某些盒子存在最低阈值，不能低于阈值，比如阈值为5那每次音量的改变量必须大于5，否则音量调节会失败
        setVolume:function(volume){
            if(this.data.mediaPlayer){
                this.data.mediaPlayer.setVolume(parseInt(volume))
                this.data.volume = volume;
            }
        },
        // 调大音量
        turnUpVolume:function(val){
            if(this.data.mediaPlayer){
                var volume = this.getVolume() + val;
                volume = volume > 100 ? 100 : volume;
                this.setVolume(volume);//设置系统音量
            }
        },
        // 调小音量
        turnDownVolume:function(val){
            if(this.data.mediaPlayer){
                var volume = this.getVolume() - val;
                volume = volume < 0 ? 0 : volume;
                this.setVolume(volume);//设置系统音量
            }
        },
    }

    var H5Player = {
        data:{
            // 播放器引用
            mediaPlayer:'',
            // 播放状态 0是暂停，1是播放中
            status:0,
            // 当前播放时间
            currentPlayTime:0,
            // 视频总时长
            duration:0,
            // 视频监听定时器
            timer:'',
            // 播放结束触发的回调函数
            callback:'',
            // 音量
            volume:'',
        },
        // 初始化参数
        init:function(){
            this.data.mediaPlayer = '';
            this.data.status = 0;
            this.data.currentPlayTime = 0;
            this.data.duration = 0;
            clearInterval(this.data.timer);
            this.data.timer = '';
            this.data.callback = '';
            this.data.volume = '';
        },
        // 播放
        play:function(url,left, top, width, height,callback){
            var _this = this;
            _this.init();

            if(typeof MediaPlayer == "undefined"){
                _this.data.mediaPlayer = document.createElement('video');
                _this.data.mediaPlayer.src = url;

                _this.data.mediaPlayer.width = width;
                _this.data.mediaPlayer.height = height;
                _this.data.mediaPlayer.style.position = 'absolute'; 
                _this.data.mediaPlayer.style.top = top + 'px';
                _this.data.mediaPlayer.style.left = left + 'px';
                _this.data.mediaPlayer.style.zIndex = '-1';
                document.getElementsByTagName('body')[0].appendChild(_this.data.mediaPlayer);
                _this.data.mediaPlayer.play()

                _this.data.callback = callback;
                
                _this.data.status = 1;
                _this.data.timer = setInterval(function(){
                    _this.data.currentPlayTime = _this.data.mediaPlayer.currentTime;
                    // 获取总时长
                    if(_this.data.currentPlayTime>0 && !_this.data.duration){
                        _this.data.duration = _this.data.mediaPlayer.duration;
                    }
                    // 有的盒子并不能立即获取到当前时长，因此需要等获取到当前时长时才开始调用监听函数
                    if(_this.data.currentPlayTime >0){
                        _this.data.callback && _this.data.callback(_this.data);
                    }
                    
                }, 200)
            }
            
        },
        /** 停止播放，释放资源 **/
        destroy: function() {
            if(this.data.mediaPlayer) {
                document.getElementsByTagName('body')[0].removeChild(this.data.mediaPlayer);
                this.init();
            }
        },
        /** 继续播放 **/
        resume:function(){
            if(this.data.mediaPlayer && this.data.currentPlayTime >0) {
                this.data.mediaPlayer.play();
                this.data.status = 1;
            }
        },
        /** 暂停播放 **/
        pause:function(){
            if(this.data.mediaPlayer && this.data.currentPlayTime >0){
                this.data.mediaPlayer.pause();
                this.data.status = 0;
            }
        },
        /** 获取当前时间 */
        getCurrentPlayTime: function () {
            if(this.data.mediaPlayer ){
                return this.data.mediaPlayer.currentTime;
            }
        },
        /** 获取视频总长 */
        getMediaDuration: function () {
            if(this.data.mediaPlayer){
                return this.data.mediaPlayer.duration;
            }
        },
        /** 定点播放 */
        playByTime: function(second) {
            this.data.mediaPlayer.currentTime = second;
            this.data.currentPlayTime = second;
        },
        // 快进
        forward:function(second){
            if(this.data.mediaPlayer&& this.data.currentPlayTime >0){
                if(this.getCurrentPlayTime()*1 + second> this.data.duration-2){
                    this.playByTime(this.data.duration-2);
                    this.pause();
                    
                }
                else{
                    this.playByTime(this.getCurrentPlayTime()*1 + second)
                    this.resume();
                }
            }
        },
        // 快退
        rewind:function(second){
            if(this.data.mediaPlayer&& this.data.currentPlayTime >0){
                if(this.getCurrentPlayTime()*1 - second< 0){
                    this.playByTime(0);
                }
                else{
                    this.playByTime(this.getCurrentPlayTime()*1 - second)
                }
                this.resume();
            }
        },
        // 获取音量
        getVolume:function(){
            if(this.data.mediaPlayer){
                var volume = this.data.mediaPlayer.volume
                this.data.volume = volume; 
                return volume;
            }
        },
        // 设置音量
        setVolume:function(volume){
            if(this.data.mediaPlayer){
                this.data.mediaPlayer.volume = volume;
                this.data.volume = parseInt(volume*100);
            }
        },
        // 调大音量
        turnUpVolume:function(val){
            if(this.data.mediaPlayer){
                var volume = this.getVolume() + val/100;
                volume = volume > 1 ? 1 : volume;
                this.setVolume(volume);//设置系统音量
            }
        },
        // 调小音量
        turnDownVolume:function(val){
            if(this.data.mediaPlayer){
                var volume = this.getVolume() - val/100;
                volume = volume < 0 ? 0 : volume;
                this.setVolume(volume);//设置系统音量
            }
        },
    }
    if(typeof MediaPlayer == "undefined"){
        w.HCMP = H5Player;
    }
    else{
        w.HCMP = HCMP;
    }
    // w.HCMP = HCMP;
})(window);