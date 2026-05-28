import React, { useEffect, useState } from 'react'
import { Alert, Button, IconButton, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate } from 'react-router-dom'
import { doGetRequest, doPostRequest } from '../Common/StaticFunctions'
import { EventModeStatus, Transaction } from '../../types/ResponseTypes'
import { ENTFERNEN, EVENT_KASSE, EVENT_MARKE_KAUFEN, EVENT_MODE_DISABLED, EVENT_NEUER_GAST, EVENT_RESTGELD_AUSZAHLEN, LETZTE_KAEUFE, NICHT_DEINE_TRANSAKTION, TRANSAKTION_RUECKGAENIG, ZEITLIMIT_ABGELAUFEN } from '../Common/Internationalization/i18n'
import { useDispatch } from 'react-redux'
import { openErrorToast, openToast } from '../../Actions/CommonAction'
import style from './eventKasse.module.scss'

const EventKasse = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [transactions, setTransactions] = useState<Array<Transaction>>([])

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])

    const eventEnabled = status?.enabled === true

    const fetchTransactions = () => {
        doGetRequest('event/transactions/limit/20').then((value) => {
            if (value.code === 200) {
                setTransactions(value.content)
            }
        })
    }

    useEffect(() => {
        if (!eventEnabled) {
            return
        }
        fetchTransactions()
    }, [eventEnabled])

    const undoTransaction = (transactionId: number) => {
        doPostRequest(`event/transactions/${transactionId}/undo`, null).then((value) => {
            if (value.code === 200) {
                setTransactions((prev) => prev.filter((item) => item.id !== transactionId))
                dispatch(openToast({ message: TRANSAKTION_RUECKGAENIG }))
            } else if (value.content === 'TooLate') {
                dispatch(openToast({ message: ZEITLIMIT_ABGELAUFEN }))
            } else if (value.content === 'NotYourTransaction') {
                dispatch(openToast({ message: NICHT_DEINE_TRANSAKTION }))
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const isDeletableTransaction = (transaction: Transaction) => {
        return !transaction.partOfCheckout
    }

    const groupedTransactions = transactions.reduce((groups: Array<{ time: string, items: Array<Transaction> }>, transaction) => {
        const existingGroup = groups.find((group) => group.time === transaction.date)
        if (existingGroup) {
            existingGroup.items.push(transaction)
            return groups
        }

        groups.push({
            time: transaction.date,
            items: [transaction]
        })
        return groups
    }, [])

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

            <Paper className={style.section} elevation={2}>
                <Typography variant="h6">{LETZTE_KAEUFE}</Typography>
                {transactions.length === 0 ? (
                    <Typography variant="body2">-</Typography>
                ) : (
                    <Stack spacing={1.5}>
                        {groupedTransactions.map((group) => (
                            <Paper key={group.time} className={style.transactionGroup} elevation={1}>
                                <Typography variant="caption" className={style.groupTimestamp}>{group.time}</Typography>
                                <List dense>
                                    {group.items.map((transaction) => (
                                        <ListItem
                                            key={transaction.id}
                                            secondaryAction={isDeletableTransaction(transaction)
                                                ? (
                                                    <IconButton edge="end" onClick={() => undoTransaction(transaction.id)} aria-label={ENTFERNEN}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                )
                                                : undefined}
                                        >
                                            <ListItemText
                                                primary={`${transaction.description} (${transaction.amount.toFixed(2)} EUR)`}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Paper>
        </div>
    )
}

export default EventKasse
