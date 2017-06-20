$(document).ready(function(){

  $(function() {
    $('body').removeClass('fade-out');
  });

  // initialize bootstrap tooltips
  $(document).ready(function(){
      $('[data-toggle="tooltip"]').tooltip();
  });

  // Logo hover styling
  $(".logo a").mouseover(function (){
      $("#logo-black").css("color", "brown");
  });
  $(".logo a").mouseout(function (){
      $("#logo-black").css("color", "grey");
  });
  $(".logo a").mouseover(function (){
      $("#logo-brown").css("color", "grey");
  });
  $(".logo a").mouseout(function (){
      $("#logo-brown").css("color", "brown");
  });

  // Disables item slot links from directing to another page
  // - makes it easier to select slots.
  $('.char_panel a, #selected_link, #selected_gem_link, .glyphs, \
  .major_glyphs, .minor_glyphs').click(function() {
    return false;
  });
});
