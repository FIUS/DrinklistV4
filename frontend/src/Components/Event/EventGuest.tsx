import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { openErrorToast } from '../../Actions/CommonAction'
import { doGetRequest, doPostRequest } from '../Common/StaticFunctions'
import { EventGuestLoginResponse, EventModeStatus } from '../../types/ResponseTypes'
import { EVENT_GAST, EVENT_MODE_DISABLED, EVENT_SCANNEN } from '../Common/Internationalization/i18n'
import EventScanDialog from './EventScanDialog'
import Details from '../User/Details/Details'
import style from './eventGuest.module.scss'

const EventGuest = () => {
    const dispatch = useDispatch()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [scanOpen, setScanOpen] = useState(false)
    const [memberId, setMemberId] = useState<number | null>(null)
    const autoOpenedRef = useRef(false)

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])

    useEffect(() => {
        if (!autoOpenedRef.current && status?.enabled && memberId === null) {
            autoOpenedRef.current = true
            setScanOpen(true)
        }
    }, [memberId, status?.enabled])

    const handleScan = (code: string) => {
        setScanOpen(false)
        doPostRequest('event/guest/login', { code }).then((value) => {
            if (value.code === 200) {
                const response: EventGuestLoginResponse = value.content
                setMemberId(response.memberID)
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    if (status?.enabled === false) {
        return (
            <div className={style.container}>
                <Typography variant="h4">{EVENT_GAST}</Typography>
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            </div>
        )
    }

    return (
        <div className={style.container}>
            <Typography variant="h4">{EVENT_GAST}</Typography>
            {memberId === null ? (
                <Button variant="contained" onClick={() => setScanOpen(true)}>{EVENT_SCANNEN}</Button>
            ) : (
                <>
                    <Button variant="outlined" onClick={() => setScanOpen(true)}>{EVENT_SCANNEN}</Button>
                    <Details readOnly memberIdOverride={memberId.toString()} />
                </>
            )}
            <EventScanDialog
                open={scanOpen}
                title={EVENT_SCANNEN}
                onClose={() => setScanOpen(false)}
                onScanned={handleScan}
            />
        </div>
    )
}

export default EventGuest
