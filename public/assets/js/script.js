$(document).ready(() => {

  /* IMAGE THUMBNAIL STUFF */
  function readURL(input) {
    console.log(input)

    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {

        $('#placeholder-image').attr('src', e.target.result);
        $('#placeholder-image').attr('alt', "selected image thumbnail");
        $('#placeholder-image').prev('#placeholder-image').attr('id', "selected-image");
        console.log(e.target.result)

        /* $('#imgUrl').attr('value', 1);
        $('#imgUrl').attr('value', e.target.result);
        */
      }

      reader.readAsDataURL(input.files[0]);
    }
  }

  $("#imgInp").change(function () {
    readURL(this);
  });

  /*----------------------------------------------------------------------------------*/

  /* LIBRARY PAGE STUFF */
  $(".delete-btn").click(function() {
    let itemId = this.id;
    $.get("/db/delete/" + itemId, function() {
      location.reload()
    });
  })
})