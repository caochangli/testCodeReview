// 检查浏览器是否支持
function checkSystemRequirements()
{
	if(!AgoraRTC.checkSystemRequirements || !AgoraRTC.checkSystemRequirements()) {
	  return false;
	}
	else
	{
		return true;
	}
}

var client, localStream, camera, microphone, localUid;
var localStreamInited = false;
var streamMaps = new Map();



function setAudioVolume(value)
{
  streamMaps.forEach(function (remoteUser, key, mapObj) {
      if(value > 0)
      {
        if(ignoreList.indexOf(remoteUser.uid) >= 0 )
        {
            remoteUser.audioTrack &&  remoteUser.audioTrack.setVolume(0);
        }
        else
        {
            remoteUser.audioTrack && remoteUser.audioTrack.setVolume(value);
        }
      }
      else
      {
        remoteUser.audioTrack && remoteUser.audioTrack.setVolume(value);
      }      
  });
  audioVolume = value;
}

var isOpenMic = false;
function openMic(value)
{
	if(localStreamInited)
	{
      isOpenMic = value;
      localStream.setEnabled(value);

      // 通知游戏麦克风打开结果
    //   GameAudioManager.OpenMicResult(isOpenMic);
        if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
            window[gameFlag].CallGameAudioManager("OpenMicResult",isOpenMic);
	}
  else
  {
      if(value)
      {
          getDevices();
          if(hasAudio)
          {
            isOpenMic = value;
            createLocalStream();
          }
          else
          {
            // GameAudioManager.createLocalAgoraResult(false);
            if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
                window[gameFlag].CallGameAudioManager("createLocalAgoraResult",false);
          }
      }
  }
}

var audioVolume = 0;
// 打开听筒
function openAudio(value)
{
  if(value)
  {
    setAudioVolume(50);
  }
  else
  {
    setAudioVolume(0);
  }
}

function IsInAgoraRoom()
{
  return client != null;
}

// 是否打开了麦克风
function IsopenMic()
{
  return isOpenMic;
}

//是否打开听筒
function IsopenAudio()
{
  return audioVolume > 0;
}

// 屏蔽指定玩家语音

var ignoreList = new Array();
function updateIgnoreAudio(list)
{
    ignoreList = list;
    setAudioVolume(audioVolume);
}

var hasAudio = false;
function getDevices()
{
    AgoraRTC.getDevices().then(devices => {
    for (var i = 0; i !== devices.length; ++i) {
        var device = devices[i];
        if (device.kind === 'audioinput') 
        {
              hasAudio = true;
              microphone = device.label || 'microphone1 ';
              break;
        }
      }
  });	
}

