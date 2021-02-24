$(()=>{
    let accessToken = Cookies.get(ACCESS_TOKEN_KEY);

    $("#name").text(parseJwt(accessToken).name)
    $("#userid").text(parseJwt(accessToken).id)

})