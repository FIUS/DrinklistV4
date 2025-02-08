import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { Member } from '../../../types/ResponseTypes';
import { useDispatch } from 'react-redux';
import { ADMIN_PRIVILEGIEN, ADMIN_PRIVILEGIEN_GEAENDERT, AENDERE_NAME_ODER_ALIAS, AENDERN, ALIAS_AENDERN, ALIAS_GEAENDERT, FERTIG, NAME_GEAENDERT, NUTZERNAME_AENDERN, NUTZERNAME_NICHT_GEAENDERT, NUTZERNAME_NICHT_LEER, NUTZER_AENDERN } from '../../Common/Internationalization/i18n';
import { format } from 'react-string-format';
import style from './memberChange.module.scss'
import Spacer from '../../Common/Spacer';
import { openErrorToast, openToast, setMembers } from '../../../Actions/CommonAction';
import { Stack, Switch, Typography } from '@mui/material';

type Props = {
    isOpen: boolean,
    close: () => void,
    member: Member
}

const MemberNameEditDialog = (props: Props) => {

    const dispatch = useDispatch()
    const [username, setusername] = useState(props.member.name)
    const [alias, setalias] = useState(props.member.alias)

    useEffect(() => {
        setusername(props.member.name)
        setalias(props.member.alias)
    }, [props.member])

    const [invertedPrivileges, setinvertedPrivileges] = useState(false)
    const [disableButtons, setdisableButtons] = useState(false)

    return (
        <Dialog open={props.isOpen} onClose={() => { setinvertedPrivileges(false); props.close() }}>
            <DialogTitle>{NUTZER_AENDERN}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {format(AENDERE_NAME_ODER_ALIAS, props.member.name)}
                </DialogContentText>
                <Spacer vertical={30} />
                <div className={style.editMemberContainer}>
                    <div className={style.editMemberRow}>
                        <TextField
                            fullWidth
                            label={NUTZERNAME_AENDERN}
                            variant='standard'
                            value={username}
                            onChange={(value) => { setusername(value.target.value) }}
                        />
                        <Button onClick={() => {

                            if (username === "") {
                                dispatch(openToast({
                                    message: NUTZERNAME_NICHT_LEER,
                                    headline: NUTZERNAME_NICHT_GEAENDERT,
                                    type: "error"
                                }))
                                return
                            }
                            setdisableButtons(true)
                            doPostRequest(format("users/{0}/name", props.member.id), { name: username }).then(value => {
                                if (value.code === 200) {
                                    dispatch(openToast({ message: NAME_GEAENDERT }))
                                    doGetRequest("users").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setMembers(value.content))
                                        }
                                    })
                                    setinvertedPrivileges(false);
                                    props.close()
                                } else {
                                    dispatch(openErrorToast())
                                }
                                setdisableButtons(false)
                            })

                        }
                        } variant="contained">
                            {AENDERN}
                        </Button>
                    </div>
                    <div className={style.editMemberRow}>
                        <TextField
                            fullWidth
                            label={ALIAS_AENDERN}
                            variant='standard'
                            value={alias}
                            onChange={(value) => { setalias(value.target.value) }}
                        />
                        <Button onClick={() => {
                            setdisableButtons(true)
                            doPostRequest(format("users/{0}/alias", props.member.id), { alias: alias }).then(value => {
                                if (value.code === 200) {
                                    dispatch(openToast({ message: ALIAS_GEAENDERT }))
                                    doGetRequest("users").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setMembers(value.content))
                                        }
                                    })
                                    setinvertedPrivileges(false);
                                    props.close()
                                } else {
                                    dispatch(openErrorToast())
                                }
                                setdisableButtons(false)
                            })
                        }

                        } variant="contained">
                            {AENDERN}
                        </Button>
                    </div>
                    <Stack className={style.editMemberRow} flexDirection={"row"} spacing={2} alignItems={"baseline"} justifyContent={"space-between"}>
                        <Typography variant="button">
                            {ADMIN_PRIVILEGIEN}
                        </Typography>
                        <Switch color='success' sx={{
                            '& .MuiSwitch-switchBase': {
                                color: '#814040', // Thumb color when OFF
                            },
                        }}
                            checked={!invertedPrivileges ? props.member.isAdmin : !props.member.isAdmin}
                            disabled={disableButtons}
                            onChange={value => {
                                setdisableButtons(true)
                                doPostRequest(format("users/{0}/admin-privileges", props.member.id), { is_admin: value.currentTarget.checked }).then(value => {
                                    if (value.code === 200) {
                                        setinvertedPrivileges(!invertedPrivileges)
                                        dispatch(openToast({ message: ADMIN_PRIVILEGIEN_GEAENDERT }))
                                        doGetRequest("users").then((value) => {
                                            if (value.code === 200) {
                                                dispatch(setMembers(value.content))
                                            }
                                        })
                                    } else {
                                        dispatch(openErrorToast())
                                    }
                                    setdisableButtons(false)
                                })
                            }} />
                    </Stack>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => { setinvertedPrivileges(false); props.close() }}>{FERTIG}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default MemberNameEditDialog