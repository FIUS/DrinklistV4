import React, { useEffect, useState } from 'react'
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, TextField, Typography } from '@mui/material'
import { useDispatch } from 'react-redux'
import { openErrorToast, openToast } from '../../Actions/CommonAction'
import { doGetRequest, doPostRequest } from '../Common/StaticFunctions'
import { Drink, EventDrinksResponse, EventGuestResponse, EventModeStatus, EventPurchaseResponse, Member } from '../../types/ResponseTypes'
import { EVENT_AUSZAHLUNG_ERFOLG, EVENT_BEZAHLEN_BAR, EVENT_BEZAHLEN_GUTHABEN, EVENT_BEZAHLEN_SPLIT, EVENT_EINKAUF_ERFOLG, EVENT_EINZAHLUNG_ERFOLG, EVENT_GAST_ANGELEGT, EVENT_GAST_GELADEN, EVENT_GAST_CODE, EVENT_GESAMT, EVENT_KASSE, EVENT_MARKE_KAUFEN, EVENT_MODE_DISABLED, EVENT_NEUER_GAST, EVENT_RESTGELD_AUSZAHLEN, EVENT_SCANNEN, EVENT_STARTGUTHABEN, EVENT_WARENKORB, ABBRECHEN, OK, BETRAG, GETRAENKE } from '../Common/Internationalization/i18n'
import EventScanDialog from './EventScanDialog'
import style from './eventKasse.module.scss'

type CartItem = {
    drink: Drink,
    quantity: number
}

type ScanPurpose = 'register' | 'checkout' | 'deposit' | 'payout'

