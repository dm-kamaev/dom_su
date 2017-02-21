var price_for_podderzhka=[{
	"40" : 1990,
	"50" : 2280,
	"60" : 2520,
	"70" : 2760,
	"80" : 2940,
	"90" : 3120,
	"100" : 3300,
	"@" : 33
	},
	{
	"40" : 1680,
	"50" : 1860,
	"60" : 2100,
	"70" : 2280,
	"80" : 2520,
	"90" : 2640,
	"100" : 2750,
	"@" : 27.5
	},
	{"40" : 1490,
	"50" : 1740,
	"60" : 1910,
	"70" : 2160,
	"80" : 2280,
	"90" : 2450,
	"100" : 2570,
	"@" : 25.3
	}
	];
var price_for_podderzhka_spb=[{
	"40" : 1790,
	"50" : 2050,
	"60" : 2260,
	"70" : 2480,
	"80" : 2650,
	"90" : 2800,
	"100" : 2970,
	"@" : 30
	},
	{
	"40" : 1680,
	"50" : 1860,
	"60" : 2100,
	"70" : 2280,
	"80" : 2520,
	"90" : 2640,
	"100" : 2750,
	"@" : 27.5
	},
	{"40" : 1490,
	"50" : 1740,
	"60" : 1910,
	"70" : 2160,
	"80" : 2280,
	"90" : 2450,
	"100" : 2570,
	"@" : 25.3
	}
	];
var price_for_posle=[{
	"40" : 5600,
	"50" : 6100,
	"60" : 6700,
	"70" : 7350,
	"80" : 7980,
	"90" : 8900,
	"100" : 9350,
	"@" : 93.5
	},
	{
	"40" : 6590,
	"50" : 7190,
	"60" : 7880,
	"70" : 8650,
	"80" : 9390,
	"90" : 10490,
	"100" : 10990,
	"@" : 110
	}];

var price_for_posle_spb=[{
	"40" : 4450,
	"50" : 4880,
	"60" : 5630,
	"70" : 6035,
	"80" : 6750,
	"90" : 7640,
	"100" : 7980,
	"110": 8925,
	"120": 9860,
	"130": 10795,
	"140": 11730,
	"150": 12665,
	"@" : 85
	},
	{
	"40" : 5240,
	"50" : 5740,
	"60" : 6630,
	"70" : 7100,
	"80" : 7940,
	"90" : 8990,
	"100" : 9390,
	"110": 10500,
	"120": 11600,
	"130": 12700,
	"140": 13800,
	"150": 14900,
	"@" : 100
	}];
var price_for_general=[{
	"40" : 6590,
	"50" : 7190,
	"60" : 7880,
	"70" : 8650,
	"80" : 9390,
	"90" : 10490,
	"100" : 10990,
	"@" : 110
	},
	{
	"40" : 4280,
	"50" : 4670,
	"60" : 5120,
	"70" : 5620,
	"80" : 6100,
	"90" : 6820,
	"100" : 7140,
	"@" : 71.5
	}];
var price_for_general_spb=[{
	"40" : 5240,
	"50" : 5740,
	"60" : 6630,
	"70" : 7100,
	"80" : 7940,
	"90" : 8990,
	"100" : 9390,
	"110": 10500,
	"120": 11600,
	"130": 12700,
	"140": 13800,
	"150": 14900,
	"@" : 100
	},
	{
	"40" : 4280,
	"50" : 4670,
	"60" : 5120,
	"70" : 5620,
	"80" : 6100,
	"90" : 6820,
	"100" : 7140,
	"110": 7865,
	"120": 8580,
	"130": 9295,
	"140": 10010,
	"150": 10725,
	"@" : 71.5
}];

