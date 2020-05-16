// --------------------
// Utility functions
// --------------------
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

function jumpPage (page) {
  window.location.href = page;
}

function showTip (id) {
  // id to show tip for
  $(id).tooltip();
}

function back_to_top (id) {
  // id for resetting the scroll
  let elem = document.getElementById(id);
  elem.scrollTop = 0;
  elem.scrollLeft = 0;
}
