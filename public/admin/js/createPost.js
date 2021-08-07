tinymce.init({
    selector: 'textarea',
    height: 300,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table paste code help wordcount'
    ],
    toolbar: 'undo redo | formatselect | ' +
    'bold italic backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
    content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
});

$(document).ready(function () {
});

window.publishPost = function (postId) {

    const postData = {
        title: $("#blog_title").val(),
        content: tinymce.activeEditor.getContent(),
        status: 'Active'
    };

    if(postId){
        updatePost(postId, postData);
    }
    else{
        createPost(postData);
    }
    
};

window.saveDraft = function (postId) {
    
    const postData = {
        title: $("#blog_title").val(),
        content: tinymce.activeEditor.getContent(),
        status: 'Draft'
    };

    if(postId){
        updatePost(postId, postData);
    }
    else{
        createPost(postData);
    }
};

function createPost(postData){

    $.ajax({
        "url": "/api/post",
        method: 'POST',
        data: JSON.stringify(postData),
        contentType: "application/json",
        success: function () {
            console.log("Post created");
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log({ status: textStatus, error_message: jqXHR.responseText });
        },
        complete: function() {
            //called when complete
        }
    });

}

function updatePost(postId, postData){
    
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
            //called when complete
        }
    });
}