function showAdvancedSettings(){
    let advancedSettingsBlock = document.getElementById('advanced-settings');
    if(advancedSettingsBlock.style.display == "block"){
        advancedSettingsBlock.style.display = "none";
        document.getElementById('advanced-settings-action-label').innerHTML = "Show Advanced Settings";
    } else {
        advancedSettingsBlock.style.display = "block";
        document.getElementById('advanced-settings-action-label').innerHTML = "Hide Advanced Settings";
    }
    
}

function checkMeetingPassword(){
    let meetingPasswordCheckbox = document.getElementById('meetingPasswordCheckBox');
    let meetingPasswordContainer = document.getElementById("meetingPasswordContainer");
    if(meetingPasswordCheckbox.checked){
        meetingPasswordContainer.style.display ="block";
    } else {
        meetingPasswordContainer.style.display ="none";
    }
}


// acceptance criteria: [a-z A-Z 0-9 @ - _ * !]
function validateMeetingPassword(){
    let isPasswordValid = true;
    let inputTextbox = document.getElementById("meetingPasswordInput");
    let inputValue = inputTextbox.value;
    let literals = ["@","-","_","*","!"];

    let splitInput = inputValue.split('');
    for(char of splitInput){
      if(isLetter(char) || !isNaN(char) || literals.includes(char)){
          // do nothing
      } else{
          isPasswordValid = false;
      }
    }

    if(isPasswordValid && splitInput.length <= 10){
        inputTextbox.style.border = "1px solid #e3e9f0";
    } else {
        inputTextbox.style.border = "1px solid red";
    }
}

function isLetter(str) {
    return str.length === 1 && (str.match(/[a-z]/i) || str.match(/[A-Z]/i));
  }

function validateForm(){
    let topicInputValue = document.forms["newMeetingForm"]["topic"].value;
    let passwordInputValue = document.forms["newMeetingForm"]["meetingPasswordInput"].value;
    let meetingPasswordCheckbox = document.getElementById('meetingPasswordCheckBox');
    if(topicInputValue == ""){
        // red border, warning label
        document.getElementById("topic").style.border = "1px solid red";
        document.getElementById("topic-validation-label").style.display = "block";
        return false;
    } else if(meetingPasswordCheckbox.checked && passwordInputValue == ""){
        // red border, password warning label
        document.getElementById("meetingPasswordInput").style.border = "1px solid red";
        document.getElementById("password-validation-label").style.display = "block";
        return false;
    }


}

function updateDateTime(){
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let modifiedMonth = "";
    if(month < 10) modifiedMonth = "0"+month;
    else modifiedMonth = month;
    let day = date.getDate();
    let modifiedDay = "";
    if(day < 10) modifiedDay = "0"+day;
    else modifiedDay = day;
    let fullCurrentDate = year + "-"+ modifiedMonth + "-" + modifiedDay;
    let hours = date.getHours();
    let minutes = date.getMinutes();

    let datePicker = document.getElementById("inputDate");
    let timePicker = document.getElementById("inputTime");

    datePicker.min = fullCurrentDate;
    datePicker.value = fullCurrentDate;

    let fullCurrentTime = hours+":"+minutes;
    timePicker.value = fullCurrentTime;
}


function startMeeting(){
    let meetingURL = document.getElementById("meetingURL").innerHTML;
    window.open(meetingURL);
}

function copyToClipboard(){

    let meetingDetails = document.getElementById("meetingDetails").innerHTML;
    let textArea = document.createElement("textarea");
  
    // Place in top-left corner of screen regardless of scroll position.
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
  
    // Ensure it has a small width and height. Setting to 1px / 1em
    // doesn't work as this gives a negative w/h on some browsers.
    textArea.style.width = '2em';
    textArea.style.height = '2em';
  
    // We don't need padding, reducing the size if it does flash render.
    textArea.style.padding = 0;
  
    // Clean up any borders.
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
  
    // Avoid flash of white box if rendered for any reason.
    textArea.style.background = 'transparent';
  
  
    textArea.value = meetingDetails;
  
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      let successful = document.execCommand('copy');
      let msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copying text command was ' + msg);
    } catch (err) {
      console.log('Oops, unable to copy');
    }
  
    document.body.removeChild(textArea);
  
  document.getElementById("shareMeetingBtn").innerHTML ="Copied meeting details!";
}