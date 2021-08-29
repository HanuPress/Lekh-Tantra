$(document).ready(function () {
});

Dropzone.options.fileuploadzone = {
    init: function(){
        this.on("success", function(file, response) { location.reload(); });
    },
    paramName: "file", // The name that will be used to transfer the file
    maxFilesize: 2, // MB
};

$('.copy-image-link-button').click(function(){

    const imgURL = $(this).parent().parent().parent().find('.gallery-image').attr("src");
    //const imgURL = $(this).attr("src");
    console.log(imgURL);

    const textarea = document.createElement("textarea");
    textarea.textContent = imgURL;
    textarea.style.position = "fixed"; // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy"); 
    document.body.removeChild(textarea);

    Swal.fire({
        title: 'Link Copied!',
        text: 'Link Copied to clipboard',
        icon: 'success',
        position: 'top-end',
        showConfirmButton: false,
        toast: true,
        timer: 1500
    });
});

$('.delete-image-button').click(function(){

    const imgURL = $(this).parent().parent().parent().find('.gallery-image').attr("src");
    //const imgURL = $(this).attr("src");
    console.log(imgURL);
    const files = [imgURL];

    $.ajax({
        "url": "/file/delete",
        method: 'POST',
        data: JSON.stringify(files),
        contentType: "application/json",
        success: function (data) {
            console.log("File deleted");
            location.reload();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log({ status: textStatus, error_message: jqXHR.responseText });
        },
        complete: function() {
        }
    });
});