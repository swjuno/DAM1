"use strict";
var currentPath = "";
jQuery(function () {
    console.log('ready');
    $(".button_menu").on('mouseover', function () {
        console.log('hover');
    });
    $("#btn_owners").on('click', function () {
        switchContent('/html/DAMcreatorsintro.html');
    });
});
function switchContent(htmlPath) {
    if (htmlPath == currentPath)
        return;
    var container = $('#main-container');
    var duration = 200;
    currentPath = htmlPath;
    container.fadeOut(duration, function () {
        container.load(htmlPath, function () {
            container.fadeIn(duration);
        });
    });
}
