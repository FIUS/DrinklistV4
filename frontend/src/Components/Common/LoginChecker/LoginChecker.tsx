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
        let requestString = ""
        if (location.pathname.startsWith("/admin")) {
            requestString = "login/admin/check"
        } else if (!location.pathname.startsWith("/login")) {
            requestString = "login/check"
        } else {
            return
        }

        doGetRequest(requestString).then((value) => {
            if (value.code !== 200) {
                navigate("/login?originalPath=" + location.pathname)
                dispatch(setLoginState(false))
            } else {
                dispatch(setLoginState(true))

                const memberID = Cookies.get("memberID");
                const notUndefined = memberID !== undefined ? parseInt(memberID) : 0;

                if (notUndefined > 2) {
                    navigate("/user/" + Cookies.get("memberID"))
                }
            }
        })

    }, [location.pathname, navigate, dispatch])

    return (
        <></>
    )
}

export default LoginChecker