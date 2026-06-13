import React, { useEffect, useRef, useState } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { openErrorToast } from '../../Actions/CommonAction'
import { doGetRequest, doPostRequest } from '../Common/StaticFunctions'
import { EventGuestResponse, EventModeStatus } from '../../types/ResponseTypes'
import { EVENT_GAST, EVENT_MODE_DISABLED, EVENT_SCANNEN } from '../Common/Internationalization/i18n'
import EventScanDialog from './EventScanDialog'
import Details from '../User/Details/Details'
import style from './eventGuest.module.scss'

const EventGuest = () => {
    const dispatch = useDispatch()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [scanOpen, setScanOpen] = useState(false)
    const [memberId, setMemberId] = useState<number | null>(null)
    const [lookupLoading, setLookupLoading] = useState(false)
    const autoOpenedRef = useRef(false)

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])


    useEffect(() => {
        if (!autoOpenedRef.current && status?.enabled && memberId === null && !lookupLoading) {
            autoOpenedRef.current = true
            setScanOpen(true)
        }
    }, [memberId, status?.enabled, lookupLoading])

    const handleScan = (code: string) => {
        setScanOpen(false)
        setLookupLoading(true)
        // Use public lookup to display read-only guest details without requiring the event secret
        return doPostRequest('event/guest/login', { code }).then((value) => {
            if (value.code === 200) {
                const payload: EventGuestResponse = value.content
                if (payload && payload.member && payload.member.id) {
                    setMemberId(payload.member.id)
                } else {
                    dispatch(openErrorToast())
                }
            } else if (value.code === 404) {
                dispatch(openErrorToast())
            } else {
                dispatch(openErrorToast())
            }
        }).finally(() => setLookupLoading(false))
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
        <>

            {memberId === null ? (
                <div className={style.scanCenter}>
                    <Button variant="contained" size="large" onClick={() => setScanOpen(true)} disabled={lookupLoading}>{EVENT_SCANNEN}</Button>
                </div>
            ) : (
                <>
                    <Details readOnly memberIdOverride={memberId.toString()} />
                </>
            )}

            <EventScanDialog
                open={scanOpen}
                title={EVENT_SCANNEN}
                onClose={() => setScanOpen(false)}
                onScanned={handleScan}
            />

        </>
    )
}

export default EventGuest
