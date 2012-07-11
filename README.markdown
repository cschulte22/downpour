#jQuery downpour

A simple custom drop down plugin for jQuery.

##Description

Downpour is a very simple jQuery plugin that renders customized select boxes.  After trying out many 
other libraries, I've decided to write my own because it seems like everything else either wasn't
maintained anymore, or was way too much overkill for what I needed.

All this plugin does is convert a regular select box to a set of div tags that you can easily customize
via css.  It doesn't support anything fancy - no option groups and no multiple selection support.  It's
designed to handle the 99% of cases where all you want is some control over how the select box renders
in the browser.

##Usage

In the most basic form:

```html
<select id='my_custom_box' class='custom_dropdown'>
  <option value='1'>One</option>
  <option value='2'>Two</option>
  <option value='3'>Three</option>
</select>

<script type="text/javascript">
  $(function() {
    $('.custom_dropdown').downpour();
  });
</script>
```

You can specify a few options when creating your downpour select box:

```javascript
$('#my_custom_box').downpour({
  nowrap: true,  // Option rows won't be wrapped
  select: function(value, text) {
    // Callback when a value is selected, receives the value of the 
    // row and the html text. $(this) refers to the select tag
  },
  blur: function() {
    // Callback when the selection is canceled (click outside, escape pressed)
  }
});
```

Note that when a value is selected, the underlying select box is also updated, so you
can submit your forms as usual.

##Customization

You can customize everything about the downpour select box via css.  Take a look at 
example.html and downpour.css for some examples.  The basic structure of the
generated div select box looks like this:

```html
<div class='downpour_wrap my_select_class1 my_select_class2'>
  <select id='custom_select' class='my_select_class1 my_select_class2' style='display: none;'>
    <option value='1' selected>One</option>
    <option value='2'>Two</option>
    <option value='3'>Three</option>
  </select>

  <div class='downpour_select_box'>One</div>
  <div class='downpour_option_box'>
    <div class='downpour_row downpour_row_selected'>One</div>
    <div class='downpour_row downpour_row_hover'>Two</div>
    <div class='downpour_row'>Three</div>
  </div>
</div>
```

So just define styles for each class of div to get it to look the way you want.
Downpour automatically pulls the classes you've specified on the `<select>` tag
and applies them to the top level `<div class='downpour_wrap'>` element, so you
can use that to easily create different themes for your downpour select boxes.  It
will also pull classes from your `<option>` tags if you need to customize
the appearance of a particular option in the dropdown.

##Methods

Downpour supports a couple of methods you can use to control it programmatically.
To call a method, pass the name to the downpour function like so:

```javascript
$('#my_custom_box').downpour();
$('#my_custom_box').downpour('focus');
```

###Available methods:

* **focus()** - Sets the focus to this downpour box, displaying the options.
* **blur()** - Hides the downpour option box
* **select()** - Selects the currently hovered row.  You probably don't want to call this one directly, use **selected** instead
* **selected()** - Returns the currently selected value.
* **selected(value)** - Sets the currently selected value. `$('#my_custom_box').downpour('selected', '2');`
* **reload_options()** - If you make changes to the underlying list of `<option>` tags, call this method and downpour will reload the option list


##Requirements

jQuery 1.7+

##Supported Browsers

I've tested in the following browsers.  It may work in other ones as well.

* IE 8+
* Firefox
* Chrome