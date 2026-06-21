import {
    AccountBalance,
    ArrowBack,
    CalendarMonth,
    Delete,
    History,
    Payments,
    RequestQuote,
    Search
} from '@mui/icons-material'
import {
    Avatar,
    Button,
    Chip,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    Tooltip,
    Typography
} from '@mui/material'
import Cookies from 'js-cookie'
import React, { useEffect, useMemo, useState } from 'react'
import CountUp from 'react-countup'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { format } from 'react-string-format'
import {
    openErrorToast,
    openToast,
    setDrinkCategories,
    setDrinks,
    setFavorites,
    setHistory,
    setMembers,
    setRequestDialogOpen,
    setTransferDialogOpen
} from '../../../Actions/CommonAction'
import { CommonReducerType } from '../../../Reducer/CommonReducer'
import { RootState } from '../../../Reducer/reducerCombiner'
import { LowBalanceWarningResponse, Transaction } from '../../../types/ResponseTypes'
import {
    GELD_ANFORDERN,
    GETRAENKE,
    GUTHABEN,
    HALLO,
    HISTORY,
    KONTOSTAND,
    NICHT_DEINE_TRANSAKTION,
    NICHT_MEHR_ABGESTRICHEN,
    UEBERWEISEN,
    WENDE_DICH_AN_ADMIN_RUECKGAENGIG,
    ZEIGE_ALLE,
    ZEIGE_WENIGER,
    ZEITLIMIT_ABGELAUFEN
} from '../../Common/Internationalization/i18n'
import { dateToString, doGetRequest, doPostRequest, timeToString } from '../../Common/StaticFunctions'
import {
    calculateAvatarText,
    centsToEuroNumber,
    compareCategoriesBySortingIndex,
    convertToLocalDate,
    formatMoney,
    stringToColor
} from '../../Common/StaticFunctionsTyped'
import AvailableDrinkCard from './AvailableDrinkCard'
import BalanceBox from './BalanceBox'
import LowBalanceWarningDialog from './LowBalanceWarningDialog'
import RequestConfirmation from './RequestConfirmation'
import RequestDialog from './RequestDialog'
import TransferDialog from './TransferDialog'
import style from './details.module.scss'

type Props = {
    readOnly?: boolean,
    memberIdOverride?: string
}

