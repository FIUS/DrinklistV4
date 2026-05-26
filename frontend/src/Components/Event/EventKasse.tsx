import React, { useEffect, useState } from 'react'
import { Alert, Button, Stack, Typography } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { doGetRequest } from '../Common/StaticFunctions'
import { EventModeStatus } from '../../types/ResponseTypes'
import { EVENT_KASSE, EVENT_MARKE_KAUFEN, EVENT_MODE_DISABLED, EVENT_NEUER_GAST, EVENT_RESTGELD_AUSZAHLEN } from '../Common/Internationalization/i18n'
import style from './eventKasse.module.scss'

const EventKasse = () => {
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])

    const eventEnabled = status?.enabled === true

    return (
        <div className={style.container}>
            <Typography variant="h4">{EVENT_KASSE}</Typography>
            {status?.enabled === false ? (
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            ) : null}
            <Stack spacing={2} className={style.buttonStack}>     
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/event/kasse/checkout')}
                    disabled={!eventEnabled}
                >
                    {EVENT_KASSE}
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/event/kasse/new-guest')}
                    disabled={!eventEnabled}
                >
                    {EVENT_NEUER_GAST}
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/event/kasse/deposit')}
                    disabled={!eventEnabled}
                >
                    {EVENT_MARKE_KAUFEN}
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => navigate('/event/kasse/payout')}
                    disabled={!eventEnabled}
                >
                    {EVENT_RESTGELD_AUSZAHLEN}
                </Button>
            </Stack>
        </div>
    )
}

export default EventKasse
