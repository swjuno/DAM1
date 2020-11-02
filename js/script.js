"use strict";
var currentPath = "";
jQuery(function () {
    console.log('ready');
    $(".button_menu").on('mouseover', function () {
        console.log('hover');
    });
    $("#btn_owners").on('click', function () {
        switchContent('/html/DAM.html');
    });
});
function switchContent(filename) {
    if (filename == currentPath)
        return;
    var container = $('#main-container');
    var duration = 200;
    currentPath = filename;
    container.fadeOut(duration, function () {
        container.load('/html/' + filename, function () {
            container.fadeIn(duration);
        });
    });
}
