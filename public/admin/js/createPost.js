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

window.publishPost = function () {
    const myContent = tinymce.activeEditor.getContent();
    const title = $("#blog_title").val();
    console.log("Publish post");
    console.log(title);
    console.log(myContent);
};

window.saveDraft = function () {
    console.log("Save Draft");
    const postData = {
        title: $("#blog_title").val(),
        content: tinymce.activeEditor.getContent()
    };

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
};