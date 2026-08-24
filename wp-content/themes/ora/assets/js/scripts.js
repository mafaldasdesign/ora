$(document).ready(function(){


	var $slots = $('.bestseller-slot');

	if($slots.length){
		var POSITIONS = ['left', 'center', 'right'];

		var ROTATIONS = {
			next: {
				left:   { to: 'center', startZ: 0,  endZ: 1,  delay: 300 },
				center: { to: 'right',  startZ: 1,  endZ: -1, delay: 300 },
				right:  { to: 'left',   startZ: -1, endZ: 0,  delay: 600 }
			},
			prev: {
				right:  { to: 'center', startZ: -1, endZ: 2,  delay: 600 },
				center: { to: 'left',   startZ: 1,  endZ: 1,  delay: 0 },
				left:   { to: 'right',  startZ: -2, endZ: -2, delay: 0 }
			}
		};

		function rotate(direction){
			$slots.each(function(){
				var $slot = $(this);
				clearTimeout($slot.data('ziTimeout'));

				var from = POSITIONS.filter(function(pos){ return $slot.hasClass('pos-' + pos); })[0];
				var step = ROTATIONS[direction][from];

				$slot.removeClass('pos-' + from).addClass('pos-' + step.to).css('z-index', step.startZ);

				if(step.endZ !== step.startZ){
					$slot.data('ziTimeout', setTimeout(function(){
						$slot.css('z-index', step.endZ);
					}, step.delay));
				}
			});
		}

		$('.carousel-arrow.arrow-right').on('click', function(){ rotate('next'); });
		$('.carousel-arrow.arrow-left').on('click', function(){ rotate('prev'); });
	}

	(function(){
		var header = document.querySelector('.header');
		var banner = document.querySelector('.main > div:first-child');
		if(!header || !banner) return;

		function update(){
			var rect = banner.getBoundingClientRect();
			header.classList.toggle('header-hidden', rect.bottom <= 0);
		}

		['scroll', 'resize'].forEach(function(evt){
			window.addEventListener(evt, update, { passive: true });
		});
		update();
	})();

	(function(){
		var section = document.querySelector('.ritual-scroll');
		var texts = section ? section.querySelectorAll('.ritual-text') : [];
		if(!section || !texts.length) return;

		var current = 0;

		function update(){
			var rect = section.getBoundingClientRect();
			var range = rect.height - window.innerHeight;
			var p = range > 0 ? Math.min(Math.max(-rect.top / range, 0), 1) : 0;
			var index = Math.min(texts.length - 1, Math.floor(p * texts.length));

			if(index !== current){
				texts[current].classList.remove('is-active');
				texts[index].classList.add('is-active');
				current = index;
			}
		}

		['scroll', 'resize'].forEach(function(evt){
			window.addEventListener(evt, update, { passive: true });
		});
		update();
	})();

	/* As galerias horizontais estavam aqui em três implementações.
	   Foram substituídas por assets/js/ora-gallery.js e removidas em
	   definitivo: uma delas registava ouvintes de "wheel" e "touchmove"
	   não passivos e chamava preventDefault para prender a página
	   enquanto a tira corria — era a única coisa em todo o tema capaz
	   de bloquear o scroll, e não podia ficar aqui adormecida. */

});
