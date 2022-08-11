import React, { useState } from 'react'
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { doGetRequest, doPostRequest } from '../../Common/StaticFunctions';
import { Drink } from '../../../types/ResponseTypes';
import { useDispatch, useSelector } from 'react-redux';
import { FERTIG, GETRAENKENAME, KATEGORIE } from '../../Common/Internationalization/i18n';
import { format } from 'react-string-format';
import { Autocomplete } from '@mui/material';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { RootState } from '../../../Reducer/reducerCombiner';
import style from './drinks.module.scss'
import Spacer from '../../Common/Spacer';
import { openErrorToast, openToast, setDrinkCategories, setDrinks } from '../../../Actions/CommonAction';

type Props = {
    isOpen: boolean,
    close: () => void,
    drink: Drink
}

const DrinkEditDialog = (props: Props) => {
    const common: CommonReducerType = useSelector((state: RootState) => state.common);

    const dispatch = useDispatch()
    const [category, setcategory] = useState(props.drink.category)
    const [name, setname] = useState(props.drink.name)


    return (
        <Dialog open={props.isOpen} onClose={props.close}>
            <DialogTitle>Getränk Bearbeiten</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Ändere den Namen oder Kategorie des Getränks '{props.drink.name}'
                </DialogContentText>
                <Spacer vertical={30} />
                <div className={style.editDrinkContainer}>
                    <div className={style.editDrinkRow}>
                        <TextField
                            fullWidth
                            label={GETRAENKENAME}
                            variant='standard'
                            value={name}
                            onChange={(value) => { setname(value.target.value) }}
                        />
                        <Button onClick={() =>
                            doPostRequest(format("drinks/{0}/name", props.drink.id), { name: name }).then(value => {
                                if (value.code === 200) {
                                    dispatch(openToast({ message: "Name geändert" }))
                                    doGetRequest("drinks").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setDrinks(value.content))
                                        }
                                    })
                                    props.close()
                                } else {
                                    dispatch(openErrorToast())
                                }
                            })

                        } variant="contained">
                            Ändern
                        </Button>
                    </div>
                    <div className={style.editDrinkRow}>
                        <Autocomplete
                            freeSolo
                            fullWidth
                            options={common.drinkCategories !== null ? common.drinkCategories : []}
                            value={category}
                            onChange={(event, value) => { setcategory(value !== null ? value : "") }}
                            renderInput={(params) =>
                                <TextField {...params}
                                    label={KATEGORIE}
                                    variant='standard'
                                    onChange={(value) => { setcategory(value.target.value) }}
                                />
                            }
                        />
                        <Button onClick={() =>
                            doPostRequest(format("drinks/{0}/category", props.drink.id), { category: category }).then(value => {
                                if (value.code === 200) {
                                    dispatch(openToast({ message: "Category geändert" }))
                                    doGetRequest("drinks").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setDrinks(value.content))
                                        }
                                    })
                                    doGetRequest("drinks/categories").then((value) => {
                                        if (value.code === 200) {
                                            dispatch(setDrinkCategories(value.content))
                                        }
                                    })
                                    props.close()
                                } else {
                                    dispatch(openErrorToast())
                                }
                            })
                        } variant="contained">
                            Ändern
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

export default DrinkEditDialog