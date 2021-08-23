$(document).ready(function () {
});

window.saveSettings = function (postId) {

    _buttonToggleDisable(true);

    const settingsData = {
        blogName: $("#blog_name").val(),
        aboutBlog: $("#about_blog").val(),
        copyRightInfo: $("#copyright_info").val()
    };

    _saveSettings(settingsData);
    
};

function _saveSettings(settingsData){

    $.ajax({
        "url": "/api/settings",
        method: 'PUT',
        data: JSON.stringify(settingsData),
        contentType: "application/json",
        success: function () {
            console.log("Settings saved");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log({ status: textStatus, error_message: jqXHR.responseText });
        },
        complete: function() {
            _buttonToggleDisable(false);
        }
    });

}

function _buttonToggleDisable(disabled){
    $("#save-settings").prop('disabled', disabled);
}