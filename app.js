var express = require('express');
var app = express();
var fs = require('fs');
var request = require('request');
var http = require("https");
var config = require('./config');

var bodyParser = require('body-parser');
const { isNullOrUndefined } = require('util');
// Set view engine to ejs
app.set("view engine", "ejs");


// Tell Express where we keep our frontend files
app.use(express.static(__dirname + '/views'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
})); 



var root = config.ROOT;
var clientID = config.CLIENT_ID;
var appClientSecret = config.APP_CLIENT_SECRET;
var userID = config.USER_ID;
var accessToken = "";

/* Sign in page */
app.get('/', function (req, resp) {
    // Check access token
    if(accessToken == ""){
    resp.render("login");
    } else {
        
      var options = {
          "method": "GET",
          "hostname": "api.zoom.us",
          "port": null,
          "path": "/v2/users/" + userID + "/meetings?page_number=1&page_size=30&type=upcoming",
          "headers": {
            "authorization": "Bearer " + accessToken
      }
    };
    
        var scheduledMeetings = [];
        var req = http.request(options, function (res) {
        var chunks = [];
    
        res.on("data", function (chunk) {
         chunks.push(chunk);
        });
    
        res.on("end", function () {
         var body = Buffer.concat(chunks);
           var meetingDetailsObj = JSON.parse(body);
           if(meetingDetailsObj.code == 124){
               res.redirect('/OAuth/');
               res.end();
           }
           var meetings = meetingDetailsObj.meetings;
    
           for(meeting of meetings){
            scheduledMeetings.push(meeting);
           }
    
    resp.render("index", {meetings: scheduledMeetings});
      });
    });
    req.end();
    }
});

/* Complete OAuth verification */
app.get('/OAuth/', function (req, res) {
      /* Request access token */
      var userCode = req.query.code;
      var authorizationHeader = 'Basic ' + Buffer.from(clientID + ':' + appClientSecret).toString('base64');
      var options = {
        method: 'POST',
        url: 'https://zoom.us/oauth/token',
        qs: {
         grant_type: 'authorization_code',
         code: userCode,
         redirect_uri: root + "/OAuth/"
        },
        headers: {
         Authorization: authorizationHeader
        }
      };

      request(options, function(error, response, body) {
        if (error) throw new Error(error);
        var accessTokenObj = JSON.parse(body);
        var accessToken = accessTokenObj.access_token;
        /* Authentication Successful - user token received */
        res.redirect('/authSuccess/?accessToken=' + accessToken);
       });
});


/* Get all upcoming meetings */

app.get('/authSuccess/', function (req, resp) {
    accessToken = req.query.accessToken;
    resp.redirect('/');
});

/* Create a new meeting */
app.post('/meetings/', function (req, res) {
  let meetingTopic = req.body.topic;
  let startDate = req.body.date;
  let startTime = req.body.time;
  let startDateTime = startDate + 'T' + startTime + ":00Z";
  let password = '';
  let waitingRoom = false;
  let muteUponEntry = false;
  let onlyAuthenticatedUsers = false;
  let automaticallyRecordMeeting = false;

  if(!(!req.body.meetingPassword)) password = req.body.meetingPasswordInput;
  if(!(!req.body.waitingRoom)) waitingRoom = true;
  if(!(!req.body.muteParticipantsOnEntry)) muteUponEntry = true;
  if(!(!req.body.onlyAuthenticatedUsers)) onlyAuthenticatedUsers = true;
  if(!(!req.body.automaticallyRecordMeeting)) automaticallyRecordMeeting = true;


    var options = {
        "method": "POST",
        "hostname": "api.zoom.us",
        "port": null,
        "path": "/v2/users/me/meetings",
        "headers": {
          "content-type": "application/json",
          "authorization": "Bearer " + accessToken
        }
      };
      
      var req = http.request(options, function (res) {
        var chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function () {
          var body = Buffer.concat(chunks);
        });
      });

      req.write(JSON.stringify({
        topic: meetingTopic,
        type: 2,
        start_time: startDateTime,
        timezone: '',
        password: '',
        settings: {
          waiting_room: waitingRoom,
          meeting_authentication: onlyAuthenticatedUsers,
          mute_upon_entry: muteUponEntry,
          auto_recording: automaticallyRecordMeeting
        }
      }));
      /* Redirect to home, without the sign in if authentication is still valid */
      res.redirect("/");
      req.end();
});

   var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Zmeet App listening at http://%s:%s", host, port)
});