const EventKasse = () => {
    const dispatch = useDispatch()
    const [status, setStatus] = useState<EventModeStatus | null>(null)
    const [drinks, setDrinks] = useState<Array<Drink>>([])
    const [categories, setCategories] = useState<Array<string>>([])
    const [activeGuest, setActiveGuest] = useState<Member | null>(null)
    const [activeGuestCode, setActiveGuestCode] = useState<string | null>(null)
    const [cart, setCart] = useState<Array<CartItem>>([])
    const [scanOpen, setScanOpen] = useState(false)
    const [scanPurpose, setScanPurpose] = useState<ScanPurpose>('checkout')
    const [registerOpen, setRegisterOpen] = useState(false)
    const [registerCode, setRegisterCode] = useState<string | null>(null)
    const [initialBalance, setInitialBalance] = useState('0')
    const [depositOpen, setDepositOpen] = useState(false)
    const [depositAmount, setDepositAmount] = useState('0')
    const [payoutOpen, setPayoutOpen] = useState(false)

    const eventEnabled = status?.enabled === true

    const fetchStatus = () => {
        doGetRequest('event-mode').then((value) => {
            if (value.code === 200) {
                setStatus(value.content)
            }
        })
    }

    const fetchDrinks = () => {
        doGetRequest('event/drinks').then((value) => {
            if (value.code === 200) {
                const payload: EventDrinksResponse = value.content
                setDrinks(payload.drinks)
                setCategories(payload.categories)
            }
        })
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    useEffect(() => {
        if (eventEnabled) {
            fetchDrinks()
        }
    }, [eventEnabled])

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
    }

    const updateCartQuantity = (drinkId: number, delta: number) => {
        setCart((prev) => {
            return prev.flatMap((item) => {
                if (item.drink.id !== drinkId) {
                    return [item]
                }
                const nextQuantity = item.quantity + delta
                if (nextQuantity <= 0) {
                    return []
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
    const shortage = Math.max(0, totalAmount - balance)

    const openScanner = (purpose: ScanPurpose) => {
        setScanPurpose(purpose)
        setScanOpen(true)
    }

    const handleLookup = (code: string, onSuccess?: (member: Member) => void) => {
        doPostRequest('event/guest/lookup', { code }).then((value) => {
            if (value.code === 200) {
                const payload: EventGuestResponse = value.content
                setActiveGuest(payload.member)
                setActiveGuestCode(code)
                dispatch(openToast({ message: EVENT_GAST_GELADEN }))
                if (onSuccess) {
                    onSuccess(payload.member)
                }
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const handleScan = (code: string) => {
        setScanOpen(false)
        if (scanPurpose === 'register') {
            setRegisterCode(code)
            setRegisterOpen(true)
            return
        }
        if (scanPurpose === 'checkout') {
            handleLookup(code, () => resetCart())
            return
        }
        if (scanPurpose === 'deposit') {
            handleLookup(code, () => setDepositOpen(true))
            return
        }
        if (scanPurpose === 'payout') {
            handleLookup(code, () => setPayoutOpen(true))
        }
    }

    const confirmRegister = () => {
        if (registerCode === null) {
            return
        }
        const amount = parseFloat(initialBalance)
        const payload = {
            code: registerCode,
            initialBalance: isNaN(amount) ? 0 : amount
        }
        doPostRequest('event/guest/register', payload).then((value) => {
            if (value.code === 200) {
                const response: EventGuestResponse = value.content
                setActiveGuest(response.member)
                setActiveGuestCode(registerCode)
                dispatch(openToast({ message: EVENT_GAST_ANGELEGT }))
                setRegisterOpen(false)
                setInitialBalance('0')
                resetCart()
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const confirmDeposit = () => {
        if (!activeGuestCode) {
            return
        }
        const amount = parseFloat(depositAmount)
        if (isNaN(amount) || amount <= 0) {
            return
        }
        doPostRequest('event/guest/deposit', { code: activeGuestCode, amount }).then((value) => {
            if (value.code === 200) {
                const response: EventGuestResponse = value.content
                setActiveGuest(response.member)
                dispatch(openToast({ message: EVENT_EINZAHLUNG_ERFOLG }))
                setDepositOpen(false)
                setDepositAmount('0')
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const confirmPayout = () => {
        if (!activeGuestCode) {
            return
        }
        doPostRequest('event/guest/payout', { code: activeGuestCode }).then((value) => {
            if (value.code === 200) {
                const response = value.content
                setActiveGuest(response.member)
                dispatch(openToast({ message: EVENT_AUSZAHLUNG_ERFOLG }))
                setPayoutOpen(false)
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    const doPurchase = (paymentMode: 'balance' | 'cash' | 'split') => {
        if (!activeGuestCode || cart.length === 0) {
            return
        }
        const items = cart.map((item) => ({ drinkID: item.drink.id, quantity: item.quantity }))
        doPostRequest('event/guest/purchase', { code: activeGuestCode, items, paymentMode }).then((value) => {
            if (value.code === 200) {
                const response: EventPurchaseResponse = value.content
                setActiveGuest((prev) => prev ? { ...prev, balance: response.balance } : prev)
                dispatch(openToast({ message: EVENT_EINKAUF_ERFOLG }))
                resetCart()
                fetchDrinks()
            } else {
                dispatch(openErrorToast())
            }
        })
    }

    if (status?.enabled === false) {
        return (
            <div className={style.container}>
                <Typography variant="h4">{EVENT_KASSE}</Typography>
                <Alert severity="warning">{EVENT_MODE_DISABLED}</Alert>
            </div>
        )
    }

    return (
        <div className={style.container}>
            <Typography variant="h4">{EVENT_KASSE}</Typography>
            <Paper className={style.section} elevation={2}>
                <Typography variant="h6">{EVENT_GAST_CODE}</Typography>
                <div className={style.actions}>
                    <Button variant="contained" onClick={() => openScanner('register')} disabled={!eventEnabled}>{EVENT_NEUER_GAST}</Button>
                    <Button variant="outlined" onClick={() => openScanner('checkout')} disabled={!eventEnabled}>{EVENT_KASSE}</Button>
                    <Button variant="outlined" onClick={() => activeGuest ? setDepositOpen(true) : openScanner('deposit')} disabled={!eventEnabled}>{EVENT_MARKE_KAUFEN}</Button>
                    <Button variant="outlined" onClick={() => activeGuest ? setPayoutOpen(true) : openScanner('payout')} disabled={!eventEnabled}>{EVENT_RESTGELD_AUSZAHLEN}</Button>
                </div>
            </Paper>

            <Paper className={style.section} elevation={2}>
                <Typography variant="h6">{EVENT_GAST_CODE}</Typography>
                {activeGuest ? (
                    <div className={style.guestInfo}>
                        <Typography variant="body1">{activeGuest.alias !== '' ? activeGuest.alias : activeGuest.name}</Typography>
                        <Typography variant="body2">{EVENT_GESAMT}: {activeGuest.balance.toFixed(2)} EUR</Typography>
                    </div>
                ) : (
                    <Typography variant="body2">{EVENT_SCANNEN}</Typography>
                )}
            </Paper>

            <Paper className={style.section} elevation={2}>
                <Typography variant="h6">{EVENT_WARENKORB}</Typography>
                {cart.length === 0 ? (
                    <Typography variant="body2">{EVENT_SCANNEN}</Typography>
                ) : (
                    <div className={style.cartList}>
                        {cart.map((item) => (
                            <div key={item.drink.id} className={style.cartRow}>
                                <div>
                                    <Typography variant="body1">{item.drink.name}</Typography>
                                    <Typography variant="body2">{item.drink.price.toFixed(2)} EUR x {item.quantity}</Typography>
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
                    <Typography variant="body1">{EVENT_GESAMT}: {totalAmount.toFixed(2)} EUR</Typography>
                    {activeGuest ? <Typography variant="body2">{BETRAG}: {balance.toFixed(2)} EUR</Typography> : <></>}
                    {shortage > 0 ? <Typography variant="body2">{EVENT_BEZAHLEN_SPLIT}: {shortage.toFixed(2)} EUR</Typography> : <></>}
                </div>
                <div className={style.actions}>
                    <Button variant="contained" disabled={!activeGuest || cart.length === 0 || balance < totalAmount} onClick={() => doPurchase('balance')}>
                        {EVENT_BEZAHLEN_GUTHABEN}
                    </Button>
                    <Button variant="outlined" disabled={!activeGuest || cart.length === 0} onClick={() => doPurchase('cash')}>
                        {EVENT_BEZAHLEN_BAR}
                    </Button>
                    <Button variant="outlined" disabled={!activeGuest || cart.length === 0} onClick={() => doPurchase('split')}>
                        {EVENT_BEZAHLEN_SPLIT}
                    </Button>
                </div>
            </Paper>

            <Paper className={style.section} elevation={2}>
                <Typography variant="h6">{GETRAENKE}</Typography>
                <div className={style.drinkGrid}>
                    {categories.map((category) => {
                        const categoryDrinks = drinks.filter((drink) => drink.category === category)
                        if (categoryDrinks.length === 0) {
                            return null
                        }
                        return (
                            <div key={category} className={style.category}>
                                <Typography variant="subtitle1">{category}</Typography>
                                <div className={style.categoryGrid}>
                                    {categoryDrinks.map((drink) => (
                                        <Paper key={drink.id} className={style.drinkCard} elevation={1}>
                                            <Typography variant="body1">{drink.name}</Typography>
                                            <Typography variant="body2">{drink.price.toFixed(2)} EUR</Typography>
                                            <Typography variant="caption">{drink.stock}</Typography>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => addToCart(drink)}
                                                disabled={!activeGuest}
                                            >
                                                +
                                            </Button>
                                        </Paper>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Paper>

            <EventScanDialog
                open={scanOpen}
                title={EVENT_SCANNEN}
                onClose={() => setScanOpen(false)}
                onScanned={handleScan}
            />

            <Dialog open={registerOpen} onClose={() => setRegisterOpen(false)}>
                <DialogTitle>{EVENT_NEUER_GAST}</DialogTitle>
                <DialogContent>
                    <TextField
                        label={EVENT_STARTGUTHABEN}
                        value={initialBalance}
                        onChange={(event) => setInitialBalance(event.target.value)}
                        type="number"
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRegisterOpen(false)}>{ABBRECHEN}</Button>
                    <Button variant="contained" onClick={confirmRegister}>{OK}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={depositOpen} onClose={() => setDepositOpen(false)}>
                <DialogTitle>{EVENT_MARKE_KAUFEN}</DialogTitle>
                <DialogContent>
                    <TextField
                        label={BETRAG}
                        value={depositAmount}
                        onChange={(event) => setDepositAmount(event.target.value)}
                        type="number"
                        fullWidth
                        margin="dense"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDepositOpen(false)}>{ABBRECHEN}</Button>
                    <Button variant="contained" onClick={confirmDeposit}>{OK}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={payoutOpen} onClose={() => setPayoutOpen(false)}>
                <DialogTitle>{EVENT_RESTGELD_AUSZAHLEN}</DialogTitle>
                <DialogContent>
                    <Typography variant="body2">{activeGuest ? activeGuest.balance.toFixed(2) : '0'} EUR</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPayoutOpen(false)}>{ABBRECHEN}</Button>
                    <Button variant="contained" onClick={confirmPayout}>{OK}</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default EventKasse
