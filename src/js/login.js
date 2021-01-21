$(()=> {
    let timeOut;

    $("#submit").on ( 'click', function() {
        let id = $("#login").val();
        let pw = $("#password").val();
        login(id,pw);
    });
    function login(id,pw) {
        showLoading();
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
            error: (xhr) => {
                showAlert("서버와의 통신에 실패했습니다.");
                hideLoading();
            },
            success: function(xhr) {
                hideLoading();
                console.log(xhr);
                if(xhr=='failure') {
                    showAlert();
                } else {
                    let accessToken = xhr;
                    Cookies.set('access_token',accessToken);
                    window.open('./DAM.html','_self');
                }
            }
        });
    }

    function showLoading() {
        let height = $('#formContent').height()
        $('.overlay.loading').height(height).css('line-height',height).css("display", "flex").addClass('fadeInOverlay');
    }

    function hideLoading() {
        let overlay = $('.overlay.loading');
        overlay.removeClass('fadeInOverlay');
        overlay.addClass('fadeOut');
        timeOut = setTimeout(()=> {
            overlay.css("display", "none").removeClass('fadeOut');
        },450);
    }

    function showAlert(alertText="ID나 비밀번호가 다릅니다.") {
        let overlay = $('.overlay.error');
        if(overlay.css('display')!='none') { // 초기화
            overlay.css("display", "none").removeClass('slideAnimDown').removeClass('slideAnimUp');
            clearTimeout(timeOut);
        }
        overlay.text(alertText);
        overlay.css("display", "block").addClass('slideAnimDown');
        timeOut = setTimeout(()=> {
            overlay.removeClass('slideAnimDown');
            overlay.addClass('slideAnimUp');
            timeOut = setTimeout(()=> {
                overlay.css("display", "none").removeClass('slideAnimUp');
            },450);
        },1500);
    }
});