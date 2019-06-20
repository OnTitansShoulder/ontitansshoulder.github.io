function isNumber (text) {
  reg = new RegExp('[0-9]+$');
  if(text) {
    return reg.test(text);
  }
  return false;
}
function removeSpecial (text) {
  if(text) {
    var lower = text.toLowerCase();
    var upper = text.toUpperCase();
    var result = "";
    for(var i=0; i<lower.length; ++i) {
      if(isNumber(text[i]) || (lower[i] != upper[i]) || (lower[i].trim() === '')) {
        result += text[i];
      }
    }
    return result;
  }
  return '';
}
function openBook() {
  $(".header").css("display", "block");
  $("#bookhome").css("border", "none");
  setTimeout(function() {
    $(".header").css("top", "0px");
    // $(".head").css("height", "40px");
    $(".tabletop").addClass("book-open-tabletop");

    $('.shbook').removeClass('rotatedBefore');
    $('.shbook').addClass('rotated');
  },500);
  setTimeout(function() {
    $(".book").css("display", "none");
    $("#bookhome").css("display", "none");
  },1000);
}
function showTip() {
  $('#qq').tooltip();
}
// document.getElementById("resumeBtn").onchange = function () {
//   $("#fileContainer").css("backgroundColor", "#6C9668");
//   var value = this.value.split(/[\/\\]/).pop();
//   $("#filetext").text(value.replace(/\.[^/.]+$/, ""));
// }
