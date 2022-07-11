import React from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Spacer from '../../Common/Spacer';
import style from './drinks.module.scss';
import { Drink } from '../../../types/ResponseTypes';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { setDrinks } from '../../../Actions/CommonAction';
import { useDispatch } from 'react-redux';

type Props = {
    isOpen: boolean,
    close: () => void,
    drink: Drink
}

const DrinkStockDialog = (props: Props) => {
    const dispatch = useDispatch()
    let stock = props.drink.stock
    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>Neue Verfügbarkeit</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Ändere hier die Anzahl der Flaschen die für '{props.drink.name}' verfügbar sind
                </DialogContentText>
                <Spacer vertical={15} />
                <div className={style.stockDialog}>
                    <Button variant='outlined' onClick={() => {
                        doPostRequest("drinks/" + props.drink.id + "/stock", { stock: 0 }).then(value => {
                            if (value.code === 200) {
                                doGetRequest("drinks").then((value) => {
                                    if (value.code === 200) {
                                        dispatch(setDrinks(value.content))
                                    }
                                })
                            }
                        })
                    }}>
                        Auf 0 setzen
                    </Button>
                    <div className={style.stockDialogInner}>
                        <TextField
                            autoFocus
                            defaultValue={stock}
                            margin="dense"
                            label='Setzen auf...'
                            variant='standard'
                            type='number'
                            fullWidth
                            onChange={(value) => { stock = parseInt(value.target.value) }}
                        />
                        <Button variant='outlined' onClick={() => {
                            doPostRequest("drinks/" + props.drink.id + "/stock", { stock: stock }).then(value => {
                                if (value.code === 200) {
                                    doGetRequest("drinks").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setDrinks(value.content))
                                        }
                                    })
                                }
                            })
                        }}>
                            Setzen
                        </Button>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>Fertig</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DrinkStockDialog