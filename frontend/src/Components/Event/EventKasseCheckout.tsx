import React, { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Typography, Skeleton } from '@mui/material'
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { openErrorToast, openToast } from '../../Actions/CommonAction'
import { doGetRequest, doGetRequestWithEventSecret } from '../Common/StaticFunctions'
import { compareCategoriesBySortingIndex } from '../Common/StaticFunctionsTyped'
import { Drink, EventDrinksResponse, EventGuestResponse, EventModeStatus, EventPurchaseResponse, Member } from '../../types/ResponseTypes'
import { ABBRECHEN, EVENT_BEZAHLEN_BAR, EVENT_BEZAHLEN_GUTHABEN, EVENT_BEZAHLEN_SPLIT, EVENT_BESTAETIGEN, EVENT_EINKAUF_ERFOLG, EVENT_GAST_GELADEN, EVENT_GESAMT, EVENT_GUTHABEN_NICHT_AUSREICHEND, EVENT_KASSE, EVENT_MODE_DISABLED, EVENT_NO_GUTHABENKARTE, EVENT_RESTBETRAG_BAR, EVENT_SCANNEN, EVENT_WARENKORB, EVENT_WARENKORB_ENTFERNT, EVENT_WARENKORB_HINZUGEFUEGT, EVENT_WARENKORB_LEER, EVENT_ZAHLUNG_BAR, EVENT_ZAHLUNG_BESTAETIGEN, EVENT_ZAHLUNG_GUTHABEN, GUTHABEN, ZURUECK } from '../Common/Internationalization/i18n'
import EventScanDialog from './EventScanDialog'
import style from './eventKasseCheckout.module.scss'
import { format } from 'react-string-format'

type CartItem = {
    drink: Drink,
    quantity: number
}

