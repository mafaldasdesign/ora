/**
 * ORA — galerias horizontais.
 *
 * As tiras de imagens avançam para o lado conforme se faz scroll na página.
 * Substitui as três implementações do scripts.js original por um único motor:
 *
 *  - funciona em qualquer largura de ecrã, incluindo telemóvel;
 *  - nunca bloqueia o scroll vertical (a versão original do bloco da Story
 *    intercetava a roda do rato e o toque, dando a sensação de página presa);
 *  - recalcula as medidas depois de as imagens carregarem, que é quando as
 *    larguras reais passam a ser conhecidas;
 *  - acompanha o ecrã com requestAnimationFrame.
 */
( function () {
	'use strict';

	function clamp( value, min, max ) {
		return Math.min( Math.max( value, min ), max );
	}

	function viewportHeight() {
		return window.innerHeight || document.documentElement.clientHeight;
	}

	/**
	 * Recolhe as tiras existentes na página.
	 */
	function collect( rows ) {
		var found = [];

		rows.forEach( function ( row ) {
			var track = document.querySelector( row.selector );

			if ( track && track.parentElement ) {
				found.push( {
					track: track,
					viewport: track.parentElement,
					reverse: !! row.reverse
				} );
			}
		} );

		return found;
	}

	/**
	 * Liga uma secção às suas tiras.
	 *
	 * @param {string} sectionSelector Secção que dita o avanço.
	 * @param {Array}  rows            Tiras a mover.
	 * @param {string} mode            'pinned' para secções altas com pin,
	 *                                 'pass' para blocos que atravessam o ecrã.
	 */
	function drive( sectionSelector, rows, mode ) {
		var section = document.querySelector( sectionSelector );

		if ( ! section ) {
			return;
		}

		var tracks = collect( rows );

		if ( ! tracks.length ) {
			return;
		}

		var ticking = false;

		function progress() {
			var rect = section.getBoundingClientRect();
			var vh   = viewportHeight();

			if ( 'pinned' === mode ) {
				// A secção é mais alta do que o ecrã e fica presa enquanto passa.
				var range = rect.height - vh;
				return range > 0 ? clamp( -rect.top / range, 0, 1 ) : 0;
			}

			// O bloco avança enquanto atravessa o ecrã, de baixo para cima.
			var span = rect.height + vh;
			return span > 0 ? clamp( ( vh - rect.top ) / span, 0, 1 ) : 0;
		}

		function render() {
			ticking = false;

			var p = progress();

			tracks.forEach( function ( item ) {
				var max = Math.max( item.track.scrollWidth - item.viewport.clientWidth, 0 );

				if ( ! max ) {
					item.track.style.transform = '';
					return;
				}

				var value = item.reverse ? ( 1 - p ) : p;
				item.track.style.transform = 'translateX(' + ( -value * max ).toFixed( 2 ) + 'px)';
			} );
		}

		function request() {
			if ( ticking ) {
				return;
			}
			ticking = true;
			window.requestAnimationFrame( render );
		}

		window.addEventListener( 'scroll', request, { passive: true } );
		window.addEventListener( 'resize', request, { passive: true } );
		window.addEventListener( 'orientationchange', request );

		// As larguras só são fiáveis depois de as imagens carregarem.
		var images = section.querySelectorAll( 'img' );

		Array.prototype.forEach.call( images, function ( img ) {
			if ( ! img.complete ) {
				img.addEventListener( 'load', request );
				img.addEventListener( 'error', request );
			}
		} );

		window.addEventListener( 'load', request );

		render();
	}

	function init() {
		drive(
			'.moments-scroll',
			[
				{ selector: '.moments-row-ltr .moments-row-track' },
				{ selector: '.moments-row-rtl .moments-row-track', reverse: true }
			],
			'pinned'
		);

		drive(
			'.martini-scroll',
			[
				{ selector: '.martini-row-ltr .martini-row-track' },
				{ selector: '.martini-row-rtl .martini-row-track', reverse: true }
			],
			'pinned'
		);

		drive(
			'.storypage-img',
			[
				{ selector: '.storypage-row-ltr .storypage-row-track' }
			],
			'pass'
		);
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}
} )();
