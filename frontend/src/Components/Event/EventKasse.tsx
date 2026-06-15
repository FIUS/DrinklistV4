import React, { useCallback, useEffect, useState } from 'react'
import { AccountBalanceWallet, AddCard, PersonAdd, PointOfSale, ReceiptLong } from '@mui/icons-material'
import { Alert, Avatar, Button, IconButton, List, ListItem, ListItemText, Paper, Stack, Typography, Skeleton } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNavigate, useParams } from 'react-router-dom'
import { doGetRequest, doGetRequestWithEventSecret, doPostRequestWithEventSecret } from '../Common/StaticFunctions'
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
    const [transactionsLoading, setTransactionsLoading] = useState(true)
    const [undoingIds, setUndoingIds] = useState<number[]>([])

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])

    const eventEnabled = status?.enabled === true
    const params = useParams()
    const secret = params.secret

    const fetchTransactions = useCallback(() => {
        setTransactionsLoading(true)
        doGetRequestWithEventSecret('event/transactions/limit/20', secret).then((value) => {
            if (value.code === 200) {
                setTransactions(value.content)
            } else if (value.code === 403) {
                dispatch(openErrorToast())
            }
        }).finally(() => setTransactionsLoading(false))
    }, [dispatch, secret])

    useEffect(() => {
        if (!eventEnabled) {
            return
        }
        fetchTransactions()
    }, [eventEnabled, fetchTransactions])

    const undoTransaction = (transactionId: number) => {
        setUndoingIds((prev) => [...prev, transactionId])
        doPostRequestWithEventSecret(`event/transactions/${transactionId}/undo`, null, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                return
            }
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
        }).finally(() => {
            setUndoingIds((prev) => prev.filter((id) => id !== transactionId))
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
        <main className={style.container}>
            <header className={style.header}>
                <div className={style.titleBlock}>
                    <Avatar className={style.heroIcon} sx={{ bgcolor: window.globalTS.ICON_COLOR }}>
                        <PointOfSale />
                    </Avatar>
                    <div>
                        <Typography variant="overline" color="text.secondary">Event Mode</Typography>
                        <Typography variant="h3">{EVENT_KASSE}</Typography>
                        <Typography variant="body1" color="text.secondary">
                            Verkäufe und Guthabenkarten schnell abwickeln.
                        </Typography>
                    </div>
                </div>
            </header>
            {status?.enabled === false ? (
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            ) : null}
            <div className={style.contentGrid}>
                <Paper className={style.actionPanel} elevation={2}>
                    <Typography variant="h5">Aktionen</Typography>
                    <Typography variant="body2" color="text.secondary">Was möchtest du als Nächstes tun?</Typography>
                    <div className={style.actionGrid}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<PointOfSale />}
                            onClick={() => navigate(`/event/${secret}/kasse/checkout`)}
                            disabled={!eventEnabled}
                        >
                            Verkauf
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<PersonAdd />}
                            onClick={() => navigate(`/event/${secret}/kasse/new-guest`)}
                            disabled={!eventEnabled}
                        >
                            {EVENT_NEUER_GAST}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<AddCard />}
                            onClick={() => navigate(`/event/${secret}/kasse/deposit`)}
                            disabled={!eventEnabled}
                        >
                            {EVENT_MARKE_KAUFEN}
                        </Button>
                        <Button
                            variant="outlined"
                            size="large"
                            startIcon={<AccountBalanceWallet />}
                            onClick={() => navigate(`/event/${secret}/kasse/payout`)}
                            disabled={!eventEnabled}
                        >
                            {EVENT_RESTGELD_AUSZAHLEN}
                        </Button>
                    </div>
                </Paper>

                <Paper className={style.section} elevation={2}>
                    <Stack gap={2}>
                        <div className={style.sectionHeading}>
                            <div>
                                <Typography variant="h5">{LETZTE_KAEUFE}</Typography>
                                <Typography variant="body2" color="text.secondary">Die letzten Buchungen dieser Kasse</Typography>
                            </div>
                            <ReceiptLong color="action" />
                        </div>
                        {transactionsLoading ? (
                            <Stack gap={2}>
                                <Skeleton variant="rectangular" height={56} />
                                <Skeleton variant="rectangular" height={56} />
                                <Skeleton variant="rectangular" height={56} />
                            </Stack>
                        ) : transactions.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">Noch keine Käufe vorhanden.</Typography>
                        ) : (
                            <Stack gap={2}>
                                {groupedTransactions.map((group) => (
                                    <Paper key={group.time} className={style.transactionGroup} variant="outlined">
                                        <Typography variant="caption" className={style.groupTimestamp}>{group.time}</Typography>
                                        <List dense disablePadding>
                                            {group.items.map((transaction) => (
                                                <ListItem
                                                    key={transaction.id}
                                                    secondaryAction={isDeletableTransaction(transaction)
                                                        ? (
                                                            <IconButton edge="end" onClick={() => undoTransaction(transaction.id)} aria-label={ENTFERNEN} disabled={undoingIds.includes(transaction.id)}>
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        )
                                                        : undefined}
                                                >
                                                    <ListItemText
                                                        primary={transaction.description}
                                                        secondary={`${transaction.amount.toFixed(2)} EUR`}
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Paper>
            </div>
        </main>
    )
}

export default EventKasse
