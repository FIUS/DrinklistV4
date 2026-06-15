import {
    DeleteOutline,
    EditOutlined,
    Inventory2Outlined,
    SellOutlined
} from '@mui/icons-material'
import { Button, Chip, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { format } from 'react-string-format'
import { setDrinkCategories, setDrinks } from '../../../Actions/CommonAction'
import { Drink as DrinkType } from '../../../types/ResponseTypes'
import { GETRAENK_LOESCHEN, SICHER_X_LOESCHEN } from '../../Common/Internationalization/i18n'
import { doGetRequest, doRequest } from '../../Common/StaticFunctions'
import WarningPopup from '../../Common/WarningPopup/WarningPopup'
import DrinkEditDialog from './DrinkEditDialog'
import DrinkPriceDialog from './DrinkPriceDialog'
import DrinkStockDialog from './DrinkStockDialog'
import style from './drinks.module.scss'

type Props = {
    drink: DrinkType
}

const Drink = ({ drink }: Props) => {
    const [priceDialogOpen, setPriceDialogOpen] = useState(false)
    const [stockDialogOpen, setStockDialogOpen] = useState(false)
    const [drinkEditOpen, setDrinkEditOpen] = useState(false)
    const [warningDialog, setWarningDialog] = useState(false)
    const dispatch = useDispatch()

    const stockState = drink.stock <= 0
        ? { label: 'Leer', color: 'error' as const }
        : drink.stock <= 5
            ? { label: 'Niedrig', color: 'warning' as const }
            : { label: 'Verfügbar', color: 'success' as const }

    return (
        <Paper className={style.drinkCard} variant="outlined">
            <div className={style.drinkCardHeader}>
                <div className={style.drinkTitle}>
                    <Typography variant="h6">{drink.name}</Typography>
                    <Chip size="small" label={stockState.label} color={stockState.color} variant="outlined" />
                </div>
                <div className={style.drinkHeaderActions}>
                    <Tooltip title="Getränk bearbeiten">
                        <IconButton size="small" onClick={() => setDrinkEditOpen(true)}>
                            <EditOutlined />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Getränk löschen">
                        <IconButton size="small" color="error" onClick={() => setWarningDialog(true)}>
                            <DeleteOutline />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            <div className={style.drinkFacts}>
                <Button className={style.factButton} onClick={() => setPriceDialogOpen(true)}>
                    <SellOutlined />
                    <span className={style.factText}>
                        <Typography variant="caption" color="text.secondary">Preis</Typography>
                        <Typography variant="h6">{drink.price.toFixed(2)} €</Typography>
                    </span>
                </Button>
                <Button className={style.factButton} onClick={() => setStockDialogOpen(true)}>
                    <Inventory2Outlined />
                    <span className={style.factText}>
                        <Typography variant="caption" color="text.secondary">Bestand</Typography>
                        <Typography variant="h6">{drink.stock}</Typography>
                    </span>
                </Button>
            </div>

            <DrinkEditDialog
                isOpen={drinkEditOpen}
                close={() => setDrinkEditOpen(false)}
                drink={drink}
            />
            <DrinkPriceDialog
                isOpen={priceDialogOpen}
                close={() => setPriceDialogOpen(false)}
                drink={drink}
            />
            <DrinkStockDialog
                isOpen={stockDialogOpen}
                close={() => setStockDialogOpen(false)}
                drink={drink}
            />
            <WarningPopup
                title={GETRAENK_LOESCHEN}
                text={format(SICHER_X_LOESCHEN, drink.name)}
                isOpen={warningDialog}
                close={setWarningDialog}
                yes={() => {
                    doRequest('DELETE', `drinks/${drink.id}/delete`, '').then((value) => {
                        if (value.code === 200) {
                            doGetRequest('drinks').then((drinksValue) => {
                                if (drinksValue.code === 200) {
                                    dispatch(setDrinks(drinksValue.content))

                                    if (!(drinksValue.content as Array<DrinkType>).find((item) => item.category === drink.category)) {
                                        doGetRequest('drinks/categories').then((categoriesValue) => {
                                            if (categoriesValue.code === 200) {
                                                dispatch(setDrinkCategories(categoriesValue.content))
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    })
                }}
                no={() => { }}
            />
        </Paper>
    )
}

export default Drink
