$(function() {
    let timeOut;

    $("#submit").on ( 'click', function() {
        let id = $("#login").val();
        let pw = $("#password").val();
        $.ajax({
            url: 'http://localhost:8080/user/login',
            async: true,
            type: 'POST',
            data: {
                id: id,
                pw: pw
            },
            beforeSend : function(xhr){
                xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            },
            success: function(xhr) {
                console.log(xhr);
                if(xhr=='failure') {
                    let overlay = $('.overlay.error');
                    if(overlay.css('display')!='none') { // 초기화
                        overlay.css("display", "none").removeClass('slideAnimDown').removeClass('slideAnimUp');
                        clearTimeout(timeOut);
                    }
                    overlay.css("display", "block").addClass('slideAnimDown');
                    timeOut = setTimeout(()=> {
                        overlay.removeClass('slideAnimDown');
                        overlay.addClass('slideAnimUp');
                        timeOut = setTimeout(()=> {
                            overlay.css("display", "none").removeClass('slideAnimUp');
                        },450);
                    },1500);
                } else {
                    let accessToken = xhr;
                    Cookies.set('access_token',accessToken);
                    window.open('/DAM.html','_self');
                }
            }
        });
    });
});