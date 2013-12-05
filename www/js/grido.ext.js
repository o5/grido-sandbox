/**
 * Grido extensions.
 *
 * @author Petr Bugyík
 * @param {jQuery} $
 * @param {Window} window
 * @param {Grido} Grido
 * @param {undefined} undefined
 * @depends:
 *      https://rawgithub.com/digitalBush/jquery.maskedinput/master/dist/jquery.maskedinput.js
 *      https://rawgithub.com/Aymkdn/Datepicker-for-Bootstrap/master/bootstrap-datepicker.js
 *      https://rawgithub.com/o5/bootstrap/master/js/bootstrap-typeahead.js
 *      https://rawgithub.com/cowboy/jquery-hashchange/master/jquery.ba-hashchange.min.js
 *      https://rawgithub.com/vojtech-dobes/nette.ajax.js/master/nette.ajax.js
 */
;(function($, window, Grido, undefined) {
    /*jshint laxbreak: true, expr: true */
    "use strict";

    Grido.Grid.prototype.onInit = function()
    {
        this.initDatepicker();
        this.initSuggest();
    };

    Grido.Grid.prototype.initDatepicker = function()
    {
        var _this = this;
        this.$element.on('focus', 'input.date', function() {
            $.fn.mask === undefined
                ? console.error('Plugin "jquery.maskedinput.js" is missing!')
                : $(this).mask(_this.options.datepicker.mask);

            $.fn.datepicker === undefined
                ? console.error('Plugin "bootstrap-datepicker.js" is missing!')
                : $(this).datepicker({format: _this.options.datepicker.format});
        });
    };

    Grido.Grid.prototype.initSuggest = function()
    {
        if ($.fn.typeahead === undefined) {
            console.error('Plugin "typeahead.js" is missing!');
            return;
        }

        var _this = this;
		
		this.$element.find('input.suggest').each(function() {
			var link = $(this).data('grido-suggest-handler');
				$(this).typeahead({
					limit: 10,
					highlight: true,
					remote: {
						url: link,
						wildcard: '-query-'
					}
				});
				$(this).on('typeahead:selected', function(){
					_this.sendFilterForm();
				});
		});
		
        this.$element
            .on('keyup', 'input.suggest', function(event) {
                var key = event.keyCode || event.which;
                if (key === 13) { //enter
                    event.stopPropagation();
                    event.preventDefault();

                    _this.sendFilterForm();
                }
            })
    };

    Grido.Ajax.prototype.registerHashChangeEvent = function()
    {
        $.fn.hashchange === undefined
            ? console.error('Plugin "jquery.hashchange.js" is missing!')
            : $(window).hashchange($.proxy(this.handleHashChangeEvent, this));

        this.handleHashChangeEvent();
    };

    /**
     * @param {string} url
     */
    Grido.Ajax.prototype.doRequest = function(url)
    {
        if ($.fn.netteAjax === undefined) {
            console.error('Plugin "nette.ajax.js" is missing!');
            $.get(url);
        } else {
            $.nette.ajax({url: url});
        }
    };

})(jQuery, window, window.Grido);