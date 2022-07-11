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
            <DialogTitle>Neuer Preis</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Gebe hier den neuen Preis für das Getränk '{props.drink.name}' ein
                </DialogContentText>
                <TextField
                    fullWidth
                    autoFocus
                    defaultValue={price}
                    margin="dense"
                    label='Preis in Euro'
                    variant='standard'
                    type='number'
                    onChange={(value) => price = parseFloat(value.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>Abbrechen</Button>
                <Button onClick={() => {
                    doPostRequest("drinks/" + props.drink.id + "/price", { price: price }).then(value => {
                        if (value.code === 200) {
                            doGetRequest("drinks").then((value) => {
                                if (value.code === 200) {
                                    dispatch(setDrinks(value.content))
                                }
                            })
                        }
                    })
                    props.close()
                }}>Aktualisieren</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DrinkPriceDialog