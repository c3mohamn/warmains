$(document).ready(function(){

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
});
