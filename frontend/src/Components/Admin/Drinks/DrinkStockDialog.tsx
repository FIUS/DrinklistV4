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
import { AENDERE_FLASCHENZAHL, AUF_0_SETEN, AUF_SETZEN, ERHOEHEN, ERHOEHEN_UM, FERTIG, NEUE_VERFUEGBARKEIT, SETZEN } from '../../Common/Internationalization/i18n';
import { format } from 'react-string-format';

type Props = {
    isOpen: boolean,
    close: () => void,
    drink: Drink
}

const DrinkStockDialog = (props: Props) => {
    const dispatch = useDispatch()
    let stock = props.drink.stock
    let stockIncrease = 0
    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>{NEUE_VERFUEGBARKEIT}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {format(AENDERE_FLASCHENZAHL, props.drink.name)}
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
                        {AUF_0_SETEN}
                    </Button>
                    <div className={style.stockDialogInner}>
                        <TextField
                            autoFocus
                            defaultValue={stock}
                            margin="dense"
                            label={AUF_SETZEN}
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
                            {SETZEN}
                        </Button>
                    </div>
                    <div className={style.stockDialogInner}>
                        <TextField
                            autoFocus
                            defaultValue={stockIncrease}
                            margin="dense"
                            label={ERHOEHEN_UM}
                            variant='standard'
                            type='number'
                            fullWidth
                            onChange={(value) => { stockIncrease = parseInt(value.target.value) }}
                        />
                        <Button variant='outlined' onClick={() => {
                            doPostRequest("drinks/" + props.drink.id + "/stock/increase", { stock: stockIncrease }).then(value => {
                                if (value.code === 200) {
                                    doGetRequest("drinks").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setDrinks(value.content))
                                            props.close()
                                        }
                                    })
                                }
                            })
                        }}>
                            {ERHOEHEN}
                        </Button>
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.close}>{FERTIG}</Button>
            </DialogActions>
        </Dialog>
    )
}

export default DrinkStockDialog