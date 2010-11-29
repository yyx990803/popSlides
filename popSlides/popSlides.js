//get relative path
var popSlides_path = (function(){
    var s = document.getElementsByTagName('script');
    var p = s[s.length-1].src;
    return p.slice(0, p.lastIndexOf('/')+1);
})();

//The jQuery Plugin wrapper
(function($) {
	
	//extend jQuery
	$.fn.popSlides = function(options) {
		
		var path = popSlides_path;
		
		var defaults = {
			play: false,
			play_time: 4000,
			max_width: 800,
			max_height: 600,
			thumbnail_size: 80,
			transition_speed: 300,
			force_compress: false,
			force_square: false,
			single_thumbnail: false,
			slide_progress: true,
			image_number: true,
			caption_position: 'bottom',
			path: path
		};
		
		var options = $.extend(defaults, options);
		
		//global elements
		var layer1,
			layer2;
			
		if (get('popSlides_layer1')==null) {
			
			layer1 = make('div'),
			layer2 = make('div');	
			layer1.setAttribute('id','popSlides_layer1');
			layer2.setAttribute('id','popSlides_layer2');
			
			$(layer1).css({
				'z-index':903,
				'display':'none',
				'position':'fixed',
				'top':0,
				'left':0,
				'right':0,
				'bottom':0
			});
			$(layer2).css({
				'z-index':902,
				'background-color':'#000',
				'opacity':'0.7',
				'display':'none',
				'position':'fixed',
				'top':0,
				'left':0,
				'right':0,
				'bottom':0
			});
			
			$('body').append(layer1);
			$('body').append(layer2);
			
		} else {
			
			layer1 = get('popSlides_layer1');
			layer2 = get('popSlides_layer2');
			
		}
		
		//Interate through all image groups
		this.each(function() {
			
			//variables
			var obj = $(this),
				lock = false,
				cur = 0,
				play = options.play,
				timerOn = false,
				timer,
				thumbs = [],
				popimgs = [],
				imgsrc = [],
				captions = [];
			
			//create elements
			var popup = make('div'),
				pleft = make('div'),
				pright = make('div'),
				ploader = make('div'),
				px = make('a'),
				pl = make('a'),
				pr = make('a'),
				pp = make('a'),
				num = make('span'),
				numbox = make('div'),
				bar = make('div'),
				cap = make('span'),
				capbox = make('div');
			
			init();
			
			function init() {
				
				//process element structure
				obj.children().each(function() {
					processImg(this);
				});
				
				//create thumbnails
				obj.html("");
				var thumbs_num = options.single_thumbnail ? 1 : thumbs.length;
				for (i=0;i<thumbs_num;i++) {
					var a = make('a');
					a.id = i+1<10 ? "popSlides_link_0"+(i+1) : "popSlides_link_"+(i+1);
					$(a).click(function() {
						pop(parseId(this.id));
					});
					$(a).css({
						'cursor': 'pointer'
					});
					$(a).append(thumbs[i]);
					if (obj.is('ul')) {
						var li = make('li');
						$(li).append(a);
						obj.append(li);
					} else {
						obj.append(a);
					}
				}
				
				//create images for popup
				var i=0;
				for (i=0;i<thumbs.length;i++) {
					var img = new Image();
					img.src = imgsrc[i];
					$(img).css({
						'display':'none'
					});
					popimgs.push(img);
					$(ploader).append(img);
				}
				
				//append popup elements
				$(layer1).append(popup);
				$(popup).append(pleft);
				$(popup).append(ploader);
				$(popup).append(pright);
				$(popup).append(px);
				$(popup).append(pp);
				$(popup).append(numbox);
				$(popup).append(bar);
				$(popup).append(capbox);
				$(numbox).append(num);
				$(capbox).append(cap);
				$(pleft).append(pl);
				$(pright).append(pr);
				$(pl).addClass("popSlides_btn");
				$(pr).addClass("popSlides_btn");
				$(px).addClass("popSlides_btn");
				$(pp).addClass("popSlides_btn");
				
				//Styles
				//Clean up css
				$('*', popup).css({
					'margin':0,
					'padding':0,
					'border':'none',
					'background':'none'
				});
				
				$(popup).css({
					'display':'none',
					'width':0,
					'height':0,
					'position':'absolute',
					'top':'50%',
					'left':'50%',
					'background-color':'#000',
					'padding':'5px',
					'overflow':'hidden'
				});
				$(pleft).css({
					'position':'relative',
					'height':'100%',
					'width':'50px',
					'float':'left'
				});
				$(pright).css({
					'position':'relative',
					'height':'100%',
					'width':'50px',
					'float':'right'
				});
				$(ploader).css({
					'float':'left'
				});
				$(px).css({
					'cursor':'pointer',
					'position':'absolute',
					'right':'2px',
					'top':'2px',
					'z-index':904,
					'width':'15px',
					'height':'15px',
					'background':'url("'+options.path+'img/sprites.png") -50px 0 no-repeat'
				});
				$(pp).css({
					'cursor':'pointer',
					'position':'absolute',
					'right':'17px',
					'top':'2px',
					'z-index':904,
					'width':'15px',
					'height':'15px',
					'background':'url("'+options.path+'img/sprites.png") -50px -15px no-repeat'
				});
				if (play) {
					$(pp).css('background','url("'+options.path+'img/sprites.png") -65px -15px no-repeat');
				}
				$(pl).css({
					'background':'url("'+options.path+'img/sprites.png") 0 0 no-repeat',
					'height':'30px',
					'width':'25px',
					'position':'absolute',
					'top':'50%',
					'left':'50%',
					'margin-top':'-15px',
					'margin-left':'-12px',
					'cursor':'pointer'
				});
				$(pr).css({
					'background':'url("'+options.path+'img/sprites.png") -25px 0 no-repeat',
					'height':'30px',
					'width':'25px',
					'position':'absolute',
					'top':'50%',
					'left':'50%',
					'margin-top':'-15px',
					'margin-left':'-12px',
					'cursor':'pointer'
				});
				$(numbox).css({
					'position':'absolute',
					'top':'7px',
					'left':'5px',
					'width':'45px',
					'text-align':'center',
					'font-size':'9px',
					'color':'#999',
					'z-index':905,
					'font-family':'Lucida Sans Unicode, Lucida Grande, Helvetica, Arial, sans-serif'
				});
				$(num).css({
					'padding':'3px 8px'
				});
				if (!options.image_number) $(num).css('display','none');
				$(bar).css({
					'height':'1px',
					'background-color':'#999',
					'position':'absolute',
					'bottom':'4px',
					'left':'55px',
					'z-index':905,
					'width':0
				});
				$(capbox).css({
					'display':'none',
					'text-align':'left',
					'position':'absolute',
					'left':'55px',
					'padding':'5px 5px 4px',
					'font-size':'11px',
					'font-weight':'normal',
					'color':'#FFF',
					'z-index':903,
					'font-family':'Helvetica, Arial, sans-serif',
					'background-color':'#000',
					'opacity':'0.6',
					'-ms-filter':'"progid:DXImageTransform.Microsoft.Alpha(Opacity=60)"',
					'filter':'alpha(opacity=60)'
				});
				if (options.caption_position=='bottom') {
					$(capbox).css('bottom','5px');
				} else {
					$(capbox).css('top','5px');
				}
				$('.popSlides_btn').css({
					'opacity':'0.6',
					'-ms-filter':'"progid:DXImageTransform.Microsoft.Alpha(Opacity=60)"',
					'filter':'alpha(opacity=60)'
				});
				$('.popSlides_btn').hover(
				function() {
					$(this).css({
						'opacity':'1',
						'-ms-filter':'"progid:DXImageTransform.Microsoft.Alpha(Opacity=100)"',
						'filter':'alpha(opacity=100)'
					});
				},
				function() {
					$(this).css({
						'opacity':'0.6',
						'-ms-filter':'"progid:DXImageTransform.Microsoft.Alpha(Opacity=60)"',
						'filter':'alpha(opacity=60)'
					});
				});
				
				//events
				$(pl).click(function() {
					prev();
				});
				$(pr).click(function() {
					next();
				});
				$(px).click(function() {
					fade();
				});
				$(pp).click(function() {
					togglePlay();
				});
							
			}
			
			//Functions
			function processImg(elm) {				
				if (elm.nodeName=='A') {
					imgsrc.push(elm.href);
					var img = $(elm).children().get(0);
					if (options.force_compress) {
						compress(img);
					}
					thumbs.push(img);
				} else
				if (elm.nodeName=='IMG') {
					compress(elm);
					imgsrc.push(elm.src);
					thumbs.push(elm);
				} else
				if (elm.nodeName=='LI') {
					$(elm).children().each(function() {
						processImg(this);
					});
					var cap = $('span',elm).get(0);
					if (cap!=null) {
						captions.push(cap.innerHTML);
					} else {
						captions.push("");
					}
				}
			}
			
			function compress(img) {
				$(img).css({
					'visibility':'hidden',
					'position':'absolute'
				});
				if (options.force_square) {
					img.height = options.thumbnail_size;
					img.width = options.thumbnail_size;
					$(img).css({
						'position':'static',
						'visibility':'visible'
					});
					return false;
				}
				if (img.width==0 || !img.complete) {
					setTimeout(function() {compress(img);}, 100);
					return false;
				}
				img.width = img.width*options.thumbnail_size/img.height;
				img.height = options.thumbnail_size;
				$(img).css({
					'position':'static',
					'visibility':'visible'
				});
			}
			
			function pop(id) {
				play = options.play;
				$(layer2).fadeTo(300, 0.6);
				$(layer1).show();
				popshow(id);
			}
			
			function popshow(id) {
				var img = popimgs[parseInt(id, 10)-1];
				$(img).css('visibility','hidden');
				$(img).show();
				$(popup).css('visibility','hidden');
				$(popup).show();
				
				if (img.width==0 || !img.complete) {
					setTimeout(function() {popshow(id);}, 100);
					return false;
				}
				var w = img.width;
				var h = img.height;
				var mw = options.max_width;
				var mh = options.max_height;
				if (w>mw) {
					img.width = mw;
					img.height = h*mw/w;
				}
				if (h>mh) {
					img.height = mh;
					img.width = w*mh/h;
				}
				w = img.width;
				h = img.height;
				
				$(img).hide();
				$(img).css('visibility','visible');
				$(popup).css('visibility','visible');
				
				cur = parseInt(id,10);
				$(num).html(cur+"/"+thumbs.length);
				$(popup).animate({height: h,
						'margin-top':(h/-2)-5,
						width: w+100,
						'margin-left':(w/-2)-55
						}, 300, function() {
							lock = false;
							if (captions[cur-1]!="") {
								$(capbox).width(img.width-10);
								$(cap).html(captions[cur-1]);
								$(capbox).fadeIn(options.transition_speed);
							}
							$(img).fadeIn(options.transition_speed, function() {
								if (play) {
									playslide();
								}
							});
						});
			}
			
			function prev() {
				var prev = cur-1;
				if (prev<1) prev = thumbs.length;
				if (lock) return false;
				lock = true;
				clearTimeout(timer);
				if (prev<10) prev = '0'+prev;
				$(bar).stop();
				$(bar).fadeOut(options.transition_speed);
				$(capbox).fadeOut(options.transition_speed);
				$(popimgs[cur-1]).fadeOut(options.transition_speed, function() {
					popshow(prev);
				});
			}
			
			function next() {
				var next = cur+1;
				if (next > thumbs.length) next = 1;
				if (lock) return false;
				lock = true;
				clearTimeout(timer);
				if (next<10) next = '0'+next;
				$(bar).stop();
				$(bar).fadeOut(options.transition_speed);
				$(capbox).fadeOut(options.transition_speed);
				$(popimgs[cur-1]).fadeOut(options.transition_speed, function() {
					popshow(next);
				});
			}
			
			function fade() {
				clearTimeout(timer);
				options.play = play;
				play = false;
				$(bar).stop();
				$(bar).width(0);
				$(layer1).fadeOut(300, function() {
					$(popup).css({
						'width':0,
						'height':0,
						'margin-top':0,
						'margin-left':0,
						'display':'none'
					});
					$('img',ploader).hide();
					$(capbox).hide();
				});
				$(layer2).fadeOut(300);
			}
			
			function playslide() {
				clearTimeout(timer);
				$(bar).stop();
				$(bar).width(0);
				if (options.slide_progress) {
					$(bar).fadeTo(0,1);
					$(bar).show();
					$(bar).animate({width:popimgs[cur-1].width}, options.play_time);
				}
				timer = setTimeout(autoplay, options.play_time);
			}
			
			function autoplay() {
				if (play && !lock) next();
			}
			
			function togglePlay() {
				if (play) {
					$(bar).stop();
					$(bar).fadeOut(300);
					$(pp).css('background','url("'+options.path+'img/sprites.png") -50px -15px no-repeat');
					play = false;
				} else {
					$(pp).css('background','url("'+options.path+'img/sprites.png") -65px -15px no-repeat');
					play = true;
					playslide();
				}
			}
			
		});
		
		//Utility functions
		function get(id) {
			return document.getElementById(id);
		}
		
		function make(tag) {
			return document.createElement(tag);
		}
		
		function parseId(id) {
			return id.slice(id.length-2);
		}
		
	};
	
}) (jQuery);