function getPrice(e)
{
	var value = Number(this.value);
	
	if(value === NaN)
	{
		value = 0;
	}
	
	var tr = $(this).parent().parent();
	
	if(tr.hasClass("podderzhka"))
	{
		price = price_for_podderzhka;
	}
	
	if(tr.hasClass("posle"))
	{
		price = price_for_posle;
	}

	if(tr.hasClass("posle_spb"))
	{
		price = price_for_posle_spb;
	}
	
	if(tr.hasClass("general"))
	{
		price = price_for_general;
	}

	if(tr.hasClass("general_spb"))
	{
		price = price_for_general_spb;
	}
	
	for(var i = 0; i < price.length; i++)
	{
		max = 200;
		p1 = 0;
		
		for(var p in price[i])
		{
			if(p != "@")
			{
				pp = Number(p);
				if(pp >= value && pp < max)
				{
					max = pp;
				}
			}
		}
		
		if(max != 200)
		{
			tr.find("[name='price" + (i + 1) + "']").html(price[i][max]);
		}
		else
		{
			tr.find("[name='price" + (i + 1) + "']").html((price[i]["@"]*value).toFixed());
		}
	}
	ga('send', {
		'hitType': 'event',
		'eventCategory': 'form',
		'eventAction': 'send',
		'eventLabel': tr.attr('class')
	});
}

var data1 = {};
var objs = {};
var templates = {};

