import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, List, ListItem, ListItemAvatar, ListItemText } from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { format } from 'react-string-format'
import { openErrorToast } from '../../../Actions/CommonAction'
import { Message } from '../../../types/ResponseTypes'
import { ALLES_KLAR, ERINNERE_SPAETER, ES_GIBT_NEUIGKEITEN, WAEHREND_DU_WEG_WARST } from '../../Common/Internationalization/i18n'
import { doRequest, getAndStore } from '../../Common/StaticFunctions'

type Props = {

}

const NewMessagesPopup = (props: Props) => {

    const [messages, setmessages] = useState<Array<Message>>([])
    const [dialogOpen, setdialogOpen] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        const cookie = Cookies.get("memberID")
        const memberID = cookie ? cookie : "-1"
        if (messages.length === 0) {
            getAndStore(format("users/{0}/messages", memberID), setmessages)
        }
    }, [messages.length])

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
                                    {value.emoji}
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary={value.text} secondary={value.memberNameFrom} />
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
                const cookie = Cookies.get("memberID")
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