const EventKasseCheckout = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [drinks, setDrinks] = useState<Array<Drink>>([])
    const [categories, setCategories] = useState<Array<string>>([])
    const [activeGuest, setActiveGuest] = useState<Member | null>(null)
    const [activeGuestCode, setActiveGuestCode] = useState<string | null>(null)
    const [cart, setCart] = useState<Array<CartItem>>([])
    const [scanOpen, setScanOpen] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [pendingMode, setPendingMode] = useState<'balance' | 'cash' | 'split' | null>(null)
    const [confirming, setConfirming] = useState(false)

    const eventEnabled = status?.enabled === true

    useEffect(() => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }, [])

    const params = useParams()
    const secret = params.secret

    const [drinksLoading, setDrinksLoading] = useState(true)
    useEffect(() => {
        if (!eventEnabled) {
            return
        }
        setDrinksLoading(true)
        doGetRequestWithEventSecret('event/drinks', secret).then((value) => {
            if (value.code === 200) {
                const payload: EventDrinksResponse = value.content
                setDrinks(payload.drinks)
                setCategories(payload.categories)
            } else if (value.code === 403) {
                dispatch(openErrorToast())
            }
        }).finally(() => setDrinksLoading(false))
    }, [eventEnabled, dispatch, secret])

    // Scanner will open only when the user presses the scan button.

    const addToCart = (drink: Drink) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.drink.id === drink.id)
            if (existing) {
                return prev.map((item) => item.drink.id === drink.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                )
            }
            return [...prev, { drink, quantity: 1 }]
        })
        dispatch(openToast({ message: format(EVENT_WARENKORB_HINZUGEFUEGT, drink.name) }))
    }

    const updateCartQuantity = (drinkId: number, delta: number) => {
        setCart((prev) => {
            return prev.flatMap((item) => {
                if (item.drink.id !== drinkId) {
                    return [item]
                }
                const nextQuantity = item.quantity + delta
                if (nextQuantity <= 0) {
                    if (delta < 0) {
                        dispatch(openToast({ message: format(EVENT_WARENKORB_ENTFERNT, item.drink.name) }))
                    }
                    return []
                }
                if (delta < 0) {
                    dispatch(openToast({ message: format(EVENT_WARENKORB_ENTFERNT, item.drink.name) }))
                }
                return [{ ...item, quantity: nextQuantity }]
            })
        })
    }

    const resetCart = () => {
        setCart([])
    }

    const totalAmount = cart.reduce((sum, item) => sum + item.drink.price * item.quantity, 0)
    const balance = activeGuest?.balance ?? 0
    const balanceInCents = Math.round(balance * 100)
    const shortage = Math.max(0, totalAmount - balance)
    const showSplit = shortage > 0 && balanceInCents > 0
    const showCashOnly = shortage > 0 && balanceInCents <= 0
    const canCheckout = activeGuest !== null && cart.length > 0
    const canCashCheckout = cart.length > 0
    const hasPositiveBalance = balanceInCents > 0
    // require positive balance to be considered able to cover via balance
    const canCover = balanceInCents > 0 && balance >= totalAmount
    const balanceColor = balance >= 0 ? 'limegreen' : 'darkred'

    const handleLookup = (code: string) => {
        return doPostRequestWithEventSecret('event/guest/lookup', { code }, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                return
            }
            if (value.code === 200) {
                const payload: EventGuestResponse = value.content
                setActiveGuest(payload.member)
                setActiveGuestCode(code)
                dispatch(openToast({ message: EVENT_GAST_GELADEN }))
                resetCart()
            } else if (value.code === 404) {
                dispatch(openToast({ message: EVENT_NO_GUTHABENKARTE, type: 'error' }))
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const handleScan = (code: string) => {
        setScanOpen(false)
        return handleLookup(code)
    }

    const doPurchase = (paymentMode: 'balance' | 'cash' | 'split') => {
        if (!activeGuestCode || cart.length === 0) {
            return
        }
        const items = cart.map((item) => ({ drinkID: item.drink.id, quantity: item.quantity }))
        return doPostRequestWithEventSecret('event/guest/purchase', { code: activeGuestCode, items, paymentMode }, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                return
            }
            if (value.code === 200) {
                const response: EventPurchaseResponse = value.content
                setActiveGuest((prev) => prev ? { ...prev, balance: response.balance } : prev)
                dispatch(openToast({ message: EVENT_EINKAUF_ERFOLG }))
                resetCart()
                navigate(`/event/${secret}/kasse`)
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const doCashPurchase = () => {
        if (cart.length === 0) {
            return
        }
        const items = cart.map((item) => ({ drinkID: item.drink.id, quantity: item.quantity }))
        return doPostRequestWithEventSecret('event/purchase', { items, paymentMode: 'cash' }, secret).then((value) => {
            if (value.code === 403) {
                dispatch(openErrorToast())
                return
            }
            if (value.code === 200) {
                dispatch(openToast({ message: EVENT_EINKAUF_ERFOLG }))
                resetCart()
                navigate(`/event/${secret}/kasse`)
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const openConfirm = (mode: 'balance' | 'cash' | 'split') => {
        setPendingMode(mode)
        setConfirmOpen(true)
    }

    const confirmPurchase = () => {
        if (!pendingMode) {
            return
        }
        if (confirming) {
            return
        }
        setConfirming(true)
        setConfirmOpen(false)
        if (pendingMode === 'cash' && !activeGuest) {
            const p = doCashPurchase()
            if (p && typeof (p as any).finally === 'function') {
                ; (p as Promise<any>).finally(() => setConfirming(false))
            } else {
                setConfirming(false)
            }
        } else {
            const p = doPurchase(pendingMode)
            if (p && typeof (p as any).finally === 'function') {
                ; (p as Promise<any>).finally(() => setConfirming(false))
            } else {
                setConfirming(false)
            }
        }
        setPendingMode(null)
    }

    const getBreakdown = (mode: 'balance' | 'cash' | 'split') => {
        if (mode === 'balance') {
            return { balanceUsed: totalAmount, cashUsed: 0 }
        }
        if (mode === 'cash') {
            return { balanceUsed: 0, cashUsed: totalAmount }
        }

        const balanceUsed = Math.min(balance, totalAmount)
        return { balanceUsed, cashUsed: Math.max(0, totalAmount - balanceUsed) }
    }

    const breakdown = pendingMode ? getBreakdown(pendingMode) : { balanceUsed: 0, cashUsed: 0 }

    if (status?.enabled === false) {
        return (
            <div className={style.container}>
                <Typography variant="h4">{EVENT_KASSE}</Typography>
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            </div>
        )
    }

    const guestName = activeGuest ? (activeGuest.alias !== '' ? activeGuest.alias : activeGuest.name) : ''

    return (
        <div className={style.container}>
            <div className={style.headerRow}>
                <Typography variant="h4">{EVENT_KASSE}</Typography>
                <Stack direction="row" spacing={2} className={style.headerActions}>
                    <Button variant="outlined" onClick={() => navigate(`/event/${secret}/kasse`)}>{ZURUECK}</Button>

                </Stack>
            </div>

            {activeGuest ? (
                <Paper className={style.balanceCard} elevation={2}>
                    <Typography variant="h6">{guestName}</Typography>
                    <Typography variant="h2" sx={{ color: balanceColor }}>
                        {balance.toFixed(2)} EUR
                    </Typography>
                </Paper>
            ) : (
                <Paper className={style.section} elevation={2}>
                    <Button variant="contained" size="large" onClick={() => setScanOpen(true)} disabled={!eventEnabled}>
                        {EVENT_SCANNEN}
                    </Button>
                </Paper>
            )}

            <Paper className={style.section} elevation={2}>
                <Typography variant="h4">{EVENT_WARENKORB}</Typography>
                {cart.length === 0 ? (
                    <Typography variant="body2">
                        {activeGuest ? EVENT_WARENKORB_LEER : EVENT_SCANNEN}
                    </Typography>
                ) : (
                    <div className={style.cartList}>
                        {cart.map((item) => (
                            <div key={item.drink.id} className={style.cartRow}>
                                <div>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {item.drink.name}
                                    </Typography>
                                    <Typography variant="body2">
                                        {item.drink.price.toFixed(2)} EUR x {item.quantity}
                                    </Typography>
                                </div>
                                <div className={style.cartActions}>
                                    <Button variant="outlined" size="small" onClick={() => updateCartQuantity(item.drink.id, -1)}>-</Button>
                                    <Button variant="outlined" size="small" onClick={() => updateCartQuantity(item.drink.id, 1)}>+</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className={style.cartTotals}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {EVENT_GESAMT}: {totalAmount.toFixed(2)} EUR
                    </Typography>
                    {activeGuest ? <Typography variant="body2">{GUTHABEN}: {balance.toFixed(2)} EUR</Typography> : <></>}
                    {showSplit ? <Typography variant="body2">{EVENT_RESTBETRAG_BAR}: {shortage.toFixed(2)} EUR</Typography> : <></>}
                    {showCashOnly ? <Typography variant="body2">{EVENT_BEZAHLEN_BAR}: {totalAmount.toFixed(2)} EUR</Typography> : <></>}
                    {activeGuest && shortage > 0 ? (
                        <Alert severity="warning">
                            {format(EVENT_GUTHABEN_NICHT_AUSREICHEND, shortage.toFixed(2))}
                        </Alert>
                    ) : null}
                </div>
                <div className={style.actions}>
                    {canCover ? (
                        <Button
                            variant="contained"
                            disabled={!canCheckout}
                            onClick={() => openConfirm('balance')}
                        >
                            {EVENT_BEZAHLEN_GUTHABEN}
                        </Button>
                    ) : hasPositiveBalance ? (
                        <>
                            <Button
                                variant="contained"
                                disabled={!canCheckout}
                                onClick={() => openConfirm('split')}
                            >
                                {EVENT_BEZAHLEN_SPLIT}
                            </Button>
                            <Button
                                variant="outlined"
                                disabled={!canCashCheckout}
                                onClick={() => openConfirm('cash')}
                            >
                                {EVENT_BEZAHLEN_BAR}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="contained"
                            disabled={!canCashCheckout}
                            onClick={() => openConfirm('cash')}
                        >
                            {EVENT_BEZAHLEN_BAR}
                        </Button>
                    )}
                </div>
            </Paper>

            <div className={style.drinkGrid}>
                {drinksLoading ? (
                    <Paper className={style.section} elevation={1}>
                        <Skeleton variant="rectangular" height={200} />
                    </Paper>
                ) : null}
                {!drinksLoading && ([...categories]).sort((c1, c2) => compareCategoriesBySortingIndex(c1, c2, drinks)).map((category) => {
                    const categoryDrinks = drinks.filter((drink) => drink.category === category)
                    if (categoryDrinks.length === 0) {
                        return null
                    }
                    return (
                        <Paper key={category} className={style.section} elevation={2}>
                            <Typography variant="h6">{category}</Typography>
                            <div className={style.categoryGrid}>
                                {categoryDrinks.map((drink) => (
                                    <Paper key={drink.id} className={style.drinkCard} elevation={1}>
                                        <Stack className={style.drinkStack} spacing={1} justifyContent="space-between">
                                            <Stack>
                                                <Typography variant="body1">{drink.name}</Typography>
                                                <Typography variant="body2">{drink.price.toFixed(2)} EUR</Typography>
                                            </Stack>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                className={style.addButton}
                                                onClick={() => addToCart(drink)}
                                                disabled={!eventEnabled}
                                            >
                                                <AddBoxIcon />
                                            </Button>
                                        </Stack>
                                    </Paper>
                                ))}
                            </div>
                        </Paper>
                    )
                })}
            </div>

            <EventScanDialog
                open={scanOpen}
                title={EVENT_SCANNEN}
                onClose={() => setScanOpen(false)}
                onScanned={handleScan}
            />

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>{EVENT_ZAHLUNG_BESTAETIGEN}</DialogTitle>
                <DialogContent>
                    <Stack spacing={1}>
                        <Typography variant="body1">{EVENT_GESAMT}: {totalAmount.toFixed(2)} EUR</Typography>
                        <Typography variant="body2">{EVENT_ZAHLUNG_GUTHABEN}: {breakdown.balanceUsed.toFixed(2)} EUR</Typography>
                        <Typography variant="body2">{EVENT_ZAHLUNG_BAR}: {breakdown.cashUsed.toFixed(2)} EUR</Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>{ABBRECHEN}</Button>
                    <Button variant="contained" onClick={confirmPurchase} disabled={confirming}>{EVENT_BESTAETIGEN}</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default EventKasseCheckout
