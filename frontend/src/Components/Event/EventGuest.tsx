import React, { useEffect, useRef, useState } from 'react'
import { Badge, QrCodeScanner } from '@mui/icons-material'
import { Alert, Avatar, Button, Paper, Typography } from '@mui/material'
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
                    <Paper className={style.scanCard} elevation={2}>
                        <Avatar className={style.scanIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                            <Badge />
                        </Avatar>
                        <div>
                            <Typography variant="overline" color="text.secondary">Event Mode</Typography>
                            <Typography variant="h3">{EVENT_GAST}</Typography>
                            <Typography variant="body1" color="text.secondary">
                                Scanne deine Guthabenkarte, um Kontostand und Käufe zu sehen.
                            </Typography>
                        </div>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<QrCodeScanner />}
                            onClick={() => setScanOpen(true)}
                            disabled={lookupLoading}
                        >
                            {EVENT_SCANNEN}
                        </Button>
                    </Paper>
                </div>
            ) : (
                <Details readOnly memberIdOverride={memberId.toString()} />
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
