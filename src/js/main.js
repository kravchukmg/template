let $ = require('jquery')
let slick = require('./slick.js')

$(function() {

  $('a[href*="#"]').on('click', function(event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {

      event.preventDefault();

      let hash = this.hash;

      $('html, body').animate({
        scrollTop: $(hash).offset().top - 100
      }, 500, function(){
        window.location.hash = hash;
      });
    }
  });
})
