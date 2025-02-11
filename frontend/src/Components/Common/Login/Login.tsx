import { Button, FormControl, TextField, Typography } from '@mui/material';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { openToast } from '../../../Actions/CommonAction';
import { BENUTZERNAME, FALSCHES_PASSWORT, FEHLER, LOGIN, PASSWORT } from '../Internationalization/i18n';
import Spacer from '../Spacer';
import { doGetRequest, doPostRequest } from '../StaticFunctions';
import style from './login.module.scss'

type Props = {}

const Login = (props: Props) => {
    const [searchParams,] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [disableLoginButton, setdisableLoginButton] = useState(false)
    const [username, setusername] = useState("")
    const [password, setpassword] = useState("")

    const clearCookies = () => {
        //clear only username and password cookies
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "memberID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        (function () {
            const cookies = document.cookie.split("; ");
            for (let c = 0; c < cookies.length; c++) {
                const d = window.location.hostname.split(".");
                while (d.length > 0) {
                    const cookieBase = encodeURIComponent(cookies[c].split(";")[0].split("=")[0]) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=' + d.join('.') + ' ;path=';
                    const p = window.location.pathname.split('/');
                    document.cookie = cookieBase + '/';
                    while (p.length > 0) {
                        document.cookie = cookieBase + p.join('/');
                        p.pop();
                    };
                    d.shift();
                }
            }
        })();
    }

    const login = () => {
        setdisableLoginButton(true);
        clearCookies();

        doPostRequest("login", { name: username, password: password }).then((value) => {
            if (value.code === 200) {
                const searchParam = searchParams.get("originalPath")
                const notNullSeachParam = searchParam !== null ? searchParam : "/";

                navigate(notNullSeachParam)
            } else {
                dispatch(openToast({ message: FALSCHES_PASSWORT, type: "error", headline: FEHLER }))
            }
            setdisableLoginButton(false)
        })
    }

    const loginOidc = async () => {
        setdisableLoginButton(true)
        clearCookies();
        doGetRequest("start-oidc").then(value => {
            if (value.code === 200) {
                console.log(value.content)
                window.location.href = value.content
            }

            setdisableLoginButton(false)
        })
    }

    const oidcButton = () => {
        if (window.globalTS.OIDC_BUTTON_TEXT === null || window.globalTS.OIDC_BUTTON_TEXT === undefined) {
            return
        }

        return <><Spacer vertical={20} />
            <Button
                size='large'
                variant='contained'
                onClick={() => {
                    loginOidc()
                }}
                disabled={disableLoginButton}
            >
                {window.globalTS.OIDC_BUTTON_TEXT}
            </Button></>
    }

    return (
        <div className={style.outterContainer}>
            <Typography variant="h3">{!searchParams.get("originalPath")?.includes("admin") ? window.globalTS.WELCOME_TEXT_0 : window.globalTS.WELCOME_TEXT_0_ADMIN}</Typography>
            <Typography variant="h4">{window.globalTS.WELCOME_TEXT_1}</Typography>
            <form className={style.textfield} noValidate autoComplete="off" onSubmit={(event) => { event.preventDefault(); login() }}>
                <FormControl className={style.form}>
                    <Spacer vertical={40} />
                    <TextField
                        fullWidth
                        label={BENUTZERNAME}
                        value={username}
                        onChange={(value) => { setusername(value.target.value) }}
                        autoFocus
                    />

                    <Spacer vertical={30} />
                    <TextField
                        fullWidth
                        label={PASSWORT}
                        type="password"
                        value={password}
                        onChange={(value) => { setpassword(value.target.value) }}
                    />
                    <Spacer vertical={40} />
                    <Button
                        size='large'
                        variant='contained'
                        onClick={() => {
                            login()
                        }}
                        disabled={disableLoginButton}
                        type='submit'
                    >
                        {LOGIN}
                    </Button>
                    {oidcButton()}
                </FormControl>
            </form>
        </div>
    )
}

export default Login
