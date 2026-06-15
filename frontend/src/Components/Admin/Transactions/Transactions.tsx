import {
    CalendarMonth,
    Person,
    ReceiptLong,
    Search,
    TrendingDown,
    TrendingUp,
    Undo
} from '@mui/icons-material'
import {
    Avatar,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { format } from 'react-string-format'
import { Transaction } from '../../../types/ResponseTypes'
import {
    BESCHREIBUNG,
    DATUM,
    KONTO,
    RUECKGAENGIG,
    SICHER_TRANSAKTION_RUECKGAENIG,
    TRANSAKTION_RUECKGAENIG,
    TRANSAKTIONEN,
    WERT
} from '../../Common/Internationalization/i18n'
import Loader from '../../Common/Loader/Loader'
import {
    dateToString,
    datetimeToString,
    doGetRequest,
    doPostRequest,
    timeToString
} from '../../Common/StaticFunctions'
import { convertToLocalDate } from '../../Common/StaticFunctionsTyped'
import WarningPopup from '../../Common/WarningPopup/WarningPopup'
import style from './transactions.module.scss'

type MetricCardProps = {
    label: string,
    value: string,
    helper?: string,
    icon: React.ReactNode,
    accent?: string
}

const MetricCard = ({ label, value, helper, icon, accent = window.globalTS.ICON_COLOR }: MetricCardProps) => (
    <Paper className={style.metricCard} elevation={1} sx={{ borderTopColor: accent }}>
        <div>
            <Typography variant="overline" color="text.secondary">{label}</Typography>
            <Typography variant="h5" className={style.metricValue}>{value}</Typography>
            {helper ? <Typography variant="body2" color="text.secondary">{helper}</Typography> : null}
        </div>
        <Avatar sx={{ bgcolor: accent }}>{icon}</Avatar>
    </Paper>
)

const Transactions = () => {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
    const [transactions, setTransactions] = useState<Array<Transaction>>([])
    const [searchDescription, setSearchDescription] = useState('')
    const [searchName, setSearchName] = useState('')
    const [searchDate, setSearchDate] = useState('')
    const [transactionsLoaded, setTransactionsLoaded] = useState(false)
    const [warningOpen, setWarningOpen] = useState(false)
    const [transactionToUndo, setTransactionToUndo] = useState<Transaction | null>(null)

    const refreshTransactions = useCallback(async () => {
        try {
            const value = await doGetRequest(`transactions/limit/${window.globalTS.TRANSACTION_LIMIT}`)
            if (value.code === 200) {
                setTransactions(value.content as Array<Transaction>)
            }
        } finally {
            setTransactionsLoaded(true)
        }
    }, [])

    useEffect(() => {
        refreshTransactions()
    }, [refreshTransactions])

    const filteredTransactions = useMemo(() => {
        const descriptionFilter = searchDescription.trim().toLocaleLowerCase()
        const nameFilter = searchName.trim().toLocaleLowerCase()
        const dateFilter = searchDate.trim().toLocaleLowerCase()

        return transactions.filter((transaction) => {
            const member = transaction.memberName ?? transaction.memberID.toString()
            const date = datetimeToString(convertToLocalDate(transaction.date))

            return (!descriptionFilter || transaction.description.toLocaleLowerCase().includes(descriptionFilter)) &&
                (!nameFilter || member.toLocaleLowerCase().includes(nameFilter)) &&
                (!dateFilter || date.toLocaleLowerCase().includes(dateFilter))
        })
    }, [searchDate, searchDescription, searchName, transactions])

    const incomingTotal = useMemo(() => {
        return transactions.reduce((sum, transaction) => {
            return transaction.amount > 0 ? sum + transaction.amount : sum
        }, 0)
    }, [transactions])

    const outgoingTotal = useMemo(() => {
        return transactions.reduce((sum, transaction) => {
            return transaction.amount < 0 ? sum + Math.abs(transaction.amount) : sum
        }, 0)
    }, [transactions])

    const undoableTransactions = useMemo(() => {
        return transactions.filter((transaction) => !transaction.partOfCheckout).length
    }, [transactions])

    const canUndo = (transaction: Transaction) => {
        return !transaction.partOfCheckout
    }

    const openUndoDialog = (transaction: Transaction) => {
        setTransactionToUndo(transaction)
        setWarningOpen(true)
    }

    const undoTooltip = (transaction: Transaction) => {
        if (transaction.partOfCheckout) {
            return 'Teil einer Abrechnung'
        }
        return RUECKGAENGIG
    }

    const memberLabel = (transaction: Transaction) => {
        return transaction.memberName ?? `Mitglied #${transaction.memberID}`
    }

    const amountClass = (amount: number) => amount >= 0 ? style.positiveAmount : style.negativeAmount
    const hasFilters = Boolean(searchDescription || searchName || searchDate)

    return (
        <main className={style.container}>
            <header className={style.header}>
                <div>
                    <Typography variant="overline" color="text.secondary">Administration</Typography>
                    <Typography variant="h4">{TRANSAKTIONEN}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Buchungen prüfen, durchsuchen und bei Bedarf rückgängig machen
                    </Typography>
                </div>
                <Paper className={style.resultSummary} variant="outlined">
                    <ReceiptLong color="action" />
                    <div>
                        <Typography variant="caption" color="text.secondary">Aktuelle Auswahl</Typography>
                        <Typography variant="body2" fontWeight={600}>
                            {filteredTransactions.length} von {transactions.length} Transaktionen
                        </Typography>
                    </div>
                </Paper>
            </header>

            <section className={style.section}>
                <Typography variant="h5">Auf einen Blick</Typography>
                <div className={style.metricGrid}>
                    <MetricCard
                        label="Geladene Transaktionen"
                        value={`${transactions.length}`}
                        helper={`Limit: ${window.globalTS.TRANSACTION_LIMIT}`}
                        icon={<ReceiptLong />}
                    />
                    <MetricCard
                        label="Positive Buchungen"
                        value={`${incomingTotal.toFixed(2)} €`}
                        icon={<TrendingUp />}
                    />
                    <MetricCard
                        label="Negative Buchungen"
                        value={`${outgoingTotal.toFixed(2)} €`}
                        icon={<TrendingDown />}
                        accent={window.globalTS.ICON_COLOR_SECONDARY}
                    />
                    <MetricCard
                        label="Rückgängig möglich"
                        value={`${undoableTransactions}`}
                        helper="nicht Teil einer Abrechnung"
                        icon={<Undo />}
                        accent={window.globalTS.ICON_COLOR_SECONDARY}
                    />
                </div>
            </section>

            <section className={style.section}>
                <div>
                    <Typography variant="h5">Transaktionsverzeichnis</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Nach Beschreibung, Mitglied oder Datum filtern
                    </Typography>
                </div>

                <Paper className={style.directoryCard} elevation={1}>
                    <div className={style.filterBar}>
                        <TextField
                            label="Beschreibung"
                            value={searchDescription}
                            onChange={(event) => setSearchDescription(event.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            label="Mitglied"
                            value={searchName}
                            onChange={(event) => setSearchName(event.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Person fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            label="Datum"
                            value={searchDate}
                            onChange={(event) => setSearchDate(event.target.value)}
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <CalendarMonth fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                        />
                        {hasFilters ? (
                            <Button onClick={() => {
                                setSearchDescription('')
                                setSearchName('')
                                setSearchDate('')
                            }}>
                                Filter löschen
                            </Button>
                        ) : null}
                    </div>

                    {!transactionsLoaded ? (
                        <div className={style.loadingState}>
                            <Loader />
                        </div>
                    ) : null}

                    {transactionsLoaded && isMobile ? (
                        <div className={style.transactionList}>
                            {filteredTransactions.map((transaction) => (
                                <Paper className={style.transactionCard} variant="outlined" key={transaction.id}>
                                    <div className={style.transactionCardHeader}>
                                        <div className={style.transactionDescription}>
                                            <Typography variant="h6">{transaction.description}</Typography>
                                            <Typography variant="caption" color="text.secondary">#{transaction.id}</Typography>
                                        </div>
                                        <Typography variant="h6" className={amountClass(transaction.amount)}>
                                            {transaction.amount.toFixed(2)} €
                                        </Typography>
                                    </div>
                                    <div className={style.transactionMeta}>
                                        <span>
                                            <Person fontSize="small" />
                                            <Typography variant="body2">{memberLabel(transaction)}</Typography>
                                        </span>
                                        <span>
                                            <CalendarMonth fontSize="small" />
                                            <Typography variant="body2">
                                                {datetimeToString(convertToLocalDate(transaction.date))}
                                            </Typography>
                                        </span>
                                    </div>
                                    <div className={style.transactionCardFooter}>
                                        {transaction.partOfCheckout ? (
                                            <Chip size="small" label="Abgerechnet" variant="outlined" />
                                        ) : (
                                            <Chip
                                                size="small"
                                                label="Rückgängig möglich"
                                                color="success"
                                                variant="outlined"
                                            />
                                        )}
                                        <Tooltip title={undoTooltip(transaction)}>
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openUndoDialog(transaction)}
                                                    disabled={!canUndo(transaction)}
                                                >
                                                    <Undo />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </div>
                                </Paper>
                            ))}
                        </div>
                    ) : null}

                    {transactionsLoaded && !isMobile ? (
                        <TableContainer>
                            <Table aria-label="Transaktionen" size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>#</TableCell>
                                        <TableCell>{BESCHREIBUNG}</TableCell>
                                        <TableCell>{KONTO}</TableCell>
                                        <TableCell>{WERT}</TableCell>
                                        <TableCell>{DATUM}</TableCell>
                                        <TableCell align="right">{RUECKGAENGIG}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTransactions.map((transaction) => (
                                        <TableRow key={transaction.id} hover>
                                            <TableCell>{transaction.id}</TableCell>
                                            <TableCell>
                                                <div className={style.descriptionCell}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {transaction.description}
                                                    </Typography>
                                                    {transaction.partOfCheckout ? (
                                                        <Chip size="small" label="Abgerechnet" variant="outlined" />
                                                    ) : null}
                                                </div>
                                            </TableCell>
                                            <TableCell>{memberLabel(transaction)}</TableCell>
                                            <TableCell>
                                                <Typography fontWeight={600} className={amountClass(transaction.amount)}>
                                                    {transaction.amount.toFixed(2)} €
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{datetimeToString(convertToLocalDate(transaction.date))}</TableCell>
                                            <TableCell align="right">
                                                <Tooltip title={undoTooltip(transaction)}>
                                                    <span>
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => openUndoDialog(transaction)}
                                                            disabled={!canUndo(transaction)}
                                                        >
                                                            <Undo />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : null}

                    {transactionsLoaded && filteredTransactions.length === 0 ? (
                        <div className={style.emptyState}>
                            <Search color="disabled" fontSize="large" />
                            <Typography variant="h6">Keine Transaktionen gefunden</Typography>
                            <Typography variant="body2" color="text.secondary">Passe die Suchfilter an.</Typography>
                        </div>
                    ) : null}
                </Paper>
            </section>

            <WarningPopup
                title={TRANSAKTION_RUECKGAENIG}
                text={transactionToUndo
                    ? format(
                        SICHER_TRANSAKTION_RUECKGAENIG,
                        transactionToUndo.description,
                        transactionToUndo.memberName ?? '???',
                        format(
                            '{0} - {1}',
                            dateToString(convertToLocalDate(transactionToUndo.date)),
                            timeToString(convertToLocalDate(transactionToUndo.date))
                        )
                    )
                    : ''}
                isOpen={warningOpen}
                close={setWarningOpen}
                yes={() => {
                    if (!transactionToUndo) {
                        return
                    }
                    doPostRequest(`transactions/${transactionToUndo.id}/undo`, '').then((value) => {
                        if (value.code === 200) {
                            refreshTransactions()
                        }
                    })
                }}
                no={() => { }}
            />
        </main>
    )
}

export default Transactions
