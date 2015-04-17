var day = "";
$("ul#dropdown2 li a").click(function() {
  day = $(this).html(); // sets day to text of a element
  $(".timeslots").fadeIn()
});
$("ul#dropdown2 li a")// means "select the a elements in li elements under ul element with ID 'dropdown2'"