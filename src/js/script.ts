let currentPath:string="";

jQuery(function() {
    console.log('ready');
    $(".button_menu").on ( 'mouseover', function() {
        console.log('hover');
    });

    $("#btn_owners").on('click', function() {
        switchContent('/html/DAMcreatorsintro.html')
    });
});

function switchContent(filename:string) {
    if(filename==currentPath) return;
    let container = $('#main-container');
    let duration:number = 200;
    currentPath = filename;
    container.fadeOut(duration,function() {
        container.load('/html/'+filename,function() {
            container.fadeIn(duration);
        });
    });
}