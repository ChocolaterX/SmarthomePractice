var AipSpeechClient = require("baidu-aip-sdk").speech;
var fs = require('fs');
var voice = fs.readFileSync('./voice.wav');
var voiceBuffer = new Buffer(voice);

console.log(voiceBuffer);
// ����APPID/AK/SK
var APP_ID = "10881087";
var API_KEY = "QVTRiLP2k64ST3jN7CxM10tp";
var SECRET_KEY = "sLuvqNhuCyCArdeEGjnsiDBsnvkbg4xS";

// �½�һ�����󣬽���ֻ����һ��������÷���ӿ�
var client = new AipSpeechClient(APP_ID, API_KEY, SECRET_KEY);
//console.log(client);

// ʶ�𱾵��ļ�
client.recognize(voiceBuffer, 'pcm', 8000).then(function (result) {
    console.log(JSON.stringify(result));
}, function(err) {
    console.log(err);
});
