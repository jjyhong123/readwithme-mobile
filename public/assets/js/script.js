$(document).ready(() => {

  /* IMAGE THUMBNAIL STUFF */
  function readURL(input) {
    console.log(input)

    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        $('#blah').attr('src', e.target.result);
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