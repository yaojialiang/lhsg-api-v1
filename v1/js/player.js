/* 
* @Author: Marte
* @Date:   2020-04-15 15:36:34
* @Last Modified by:   Marte
* @Last Modified time: 2020-10-28 17:36:31
*/

var mp = new MediaPlayer();
var mp_status = 0;
var mp_volume = 0;
var instanceId = mp.getNativePlayerInstanceID();
function mp_play(url,left,top,width,height,callback){

    //初始化mediaplayer对象
    mp.initMediaPlayer(instanceId,0,0,height,width,left,top,0,0,0,0,0,0,0);
    
    mp.setAllowTrickmodeFlag(0); //设置是否允许trick操作。 0:允许 1：不允许

    mp.setVideoDisplayMode(0);

    mp.setVideoDisplayArea(left, top, width, height);

    mp.setNativeUIFlag(0);//播放器是否显示缺省的Native UI，  0:允许 1：不允许

    mp.setAudioTrackUIFlag(1);//设置音轨的本地UI显示标志 0:不允许 1：允许

    mp.setMuteUIFlag(1);//设置静音的本地UI显示标志 0:不允许 1：允许

    mp.setAudioVolumeUIFlag(0);//设置音量调节本地UI的显示标志 0:不允许 1：允许

    mp.setCycleFlag(1); //0:设置为循环播放（默认值）,1：设置为单次播放

    mp.refreshVideoDisplay();

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

    mp.setSingleMedia(json);//设置媒体播放器播放媒体内容
    mp.playFromStart();
    mp_status = 1;

    callback && callback();
}
/** 停止播放，释放资源 **/
function mp_destroy(){
    if(mp) {
        mp.stop();
        mp.releaseMediaPlayer(instanceId);
    }
}
/** 继续播放 **/
function mp_resume(){
    if(mp) {
        mp.resume();
        mp_status = 1;
    }
}
/** 暂停播放 **/
function mp_pause(){
    if(mp){
        mp.pause();
        mp_status = 0;
    }
}
/** 获取当前时间 */
function mp_getCurrentPlayTime() {
    if(mp){
        return mp.getCurrentPlayTime();
    }
}
/** 获取视频总长 */
function mp_getMediaDuration(){
    if(mp){
        return mp.getMediaDuration();
    }
}
function mp_playByTime(second) {
    if(mp){
        mp.playByTime(1,second,1);
    }   
}
// 快进
function mp_forward(second){
    if(mp && mp_getCurrentPlayTime() >0){
        if(mp_getCurrentPlayTime()*1 + second> mp_getMediaDuration()-2){
            return;
        }
        else{
            mp_playByTime(mp_getCurrentPlayTime()*1 + second)
            mp_resume()
        }
    }
}
// 快退
function mp_rewind(second){
    if(mp&& mp_getCurrentPlayTime() >0){
        if(mp_getCurrentPlayTime()*1 - second< 0){
            return;
        }
        else{
            mp_playByTime(mp_getCurrentPlayTime()*1 - second)
            mp_resume();
        }
    }
}
// 获取音量
function mp_getVolume(){
    if(mp){
        return mp.getVolume();
    }
}
// 设置音量
// 音量设置某些盒子存在最低阈值，不能低于阈值，比如阈值为5那每次音量的改变量必须大于5，否则音量调节会失败
function mp_setVolume(volume){
    if(mp){
        mp.setVolume(parseInt(volume))
        mp_volume = volume; 
    }
}
// 调大音量
function mp_turnUpVolume(val){
    if(mp){
        var volume = mp_getVolume() + val;
        volume = volume > 100 ? 100 : volume;
        mp_setVolume(volume);//设置系统音量
    }
}
// 调小音量
function mp_turnDownVolume(val){
    if(mp){
        var volume = mp_getVolume() - val;
        volume = volume < 0 ? 0 : volume;
        mp_setVolume(volume);//设置系统音量
    }
}