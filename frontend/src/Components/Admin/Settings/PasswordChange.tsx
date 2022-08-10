import { Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { openErrorToast, openToast } from '../../../Actions/CommonAction'
import { NEUES_PASSWORT_FESTLEGEN, PASSWORD_MIN_LAENGE, PASSWORT_GEAENDERT, PASSWORT_ZU_KURZ } from '../../Common/Internationalization/i18n'
import { doPostRequest } from '../../Common/StaticFunctions'
import style from './settings.module.scss'
import { format } from 'react-string-format';

type Props = {
    textfielLabel: string,
    requestPath: string
}

const PasswordChange = (props: Props) => {
    const [text, settext] = useState("")
    const dispatch = useDispatch()
    const minPasswordLength = 6
    return (
        <div className={style.passwordRow}>
            <TextField
                label={props.textfielLabel}
                value={text}
                onChange={(value) => settext(value.target.value)}
                type="password"
            />
            <Button onClick={() => {
                if (text.length > minPasswordLength - 1) {
                    doPostRequest(props.requestPath, { password: text }).then((value) => {
                        if (value.code === 200) {
                            dispatch(openToast({ message: PASSWORT_GEAENDERT }))
                            settext("")
                        } else {
                            dispatch(openErrorToast())
                        }
                    })
                } else {
                    dispatch(openToast({ headline: PASSWORT_ZU_KURZ, message: format(PASSWORD_MIN_LAENGE, minPasswordLength), type: "error" }))
                }
            }}
                variant="outlined"
            >
                {NEUES_PASSWORT_FESTLEGEN}
            </Button>
        </div>
    )
}

export default PasswordChange