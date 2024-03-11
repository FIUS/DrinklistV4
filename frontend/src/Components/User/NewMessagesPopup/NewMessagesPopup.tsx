import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemButton, ListItemText } from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { format } from 'react-string-format'
import { openErrorToast, setHistory, setMembers } from '../../../Actions/CommonAction'
import { Message } from '../../../types/ResponseTypes'
import { ALLES_KLAR, ERINNERE_SPAETER, ES_GIBT_NEUIGKEITEN, UEBERWEISEN, WAEHREND_DU_WEG_WARST } from '../../Common/Internationalization/i18n'
import { doGetRequest, doPostRequest, doRequest, getAndStore } from '../../Common/StaticFunctions'

type Props = {

}

const NewMessagesPopup = (props: Props) => {

    const [messages, setmessages] = useState<Array<Message>>([])
    const [dialogOpen, setdialogOpen] = useState(false)
    const [requestInProgress, setrequestInProgress] = useState(false)
    const dispatch = useDispatch()
    const location = useLocation()

    useEffect(() => {
        const cookie = Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID")
        const memberID = cookie ? cookie : "-1"
        if (messages.length === 0) {
            getAndStore(format("users/{0}/messages", memberID), setmessages)
        }
    }, [messages.length, location.pathname])

    useEffect(() => {
        if (messages.length > 0) {
            setdialogOpen(true)
        }
    }, [messages.length])

    return <Dialog open={dialogOpen} >
        <DialogTitle>{ES_GIBT_NEUIGKEITEN}</DialogTitle>
        <DialogContent>
            <DialogContentText>
                {WAEHREND_DU_WEG_WARST}
            </DialogContentText>
            <List sx={{}}>
                {messages.map(value => {
                    return <>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar>
                                    {!value.request ? value.emoji : "💸"}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={value.text} secondary={value.memberNameFrom} />

                            {value.request ?
                                <ListItemButton onClick={() => {
                                    setrequestInProgress(true)
                                    const cookie = Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID")
                                    const memberID = parseInt(cookie ? cookie : "-1");
                                    const from = memberID;
                                    const to = value.request?.to ? value.request?.to : -1;
                                    const amount = value.request?.amount ? value.request?.amount : 0;
                                    const reason = value.text;
                                    const emoji = "💸";

                                    let payload: { amount: number, emoji: string } | { amount: number, reason: string, emoji: string } = { amount: amount, emoji: emoji }
                                    if (reason !== null && reason !== "") {
                                        payload = { ...payload, reason: reason }
                                    }

                                    doPostRequest(format("users/{0}/transfer/{1}", from, to), payload).then(() => {
                                        doGetRequest("users/" + memberID + "/history").then((value) => {
                                            if (value.code === 200) {
                                                dispatch(setHistory(value.content))
                                            }
                                        })
                                        doGetRequest("users").then((value) => {
                                            if (value.code === 200) {
                                                dispatch(setMembers(value.content))
                                            }
                                        })
                                        doRequest("DELETE", format("users/{0}/messages/{1}", memberID, value.id), {}).then(() => {
                                            getAndStore(format("users/{0}/messages", memberID), setmessages)
                                            setrequestInProgress(false)
                                        })
                                    })
                                }} disabled={requestInProgress}>
                                    {UEBERWEISEN}
                                </ListItemButton>
                                : <></>}
                        </ListItem>
                    </>
                })}
            </List>

        </DialogContent>
        <DialogActions>
            <Button onClick={() => {
                setdialogOpen(false)
            }}>
                {ERINNERE_SPAETER}
            </Button>
            <Button onClick={() => {
                const cookie = Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + "memberID")
                const memberID = cookie ? cookie : "-1"

                doRequest("DELETE", format("users/{0}/messages", memberID), {}).then(value => {
                    if (value.code !== 200) {
                        dispatch(openErrorToast())
                    }
                    setdialogOpen(false)
                })
            }}>
                {ALLES_KLAR}
            </Button>
        </DialogActions>
    </Dialog >

}

export default NewMessagesPopup