//加入房间
async function joinAgoraRoom(appid,channelId,userid) {
    var channel_key = null;
    client = AgoraRTC.createClient({
      codec: "vp8",
      mode: "rtc",
    });
    try{
      const uid = await client.join(appid, channelId,channel_key, userid);
      localUid = uid;
      openAudio(50);
      createLocalStream();
      // 通知游戏加入房间结果
      if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
          window[gameFlag].CallGameAudioManager("JoinAgoraRoomResult", true);
    }
    catch (e)
    {
      if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
          window[gameFlag].CallGameAudioManager("JoinAgoraRoomResult", false);
    }
  
    channelKey = "";
    client.on('error', function(err) {
      console.log("Got error msg:", err.reason);
      if (err.reason === 'DYNAMIC_KEY_TIMEOUT') {
        client.renewChannelKey(channelKey, function(){
          console.log("Renew channel key successfully");
        }, function(err){
          console.log("Renew channel key failed: ", err);
        });
      }
    });
  
    client.on("user-published", async (remoteUser, mediaType) => {
      await client.subscribe(remoteUser,mediaType);
      if (mediaType === "audio" || mediaType === "all") {
          // console.log("subscribe audio success");
          streamMaps.set(remoteUser.uid,remoteUser);
          // 检查一次该玩家是否在屏蔽中
          setAudioVolume(audioVolume);
          remoteUser.audioTrack && remoteUser.audioTrack.play();
      }
    });
  
  //   client.on('stream-added', function (evt) {
  //     var stream = evt.stream;
  //     client.subscribe(stream, function (err) {
  //       console.log("Subscribe stream failed", err);
  //     });
  
  //     if(streamMaps.has(stream.getId()) === false)
  //     {
  //         streamMaps.set(stream.getId(),stream);
  //         // 检查一次该玩家是否在屏蔽中
  //         setAudioVolume(audioVolume);
  //     }
  //   });
  
  //   client.on('stream-subscribed', function (evt) {
  //     var stream = evt.stream;
  //     // stream.setAudioVolume(0);
  //     console.log("Subscribe remote stream successfully: " + stream.getId());
  //   	if ($('div#video #agora_remote'+stream.getId()).length === 0) {
  //  	    $('div#video').append('<div id="agora_remote'+stream.getId()+'" style="float:left; width:810px;height:607px;display:inline-block;"></div>');
  // 	  }
  //     stream.play('agora_remote' + stream.getId());
  //   });
  
  //   client.on('stream-removed', function (evt) {
  //     var stream = evt.stream;
  //     stream.stop();
  //     $('#agora_remote' + stream.getId()).remove();
  //     streamMaps.delete(stream.getId());
  //     console.log("Remote stream is removed " + stream.getId());
  //   });
  
    client.on("user-unpublished", async (remoteUser, mediaType) => {
      await client.unsubscribe(remoteUser);
      if (mediaType === "audio" || mediaType === "all") {
          // $('#agora_remote' + remoteUser.uid).remove();
          remoteUser.audioTrack && remoteUser.audioTrack.stop();
          streamMaps.delete(remoteUser.uid);
          console.log("Remote stream is removed " +remoteUser.uid);
      }
    });
  
  //   client.on('peer-leave', function (evt) {
  //     var stream = evt.stream;
  //     if (stream) {
  //         stream.stop();
  //         streamMaps.delete(stream.getId());
  //         //$('#agora_remote' + stream.getId()).remove();
  //         console.log(evt.uid + " leaved from this channel");
  //     }
  //   });
    client.on('user-left', function (remoteUser, reason) {
      if (remoteUser) {
          remoteUser.audioTrack && remoteUser.audioTrack.stop();
          streamMaps.delete(remoteUser.uid);
          //$('#agora_remote' + stream.getId()).remove();
          console.log(remoteUser.uid + " leaved from this channel");
      }
    });
  
    client.enableAudioVolumeIndicator(); // 每两秒触发 "volume-indicator" 回调
    client.on("volume-indicator", function(result){
      //   GameAudioManager.AudioVolumeIndicator(evt.attr);
        if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
          window[gameFlag].CallGameAudioManager("AudioVolumeIndicator", result);
    });
  }
  
  //离开频道
  async function leaveAgoraRoom() {
    if(client)
    {
      try{
          await client.leave();
          localStream.close();
          ignoreList.length = 0;
          localStreamInited = false;
          isOpenMic = false;
          audioVolume = 0;
          client = null;
          localStream = null;
          streamMaps.clear();
          //   GameAudioManager.LevaAgoraRoomResult();
          if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
          window[gameFlag].CallGameAudioManager("LevaAgoraRoomResult");
      }
      catch(e)
      {
          console.log("Leave channel failed");
      }
    }
  }
  
  async function publish() {
    if(client)
    {
      try{
          await client.publish(localStream);
      }
      catch(e)
      {
          console.log("Publish local stream error: " + err);
      }
    }
  }
  
  async function unpublish() {
    if(client)
    {
      try{
          await client.unpublish(localStream);
      }
      catch(e)
      {
          console.log("Unpublish local stream error: " + err);
      }
    }
  }

async function createLocalStream()
{
    if(hasAudio && client && localUid)
    {
        try{
            localStream = await AgoraRTC.createMicrophoneAudioTrack();
            // localStream.play('agora_local');

            await publish();


            localStreamInited = true;

            openMic(isOpenMic);
            // GameAudioManager.createLocalAgoraResult(true);
            if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
                window[gameFlag].CallGameAudioManager("createLocalAgoraResult",true);
        }
        catch(e)
        {
            if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
                window[gameFlag].CallGameAudioManager("createLocalAgoraResult",false);
        }
        // localStream = AgoraRTC.createStream({streamID: localUid, audio: true, video: false, screen: false});
        // localStream.on("accessAllowed", function() {
        // });

        // localStream.on("accessDenied", function() {
        // });

        // localStream.init(function() {
        //     localStream.play('agora_local');

        //     client.publish(localStream, function (err) {
        //     });

        //     client.on('stream-published', function (evt) {
        //     });

        //     localStreamInited = true;

        //     openMic(isOpenMic);
        //     // GameAudioManager.createLocalAgoraResult(true);
        //     if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
        //         window[gameFlag].CallGameAudioManager("createLocalAgoraResult",true);

        // }, function (err) {
        // //   GameAudioManager.createLocalAgoraResult(false);
        //     if(window[gameFlag] && window[gameFlag].CallGameAudioManager)
        //         window[gameFlag].CallGameAudioManager("createLocalAgoraResult",false);
        // });	
    }
}



getDevices();