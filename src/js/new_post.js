$(()=> {
    $('#button_write').on('click',()=> {
        let title = $('#title').val();
        let content = window.editor.getData();

        if(title.length<=0||[null,undefined].includes(title)) {
            alert('제목을 작성해주세요.');
            return;
        }
        if(content.length<=0||[null,undefined].includes(content)) {
            alert('내용을 작성해주세요.');
            return;
        }

        $.ajax({
            url: SERVER_ADDR+'/board/free_board',
            async: true,
            type: 'POST',
            data: {
                title: title,
                content: content
            },
            headers: {
                'Content-type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer '+Cookies.get(ACCESS_TOKEN_KEY)
            },
            error: (xhr) => {
                alert("서버와의 통신에 실패했습니다.");
            },
            success: function(xhr) {
                console.log(xhr);
                alert("새 글이 등록되었습니다.");
                window.open('./main.html','_self');
            }
        });
    });
});