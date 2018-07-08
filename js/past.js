/*Utility helper functions*/
function check(){
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

var jumpMenu = $("#jumpMenu");
var topMenuHeight = 50;
var navPostItems = jumpMenu.find("a");
var itemLevel = navPostItems.map(function () {
  let item = $($(this).attr("href"));
  if (item.length) { return item.offset().top; }
});
var halfScreen = ($(window).height() - 50) / 2;
navPostItems[0].classList.add("active");

var recordLevel = 50;
$("#body").scroll(function () {
  let currentLevel = $(this).scrollTop() + topMenuHeight;
  console.log(currentLevel);
  for (var i=0; i<itemLevel.length; i++) {
    if (itemLevel[i] > currentLevel) {
      navPostItems.removeClass("active").end();
      if ((i-1) < 0) i++;
      navPostItems[i-1].classList.add("active");
      recordLevel = currentLevel;
      break;
    }
  }
});

$(document).ready(function () {
  if($(window).width() < 768){
    $('#jumpMenu').toggleClass('hidden');
  }

  $('[data-toggle="offcanvas"]').click(function () {
    $('#jumpMenu').toggleClass('hidden')
  });

  var resizeWindowAction = function (event) {
    if($(window).width() >= 768){
      document.getElementById('jumpMenu').classList.remove('hidden');
    }
  };

  resizeWindowAction();

  $(window).resize(resizeWindowAction);
});
