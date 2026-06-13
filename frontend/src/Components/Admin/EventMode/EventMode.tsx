import React, { useEffect, useState } from 'react'
import { Alert, Button, Paper, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { doGetRequest } from '../../Common/StaticFunctions'
import { useDispatch } from 'react-redux'
import { openErrorToast } from '../../../Actions/CommonAction'
import { EventModeStatus } from '../../../types/ResponseTypes'
import { EVENT_GAST, EVENT_KASSE, EVENT_MODE, EVENT_MODE_DISABLED, EVENT_QR_ANZEIGEN, EVENT_ZUSAMMENFASSUNG, OEFFNEN } from '../../Common/Internationalization/i18n'
import style from './eventMode.module.scss'

type EventCardProps = {
    title: string,
    onOpen: () => void,
    onShowQr?: () => void,
    enabled: boolean
}

const EventCard = (props: EventCardProps) => {
    return (
        <Paper className={style.card} elevation={2}>
            <Typography variant="h5">{props.title}</Typography>
            <Stack spacing={1} className={style.cardActions}>
                <Button variant="contained" onClick={props.onOpen} disabled={!props.enabled}>{OEFFNEN}</Button>
                {props.onShowQr ? (
                    <Button variant="outlined" onClick={props.onShowQr} disabled={!props.enabled}>{EVENT_QR_ANZEIGEN}</Button>
                ) : null}
            </Stack>
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

    const dispatch = useDispatch()

    const openEvent = async (targetPath: string) => {
        const resp = await doGetRequest('event/secret')
        if (resp.code === 200 && resp.content && resp.content.secret) {
            const secret = resp.content.secret
            if (targetPath === 'guest') {
                navigate('/event/guest')
            } else {
                navigate(`/event/${secret}/${targetPath}`)
            }
        } else {
            if (resp.code === 403) {
                dispatch(openErrorToast())
            }
            navigate('/admin/event-mode')
        }
    }

    return (
        <div className={style.container}>
            <Typography variant="h4">{EVENT_MODE}</Typography>
            {!loading && status?.enabled === false ? (
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            ) : null}
            <div className={style.cardRow}>
                <EventCard
                    title={EVENT_KASSE}
                    onOpen={() => openEvent('kasse')}
                    onShowQr={() => navigate('/admin/event-mode/qr/kasse')}
                    enabled={enabled}
                />
                <EventCard
                    title={EVENT_GAST}
                    onOpen={() => openEvent('guest')}
                    onShowQr={() => navigate('/admin/event-mode/qr/guest')}
                    enabled={enabled}
                />
                <EventCard
                    title={EVENT_ZUSAMMENFASSUNG}
                    onOpen={() => navigate('/admin/event-mode/summary')}
                    enabled={enabled}
                />
            </div>
        </div>
    )
}

export default EventMode
