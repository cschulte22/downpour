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
      return this.each(function() {
        var $this = $(this);

        settings = $.extend({}, defaults, settings);

        var id = $this.attr('id');

        var data = $this.data('downpour') || {}

        if (data.id) {
          // Already setup
          return $this;
        }

        // Add a div with relative positioning around the select box
        $this.wrap('<div class="downpour_wrap"/>');
        var wrapper = $this.parent('div.downpour_wrap');
        wrapper.css({
          'position': 'relative',
          'overflow': 'visible'
        });
        wrapper.addClass($this.attr('class'));

        // Hide the original select box
        $this.hide();

        // Add our customized div select 'box' to the wrapper
        wrapper.append('<div class="downpour_select_box" />');
        _select_box($this).css({
          position: 'absolute',
          top: '0px',
          left: '0px',
          width: $this.css('width')
        });

        _select_box($this).bind('click.downpour', function(event) {
          event.stopPropagation(); 
          _handle_select_click($(this).siblings('select')); 
        });

        wrapper.append('<div class="downpour_option_box" />');
        _option_box($this).css({
          display: 'none',
          position: 'absolute',
          top: '0px',
          left: '0px',
          'min-width': _select_box($this).outerWidth() + 'px',
          'z-index': (_max_z_index() + 1)
        });

        var selected_row = _setup_options($this, settings.nowrap);

        // Set the dimensions of the wrapper to the size of the select box so it flows correctly
        wrapper.css({
          height: _select_box($this).outerHeight(),
          width: _select_box($this).outerWidth()
        })

        data.id = id;
        data.settings = settings;

        if (selected_row != null) {
          data.selected = selected_row.data('downpour_value');
        }

        $this.data('downpour', data);

        return $this;
      });
    },

    focus : function() {
      return this.each(function() {
        var $this = $(this);
        var select_box = _select_box($this);
        var option_box = _option_box($this);

        if (!option_box.is(':visible')) {
          select_box.addClass('downpour_select_box_focus');
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
          $(document).bind('click.downpour', function() { _grab_active_select().downpour('blur')});

          var data = $this.data('downpour');
          if (data.selected !== undefined && data.selected != null) {
            option_box.find('div.downpour_row').each(function() {
              if ($(this).data('downpour_value') == data.selected) {
                $(this).addClass('downpour_row_hover downpour_row_selected');
              }
            });
          }

          option_box.show();
        }
      });
    },

    blur: function() {
      return this.each(function() {
        var $this = $(this);
        _hide_options($this);

        var data = $this.data('downpour');
        if (data.settings.blur !== undefined) {
          data.settings.blur.apply($this);
        }
      });
    },

    select: function() {
      return this.each(function() {
        var $this = $(this);
        var options = _option_box($this);
        var current_row = options.find('div.downpour_row_hover');

        $this.downpour('selected', current_row.data('downpour_value'));

        $this.siblings('div.downpour_select_box').html(current_row.html());

        _hide_options($this);

        var data = $this.data('downpour');
        if (data.settings.select !== undefined) {
          data.settings.select.apply($this, [current_row.data('downpour_value'), current_row.html()]);
        }
      });
    },

    selected: function(value) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.data('downpour');
        if (value === undefined) {
          // Return the existing value
          return data.selected;
        }
        else {
          // Set the currently selected value
          data.selected = value;
          // Set it on the underlying select box too
          $this.val(value);
        }
      });
    },

    reload_options: function() {
      return this.each(function() {
        var $this = $(this);
        var data = $this.data('downpour');
        _option_box($this).empty();

        var selected_row = _setup_options($this, data.settings.nowrap);
        if (selected_row != null) {
          data.selected = selected_row.data('downpour_value');
        }
      });
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

    select_box.removeClass('downpour_select_box_focus');

    option_box.find('div.downpour_row').unbind('mouseover.downpour');
    option_box.find('div.downpour_row').unbind('mouseout.downpour');
    option_box.find('div.downpour_row').unbind('click.downpour');

    $(document).unbind('keydown.downpour');
    $(document).unbind('click.downpour');

    option_box.hide();
  }

  function _handle_keypress(event) {
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
      _scroll_to_selected(option_box);
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
      _scroll_to_selected(option_box);
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

  function _scroll_to_selected(option_box) {
    var highlighted_row = option_box.find('div.downpour_row_hover');
    if (highlighted_row) {
      var box_top = option_box.scrollTop();
      var row_top = highlighted_row.position().top;
      var box_height = option_box.outerHeight();
      var row_height = highlighted_row.outerHeight();

      if ((row_top + row_height) > (box_top + box_height) || (row_top < box_top)) {
        option_box.scrollTop(row_top);
      }
    }
  }

  function _setup_options(item, nowrap) {
    var option_box = _option_box(item);
    var selected_row = null;

    item.find('option').each(function() {
      var row = $('<div class="downpour_row">' + $(this).html() + '</div>');
      row.data('downpour_value', $(this).attr('value'));
      if (nowrap) {
        row.css({'white-space': 'nowrap'});
      }
      if ($(this).is(':selected')) {
        selected_row = row;
      }

      option_box.append(row);
    });

    // Grab the selected option from the select box (if any) and append the text to our custom select box
    if (selected_row != null) {
      _select_box(item).html(selected_row.html());
    }
    else {
      _select_box(item).html('');
    }

    return selected_row;
  }

  function _max_z_index() {
    var z_index_max = 0;
    $('div').each(function () {
      var z = parseInt($(this).css('z-index'));
      if (z > z_index_max) {
        z_index_max = z;
      }
    });
    return z_index_max;
  }
})( jQuery );
