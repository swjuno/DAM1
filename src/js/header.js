$(()=> {
    // ...header, footer 설정
    $('.header').load('./header.html',()=> { // 헤더 로딩 끝나면 관련 이벤트 리스너 설정
        new MobileMenu();
        $(".hamburger-icon").on('click',function () {
            if($('.searchlayout').isSlideDown()) {
                $('.searchlayout').slideToggle();
            }
            $('.menulayout').slideToggle();
            $('.menulayout').css('display', 'flex');
        });
        
        $(".search_btn").on('click',function () {
            if($('.menulayout').isSlideDown()) {
                $('.menulayout').slideToggle();
                $('.hamburger-icon').removeClass('hamburger-icon--close')
            }
            $('.searchlayout').slideToggle();
        });

        let accessToken = Cookies.get(ACCESS_TOKEN_KEY); // 로그인 확인
        if([undefined,null].includes(accessToken)) { // 로그인 토큰 미존재시
            if(![undefined,null].includes($('#welcome-new-user'))) {
                $('#welcome-new-user').css('display','block');
            }
            $('.tab.login').css('display','block');
            $('.tab.logout').css('display','none');
        } else { // 로그인 토큰 존재시
            $('.tab.login').css('display','none');
            $('.tab.logout').css('display','block');
        }
        $('.tab.logout').on('click',()=> {
            let accessToken = Cookies.get(ACCESS_TOKEN_KEY);
            if([undefined,null].includes(accessToken)) { // sanityCheck
                alert('유효하지 않은 요청입니다.');
                return;
            }
            Cookies.remove(ACCESS_TOKEN_KEY);
            window.open('./main.html','_self');
        });
    });
    $('.footer').load('./footer.html');

    $('#logo').on("click",function (){
        location.href= './main.html';
    })

    $.fn.isSlideDown = function() {
        return $(this).css('display') != 'none';
    }

    // ...메뉴
    class MobileMenu {
        constructor() {
            this.hamburgerIcon = document.querySelector(".hamburger-icon");
            this.events();
        }
    
        events() {
            this.hamburgerIcon.addEventListener("click", () => this.toggleTheMenu());
        }
    
        toggleTheMenu() {
            this.hamburgerIcon.classList.toggle("hamburger-icon--close");
        }
    }
});