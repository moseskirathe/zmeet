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

function clearFormValues(){
    
}