---
layout: note_page
title: Golang notes
title_short: golang
dateStr: 2020-05-01
category: Reading-Notes
tags: notes reference
---
This is set of notes is taking from golang.org/doc/effective_go.html

### Commenting and Documentation

Every package should have a package comment, a block comment preceding the package clause.

Inside a package, any comment immediately preceding a top-level declaration serves as a doc comment for that declaration. Every exported (capitalized) name in a program should have a doc comment.
