/**
 * Live preview do Personalizar (ORA).
 */
( function ( $ ) {
	'use strict';

	if ( typeof wp === 'undefined' || ! wp.customize ) {
		return;
	}

	function bindText( setting, selector, multiline ) {
		wp.customize( setting, function ( value ) {
			value.bind( function ( to ) {
				var html = $( '<div/>' ).text( to ).html();
				if ( multiline ) {
					html = html.replace( /\r?\n/g, '<br>' );
				}
				$( selector ).html( html );
			} );
		} );
	}

	bindText( 'ora_home_banner_title', '.homepage-banner .banner-title h1', true );
	bindText( 'ora_home_scroll_text', '.scroll p', false );
	bindText( 'ora_home_story_title', '.story .storypage-title h2', false );
	bindText( 'ora_home_collection_title', '.collection-title h2', false );
	bindText( 'ora_home_moments_title', '.moments-title h3', true );
	bindText( 'ora_home_newsletter_title', '.newsletter-title h3', false );
	bindText( 'ora_home_newsletter_text', '.newsletter-text p', true );

	bindText( 'ora_story_banner_title', '.story-banner .banner-title h1', true );
	bindText( 'ora_story_ritual_title', '.ritual-title h2', false );
	bindText( 'ora_story_final_title', '.final-title h3', true );

	bindText( 'ora_collection_banner_title', '.collection-banner .banner-title h1', true );
	bindText( 'ora_collection_bestsellers_title', '.bestsellers-title h2', false );

	bindText( 'ora_moments_banner_title', '.moments-banner .banner-title h1', true );
	bindText( 'ora_moments_cocktail_title', '.cocktail-title h2', false );
	bindText( 'ora_moments_cocktail_text', '.cocktail-text p', true );

	bindText( 'ora_footer_tagline', '.footer-brand p', true );
	bindText( 'ora_footer_copyright', '.footer-bottom > p', false );
	bindText( 'ora_footer_explore_title', '.footer-links:nth-of-type(1) .footer-heading', false );
	bindText( 'ora_footer_connect_title', '.footer-connect .footer-heading', false );

	wp.customize( 'ora_footer_email', function ( value ) {
		value.bind( function ( to ) {
			$( '.footer-email' ).text( to ).attr( 'href', 'mailto:' + to );
		} );
	} );
} )( jQuery );
