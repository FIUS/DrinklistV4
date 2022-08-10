import React from 'react'
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

type Props = {
    isOpen: boolean,
    close: () => void,
    drink: Drink
}

const DrinkPriceDialog = (props: Props) => {
    let price = props.drink.price
    const dispatch = useDispatch()

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
                    defaultValue={price}
                    margin="dense"
                    label={PREIS_IN_EURO}
                    variant='standard'
                    type='number'
                    onChange={(value) => price = parseFloat(value.target.value)}
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