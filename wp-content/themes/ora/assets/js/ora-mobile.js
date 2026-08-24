/**
 * ORA — comportamento do menu em ecrãs pequenos.
 *
 * Carregado antes do scripts.js original, que fica intacto.
 */
( function () {
	'use strict';

	var body   = document.body;
	var toggle = document.querySelector( '.nav-toggle' );
	var nav    = document.getElementById( 'ora-nav' );
	var header = document.querySelector( '.header' );

	if ( ! toggle || ! nav ) {
		return;
	}

	var mq = window.matchMedia( '(max-width: 991.98px)' );

	function closeMenu() {
		if ( ! body.classList.contains( 'ora-menu-open' ) ) {
			return;
		}
		body.classList.remove( 'ora-menu-open' );
		toggle.setAttribute( 'aria-expanded', 'false' );
		toggle.setAttribute( 'aria-label', toggle.getAttribute( 'data-label-open' ) || 'Menu' );
	}

	function openMenu() {
		body.classList.add( 'ora-menu-open' );
		toggle.setAttribute( 'aria-expanded', 'true' );
		toggle.setAttribute( 'aria-label', toggle.getAttribute( 'data-label-close' ) || 'Close' );

		// O header esconde-se ao passar o banner: com o menu aberto tem de ficar.
		if ( header ) {
			header.classList.remove( 'header-hidden' );
		}
	}

	toggle.addEventListener( 'click', function ( e ) {
		e.preventDefault();
		if ( body.classList.contains( 'ora-menu-open' ) ) {
			closeMenu();
		} else {
			openMenu();
		}
	} );

	// Fechar ao seguir uma ligação.
	nav.addEventListener( 'click', function ( e ) {
		var link = e.target.closest ? e.target.closest( 'a' ) : null;
		if ( link ) {
			closeMenu();
		}
	} );

	// Fechar com Escape.
	document.addEventListener( 'keydown', function ( e ) {
		if ( 'Escape' === e.key || 'Esc' === e.key ) {
			closeMenu();
		}
	} );

	// Ao voltar a desktop, repor o estado.
	function sync() {
		if ( ! mq.matches ) {
			closeMenu();
		}
	}

	if ( mq.addEventListener ) {
		mq.addEventListener( 'change', sync );
	} else if ( mq.addListener ) {
		mq.addListener( sync );
	}

	window.addEventListener( 'resize', sync );
} )();

/**
 * Animação dos botões ao toque.
 *
 * Em ecrãs táteis o :hover fica preso depois do toque: o preenchimento
 * subia e lá ficava, e o site parecia bloqueado até se tocar noutro sítio.
 * Aqui a animação é comandada por eventos de ponteiro, o que permite
 * desligá-la no momento certo:
 *
 *  - ao pressionar, o botão anima;
 *  - ao levantar o dedo, volta ao normal;
 *  - se o gesto se transformar em scroll, o navegador emite pointercancel
 *    e a animação sai de imediato — a página desliza sem ficar presa;
 *  - ao tocar noutro sítio qualquer, também sai.
 */
