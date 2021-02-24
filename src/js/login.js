$(()=> {
    let timeOut;
    let email = '';
    let id = '';
    let isEmailConfirmed = false;

    $("#submit").on ( 'click', function() {
        let id = $("#login").val();
        let pw = $("#password").val();
        console.log("id= "+id+" pw= "+pw);
        login(id,pw);
    });

    $('#verify-email').on('click',()=> {
        if(email!=='') return;

        showLoading();
        let _id = $("#reg_id").val();
        let _email = $('#email').val()
        if (validateEmail(_email)) {
            console.log('request sent');
            $.ajax({
                url: SERVER_ADDR+'/user/confirm_email',
                async: true,
                type: 'POST',
                data: {
                    id: _id,
                    email: _email
                },
                beforeSend : function(xhr){
                    xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                },
                error: () => {
                    showAlert("서버와의 통신에 실패했습니다", false);
                    hideLoading();
                },
                success: function(xhr) {
                    console.log(xhr);
                    if(xhr === 'id_duplicated') {
                        showAlert("이미 사용 중인 아이디입니다");
                    } else if(xhr === 'email_duplicated') {
                        showAlert("이미 사용 중인 이메일입니다");
                    } else if(xhr === 'success') {
                        showAlert("인증 코드가 이메일로 전송되었습니다", true);
                        $('#code-box').removeClass('hidden');
                        $('#verify-email').attr("disabled", true); 
                        $('#reg_id').attr("readonly", true);
                        $('#email').attr("readonly", true); 
                        email = _email;
                        id = _id;
                    }
                    hideLoading();
                }
            });
        } else {
            console.log('showAlert');
            showAlert("올바른 이메일이 아닙니다", false);
        }
    });

    $('#verify-code').on('click',()=> {
        if(email==='') return;
        
        let code = $('#code').val();
        if (code.length < 6) {
            showAlert("인증 코드가 올바르지 않습니다", false);
            return;
        }
        showLoading();
        console.log('request sent');
        $.ajax({
            url: SERVER_ADDR+'/user/confirm_email',
            async: true,
            type: 'GET',
            data: {
                email: email,
                code: code
            },
            beforeSend : function(xhr){
                xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            },
            error: () => {
                showAlert("서버와의 통신에 실패했습니다", false);
                hideLoading();
            },
            success: function(xhr) {
                console.log(xhr);
                if(xhr === 'failure') {
                    showAlert("인증 코드가 올바르지 않습니다", false);
                } else if(xhr === 'ok') {
                    showAlert("이메일 인증이 완료되었습니다",true);
                    $('#verify-code').attr("disabled",true);
                    $('#code').attr("readonly",true); 
                    isEmailConfirmed = true;
                }
                hideLoading();
            }
        });
    });

    $('#password_confirm').on('change keyup paste',()=> {
        if(isEmailConfirmed && $('#password_confirm').val().length>=8) {
            $('#submit_register').attr("disabled",false);
        } else {
            $('#submit_register').attr("disabled",true);
        }
    });

    $('#submit_register').on('click',()=> {
        let userName = $('#nickname').val();
        let pw = $('#reg_password').val();
        let pwConfirm = $('#password_confirm').val();

        if (userName==='') {
            showAlert("닉네임을 입력해주세요", false);
            return;
        }
        if ((pw==='' && pwConfirm==='') || (pw !== pwConfirm)) {
            showAlert("비밀번호가 일치하지 않습니다", false);
            return;
        }

        showLoading();
        $.ajax({
            url: SERVER_ADDR+'/user/register',
            async: true,
            type: 'POST',
            data: {
                id: id,
                email: email,
                username: userName,
                pw: pw
            },
            beforeSend : function(xhr){
                xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            },
            error: () => {
                showAlert("서버와의 통신에 실패했습니다", false);
                hideLoading();
            },
            success: function(xhr) {
                console.log(xhr);
                if(['email_verification_not_completed','id_or_email_duplicated'].includes(xhr)) {
                    showAlert("잘못된 요청입니다", false);
                } else if(xhr === 'success') {
                    alert('회원가입이 완료되었습니다.');
                    window.open('./login.html','_self');
                }
                hideLoading();
            }
        });
    });

    function login(id,pw) {
        showLoading();
        $.ajax({
            url: SERVER_ADDR+'/user/login',
            async: true,
            type: 'POST',
            data: {
                id: id,
                pw: pw
            },
            beforeSend : function(xhr){
                xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            },
            error: () => {
                showAlert("서버와의 통신에 실패했습니다.");
                hideLoading();
            },
            success: function(xhr) {
                hideLoading();
                console.log(xhr);
                if(xhr==='failure') {
                    showAlert();
                } else {
                    Cookies.set(ACCESS_TOKEN_KEY,xhr);
                    window.open('./main.html','_self');
                }
            }
        });
    }

    function validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
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

    function showAlert(alertText="ID나 비밀번호가 다릅니다.",isSuccess=false) {
        let overlay = $('.overlay.error');
        if(overlay.css('display')!=='none') { // 초기화
            overlay.css("display", "none").removeClass('slideAnimDown').removeClass('slideAnimUp');
            clearTimeout(timeOut);
        }
        overlay.css('background-color',isSuccess?'#5cb85c':'#ff6961')

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