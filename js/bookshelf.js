/**
 * bookshelf.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
(function() {

	var supportAnimations = 'WebkitAnimation' in document.body.style ||
			'MozAnimation' in document.body.style ||
			'msAnimation' in document.body.style ||
			'OAnimation' in document.body.style ||
			'animation' in document.body.style,
		animEndEventNames = {
			'WebkitAnimation' : 'webkitAnimationEnd',
			'OAnimation' : 'oAnimationEnd',
			'msAnimation' : 'MSAnimationEnd',
			'animation' : 'animationend'
		},
		// animation end event name
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		scrollWrap = document.getElementById( 'scroll-wrap' ),
		docscroll = 0,
		books = document.querySelectorAll( '#bookshelf > figure' ),
		docs = document.getElementById( 'ft-docs' );

	function scrollY() {
		return window.pageYOffset || window.document.documentElement.scrollTop;
	}

	function Book( el ) {
		this.el = el;
		this.book = this.el.querySelector( '.book' );
		this.ctrls = this.el.querySelector( '.buttons' );
		this.opener = this.el.querySelector('.shbook');
		// create the necessary structure for the books to rotate in 3d
		this._layout();

		this.bbWrapper = document.getElementById( this.book.getAttribute( 'data-book' ) );
		if( this.bbWrapper ) {
			this._initBookBlock();
		}
		this._initEvents();
	}

	Book.prototype._layout = function() {
		if( Modernizr.csstransforms3d ) {
			this.book.innerHTML = '<div class="cover"><div class="front"></div><div class="inner inner-left"></div></div><div class="inner inner-right"></div>';
			var perspective = document.createElement( 'div' );
			perspective.className = 'perspective';
			perspective.appendChild( this.book );
			this.el.insertBefore( perspective, this.ctrls );
		}

		this.closeDetailsCtrl = document.createElement( 'span' )
		this.closeDetailsCtrl.className = 'close-details';
	}

	Book.prototype._initBookBlock = function() {
		// initialize bookblock instance
		this.bb = new BookBlock( this.bbWrapper.querySelector( '.bb-bookblock' ), {
			speed : 700,
			shadowSides : 0.8,
			shadowFlip : 0.4
		} );
		this.isBookOpen = false;
		// boobkblock controls
		this.ctrlBBClose = this.bbWrapper.querySelector( ' .bb-nav-close' );
		this.ctrlBBNext = this.bbWrapper.querySelector( ' .bb-nav-next' );
		this.ctrlBBPrev = this.bbWrapper.querySelector( ' .bb-nav-prev' );
	}

	Book.prototype._initEvents = function() {
		var self = this;
		if( !this.ctrls ) return;

		if( this.bb ) {
			this.ctrls.querySelector( 'a:nth-child(1)' ).addEventListener( 'click', function( ev ) { self._open(); } );
			this.opener.addEventListener( 'click', function( ev ) { self._open(); } );
			this.ctrlBBNext.addEventListener( 'click', function( ev ) { ev.preventDefault(); self._nextPage(); } );
			this.ctrlBBPrev.addEventListener( 'click', function( ev ) { ev.preventDefault(); self._prevPage(); } );
			this.ctrlBBClose.addEventListener( 'click', function( ev ) { self._close(); } );
		}

		// this.ctrls.querySelector( 'a:nth-child(2)' ).addEventListener( 'click', function( ev ) { ev.preventDefault(); self._showDetails(); } );
		this.closeDetailsCtrl.addEventListener( 'click', function() { self._hideDetails(); } );
	}

	Book.prototype._open = function() {
		docscroll = scrollY();

		if (classie.hasClass( this.bbWrapper, 'hide' )) {
			classie.remove( this.bbWrapper, 'hide' );
		}
		if (classie.hasClass( this.el, 'close' )) {
			classie.remove( this.el, 'close' );
		}
		classie.remove( docs, 'clickable-override' );
		classie.add( this.el, 'open' );
		classie.add( this.el, 'noboarder-override');
		// setTimeout(function() {
		// 	classie.add( this.el, 'bookhome-open-override');
		// }, 1000);
		classie.add( this.bbWrapper, 'show' );
		var self = this,
			onOpenBookEndFn = function( ev ) {
				this.removeEventListener( animEndEventName, onOpenBookEndFn );
				document.body.scrollTop = document.documentElement.scrollTop = 0;
			};

		if( supportAnimations ) {
			this.bbWrapper.addEventListener( animEndEventName, onOpenBookEndFn );
		}
		else {
			onOpenBookEndFn.call();
		}
		this.isBookOpen = true;
	}

	Book.prototype._close = function() {
		// classie.remove( scrollWrap, 'hide-overflow' );
		setTimeout( function() { document.body.scrollTop = document.documentElement.scrollTop = docscroll; }, 25 );
		classie.remove( this.el, 'open' );
		classie.remove( this.el, 'noboarder-override');
		classie.remove( this.el, 'bookhome-open-override');
		classie.add( this.el, 'close' );
		classie.remove( this.bbWrapper, 'show' );
		// classie.remove( this.bbWrapper, 'bookwrapper-open-override' );
		classie.add( this.bbWrapper, 'hide' );
		classie.add( docs, 'clickable-override' );

		var self = this,
			onCloseBookEndFn = function( ev ) {
				this.removeEventListener( animEndEventName, onCloseBookEndFn );
				// reset bookblock starting page
				self.bb.jump(1);
				classie.remove( self.el, 'close' );
				classie.remove( self.bbWrapper, 'hide' );
			};

		if( supportAnimations ) {
			this.bbWrapper.addEventListener( animEndEventName, onCloseBookEndFn );
		}
		else {
			onCloseBookEndFn.call();
		}
		this.isBookOpen = false;
	}

	Book.prototype._nextPage = function() {
		if (this.bb.currentIdx === (this.bb.itemsCount-1) && this.isBookOpen) {
			this._close();
		} else {
			this.bb.next();
		}
	}

	Book.prototype._prevPage = function() {
		if (this.bb.currentIdx === 0 && this.isBookOpen) {
			this._close();
		} else {
			this.bb.prev();
		}
	}

	Book.prototype._showDetails = function() {
		classie.add( this.el, 'details-open' );
	}

	Book.prototype._hideDetails = function() {
		classie.remove( this.el, 'details-open' );
	}

	function init() {
		[].slice.call( books ).forEach( function( el ) {
			new Book( el );
		} );
	}

	init();

})();
