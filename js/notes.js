/* js for the notes.html page */
var notes_searchbar = document.getElementById('notes-searchbar');
var search_timer;

function notes_filter() {
  let input = document.getElementById('notes-searchbar').value
  input = input.toLowerCase();
  let keywords = input.split(" ");
  let notes_elems = document.getElementsByClassName('note-container');

  // empty search should display everything
  if (input === '') {
    for (elem of notes_elems) {
      elem.style.display="table-row";
    }
    return;
  }

  for (elem of notes_elems) {
    let note_title = elem.children[1].firstChild.textContent.toLowerCase();
    let match = false;
    for (key of keywords) {
      if (key === '') {
        continue;
      }
      if (note_title.includes(key)) {
        match = true;
        break;
      }
    }
    if (match) {
      elem.style.display="table-row";
    } else {
      elem.style.display="none";
    }
  }
}

var debounceFunction = function (func, delay) {
	// Cancels the setTimeout method execution
	clearTimeout(search_timer);
	// Executes the func after delay time.
	search_timer = setTimeout(func, delay);
}

notes_searchbar.addEventListener('input', function () {
  debounceFunction(notes_filter, 500);
});
