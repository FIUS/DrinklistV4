import { Button, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import SportsBarIcon from '@mui/icons-material/SportsBar';
import PersonIcon from '@mui/icons-material/Person';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Settings } from '@mui/icons-material';
import style from './overview.module.scss'
import { useNavigate } from 'react-router-dom';
import Spacer from '../../Common/Spacer';
import StatisticBox from '../../Common/InfoBox/StatisticBox';
import { RootStateOrAny, useDispatch, useSelector } from 'react-redux';
import { CommonReducerType } from '../../../Reducer/CommonReducer';
import { LocalFireDepartment, Money, Person, VisibilityOff } from '@mui/icons-material';
import { setDrinkCategories, setDrinks, setMembers } from '../../../Actions/CommonAction';
import { doGetRequest } from '../../Common/StaticFunctions';

type Props = {}

const Overview = (props: Props) => {
    const navigate = useNavigate();
    const headingType = "h6"
    const buttonSize = { width: 50, height: 50 }
    const dispatch = useDispatch();

    const common: CommonReducerType = useSelector((state: RootStateOrAny) => state.common);

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

    const calcBudget = () => {
        let budget = 0
        common.members?.forEach(member => budget += member.balance)
        return budget
    }

    const calcHiddenUsers = () => {
        let amount = 0
        common.members?.forEach(member => amount += member.hidden ? 1 : 0)
        return amount
    }

    const calcTopDepter = () => {
        if (common.members?.length === 0 || !common.members) {
            return "No users"
        }
        let balance = common.members[0].balance
        let username = common.members[0].name
        common.members.forEach(member => {
            if (member.balance < balance) {
                balance = member.balance;
                username = member.name
            }
        })
        return username
    }

    return (
        <>
            <div className={style.overview}>
                <StatisticBox
                    headline='Total Budget'
                    text={calcBudget().toFixed(2) + "€"}
                    icon={<Money />}
                    colorCode="#bb58cc" />
                <StatisticBox
                    headline='Total Users'
                    text={common.members ? common.members.length.toString() : "0"}
                    icon={<Person />}
                    colorCode="#bb58cc" />
                <StatisticBox
                    headline='Hidden User'
                    text={calcHiddenUsers().toString()}
                    icon={< VisibilityOff />}
                    colorCode="#bb58cc" />
                <StatisticBox
                    headline='Top Depter'
                    text={calcTopDepter()}
                    icon={<LocalFireDepartment />}
                    colorCode="#bb58cc" />
            </div>
            <div className={style.overview}>
                <Button
                    size="large"
                    className={style.button}
                    variant='contained'
                    onClick={() => navigate("drinks")}
                >
                    <SportsBarIcon sx={buttonSize} />
                    <Spacer horizontal={10} />
                    <Typography variant={headingType}>Getränke</Typography>

                </Button>
                <Button
                    size="large"
                    className={style.button}
                    variant='contained'
                    onClick={() => navigate("members")}
                >
                    <PersonIcon sx={buttonSize} />
                    <Spacer horizontal={10} />
                    <Typography variant={headingType}>Mitglieder</Typography>
                </Button>
                <Button
                    size="large"
                    className={style.button}
                    variant='contained'
                    onClick={() => navigate("transactions")}
                >
                    <ReceiptLongIcon sx={buttonSize} />
                    <Spacer horizontal={10} />
                    <Typography variant={headingType}>Transaktionen</Typography>
                </Button>
                <Button
                    size="large"
                    className={style.button}
                    variant='contained'
                    onClick={() => navigate("settings")}
                >
                    <Settings sx={buttonSize} />
                    <Spacer horizontal={10} />
                    <Typography variant={headingType}>Einstellungen</Typography>
                </Button>
            </div>
        </>
    )
}

export default Overview