var request = require('request')
    , JSONStream = require('JSONStream')
    , es = require('event-stream')
    , async = require('async') 
    , socketio = require('socket.io')
    , express = require('express');

 
    var app = express();
    var server = require('http').createServer(app);
    var io = socketio.listen(server);
    
    app.get('/', function(req, res){
        res.sendfile('index.html');
    });
 
   
    console.log('Server Running~!');
        
    function thread1() { 
        var result  = Array();
        var result_twi  = Array();
        
        //json 파서
        var parser = JSONStream.parse(['results', true])
                     .on('error', function(err) { console.log(err); })
            //트위터 쿼리문(한국에서 반경 125000km 까지의 트위터 검색)        
          , req = request({url: 'http://search.twitter.com/search.json?geocode=37.335887,126.584063,125000km'})
          , logger = es.mapSync(function (data) {
                //console.log(data.iso_language_code);
                //파싱한 데이터를 배열에 넣음
                result.push(data.iso_language_code);
                result_twi.push(data.text);
        }).on('error', function(err) { console.log(err); });
        
        //json 비동기 처리를 위한 패러럴모듈사용
        async.parallel([
          function(callback) {
            setTimeout(function() {
              req.pipe(parser).pipe(logger);
              callback(null, 'one');   
            }, 10);
          },
        
           
          function(callback) {          
            setTimeout(function(){
              callback(null, 'three');
            }, 1000);
          },
        ],
        
        //html 로 메시지 보냄
        function(err, results) {
             io.sockets.emit('message', result); 
             io.sockets.emit('message_twi', result_twi); 
        });
    }

    //1.5초마다 스레드함수로 시작
    var tid = setInterval( thread1,  1500);
    
    
    server.listen(8080);


