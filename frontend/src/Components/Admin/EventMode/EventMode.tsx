import React, { useEffect, useState } from 'react'
import { Alert, Button, Paper, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { doGetRequest } from '../../Common/StaticFunctions'
import { EventModeStatus } from '../../../types/ResponseTypes'
import { EVENT_GAST, EVENT_KASSE, EVENT_MODE, EVENT_MODE_DISABLED, EVENT_QR_ANZEIGEN, OEFFNEN } from '../../Common/Internationalization/i18n'
import style from './eventMode.module.scss'

const buildFrontendBase = (frontendDomain: string | null) => {
    if (frontendDomain === null || frontendDomain.trim() === '') {
        return window.location.origin
    }

    const trimmed = frontendDomain.trim()
    const normalized = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `http://${trimmed}`

    return normalized.replace(/\/+$/, '')
}

type EventCardProps = {
    title: string,
    url: string,
    onOpen: () => void,
    onShowQr: () => void,
    enabled: boolean
}

const EventCard = (props: EventCardProps) => {
    return (
        <Paper className={style.card} elevation={2}>
            <Typography variant="h5">{props.title}</Typography>
            <Typography variant="body2" className={style.url}>{props.url}</Typography>
            <div className={style.cardActions}>
                <Button variant="contained" onClick={props.onOpen} disabled={!props.enabled}>{OEFFNEN}</Button>
                <Button variant="outlined" onClick={props.onShowQr} disabled={!props.enabled}>{EVENT_QR_ANZEIGEN}</Button>
            </div>
        </Paper>
    )
}

const EventMode = () => {
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        }).finally(() => {
            setLoading(false)
        })
    }, [])

    const enabled = status?.enabled === true
    const baseUrl = buildFrontendBase(status?.frontendDomain ?? null)
    const kasseUrl = `${baseUrl}/event/kasse`
    const guestUrl = `${baseUrl}/event/guest`

    return (
        <div className={style.container}>
            <Typography variant="h4">{EVENT_MODE}</Typography>
            {!loading && status?.enabled === false ? (
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            ) : null}
            <div className={style.cardRow}>
                <EventCard
                    title={EVENT_KASSE}
                    url={kasseUrl}
                    onOpen={() => navigate('/event/kasse')}
                    onShowQr={() => navigate('/admin/event-mode/qr/kasse')}
                    enabled={enabled}
                />
                <EventCard
                    title={EVENT_GAST}
                    url={guestUrl}
                    onOpen={() => navigate('/event/guest')}
                    onShowQr={() => navigate('/admin/event-mode/qr/guest')}
                    enabled={enabled}
                />
            </div>
        </div>
    )
}

export default EventMode
