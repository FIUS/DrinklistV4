import React, { useEffect, useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { Drink } from '../../../types/ResponseTypes';
import { setDrinks } from '../../../Actions/CommonAction';
import { useDispatch } from 'react-redux';
import { ABBRECHEN, AKTUALISIEREN, GEBE_NEUEN_PREIS_EIN, NEUER_PREIS, PREIS_IN_EURO } from '../../Common/Internationalization/i18n';
import { format } from 'react-string-format';
import { formatMoney, parseMoneyInputToCents } from '../../Common/StaticFunctionsTyped';

type Props = {
    isOpen: boolean,
    close: () => void,
    drink: Drink
}

const DrinkPriceDialog = (props: Props) => {
    const [price, setPrice] = useState(props.drink.price)
    const [priceInput, setPriceInput] = useState(formatMoney(props.drink.price))
    const dispatch = useDispatch()

    useEffect(() => {
        if (props.isOpen) {
            setPrice(props.drink.price)
            setPriceInput(formatMoney(props.drink.price))
        }
    }, [props.drink.price, props.isOpen])

    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>{NEUER_PREIS}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {format(GEBE_NEUEN_PREIS_EIN, props.drink.name)}
                </DialogContentText>
                <TextField
                    fullWidth
                    autoFocus
                    value={priceInput}
                    margin="dense"
                    label={PREIS_IN_EURO}
                    variant='standard'
                    type='number'
                    onChange={(value) => {
                        setPriceInput(value.target.value)
                        setPrice(parseMoneyInputToCents(value.target.value))
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{ABBRECHEN}</Button>
                <Button onClick={() => {
                    doPostRequest("drinks/" + props.drink.id + "/price", { amount: price }).then(value => {
                        if (value.code === 200) {
                            props.close()
                            doGetRequest("drinks").then((value) => {
                                if (value.code === 200) {
                                    dispatch(setDrinks(value.content))
                                }
                            })
                        }
                    })
                }}>{AKTUALISIEREN}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DrinkPriceDialog
