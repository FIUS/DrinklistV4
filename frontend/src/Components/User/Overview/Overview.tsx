import { Grow, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import UserButton from '../UserButton/UserButton'
import style from './overview.module.scss'
import { useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { doGetRequest } from '../../Common/StaticFunctions';
import { setDrinkCategories, setDrinks, setMembers } from '../../../Actions/CommonAction';
import { RootState } from '../../../Reducer/reducerCombiner';
import { NAME, WER_BIST_DU } from '../../Common/Internationalization/i18n';

type Props = {}

const Overview = (props: Props) => {
    const dispatch = useDispatch()
    const common: CommonReducerType = useSelector((state: RootState) => state.common);
    const [searchfield, setsearchfield] = useState("")

    useEffect(() => {
        if (common.drinks === null || common.members === null || common.drinkCategories === null) {
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
            doGetRequest("users").then((value) => {
                if (value.code === 200) {
                    dispatch(setMembers(value.content))
                }
            })
        }
    }, [common.drinks, common.members, common.drinkCategories, dispatch])

    return (
        <div className={style.outterContainer}>
            <div className={style.headline}>
                <Typography variant='h4'>{WER_BIST_DU}</Typography>
            </div>

            <TextField
                className={style.input}
                placeholder={NAME}
                type="search"
                value={searchfield}
                onChange={
                    (value) => { setsearchfield(value.target.value) }
                }
            />

            <div className={style.buttonArea}>
                {common.members?.sort((value1, value2) => value1.name.localeCompare(value2.name))?.map(value => {
                    if (!value.hidden) {
                        return <Grow in={searchfield === "" || value.name.toLowerCase().includes(searchfield.toLowerCase())} key={value.id} unmountOnExit>
                            <div style={{ width: "100%" }}>
                                <UserButton key={value.id} name={value.name} id={value.id} />
                            </div>
                        </Grow>
                    }
                    return <></>
                })}
            </div>
        </div>
    )
}

export default Overview
//