$(document).ready(function(){
	$("input[name='your_sq']").change(function(e){getPrice.call(this, e);}).blur(function(e){getPrice.call(this, e)});
	
	$("[name='phone'],[name='PROPERTY[3][0]']").mask("+7 (999) 999-99-99");


	
	$("a").click(function(){
		if($(this).attr("href").substring(0, 1) == '#')
		{
			var anhor = $("a[name='" + $(this).attr("href").substring(1) + "']");
			$("body,html").animate({scrollTop: anhor.position().top - 40}, 200);
			
			return false;
		}
	});
	
	$("button.slide").each(function(){
		$("#" + $(this).attr("data-element")).hide();
		
		$(this).click(function(){
			var div = $("#" + $(this).attr("data-element"));
			$(this).hide();
			div.slideDown(300);
			//div.show();
		});
	});
	
	$("button.order_close").click(function(e){
		e.preventDefault();
		closeForm();
		return false;
	});
	
	var filter  = /forma_zakaza/;
		
	if(filter.test(location))
		$("button.order_close").css({display: 'none'});
	
	function closeForm()
	{
		var dark = $("#order_dark");
		var form = $("#order_form");
		
		dark.animate({opacity: 0}, 300, function()
		{
			dark.css({display: 'none'});
			form.css({top: '-1000px'});
		});
		form.animate({opacity: 0}, 300);
	}

	
	function setOnCenter()
	{
		var form = $("#order_form");
		form.animate({top: '200px', left: $(window).width()/2 - form.width()/2}, 300);
	}
	
	$("#order_dark").click(function(){
		closeForm();
	});
	
	$("button.order, .li4 a, #order-link").click(function(e){
		var filter  = /forma_zakaza/;
		
		if(filter.test(location))
			return false;
			
		var dark = $("#order_dark");
		var form = $("#order_form");
		
		dark.css({display: 'block'});
		dark.animate({opacity: 0.5}, 300);
		
		form.css({top: '200px', left: $(window).width()/2 - form.width()/2});
		form.animate({opacity: 1}, 300);
		
		return false;
	});

	/* get contract */
	$("#dark_contract").click(function(){
		closeFormContract();
	});

	$("#a-get-contract").click(function(e){

		var dark = $("#dark_contract");
		var form = $("#get_contract_form");

		dark.css({display: 'block'});
		dark.animate({opacity: 0.5}, 300);

		form.css({top: '200px', left: $(window).width()/2 - form.width()/2});
		form.animate({opacity: 1}, 300);

		return false;
	});

	$("button.contract_close").click(function(e){
		e.preventDefault();
		closeFormContract();
		return false;
	});
	function closeFormContract()
	{
		var dark = $("#dark_contract");
		var form = $("#get_contract_form");

		dark.animate({opacity: 0}, 300, function()
		{
			dark.css({display: 'none'});
			form.css({top: '-1000px'});
		});
		form.animate({opacity: 0}, 300);
	}
	/* end get contract */

	/* order jur */
	$("#order_dark").click(function(){
		closeJurFormContract();
	});

	$("#a_order_form_jur").click(function(e){

		var dark = $("#order_dark");
		var form = $("#order_form_jur");

		dark.css({display: 'block'});
		dark.animate({opacity: 0.5}, 300);

		form.css({top: '200px', left: $(window).width()/2 - form.width()/2});
		form.animate({opacity: 1}, 300);

		return false;
	});

	//$("#a_order_form_jug").click(function(e){
	//	e.preventDefault();
	//	closeJurFormContract();
	//	return false;
	//});
	function closeJurFormContract()
	{
		var dark = $("#order_dark");
		var form = $("#order_form_jur");

		dark.animate({opacity: 0}, 300, function()
		{
			dark.css({display: 'none'});
			form.css({top: '-1000px'});
		});
		form.animate({opacity: 0}, 300);
	}
	/* end order jur */

	var select = $('select');
	
	var pan, firstMenuTop = $("nav.main").offset().top;

	$("button.up").click(function(e){
		e.preventDefault();
		$('body,html').animate({scrollTop: 0}, 300);
	});

	$(window).scroll(function(e){
		if($(window).scrollTop() > firstMenuTop)
		{
			if(!$("nav.main").hasClass("fixed"))
			{
				$("nav.main, button.up").addClass("fixed");
			}
		}
		else
		{
			if($("nav.main").hasClass("fixed"))
			{
				$("nav.main, button.up").removeClass("fixed");

			}
		}
	});

	var selectBoxContainer = $('<div>',{

		class	: 'tzSelect',
		html	: '<div class="selectBox"></div>'
	});

	var dropDown = $('<ul>',{class:'dropDown'});
	var selectBox = selectBoxContainer.find('.selectBox');
	
	// Looping though the options of the original select element
	
	select.find('option').each(function(i){
		if(this.value == "")
			return;
			
		var option = $(this);
		
		if(i==select.attr('selectedIndex')){
			selectBox.html(option.text());
		}
		
		// As of jQuery 1.4.3 we can access HTML5 
		// data attributes with the data() method.
		
		if(option.data('skip')){
			return true;
		}
		
		// Creating a dropdown item according to the
		// data-icon and data-html-text HTML5 attributes:
		
		var li = $('<li>',{
			html  : option.data('html-text')
		});
				
		li.click(function(){
			
			selectBox.html(option.text());
			dropDown.trigger('hide');
			
			// When a click occurs, we are also reflecting
			// the change on the original select element:
			select.val(option.val());
			
			return false;
		});
		
		dropDown.append(li);
	});

    select.data('visualizer', selectBoxContainer);
	
	selectBoxContainer.append(dropDown.hide());
	select.hide().after(selectBoxContainer);

	// Binding custom show and hide events on the dropDown:
	
	dropDown.bind('show',function(){
		
		if(dropDown.is(':animated')){
			return false;
		}
		
		selectBox.addClass('expanded');
		dropDown.slideDown();
		
	}).bind('hide',function(){
		
		if(dropDown.is(':animated')){
			return false;
		}
		
		selectBox.removeClass('expanded');
		dropDown.slideUp();
		
	}).bind('toggle',function(){
		if(selectBox.hasClass('expanded')){
			dropDown.trigger('hide');
		}
		else dropDown.trigger('show');
	});
	
	selectBox.click(function(){
		$(this).parent().css({ 'background-color' : '#fff' });
		dropDown.trigger('toggle');
		return false;
	});

	// If we click anywhere on the page, while the
	// dropdown is shown, it is going to be hidden:
	
	$(document).click(function(){
		dropDown.trigger('hide');
	});
	
	$("order-form").submit(function(){
		elems = [$(this).find("[name='PROPERTY[NAME][0]']")[0],
				 $(this).find("[name='PROPERTY[3][0]']")[0],
				 $(this).find("[name='PROPERTY[6]']")[0]];
		
		valid = true;
		
		for(var i = 0; i < elems.length; i++)
		{
			var elem = elems[elems.length - i - 1];
			
			if(elem.value == "")
			{
				if($(elem).attr('name') == 'PROPERTY[6]')
				{
					$(elem).next().css({ 'background-color' : '#ff8888' });
				}
				$(elem).css({ 'background-color' : '#ff8888' });
				elem.focus();
				valid = false;
			}
			else
			{
				$(elem).css({ 'background-color' : '#fff' });
			}
		}
        if (valid) {
            alert(1);
            var name = $("input[name='PROPERTY[NAME][0]']");
            var phone = $("input[name='PROPERTY[3][0]']");
            var mail = $("input[name='PROPERTY[4][0]']");
            var square = $("input[name='PROPERTY[5][0]']");
            var service = $("select[name='PROPERTY[6]']");
            var text = $("input[name='PROPERTY[7][0]']");
            $.ajax({
                    url: "/order-handler",
                    type: 'POST',
                    dataType: "html",
                    data: {
                        "name": name.val(),
                        "phone": phone.val(),
                        "mail": mail.val(),
                        "square": square.val(),
                        "service": service.val(),
                        "text": text.val()
                    },
                    beforeSend: function (xhr, settings) {
                        function getCookie(name) {
                            var cookieValue = null;
                            if (document.cookie && document.cookie != '') {
                                var cookies = document.cookie.split(';');
                                for (var i = 0; i < cookies.length; i++) {
                                    var cookie = jQuery.trim(cookies[i]);
                                    // Does this cookie string begin with the name we want?
                                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                                        break;
                                    }
                                }
                            }
                            return cookieValue;
                        }

                        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
                            // Only send the token to relative URLs i.e. locally.
                            xhr.setRequestHeader("X-CSRFToken", getCookie('csrftoken'));
                        }
                    }
                }

            );


        }
		return false;
	});
	
	var do_white = function(){
		$(this).css({ 'background-color' : '#fff' });
	}
