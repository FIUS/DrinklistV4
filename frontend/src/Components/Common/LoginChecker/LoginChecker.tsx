import Cookies from 'js-cookie';
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { setLoginState } from '../../../Actions/CommonAction';
import { doGetRequest } from '../StaticFunctions';

type Props = {}

const LoginChecker = (props: Props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (location.pathname.startsWith("/event") ||
            location.pathname.startsWith("/login/qr") ||
            location.pathname.startsWith("/message") ||
            location.pathname.startsWith("/config")) {
            return
        }

        let isActive = true

        const checkLogin = async () => {
            const config = await doGetRequest("config/status")
            if (!isActive) {
                return
            }

            if (config.code === 200 && config.content === 0) {
                dispatch(setLoginState(false))
                navigate("/config/start", { replace: true })
                return
            }

            if (location.pathname.startsWith("/login")) {
                return
            }

            const requestString = location.pathname.startsWith("/admin") ? "login/admin/check" : "login/check"
            const value = await doGetRequest(requestString)
            if (!isActive) {
                return
            }

            if (value.code !== 200) {
                navigate("/login?originalPath=" + location.pathname, { replace: true })
                dispatch(setLoginState(false))
            } else {
                dispatch(setLoginState(true))

                const memberID = Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID");
                const memberIDSafe = memberID !== undefined ? parseInt(memberID) : 0;
                const isAdmin = Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "isAdmin") == "True";

                if (memberIDSafe > 2 && !isAdmin) {
                    navigate("/user/" + Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID"))
                }
            }
        }

        checkLogin()

        return () => {
            isActive = false
        }

    }, [location.pathname, navigate, dispatch])

    return (
        <></>
    )
}

export default LoginChecker
