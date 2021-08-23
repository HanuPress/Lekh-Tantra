tinymce.init({
    selector: 'textarea',
    height: 300,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'textcolor, searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar: 'undo redo | formatselect | image | ' +
    'bold italic forecolor backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
    file_picker_types: 'image'
});

$(document).ready(function () {
});

window.publishPost = function (postId) {

    _buttonToggleDisable(true);

    const postData = {
        title: $("#blog_title").val(),
        content: tinymce.activeEditor.getContent(),
        status: 'Active'
    };

    if(postId){
        _updatePost(postId, postData);
    }
    else{
        _createPost(postData);
    }
    
};

window.saveDraft = function (postId) {
    
    _buttonToggleDisable(true);
    
    const postData = {
        title: $("#blog_title").val(),
        content: tinymce.activeEditor.getContent(),
        status: 'Draft'
    };

    if(postId){
        _updatePost(postId, postData);
    }
    else{
        _createPost(postData);
    }
};

function _createPost(postData){

    $.ajax({
        "url": "/api/post",
        method: 'POST',
        data: JSON.stringify(postData),
        contentType: "application/json",
        success: function (data) {
            console.log("Post created");
            window.location.href = "/admin/edit/" + data.id;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log({ status: textStatus, error_message: jqXHR.responseText });
        },
        complete: function() {
            _buttonToggleDisable(false);
        }
    });

}

function _updatePost(postId, postData){
    
    $.ajax({
        "url": "/api/post/" + postId,
        method: 'PUT',
        data: JSON.stringify(postData),
        contentType: "application/json",
        success: function () {
            console.log("Post updated");
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

    $("#save-draft").prop('disabled', disabled);
    $("#publish-post").prop('disabled', disabled);
}