// --------------------
// index.html helper functions
// --------------------
function openBook() {
  setTimeout(function() {
    $(".tabletop").addClass("book-open-tabletop");

    $('.shbook').removeClass('rotatedBefore');
    $('.shbook').addClass('rotated');
  },500);
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
