var ajax = {

    $wrapper: {},

    init: function()
    {
        this.$wrapper = $('#content');
        this.ajaxSpinner();
        this.bindHref();
        this.bindForm();
        this.initFlash();
    },

    //bind a-href html tag
    bindHref: function()
    {
        this.$wrapper.on('click', 'a:not(.no-ajax)', function(event) {
            event.preventDefault();
            $.get(this.href);
        });
    },

    bindForm: function()
    {
        //bind form submit
        this.$wrapper.on('submit', 'form', function() {
            $(this).ajaxSubmit();
            return false;
        });

        //bind form submit button click
        this.$wrapper.on('click', 'form :submit', function() {
            $(this).ajaxSubmit();
            return false;
        });
    },

    ajaxSpinner: function()
    {
        var $spinner = $('#ajax-spinner');
        $('html, body')
            .ajaxStart(function() {
                $(this).addClass('loading');
                $spinner.removeClass('hide')
            })
            .ajaxStop(function() {
                $(this).removeClass('loading');
                $spinner.addClass('hide');
            });
    },

    initFlash: function()
    {
        this.flashHide();
        this.$wrapper.ajaxStop(ajax.flashHide);
    },

    flashHide: function()
    {
        var $el = $('.alert');
        if ($el.length) {
            setTimeout(function() {
                $el.animate({"opacity": 0}, 800, function(){
                    $el.remove()
                });
            }, 10000);
        }
    }
};

$(function(){
    ajax.init();
});
