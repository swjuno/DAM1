import * as express from 'express';
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebaseConfig = { // Firebase 설정
    apiKey: "AIzaSyBYA-tzlgF8vGhmzdoNMTUHOvgSE_-7rus",
    authDomain: "dam-application-b2b65.firebaseapp.com",
    databaseURL: "https://dam-application-b2b65.firebaseio.com",
    projectId: "dam-application-b2b65",
    storageBucket: "dam-application-b2b65.appspot.com",
    messagingSenderId: "670681084026",
    appId: "1:670681084026:web:785642c820ecd727b70bc3",
    measurementId: "G-QSTPY2T9HJ"
};

const fb = firebase.default;
fb.initializeApp(firebaseConfig); // Firebase 시작
const db = fb.firestore();
const router = express.Router();

router.post('/savecookie/:idToken', (req, res) => {
    res.cookie('idToken',(req.params.idToken as string),{
        maxAge: 60*60*24*50,
    });
});

router.post('/checkcookie/:idToken', (req, res) => {
    let isCookied = false;
    if(req.cookies['idToken']) {
        isCookied = true;
    }
    res.json({response:isCookied});
});

router.post('/free_board/:index', (req, res) => { // 자유게시판 글 목록 요청 처리
    const showCount = 10; // 한 페이지에 보여줄 글 개수
    //let index = req.body.index as number;
    const index = +req.params.index;
    const from = (index-1)*10; // 리턴할 페이지 시작
    const rangeArr = range(showCount,from);
    let returnList = new Array(); // 반환할 배열 선언

    db.collection('free_board').get() // DB 'free_board' 컬렉션 읽기
        .then((snapshot) => { // 읽기 성공시
            let i=0;
            snapshot.forEach((doc) => { // 값들 하나씩 꺼내옴
                i++;
                if(rangeArr.includes(i)) { // 페이지에 표시할 내용 필터링
                    let data = {
                        title: doc.get('title') as string,
                        content: doc.get('content') as string,
                        writer: doc.get('writer') as string,
                        views: doc.get('views') as number,
                        date: doc.get('date')
                    }
                    returnList.push(data); // 반환값에 추가
                }
            });
            res.json(returnList); // 불러온 데이터 반환
        })
        .catch((err) => {
            console.log('Error getting documents', err); // 에러 발생시 로그
        });
});

function range(size:number, startAt = 0) {
    return [...Array<number>(size).keys()].map(i => i + startAt);
}

module.exports = router;