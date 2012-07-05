//  Options:
//    class: Additional class to apply to the top level div element
//    nowrap: Pass true if you don't want lines to wrap to fit in the size of the select box width (default false)
//    blur: Function that's called when the select box is unfocused.  Receives the select box as this
//
(function( $ ) {
  var defaults = {
    'class' : '',
    nowrap: false
  }

  var methods = {
    init : function( settings ) { 
      console.log('downpour init');
      console.log('downpour init called for ' + this.attr('id'));

      settings = $.extend({}, defaults, settings);

      var id = this.attr('id');

      var data = this.data('downpour') || {}

      if (data.id) {
        console.log('already setup, returning')
        // Already setup
        return this;
      }

      // Add a div with relative positioning around the select box
      this.wrap('<div class="downpour_wrap ' + settings['class'] + '"/>');
      var wrapper = this.parent('div.downpour_wrap');
      wrapper.css({
        'position': 'relative',
        'overflow': 'visible'
      });

      // Hide the original select box
      this.hide();

      // Add our customized div select 'box' to the wrapper
      wrapper.append('<div class="downpour_select_box" />');
      _select_box(this).css({
        position: 'absolute',
        top: '0px',
        left: '0px',
        width: this.css('width')
      });

      _select_box(this).bind('click.downpour', function() { _handle_select_click($(this).siblings('select')); });

      wrapper.append('<div class="downpour_option_box" />');
      _option_box(this).css({
        display: 'none',
        position: 'absolute',
        top: '0px',
        left: '0px',
        'min-width': _select_box(this).outerWidth() + 'px'
      });
      var option_box = _option_box(this);
      var selected_row = null;

      this.find('option').each(function() {
        var row = $('<div class="downpour_row">' + $(this).html() + '</div>');
        row.data('downpour_value', $(this).attr('value'));
        if (settings.nowrap) {
          row.css({'white-space': 'nowrap'});
        }
        if ($(this).is(':selected')) {
          selected_row = row;
        }

        option_box.append(row);
      });

      console.log('selected row:')
      console.log(selected_row);


      // Grab the selected option from the select box (if any) and append the text to our custom select box
      if (selected_row != null) {
        _select_box(this).html(selected_row.html());
      }
      else {
        _select_box(this).html('');
      }

      // Set the dimensions of the wrapper to the size of the select box so it flows correctly
      wrapper.css({
        height: _select_box(this).outerHeight(),
        width: _select_box(this).outerWidth()
      })

      data.id = id;
      data.settings = settings;

      if (selected_row != null) {
        data.selected = selected_row.data('downpour_value');
      }

      this.data('downpour', data);

      return this;
    },

    focus : function() {
      console.log('Focus method called');
      var select_box = _select_box(this);
      var option_box = _option_box(this);

      if (!option_box.is(':visible')) {
        option_box.css({
          top: (select_box.outerHeight()) + 'px'
        })

        option_box.find('div.downpour_row_hover').removeClass('downpour_row_hover');
        option_box.find('div.downpour_row_selected').removeClass('downpour_row_selected');

        var downpour_rows = option_box.find('div.downpour_row');

        downpour_rows.bind('mouseover.downpour', function() {
          $(this).siblings('div.downpour_row_hover').removeClass('downpour_row_hover');
          $(this).addClass('downpour_row_hover');
        });
        downpour_rows.bind('mouseout.downpour', function() {
          $(this).removeClass('downpour_row_hover');
        });
        downpour_rows.bind('click.downpour', function() {
          _grab_active_select().downpour('select');
        });

        $(document).bind('keydown.downpour', _handle_keypress);

        var data = this.data('downpour');
        if (data.selected !== undefined && data.selected != null) {
          option_box.find('div.downpour_row').each(function() {
            if ($(this).data('downpour_value') == data.selected) {
              $(this).addClass('downpour_row_hover downpour_row_selected');
            }
          });
        }

        option_box.show();
      }
    },

    blur: function() {
      _hide_options(this);

      var data = this.data('downpour');
      if (data.settings.blur !== undefined) {
        console.log('blur event defined');
        data.settings.blur.apply(this);
      }
      else {
        console.log('blur event undefined');
      }
    },

    select: function() {
      var options = _option_box(this);
      var current_row = options.find('div.downpour_row_hover');

      var data = this.data('downpour');
      data.selected = current_row.data('downpour_value');

      this.siblings('div.downpour_select_box').html(current_row.html());

      _hide_options(this);

      var data = this.data('downpour');
      if (data.settings.select !== undefined) {
        console.log('select event defined');
        data.settings.select.apply(this, [current_row.data('downpour_value'), current_row.html()]);
      }
      else {
        console.log('select event undefined');
      }
    },

    selected: function(value) {
      var data = this.data('downpour');
      if (value === undefined) {
        // Return the existing value
        return data.selected;
      }
      else {
        // Set the currently selected value
        data.selected = value;
      }
    }
  };

  $.fn.downpour = function( method ) {
    
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.downpour' );
    }    
  
  };

  function _select_box(item) {
    return item.siblings('div.downpour_select_box');
  }

  function _option_box(item) {
    return item.siblings('div.downpour_option_box');
  }

  function _cancel_select(item) {
    item.downpour('blur');
  }

  function _hide_options(item) {
    var select_box = _select_box(item);
    var option_box = _option_box(item);

    option_box.find('div.downpour_row').unbind('mouseover.downpour');
    option_box.find('div.downpour_row').unbind('mouseout.downpour');
    option_box.find('div.downpour_row').unbind('click.downpour');

    $(document).unbind('keydown.downpour');

    option_box.hide();
  }

  function _handle_keypress(event) {
    console.log('keypress');
    console.log('pressed: ' + event.which);

    if (event.which == 27) {
      // Escape
      _cancel_select(_grab_active_select());
      event.preventDefault();
    }
    else if (event.which == 38) {
      // Arrow up
      var option_box = _option_box(_grab_active_select());
      var current_row = option_box.find('div.downpour_row_hover');
      if (current_row.length == 0) {
        current_row = option_box.find('div.downpour_row_selected');
      }
      var prev_row = current_row.prev('div.downpour_row');
      if (prev_row.length == 0) {
        prev_row = option_box.find('div.downpour_row').last();
      }

      current_row.removeClass('downpour_row_hover');
      prev_row.addClass('downpour_row_hover');
      event.preventDefault();
    }
    else if (event.which == 40) {
      // Arrow down
      var option_box = _option_box(_grab_active_select());
      var current_row = option_box.find('div.downpour_row_hover');
      if (current_row.length == 0) {
        current_row = option_box.find('div.downpour_row_selected');
      }
      var next_row = current_row.next('div.downpour_row');
      if (next_row.length == 0) {
        next_row = option_box.find('div.downpour_row').first();
      }

      current_row.removeClass('downpour_row_hover');
      next_row.addClass('downpour_row_hover');
      event.preventDefault();
    }
    else if (event.which == 13) {
      // Enter pressed
      _grab_active_select().downpour('select');
      event.preventDefault();
    }
  }

  function _grab_active_select() {
    return jQuery('div.downpour_option_box').filter(':visible').prevAll('select');
  }

  function _handle_select_click(item) {
    if (_option_box(item).is(':visible')) {
      item.downpour('blur');
    }
    else {
      item.downpour('focus');
    }
  }

})( jQuery );