const Details = ({ readOnly = false, memberIdOverride }: Props) => {
    const params = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const common: CommonReducerType = useSelector((state: RootState) => state.common)
    const memberId = memberIdOverride ?? params.userid ?? ''
    const memberIDNumber = Number(memberId)
    const currentMember = common.members?.find((member) => member.id === memberIDNumber) ?? {
        id: memberIDNumber,
        name: '',
        balance: 0,
        hidden: false,
        alias: ''
    }
    const displayName = currentMember.alias || currentMember.name || `Mitglied #${memberId}`
    const [searchField, setSearchField] = useState('')
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false)
    const [lowBalanceDialogOpen, setLowBalanceDialogOpen] = useState(false)
    const [lowBalanceWarning, setLowBalanceWarning] = useState<LowBalanceWarningResponse | null>(null)
    const [historyExpanded, setHistoryExpanded] = useState(false)
    const cookieMemberID = Number(Cookies.get(window.globalTS.AUTH_COOKIE_PREFIX + 'memberID') ?? 0)
    const showBackButton = !readOnly && cookieMemberID <= 2

    useEffect(() => {
        if (readOnly) {
            return
        }

        if (common.drinks === null) {
            doGetRequest('drinks').then((value) => {
                if (value.code === 200) {
                    dispatch(setDrinks(value.content))
                }
            })
        }
        if (common.drinkCategories === null) {
            doGetRequest('drinks/categories').then((value) => {
                if (value.code === 200) {
                    dispatch(setDrinkCategories(value.content))
                }
            })
        }
    }, [common.drinkCategories, common.drinks, dispatch, readOnly])

    useEffect(() => {
        if (!memberId) {
            return
        }

        dispatch(setHistory([]))
        dispatch(setFavorites([]))

        doGetRequest('users').then((value) => {
            if (value.code === 200) {
                dispatch(setMembers(value.content))
            }
        })
        if (!readOnly) {
            doGetRequest(`users/${memberId}/favorites`).then((value) => {
                if (value.code === 200) {
                    dispatch(setFavorites(value.content))
                }
            })
        }
        doGetRequest(`users/${memberId}/history`).then((value) => {
            if (value.code === 200) {
                dispatch(setHistory(value.content))
            }
        })
    }, [dispatch, memberId, readOnly])

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape' || readOnly) {
                return
            }
            navigate(cookieMemberID > 2 ? `/user/${cookieMemberID}` : '/')
        }

        window.addEventListener('keydown', handleEscape)
        return () => window.removeEventListener('keydown', handleEscape)
    }, [cookieMemberID, navigate, readOnly])

    const filteredCategories = useMemo(() => {
        const normalizedSearch = searchField.trim().toLocaleLowerCase()

        return (common.drinkCategories ?? [])
            .slice()
            .sort((left, right) => compareCategoriesBySortingIndex(left, right, common.drinks))
            .map((category) => ({
                category,
                drinks: (common.drinks ?? [])
                    .filter((drink) =>
                        drink.category === category &&
                        (!normalizedSearch || drink.name.toLocaleLowerCase().includes(normalizedSearch))
                    )
                    .slice()
                    .sort((left, right) => left.name.localeCompare(right.name))
            }))
            .filter((entry) => entry.drinks.length > 0)
    }, [common.drinkCategories, common.drinks, searchField])

    const favorites = useMemo(() => {
        return common.drinks?.filter((drink) => common.favorites?.includes(drink.id))
    }, [common.drinks, common.favorites])

    const visibleHistory = common.history?.slice(0, historyExpanded ? common.history.length : 6) ?? []
    const lastAmount = common.history?.[0]?.amount ?? 0
    const balanceColor = currentMember.balance > 0 ? '#2e7d32' : '#c62828'

    const refreshMemberData = () => {
        doGetRequest('users').then((value) => {
            if (value.code === 200) {
                dispatch(setMembers(value.content))
            }
        })
        doGetRequest(`users/${memberId}/history`).then((value) => {
            if (value.code === 200) {
                dispatch(setHistory(value.content))
            }
        })
    }

    const undoTransaction = (transaction: Transaction) => {
        doPostRequest(`transactions/${transaction.id}/undo`, null).then((value) => {
            if (value.code === 200) {
                dispatch(openToast({ message: format(NICHT_MEHR_ABGESTRICHEN, transaction.description) }))
                refreshMemberData()
            } else if (value.code === 412 && value.content === 'TooLate') {
                dispatch(openToast({
                    message: WENDE_DICH_AN_ADMIN_RUECKGAENGIG,
                    headline: ZEITLIMIT_ABGELAUFEN,
                    duration: 10000,
                    type: 'error'
                }))
            } else if (value.code === 412 && value.content === 'NotYourTransaction') {
                dispatch(openToast({
                    message: WENDE_DICH_AN_ADMIN_RUECKGAENGIG,
                    headline: NICHT_DEINE_TRANSAKTION,
                    duration: 10000,
                    type: 'error'
                }))
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const checkLowBalanceWarning = (id: string) => {
        if (!id || readOnly) {
            return
        }

        doGetRequest(`users/${id}/low-balance-warning`).then((value) => {
            if (value.code === 200) {
                const warning: LowBalanceWarningResponse = value.content
                if (warning.showWarning) {
                    setLowBalanceWarning(warning)
                    setLowBalanceDialogOpen(true)
                }
            }
        })
    }

    return (
        <>
            {!readOnly ? (
                <>
                    <TransferDialog
                        isOpen={common.transferDialogOpen}
                        close={() => dispatch(setTransferDialogOpen(false))}
                        member={currentMember}
                    />
                    <RequestDialog
                        isOpen={common.requestDialogOpen}
                        close={() => dispatch(setRequestDialogOpen(false))}
                        showConfirmation={() => setConfirmationDialogOpen(true)}
                        member={currentMember}
                        isGroup
                    />
                    <RequestConfirmation
                        isOpen={confirmationDialogOpen}
                        close={() => setConfirmationDialogOpen(false)}
                    />
                    <LowBalanceWarningDialog
                        isOpen={lowBalanceDialogOpen}
                        warning={lowBalanceWarning}
                        onClose={() => setLowBalanceDialogOpen(false)}
                    />
                </>
            ) : null}

            <main className={`${style.container} ${readOnly ? style.readOnlyContainer : ''}`}>
                <header className={style.header}>
                    <div className={style.identity}>
                        <Avatar
                            className={style.avatar}
                            sx={{ bgcolor: stringToColor(displayName) }}
                        >
                            {calculateAvatarText(currentMember.alias, currentMember.name)}
                        </Avatar>
                        <div>
                            <Typography variant="overline" color="text.secondary">
                                {readOnly ? 'Guthabenkarte' : 'Dein Getränkekonto'}
                            </Typography>
                            <Typography variant="h4">{readOnly ? displayName : <>{HALLO} {displayName}!</>}</Typography>
                            {currentMember.alias ? (
                                <Typography variant="body2" color="text.secondary">{currentMember.name}</Typography>
                            ) : null}
                        </div>
                    </div>
                    <div className={style.headerActions}>
                        {showBackButton ? (
                            <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/')}>
                                Zurück
                            </Button>
                        ) : null}
                        {!readOnly ? (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<AccountBalance />}
                                    onClick={() => dispatch(setTransferDialogOpen(true))}
                                >
                                    {UEBERWEISEN}
                                </Button>
                                <Button
                                    variant="outlined"
                                    startIcon={<RequestQuote />}
                                    onClick={() => dispatch(setRequestDialogOpen(true))}
                                >
                                    {GELD_ANFORDERN}
                                </Button>
                            </>
                        ) : null}
                    </div>
                </header>

                <div className={`${style.dashboardGrid} ${readOnly ? style.readOnlyGrid : ''}`}>
                    <aside className={style.accountColumn}>
                        <Paper className={style.balanceCard} elevation={1}>
                            <div className={style.balanceLabel}>
                                <Payments color="action" />
                                <Typography variant="overline" color="text.secondary">
                                    {readOnly ? GUTHABEN : KONTOSTAND}
                                </Typography>
                            </div>
                            <Typography variant="h2" sx={{ color: balanceColor }}>
                                <CountUp
                                    start={centsToEuroNumber(currentMember.balance - lastAmount)}
                                    end={centsToEuroNumber(currentMember.balance)}
                                    decimals={2}
                                    duration={0.5}
                                /> €
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Aktueller Kontostand
                            </Typography>
                        </Paper>

                        <Paper className={style.historyCard} elevation={1}>
                            <div className={style.cardHeading}>
                                <div>
                                    <Typography variant="h5">{HISTORY}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Deine letzten Buchungen
                                    </Typography>
                                </div>
                                <History color="action" />
                            </div>
                            <div className={style.historyList}>
                                {visibleHistory.map((transaction) => (
                                    <div className={style.historyItem} key={transaction.id}>
                                        <div className={style.historyMain}>
                                            <Typography variant="body2" fontWeight={600}>
                                                {transaction.description}
                                            </Typography>
                                            <span>
                                                <CalendarMonth fontSize="small" />
                                                <Typography variant="caption" color="text.secondary">
                                                    {dateToString(convertToLocalDate(transaction.date))} · {timeToString(convertToLocalDate(transaction.date))}
                                                </Typography>
                                            </span>
                                        </div>
                                        <div className={style.historyAmount}>
                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                className={transaction.amount >= 0 ? style.positiveAmount : style.negativeAmount}
                                            >
                                                {formatMoney(transaction.amount)} €
                                            </Typography>
                                            {!readOnly && transaction.revertable ? (
                                                <Tooltip title="Rückgängig">
                                                    <IconButton size="small" onClick={() => undoTransaction(transaction)}>
                                                        <Delete />
                                                    </IconButton>
                                                </Tooltip>
                                            ) : null}
                                        </div>
                                    </div>
                                ))}
                                {visibleHistory.length === 0 ? (
                                    <div className={style.historyEmpty}>
                                        <History color="disabled" />
                                        <Typography variant="body2" color="text.secondary">Noch keine Buchungen</Typography>
                                    </div>
                                ) : null}
                            </div>
                            {(common.history?.length ?? 0) > 6 ? (
                                <Button fullWidth onClick={() => setHistoryExpanded((expanded) => !expanded)}>
                                    {historyExpanded ? ZEIGE_WENIGER : ZEIGE_ALLE}
                                </Button>
                            ) : null}
                        </Paper>
                    </aside>

                    {!readOnly ? (
                        <section className={style.purchaseColumn}>
                            <div className={style.catalogHeader}>
                                <div>
                                    <Typography variant="h5">{GETRAENKE}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Antippen, um ein Getränk abzustreichen
                                    </Typography>
                                </div>
                                <Chip label={`${common.drinks?.length ?? 0} Getränke`} variant="outlined" />
                            </div>

                            <TextField
                                className={style.search}
                                label="Getränk suchen"
                                value={searchField}
                                onChange={(event) => setSearchField(event.target.value)}
                                type="search"
                                autoFocus
                                fullWidth
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search />
                                        </InputAdornment>
                                    )
                                }}
                            />

                            <BalanceBox
                                favorites={favorites}
                                memberID={memberId}
                                onPurchased={() => checkLowBalanceWarning(memberId)}
                            />

                            <div className={style.categoryGrid}>
                                {filteredCategories.map((entry) => (
                                    <AvailableDrinkCard
                                        key={entry.category}
                                        category={entry.category}
                                        drinks={entry.drinks}
                                        memberID={memberId}
                                        onPurchased={() => checkLowBalanceWarning(memberId)}
                                    />
                                ))}
                            </div>

                            {filteredCategories.length === 0 ? (
                                <Paper className={style.emptyState} variant="outlined">
                                    <Search color="disabled" fontSize="large" />
                                    <Typography variant="h6">Kein Getränk gefunden</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Passe deine Suche an.
                                    </Typography>
                                </Paper>
                            ) : null}
                        </section>
                    ) : null}
                </div>
            </main>
        </>
    )
}

export default Details
