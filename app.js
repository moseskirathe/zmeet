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
//app.set("views",__dirname + "/views");

app.use(express.static(__dirname + '/views'));

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: false
})); 



var root = "https://tricky-skunk-87.serverless.social";
var clientID = config.CLIENT_ID;
console.log("hello!!!" + clientID);
var appClientSecret = config.APP_CLIENT_SECRET;
var userID = config.USER_ID;
var accessToken = "";

/* Sign in page */
app.get('/', function (req, resp) {
    console.log("checking access token");
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
    
          // let mtopics = [];
           /* List meetings */
           for(meeting of meetings){
            scheduledMeetings.push(meeting);
           }
    
           console.log(scheduledMeetings.length);
    
    resp.render("index", {meetings: scheduledMeetings});
      });
    });
    req.end();
    }
});

/* Complete OAuth verification */
app.get('/OAuth/', function (req, res) {
    console.log("OAuth complete");

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
        console.log("Request successful");

        var accessTokenObj = JSON.parse(body);
        console.log(accessTokenObj);
        var accessToken = accessTokenObj.access_token;
        /* Authentication Successful - user token received */
        console.log(accessToken);
        //var accessToken = encodeURIComponent(body);
        res.redirect('/authSuccess/?accessToken=' + accessToken);
       });
});


/* Get all upcoming meetings */

app.get('/authSuccess/', function (req, resp) {
  //  fs.readFile('authComplete.html', function(err, data) {
  //       if (err) throw err;
  //       else res.end(data);
  //     });
    
    accessToken = req.query.accessToken;
    resp.redirect('/');
    
// req.end();
});

/* new meetings test */
app.post('/testmeetings/', function (req, res) {
    /*console.log("Topic: " + req.body.topic);
    console.log("Date: " + req.body.date);
    console.log("Time: " + req.body.time);
    console.log("Meeting password required: " + req.body.meetingPassword);
    console.log("Meeting password input: " + req.body.meetingPasswordInput);
    console.log("Waiting Room: " + req.body.waitingRoom);
    console.log("Mute participants on entry: " + req.body.muteParticipantsOnEntry);
    console.log("onlyAuthenticatedUsers: " + req.body.onlyAuthenticatedUsers);
    console.log("automaticallyRecordMeetings: "+req.body.automaticallyRecordMeeting);
    if(!req.body.waitingRoom){
      console.log("HELLO!");
    }
*/
    
   // res.redirect('/');
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
          console.log(body.toString());
        });
      });

      console.log(startDateTime);

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
      /* Response: meeting details object */
      console.log("meeting has been created");
      /* Redirect to home, without the sign in if authentication is still valid */
      res.redirect("/");
      req.end();
});

   var server = app.listen(8080, function () {
   var host = server.address().address
   var port = server.address().port
   
   console.log("Example app listening at http://%s:%s", host, port)
});


/* https://steemit.com/utopian-io/@prodicode/how-to-use-ejs-displaying-data-from-nodejs-in-html */