//вот изменения
    var do_transparent = function(){
		$(this).css({ 'background-color' : 'transparent' });
	}

	$("input, textarea").keypress(do_white);

    $("li[valid]").each(function () {
        $(this).find("input[type='radio']").click(function (e) {
            do_transparent.call($("li[valid][data-name='" + $(this).attr("name") + "']"));
        });
    });


	selectBoxContainer.click(do_white);
});

$(document).ready(function(){
	
	
    /*$("a.img").fancybox({
        openEffect  : 'none',
		closeEffect : 'none',
		prevEffect	: 'none',
		nextEffect	: 'none',
		helpers	: {
			title	: {
				type: 'inside'
			},
			overlay	: {
				opacity : 0.8,
				css : {
					'background-color' : '#000'
				}
			},
			
            closeBtn		: false,
			buttons	: {}
		}
	});*/

    $('a.img').fancybox({
		openEffect  : 'none',
		closeEffect : 'none',
        nextEffect : 'none',
        prevEffect	: 'none',
        //autoSize : false,
        //scrolling : 'no',
        //scrollOutside : true,
        closeBtn		: true,
        mouseWheel : false,
		helpers : {
			media : {},
            title	: {
				type: 'inside'
			},
			overlay	: {
				opacity : 0.8,
				css : {
					//'background-color' : '#000'
				}
			},


			buttons	: {}
		}
	});
                               
    if($("#data").length != 0)
    {
    	eval('templates = ' + $("#data").html().replace(/[\r\n]/g,''));
    }
    
    if(window.location.hash != "")
    	showimage();
    	
    /******
    TABS
    ******/
    $('aside.left ul.tabs').delegate('li:not(.current)', 'click', function(){
    	$(this).addClass('current').siblings().removeClass('current').parents('aside.left').find('div.box').hide().eq($(this).index()).fadeIn(150);
        $.cookie('parent', $(this).attr('id'), {path: '/'});
    });
    
 //   $('.tabs-slider ul.tabs').delegate('li:not(.current)', 'click', function(){
 //   	$('.box').hide().removeClass('visible');
 //      $(this).addClass('current').siblings().removeClass('current').parents('.tabs-slider').find('div.box').hide().eq($(this).index()).fadeIn(150);
 //       $.cookie('parent', $(this).attr('id'), {path: '/'});
 //  });
    /******
    CAROUSEL
    ******/
    $(".carousel > div").jCarouselLite({
    	btnNext: ".next",
    	btnPrev: ".prev",
    	visible: 7,
    	mouseWheel: false,
    	circular: false
    });
    $(".carousel").mouseenter(function() {
    	document.onmousewheel = function (e) {
    	  //e.preventDefault();
    	}
    }).mouseleave(function() {
    	document.onmousewheel = null;
    });
    
    /******
    SMILES
    ******/
 /*   $("span.smile").each(function(){
    	var smile = $(this);
    	smile.hover(function(){
    		smile.stop(true,false).animate({"top":"-10px"}, 300).animate({"top":"-3px"},100);
    	},function(){
    		//alert($(this).hasClass("Active"));
    		//if(!$(this).hasClass("Active"))
    			smile.stop(true,false).animate({"top":"0px"},100);
    	});
    });*/
    
    /******/

  // var a=$.cookie('parent');
 //  $('ul.tabs li').click();
 //  $('#'+a).click();

});

