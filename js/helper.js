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
  setTimeout(function() {
    $(".tabletop").addClass("book-open-tabletop");

    $('.shbook').removeClass('rotatedBefore');
    $('.shbook').addClass('rotated');
  },500);
}
function jumpPage (page) {
  console.log("jumpPage!");
  window.location.href = page;
}
function showTip() {
  $('#qq').tooltip();
}
function toggleShowMore(targetId){
  let showMoreElement = document.getElementById(targetId + "_H");
  let showMoreButton = document.getElementById(targetId + "_B");
  if(showMoreElement.classList.contains('hidden')){
    showMoreElement.classList.remove('hidden');
    showMoreButton.innerHTML = "Show Less &uarr;";
  } else {
    showMoreElement.classList.add('hidden');
    showMoreButton.innerHTML = "Show More &darr;";
  }
}
