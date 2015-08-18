var CW = (function() {
	'use strict';


	var init = function(){
		nav.init();
		slide.init();
		carousel.init();
	};

	/* 
	 * Function: Initiates sticky nav and animated scrolling. 
	 * returns @void
	 */
	var nav = {
		init: function(){
			$('.nav').waypoint('sticky');
			this.scrollTo();
		},
		scrollTo: function(){
			var navHeight = $('.nav').outerHeight();
			var scrollToOptions = {
				easing: 'easeInQuad',
				offset: {
					top: -1 * navHeight
				}
			}
			$('.nav__link').on('click', function(){
				var target = $(this).data('target');
				$(window).scrollTo($('.' + target), 500, scrollToOptions);
			})
		} 
	};

	/* 
	 * Function: Initiates carousel 
	 * returns @void
	 */
	 var carousel = {
	 	init: function(){
	 		var self = this;
	 		self.$carousel = $('.owl-carousel');
	 		self.$next = $('.carousel__nav--next');
	 		self.$prev = $('.carousel__nav--prev');
	 		self.order = [];

	 		var opt = {
	 			items: 1,
	 			center: true,
	 			loop: true,
	 			margin: 10,
	 			dots: true,
	 			dotsContainer: ".carousel__dots",
	 			responsive: {
	 				768: {
	 					items: 1.5
	 				}, 
	 				1200: {
	 					autoWidth: true
	 				}
	 			},
	 			onInitialize: function(e){
	 				self.randomizeSlides();
	 			},
	 			onInitialized: function(e){
	 				// kill the ids in cloned slides because they will cause wistia vids to load in the wrong places.
	 				$('.owl-item.cloned').find('.owl-display').attr('id', '');

	 				if (typeof self.$activeSlide === "undefined") self.$activeSlide = self.$carousel.find('.owl-item.active');
	 				self.positionNav(self.$activeSlide);

	 				self.handleQueries();
	 			}, 
	 			onResized: function(e){
	 				self.$activeSlide = self.$carousel.find('.owl-item.active');
	 				self.positionNav(self.$activeSlide);
	 			}, 
	 			onTranslate: function(e){
	 				// pause any videos currently playing
	 				for (var key in self.videos) {
	 					self.videos[key].pause();
	 				}

	 			}
	 		};

	 		// Carousel init
	 		self.$carousel.owlCarousel(opt);
	 		self.bindEvents.call(self);
	 	}, 
	 	bindEvents: function(){
	 		var self = this;

	 		// Carousel Nav
	 		self.$next.on('click', function(e){
	 			self.$carousel.trigger('next.owl.carousel');
	 		})

	 		self.$prev.on('click', function(e){
	 			self.$carousel.trigger('prev.owl.carousel');
	 		})

	 		// When you hover over a preload image, show the play button overlay.
	 		self.$carousel.find('.owl-display').hover(function(e){
	 			$(this).find('.owl-overlay').show();
	 		}, function(e){
	 			$(this).find('.owl-overlay').hide();
	 		});

	 		// When an active slide is clicked, load the video from Wistia
	 		self.$carousel.on('click', '.active.center .owl-display:not(".embedded")', function(e){
	 			var videoId = $(this).closest('.owl-slide').data('videoid');
	 			$(this).addClass('embedded');
	 			self.embedVideo(videoId);
	 		})

	 		// When an inactive slide is clicked, scroll to this slide in the carousel. 
	 		self.$carousel.on('click', '.owl-item', function(e){
	 			if ($(this).prev().hasClass('center')){
	 				self.$carousel.trigger('next.owl.carousel');
	 			} else if ($(this).next().hasClass('center')){
	 				self.$carousel.trigger('prev.owl.carousel');
	 			}
	 		});
	 	}, 
	 	randomizeSlides: function(){
	 		var self = this;
	 		// use the Fisher-Yates shuffle on these slides
	 		var arr = self.$carousel.children();
	 		var curr = arr.length, tempVal, rand;

	 		while (0 !== curr){
	 			// Pick a remaining element
	 			rand = Math.floor(Math.random() * curr);
	 			curr--;

	 			// And swap it with the current element.
	 			tempVal = arr[curr];
	 			arr[curr] = arr[rand];
	 			arr[rand] = tempVal;
	 		}

	 		// empty the array that keeps track of these videos. 
	 		self.order.length = 0;
	 		self.logVideos(arr);

	 	}, 
	 	logVideos: function(arr){
	 		var self = this;
			arr.each(function(){
	 			// log the order of the randomized slides in order to be able to direct links there
	 			self.order.push($(this).data('id'));
	 			// add them to the carousel
	 			$(this).appendTo(self.$carousel);
	 		})
	 	},
	 	positionNav: function($activeSlide){
	 		var self = this;
	 		var offset = $activeSlide.offset();
	 		var width = $activeSlide.width();
	 		var height = $activeSlide.find('.owl-display').height();

	 		var navHeight = height / 2;
	 		var navPrev = offset.left - 69;
	 		var navNext = offset.left + width + 9;

	 		self.$prev.css({
	 			top: navHeight,
	 			left: navPrev
	 		});

	 		self.$next.css({
	 			top: navHeight,
	 			left: navNext
	 		});
	 	},
	 	embedVideo: function(videoId){
	 		var self = this; 
	 		var $container = $('#wistia_' + videoId);

	 		// to prevent jumping content, set a temporary height for the wistia container.
	 		// this will get overwritten by the load itself. 
	 		$container.height($container.height());

	 		// register the video that is playing
			self.videos[videoId] = Wistia.embed(videoId, {
	 		  container: "wistia_" + videoId, 
	 		  videoFoam: true, 
	 		  autoPlay: true,
	 		  playButton: true
	 		});

	 	}, 
	 	handleQueries: function(){
	 		var self = this;
	 		var substr = window.location.search.substring(1); 

	 		if (substr.length){
		 		var vars = substr.split("&");
		 		
		 		for (var i = 0; i < vars.length; i++) {
		 			var pair = vars[i].split("=");
		 			self.query[pair[0]] = pair[1];
		 		}

	 			// Successful Paypal transaction returns with query string ?result=success
		 		if (self.query['result'] === "success" ){
		 			var tpl = "<div class='col-sm-6 col-sm-offset-3'><span class='boom'>Thank you for your donation!</span><span>Please consider attending the Charity Warriors Gala or becoming a warrior yourself.</span></div>";
		 			var winH = $(window).height();
		 			// replace the donation CTA with a thank you message.
		 			$('.give__ask').html(tpl);
		 			// scroll to this section
		 			// (really the next section - the height of the window)
		 			$(window).scrollTo($('.gala').offset().top - winH, 10);
		 		}

		 		// Deep linking directly to a charity's slide in the carousel uses query string ?slide=charityIdentifier
		 		// the order of the charities was previously logged by CW.carousel.randomizeSlides() in CW.carousel.order{}.
		 		// links: 
	 			// http://www.charitywarriors.org/?slide=epiphanySchool
				// http://www.charitywarriors.org/?slide=hipHopForHope
				// http://www.charitywarriors.org/?slide=jettFoundation
				// http://www.charitywarriors.org/?slide=mspcaAngell
				// http://www.charitywarriors.org/?slide=rogersonCommunities

		 		if (typeof self.query['slide'] !== 'undefined'){
		 			if (CW.carousel.order.indexOf(self.query['slide']) > 0){
		 				CW.carousel.$carousel.trigger('to.owl.carousel', CW.carousel.order.indexOf(self.query['slide']));
		 			}
		 		}
		 	}
	 	},
	 	query: {},
	 	videos: {}
	 }
	/* 
	 * Function: Linked sliders for donation customization.
	 * returns @void
	 */
	var slide = {
		init: function(){
			var self = this;

			// build a funds object
			self.funds = [];

			// register each slider and essential components to the funds dictionary object
			// for future reference 
			$('.fund').each(function(i, el){
				var fundObj = {};
				fundObj['name'] = $(el).find('label').text();
				fundObj['$slider'] = $(el).find('.slider__display');
				fundObj['$label'] = $(el).find('.slider__value');
				fundObj['val'] = 0;
				self.funds.push(fundObj);
			})

			// instantiate the sliders
			$('.slider__display').slider({
				orientation: "horizontal",
				range: "min",
				min: 0,
				max: 0,
				change: slide.handleChange,
				slide: slide.handleSlide,
				start: slide.startSlide,
				stop: slide.stopSlide,
				value: 0
			}).slider('disable');

			// Detect touch support
			self.touchSupport = 'ontouchend' in document;

			self.bindEvents();
		}, 
		bindEvents: function(){
			var self = this; 
			// Hijack native submit event
			$('.give__form').on('submit', function(e){
				e.preventDefault();
				$('#donation').trigger('blur');
			});

			// When user inputs an amount to donate
			$('#donation').blur(function(e){
				var $val = $(this).val();
				self.cents = Math.round(accounting.unformat($val) * 100); 

				if (self.cents === 0){
					// if the input is not valid, get out
					return 
				} else {
					// put input into currency format
					$(this).val(accounting.formatMoney($val));
					// kick off the donation process
					slide.donationSetup(self.cents);
				}
			});
		}, 
		handleChange: function(event, ui){
			var self = slide;

			var $sliderLabel = $(ui.handle).closest('.fund').find('.slider__value');
			// slide.printAmounts();

			// update current value of slider in its hidden input
			$sliderLabel.parent().parent().find(":input").val(accounting.formatNumber(ui.value/100, 2));
		},
		handleSlide: function(event, ui){
			var self = slide;
			var $sliderLabel = $(ui.handle).closest('.fund').find('.slider__value');

			// update the labels for the sliders.
			slide.printAmounts();
			// update the current value of slider in its hidden input
			$sliderLabel.parent().parent().find(":input").val(accounting.formatNumber(ui.value/100, 2));

		},
		startSlide: function(event, ui){
			var self = slide; 

			// touchPunch causes this to fire twice
			// and that seems to be causing the issue. 
			// If desktop browser OR event NOT aped by touchpunch
			if (!self.touchSupport || (self.touchSupport && typeof event.originalEvent === "undefined")) {
				self.changingSliderIndex = $(event.target).parent().parent().index();
				self.workingSliderStartValue = ui.value;
			}
		},
		stopSlide: function(event, ui){
			var self = slide;

			slide.recalculateDonations(self.changingSliderIndex, ui.value);
		},
		donationSetup: function(cents){
			var self = this;
			var baseAmt = Math.floor(cents / 5);
			var leftOver = cents % 5; 

			// indicate that the user has input a donation value
			// used to update the help text for the user.
			$('.funds').addClass('initialized');

			// distribute the initial donation amount equally among the five charities
			// and keep track of how much money each slider represents in a hidden input. 
			// self.funds.forEach(function(el, i, arr){
			// 	el.$slider.slider('option', 'value', baseAmt).slider('option', 'max', cents).slider('enable');
			// 	el.$slider.closest('.fund').find('input[type="hidden"]').val(accounting.formatNumber(baseAmt/100, 2));
			// })
			// if the initial donation amount doesn't divide perfectly into five, randomly allocate the leftovers.
			// if (leftOver !== 0){
			// 	self.handleLeftoverPennies(null, leftOver); 
			// }

			// 10-29 CHANGE: init to 0. 
			self.funds.forEach(function(el, i, arr){
				el.$slider.slider('option', 'value', 0).slider('option', 'max', cents).slider('enable');
				el.$slider.closest('.fund').find('input[type="hidden"]').val(accounting.formatNumber(0, 2));
			});

			// if this page has been loaded with the ?result=success flag indicating that the 
			// user was redirected from a successful Paypal transaction, but they start a new donation by 
			// inputting a donation amount, then reset to a new donation button to allow them to give again.
			if ($('.give__check').length === 0){
				var tpl = '<div class="col-sm-6 col-sm-offset-3"><input type="submit" class="btn" value="Donate Now"></div><div class="col-sm-6 col-sm-offset-3"><p class="give__check">Prefer to send a check? Make it out to one of the five charities above<br> and send it to <span class="blue"><strong>376 Boylston St #202, Boston, MA, 02116</strong></span></p></div>';
				$('.give__ask').html(tpl);
			}

			// reset the hit max state.
			self.hitMax = false; 
			// print the labels for each slider.
			self.printAmounts();
		},
		findWorkingFunds: function(index){
			/**
			 * Function that finds the number of funds that currently have non-zero value in them. 
			 * @returns integer
			 */
			var self = this;
			var count = 0; 
			
			self.funds.forEach(function(el, i, arr){
				if (i !== index){
					if (el.$slider.slider('value') > 0){
						count++;
					}
				}
			});

			return count;
		},
		findLeastSlack: function(index){
			/**
			 * Function that finds the fund with the smallest non-zero value and returns its value.
			 * @returns integer 
			 */
			var self = this; 
			var leastSlack = 0;
			var comparison = self.cents;
			self.funds.forEach(function(el, i, arr){
				if (i === index) return;
				var val = el.$slider.slider('value');
				if(val > 0 && val < comparison){

					comparison = val;
					leastSlack = i; 
				};
			});
			return comparison;
		},
		recalculateDonations: function(index, value){
			var self = this;
			var freePennies = self.workingSliderStartValue - value;
			var workingFunds = self.findWorkingFunds(index);
			var diffPerFund = Math.floor(freePennies / workingFunds);

			if (freePennies > 0){
				if (workingFunds === 0) {
					self.hitMax = false; 
				}
				if (self.hitMax === true){
					// if freePennies is positive, user dragged the slider to the left. 
					// allocate the difference among the four other charities. 
					self.funds.forEach(function(el, i, arr){
						if (i !== index){
							var currVal = el.$slider.slider('value');
							if (currVal > 0) {
								// update slider value
								el.$slider.slider('option','value', currVal + diffPerFund)
								// update free pennies
								freePennies -= diffPerFund;
							}
						}
					});
					// handle leftover pennies, if any. 
					self.handleLeftoverPennies(null, freePennies);
				}
			} else {
				// if freePennies is negative, user dragged the slider to the right.
				// we will have to take money from the other working charities. 
				self.handleRightSlide(freePennies, index);
			}

		},
		handleRightSlide: function(freePennies, index){
			var self = this; 
			var workingFunds = self.findWorkingFunds(index);
			var diffPerFund = Math.floor(freePennies / workingFunds);
			var leastSlack = self.findLeastSlack(index);

			if (workingFunds > 0){
				// if there is more than one slider in play
				if (self.hitMax === true){
					if (leastSlack + diffPerFund > 0){
						// if the amount of money in the charity with the smallest current allocation
						// is more than the amount of money the transation will remove from that charity
						// then just subtract the change equally from all the working funds. 
						self.funds.forEach(function(el, i, arr){
							if (i !== index){
								var currVal = el.$slider.slider('value');
								if (currVal !== 0){
									// update slider value
									el.$slider.slider('option','value', currVal + diffPerFund)
									// update free pennies
									freePennies -= diffPerFund;
								}
							}
						});
						self.handleLeftoverPennies(null, freePennies);	
					} else {
						// otherwise, one or more funds is being driven to 0 by the transaction. 
						// subtract the amount of money in the charity with the smallest current allocation from every working fund
						// which removes that charity from working fund status. Recurse, using the new 
						// number of working funds, until the transaction is complete. 

						self.funds.forEach(function(el, i, arr){
							if (i !== index){
								var currVal = el.$slider.slider('value');
								if (currVal !== 0){
									// update slider value
									el.$slider.slider('option','value', currVal - leastSlack);
									// update free pennies
									freePennies += leastSlack;
								}
							}
						});

						if (freePennies < (workingFunds * -1)){
							self.handleRightSlide(freePennies, index)
						} else {
							self.handleLeftoverPennies(null, freePennies);
							// update the slide labels.
							slide.printAmounts();
						}
					}
				} else if (self.testSum() >= self.cents){
					// if the entire donation amount has not yet been allocated, calculate how much room there is to go
					// when the total allocated exceeds the total donation amount 
					// set that last slider to bring the total allocation in line with the max donation.
					// set hitMax to true in order to trigger the linked slider behavior from there on out.
					var maxLeftover = self.cents - self.testSum(index);
					self.funds[index].$slider.slider('option', 'value', maxLeftover);
					self.funds[index].$slider.closest('.fund').find('input[type="hidden"]').val(accounting.formatNumber(maxLeftover/100, 2));

					self.printAmounts();

					self.hitMax = true;
				} else {
					// total allocated is still under the max, so just reat as normal. 
					slide.printAmounts();
				}
			} else {
				// the first slider handled works just like a normal vanilla slider.
				slide.printAmounts();
				if (self.cents === self.testSum()){
					self.hitMax = true;
				}
			}
		},
		handleLeftoverPennies: function ($slider, leftoverCents){
			var self = this; 
			var direction = 1; 
			var alreadyAdded = [];

			if (leftoverCents < 0){
				direction = -1; 
				leftoverCents *= -1; 
			}
				
			while (leftoverCents > 0){
				self.allocatePennies(alreadyAdded, direction);
				leftoverCents--;
			}

			slide.printAmounts();
		},
		testSum: function(index){
			var self = this; 
			var runningTotal = 0;
			self.funds.forEach(function(el,i,arr){
				if (i !== index){
					runningTotal+=el.$slider.slider('option', 'value');
				}
			});
			return runningTotal;
		},
		allocatePennies: function(alreadyAdded, direction){
			var self = this; 
			var num = Math.floor(Math.random() * 5); 

			if ($.inArray(num, alreadyAdded) < 0) {
				// if a stray penny has not been allocated to this fund yet
				// add 1 penny to the value
				var curr = self.funds[num].$slider.slider('option', 'value');
				if (curr > 0){
					self.funds[num].$slider.slider('option', 'value', curr + (1 * direction));
					// and log that it has been used.
					alreadyAdded.push(num);
				} else {
					// get a new random number and try again
					self.allocatePennies(alreadyAdded, direction);
				}
			} else {
				// get a new random number and try again
				self.allocatePennies(alreadyAdded, direction);
			}
		},
		printAmounts: function(){
			var self = this; 
			// iterate over the funds object and print values of all the sliders.
			self.funds.forEach(function(el, i, arr){
				el.$label.text(accounting.formatNumber(el.$slider.slider('value')/100,2));
			})
		}

	}
	/* 
	 * Exposed methods
	 */
	return {
		init:init, 
		carousel:carousel
	};

}());

$(document).ready(function(){
	CW.init();
})