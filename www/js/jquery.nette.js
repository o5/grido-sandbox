/**
 * AJAX Nette Framework plugin for jQuery
 * o5 edit: added payload
 *
 * @copyright   Copyright (c) 2009 Jan Marek
 * @license     MIT
 * @link        http://nettephp.com/cs/extras/jquery-ajax
 * @version     0.2
 */

$.extend({

    nette: {

        payload: null,

        updateSnippet: function (id, html)
        {
            $("#" + id).html(html);
        },

        success: function (payload)
        {
            $.nette.payload = payload;

            // redirect
            if (payload.redirect) {
                window.location.href = payload.redirect;
                return;
            }

            // snippets
            if (payload.snippets) {
                for (var i in payload.snippets) {
                    $.nette.updateSnippet(i, payload.snippets[i]);
                }
            }
        }
    }
});

$.ajaxSetup({
    success: $.nette.success,
    dataType: "json"
});
