/**
 * ORA — media uploader das meta boxes.
 */
( function ( $ ) {
	'use strict';

	$( document ).on( 'click', '.ora-media-select', function ( e ) {
		e.preventDefault();

		var $wrap = $( this ).closest( '.ora-media' );
		var $input = $wrap.find( 'input[type="hidden"]' );
		var $preview = $wrap.find( '.ora-media-preview' );

		var frame = wp.media( {
			title: ( window.oraAdmin && oraAdmin.title ) || 'Choose image',
			button: { text: ( window.oraAdmin && oraAdmin.button ) || 'Use image' },
			library: { type: 'image' },
			multiple: false
		} );

		frame.on( 'select', function () {
			var attachment = frame.state().get( 'selection' ).first().toJSON();
			var url = attachment.url;

			if ( attachment.sizes && attachment.sizes.medium ) {
				url = attachment.sizes.medium.url;
			}

			$input.val( attachment.id );
			$preview.html(
				'<img src="' + url + '" style="max-width:220px;height:auto;display:block;margin-bottom:8px;border-radius:4px;">'
			);
		} );

		frame.open();
	} );

	$( document ).on( 'click', '.ora-media-remove', function ( e ) {
		e.preventDefault();
		var $wrap = $( this ).closest( '.ora-media' );
		$wrap.find( 'input[type="hidden"]' ).val( '' );
		$wrap.find( '.ora-media-preview' ).empty();
	} );
} )( jQuery );
