
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

firebase.initializeApp(firebaseConfig);
let fb = firebase.default;
fb.auth().useDeviceLanguage();
var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
            return true;
        },
        uiShown: function() {
            document.getElementById('loader').style.display = 'none';
        }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: '/auth/success',
    signInOptions: [
        fb.auth.EmailAuthProvider.PROVIDER_ID,
        fb.auth.GoogleAuthProvider.PROVIDER_ID,
        fb.auth.FacebookAuthProvider.PROVIDER_ID,
        fb.auth.GithubAuthProvider.PROVIDER_ID,
        {
            provider: fb.auth.PhoneAuthProvider.PROVIDER_ID,
            recaptchaParameters: {
                type: 'image', // 'audio'
                size: 'normal', // 'invisible' or 'compact'
                badge: 'bottomleft' //' bottomright' or 'inline' applies to invisible.
            },
            defaultCountry: 'KR',
            defaultNationalNumber: '+82',
        }
    ],

    /*
    tosUrl: '<your-tos-url>', 
  
    privacyPolicyUrl: function () { 
        window.location.assign( 
                '#'); 
    }, 
    */

    callbacks: { 
        signInSuccess: function (user,credential, redirectUrl) { 
            user.getIdToken().then(function (idToken) {
                $.ajax({
                    type: 'POST',
                    url: `/savecookie/${idToken}`
                })
            }).catch(error => {
                console.log(error);
            });
        }
    }
}; 

const ui = new firebaseui.auth.AuthUI(firebase.auth()); 
ui.start('#auth-container', uiConfig); 