var createElementsByHTML = (function(){
    var div = document.createElement("div");
    return function ( html ) {
        var res = [];
        div.innerHTML = html;
        while ( div.firstChild ) {
            res[ res.length ] = div.removeChild( div.firstChild );
        }
        return res;
    };
})();

function hashchange1(func)
{
	if(("onhashchange" in window) && !($.browser.msie))
	{
    	window.onhashchange = func;
    }
    else 
    { 
        var prevHash = window.location.hash;
        window.setInterval(function () 
        {
           if (window.location.hash != prevHash) 
           {
              prevHash = window.location.hash;
              func();
           }
        }, 100);
    }
}

hashchange1(showimage);

function stop_(e)
{
	e.stopPropagation();
}

function showimage(e)
{
   if(window.location.hash == "clear")
	return;

   if(objs.dark === undefined)
   {
   	$.get('http://site.domovenok.corp/new3/ajax/ajax.pl?image=' + window.location.hash.substring(1), function(resp)
   	{                                                            
   		eval('var res = ' + resp);      
   		objs.images = res;
   		if(res.error)
   			return;

   		var idi = window.location.hash.substring(window.location.hash.search(/[0-9]+$/));

   		objs.dark = createElementsByHTML(templates.dark);
   		var cont = $(objs.dark).find('.items');

   		var num = 0;

   		for(var i = 0; i < res.length; i++)
   		{
   			var elem = $(createElementsByHTML(templates.image));
   			elem.find('img').attr('src', res[i].src);
			elem.find('img').attr('alt', res[i].alt);

			$(elem).find('span').html(res[i].alt);

   			cont.append(elem);
   			if(res[i].id == idi)
   				num = i;
   		}
		
   		$("body").append(objs.dark);
		
		//$(objs.dark).find(".scrollable").scrollable().navigator();
		//$(objs.dark).find(".scrollable").scrollable({circular: false});
		
		$($(objs.dark).find(".scrollable")).scrollable({circular: true, mousewheel: true}).navigator();
		var api = $(objs.dark).find(".scrollable").data("scrollable");
        	api.seekTo(num, 100);
		document.onmousewheel = function (e) {
			e.preventDefault();
		}
		
		$("body").css("overflow","hidden");

		
		$(objs.dark).click(function()
		{                       
			$(objs.dark).remove();
			objs.dark = undefined;
			window.location.hash = "clear";
			$("body").css("overflow","auto");
			return false;
			//window.location.replace(location.protocol+"//"+location.host+location.pathname+location.search);
		});
		
		$(objs.dark).find('.scrollable').click(stop_);
		$(objs.dark).find('.navi').click(stop_);
	});
   }
}