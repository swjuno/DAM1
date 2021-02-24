$(()=>{
    let accessToken = Cookies.get(ACCESS_TOKEN_KEY);

    /*
     * 유저 정보 쿠키로부터 로드 후 적용
     */
    const userName = parseJwt(accessToken).name
    $("#name").text(userName)
    $("#t-name").text(userName)
    $("#userid").text(parseJwt(accessToken).id)
    
    /*
     * 비밀번호 변경 버튼 로직
     */
    $("#button-change-pw").on('click',()=> {

    })
})