( function () {
	'use strict';

	var SELECTOR   = '.btn-branco, .btn-vermelho';
	var LONG_PRESS = 400;  // a partir daqui é intenção de ver, não de abrir
	var MOVED      = 10;   // px; acima disto o gesto foi um arrasto

	var pressed = null;
	var press   = null;

	function release() {
		if ( ! pressed ) {
			return;
		}
		pressed.classList.remove( 'is-pressed' );
		pressed = null;
	}

	document.addEventListener( 'pointerdown', function ( e ) {
		release();

		if ( ! e.target || ! e.target.closest ) {
			return;
		}

		var button = e.target.closest( SELECTOR );

		if ( ! button ) {
			press = null;
			return;
		}

		button.classList.add( 'is-pressed' );
		pressed = button;

		press = {
			button: button,
			touch: 'mouse' !== e.pointerType,
			time: Date.now(),
			x: e.clientX,
			y: e.clientY,
			moved: 0
		};
	}, true );

	document.addEventListener( 'pointermove', function ( e ) {
		if ( ! press ) {
			return;
		}
		var dx = e.clientX - press.x;
		var dy = e.clientY - press.y;
		press.moved = Math.max( press.moved, Math.sqrt( dx * dx + dy * dy ) );
	}, true );

	/*
	 * Toque demorado mostra a animação mas não navega; só o toque curto abre
	 * a página. Em desktop com rato nada disto se aplica — aí a animação já
	 * acontece ao passar por cima, sem ser preciso carregar.
	 */
	document.addEventListener( 'click', function ( e ) {
		release();

		if ( ! press || ! e.target || ! e.target.closest ) {
			return;
		}

		var button = e.target.closest( SELECTOR );
		var info   = press;

		press = null;

		if ( ! button || button !== info.button || ! info.touch ) {
			return;
		}

		if ( Date.now() - info.time > LONG_PRESS || info.moved > MOVED ) {
			e.preventDefault();
			e.stopPropagation();
		}
	}, true );

	/*
	 * Qualquer fim de gesto liberta o botão. A lista é deliberadamente
	 * redundante: pointerup cobre rato, dedo e caneta, mas mouseup e touchend
	 * garantem o mesmo em navegadores que não emitam eventos de ponteiro, e
	 * pointercancel apanha o caso em que o gesto se torna scroll.
	 */
	[
		'mouseup',
		'pointerup',
		'pointercancel',
		'touchend',
		'touchcancel',
		'dragend',
		'contextmenu'
	].forEach( function ( type ) {
		window.addEventListener( type, release, true );
		document.addEventListener( type, release, true );
	} );

	// O ponteiro sair da janela conta como fim de gesto.
	document.addEventListener( 'pointerleave', release, true );
	document.addEventListener( 'mouseleave', release, true );

	window.addEventListener( 'scroll', release, { passive: true } );
	window.addEventListener( 'blur', release );
} )();

/**
 * Diagnóstico das galerias.
 *
 * Só corre se o endereço tiver ?oradebug=1 — por exemplo:
 *   http://localhost/ora/moments/?oradebug=1
 * Mostra um painel com as medidas reais de cada tira, útil para perceber
 * porque é que uma galeria não desliza.
 */
( function () {
	'use strict';

	if ( window.location.search.indexOf( 'oradebug' ) === -1 ) {
		return;
	}

	window.addEventListener( 'load', function () {
		var rows = document.querySelectorAll(
			'.storypage-row-ltr, .moments-row-ltr, .moments-row-rtl, .martini-row-ltr, .martini-row-rtl'
		);

		var out = [];
		out.push( 'largura da janela: ' + window.innerWidth + 'px' );
		out.push( 'efeitos de scroll (>=992px): ' + window.matchMedia( '(min-width: 992px)' ).matches );
		out.push( 'tiras encontradas: ' + rows.length );

		Array.prototype.forEach.call( rows, function ( row, i ) {
			var track = row.firstElementChild;
			var cs    = window.getComputedStyle( row );
			var ts    = track ? window.getComputedStyle( track ) : null;

			out.push( '' );
			out.push( '[' + ( i + 1 ) + '] ' + row.className.split( ' ' ).slice( 0, 2 ).join( '.' ) );
			out.push( '   overflow-x: ' + cs.overflowX + ' | flex-wrap: ' + cs.flexWrap );
			out.push( '   arrasto ligado: ' + ( row.getAttribute( 'data-ora-drag' ) ? 'sim' : 'não' ) );
			out.push( '   row clientWidth: ' + row.clientWidth + ' | scrollWidth: ' + row.scrollWidth );

			if ( track ) {
				out.push( '   track scrollWidth: ' + track.scrollWidth + ' | offsetWidth: ' + track.offsetWidth );
				out.push( '   track transform: ' + ts.transform );
				out.push( '   margem a deslizar: ' + ( track.scrollWidth - row.clientWidth ) + 'px' );
				out.push( '   imagens: ' + track.querySelectorAll( 'img' ).length );
			} else {
				out.push( '   SEM TRACK DENTRO DA LINHA' );
			}
		} );

		var box = document.createElement( 'pre' );
		box.textContent = out.join( '\n' );
		box.style.cssText = 'position:fixed;left:10px;bottom:10px;z-index:99999;max-height:60vh;' +
			'overflow:auto;background:#111;color:#0f0;font:11px/1.5 monospace;padding:12px;' +
			'border-radius:6px;max-width:min(520px,92vw);white-space:pre-wrap;';
		document.body.appendChild( box );

		box.addEventListener( 'click', function () {
			box.remove();
		} );
	} );
} )();
