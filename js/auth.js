import { 
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import { auth } from "./firebase-config.js";

const loginBtn = document.getElementById("loginBtn");
const status = document.getElementById("status");

const provider = new GoogleAuthProvider();

loginBtn.addEventListener("click", async () => {

    loginBtn.disabled = true;

    status.textContent = "正在開啟 Google 登入...";

    try {

        const result = await signInWithPopup(auth, provider);

        const user = result.user;

        status.textContent =
            `登入成功：${user.email}`;

        /*
         * 下一步會改成：
         *
         * 登入成功
         * ↓
         * register.html
         */

        setTimeout(() => {
            window.location.href = "register.html";
        }, 800);

    } catch (error) {

        console.error(error);

        status.textContent =
            "登入失敗，請再試一次。";

        loginBtn.disabled = false;
    }

});
