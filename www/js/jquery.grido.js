/**
 * Client-side script for Grido.
 *
 * @package     Grido
 * @author      Petr Bugyík
 * @license     New BSD License, GPL
 * @depends
 *      jquery.js > 1.7
 *      jquery.hashchange.js > 1.3
 *      bootstrap-typeahead.js - modified version
 *      bootstrap-datepicker.js
 *      jquery.maskedinput.js
 *      utils.js - methods from phpjs.org
 */
(function($) {

    $.grido =
    {
        /** Name of grid **/
        name: '',

        /** Allowing ajax **/
        ajax: true,

        /** jQuery object element of grid **/
        $element: $([]),

        /** INIT **/
        init: function(name, $element)
        {
            this.name = name;
            this.$element = $element;

            this.initHash();
            this.initFilters();
            this.initItemsPerPage();
            this.initActions();
            this.operations.init();
            this.suggest();
            this.datepicker();
            this.checkNumeric();
            this.initPagePromt();
        },

        /******************** FILTERS ********************/
        initFilters: function()
        {
            this.$element.on('change', '.filter select, .filter [type=checkbox]', function() {
                $.grido.sendFilterForm();
            });
        },

        /******************** ITEMS PER PAGE ********************/
        initItemsPerPage: function()
        {
            this.$element.on('change', '[name=count]', function() {
                $(this).next().trigger('click');
            });
        },

        /******************** CONFIRM ACTIONS ********************/
        initActions: function()
        {
            this.$element.on('click', '.actions a', function() {
               var hasConfirm = $(this).attr('data-grido-confirm');
               return hasConfirm ? confirm(hasConfirm) : true;
            });
        },

        /******************** URI HASH ********************/
        initHash: function()
        {
            if (this.ajax) {
                $(window).hashchange($.grido.hash.refresh);
                $.grido.hash.refresh();
            }
        },

        /******************** JUMP TO PAGE ********************/
        initPagePromt: function()
        {
            this.$element.on('click', '.paginator .promt', function() {
                var page = parseInt(prompt($(this).attr('data-grido-promt')));
                if (page && page > 0 && page <= parseInt($('.paginator a.btn:last', $.grido.element).prev().text())) {
                    var location = $(this).attr('data-grido-link').replace('page=0', 'page=' + page);
                    window.location = $.grido.ajax ? location.replace('?', '#') : location;
                }
            });
        },

        sendFilterForm: function()
        {
            $('[name="buttons[search]"]', $.grido.$element).click();
        },

        /******************** OPERATIONS ********************/
        operations:
        {
            $last: $([]),

            selector: 'td.checker [type=checkbox]',

            init: function()
            {
                if(!$('th.checker', $.grido.$element).length) {
                    return;
                }

                this.setSelectState();

                //click on checkbox with shift support
                $.grido.$element.on('click', $.grido.operations.selector, function(event) {
                    var $boxes = $($.grido.operations.selector, $.grido.$element);

                    if(!$.grido.operations.$last) {
                        $.grido.operations.$last = this;
                        return;
                    }

                    if(event.shiftKey) {
                        var start = $boxes.index(this),
                            end = $boxes.index($.grido.operations.$last);

                        $boxes.slice(Math.min(start, end), Math.max(start, end) + 1)
                            .attr('checked', $.grido.operations.$last.checked)
                            .trigger('change');
                    }

                    $.grido.operations.$last = this;
                });

                //click on row
                $.grido.$element.on('click', 'tbody td:not(.checker,.actions)', function() {
                    var $row = $(this).parent(),
                        $checkbox = $('[type=checkbox]', $row);

                    $.grido.operations.$last = $checkbox[0];

                    if ($checkbox.prop('checked')) {
                        $checkbox.prop('checked', false);
                        $.grido.operations.changeRow($row, false);
                    } else {
                        $checkbox.prop('checked', true);
                        $.grido.operations.changeRow($row, true);
                    }
                });

                //click on invertor
                $.grido.$element.on('click', 'th.checker [type=checkbox]', function() {
                    $($.grido.operations.selector, $.grido.element).each(function() {
                        var val = $(this).prop('checked');
                        $(this).prop('checked', !val);
                        $.grido.operations.changeRow($(this).parent().parent(), !val);
                    });
                    return false;
                });

                //handler for checkbox event "change"
                $.grido.$element.on('change', $.grido.operations.selector, function() {
                    $.grido.operations.changeRow($(this).parent().parent(), $(this).prop('checked'));
                });

                //handler for operations select event "change"
                $.grido.$element.on('change', '.operations [name="operations[operations]"]', function() {
                    if ($(this).val()) {
                        $('.operations [type=submit]', $.grido.$element).click();
                    }
                });

                //click on submit button
                $.grido.$element.on('click', '.operations [type=submit]', this.onSubmit);
            },

            getSelect: function()
            {
                return $('.operations [name="operations[operations]"]', $.grido.$element);
            },

            changeRow: function($row, selected)
            {
                if (selected) {
                    $row.addClass('selected');
                } else {
                    $row.removeClass('selected');
                }

                if ($($.grido.operations.selector + ':checked', $.grido.$element).length === 0) {
                    this.controlState('disabled');
                } else {
                    this.controlState('enabled');
                }
            },

            onSubmit: function()
            {
                var itemsCount = $($.grido.operations.selector + ':checked', $.grido.$element).length,
                    hasConfirm = $.grido.operations.getSelect().attr(
                        'data-grido-' + $.grido.operations.getSelect().val()
                    );

                return hasConfirm
                    ? confirm(hasConfirm.replace(/%i/g, itemsCount))
                    : true;
            },

            setSelectState: function()
            {
                if ($($.grido.operations.selector + ':checked', $.grido.$element).length == 0) {
                    this.controlState('disabled');
                }
            },

            controlState: function(state)
            {
                var $button = $('[name="buttons[operations]"]', $.grido.$element);
                if (state == 'disabled') {
                    this.getSelect().attr('disabled', 'disabled').addClass('disabled');
                    $button.addClass('disabled');
                } else {
                    this.getSelect().removeAttr('disabled').removeClass('disabled');
                    $button.removeClass('disabled');
                }
            }
        },

        /******************** URI HASH - EXPERIMENTAL ********************/
        hash:
        {
            query: '',

            refresh: function()
            {
                var hash = window.location.hash.toString(),
                    noAjax = $('a.no-ajax[href="' + hash + '"]', $.grido.$element).length;

                if (!noAjax && $.grido.hash.query != hash.replace('#', '')) {
                    var url = window.location.toString();
                    url = url.indexOf('?') >= 0 ? url.replace('#', '&') : url.replace('#', '?');
                    $.get(url + '&do=' + $.grido.name + '-refresh');
                }
            },

            change: function(params)
            {
                var gridParams = {};
                $.each(params, function (key, val) { //intentionally $.each
                    if ((val || val === 0) && key.indexOf('' + $.grido.name + '-') >= 0) {
                        gridParams[key] = val;
                    }
                });
                window.location.hash = $.grido.hash.query = decodeURI(http_build_query(gridParams));
                $.grido.operations.setSelectState();
            }
        },

        /******************** SUGGESTION ********************/
        suggest: function()
        {
            this.$element
                .on('keyup', 'input.suggest', function(event) {
                    var key = event.keyCode || event.which;
                    if (key == 13) { //enter
                        event.stopPropagation();
                        event.preventDefault();

                        $.grido.sendFilterForm();
                    }
                })
                .on('focus', 'input.suggest', function() {
                    $(this).typeahead({
                        source: function (query, process) {
                            if (!/\S/.test(query)) {
                                return false;
                            }
                            var params = {};
                            params[$.grido.name + '-query'] = query;

                            return $.get(this.$element.attr('data-grido-source'), params, function (items) {
                                //TODO local cache??
                                process(items);
                            }, "json");
                        },

                        updater: function (item) {
                            this.$element.val(item);
                            $.grido.sendFilterForm();
                        },

                        autoSelect: false
                    });
            });
        },

        /******************** DATEPICKER ********************/
        datepicker: function()
        {
            this.$element.on('focus', 'input.date', function() {
                $(this).mask("99.99.9999");
                $(this).datepicker({
                    format: 'dd.mm.yyyy'
                });
            });
        },

        /******************** CHECKING NUMERIC INPUT ********************/
        checkNumeric: function()
        {
            this.$element.on('keyup', 'input.number', function() {
                var value = $(this).val(),
                    pattern = new RegExp(/[^<>=\\.\\,\-0-9]+/g); //TODO: improve my regex knowledge :)
                if (pattern.test(value)) {
                    $(this).val(value.replace(pattern, ''));
                }
            });
        },

        /******************** OTHERS ********************/

        ajaxStop: function()
        {
            var snippet = 'snippet-' + $.grido.name + '-grid';
            if ($.nette.payload && $.nette.payload.snippets && $.nette.payload.snippets[snippet]) {
                $('html, body').animate({scrollTop: 0}, 400); //TODO
                $.grido.hash.change($.nette.payload.state);
            }
        }
    };

    $.fn.grido = function() {
        return this.each(function() {
            var $this = $(this);
            $.grido.init(
                $this.prop('id'),
                $this.parent().parent()
            );
        });
    };

})(jQuery);

$(function() {
    $('table.grido').grido();
    $('body').ajaxStop($.grido.ajaxStop);
});
